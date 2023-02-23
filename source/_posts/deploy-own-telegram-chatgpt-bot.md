---
title: 部署私有 chatGPT Telegram 机器人
tags:
  - chatGPT
  - Telegram
  - Docker-Compose
  - Bot
categories: Notes
date: 2023-02-23 13:04:34
---


## 准备工作

- 注册 chatGPT 账户
- 注册 Telegram Bot，通过 @BotFather 创建，并获取 token
- 获取 Telegram Chat ID， 通过 @userinfobot 查询
- 获取 [Access Token](https://github.com/transitive-bullshit/chatgpt-api#access-token)
- 准备[反代服务](https://github.com/transitive-bullshit/chatgpt-api#reverse-proxy)，可以选择别人提供的，不是一定要自己部署

## 运行

- 克隆 [chatgpt-telegram-bot](https://github.com/RainEggplant/chatgpt-telegram-bot)
- 准备配置文件 `local.json`
  
  ```json
  {
    "debug": 1,
    "bot": {
      "token": "telegram bot token",
      "groupIds": [], 
      "userIds": [],
      "chatCmd": "/chat"
    },
    "api": {
      "type": "unofficial", 
      "unofficial": {
        "accessToken": "chatGPT access token",
        "apiReverseProxyUrl": "https://chat.duti.tech/api/conversation",
        "model": ""
      }
    }
  }
  ```
  - `userIds` 为数字，比如 `114797892`，可指定多个，如果不指定，就所有人都可用，`groupIds`同理，建议配置上
  - `accessToken` 会有过期时间，暂时没特别好的自动更新的办法，主要是有 cloudflare 验证
- 修改`docker-compose.yml`，并构建镜像
  
  ```yaml
  version: '3'

  services:
    chatgpt:
      image: chatgpt-telegram-bot
      container_name: chatgpt
      build: .
      restart: unless-stopped
      volumes:
        - ./local.json:/app/config/local.json
      networks:
        - nginx-proxy
  
  networks:
    nginx-proxy:
      external: true
  ```
  `docker-compose build` 构建镜像
- 运行 
  `docker-compose up -d` 运行
- 查看 log
  `docker-compose logs -f --tail 100 chatgpt`

  如无意外的话，应该会输出类似的日志

  ```
  > node --experimental-loader=extensionless dist/index.js

  (node:42) ExperimentalWarning: Custom ESM Loaders is an experimental feature. This feature could change at any time
  (Use `node --trace-warnings ...` to show where the warning was created)
  2/23/2023, 3:06:13 AM 🔮 ChatGPT API has started...
  2/23/2023, 3:06:14 AM 🤖 Bot @xxx_bot has started...
  ```
- 在 Telegram 中添加刚才创建的机器人，通过 `/chat 聊天内容` 开始，`/help` 会显示支持的指令


`---EOF---`