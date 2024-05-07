---
title: 通过 docker 部署 wireguard 及其界面
tags:
  - Docker-Compose
  - Docker
  - Wireguard
  - Rocky Linux
  - CentOS
categories: Notes
date: 2023-12-04 12:56:39
---


## 前言

Wireguard 有两种模式，一直是内核态，一种是用户态。可以通过 `modprobe wireguard` 检查内核是否支持 Wireguard。如果该命令成功退出并且没有打印错误，则内核模块可用。如果 wireguard 内核模块不可用，可以切换到像[boringtun](https://github.com/cloudflare/boringtun) 这样的用户态实现。

这里以内核态为例。

## 准备工作

1. 安装 Wireguard
  ```bash
  sudo yum install elrepo-release epel-release -y
  sudo yum update -y
  sudo yum install kmod-wireguard wireguard-tools -y
  sudo yum copr enable jdoss/wireguard
  sudo yum update -v
  sudo yum install wireguard-dkms -y
  ```
2. 启用 Wireguard 内核模块
  ```bash
  sudo modprobe wireguard
  ```
3. 自动加载 `iptable_raw`
  ```bash
  sudo modprobe iptable_raw
  sudo echo "iptable_raw" | sudo tee /etc/modules-load.d/iptable_raw.conf
  ```

<!-- more -->

## Docker Compose 文件

```yaml
version: "3"

services:
  wireguard:
    image: linuxserver/wireguard:latest
    container_name: wireguard
    environment:
      # - PUID=1000
      # - PGID=1000
      - TZ=Asia/Shangai
      - SERVERURL=vpn.example.com #optional
      - SERVERPORT=51820 #optional
      # - PEERS=1 #optional
      - PEERDNS=auto #optional
      # - INTERNAL_SUBNET=10.13.13.0 #optional
      - ALLOWEDIPS=192.168.6.0/24 #optional
      - PERSISTENTKEEPALIVE_PEERS=25 #optional
      - LOG_CONFS=true #optional
    cap_add:
      - NET_ADMIN
      - SYS_MODULE
    volumes:
      - ./config:/config
    sysctls:
      - net.ipv4.conf.all.src_valid_mark=1
    ports:
      # port for wireguard-ui. this must be set here as the `wireguard-ui` container joins the network of this container and hasn't its own network over which it could publish the ports
      - "5000:5000"
      # port of the wireguard server
      - "51820:51820/udp"

  wireguard-ui:
    image: ngoduykhanh/wireguard-ui:latest
    container_name: wireguard-ui
    depends_on:
      - wireguard
    cap_add:
      - NET_ADMIN
    # use the network of the 'wireguard' service. this enables to show active clients in the status page
    network_mode: service:wireguard
    environment:
      - SENDGRID_API_KEYc
      - EMAIL_FROM_ADDRESS
      - EMAIL_FROM_NAME
      - SESSION_SECRET
      - WGUI_USERNAME=admin
      - WGUI_PASSWORD=password
      - WG_CONF_TEMPLATE
      - WGUI_MANAGE_START=true
      - WGUI_MANAGE_RESTART=true
    logging:
      driver: json-file
      options:
        max-size: 50m
    volumes:
      - ./db:/app/db
      - ./config:/etc/wireguard
```

需要修改的参数 `SERVERURL`,`WGUI_USERNAME`,`WGUI_PASSWORD`

## 启动并配置

通过 `docker compose up -d` 启动，然后通过 http://localhost:5000 访问 Web UI 界面。

服务端设置
![](./SCR-20231204-lnpk.png)

客户端设置
![](./SCR-20231204-lnzw.png)

连接状态
![](./SCR-20231204-lnso.png)

`---EOF---`