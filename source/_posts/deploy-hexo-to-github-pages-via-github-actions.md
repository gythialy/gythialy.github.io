---
title: 通过 GitHub Actions 自动部署 Hexo
date: 2019-08-23 20:14:27
tags:
  - Hexo
  - GitHub Pages
  - GitHub Actions
  - GitHub
categories: Notes
---

[GitHub Actions](https://help.github.com/en/articles/about-github-actions) 由 GitHub 官方推出的工作流工具。典型的应用场景应该是 CI/CD，类似 Travis 的用法。这里介绍响应 git push 事件触发 Hexo 编译静态页面并推送到 GitHub Pages 的用法。

### 准备工作

- 生成 ssh 部署私钥
    ```bash
    ssh-keygen -t ed25519 -f ~/.ssh/github-actions-deploy
    ```
- 在 GitHub repo 的 `Settings/Deploy keys` 中添加刚刚生成的公钥
- 在 GitHub repo 的 `Settings/Secrets` 中添加 `GH_ACTION_DEPLOY_KEY`，值为刚刚生成的私钥

### 编写 GitHub Actions

- 在项目的根目录添加 `deploy.yml`，目录结构如下
    ```
    .github
    └── workflows
    └── deploy.yml
    ```

- 步骤
    - 添加部署私钥到 GitHub Actions 执行的容器中
    - 在容器中安装 Hexo 以及相关的插件
    - 更新主题 [NexT](https://github.com/next-theme/hexo-theme-next) 的配置
    - 编译静态页面
    - 推送编译好的文件到 GitHub Pages

- 编写部署的 action

    ```yml
    name: Main workflow

    on:
      push:
        branches:
        - raw

    jobs:
      build:

        runs-on: ubuntu-18.04

        steps:
        - uses: actions/checkout@v2
        - name: Use Node.js lts
          uses: actions/setup-node@v2-beta
          with:
            node-version: '12.x'
        - name: prepare build env
          env:
            GH_ACTION_DEPLOY_KEY: ${{ secrets.GH_ACTION_DEPLOY_KEY }}
            NEXT_VERSION: v8.0.0-rc.2
          run: |
            mkdir -p ~/.ssh/
            echo "$GH_ACTION_DEPLOY_KEY" > ~/.ssh/id_rsa
            chmod 600 ~/.ssh/id_rsa
            ssh-keyscan github.com >> ~/.ssh/known_hosts
            git config --global user.name 'gythialy'
            git config --global user.email 'gythialy@users.noreply.github.com'
            npm i -g hexo-cli
            npm i
            git clone --branch ${NEXT_VERSION} --depth=10  git@github.com:next-theme/hexo-theme-next.git themes/next
            git checkout -b ${NEXT_VERSION}
            git clone git@github.com:next-theme/theme-next-three --depth=1 themes/next/source/lib/three
            # git clone git@github.com:next-theme/theme-next-fancybox3  --depth=1 themes/next/source/lib/fancybox
            git clone git@github.com:next-theme/theme-next-pace --depth=1 themes/next/source/lib/pace
        - name: deploy to github 
          env:
            HEXO_ALGOLIA_INDEXING_KEY: ${{ secrets.HEXO_ALGOLIA_INDEXING_KEY }}
          run: |
            hexo generate && hexo algolia && hexo deploy
    ```

### 小结

总的来说，就部署 Hexo 而言，速度比 {% post_link auto-deploy-hexo-by-travis Travis 部署 %} 速度更快一点，同时由于现在还处于测试阶段，功能相对还是比较欠缺一点。不过作为一站式的功能来说，还是不错的。

### 参考链接

- [Workflow syntax for GitHub Actions](https://help.github.com/en/articles/workflow-syntax-for-github-actions)

`---EOF---`