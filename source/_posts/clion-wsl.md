---
title: Clion WSL 工具链配置
tags:
  - Clion
  - WSL
  - Windows Subsystem for Linux
categories: Notes
date: 2018-06-24 20:02:38
---


## 安装 WSL

以管理员权限运行 owershell 并执行下面的指令
```bash
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux
```

在 [Microsoft Store](https://www.microsoft.com/zh-cn/p/ubuntu/9nblggh4msv6?rtc=1) 中安装 Ubuntu。

> 目前 Windows 支持多种 Linux 发行版，但 Ubuntu 作为使用门槛最低的版本，这里以此为例。

## 与 Windows 共享配置

通过软链接 Windows 的用户到 WSL，这样就可以共享一些软件的配置信息，比如 git, ssh 等。

```bash
# 删除原有用户目录
sudo rm -rf /home/goreng
# 链接 Windows 用户目录到 WSL 中
sudo ln -sf /mnt/c/User/<windows user name> /home/goreng
# 更改访问租信息
sudo chown -R goreng:goreng /home/goreng
```
<!-- more -->

> `goreng` 为 WSL 用户名

## 修改 Ubuntu 源

修改 Ubuntu 默认源为镜像配置并关闭 `deb-src`
```bash
sudo sed -i -e 's%http://archive.ubuntu.com/ubuntu%mirror://mirrors.ubuntu.com/mirrors.txt%' -e 's/^deb-src/#deb-src/' /etc/apt/sources.list
sudo apt-get upate && sudo apt-get upgrade
```

## 安装 Clion 依赖

Jetbrains 官方给出一键安装的脚本，基本上就是安装基本的开发包，并配置了 SSH Server 用于远程调试

```bash
wget https://raw.githubusercontent.com/JetBrains/clion-wsl/master/ubuntu_setup_env.sh && bash ubuntu_setup_env.sh
```
> 注：此处脚本执行完会打印 SSH 连接信息，后面会用到

## 安装常用开发组件

```bash
sudo apt-get install git zsh python-dev python-pip fonts-powerline gnupg2 qtbase5-dev
```

## 配置 zsh

### 安装 oh-my-zsh
```
sh -c "$(curl -fsSL https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"
```

### 安装 [powerline-shell](https://github.com/b-ryan/powerline-shell)

- 安装 `pip install powerline-shell`
- 添加到 `~/.zshrc` 中
    ```bash
    function powerline_precmd() {
        PS1="$(powerline-shell --shell zsh $?)"
    }

    function install_powerline_precmd() {
    for s in "${precmd_functions[@]}"; do
        if [ "$s" = "powerline_precmd" ]; then
        return
        fi
    done
    precmd_functions+=(powerline_precmd)
    }

    if [ "$TERM" != "linux" ]; then
        install_powerline_precmd
    fi
    ```
## 编译 [boost](https://www.boost.org/)

```bash
wget --quiet -O boost_1_67_0.tar.gz https://dl.bintray.com/boostorg/release/1.67.0/source/boost_1_67_0.tar.gz
tar xf boost_1_67_0.tar.gz
cd boost_1_67_0
./bootstrap.sh
./b2 link=static install
```

## 编译 [cmake](https://cmake.org/)

```
wget --quiet -O cmake-3.11.4.tar.gz  https://cmake.org/files/v3.11/cmake-3.11.4.tar.gz
tar xf cmake-3.11.4.tar.gz
cd cmake-3.11.4
./bootstrap
make
sudo make install
```
> 注：由于 Ubuntu 源中的 cmake 版本比较低，对 boost 支持不好，所以手动编译官方最新的 release 版

## 配置 Clion

由于 WSL 是文件名大小写敏感，所以需要修改 Clion 的配置。在 Help -> “Edit Custom Properties…” 中添加  `idea.case.sensitive.fs=true` 然后重启并重建索引。 (File -> “Invalidate Caches and Restart”)

## 小结

对于 Windows 平台来说，有了 WSL 之后多了一个选择，但是 WSL 的稳定性还是有挺大问题，比如在我做了这一大堆配置之后，WSL 起不起来了。

Clion 对 WSL 的支持也是处于比较初级的阶段，gdb 调试的时候，对 C++ STL value 的显示也不友好。via [GDB pretty printers don't work for std::string and std::list with GCC-5 and higher
](https://youtrack.jetbrains.com/issue/CPP-6828)

综上所述，在 Windows 平台还是用宇宙最强 IDE Visual Studio 吧。

## 参考链接
- [CLion and Linux toolchain on Windows are now friends!](https://blog.jetbrains.com/clion/2018/01/clion-and-linux-toolchain-on-windows-are-now-friends/)
- [Getting Started on Unix Variants](https://www.boost.org/doc/libs/1_67_0/more/getting_started/unix-variants.html)
- [Installing CMake](https://cmake.org/install/)

`---EOF---`