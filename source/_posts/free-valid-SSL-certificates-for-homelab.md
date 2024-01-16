---
title: 内网服务部署有效的 SSL 证书
tags:
  - Nginx
  - SSL
  - Docker
  - Docker-Compose
  - Cloudflare
categories: Notes
date: 2024-01-16 15:03:20
---

## 介绍

如果在内网中运行本地 Web 应用程序，可以使用 IP 地址和端口组合来访问服务，例如 `http://192.168.1.32:8096` 来访问 Jellyfin。但是如果发生 IP 变更的话，就需要修改 IP 地址，因此可以通过反向代理和本地域名的组合，例如 `https://jellyfin.local` 或 `https://homeassistant.local` 来避免 IP 地址变更。这种由于是使用了自己生产的 CA 证书，浏览器会有告警提示。

## 准备

假定本地运行 Jellyfin 服务器的 HomeLab IP 为 `192.168.1.32`，容器名称为 jellyfin，端口为 8096，域名为 jellyfin.example.xyz

### 域名

#### 自有域名

这里以 `Cloudflare` 为例
1. 在 [My Profile/API Tokens](https://dash.cloudflare.com/profile/api-tokens) 页面生成有 `Zone.DNS` 权限的 API token
2. 在 DNS 记录中添加一条 A 记录，名称为 `jellyfin`, 内容为 `192.168.1.32`，代理状态为 ` 仅 DNS - reserved IP`

#### 没有域名

通过 [DuckDNS](https://www.duckdns.org/) 注册账号，然后添加域名记录，比如 `homelab001`，IP 地址设为 `192.168.1.32`，最终的域名为 `https://jellyfin.homelab001.duckdns.org`
<escape><!-- more --></escape>

### 反向代理

通过 `docker-compose up -d` 启动 Nginx Proxy Manager，然后通过 http://192.168.1.32:81 访问。默认账号如下
```
Email:    admin@example.com
Password: changeme
```

```yaml
version: '2'

services:
  nginx-proxy:
    image: jc21/nginx-proxy-manager:latest
    container_name: nginx-proxy-manager
    ports:
      - "80:80"
      - "81:81"
      - "443:443"
    volumes:
      - ./data:/data
      - ./letsencrypt:/etc/letsencrypt
    environment:
      - TZ=Asia/Shanghai
    networks:
      - nginx-proxy
    restart: unless-stopped

networks:
  nginx-proxy:
    name: nginx-proxy
```

在 `SSL Certificates` 标签页中通过 Let's Enctrypt 生成通配符证书。
![](SCR-20240116-nesd.png)

在 `Proxy Hosts` 中添加一条记录
![](SCR-20240116-nghq.png)

在 `SSL` 标签中中选中第一步生成的通配符证书
![](SCR-20240116-nglo.png)

生效后，就可以通过 `https://jellyfin.example.xyz` 访问，如果是通过 DuckDNS 的话，通过 `https://jellyfin.homelab001.duckdns.org` 访问。

## 总结

至此，为内网服务生成有效的 SSL 证书，并绑定内网服务。如果要在外网访问内部服务可以通过 {% post_link access-lan-from-remote-by-zerotier Zerotier %} 或者其他类似服务来实现。

`---EOF---`