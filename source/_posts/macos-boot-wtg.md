---
title: macOS 引导 Windows To Go
tags:
  - macOS
  - WTG
  - VMware Fusion
categories: Notes
date: 2020-12-30 10:11:26
---

## 缘起

虽然我日常的工作都是在 MacBook Pro (13-inch, 2018, Four Thunderbolt 3 Ports) 上完成的，也用得还算比较顺手。但是还是有偶尔需要 Windows Only 的需求，比如小米的解锁 Bootloader 的工具就只有 Win 版。本来还有一台 DELL XPS13 作为备用机，由于某些原因主板进水了，在官方修了一次，回来没用几次之后又再次挂了，懒得再修了，就一直在吃灰。鉴于我之前有个 256 G 的 Windows To Go 的 USB 盘，想这再废物利用一下。

主要诉求如下，把原来的 WTG 中的 Windows 10 升级到最新的版本可以用 WLS2，可以作为单独的 WTG 运行，也可以通过虚拟机的方式挂载到 macOS 下应个急。思路如下，在 Windows 中安装 Boot Camp 驱动，在 macOS 中可以 VMware Fusion 中可以作为 Boot Camp 分区引导。

## 准备

### Windows 10 镜像

可以在 [MSDN I tell you](https://msdn.itellyou.cn/) 下载，这个是完全是合法的，不涉及任何盗版的问题。

### VMware Fusion

- 注册 [VMware Fusion](https://www.vmware.com/products/fusion.html)，个人免费使用
- `brew install --cask vmware-fusion` 安装 VMware Fusion
- 用刚注册的序列号激活 VMware Fusion

### Boot Camp
- Make sure that your Mac is connected to the Internet.
- Open Boot Camp Assistant, which is in the Utilities folder of your Applications folder.
- From the menu bar at the top of your screen, choose Action > Download Windows Support Software, then choose your USB flash drive as the save destination. When the download completes, quit Boot Camp Assistant.

### 制作 WTG

- Windows

在 Windows 下制作 WTG 有一堆工具了，[WinToUSB](https://www.easyuefi.com/wintousb/) 算是比较傻瓜式的。安装之后，按照向导即可。

- macOS

可以通过 VMware Fusion 安装一个 Windows 虚拟机，然后在虚拟机里面安装 WinToUSB 来制作 WTG 的盘。

### 安装

WTG 制作完成后，只安装 Boot Camp 下载的驱动。如果出现 “Boot Camp is unsupported on this computer model” 错误，可参考 [How to fix the 'Boot Camp is unsupported on this computer model' error on Mac](https://www.imore.com/how-fix-boot-camp-unsupported-computer-model-error) 解决。


## 在 macOS 中启动 WTG
- 在 System Preferences->Security & Privacy->Full Disk Access 中启用 com.vmware.DiskHelper
  ![](1.png)

- 在 VMware Fusion 中启动，具体步骤可以参考 [Launching your Boot Camp partition in VMware Fusion](https://kb.vmware.com/s/article/1014618)

- 启用 CPU 虚拟化
  ![](2.png)

## Tips

- WTG 不能升级？
  - 将 `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\PortableOperatingSystem` 的值修改为 0
  - 在虚拟机中启动 WTG，就可以升级

## 参考链接
- [Download and install Windows support software on your Mac](https://support.apple.com/en-us/HT204923)
- [[教程] Windows To Go 系统升级（2018.8.27 更新）](https://bbs.luobotou.org/thread-12414-1-1.html)

`---EOF---`