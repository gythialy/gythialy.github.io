---
title: Alacritty 与 Zellij 集成
tags:
  - Alacritty
  - Zellij
  - Terminal
  - macOS
categories: Notes
date: 2024-05-05 16:03:36
---


## 介绍

**Alacritty 简介**

[Alacritty](https://github.com/alacritty/alacritty) 是一款开源、跨平台的终端仿真器，以其高性能、低延迟和可定制性而闻名。它使用 Rust 编程语言编写，并利用 GPU 渲染来实现流畅的滚动和快速的文本渲染。

**优点**

- **高性能：** GPU 渲染引擎使其成为市场上最快的终端仿真器之一，即使在处理大量文本或图形时也能提供流畅的体验。
- **低延迟：** 响应延迟极低。
- **跨平台：** 可在 Windows、macOS、Linux 和 FreeBSD 上运行。
- **开源：** 是开源的，这意味着用户可以自由查看、修改和分发其源代码。

**缺点**

- **有限的扩展性：** 与其他终端仿真器相比，不支持插件或扩展。
- **缺少某些功能：** 缺少某些高级功能，例如选项卡、分割窗格。

**Zellij 介绍**

[Zellij](https://zellij.dev/) 是一款开源、跨平台的终端复用器，它允许用户在单个窗口中管理多个终端会话。它使用 Rust 编程语言编写，并具有现代、可定制的界面。

**特点**

- **终端复用：** 核心功能是终端复用，它允许用户在单个窗口中打开和管理多个终端会话。
- **可定制性：** 提供了广泛的配置选项，允许用户根据自己的喜好定制布局、键盘快捷键和配色方案。
- **插件支持：** 支持插件，允许用户扩展其功能，例如添加对外部工具或服务的集成。
- **跨平台：** 可在 Windows、macOS、Linux 和 FreeBSD 上运行。
- **开源：** 是开源的，这意味着用户可以自由查看、修改和分发其源代码。

> 介绍部分为 Gemini 生成，手动做了部分调整。

<!-- more -->

## 安装

```bash
brew install alacritty zellij font-iosevka-term-nerd-font
```

## 配置

```bash
# 修改主题
zellij options --theme catppuccin-mocha
# 下载 alacritty 主题 catppuccin-mocha
mkdir -p ~/.config/alacritty/themes && curl -LO --output-dir ~/.config/alacritty/themes https://github.com/catppuccin/alacritty/raw/main/catppuccin-mocha.toml
```

[Alacritty 完整配置](https://gist.github.com/gythialy/1487a907fdb60128b28578f352f4e719)如下:

```toml
import = [
  # uncomment the flavour you want below:
  # "~/.config/alacritty/themes/catppuccin-latte.toml",
  # "~/.config/alacritty/themes/catppuccin-frappe.toml"
  # "~/.config/alacritty/themes/catppuccin-macchiato.toml"
  "~/.config/alacritty/themes/catppuccin-mocha.toml",
  "~/.config/alacritty/keybindings.toml",
]

live_config_reload = true

[env]
TERM = "xterm-256color"
ZELLIJ_AUTO_ATTACH = "true"

[colors]
draw_bold_text_with_bright_colors = false

[cursor.style]
shape = "Beam"

[font]
size = 15.0

[font.bold]
family = "IosevkaTerm Nerd Font"

[font.bold_italic]
family = "IosevkaTerm Nerd Font"

[font.italic]
family = "IosevkaTerm Nerd Font"

[font.normal]
family = "IosevkaTerm Nerd Font"
style = "Regular"

[selection]
save_to_clipboard = true

[shell]
args = ["attach", "--index=0", "--create"]
program = "zellij"

[window]
decorations = "Transparent"
blur = true
opacity = 0.8

[window.dimensions]
columns = 120
lines = 45

[window.padding]
x = 10
y = 22
```

如果将 Alacritty 设为默认终端的话，可以将配置文件中的`[shell]`部分注释，通过以下命令配置 zellij：

```bash
echo 'eval "$(zellij setup --generate-auto-start zsh)"' >> ~/.zshrc
```

>  Zellij 更多配置项也可以参考[官方文档](https://zellij.dev/documentation/)，默认配置对普通用户来说足矣。

## 总结

Zellij 相对于 tmux 来说几乎是开箱即用，对于没有复杂需求的用户来说非常友好。Alacritty 虽然启动速度很快，对于相同的配置来说，启动速度比 iTerm2 肉眼可见地快，但是开发者对社区的响应很慢，对不少 PR 也是视而不见。

最终效果：

![](SCR-20240505-jrkl.png)

`---EOF---`
