---
title: 启用 Docker TPC 连接
tags:
  - Docker
  - Tips
categories: Notes
date: 2023-02-15 13:11:25
---


[原始问题](https://github.com/moby/moby/issues/25471)，一言以蔽之就是在 `daemon.json` 增加 Host 之后，服务会启动失败。

解决方案:

- 在 `/etc/systemd/system/docker.service.d/simple_dockerd.conf` 中增加
  ```
  [Service]
  ExecStart=
  ExecStart=/usr/bin/dockerd
  ```
- 在 `/etc/docker/daemon.json` 中增加 
  ```
  {"hosts": ["tcp://0.0.0.0:2375", "unix:///var/run/docker.sock"]}
  ```
- 重启`docker`服务
  ```
  systemctl daemon-reload && 
  systemctl restart docker.service
  ```
- 检查`docker`服务状态
  ```
  ❯ systemctl status docker.service
  ● docker.service - Docker Application Container Engine
      Loaded: loaded (/lib/systemd/system/docker.service; enabled; vendor preset: enabled)
      Drop-In: /etc/systemd/system/docker.service.d
              └─simple_dockerd.conf
      Active: active (running) since Wed 2023-02-15 11:49:01 CST; 1h 18min ago
  TriggeredBy: ● docker.socket
        Docs: https://docs.docker.com
    Main PID: 1193 (dockerd)
        Tasks: 350
      Memory: 198.1M
          CPU: 11.520s
      CGroup: /system.slice/docker.service
              ├─1193 /usr/bin/dockerd
  ```
- 检查TCP 连接
  ```
  curl -X GET http://localhost:2375/containers/json?all=1
  ```

`---EOF---`