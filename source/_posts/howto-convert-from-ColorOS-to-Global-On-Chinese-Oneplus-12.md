---
title: 在 macOS 平台把一加 12 ColorOS 转换为国际版
tags:
  - macOS
  - OnePlus
  - Android
  - ColorOS
  - OxygenOS
category: Notes
date: 2024-05-22 21:14:42
---


## 前言

一加11 之前的版本是可以在氢氧OS之间互相刷的，后来合并到 ColorOS 后，莫名增加了很多门槛。在大多数教程中都是基于 Windows 平台。其实要线刷系统思路很简单，就是从 `payload.bin` 中解压出 `img` 文件，然后通过 `fastboot` 刷进去即可。

## 准备工作
- 安装 adb
  ```
  brew install android-platform-tools
  ```
- 下载固件：从 [XDA](https://xdaforums.com/t/how-to-convert-from-coloros-to-global-us-india-on-chinese-oneplus-12.4653255/)这篇文章中找到官方下载链，接，国内也有人做了[分流](https://yun.daxiaamu.com/OnePlus_Roms/%E4%B8%80%E5%8A%A0OnePlus%2012/)。理论上来说都是安全的，如果有人修改了文件，签名验证应该过不了。
  - CPH2583 = US = 美版
  - CPH2573 = IN = 印度版
  - CPH2581 = EU&PU = 欧版

## 提取 `img`

这里以 `CPH2581` 为例，解压 zip 文件到文件夹 `oneplus12`中。目录结构如下，`FTH` 为手动创建，用于存放提取出来的 `img` 文件，`flash-all.sh` 为刷机脚本。以下所有操作都是在 `oneplus12` 文件夹中。

```bash
➜ ll
.rwxr-xr-x@ 1.2k gythialy 22 May 11:16  flash-all.sh
drwxr-xr-x     - gythialy 22 May 11:42  FTH
drwxr-xr-x@    - gythialy 22 May 10:04  META-INF
.rw-r--r--@ 6.6G gythialy  1 Jan  2009  payload.bin
.rw-r--r--@  357 gythialy  1 Jan  2009  payload_properties.txt
```

提取工具为 [payload-dumper-go](https://github.com/ssut/payload-dumper-go)，官方构建的二进制文件在 macOS ARM 平台会报错，所以下面基于 docker 镜像操作。镜像 `latest` tag 基于 [d0b0efee72be](https://github.com/ssut/payload-dumper-go/commit/d0b0efee72be10030ada7296868cec22eff9cac6) 构建。

```bash
docker run -it --rm -v $PWD:/app/ -v $PWD/FTH:/FTH ghcr.io/gythialy/payload-dumper-go:latest -o /FTH /app/payload.bin
```

<!-- more -->

提取完成后的 `FTH` 文件如下：
```
.rwxr-xr-x 279k gythialy 22 May 10:22  abl.img
.rwxr-xr-x 336k gythialy 22 May 10:22  aop.img
.rwxr-xr-x  29k gythialy 22 May 10:22  aop_config.img
.rwxr-xr-x 1.4M gythialy 22 May 10:22  bluetooth.img
.rwxr-xr-x 201M gythialy 22 May 10:21  boot.img
.rwxr-xr-x 254k gythialy 22 May 10:22  cpucp.img
.rwxr-xr-x  16k gythialy 22 May 10:22  cpucp_dtb.img
.rwxr-xr-x  61k gythialy 22 May 10:22  devcfg.img
.rwxr-xr-x  67M gythialy 22 May 10:22  dsp.img
.rwxr-xr-x  25M gythialy 22 May 10:22  dtbo.img
.rwxr-xr-x 1.0M gythialy 22 May 10:22  engineering_cdt.img
.rwxr-xr-x 106k gythialy 22 May 10:22  featenabler.img
.rwxr-xr-x 1.6M gythialy 22 May 10:22  hyp.img
.rwxr-xr-x  98k gythialy 22 May 10:22  imagefv.img
.rwxr-xr-x 8.4M gythialy 22 May 10:21  init_boot.img
.rwxr-xr-x 426k gythialy 22 May 10:22  keymaster.img
.rwxr-xr-x 302M gythialy 22 May 10:22  modem.img
.rwxr-xr-x 908M gythialy 22 May 10:22  my_bigball.img
.rwxr-xr-x 336k gythialy 22 May 10:22  my_carrier.img
.rwxr-xr-x 336k gythialy 22 May 10:22  my_engineering.img
.rwxr-xr-x 907M gythialy 22 May 10:23  my_heytap.img
.rwxr-xr-x 360k gythialy 22 May 10:22  my_manifest.img
.rwxr-xr-x 767M gythialy 22 May 10:22  my_product.img
.rwxr-xr-x 721k gythialy 22 May 10:22  my_region.img
.rwxr-xr-x 1.1G gythialy 22 May 10:22  my_stock.img
.rwxr-xr-x 1.7G gythialy 22 May 10:22  odm.img
.rwxr-xr-x 872k gythialy 22 May 10:22  oplus_sec.img
.rwxr-xr-x 4.3M gythialy 22 May 10:22  oplusstanvbk.img
.rwxr-xr-x 4.0M gythialy 22 May 10:21  product.img
.rwxr-xr-x  61k gythialy 22 May 10:22  qupfw.img
.rwxr-xr-x 105M gythialy 22 May 10:21  recovery.img
.rwxr-xr-x 139k gythialy 22 May 10:22  shrm.img
.rwxr-xr-x  15M gythialy 22 May 10:22  splash.img
.rwxr-xr-x 649M gythialy 22 May 10:22  system.img
.rwxr-xr-x 7.4M gythialy 22 May 10:21  system_dlkm.img
.rwxr-xr-x 911M gythialy 22 May 10:22  system_ext.img
.rwxr-xr-x 4.1M gythialy 22 May 10:22  tz.img
.rwxr-xr-x 3.2M gythialy 22 May 10:22  uefi.img
.rwxr-xr-x 201k gythialy 22 May 10:22  uefisecapp.img
.rwxr-xr-x 8.2k gythialy 22 May 10:22  vbmeta.img
.rwxr-xr-x 8.2k gythialy 22 May 10:21  vbmeta_system.img
.rwxr-xr-x 4.1k gythialy 22 May 10:22  vbmeta_vendor.img
.rwxr-xr-x 1.2G gythialy 22 May 10:22  vendor.img
.rwxr-xr-x 201M gythialy 22 May 10:21  vendor_boot.img
.rwxr-xr-x  30M gythialy 22 May 10:21  vendor_dlkm.img
.rwxr-xr-x 1.1M gythialy 22 May 10:22  xbl.img
.rwxr-xr-x 229k gythialy 22 May 10:22  xbl_config.img
.rwxr-xr-x 877k gythialy 22 May 10:22  xbl_ramdump.img
```

`flash-all.sh` 会自动检查 `FTH` 目录中所有的 `img` 文件，并通过 `fastboot` 刷写。

```bash
#!/bin/bash

# 设置变量
file=vendor_boot

# 检查 fastboot 是否存在
if ! command -v fastboot &> /dev/null; then
  echo "fastboot not found."
  exit 1
fi

# 开始刷机
echo "************************      START FLASH     ************************"
echo "*******************      REBOOT FASTBOOTD     *******************"
fastboot -aa
fastboot reboot fastboot
sleep 5

# 刷写 FTH 镜像
for img in FTH/*.img; do
  echo "flashing $img"
  # echo "fastboot flash $(basename $img .img) $img"
  fastboot flash "$(basename "$img" .img)" "$img"
done

# 刷写 vendor_boot 镜像
if [ -f FTH/$file.zip ]; then
  echo
  unzip -p FTH/$file.zip FTH/$file > FTH/$file.img
  echo "********************** FTH FLASHING **************************"
  fastboot flash $file FTH/$file.img
  echo "*********************** FASTBOOT AGAIN ***************************"
  rm -f FTH/$file.img
fi

# 重启 fastboot
# fastboot reboot fastboot
# sleep 5

# 格式化数据分区
echo "**************************** FOMAT DATA ******************************"
fastboot -w
sleep 5

# 重启 bootloader
fastboot reboot bootloader
sleep 5

# 锁定 bootloader
fastboot flashing lock
echo "Press the \"volume down\" button to \"lock the bootloader"

# 退出脚本
exit 0
```

## 刷机

### 解锁 OEM+Bootloader锁

- 设置 -> 关于本机 -> 版本信息 -> 版本号敲几次进开发者
- 设置 -> 其他设置 -> 开发者选项 ->OEM 解锁和 USB 调试勾上
- 手机连电脑，允许 USB 调试
- `adb devices` 能看看到设备
- `adb reboot bootloader` 重启到 fastboot 模式
- `fastboot flashing unlock`，然后音量上下选 unlock

注：会清空所有数据，做好备份。

### 开始刷写

执行 `./flash-all.bash` 即可。如果还想 root，把最后的 `fastboot flashing lock` 注释掉即可。

## 参考链接

- [How to convert from ColorOS to Global ..US.. India On Chinese Oneplus 12](https://xdaforums.com/t/how-to-convert-from-coloros-to-global-us-india-on-chinese-oneplus-12.4653255/)
- [一加OnePlus12](https://yun.daxiaamu.com/OnePlus_Roms/%E4%B8%80%E5%8A%A0OnePlus%2012/)

## 总结

网上有一些第三方提取的 `img` 文件，从安全角度考虑，建议从官方下载全量包，自行提取比较好。理论上来说，此步骤同意适合 Linux 平台。

```---EOF---```
