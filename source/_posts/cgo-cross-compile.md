---
title: cgo 交叉编译
tags:
  - cgo
  - Golang
  - Docker
categories: Notes
date: 2019-04-19 17:43:43
---


## 缘起

Go 语言除了语法精炼、并发支持好外，还有一个优点就是可以调用 C 代码。可以直接在 Go 源代码里写 C 代码，也可以引 C 语言的外部库。这样在性能遇到瓶颈的地方可以重写，或者某些功能 Go 和第三方还缺失，但 C 语言有现成的库就可以直接用了。

官方 Cgo 这块目前有一篇 [博客](https://blog.golang.org/c-go-cgo) 和 [命令行文档](https://golang.org/cmd/cgo/)。比如 sqlite 的 golang 驱动 [go-sqlite3](https://github.com/mattn/go-sqlite3) 就是基于 Cgo 的实现。编译本地版本，Go 本身已经支持得非常好，基本不需要额外设置，直接通过 `go build` 编译即可，但是要想编译其他平台的二进制版本，就需要跨平台的 `$(CC)`, `$(CXX)` 支持。

## 方案

按照 Cgo 的编译思路，基本思路就是必须有一个跨平台的 C/C++ 编译器才可能实现交叉编译。

### macOS

- 安装编译器

  ```shell
  brew install FiloSottile/musl-cross/musl-cross
  brew install mingw-w64
  ```
- 编译

  在 `Make` 文件中指定 `$(CC)`,`$(GCC)` 为 `musl-cross` 提供的编译器，编译安装

> 注：此方案未验证，有兴趣的可以自行研究

<escape><!-- more --></escape>
### docker

要想一次配置，到处运行，自然而然想到的就是 docker。基本思路就是通过 docker 配置好基础编译器，然后根据不同的项目挂载代码目录进行编译。[karalabe/xgo](https://github.com/karalabe/xgo) 就做了类似的事情，非常满足我的需求。但是试用下来之后，发现几个问题：

- 不支持 `go mod` 模式
- 不能 (完整支持) 编译本地代码
- 不支持最新的 golang 版本
- 项目维护热度不足

无奈之下，只能自己 fork 下来定制了，自给自足。

修改如下：

- 重新发布了 docker 镜像到 [dockerhub](https://cloud.docker.com/u/goreng/repository/docker/goreng/xgo)
- 移除了暂时用不上的 Android/iOS 版本支持，以减少 docker 镜像大小
- 修改 `xgo` CLI 完整支持本地代码编译，`--pkg` 为子目录 `main.go` 所在路径
- 修改基础镜像的 `build.sh` 支持相对路径以及 `go mod` 模式
- 尝试了下使用 `gomobile` 编译 Android/iOS 版本，但是不如现有方式方便，暂时放到分支上了，后期根据情况看是否合并到主分支
- `go mod` 模式下自动挂载 `$GOPATH` 到容器中，减少编译时间

## 示例

- 安装修改版 `xgo`
  ```
  go get -u github.com/gythialy/xgo
  ```
- 编写 Makefile

  ```makefile
  MAINLDFLAGS="-X github.com/qlcchain/go-qlc/cmd/server/commands.Version=${SERVERVERSION} \
	-X github.com/qlcchain/go-qlc/cmd/server/commands.GitRev=${GITREV} \
	-X github.com/qlcchain/go-qlc/cmd/server/commands.BuildTime=${BUILDTIME} \
	-X github.com/qlcchain/go-qlc/cmd/server/commands.Mode=MainNet"

  SERVERMAIN = cmd/server/main.go

  gqlc-server:
    xgo --dest=$(BUILDDIR) -v --tags="mainnet sqlite_userauth" --ldflags=$(MAINLDFLAGS) --out=$(SERVERBINARY)-v$(SERVERVERSION)-$(GITREV) \
    --targets="windows-6.0/*,darwin-10.10/amd64,linux/amd64,linux/386,linux/arm64,linux/mips64, linux/mips64le" \
    --pkg=$(SERVERMAIN) .
  ```

  - `--dest`: 编译好的二进制文件存放目录
  - `--out`: 二进制名字
  - `--targets`: 编译支持的平台
  - `--pkg`:  `main` 函数不在根目录的情况，需要指定
  - `.`: 代码所在目录

  完整 Makefile

  ```make
  .PHONY: all clean build build-test confidant confidant-test
  .PHONY: gqlc-server gqlc-server-test
  .PHONY: gqlc-client
  .PHONY: deps

  # Check for required command tools to build or stop immediately
  EXECUTABLES = git go find pwd
  K := $(foreach exec,$(EXECUTABLES),\
          $(if $(shell which $(exec)),some string,$(error "No $(exec) in PATH)))

  # server
  SERVERVERSION ?= 1.2.6.6
  SERVERBINARY = gqlc
  SERVERTESTBINARY = gqlct
  SERVERMAIN = cmd/server/main.go

  # client
  CLIENTVERSION ?= 1.2.6.6
  CLIENTBINARY = gqlcc
  CLIENTMAIN = cmd/client/main.go

  BUILDDIR = build
  GITREV = $(shell git rev-parse --short HEAD)
  BUILDTIME = $(shell date +'%Y-%m-%d_%T')
  TARGET=windows-6.0/*,darwin-10.10/amd64,linux/amd64
  TARGET_CONFIDANT=linux/arm-7

  MAINLDFLAGS="-X github.com/qlcchain/go-qlc/cmd/server/commands.Version=${SERVERVERSION} \
    -X github.com/qlcchain/go-qlc/cmd/server/commands.GitRev=${GITREV} \
    -X github.com/qlcchain/go-qlc/cmd/server/commands.BuildTime=${BUILDTIME} \
    -X github.com/qlcchain/go-qlc/cmd/server/commands.Mode=MainNet"

  TESTLDFLAGS="-X github.com/qlcchain/go-qlc/cmd/server/commands.Version=${SERVERVERSION} \
    -X github.com/qlcchain/go-qlc/cmd/server/commands.GitRev=${GITREV} \
    -X github.com/qlcchain/go-qlc/cmd/server/commands.BuildTime=${BUILDTIME} \
    -X github.com/qlcchain/go-qlc/cmd/server/commands.Mode=TestNet"

  CLIENTLDFLAGS="-X github.com/qlcchain/go-qlc/cmd/client/commands.Version=${CLIENTVERSION} \
    -X github.com/qlcchain/go-qlc/cmd/client/commands.GitRev=${GITREV} \
    -X github.com/qlcchain/go-qlc/cmd/client/commands.BuildTime=${BUILDTIME}" \

  deps:
    go get -u golang.org/x/lint/golint
    go get -u github.com/gythialy/xgo
    go get -u github.com/git-chglog/git-chglog/cmd/git-chglog

  confidant:
    CGO_ENABLED=1 CC=/opt/gcc-linaro-5.3.1-2016.05-x86_64_arm-linux-gnueabihf/bin/arm-linux-gnueabihf-gcc GOARCH=arm GOARM=7 \
    GO111MODULE=on go build -tags "confidant" -ldflags $(MAINLDFLAGS) -v -i -o $(shell pwd)/$(BUILDDIR)/$(SERVERBINARY) $(shell pwd)/$(SERVERMAIN)
    @echo "Build $(SERVERBINARY) done."
    @echo "Run \"$(shell pwd)/$(BUILDDIR)/$(SERVERBINARY)\" to start $(SERVERBINARY)."
    CGO_ENABLED=1 CC=/home/lichao/ppr_cross/gcc-linaro-5.3.1-2016.05-x86_64_arm-linux-gnueabihf/bin/arm-linux-gnueabihf-gcc GOARCH=arm GOARM=7 \
    GO111MODULE=on go build -ldflags $(CLIENTLDFLAGS) -v -i -o $(shell pwd)/$(BUILDDIR)/$(CLIENTBINARY) $(shell pwd)/$(CLIENTMAIN)
    @echo "Build $(CLIENTBINARY) done."
    @echo "Run \"$(shell pwd)/$(BUILDDIR)/$(CLIENTBINARY)\" to start $(CLIENTBINARY)."

  confidant-test:
    CGO_ENABLED=1 CC=/opt/gcc-linaro-5.3.1-2016.05-x86_64_arm-linux-gnueabihf/bin/arm-linux-gnueabihf-gcc GOARCH=arm GOARM=7 \
    GO111MODULE=on go build -tags "confidant testnet" -ldflags $(MAINLDFLAGS) -v -i -o $(shell pwd)/$(BUILDDIR)/$(SERVERBINARY) $(shell pwd)/$(SERVERMAIN)
    @echo "Build $(SERVERBINARY) done."
    @echo "Run \"$(shell pwd)/$(BUILDDIR)/$(SERVERBINARY)\" to start $(SERVERBINARY)."
    CGO_ENABLED=1 CC=/home/lichao/ppr_cross/gcc-linaro-5.3.1-2016.05-x86_64_arm-linux-gnueabihf/bin/arm-linux-gnueabihf-gcc GOARCH=arm GOARM=7 \
    GO111MODULE=on go build -ldflags $(CLIENTLDFLAGS) -v -i -o $(shell pwd)/$(BUILDDIR)/$(CLIENTBINARY) $(shell pwd)/$(CLIENTMAIN)
    @echo "Build $(CLIENTBINARY) done."
    @echo "Run \"$(shell pwd)/$(BUILDDIR)/$(CLIENTBINARY)\" to start $(CLIENTBINARY)."

  build:
    GO111MODULE=on go build -ldflags $(MAINLDFLAGS) -v -i -o $(shell pwd)/$(BUILDDIR)/$(SERVERBINARY) $(shell pwd)/$(SERVERMAIN)
    @echo "Build $(SERVERBINARY) done."
    @echo "Run \"$(shell pwd)/$(BUILDDIR)/$(SERVERBINARY)\" to start $(SERVERBINARY)."
    GO111MODULE=on go build -ldflags $(CLIENTLDFLAGS) -v -i -o $(shell pwd)/$(BUILDDIR)/$(CLIENTBINARY) $(shell pwd)/$(CLIENTMAIN)
    @echo "Build $(CLIENTBINARY) done."
    @echo "Run \"$(shell pwd)/$(BUILDDIR)/$(CLIENTBINARY)\" to start $(CLIENTBINARY)."

  build-test:
    GO111MODULE=on go build -tags "testnet" -ldflags $(TESTLDFLAGS) -v -i -o $(shell pwd)/$(BUILDDIR)/$(SERVERBINARY) $(shell pwd)/$(SERVERMAIN)
    @echo "Build test server done."
    @echo "Run \"$(BUILDDIR)/$(SERVERBINARY)\" to start $(SERVERBINARY)."
    GO111MODULE=on go build -ldflags $(CLIENTLDFLAGS) -v -i -o $(shell pwd)/$(BUILDDIR)/$(CLIENTBINARY) $(shell pwd)/$(CLIENTMAIN)
    @echo "Build test client done."
    @echo "Run \"$(BUILDDIR)/$(CLIENTBINARY)\" to start $(CLIENTBINARY)."

  all: gqlc-server gqlc-server-test gqlc-client

  clean:
    rm -rf $(shell pwd)/$(BUILDDIR)/

  gqlc-server:
    xgo --dest=$(BUILDDIR) --ldflags=$(MAINLDFLAGS) --out=$(SERVERBINARY)-v$(SERVERVERSION)-$(GITREV) \
      --targets=$(TARGET) --pkg=$(SERVERMAIN) .
    xgo --dest=$(BUILDDIR) --tags="confidant" --ldflags=$(MAINLDFLAGS) --out=$(SERVERBINARY)-confidant-v$(SERVERVERSION)-$(GITREV) \
    --targets=$(TARGET_CONFIDANT) --pkg=$(SERVERMAIN) .

  gqlc-server-test:
    xgo --dest=$(BUILDDIR) --tags="testnet" --ldflags=$(TESTLDFLAGS) --out=$(SERVERTESTBINARY)-v$(SERVERVERSION)-$(GITREV) \
    --targets=$(TARGET) --pkg=$(SERVERMAIN) .
    xgo --dest=$(BUILDDIR) --tags="confidant testnet" --ldflags=$(TESTLDFLAGS) --out=$(SERVERTESTBINARY)-confidant-v$(SERVERVERSION)-$(GITREV) \
    --targets=$(TARGET_CONFIDANT) --pkg=$(SERVERMAIN) .

  gqlc-client:
    xgo --dest=$(BUILDDIR) --ldflags=$(CLIENTLDFLAGS) --out=$(CLIENTBINARY)-v$(CLIENTVERSION)-$(GITREV) \
    --targets="windows-6.0/amd64,darwin-10.10/amd64,linux/amd64" \
    --pkg=$(CLIENTMAIN) .
  ```

- 编译

  ```shell
  make clean gqlc-server
  ```

## 结语

虽然通过 docker 的方式暂时解决了 cgo 的跨平台编译，但是还是挺折腾的，编译速度也不是特别理想。希望后期 Go 官方能有更完整的交叉的编译方案。

## 参考链接

- [EASY WINDOWS AND LINUX CROSS-COMPILERS FOR MACOS](https://blog.filippo.io/easy-windows-and-linux-cross-compilers-for-macos/)
- [richfelker/musl-cross-make](https://github.com/richfelker/musl-cross-make)
- [karalabe/xgo](https://github.com/karalabe/xgo)


`---EOF---`