---
title: 基于 Cloudflare 的 Docker 代理
tags:
  - Cloudflare
  - Docker
  - Registry
  - Proxy
categories: Notes
date: 2024-06-08 12:42:46
---

## 前提

需要一个域名，并且域名托管在 Cloudflare 上。

## 部署

1. 克隆 https://github.com/gythialy/cloudflare-docker-proxy 到本地
2. 替换 `example.com` 为自己的域名
  ```bash
  sed -i 's/example.com/${your_domain}/g' src/index.js
  sed -i 's/example.com/${your_domain}/g' wrangler.toml
  # for macOS
  # sed -i '' 's/example.com/${your_domain}/g' src/index.js
  # sed -i '' 's/example.com/${your_domain}/g' wrangler.toml
  ```

3. `yarn` 安装依赖
4. `npx wrangler deploy` 部署

## 使用

- 拉取 `busybox:stable`
  ```bash
  # docker pull busybox:stable
  docker pull docker.example.com/library/busybox:stable
  ```
- 设置 docker registry 镜像
  ```bash
  sudo mkdir -p /etc/docker
  sudo tee /etc/docker/daemon.json <<-EOF
  {
      "registry-mirrors": [
          "https://docker.example.com",
      ]
  }
  EOF
  sudo systemctl daemon-reload
  sudo systemctl restart docker
  # 拉取镜像
  docker pull busybox:stable
  ```
  > 注：`docker.example.com` 都需要替换为自己的域名。

`---EOF---`
