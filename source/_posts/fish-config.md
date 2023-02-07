---
title: Fish 配置
tags:
  - Fish
  - Starship
categories: Notes
date: 2023-02-07 13:55:07
---


## 介绍

[Fish](https://fishshell.com/) 是一种用户友好的 Unix shell，它支持自动补全、语法高亮和其他功能，使得命令行操作变得更加容易。Fish 具有简单的语法，并且可以自动识别文件和目录名称，这使得它特别适合新手使用。Fish 还有一个强大的脚本语言，可以用来创建复杂的脚本和工具。Fish 也支持多种不同的主题和样式，可以根据用户的喜好进行自定义。

Fish和 Bash 和 Zsh 对比，一言以蔽之就是开箱即用的高亮和自动不全，缺点就是和POSIX不兼容。Fish 有个骚操作就是执行 `fish_config` 后就可以在浏览器中配置。

Bash 中的特殊变量也挺难记的，Fish 中也都改成了单词:
```
$*, $@, $1 ...: $argv  # 函数或者脚本的参数
$0: status filename  # 函数或者脚本的名字
$#: 使用 $argv 的长度
$?: $status  # 上一个命令的返回值
$$: $fish_pid  # shell 的 pid
$!: $last_pid  # 上一个命令的 pid
$-: 大多数使用是 status is-interactive 和 status is-login
```
更多的差异，查看[官方文档](https://fishshell.com/docs/current/fish_for_bash_users.html)

## 安装 

通过 `brew install fish fisher starship` 一键安装。

- [fisher](https://github.com/jorgebucaran/fisher): 作为 Fish 的包管理工具，就不需要每次都去修改 `config.fish`
- [Starship](https://github.com/starship/starship): Rust 编写的轻量、迅速、可无限定制的高颜值终端，类似- [powerlevel10k](https://github.com/romkatv/powerlevel10k)

## 配置

我安装的插件如下，可通过 `fisher install meaningful-ooo/sponge` 安装， `fisher update` 来进行更新。

```
❯ fisher list
jorgebucaran/fisher
patrickf1/fzf.fish
ankitsumitg/docker-fish-completions
jethrokuan/z
meaningful-ooo/sponge
jhillyerd/plugin-git
rstacruz/fish-asdf
jorgebucaran/replay.fish
nickeb96/puffer-fish
```
更多可参考 [awsm.fish](https://github.com/jorgebucaran/awsm.fish) 进行安装。

其他基本上没什么需要配置的，如果需要的话，修改 `~/.config/fish/config.fish` 文件即可。

## 主题

可通过 `starship preset nerd-font-symbols > ~/.config/starship.toml` 设置 `symbols`，更多设置，可参考[官方文档](https://starship.rs/config/)，大部分时候都不需要。

最终只需要在 `~/.config/fish/config.fish`中添加一行 `starship init fish | source` 即可。

## 成果

之后只要在 iTerm2 中设置 `fish` 为启动 shell，显示效果如下:

![](SCR-20230207-i55.png)

从试用上来看，比 iTerm2+Zsh 的组合启动速度肉眼可见的迅速。但是由于不兼容 POSIX shell，暂时通过 [replay.fish](https://github.com/jorgebucaran/replay.fish)临时执行 Bash 脚本，后续还要看看是否有其他问题。

`---EOF---`