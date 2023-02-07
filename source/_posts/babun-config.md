---
title: babun 配置
date: 2016-05-04 09:09:36
categories: Notes
tags:
- babun
---

## 介绍

babun 号称是开箱即用的，本质是上就是 cygwin 加上了一些预设的配置。特性如下:

- Pre-configured Cygwin with a lot of addons
- Silent command-line installer, no admin rights required
- pact - advanced package manager (like apt-get or yum)
- xTerm-256 compatible console
- HTTP(s) proxying support
- Plugin-oriented architecture
- Pre-configured git and shell
- Integrated oh-my-zsh
- Auto update feature
- "Open Babun Here" context menu entry

## 安装

下载[安装包](http://projects.reficio.org/babun/download)解压缩到任意目录后，运行 `install.bat`。也可以使用 `/t %target_folder%` 指定安装目录。

## 配置
既然是开箱即用，对大多数人来说当然不需要太多配置，一般需要以下两个命令：

- `babun check` 用于判断环境是否正确
- `babun update` 用于判断是否有新的更新包

## 包管理

babun 自带了叫做 `pact` 的包管理，修改自 `apt-cyg`, 但比较弱，用法如下：

```shell
{ ~ }  » pact --help
pact: Installs and removes Cygwin packages.

Usage:
  "pact install <package names>" to install given packages
  "pact remove <package names>" to remove given packages
  "pact update <package names>" to update given packages
  "pact show" to show installed packages
  "pact find <patterns>" to find packages matching patterns
  "pact describe <patterns>" to describe packages matching patterns
  "pact packageof <commands or files>" to locate parent packages
  "pact invalidate" to invalidate pact caches (setup.ini, etc.)
Options:
  --mirror, -m <url> : set mirror
  --invalidate, -i       : invalidates pact caches (setup.ini, etc.)
  --force, -f : force the execution
  --help
  --version
```

## 和 Windows 共享配置

1. 添加环境变量 `HOME`，值为 Windows 的用户目录 `C:\Users\%USERNAME%`
2. 启动 babun，执行 `babun install`，重启 babun

> %USERNAME% 不能包含空格。如果用户名已经有空格，参考[这里](https://cygwin.com/faq.html#faq.setup.name-with-space)解决。

## 代理设置

只需要取消 `.babunrc` 中的注释 (`%USERPROFILE%\.babunrc`)

```
# Uncomment this lines to set up your proxy
export http_proxy=user:password@server:port
export https_proxy=$http_proxy
export ftp_proxy=$http_proxy
export no_proxy=localhost
```

## 镜像

修改 `~/.pact/pact.repo` 中的 `PACT_REPO` 字段  

```
#PACT_REPO=http://mirrors.kernel.org/sourceware/cygwin/
PACT_REPO=http://mirrors.neusoft.edu.cn/cygwin/

# POPULAR HTTP REPOSITORIES
# http://mirror.switch.ch/ftp/mirror/cygwin/

# POPULAR FTP REPOSITORIES
# ftp://mirror.switch.ch/mirror/cygwin/
# ftp://ftp.inf.tu-dresden.de/software/windows/cygwin32/
# ftp://mirrors.kernel.org/sourceware/cygwin/
# ftp://gd.tuwien.ac.at/gnu/cygwin/
# ftp://ftp.iij.ad.jp/pub/cygwin/
# ftp://mirror.cpsc.ucalgary.ca/cygwin.com/

# FULL LIST
# http://cygwin.com/mirrors.html
```

## 常用开发环境配置

### Python

babun 自带的 Python2 并没有安装 pip，需要手动安装

```shell
pact install python-setuptools python-ming
pact install libxml2-devel libxslt-devel libyaml-devel
curl -skS https://bootstrap.pypa.io/get-pip.py | python
```

### Ruby

执行 `pact install ruby`

> 如果 `ruby -v` 不能返回版本，执行 `update.bat` 更新 cygwin 的版本。via [Issue #483](https://github.com/babun/babun/issues/483)

## FAQ

- compdef: unknown command or service: git
    ```
    $ compinit
    $ cp .zcompdump .zcompdump-$HOSTNAME-$ZSH_VERSION
    ```

- 删除右键中的 `Open Babun here`  
    执行 `babun shell-here remove`

- 与 ConEmu 集成  
    `%userprofile%\.babun\cygwin\bin\mintty.exe /bin/env CHERE_INVOKING=1 /bin/zsh.exe`
    ![ConEmu Settings](conemu_1.png)

- X64  
    官方对于 64 位的[解释](https://github.com/babun/babun/wiki/64-bit)。懒人也可以直接使用这个 [PR](https://github.com/babun/babun/pull/545) 编译的[分发包](https://people.mozilla.org/%7Enchen/babun/babun-1.2.1-x86_64-dist.zip)。有兴趣的也可以通过我合并的 [x64 分支](https://github.com/gythialy/babun/tree/support-64-bit) 自行构建。

## 总结

总的来说，babun 比 {% post_link msys2-config MSYS2 %} 慢，包也不多，稳定性/兼容性貌似好一点。

最终配置效果：

![babun](babun.png)

[babun]:https://babun.github.io

---EOF---
