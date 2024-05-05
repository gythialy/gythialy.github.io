---
title: 基于 asdf 管理多种运行时
tags:
- asdf
- Zsh
categories: Notes
---

## 介绍

asdf（Asdf System Dependency Formatter）是一个版本管理器，用于在不同的项目中管理和切换软件版本。它支持多种编程语言、工具和框架，包括但不限于：

* Python
* Ruby
* Node.js
* Java
* Rust
* Docker

**asdf 的主要优点包括：**

* **版本管理：**允许您轻松安装、切换和卸载不同版本的软件。
* **项目隔离：**每个项目都可以使用自己的软件版本集，而不会影响其他项目。
* **跨平台支持：**可在 macOS、Linux 和 Windows 上使用。
* **易于使用：**具有简洁直观的命令行界面。

## 安装

```bash
brew install asdf
echo -e "\n. $(brew --prefix asdf)/libexec/asdf.sh" >> ${ZDOTDIR:-~}/.zshrc
```

也可以使用[asdf for oh-my-zsh](https://github.com/ohmyzsh/ohmyzsh/blob/master/plugins/asdf/asdf.plugin.zsh) 来自动加载

## 使用

**1. 列出已安装的插件**

```
asdf list
```

**2. 安装插件**

```
asdf install <plugin> <version>
```

例如：安装 Python 3.10.0

```
asdf install python 3.10.0
```

**3. 设置默认版本**

```
asdf global <plugin> <version>
```

例如：将 Python 3.10.0 设置为默认版本

```
asdf global python 3.10.0
```

**4. 切换版本**

```
asdf shell <plugin> <version>
```

例如：切换到 Python 3.9.0

```
asdf shell python 3.9.0
```

**5. 卸载插件**

```
asdf uninstall <plugin> <version>
```

例如：卸载 Python 3.9.0

```
asdf uninstall python 3.9.0
```

**6. 更新插件**

```
asdf update <plugin>
```

例如：更新 Python 插件

```
asdf update python
```

**7. 查找插件信息**

```
asdf info <plugin>
```

例如：查找 Python 插件的信息

```
asdf info python
```

**8. 管理插件源**

```
asdf plugin-add <source>
asdf plugin-remove <source>
asdf plugin-list
```

**其他有用的命令**

* `asdf rehash`：重新加载所有插件
* `asdf which`：显示特定插件的路径
* `asdf doctor`：诊断 asdf 安装问题

**zsh 特有命令**

* `asdf-reshim`：重新加载 asdf 插件，并在当前 shell 中设置环境变量
* `asdf-where`：显示特定插件的安装路径

**示例：使用 asdf 管理 Python 版本**

```
# 安装 Python 3.10.0
asdf install python 3.10.0

# 设置 Python 3.10.0 为默认版本
asdf global python 3.10.0

# 切换到 Python 3.9.0
asdf shell python 3.9.0

# 重新加载 asdf 插件并设置环境变量
asdf-reshim

# 使用 Python 3.9.0
python --version
# Python 3.9.0

# 切换回默认版本（Python 3.10.0）
asdf shell python default

# 卸载 Python 3.9.0
asdf uninstall python 3.9.0
```

**其他有用的 asdf 命令**

* `asdf list`：列出已安装的软件版本。
* `asdf update`：更新已安装的软件版本。
* `asdf uninstall`：卸载已安装的软件版本。
* `asdf info`：显示有关特定软件版本的详细信息。
* `asdf plugin-add` 和 `asdf plugin-remove`：管理 asdf 插件源。

**结论**

asdf 是一个强大的版本管理器，可以帮助您轻松管理和切换不同项目的软件版本。它易于使用，并且受到开发人员社区的广泛支持。