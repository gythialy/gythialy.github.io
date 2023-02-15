---
title: Watchtower 通过 telegram 发通知
tags:
  - Docker
  - Docker-Compose
  - Telegram
  - Watchtower
  - Tips
categories: Notes
date: 2023-02-15 13:51:21
---

通过 `WATCHTOWER_NOTIFICATION_URL` 定义 Telegram 的[通知信息](https://containrrr.dev/shoutrrr/v0.6/services/telegram/)，当然了也可以定义其他的通知方式。底层是通过 [shoutrrr](https://containrrr.dev/shoutrrr/v0.6/services/overview/) 实现的，只要 shoutrrr 支持的方式这里都可以用。

```yml
version: '3.5'
services:  
  watchtower:
    image: containrrr/watchtower
    container_name: watchtower
    restart: unless-stopped
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - TZ=Asia/Shanghai
      - WATCHTOWER_LIFECYCLE_HOOKS=True
      - WATCHTOWER_NOTIFICATIONS=shoutrrr
      - WATCHTOWER_NOTIFICATION_URL=telegram://token@telegram?chats=@channel-1,chat-id-1
      - WATCHTOWER_DEBUG=true
      - WATCHTOWER_CLEANUP=true
      # - WATCHTOWER_SCHEDULE=0 0 20 * * 0
      - WATCHTOWER_POLL_INTERVAL=43200
    command: reference filebrowser
```

- 通过 `@BotFather` 创建自己的通知机器人，并获取 `token`
- 通过 `@RawDataBot` 获取 Chat ID

`---EOF---`