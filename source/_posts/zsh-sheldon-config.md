---
title: 使用 sheldon 管理 Zsh 配置
tags:
  - Zsh
  - sheldon
categories: Notes
date: 2023-02-07 11:45:48
---


## 介绍

之前一直使用{% post_link zsh-config 使用 antigen 管理 Zsh 配置 %}，由于 antigen 已经很就不更新了，最后一次代码提交为 2019，就切换到了 [sheldon](https://github.com/rossmacarthur/sheldon)。

sheldon 是 Rust 编写的 Zsh 包管理器，特性如下：

- Plugins from Git repositories.
  - Branch / tag / commit support.
  - Submodule support.
  - First class support for GitHub repositories.
  - First class support for Gists.
- Arbitrary remote scripts or binary plugins.
- Local plugins.
- Inline plugins.
- Highly configurable install methods using templates.
- Shell agnostic, with sensible defaults for Zsh.
- Super-fast plugin loading and parallel installation. See [benchmarks](https://github.com/rossmacarthur/zsh-plugin-manager-benchmark).
- Config file using [TOML](https://toml.io/) syntax.
- Clean ~/.zshrc or ~/.bashrc (just add 1 line).


## 安装

通过 `brew install sheldon` 一键安装，也有其他[安装方式](https://sheldon.cli.rs/Installation.html)可选。

## 配置

执行 `sheldon init` 会生成默认配置 `plugins.toml`，文件存放在 `$XDG_CONFIG_HOME/sheldon`，一般这个路径就是 `~/.config/sheldon/plugins.toml`。可以直接编辑这个配置，也可以通过 sheldon CLI 来操作。

### CLI
sheldon 有三种不同类型的命令:

- `init` 初始化一个新的配置文件。
- `lock` 和 `source` 处理插件下载、安装和 shell 源代码的生成。
- `add`,`edit`,`remove` 会自动更新配置文件

详细使用，可以参考[官方说明](https://sheldon.cli.rs/Command-line-interface.html)，常用的就是 `sheldon lock --update` 更新所有插件。

### 配置结构
```
# ~/.config/sheldon/plugins.toml

#           ┌─ Unique name for the plugin
#        ┌──┴─┐
[plugins.base16]
github = "chriskempson/base16-shell"
#         └─────┬────┘ └─────┬────┘
#               │            └─ GitHub repository name
#               └─ GitHub user or organization
```

<escape><!-- more --></escape>

### 参考配置

配置中启用了 [Oh My Zsh](https://github.com/ohmyzsh) 的部分功能，还有启用了自动高亮，完成建议等。

```toml
shell = "zsh"

[templates]
defer = "{% for file in files %}zsh-defer source \"{{ file }}\"\n{% endfor %}"
# PATH = 'export PATH="{{ dir }}:$PATH"'
# fpath = 'fpath=( "{{ dir }}" $fpath )'
# path = 'path=( "{{ dir }}" $path )'
# source = {value = 'source "{{ file }}"', each = true}

[plugins]

[plugins.zsh-defer]
github = "romkatv/zsh-defer"

[plugins.ohmyzsh-lib]
github = "ohmyzsh/ohmyzsh"
dir = "lib"
use = ["{clipboard,completion,git,termsupport,theme-and-appearance}.zsh"]
apply = ["defer"]

[plugins.ohmyzsh-plugin]
github = "ohmyzsh/ohmyzsh"
dir = "plugins"
use = ["{command-not-found,common-aliases,docker-compose,gem,git,npm,yarn,kubectl}/*.plugin.zsh"]
apply = ["defer"]

[plugins.zsh-syntax-highlighting]
github = "zsh-users/zsh-syntax-highlighting"
apply = ["defer"]

[plugins.zsh-autosuggestions]
github = "zsh-users/zsh-autosuggestions"
use = ["{{ name }}.zsh"]
apply = ["defer"]

[plugins.zsh-completions]
github = "zsh-users/zsh-completions"
apply = ["defer"]

# [plugins.powerlevel10k]
# github = "romkatv/powerlevel10k"

# [plugins.zsh-z]
# github = "agkozak/zsh-z"
# apply = ["defer"]

[plugins.z-lua]
github = "skywind3000/z.lua"
apply = ["defer"]

# [plugins.compinit]
# gist = "c514eaedbd4539ee2affffab9ca74913"
# inline = 'autoload -Uz compinit && compinit'

# For example:
#
# [plugins.base16]
# github = "chriskempson/base16-shell"
```

## 更新 `.zshrc`

在文件中添加 `eval "$(starship init zsh)"` 即可

`---EOF---`