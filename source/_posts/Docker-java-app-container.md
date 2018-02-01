---
title: Docker Java 应用镜像
date: 2018-02-01 16:36:34
categories: Notes
tags:
- Docker
- Java
---

最近一个项目中由于使用了不同的版本的 JDK 导致兼容问题，故把不同的应用通过 Docker 分别包装了一下，为了减少镜像大小，选用基于 [[AlpineLinux](http://alpinelinux.org/)](http://alpinelinux.org/) 的[镜像](https://github.com/anapsix/docker-alpine-java)作为基础镜像。

主要完成了下面几件事情：

- 设置时区为北京时间
- 添加 `docker-entrypoint.sh`  做基础的环境变量检查（可选）
- 配置 `VOLUME`，方便通过挂载不同的目录复用
- 启动 Java 程序

### 构建镜像
新建文件夹，名字任务，包含下面两个文件

- `Dockerfile` 

  ```dockerfile
  FROM anapsix/alpine-java
  LABEL maintainer "gythialy@outlook.com"
  COPY docker-entrypoint.sh /usr/local/bin/
  ENV TZ=Asia/Shanghai \
      PATH=/usr/local/bin/:$PATH 
  RUN chmod +x /usr/local/bin/docker-entrypoint.sh \
      && ln -s /usr/local/bin/docker-entrypoint.sh /entrypoint.sh \
      && apk add --no-cache tzdata \
      && rm -rf /var/cache/apk/* 
  ENTRYPOINT ["docker-entrypoint.sh"]
  VOLUME [ "/opt/app" ]
  CMD ["sh", "-c", "/opt/app/${LIB_PATH}"]
  ```
- `docker-entrypoint.sh` 

  ```shell
  #!/bin/bash
  set -eo pipefail
  shopt -s nullglob

  if [ -z "$LIB_PATH" ]; then
      echo >&2 'You need to specify LIB_PATH'
      exit 1
  fi

  exec "$@"
  ```
> 注： 这不是必须的，这边只是简单检查了下 `LIB_PATH` 是不是指定了

### 构建镜像

```shell
# 构建镜像
docker build -t gythialy/java-app . 

# 推送到私有仓库
docker tag gythialy/java-app hub.vking.io/java-app:alpine 
docker push hub.vking.io/java-app:alpine 
```

### 构建 Java 应用

[Gradle](https://gradle.org/) 构建出的 Java 程序目录如下，通过 `bin/jx-ws` 启动程序。 
```
.
├── bin
│   ├── jx-ws
│   ├── jx-ws.bat
│   ├── logs
│   │   ├── 2018-01
│   │   │   └── ws-2018-01-31-1.log
│   │   └── ws.log
│   └── ws.json
└── lib
    └── jx-ws-1.1.1-all.jar

```
### 构建并启动容器

```shell
#!/bin/bash

set -e

app_name=java-test

docker stop $app_name || true \
&& docker rm $app_name || true \
&& docker run --name $app_name -d \
    --restart always \
    -e LIB_PATH=bin/jx-ws \
    -v /home/vking/wks/jx-ws/jx-ws-shadow-1.1.1:/opt/app \
    hub.vking.io/java-app:alpine
```


`---EOF---`