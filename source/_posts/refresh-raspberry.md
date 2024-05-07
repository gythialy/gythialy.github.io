---
title: 吃灰派复活记
tags:
  - raspberry
categories: Notes
date: 2019-11-28 13:54:55
---


## 缘起

之前一个项目做预研的时候搞了个树莓派 3B，测试完之后，一直处于吃灰状态。刚好最近经常给小朋友打印东西，家里那台老的 HP P1106 不支持无线打印，每次都接 USB 才能打印，让人无比烦躁。于是乎抽空把打印机接到树莓派上，利用 cups 做成无线打印。

## 安装系统

### 烧镜像

- [官网](https://www.raspberrypi.org/downloads/raspbian/) 下载最新的镜像
- 可以通过 `dd` 把镜像复制到 SD 卡中，具体方法参考 [官方指南](https://www.raspberrypi.org/documentation/installation/installing-images/mac.md)
- 也可以通过 [Etcher](https://www.balena.io/etcher/)，`brew cask install balenaetcher` 即可，傻瓜式操作
<!-- more -->
### 配置 WIFI

在 `boot` 分区，创建文件 `wpa_supplicant.conf`，内容为

```
country=CN
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1

network={
    ssid="wifi_ssid"
    psk="wifi_password"
    priority=1
}
```
具体参数说明

```
#ssid: WIFI ssid
#psk: WIFI 密码
#priority: 连接优先级，数字越大优先级越高（不可以是负数）
#scan_ssid: 连接隐藏 WiFi 时需要指定该值为 1

// WiFi 没有密码
network={
    ssid="WIFI ssid"
    key_mgmt=NONE
}

// WiFi 使用 WEP 加密
network={
    ssid="WIFI ssid"
    key_mgmt=NONE
    wep_key0="WIFI password"
}

// WiFi 使用 WPA/WPA2 加密
network={
    ssid="WIFI ssid"
    key_mgmt=WPA-PSK
    psk="WIFI password"
}
```

### 启用 ssh

在 SD 卡的根目录创建空文件 ssh，可通过 `touch ssh` 实现

### 修改配置

签名的步骤都完成后就可以把 SD 卡插入到树莓派中了，上电开机了。在路由中查看树莓派中分配到的 IP ，可以在路由中把树莓派的 IP 固定下来，方便后面登录。

- `ssh pi@10.10.50.42` 登录到树莓派中，默认密码为 `raspberry`
- `sudo raspi-config` 可以修改一些系统配置，比如修改密码、开启 VNC 服务
    > 我一般会添加 SSH key 省得后面每次登录输入密码

## 安装 cups
- `sudo apt-get update && sudo apt-get install cups` 安装 cups
- `sudo usermod -a -G lpadmin pi` 运行当前 pi 用户配置 cups
- `sudo service cups stop` 关闭 cups 服务
- `sudo cp /etc/cups/cupsd.conf /etc/cups/cupsd.conf.bak` 备份默认配置
- `sudo vi /etc/cups/cupsd.conf` 修改 cups 的配置，允许在浏览器添加打印机，可参考 [我的配置](https://gist.github.com/gythialy/634c4b23876dc411a9aeb185ef037c54)。这个配置在局域网的话应该是通用的，允许来自局域网的请求
- `sudo service cups start` 启动 cups 服务
- 在浏览器通过 `http://raspberry_pi_ip:631` 应该就可以添加打印机了

## 安装打印机驱动

由于我的打印机是 [HP LaserJet Professional p1106](https://developers.hp.com/hp-linux-imaging-and-printing/models/laserjet/hp_laserjet_professional_p1106)，官方并没有提供 Linux 的驱动，所以需要安装第三方的驱动 [foo2zjs](http://foo2zjs.rkkda.com/)，这个驱动支持 HP P1102，但我的P1106用起来也没什么问题。

- 编译安装 foo2zjs:

    ```bash
    cd $HOME && \
    wget -O foo2zjs.tar.gz http://foo2zjs.rkkda.com/foo2zjs.tar.gz && \
    tar zxf foo2zjs.tar.gz && cd foo2zjs && \
    make && sudo make install && sudo make install-hotplug && sudo make cups
    ```
- `sudo service cups start` 启动 cups 服务
- 在浏览器通过 `http://raspberry_pi_ip:631` 应该就可以添加打印机了
- 这时候在系统里面添加打印机应该就能发现
    ![](snapshot_cups_printers.png)

## VNC 登录

- 开启 VNC server后, 可以通过 `brew install --cask vnc-viewer` 安装 VNC client。
- 在 VNC Viewer中添加树莓派的 IP 地址即可登录树莓派的桌面

## 后记

除了上面提到的操作之外，我额外配置了 zsh，docker 等，由于都是常规 Linux 操作再次就不再赘述了。

```
➜ neofetch
  `.::///+:/-.        --///+//-:``    pi@raspberrypi
 `+oooooooooooo:   `+oooooooooooo:    --------------
  /oooo++//ooooo:  ooooo+//+ooooo.    OS: Raspbian GNU/Linux 10 (buster) armv7l
  `+ooooooo:-:oo-  +o+::/ooooooo:     Host: Raspberry Pi 3 Model B Rev 1.2
   `:oooooooo+``    `.oooooooo+-      Kernel: 4.19.75-v7+
     `:++ooo/.        :+ooo+/.`       Uptime: 3 days, 23 hours, 19 mins
        ...`  `.----.` ``..           Packages: 1494 (dpkg)
     .::::-``:::::::::.`-:::-`        Shell: zsh 5.7.1
    -:::-`   .:::::::-`  `-:::-       Terminal: /dev/pts/0
   `::.  `.--.`  `` `.---.``.::`      CPU: BCM2835 (4) @ 1.200GHz
       .::::::::`  -::::::::` `       Memory: 203MiB / 926MiB
 .::` .:::::::::- `::::::::::``::.
-:::` ::::::::::.  ::::::::::.`:::-
::::  -::::::::.   `-::::::::  ::::
-::-   .-:::-.``....``.-::-.   -::-
 .. ``       .::::::::.     `..`..
   -:::-`   -::::::::::`  .:::::`
   :::::::` -::::::::::` :::::::.
   .:::::::  -::::::::. ::::::::
    `-:::::`   ..--.`   ::::::.
      `...`  `...--..`  `...`
            .::::::::::
             `.-::::-`


```

`---EOF---`