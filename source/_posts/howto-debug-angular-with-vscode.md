---
title: 使用 Visual Studio Code 调试 Angular 工程
tags:
  - VSCode
  - Angular
  - Chrome
categories: Notes
date: 2018-07-22 10:58:46
---


## 准备工作

VSCode 安装 [Debugger for Chrome](https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome)

## 配置 

在 Debug 试图增加下面的配置

```json
{
  // Use IntelliSense to learn about possible attributes.
  // Hover to view descriptions of existing attributes.
  // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
  "version": "0.2.0",
  "configurations": [{
    "name": "Launch localhost with sourcemaps",
    "type": "chrome",
    "request": "launch",
    "url": "http://localhost:4200",
    "sourceMaps": true,
    "webRoot": "${workspaceRoot}",
    "trace": true,
    "userDataDir": "${workspaceRoot}/.vscode/chrome",
    // "runtimeExecutable": "/opt/google/chrome/google-chrome"
  }]
}
```

需要注意的是 `sourceMaps` 一定要设成 `true`, 如果找不到 chrome 的安装路径，可以手动通过 `runtimeExecutable` 设置，比如我 Manjarro Linux 下的路径为 `/opt/google/chrome/google-chrome`

## 启动

一切配置好之后，在 Angular 工程目录通过 `ng serve` 启动项目，然后就可以打断点，在 Debug 试图通过 `Launch localhost with sourcemaps` 这个配置开始调试了。


`---EOF---`