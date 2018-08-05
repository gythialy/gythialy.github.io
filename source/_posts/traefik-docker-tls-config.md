---
title: traefik 配置 docker 容器支持 HTTPS
tags:
  - traefik
  - docker
  - ACME
categories: Notes
date: 2018-08-05 19:13:54
---


## 介绍

[traefik](https://traefik.io/) 是一款开源的反向代理与负载均衡工具。它最大的优点是能够与常见的微服务系统直接整合，可以实现自动化动态配置。目前支持 Docker, Swarm, Mesos/Marathon, Mesos, Kubernetes, Consul, Etcd, Zookeeper, BoltDB, Rest API 等等后端模型。

为什么选择 traefik？

- Golang 编写，单文件部署，与系统无关，同时也提供小尺寸 Docker 镜像。
- 支持 Docker/Etcd 后端，天然连接我们的微服务集群。
- 内置 Web UI，管理相对方便。
- 自动配置 ACME(Let’s Encrypt) 证书功能。
- 性能尚可，我们也没有到压榨 LB 性能的阶段，易用性更重要。
- Restful API 支持。
- 支持后端健康状态检查，根据状态自动配置。
- 支持动态加载配置文件和 graceful 重启。
- 支持 WebSocket 和 HTTP/2。

借用官网的图，一图以蔽之
![](/uploads/traefik_architecture.png)

<escape><!-- more --></escape>
## 需求

使用场景作为一个基于 [Angular](https://angular.io/) 的单页 App，与后端 Server通过 RESTful 接口通信，前后端都需要提供 https 支持。使用场景很简单，暂时也没有负载均衡。

## 准备

根据 traefik 的官方文档中关于 [ACME](https://docs.traefik.io/configuration/acme/) 的说明, [Cloudflare](https://www.cloudflare.com/) 是支持宽域名自动发证书的。

- 把域名的 DNS 改成 Cloudflare 的
- 需要的是账户的邮箱地址和 Globel API key

## 配置

traefik 的配置文件。可以挂载到 docker 容器上

```toml
# debug = true
logLevel = "ERROR" #DEBUG, INFO, WARN, ERROR, FATAL, PANIC
InsecureSkipVerify = true 
defaultEntryPoints = ["https", "http"]

# WEB interface of Traefik - it will show web page with overview of frontend and backend configurations 
[web]
address = ":8080"
  [web.auth.basic]
  usersFile = "/shared/.htpasswd"

# Force HTTPS
[entryPoints]
  [entryPoints.http]
  address = ":80"
    [entryPoints.http.redirect]
    entryPoint = "https"
  [entryPoints.https]
  address = ":443"
    [entryPoints.https.tls]
  [entryPoints.ws]
  [entryPoints.wss]

[file]
  watch = true
  filename = "/etc/traefik/rules.toml"

# Let's encrypt configuration
[acme]
email = "yong.gu@qlink.mobi" #any email id will work
storage="/etc/traefik/acme/acme.json"
entryPoint = "https"
acmeLogging=true 
onDemand = false #create certificate when container is created
[acme.dnsChallenge]
  provider = "cloudflare"
  delayBeforeCheck = 0
[[acme.domains]]
   main = "example.com"
[[acme.domains]]
   main = "*.example.com"
   
# Connection to docker host system (docker.sock)
[docker]
endpoint = "unix:///var/run/docker.sock"
domain = "example.com"
watch = true
# This will hide all docker containers that don't have explicitly  
# set label to "enable"
exposedbydefault = false
```
> 注：需要发证书的域名在 `acme.domains` 中配置，这里以 `example.com` 为例。

docker-compose.yml
```yml
version: "3.5"

services:
  qlc_wallet_server:
    image: qlcwallet-server:latest
    container_name: qlc_wallet_server
    ports:
      - "127.0.0.1:8888:8888"
    networks:
      - qlcwallet
      - traefik
    environment:
      - DB_PASS=/run/secrets/db_root_password
    volumes:
      - type: bind
        source: ./wallet-server/.env
        target: /app/config/.env
      - type: bind
        source: ./wallet-server/logs
        target: /var/log/wallet-server
    secrets:
      - db_root_password
    restart: always
    labels:
      - "traefik.enable=true"
      - "traefik.backend=qlc_wallet_server"
      - "traefik.api.port=8888"
      - "traefik.api.frontend.rule=Host:api.example.com" 
      - "traefik.docker.network=traefik"
  
  qlc_wallet:
    image: qlcwallet:latest
    container_name: qlcwallet
    ports:
      - "127.0.0.1:4200:80"
    networks:
      - qlcwallet
      - traefik
    depends_on: 
        - qlc_wallet_server
    restart: always
    labels:
      - "traefik.enable=true"
      - "traefik.backend=qlc_wallet"
      - "traefik.port=80"
      - "traefik.frontend.rule=Host:wallet.example.com"  
      - "traefik.docker.network=traefik"

  traefik:
    hostname: traefik
    image: traefik:latest
    container_name: traefik
    restart: always
    domainname: example.com
    networks:
      - qlcwallet
      - traefik
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"
    environment:
      - CLOUDFLARE_EMAIL=/run/secrets/traefik_user
      - CLOUDFLARE_API_KEY=/run/secrets/traefik_api
    labels:
      - "traefik.enable=true"
      - "traefik.backend=traefik"
      - "traefik.frontend.rule=Host:traefik.example.com"  
      - "traefik.port=8080"
      - "traefik.docker.network=traefik"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./traefik:/etc/traefik
      - ./shared:/shared
    secrets:
      - traefik_api
      - traefik_user

networks:
  qlcwallet:
    name: qlcwallet
  traefik:
    name: traefik

secrets:
  db_root_password:
    file: ./secrets/db_password.txt
  traefik_api:
    file: ./secrets/api.txt
  traefik_user:
    file: ./secrets/user.txt
```

这部分包含三部分
- qlc_wallet_server RESTful 服务器
- qlc_wallet Angular 应用
- traefik traefik 本身自带一个简单的 Web 后台，绑定在 8080 端口，可以选择性开启。

这里以 labels 的形式配置，生产环境建议通过 `toml` 文件的方式配置，这样修改配置不要重启容器。traefik 默认是不会把容器对外发布的，需要手动设置。`traefik.port` 需要设置成容器内部端口，而不是绑定的外部端口。 

## 总结

总的来说，traefik 配置简单，可以非常快速的搭建测试环境，很方便地支持宽域名证书。另外官方说是支持单容器多端口绑定到不同的 url 上的，但是我一直没试成功。