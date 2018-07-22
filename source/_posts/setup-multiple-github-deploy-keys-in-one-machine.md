---
title: 在一台机器上部署多个 GitHub deploy key
tags:
  - GitHub
  - SSH
categories: Notes
date: 2018-07-22 13:05:25
---


## 需求

在 Github 有几个私有仓库需要做 CI/DI，由于是私有项目，不能用免费的 travis 处理，所以临时在一台服务器上部署了几个脚本，简单处理一下。GitHub 限制了每个项目都必须用不同的 deploy key，我又不想把我自己的私有 key 部署到服务器上。

## 目标

在一台机器上通过 deploy 拉取 GitHub 私有仓库的代码，编译后做自动部署。

## 准备

在做 CI/DI 的机器上分别生成不同的 deploy key，并添加到 GitHub repo 里。具体过程这里就不赘述了，官方 [帮助文档](https://help.github.com/articles/connecting-to-github-with-ssh/) 写得特别清楚。

## 配置

- 更改 git clone 的地址

    一般地址的格式为为 `git@github.com:$user/$repo.git`。我们以三个 repo 为例，假定三个 repo 的名字分别为 repo1,repo2,repo3.

    变化后的地址为：
    - `git@github.com:$user1/$repo1.git` => `ssh://git@$repo1.github.com/$user1/$repo1.git`
    - `git@github.com:$user1/$repo2.git` => `ssh://git@$repo2.github.com/$user1/$repo2.git`
    - `git@github.com:$user2/$repo3.git` => `ssh://git@$repo3.github.com/$user2/$repo3.git`

- 然后在 `~/.ssh/config` 中添加下面的配置

    ```
    Host repo1.github.com
    User git
    HostName github.com
    IdentityFile ~/.ssh/repo1_rsa

    Host repo2.github.com
    User git
    HostName github.com
    IdentityFile ~/.ssh/repo2_rsa

    Host repo3.github.com
    User git
    HostName github.com
    IdentityFile ~/.ssh/repo3_rsa
    ```
## 拉取代码

   以 `git clone ssh://git@$repo1.github.com/$user1/$repo1.git` 的方式拉取代码即可。如果是在修改配置前已经拉取下来的代码，可以修改 repo 的 url 为上面修改后的形式也是一样的。


`---EOF---`