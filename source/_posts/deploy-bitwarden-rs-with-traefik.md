---
title: 基于 Treafik 部署 Bitwarden RS
tags:
  - Docker-Compose
  - Bitwarden
  - Traefik
categories: Notes
date: 2019-06-08 18:15:21
---

## 背景

[Bitwarden](https://bitwarden.com/) 是一个类似 1Password 和 LastPass 的开源密码管理软件，[Bitwarden RS](https://github.com/dani-garcia/bitwarden_rs) 是基于 Rust 语言的一个实现，更轻量一些，可能效率也会更高一点点，并且是完全兼容官方 App 的，比如各种浏览器扩展，手机 App 等。

TL;DR

### Bitwarden RS 已完成功能

- Basic single user functionality
- Organizations support
- Attachments
- Vault API support
- Serving the static files for Vault interface
- Website icons API
- Authenticator and U2F support
- YubiKey OTP

简而言之就是日常用用是差不多的，离官方实现还有点路要走。

## 准备工作

- 一个域名
- 一台公网服务器
- docker-compose
    ```shell
    ➜ docker-compose version
    docker-compose version 1.23.2, build 1110ad01
    docker-py version: 3.6.0
    CPython version: 3.6.6
    OpenSSL version: OpenSSL 1.1.0h  27 Mar 2018
    ```
- traefik
    traefik 配置证书，可以参考 {% post_link traefik-docker-tls-config traefik 配置 docker 容器支持 HTTPS %}，这里就不赘述了。

<escape><!-- more --></escape>

## 配置

``` yml
version: "3.5"

services:
  bitwardenrs:
    image: bitwardenrs/server:latest
    container_name: bitwardenrs
    ports:
      - "127.0.0.1:8000:80"
      - "127.0.0.1:3012:3012"
    environment:
      - WEBSOCKET_ENABLED=true
      - SIGNUPS_ALLOWED=true
      - WEB_VAULT_ENABLED=true
      - SIGNUPS_ALLOWED=fale
      - ADMIN_TOKEN=Aj43jUOZb908JLYbh7giDRv6TqkMFflIY+ebrSQ8phvR7kY+jFDt9yThorconuWU
    volumes:
      - type: bind
        source: ./data
        target: /data
    restart: unless-stopped
    networks:
      - traefik
    labels:
      - traefik.enable=true
      - traefik.web.frontend.rule=Host:bitwarden.example.com
      - traefik.web.port=80
      - traefik.hub.frontend.rule=Host:bitwarden.example.com;Path:/notifications/hub
      - traefik.hub.port=3012
      - traefik.hub.protocol=ws
      - traefik.docker.network=traefik
networks:
  traefik:
    external: true
```

- `ADMIN_TOKEN` 为后台的 /admin 的管理密码，可以通过 `openssl rand -base64 48` 生成
- `SIGNUPS_ALLOWED` 是否开启注册
- `bitwarden.example.com` 换成自己的域名即可

TL;DL
- 其实有非常多的 [环境变量](https://github.com/dani-garcia/bitwarden_rs/blob/master/.env.template) 可以配置，按需配置
- 3012 端口为 WebSocket 端口，用于推送密码变更给客户端的，如果不配置的话，客户端需要手动同步
- traefik 官方对 WebSocket 的配置说明非常少，这配置也是从各种问题中实验出来的配置
- 还有很多其他反向代理，没必要在一棵歪脖子树上吊死

## 运行

```shell
docker-compose up -d
```

查看日志，如果没有 `ERROR` 出现应该就正常了
```shell
docker logs --follow --tail 10 bitwardenr
```

## 小结

与官方托管对比

优势：
- 可以使用一些付费功能
- 密码在自己服务器上

劣势：
- 因为数据在自己服务器上，对服务器的安全性运维也相应提高
- 部署也没那么容易，需要一定的专业知识

与 LastPass 相比

优势：
- 开源
- 可以自动填充 TOTP
- Android App 自动填充成功率稍微高了一点点

劣势：
- 同步不即时 (后期应该可解决，官方的部署没尝试，可能没这个问题)
- 界面更丑陋
- 由于本身登录就需要 TOTP，所以你还是需要安装一个 TOTP 的 App，并不如 LastPass 的两个 App 同一个账户来得方便

不管是 Bitwarden 还是 LastPass，只要是主密码没有泄漏，按照现在的计算机的算力是很难破解的。各种不同的无非是用户体验而已。

`----EOF---`