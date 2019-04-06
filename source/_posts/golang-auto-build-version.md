---
title: Golang 编译时自动更新版本号
tags:
  - Golang
  - DevOps
categories: Notes
date: 2019-04-06 11:23:37
---

## 需求

编译 Golang 程序时自动更新版本号，主版本号手动指定，子版本号通过 Git rev 和编译时间自动更新

## 实现方法

### Go Linker

在 [go tool link](https://golang.org/cmd/link/) 中有选项可以设置在编译时设置字符串或者未初始化的变量

>-X importpath.name=value
	Set the value of the string variable in importpath named name to value.
	This is only effective if the variable is declared in the source code either uninitialized
	or initialized to a constant string expression. -X will not work if the initializer makes
	a function call or refers to other variables.
	Note that before Go 1.5 this option took two separate arguments.

#### example1

版本号等变量定义在 `main.go` 中

- 定义变量

``` go
package main

import "fmt"

var (
	version   = ""
	gitRev    = ""
	buildTime = ""
)

func main() {
	fmt.Printf("example1: %s-%s.%s\n", version, gitRev, buildTime)
}
```
- 编译

    通过 `-ldflags` 指定需要修改的值，示例中 `${VERSION}` 为 `0.0.1`

    ```shell
    go build -ldflags "-X main.version=${VERSION} -X main.gitRev=$(git rev-parse --short HEAD) -X main.buildTime=$(date +'%Y-%m-%d_%T')" -o build/example1
    ```

- 执行

    ```
    ➜ ./build/example1
    example1: 0.0.1-1dc7d91.2019-04-06_10:54:30
    ```

#### example2

在生成环境中估计没多少是这么定义变量的，下面来个实际点的示例。假设配置在 `config` 包下的 `version.go`, 目录结构如下：

```
.
├── build
│   └── example2
├── config
│   └── version.go
├── go.mod
└── main.go
```

- 定义变量 (`version.go`)
   
    ```go
    package config

    var (
        Version   = ""
        GitRev    = ""
        BuildTime = ""
    )
    ```

- 调用 (`main.go`)

    ``` go
    package main

    import (
        "fmt"
        "github.com/gythialy/autoversion/config"
    )

    func main() {
        fmt.Printf("example2: %s-%s.%s\n", config.Version, config.GitRev, config.BuildTime)
    }
    ```
- 模块定义 (`go.mod`)
   
    ```
    module github.com/gythialy/autoversion

    go 1.12
    ```

- 查找导入路径

    对于不在 `main` 包下的变量，我们需要先知道其导入路径。此步骤可以通过 `go tool nm` 实现，完整示例如下：

    ```shell
    ➜ go build -o build/example2
    ➜ go tool nm build/example2 | grep -i version
    11737c0 B github.com/gythialy/autoversion/config.BuildTime
    11737d0 B github.com/gythialy/autoversion/config.GitRev
    11737e0 B github.com/gythialy/autoversion/config.Version
    116d400 D runtime.buildVersion
    118ef0c B runtime.processorVersionInfo
    ```

    根据查找的信息可知，import path 为 `github.com/gythialy/autoversion/config` 下面就可以更新此路径下的变量了

- 再次编译

    通过 `-ldflags` 指定需要修改的值，示例中 `${VERSION}` 为 `0.0.1`

    ```shell
    go build -ldflags "-X github.com/gythialy/autoversion/config.Version=${VERSION} \
    -X github.com/gythialy/autoversion/config.GitRev=$(git rev-parse --short HEAD) \
    -X github.com/gythialy/autoversion/config.BuildTime=$(date +'%Y-%m-%d_%T')" -o build/example2
    ```

- 执行

    ```shell
    ➜ ./build/example2
    example2: 0.0.1-cce7ea2.2019-04-06_10:53:03
    ```

### echo 大法

基本思路就是预先定义出变量，在编译时通过 `echo` 覆盖文件中内容。

- 定义变量

    ```go
    package goqlc

    const GITREV = "2fd25d2"
    const VERSION = "0.0.5"
    const BUILDTIME = "2019-02-14_18:02:35"
    const MAINNET = true
    ```

- 编译时覆盖文件

    ```makefile
    update-version:
        @echo "package goqlc" > $(shell pwd)/version.go
        @echo  "">> $(shell pwd)/version.go
        @echo "const GITREV = \""$(GITREV)"\"" >> $(shell pwd)/version.go
        @echo "const VERSION = \""$(VERSION)"\"" >> $(shell pwd)/version.go
        @echo "const BUILDTIME = \""$(BUILDTIME)"\"" >> $(shell pwd)/version.go
        @echo "const MAINNET = true" >> $(shell pwd)/version.go
    ```

## 小结

通过 go link 只可以更新 `string` 类型的变量，但是支持 makefile 中多个任务进行。`echo` 覆盖文件更灵活，对变量类型没有限制，但是通过 `make -j` 指定多任务同时编译时，会有问题。所以选择哪种办法，可根据自己使用场景自行决定。

`---EOF---`