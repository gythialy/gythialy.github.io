---
title: 从 ColorOS 镜像中提取 apk
tags:
  - macOS
  - OnePlus
  - Android
  - ColorOS
  - OxygenOS
  - Tips
categories: Notes
date: 2024-06-05 18:05:02
---


## 前言

OxygenOS 中没国产市场的 app，现在好多 app 并没有在 Google Play 发布。因此可以从 ColorOS 镜像中提取出来，方便安装。

## 准备

- 根据 [在 macOS 平台把一加 12 ColorOS 转换为国际版](howto-convert-from-ColorOS-to-Global-On-Chinese-Oneplus-12) 中的方法，把 从 ColorOS 的`payload.bin` 中提取 `my_`开头的 img 文件。
- 安装[OrbStack](https://orbstack.dev/)，然后创建一个 Ubuntu 虚拟机
  ```bash
  orb create ubuntu my-ubuntu # 创建虚拟机
  orb -m my-ubuntu-u root # SSH 到虚拟机
  ```

## 提取

```bash
mkdir -p /mnt/my_heytap # 创建挂载点
mount -o loop -t erofs app/my_heytap.img /mnt/my_heytap #挂载 `img` 文件
find /mnt/my_heytap/ -name "*.apk" # 查找 apk 文件
cp /mnt/my_heytap/priv-app/KeKeMarket.apk $HOME/apk/ # 复制到本地
```
## 总结

通过挂载 `img` 文件系统到 Linux 系统，然后从中提取 apk 文件。这里是以 `my_heytap` 为例，其他分区也可以用同样的方法。

```---EOF---```