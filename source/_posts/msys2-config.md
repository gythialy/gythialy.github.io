title: MSYS2 配置
date: 2016-03-24 10:25:10
categories: Notes
tags:
- msys2
---

## 介绍

[MSYS2][] 是 MSYS 的一个升级版, 准确的说是集成了 pacman 和 Mingw-w64的 Cygwin 升级版。与 MSYS 最大的区别是移植了 Pacman。

### 比较

| 特点         | Cygwin                                   | MinGW/MSYS                       | MSYS2                        |
| :--------- | :--------------------------------------- | :------------------------------- | :--------------------------- |
| 是否GNU      | 否                                        | 是                                | 是                            |
| 软件支持？      | 支持绝大多数的 GNU 软件                           | 支持常用软件                           | 支持大多数 GNU 软件                 |
| 更类似 Linux？ | 在 Windows 中模拟 Linux                      | 实现了 Bash 等主要的 Linux 程序           | 原生 64/32bit 支持               |
| GCC 编译     | 独立的 Windows/Linux 程序编译(MingGW32 交叉编译/依赖 cygwin1.dll) | 独立的 Windows 程序编译                 | 独立的 Windows 程序编译             |
| 中文支持       | 直接支持中文显示和输入法                             | 需要配置才能支持中文显示和输入，删除一个中文字符需要删除 2 次 | 支持中文显示和输入法，中文帮助系统和中文提示（部分软件） |
| 运行速度       | 慢                                        | 快                                | 快                            |


## 安装

### 安装 MSYS2

从官网下载 [MSYS2][] 安装文件, 一路 Next 即可。

### 安装开发环境

`pacman -S --needed base-devel msys2-devel mingw-w64-x86_64-toolchain`

## 配置

### 环境变量

``` shell
MSYS_HOME=D:\msys64
MINGW_HOME=D:\msys64\mingw64
LIBRARY_PATH=D:\msys64\mingw64\lib
```

### 镜像配置

如果网络环境不好的话，可以增加国内的镜像，速度改进非常明显。

修改 `/etc/pacman.d/` 文件夹中修改 `mirrorlist` 开头的三个文件：

- `mirrorlist.mingw32`

```
##
## 32-bit Mingw-w64 repository mirrorlist
##
Server=http://mirrors3.ustc.edu.cn/msys2/REPOS/MINGW/i686

## Primary
## msys2.org
Server = http://repo.msys2.org/mingw/i686
Server = http://downloads.sourceforge.net/project/msys2/REPOS/MINGW/i686
Server = http://www2.futureware.at/~nickoe/msys2-mirror/i686/
```

- `mirrorlist.mingw64`

```
##
## 64-bit Mingw-w64 repository mirrorlist
##

Server=http://mirrors3.ustc.edu.cn/msys2/REPOS/MINGW/x86_64
## Primary
## msys2.org
Server = http://repo.msys2.org/mingw/x86_64
Server = http://downloads.sourceforge.net/project/msys2/REPOS/MINGW/x86_64
Server = http://www2.futureware.at/~nickoe/msys2-mirror/x86_64/

```

- `mirrorlist.msys`

```
##
## MSYS2 repository mirrorlist
##

Server=http://mirrors3.ustc.edu.cn/msys2/REPOS/MSYS2/$arch

## Primary
## msys2.org
Server = http://repo.msys2.org/msys/$arch
Server = http://downloads.sourceforge.net/project/msys2/REPOS/MSYS2/$arch
Server = http://www2.futureware.at/~nickoe/msys2-mirror/msys/$arch/
```

### 代理

如果需要通过代理才能上网的话，可以在 `/etc/profile.d/` 增加 `proxy.sh`，内容如下:

```
export http_proxy=%PROXY_SERVER%:%PROXY_PORT%
export https_proxy=%PROXY_SERVER%:%PROXY_PORT%
export ftp_proxy=%PROXY_SERVER%:%PROXY_PORT%
export HTTP_PROXY=%PROXY_SERVER%:%PROXY_PORT%
export HTTPS_PROXY=%PROXY_SERVER%:%PROXY_PORT%
export FTP_PROXY=%PROXY_SERVER%:%PROXY_PORT%
```

### 用户目录

修改 `/etc/fstab`，映射用户目录，与宿主共享配置，这样类似 gitconfig 这样的配置只需要配置一份。

```
# For a description of the file format, see the Users Guide
# http://cygwin.com/cygwin-ug-net/using.html#mount-table

# DO NOT REMOVE NEXT LINE. It remove cygdrive prefix from path
none / cygdrive binary,posix=0,noacl,user 0 0
C:/Users /home ntfs binary,noacl,auto 1 1
```

### 公用 HOME 目录

环境变量中添加 `MSYS2_PATH_TYPE` 值为 `inherit`

## 包管理

- 刷新软件包 `pacman -Sy`
- 安装新包 `pacman -S <package_names|package_groups>`

- 删除 `pacman -R <package_names|package_groups>`

- 搜索 `pacman -Ss <name_pattern>`

> 更多请参考 [Arch Linux wiki](https://wiki.archlinux.org/index.php/pacman).



## 安装`zsh`和`oh my zsh`

- 安装`zsh`

```shell
pacman -Syu
pacman -S zsh
```

- 安装 `oh my zsh`

```shell
sh -c "$(curl -fsSL https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"
```
> zsh 的配置文件是 `~/.zshrc`，可以通过编辑这个文件来指定主题，插件。

## 重新安装

如果在使用过程中， [MSYS2]() 出现不可恢复的问题的时候，可以通过保存安装的 packages 到文件中，再通过此文件重新安装。

- 保存现有安装包列表到 C 盘中的 `packages.txt`

`pacman -Qqe | xargs echo > /c/packages.txt ; exit`

- 根据保存的 `packages.txt` 安装

``` shell
pacman -Sy
pacman --needed -S bash pacman pacman-mirrors msys2-runtime
pacman -S --needed --force $(cat /c/packages.txt)
```

## 坑

如果你使用 MacType 的话，请一定在  `default.ini` (MacType的配置文件) 添加 gpg/pacman 的例外。

```ini
[UnloadDll]
gpg.exe
pacman.exe
```
> via #393 [GPGME error: Invalid crypto engine](https://github.com/Alexpux/MSYS2-packages/issues/393)

如果你使用 VirtualBox 4.3.14+ 的话，也需要把相关进程排除。via [VirtualBox 4.3.12以后的E_FAIL (0x80004005)问题](https://donneryst.com/blog/virtualbox-4-3-12%E4%BB%A5%E5%90%8E%E7%9A%84e_fail-0x80004005%E9%97%AE%E9%A2%98.html)

[MSYS2]:https://msys2.github.io/

---EOF---
