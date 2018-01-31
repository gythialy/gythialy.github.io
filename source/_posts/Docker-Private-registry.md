---
title: 搭建 Docker 私有镜像
date: 2018-01-30 09:18:52
categories: Notes
tags:
- Docker
- Registry
---
### 介绍

目前部署私有 Docker Registry 有下面几个选择

- [Vmware Harbor](https://github.com/vmware/harbor)
- [官方 Registry ](https://docs.docker.com/registry/)
- [Portus](http://port.us.org/)
- [nexus](https://www.sonatype.com/nexus-repository-oss)

官方 registry 比较简单，没有 UI 界面；Portus 其实也是基于官方 registry ，可以理解为官方增强版，同时提供了[部署的示例](https://github.com/SUSE/Portus/tree/master/examples)；Harbor，nexus 等都比较重量级，部署比较麻烦，这里暂时不考虑。由于我们的使用场景非常简单，所有选用官方 registry 镜像如何部署私有服务器。下面简单介绍下如何配置。

<escape><!-- more --></escape>

### 官方 Registry

- 配置，[详细配置介绍](https://docs.docker.com/registry/configuration/#list-of-configuration-options)
  ```yml
  version: 0.1
  log:
    accesslog:
      disabled: true
    level: debug
    formatter: text
    fields:
      service: registry
      environment: staging
  storage:
    delete:
      enabled: true
    cache:
      blobdescriptor: inmemory
    filesystem:
      rootdirectory: /var/lib/registry
  http:
    addr: :5000
    headers:
      X-Content-Type-Options: [nosniff]
  health:
    storagedriver:
      enabled: true
      interval: 10s
  threshold: 3
  ```
- 启动

  ``` shell
  #!/bin/bash

  set -e

  registry_id=registry

  docker stop $registry_id || true && docker rm $registry_id || true\
  && docker run --name $registry_id -d\
      --restart always \
      --network registry-net \
      -p 5000:5000 \
      -v /srv/docker/registry/config.yml:/etc/docker/registry/config.yml \
      -v /srv/docker/registry/data:/var/lib/registry \
      registry

  ```

### 配置 UI 

由于官方镜像只有后台，提供了一组 RESTful API，UI 需要单独配置，可以选 [docker-registry-web](https://github.com/mkuchin/docker-registry-web)，[docker-registry-ui](https://github.com/Joxit/docker-registry-ui)，这里就以 `docker-registry-ui` 为例，操作都大同小异。

  ```shell
  #!/bin/bash

  set -e

  app_id=registry-ui

  docker stop $app_id || true && docker rm $app_id || true\
  && docker run --name $app_id -d\
      --restart always \
      --network registry-net \
      -p 8088:80 \
      -e REGISTRY_URL=http://registry:5000 \
      -e DELETE_IMAGES=true \
      joxit/docker-registry-ui:static
  ```
### 配置反向代理

如果需要通过 nginx 配置反向代理的话，需要注意添加 `client_max_body_size` 和 `chunked_transfer_encoding` 设置，具体参考 {% post_link Docker-nginx-reverse-proxy %}。

```nginx
upstream hub.vking.io {
    # jenkins
    server registry:5000;
}

server
{
    server_name hub.vking.io;
     # disable any limits to avoid HTTP 413 for large image uploads
    client_max_body_size 0;

    # required to avoid HTTP 411: see Issue #1486 (https://github.com/moby/moby/issues/1486)
    chunked_transfer_encoding on;
    
    listen 80;
   
    location / {
        proxy_pass http://hub.vking.io;
    }
    access_log /var/log/nginx/access.log vhost;
}
```


### 参考资料
- https://docker_practice.gitee.io/repository/registry.html
- https://docs.docker.com/registry/

`---EOF---`
