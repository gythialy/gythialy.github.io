---
title: ohmyzsh 安装自定义插件和主题
tags:
  - Zsh
  - oh-my-zsh
categories: Notes
date: 2024-05-07 10:45:27
---

在折腾过{% post_link zsh-config antigen %}、{% post_link zsh-antidote-config antidote %}、{% post_link zsh-sheldon-config sheldon %}等 Zsh 的包管理器之后，我发现我主要使用的还是 [oh-my-zsh](https://github.com/ohmyzsh/ohmyzsh)。那就回归本源，再加上现在 oh-my-zsh 也可以自定义 Plugin。

```bash
# install oh-my-zsh
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
# install oh-my-zsh custom plugins
git clone --depth=1 https://github.com/zsh-users/zsh-autosuggestions  $ZSH_CUSTOM/plugins/zsh-autosuggestions
git clone --depth=1 https://github.com/zsh-users/zsh-completions $ZSH_CUSTOM/plugins/zsh-completions
git clone --depth=1 https://github.com/zsh-users/zsh-syntax-highlighting $ZSH_CUSTOM/plugins/zsh-syntax-highlighting
# install spaceship
git clone --depth=1 https://github.com/spaceship-prompt/spaceship-prompt.git $ZSH_CUSTOM/themes/spaceship-prompt
ln -s "$ZSH_CUSTOM/themes/spaceship-prompt/spaceship.zsh-theme" "$ZSH_CUSTOM/themes/spaceship.zsh-theme"
```

在 `.zshrc` 中 通过 `plugins` 配置需要启用的插件。

```bash
export ZSH="$HOME/.oh-my-zsh"
DISABLE_MAGIC_FUNCTIONS=true
ZSH_THEME="spaceship"
plugins=(
    command-not-found
    common-aliases
    docker
    git
    bun
    npm
    yarn
    kubectl
    asdf
    thefuck
    zsh-autosuggestions
    zsh-syntax-highlighting
    zsh-completions
)
source $ZSH/oh-my-zsh.sh
```

```bash
# 设置别名更新 omz 插件
alias update-omz-plugins='[ -n "$ZSH_CUSTOM" ] && [ -d "$ZSH_CUSTOM" ] && find "$ZSH_CUSTOM" -type d -name ".git" -exec sh -c "cd \"{}\"/../ && echo Updating {} && git pull --rebase" \;'
```

```---EOF---```
