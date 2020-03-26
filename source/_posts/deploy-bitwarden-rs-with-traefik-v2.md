---
layout: 基于 Treafik v2 部署 Bitwarden RS
title: deploy bitwarden with traefik v2
date: 2020-03-26 11:13:30
categories: Notes
tags:
  - Docker-Compose
  - Bitwarden
  - Traefik
---

## 介绍

之前在 {% post_link deploy-bitwarden-rs-with-traefik traefik 基于 Treafik 部署 Bitwarden RS %} 中简单介绍了如何基于 Traefik 部署 Bitwarden RS。Treafik 的官方文档一如既往地混乱，甚至有些地方前后不一致，让人看得云里雾里的。

### Traefik v2 的新特性

  - Providers
    是指你正在使用的集群技术 (Kubernetes, Docker, Consul, Mesos 等)
  - Entrypoints
    是最基本的配置，指监听请求的端口.
  - Services
    是在你的基础设施上的运行的软件，通过 services 配置如何路由到真正的应用程序
  - Routers
    将传入的请求和你的 service 连接起来. 他们持有的 rules 决定哪个 service 将处理对应的请求
  - Middleware
    中间件是可以在请求被 service 处理之前对其进行更新的组件。Traefik 提供了一些开箱即用的中间件来处理 认证、速率限制、断路器、白名单、缓冲等等

### Traefik v2 配置

![configuration](https://docs.traefik.io/assets/img/static-dynamic-configuration.png)

配置分为静态配置和动态配置:

  - 静态配置: 启动的时候加载。包括 Entrypoints、Provider 连接信息
  - 动态配置: 运行时可动态读取改变的。包括 Routes、Services、Middlewares、Certificates

<escape><!-- more --></escape>

## docker-compose

根据上面的介绍，traefik 主要要完成下面几件事：

- 以 docker provider 导入容器实例
- 基于 cloudflare 的自动域名证书签发，且可以持久化签发的证书
- http->https 转发

### Treafik v2 docker-compose 配置

```yml
version: "3.5"

services:
  traefik:
    image: traefik:v2.1
    container_name: traefik
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    command:
      # Globals
      - "--log.level=ERROR"
      - "--global.sendAnonymousUsage=false"
      # Docker
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      # Entrypoints
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      # LetsEncrypt
      - "--certificatesResolvers.cloudflare.acme.dnsChallenge.provider=cloudflare"
      - "--certificatesresolvers.cloudflare.acme.email=${CF_USER_EMAIL}"
      - "--certificatesResolvers.cloudflare.acme.dnsChallenge.resolvers=1.1.1.1:53,8.8.8.8:53"
      - "--certificatesResolvers.cloudflare.acme.storage=/letsencrypt/acme.json"
      # - "--certificatesresolvers.cloudflare.acme.caserver=https://acme-staging-v02.api.letsencrypt.org/directory"
    networks:
      - traefik
    ports:
      - "80:80"
      - "443:443"
    environment:
      - CF_API_EMAIL_FILE=/run/secrets/CF_API_EMAIL
      - CF_ZONE_API_TOKEN_FILE=/run/secrets/CF_ZONE_API_TOKEN
      - CF_DNS_API_TOKEN_FILE=/run/secrets/CF_DNS_API_TOKEN
    labels:
      - "traefik.enable=true"
      # global redirect to https
      - "traefik.http.routers.http_catchall.rule: HostRegexp(`{any:.+}`)"
      - "traefik.http.routers.http_catchall.entrypoints: web"
      - "traefik.http.routers.http_catchall.middlewares: https_redirect"
      - "traefik.http.middlewares.https_redirect.redirectscheme.scheme: https"
      - "traefik.http.middlewares.https_redirect.redirectscheme.permanent: true"
      # global wildcard certificates
      - "traefik.http.routers.traefik.tls.certresolver=cloudflare"
      - "traefik.http.routers.traefik.tls.domains[0].main=example.com"
      - "traefik.http.routers.traefik.tls.domains[0].sans=*.example.com"

    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./letsencrypt:/letsencrypt

  secrets:
    - CF_API_EMAIL:
      file: ./CF_API_EMAIL
    - CF_ZONE_API_TOKEN:
      file: ./CF_ZONE_API_TOKEN
    - CF_DNS_API_TOKEN:
      file: ./CF_DNS_API_TOKEN

networks:
  traefik:
    name: traefik
```

### Bitwarden RS docker-compose 配置

Bitwarden RS 本身的设置和之前并没太多不一样，需要修改的是按照 traefik v2 的配置要求，支持 Web UI，以及基于 Websocket 的 API

```yml
version: "3.5"

services:
  bitwardenrs:
    image: bitwardenrs/server:1.14.1
    container_name: bitwardenrs
    security_opt:
      - no-new-privileges:true
    ports:
      - "127.0.0.1:8000:80"
      - "127.0.0.1:3012:3012"
    environment:
      - WEBSOCKET_ENABLED=true
      - WEB_VAULT_ENABLED=true
      - DOMAIN=https://bitwarden.example.com
      - LOG_FILE=data/bitwarden.log
      - LOG_LEVEL=error
      - EXTENDED_LOGGING=true
      - ADMIN_TOKEN=Aj43jUOZb908JLYbh7giDRv6TqkMFflIY+ebrSQ8phvR7kY+jFDt9yThorconuWU
    volumes:
      - ./data:/data
    restart: unless-stopped
    networks:
      - traefik
    labels:
      - traefik.enable=true
      - traefik.docker.network=traefik
      # bitwarden-ui
      - traefik.http.middlewares.redirect-https.redirectScheme.scheme=https
      - traefik.http.middlewares.redirect-https.redirectScheme.permanent=true
      - traefik.http.routers.bitwarden-ui-https.rule=Host(`bitwarden.example.com`)
      - traefik.http.routers.bitwarden-ui-https.entrypoints=websecure
      - traefik.http.routers.bitwarden-ui-https.tls=true
      - traefik.http.routers.bitwarden-ui-https.tls.certresolver=cloudflare
      - traefik.http.routers.bitwarden-ui-https.service=bitwarden-ui
      - traefik.http.routers.bitwarden-ui-http.rule=Host(`bitwarden.example.com`)
      - traefik.http.routers.bitwarden-ui-http.entrypoints=web
      - traefik.http.routers.bitwarden-ui-http.middlewares=redirect-https
      - traefik.http.routers.bitwarden-ui-http.service=bitwarden-ui
      - traefik.http.services.bitwarden-ui.loadbalancer.server.port=80
      # bitwarden-websocket
      - traefik.http.routers.bitwarden-websocket-https.rule=Host(`bitwarden.example.com`) && Path(`/notifications/hub`)
      - traefik.http.routers.bitwarden-websocket-https.entrypoints=websecure
      - traefik.http.routers.bitwarden-websocket-https.tls=true
      - traefik.http.routers.bitwarden-websocket-https.service=bitwarden-websocket
      - traefik.http.routers.bitwarden-websocket-https.tls.certresolver=cloudflare
      - traefik.http.routers.bitwarden-websocket-http.rule=Host(`bitwarden.example.com`) && Path(`/notifications/hub`)
      - traefik.http.routers.bitwarden-websocket-http.entrypoints=web
      - traefik.http.routers.bitwarden-websocket-http.middlewares=redirect-https
      - traefik.http.routers.bitwarden-websocket-http.service=bitwarden-websocket
      - traefik.http.services.bitwarden-websocket.loadbalancer.server.port=3012

networks:
  traefik:
    external: true
```

## 参考链接

- [Treafik docs](https://docs.traefik.io/)
- [Proxy examples](https://github.com/dani-garcia/bitwarden_rs/wiki/Proxy-examples)

`---EOF---`