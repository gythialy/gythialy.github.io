---
title: 基于 Cloudflare Tunnel 进行内网穿透
tags:
  - Cloudflare
  - HomeLab
  - Tunnel
  - Tips
category: Notes
date: 2024-05-21 16:44:53
---


Cloudflare Tunnel 是一种安全、可靠的内网穿透解决方案，允许您将内部网络中的应用程序和服务暴露到公共互联网。以下是使用 Cloudflare Tunnel 进行内网穿透的步骤：

**1. 准备工作**

* Cloudflare 账号: 需要一个 [Cloudflare](https://www.cloudflare.com) 账号，最好是**绑定信用卡然后开通免费版本**的服务。
* Cloudflare Tunnel 应用程序: 下载并安装 Cloudflare Tunnel 应用程序。您可以从 [tunnel](https://www.cloudflare.com/products/tunnel/) 获取最新版本。
* 内网服务: 确保您的内网服务正在运行，并且您知道服务的端口号。
* 域名: 您需要一个域名来访问您的内网服务。您可以使用您自己的域名，也可以使用 Cloudflare 提供的免费子域名。

**2. 配置 Cloudflare Tunnel**

* 创建 Tunnel: 在 Cloudflare Tunnel 应用程序中，创建一个新的 Tunnel。
* 配置 Tunnel: 在 Tunnel 配置中，您需要指定以下信息：
    * Tunnel 名称: 为您的 Tunnel 命名。
    * 域名: 指定您要使用的域名。
    * 服务端口: 指定您内网服务的端口号。
    * 命令: 指定启动您的内网服务的命令。
* 生成证书: Cloudflare Tunnel 将自动生成一个证书，用于安全连接您的内网服务。

**3. 示例:**

假设您的内网服务是一个运行在端口 `2001` 上的 Web 服务器，您的域名是 `example.com`。以下是使用 Cloudflare Tunnel 进行内网穿透的步骤：

1. 创建 Tunnel: 在 Cloudflare Tunnel 应用程序中，创建一个名为 `HomeLab-tunnel` 的 Tunnel，并获取 tunnel 的 token。
2. 配置 Hostname: 在 Tunnel 配置中，指定以下信息：
    * 域名: `whoaim.example.com`
    * 服务: `http://whoami:2001`
3. 部署 Tunnel: 在您的内网服务器上安装并启动 Cloudflare Tunnel 应用程序。
4. 验证连接: 使用 `https://whoaim.example.com` 访问您的 Web 服务器，确保连接正常。

    ```yaml
    version: '3.9'

    services:
        whoami:
            image: traefik/whoami
            command:
                # It tells whoami to start listening on 2001 instead of 80
                - --port=2001
                - --name=iamfoo
            networks:
                - nginx-proxy

        tunnel:
            container_name: cloudflared-tunnel
            image: cloudflare/cloudflared:2024.5.0
            user: root
            restart: unless-stopped
            read_only: true
            volumes:
                - ./cloudflared:/root/.cloudflared/
            command: tunnel --no-autoupdate run --token ${TUNNEL_TOKEN}
            networks:
                - nginx-proxy

    networks:
        nginx-proxy:
            external: true
    ```

注： 这里是用的是在线配置的方式，也可以通过[离线配置](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/configure-tunnels/local-management/)的方式，配置文件放到 `cloudflared` 目录即可。

**4. 总结:**

Cloudflare Tunnel 提供了一种安全、可靠的内网穿透解决方案，可以帮助您轻松地将内部网络中的应用程序和服务暴露到公共互联网。通过遵循上述步骤，您可以轻松地配置 Cloudflare Tunnel，并享受其带来的便利和安全性。

```---EOF---```