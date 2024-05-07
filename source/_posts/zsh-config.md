---
title: 使用 antigen 管理 Zsh 配置
tags:
  - Zsh
  - antigen
categories: Notes
date: 2018-08-06 09:46:53
---

## 介绍

Zsh 是一个 Linux 下强大的 shell, 由于大多数 Linux 产品安装，以及默认使用 bash shell, 但是丝毫不影响极客们对 zsh 的热衷, 几乎每一款 Linux 产品都包含有 zsh，通常可以用 apt-get、urpmi 或 yum 等包管理器进行安装

Zsh 具有以下主要特点：

- 开箱即用、可编程的命令行补全功能可以帮助用户输入各种参数以及选项
- 在用户启动的所有 shell 中共享命令历史
- 通过扩展的文件通配符，可以不利用外部命令达到 find 命令一般展开文件名
- 改进的变量与数组处理
- 在缓冲区中编辑多行命令
- 多种兼容模式，例如使用 / bin/sh 运行时可以伪装成 Bourne shell
- 可以定制呈现形式的提示符；包括在屏幕右端显示信息，并在键入长命令时自动隐藏
- 可加载的模块，提供其他各种支持：完整的 TCP 与 Unix 域套接字控制，FTP 客户端与扩充过的数学函数
- 完全可定制化

虽然说 Zsh 是开箱即用，但是为了更好用，还是需要一些定制化的配置。之前一直使用 [oh-my-zsh](https://github.com/robbyrussell/oh-my-zsh), oh-my-zsh 把主题、插件等都是一起管理的，但是很多其他的主题和插件，且都是由不同的作者开发的，这样的话，管理起来就比较麻烦。[antigen](https://github.com/zsh-users/antigen) 就是针对此问题，应运而生。

<!-- more -->
## 安装

```bash
curl -L git.io/antigen > ~/antigen.zsh
# or use git.io/antigen-nightly for the latest version
```

## 配置

在 `~/.zshrc` 中添加下面的内容
```bash
source ~/antigen.zsh

# Load the oh-my-zsh's library.
antigen use oh-my-zsh

# Bundles from the default repo (robbyrussell's oh-my-zsh).
antigen bundle brew
antigen bundle command-not-found
antigen bundle docker
antigen bundle docker-compose
antigen bundle gem
antigen bundle git
antigen bundle golang
antigen bundle ng
antigen bundle osx
antigen bundle pip

# Syntax highlighting bundle.
antigen bundle zsh-users/zsh-syntax-highlighting
antigen bundle zsh-users/zsh-completions
antigen bundle zsh-users/zsh-autosuggestions
antigen bundle zsh-users/zsh-apple-touchbar

# Load the theme.
# antigen theme robbyrussell
antigen theme https://github.com/denysdovhan/spaceship-prompt spaceship

# Tell Antigen that you're done.
antigen apply
```
## 总结

antigen 完全支持 oh-my-zsh, 第三方的插件或者主题通过 `antigen bundle` 的方式加载，非常方便。

![](antigen_zsh_snapshot.png)
`---EOF---`
