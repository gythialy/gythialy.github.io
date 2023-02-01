---
title: 基于 ZeroTier 和 Openwrt 路由器的内网互联
tags:
  - Zerotier
  - OpenWRT
categories: Notes
date: 2023-02-01 13:54:58
---


## 缘起

偶尔出差的时候，需要访问家里的网络，办公室已经有一台服务器使用了[Zerotier](https://zerotier.com/)网络，索性就把家里的路由也加到网络里面，这样的话，就可以同时访问公司和家里的网络了。因为办公室那台是我控制的，所以不会出现其他同事会进入到家庭网络的情况。

ZeroTier是一款软件定义网络（SDN）解决方案，可以帮助企业快速部署和管理全球虚拟网络。它使用一个分布式的虚拟交换机来连接所有的节点，无需物理交换机或配置复杂的VPN。ZeroTier可以在任何地方部署，包括云、数据中心、家庭和办公室。它还可以与其他SDN解决方案集成，如OpenFlow和Cisco ACI。ZeroTier还可以通过多个平台使用，包括Windows、macOS、Linux、Android和iOS。

## 安装 Zerotier-one-moon

由于 Zerotier 的中转服务器都在国外，访问速度有可能会慢，所以增加一台中转服务器。 使用 [zerotier-one-moon](https://github.com/gythialy/zerotier-one-moon) 可以快速一键部署自己的中转服务器。我这里就找了一台闲置的阿里云服务器，使用下来速度还可以，基本感受不到卡顿。

```yaml
version: "3.5"

services:
  zerotier-moon:
    image: ghcr.io/gythialy/zerotier-one-moon:latest
    container_name: zerotier-moon
    cap_add:
      - NET_ADMIN
      - SYS_ADMIN
    devices:
      - /dev/net/tun
    ports:
      - 9993:9993/udp
    command:
      - -4 xxx.xxx.xxx.xxx
      - -p 9993
    volumes:
      - ./zerotier-one:/var/lib/zerotier-one
```

服务正常启动后，会得到 moon id，类似 `61941d46d1`，已经服务器的公网IP和端口，记得在防火墙把响应的端口打开。

## 配置 Zerotier 账号

账号本身没什么，就是注册登陆后建立一个 Zerotier 网络，这里建议设置成private network，这样别人就不能随便加入了。

### 授权自己的接入点

因为设置成了private network，所以默认是无法加入这个网络的，可以在 Zerotier 的[网络管理界面](https://my.zerotier.com/network/)看到哪些点，然后在auth上勾选一下，就授权了这个点接入了。

### 设置分配IP的网段

其实不设置根本没问题，你只要设置好路由表保证分配的网段范围都划分到同一个 LAN 就行。我这里设置成了10.147.17.1~10.147.17.254，保证这个IP段不和你两端任意一段路由器的LAN IP段冲突就行。

## 路由设置

在 菜单 `VPN/Zerotier` 中填入刚才在网页上生成的 Network ID，保存并应用即可，正常情况下 Zerotier 的服务应该就启动起来了。
![](SCR-20230201-iuv.png)

启动完成后，在 Zerotier 的网络管理界面授权通过，至此路由就应该连接到了 Zerotier 网络。

### 设置 Zerotier Moon

通过命令行 `sudo zerotier-cli orbit 61941d46d1 61941d46d1` 添加 Zerotier moon。可以通过 SSH 登录到路由器，或者通过 OpenWRT 提供的**TTYD 终端**都可以，看个人习惯。


可以通过 `sudo zerotier-cli peers` 查看节点的连接情况
```
200 peers
<ztaddr>   <ver>  <role> <lat> <link> <lastTX> <lastRX> <path>
61941d46d1 1.6.5  MOON      10 DIRECT 307      306      139.224.186.142/9993
61d294b8cb -      PLANET   168 DIRECT 2593     2431     50.8.73.34/9993
62f845ae71 -      PLANET   321 DIRECT 2593     7327     50.8.252.138/9993
748cde7190 -      PLANET   232 DIRECT 7640     2361     103.195.108.66/9993
952fcf1db7 -      PLANET   247 DIRECT 1628481820060 2346     195.181.174.159/9993
a05acf0233 1.6.4  LEAF     205 DIRECT 2773     2773     34.135.35.67/46781
c8a68837ae -      LEAF      -1 RELAY
```
如果出现 `<role>` 为 MOON 的节点信息，则表示通过 moon 提速完成，上表中的 IP 和 Zerotier Id 都是随机的生成的。

### 设置 Zerotier 的路由表

在 Zerotier 的[网络管理界面]中添加路由表，我的路由表如下：

```
10.147.17.0/24 (LAN)
192.168.5.0/24 via 10.147.17.151
```

第一个表示`10.147.17.0/24` 这是同一个局域网，分配出来的IP在这个范围的直连就行了，不用过别的网关了。

第二条表示，家庭的路由器后网段是`192.168.5.0/24`，而 OpenWRT 在 Zerotier 网络得到的IP是`10.147.17.151`(这个可以在zerotier网站查，也可以通过`ifconfig`命令在路由器查)，那么zerotier局域网内的其他IP要访问这个`192.168.5.0/24`网段的话，自然要通过`10.147.17.151`作为网关。

如果有多个网络的话，增加多条路由表即可，不过 Zerotier 免费的版本，最多可以添加 25 个设备，如果超过这个设备的话，可以通过之间 PLANT 来解决。

## 后记

在 OpenWRT 上配置好 Zerotier 后，路由后的所有设备都可以直接访问 `10.147.17.x` 段的服务，无需做其他配置。在出差的时候，在本地启动 Zerotier 服务后，也可以直接访问家中的 `192.168.5.x` 的服务，比如 NAS 之类的。

---EOF---