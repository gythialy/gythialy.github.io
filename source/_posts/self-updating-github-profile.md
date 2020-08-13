---
layout: publish
title: 自动更新 GitHub Profile
categories: Notes
date: 2020-08-13 13:43:12
tags:
- GitHub Actions
- GitHub
---

## 缘起

在 GitHub 建一个和用户名同名的仓库，仓库中 `README.md` 的内容就会显示在账户首页。如果 `README.md` 中的内容是动态更新的，那么首页的内容也就是动态更新的。

根据此思路，只要通过 GitHub Actions 去动态更新 `README.md` 即可。

## 配置

这里以我仓库的内容为例，自动同步博客的内容；统计 GitHub 的贡献记录。

- 同步博客标题，只需要抓取 RSS 转换成 `README.md` 即可
- GitHub 的统计，可以通过 [anuraghazra/github-readme-stats](https://github.com/anuraghazra/github-readme-stats) 完成，这个本身就是动态的了，配置一下即可

### 更新脚本
```python
#!/usr/bin/python
# -*- coding: utf-8 -*-

import requests
import xml.etree.ElementTree as ET

feed = requests.get('https://gythialy.github.io/atom.xml').text
root = ET.fromstring(feed)
nsfeed = {'nsfeed': 'http://www.w3.org/2005/Atom'}
with open('README.md', 'w') as f:
    f.write(r'''
## Hi there 👋

- 🔭 I’m currently working on [@QLC Chain](https://github.com/qlcchain)
- 🌱 I’m currently learning [Rust](https://github.com/rust-lang/rust)

## Latest blog posts
''')
    for entry in root.findall('nsfeed:entry', nsfeed)[:5]:
        text = entry.find('nsfeed:title', nsfeed).text
        url = entry.find('nsfeed:link', nsfeed).attrib['href']
        published = entry.find('nsfeed:published', nsfeed).text[:10]
        f.write('- {} [{}]({})\n'.format(published, text, url))

    f.write('''
[>>> More blog posts](https://gythialy.github.io/)
## Statistics
![Goren's github stats](https://github-readme-stats.vercel.app/api?username=gythialy&count_private=true&show_icons=true)
''')
```

### GitHub Actions

```yml
name: Build README

on:
  push:
  workflow_dispatch:
  schedule:
    - cron:  '0 10 * * *'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - name: Check out repo
      uses: actions/checkout@v2
    - name: Set up Python
      uses: actions/setup-python@v2
      with:
        python-version: 3.8
    - uses: actions/cache@v2
      name: Configure pip caching
      with:
        path: ~/.cache/pip
        key: ${{runner.os}}-pip-${{ hashFiles('**/requirements.txt') }}
        restore-keys: |
          ${{runner.os}}-pip-
    - name: Install Python dependencies
      run: |
        python -m pip install -r requirements.txt
    - name: Update README
      run: |-
        python build.py
        cat README.md
    - name: Commit and push if changed
      run: |-
        git diff
        git config --global user.email "readme-bot@example.com"
        git config --global user.name "README-bot"
        git add -A
        git commit -m "🤖 Updated README.md" || exit 0
        git push
```


## 参考链接
- [Building a self-updating profile README for GitHub](https://news.ycombinator.com/item?id=23807881)
- [simonw](https://github.com/simonw/simonw)

`---EOF---`