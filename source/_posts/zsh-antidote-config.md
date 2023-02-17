---
title: 使用 Antidote 管理 Zsh 配置
tags:
  - Zsh
  - antidote
  - antigen
categories: Notes
date: 2023-02-18 17:44:47
---

之前介绍了使用[antigen](zsh-config) 和 [sheldon](zsh-sheldon-config) 管理 Zsh 配置，由于 antigen 已经停止维护了，后面就有了[antibody](https://github.com/getantibody/antibody)，但是这个也停止维护了，最终就有了继任者 [antidote](https://github.com/mattmc3/antidote)，这几个使用上都大同小异。

- `brew install antidote` 安装

- 在 `$HOME` 目录添加 `.zsh_plugins.txt` 来定义需要使用的插件
  ```
  # .zsh_plugins.txt

  # comments are supported like this
  github.com/rupa/z
  github.com/zsh-users/zsh-completions

  # empty lines are skipped

  # annotations are also allowed:
  github.com/romkatv/zsh-bench kind:path
  github.com/olets/zsh-abbr    kind:defer

  # frameworks like oh-my-zsh are supported
  github.com/ohmyzsh/ohmyzsh path:lib
  github.com/ohmyzsh/ohmyzsh path:plugins/command-not-found
  github.com/ohmyzsh/ohmyzsh path:plugins/common-aliases
  github.com/ohmyzsh/ohmyzsh path:plugins/docker
  github.com/ohmyzsh/ohmyzsh path:plugins/gem
  github.com/ohmyzsh/ohmyzsh path:plugins/git
  github.com/ohmyzsh/ohmyzsh path:plugins/npm
  github.com/ohmyzsh/ohmyzsh path:plugins/tmux
  github.com/ohmyzsh/ohmyzsh path:plugins/yarn
  github.com/ohmyzsh/ohmyzsh path:plugins/fzf

  # prompts:
  #   with prompt plugins, remember to add this to your .zshrc:
  #   `autoload -Uz promptinit && promptinit && prompt pure`
  # github.com/sindresorhus/pure     kind:fpath
  # github.com/romkatv/powerlevel10k kind:fpath

  # popular fish-like plugins
  github.com/mattmc3/zfunctions
  github.com/zsh-users/zsh-autosuggestions
  github.com/zdharma-continuum/fast-syntax-highlighting kind:defer
  # github.com/zsh-users/zsh-history-substring-search
  ```
- 在 `.zshrc` 中添加下面的内容，修改 `.zsh_plugin.txt` 中的内容后会自动更新
  ```
  # ~/.zshrc
  # Set the name of the static .zsh plugins file antidote will generate.

  zsh_plugins=${ZDOTDIR:-~}/.zsh_plugins.zsh

  # Ensure you have a .zsh_plugins.txt file where you can add plugins.
  [[ -f ${zsh_plugins:r}.txt ]] || touch ${zsh_plugins:r}.txt

  # Lazy-load antidote.
  fpath+=(${ZDOTDIR:-~}/.antidote)
  autoload -Uz $fpath[-1]/antidote

  # Generate static file in a subshell when .zsh_plugins.txt is updated.
  if [[ ! $zsh_plugins -nt ${zsh_plugins:r}.txt ]]; then
    (antidote bundle <${zsh_plugins:r}.txt >|$zsh_plugins)
  fi

  # Source your static plugins file.
  source $zsh_plugins

  eval "$(starship init zsh)"
  ```

`---EOF---`