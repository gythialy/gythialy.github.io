---
title: goreleaser 支持 cgo 交叉编译
tags:
  - cgo
  - Golang
  - Docker
  - GoReleaser
  - Cross Compilation
categories: Notes
date: 2019-10-08 16:41:54
---


## 思路

在 {% post_link cgo-cross-compile cgo 交叉编译 %} 中通过 xgo + Docker 实现 Cgo 的交叉编译。由于原版 xgo 不支持 go mod，而且作者貌似也没支持的打算，所有我自己维护了一个 [xgo](https://github.com/gythialy/xgo)。使用了一段时间下来看，除了编译速度有点慢意外，其他还好。这也是跟我们的使用方式有关，我们需要根据不同的 `tags` 来编译不不同的版本，xgo 每次编译都要构建一个 Docker 实例，然后下载引用的库等等一大堆重复操作，导致整个编译时间拉长。

既然有很多重复操作，那就换个思路，只构建一个实例，把编译环境准备好，然后在这个实例中把要编译的内容，一次编译出来。[goreleaser](https://github.com/goreleaser/goreleaser)，支持编译发布 golang 的二进制文件，同时也支持发布 Docker 镜像，但是这不是重点，这里不再赘述。

## 实践

由于需要支持 macOS 就需要安装 OSX 的 SDK，在 xgo 是自己构建的基础镜像。这里通过 Docker 官方提供的 [golang-cross](https://github.com/docker/golang-cross) 来作为基础镜像支持 macOS 平台，顺便规避一下版权的问题。在此基础上安装 mingw 支持 Windows x64/i386，以及 arm-gcc 等。剩下的就是一些常规操作了，比如安装 goreleaser，更新 golang 运行时等，完整的 [Dockerfile](https://github.com/gythialy/golang-cross/blob/master/Dockerfile)

## 使用 

```bash
docker run --rm --privileged \
  -v $PWD:/go/src/github.com/qlcchain/go-qlc \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -w /go/src/github.com/qlcchain/go-qlc \
  goreng/golang-cross goreleaser --snapshot --rm-dist
```

当然也是可以添加到 makefile 中的

```make
snapshot:
	docker run --rm --privileged \
    -v $(CURDIR):/go-qlc \
    -v /var/run/docker.sock:/var/run/docker.sock \
	-v $(GOPATH)/src:/go/src \
    -w /go-qlc \
    goreng/golang-cross:$(GO_BUILDER_VERSION) \
    goreleaser --snapshot --rm-dist
```

使用的时候，只需要执行 `make snapshot` 即可。

## 小结

使用新的镜像之后，整体编译速度有了比较大幅度的提升，得益于 goreleaser 对打包的支持，原来自己实现 shell 打包生成 checksum 的操作，都有现成的支持。


`---EOF---`