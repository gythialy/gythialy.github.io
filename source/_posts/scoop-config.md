---
title: Scoop 安装使用
date: 2018-02-07 14:58:48
categories: Notes 
tags:
- Scoop
---

## 介绍

[Scoop](https://scoop.sh/) 是 Windows 上的命令行安装程序

特点如下：

- **大多数**程序安装不需要管理员权限
- 自动设置环境变量
- 命令行操作，类似 macOS 下的 HomeBrew
- 常见开发环境都可以轻松搞定

## 安装

- 以管理员账号启动 Powershell，输入以下命令

    ```powershell
    psversiontable.psversion.major # should be >= 3
    set-executionpolicy remotesigned -scope currentuser
    # 自定义安装路径(可选)
    [environment]::setEnvironmentVariable('SCOOP','D:\Scoop','User')
    $env:SCOOP='D:\Scoop'
    iex (new-object net.webclient).downloadstring('https://get.scoop.sh')
    ```
    如果没报错，就表示安装成功

- 添加官网扩展支持

    ```shell
    scoop bucket add extras
    scoop bucket add versions
    ```

<escape><!-- more --></escape>

## 使用

### 支持命令

```shell
Usage: scoop <command> [<args>]

Some useful commands are:

alias       Manage scoop aliases
bucket      Manage Scoop buckets
cache       Show or clear the download cache
checkup     Check for potential problems
cleanup     Cleanup apps by removing old versions
config      Get or set configuration values
create      Create a custom app manifest
depends     List dependencies for an app
export      Exports (an importable) list of installed apps
help        Show help for a command
home        Opens the app homepage
install     Install apps
list        List installed apps
reset       Reset an app to resolve conflicts
search      Search available apps
status      Show status and check for new app versions
uninstall   Uninstall an app
update      Update apps, or Scoop itself
virustotal  Look for app's hash on virustotal.com
which       Locate a shim/executable (similar to 'which' on Linux)


Type 'scoop help <command>' to get help for a specific command.
```

### 基本命令

```shell
# 查找软件
scoop search sublime-text
#全局安装
sudo scoop install oraclejdk python -g 
#一般安装
scoop install sublime-text 
#更新
scoop update sublime-text 
#卸载
scoop uninstall sublime-text 
```

### 导出安装软件列表

`scoop.cmd export > app_list.txt` 

### 更新所有安装软件

`scoop update * && scoop cleanup *`

### Python 版本切换

```shell
scoop install python27 python
python --version # -> Python 3.6.2

# switch to python 2.7.x
scoop reset python27
python --version # -> Python 2.7.13

# switch back (to 3.x)
scoop reset python
python --version # -> Python 3.6.2
```
> 注：Ruby 版本切换类似，都是通过 `scoop reset` 切换

`---EOF---`