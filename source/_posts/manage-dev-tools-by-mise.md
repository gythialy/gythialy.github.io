---
title: 使用 mise 管理开发运行时
tags:
  - Zsh
  - mise
categories: Notes
date: 2024-09-24 19:04:06
---


## 介绍

[mise](https://mise.jdx.dev/) 是一个现代化的开发工具版本管理器，可完美替代 asdf。它提供了更快的性能和更丰富的功能，用于管理多种编程语言、工具和框架的版本，包括但不限于：

- Bun
- Deno
- Node.js
- Go
- Rust
- Python

**mise 的主要优点包括：**

- **高性能：** 比 asdf 更快，使用 Rust 编写。
- **兼容性：** 与 asdf 插件和配置文件兼容，同时支持 cargo，go，npm 等生态。
- **增强功能：** 提供了更多高级功能，如任务运行器和环境变量管理。
- **易于使用：** 具有直观的命令行界面和配置文件格式，不需要单独安装 plugin。

<!-- more -->

## 安装

```bash
brew install mise
echo 'eval "$(mise activate zsh --shims)"' >> ${ZDOTDIR:-~}/.zshrc
```

## 使用

### 常用命令
```bash
# 全局安装 NodeJS LTS 运行时
mise use -g node@lts
# 在当前安装并使用 NodeJS v22
mise use node@22
# 更新所有过期的运行时
mise up
```

### 配置文件

mise 使用 `mise.toml` 或 `.mise.toml` 作为配置文件，例如：

```toml
[tools]
nodejs = '18.12.0'
python = '3.10.0'

[env]
DATABASE_URL = 'postgres://localhost/myapp'

[tasks]
start = 'npm start'
test = 'npm test'
```

## 与 Python venv 集成

在目录下创建 `.mise.toml`，切换到改目录时，会自动切换到自动创建 venv目录，并设置运行时。也可通过 `mise install` 手动安装。

```toml
[tools]
python = "3.11.9" # [optional] will be used for the venv

[env]
_.python.venv = { path = ".venv", create = true }
```

## 结论

mise 是 asdf 的现代化替代品，提供了更快的性能和更丰富的功能。它保持了与 asdf 的兼容性，同时引入了新的特性，如内置的任务运行器和更灵活的配置选项。对于需要管理多个开发工具和运行时版本的开发者来说，mise 是一个强大而灵活的选择。

`---EOF---`
