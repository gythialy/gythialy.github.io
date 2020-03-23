---
title: Docker 容器内以非 root 用户运行
categories: Notes
date: 2020-03-23 10:08:15
tags:
- Docker
---

## 缘起

在 Dockerfile 中，如果我们不显式指明用户，进行权限处理，那么默认的 Dockerfile 生成的镜像，在运行时会以 root 身份进入 ENTRYPOINT，进而执行 CMD。因此，以 root 身份启动 container 是一件很危险的事情。尽管，docker 容器内的 root 与宿主 host 本身的 root 并不一定具有一样的权限，但是在容器内部的 root 拥有和宿主机一样的 UID(`UID 0`)。如果以 priviledge 的方式运行 container，那么两者将会一样，从而产生巨大的安全隐患。

简而言之，出于安全的考虑，需要在 Dockerfile 的 ENTRYPOINT 之前，也就是运行 application 之前，进行用户切换。

## 示例

```Dockerfile
# Build gqlc in a stock Go builder container
FROM qlcchain/go-qlc-builder:latest as builder

ARG BUILD_ACT=build

COPY . /qlcchain/go-qlc
RUN cd /qlcchain/go-qlc && make clean ${BUILD_ACT}

# Pull gqlc into a second stage deploy alpine container
FROM alpine:3.11.3
LABEL maintainer="developers@qlink.mobi"

ENV QLCHOME /qlcchain

RUN apk --no-cache add ca-certificates && \
    addgroup qlcchain && \
    adduser -S -G qlcchain qlcchain -s /bin/sh -h "$QLCHOME" && \
    chown -R qlcchain:qlcchain "$QLCHOME"

USER qlcchain

WORKDIR $QLCHOME

COPY --from=builder /qlcchain/go-qlc/build/gqlc /usr/local/bin/gqlc

EXPOSE 9734 9735 9736

ENTRYPOINT ["gqlc"]

VOLUME ["$QLCHOME"]
```

主要思路如下：
- 一阶段构建需要执行的 app 可执行程序
- 二阶段创建用户及用户组，拷贝一阶段的编译出来的文件
- 切换到刚创建出来的用户，执行 `ENTRYPOINT` 和 `CMD`

`---EOF---`