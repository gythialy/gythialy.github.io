---
title: 远程调试 golang 应用
date: 2021-04-20 14:33:26
categories: Notes
tags:
  - Delve
  - Golang
  - Docker
---

## 步骤
- STEP1: 编写 Dockerfile

  ```docker
  FROM golang:1.16 AS build-env

  # Build Delve

  RUN go get github.com/go-delve/delve/cmd/dlv

  COPY . /app
  WORKDIR /app

  RUN go mod download

  EXPOSE 40000

  ENTRYPOINT ["dlv", "--listen=:40000", "--headless=true", "--api-version=2", "--accept-multiclient", "debug", "/app/cmd/"]

  ```

  > 注: 这里是把代码全部复制到进行中，也可以只复制编译好的文件。如果是编译好的文件，编译的时候需要设置 `-gcflags "all=-N -l"`

- STEP2: 编译 docker 镜像

  ```bash
  docker build -f docker/Dockerfile.debug -t qlcchain/go-qlc:debug  .
  ```
<escape><!-- more --></escape>

- STEP3: 启动 docker 容器并绑定端口

  ```bash
  docker run --rm -it -p 40000:40000 qlcchain/go-qlc:debug \
   --build-flags="-tags=testnet" \
   --  --configParams="rpc.rpcEnabled=true;p2p.discovery.mDNSEnabled=false"
  ```

  > 注: 通过 `--build-flags` 指定编译参数； `--` 指定传给 app 的参数

- STEP4: 在 Goland 中连接容器
  ![](dlv.png)
  > 注: 除了 Goland 外，还有一些其他的 [GUI](https://github.com/go-delve/delve/blob/master/Documentation/EditorIntegration.md) 可以选择

## 参考链接

- [delve](https://github.com/go-delve/delve)

`---EOF---`
