---
title: 通过 travis 自动部署 Hexo
tags:
  - Hexo
  - travis
  - GitHub
categories: Notes
date: 2017-08-08 13:26:13
---




### 准备工作

- 生成 GitHub 的 [Personal access tokens](https://github.com/settings/tokens)，需要有 repo 相关权限

- 安装 [Git deployer plugin for Hexo](https://github.com/hexojs/hexo-deployer-git)
  ```shell
  npm install hexo-deployer-git --save
  ```

### 配置

- 在 Hexo 的`_config.yml` 中添加 Hexo 编译好后文件的git地址，如果需要同时提交到多个不同地址，可以添加多个。

  ```yaml
  # Deployment
  ## Docs: https://hexo.io/docs/deployment.html
  deploy:
    type: git
    repo: https://__GITHUB_TOKEN__@github.com/{user_name}/{git_repo}
    branch: master
    name: gythialy
    email: gythialy@users.noreply.github.com
  ```
  > 注：`https://__GITHUB_TOKEN__@github.com/{user_name}/{git_repo}`  示例为 `https://__GITHUB_TOKEN__@github.com/gythialy/gythialy.github.io.git`

- 在 Hexo 根目录添加 `.travis.yml`，内容如下：

  ```yaml
  language: node_js

  node_js:
  - "7"

  branches:
    only:
    - raw

  before_install:
  - npm install -g hexo-cli
  - npm install -g gulp

  install:
  - npm install

  before_script:
  - git config --global user.name 'gythialy'
  - git config --global user.email 'gythialy@users.noreply.github.com'
  - sed -i "s/__GITHUB_TOKEN__/${__GITHUB_TOKEN__}/" _config.yml
  # use custom theme config
  - git clone --branch v5.1.2 --depth=10  https://github.com/iissnan/hexo-theme-next.git themes/next
  - git checkout -b v5.1.2
  - cp next_config.yml ./themes/next/_config.yml

  script:
  - hexo generate && gulp && hexo deploy
  ```

	> 注： 因为源文件和生成的文件共用了git repo，所以需要指定只编译 源文件分支（`raw`），`master`作为编译好的文件存放路径。

- 在 [travis][1] 中添加变量` __GITHUB_TOKEN`__值为前面生成的 GitHub  Personal access tokens

  [1]: https://travis-ci.org/"Travis CI"

---EOF---