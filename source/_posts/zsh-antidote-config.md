---
title: 使用 Antidote 管理 Zsh 配置
tags:
  - Zsh
  - antidote
  - antigen
categories: Notes
date: 2023-02-18 17:44:47
---

之前介绍了使用[antigen](zsh-config) 和 [sheldon](zsh-sheldon-config) 管理 Zsh 配置，由于 antigen 已经停止维护了，后面就有了[antibody](https://getantibody/antibody)，但是这个也停止维护了，最终就有了继任者 [antidote](https://github.com/mattmc3/antidote)，这几个使用上都大同小异。

- macOS 使用 `brew install antidote` 安装，其他平台使用 `git clone --depth=1 https://github.com/mattmc3/antidote.git ${ZDOTDIR:-$HOME}/.antidote` 安装

- 在 `$HOME` 目录添加 `.zsh_plugins.txt` 来定义需要使用的插件
  ```
  # .zsh_plugins.txt

  # comments are supported like this
  https://github.com/peterhurford/up.zsh
  rummik/zsh-tailf
  mattmc3/zman
  agkozak/zsh-z

  # empty lines are skipped

  # annotations are also allowed:
  romkatv/zsh-bench kind:path
  olets/zsh-abbr    kind:defer

  # frameworks like oh-my-zsh are supported
  ohmyzsh/ohmyzsh path:lib
  ohmyzsh/ohmyzsh path:plugins/command-not-found
  ohmyzsh/ohmyzsh path:plugins/common-aliases
  ohmyzsh/ohmyzsh path:plugins/gem
  ohmyzsh/ohmyzsh path:plugins/git
  ohmyzsh/ohmyzsh path:plugins/npm
  ohmyzsh/ohmyzsh path:plugins/tmux
  ohmyzsh/ohmyzsh path:plugins/yarn
  ohmyzsh/ohmyzsh path:plugins/fzf

  # prompts:
  #   with prompt plugins, remember to add this to your .zshrc:
  #   `autoload -Uz promptinit && promptinit && prompt pure`
  # sindresorhus/pure     kind:fpath
  # romkatv/powerlevel10k kind:fpath

  # popular fish-like plugins
  zsh-users/zsh-autosuggestions
  zsh-users/zsh-completions path:src kind:fpath
  zdharma-continuum/fast-syntax-highlighting kind:defer
  # zsh-users/zsh-history-substring-search
  ```
- 在 `.zshrc` 中添加下面的内容，以后修改 `.zsh_plugin.txt` 中的内容后会自动更新
  ```
  # .zshrc
  # Lazy-load antidote and generate the static load file only when needed
  zsh_plugins=${ZDOTDIR:-$HOME}/.zsh_plugins
  if [[ ! ${zsh_plugins}.zsh -nt ${zsh_plugins}.txt ]]; then
    (
      source ${ZDOTDIR:-$HOME}/.antidote/antidote.zsh
      antidote bundle <${zsh_plugins}.txt >${zsh_plugins}.zsh
    )
  fi
  source ${zsh_plugins}.zsh

  # starship
  # eval "$(starship init zsh)"
  ```

`---EOF---`