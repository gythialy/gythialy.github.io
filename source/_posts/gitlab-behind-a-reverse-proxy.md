---
title: 在反向代理后部署 GitLab
tags:
  - GitLab
  - Reverse Proxy
  - Docker-Compose
  - Docker Swarm
  - Traefik
categories: Notes
date: 2021-09-21 11:21:25
---

## 缘起

GitLab 官方提供的[镜像](https://hub.docker.com/r/gitlab/gitlab-ce)，如果是单独部署服务的话，相对而言还是非常简单的，通过 Let's Encrypt 自动获取 SSL 证书，其他的服务也可以运行在一个容器内，只要把数据库和文件存储放在宿主机中，然后挂载到容器内部即可。但是如果是在 GitLab 之前放置一个反向代理来实现 TLS 和负载均衡的话，默认的配置就不够了，需要额外的配置。


## 实现

- 配置 `gitlab.local.rb`
  <details>
  <summary>gitlab.local.rb</summary>
    {% gist gythialy/e2145d911de47b5b93cb88fb695e9276 gitlab.local.rb %}
  </details>

- 编写 `docker-compose.yml`
  <details>
    <summary>docker-compose.yml</summary>
    {% gist gythialy/e2145d911de47b5b93cb88fb695e9276 docker-compose.yml %}
  </details>

- 启动
  - 通过 Docker Compose 启动
    ```bash
    docker-compose up -d
    ```
  - 通过 Docker Swarm 启动
    ```bash
    docker stack rm gitlab && \
    docker stack deploy --prune --with-registry-auth --resolve-image=always -c docker-compose.yaml gitlab
    ```
 
## 参考链接

- [NGINX settings](https://docs.gitlab.com/omnibus/settings/nginx.html)
- [Omnibus gitlab-ce behind nginx reverse proxy – settings for Pages](https://forum.gitlab.com/t/omnibus-gitlab-ce-behind-nginx-reverse-proxy-settings-for-pages/53498)

`---EOF---`