---
title: traefik 多端口 SSL 配置
date: 2019-09-02 11:17:44
categories: Notes
tags:
    - Traefik
    - WebSocket
    - Docker-Compose
---

前面在 {% post_link traefik-docker-tls-config %} 中介绍了如果使用 traefik 为 docker 提供支持 SSL 的反向代理。在示例中，`qlc_wallet_server` 中 HTTP 和 WebSocket 共用了一个端口，该端口支持 SSL，可以通过 `https://api.example.com` 和 `wss://api.example.com` 访问。但是如果在同一个容器中使用不同的端口呢？如果支持，如果实现？

答案显然是可以支持的，但是我翻遍官方文档也没找到具体的说明。其实在 {% post_link deploy-bitwarden-rs-with-traefik %} 中部署 Bitwarden 的时候，已经使用了，在一个容器中，bitwarden-RS 通过 80 端口提供 RESTful 的接口，同时通过 3012 端口提供 Websocket 连接用来推送数据变化的通知。

```yml
labels:
    - traefik.enable=true
    - traefik.web.frontend.rule=Host:bitwarden.example.com
    - traefik.web.port=80
    - traefik.hub.frontend.rule=Host:bitwarden.example.com;Path:/notifications/hub
    - traefik.hub.port=3012
    - traefik.hub.protocol=ws
    - traefik.docker.network=traefik
```

定义两个不同的实例，`web` 和 `hub`，分别指定端口，hub 是 WebSocket ，需要手动指定 `protocol`。一定要注意的是，千万不能手动指定 `backend`。要不然 traefik 就会这个容器中对这两个端口做负载均衡。

```--EOF---```
