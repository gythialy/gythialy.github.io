---
title: 扩展 OpenWRT Overlay 分区 
date: 2022-10-09 15:08:00
tags:
- OpenWRT
categories: Notes
---

- 通过 `lsblk` 参考分区信息，我这边新加的分区为 `/dev/sdb1`，后面都以此为例

```
root@OpenWrt:~# lsblk
NAME   MAJ:MIN RM   SIZE RO TYPE MOUNTPOINTS
sda      8:0    0 316.5M  0 disk
├─sda1   8:1    0    16M  0 part /mnt/sda1
│                                /boot
│                                /boot
└─sda2   8:2    0   300M  0 part /rom
sdb      8:16   0     5G  0 disk
└─sdb1   8:17   0     5G  0 part /overlay
```

- `cfdisk` 分区， 具体用法可以参考 [cfdisk(8) ](https://www.man7.org/linux/man-pages/man8/cfdisk.8.html)

```
                                              Disk: /dev/sda
                                    Size: 316.5 MiB, 331874304 bytes, 648192 sectors
                                          Label: dos, identifier: 0x9e16c055

  Device             Boot                 Start             End        Sectors         Size        Id Type
  /dev/sda1          *                      512           33279          32768          16M        83 Linux
>>  /dev/sda2                               33792         1057791        1024000         500M        83 Linux
```
注: 我这边已经分好区了，所以这里没现实，正常最下面绿色的 `Free Space` 就是待分区的部分

- `mkfs.ext4 /dev/sdb1`: 创建文件系统

- `mount /dev/sdb1 /mnt/sdb1`: 挂载格式化好的分区到 `/mnt/sdb1` 目录

- `cp -r /overlay/* /mnt/sdb1`: 复制现有配置到新挂载的分区

- 检查文件是否复制成功

```
root@OpenWrt:~# ls -al /mnt/sdb1
drwxr-xr-x    5 root     root          4096 Oct  9 13:55 .
drwxr-xr-x    1 root     root          4096 Oct  9 13:52 ..
lrwxrwxrwx    1 root     root             1 Oct  9  2022 .fs_state -> 2
drwxr-xr-x    2 root     root          4096 Oct  9 13:55 etc
drwxr-xr-x   10 root     root          4096 Oct  9 13:52 upper
drwxr-xr-x    3 root     root          4096 Oct  9 13:55 work
```

- 在 `系统/挂载点` 菜单下配置挂载点

![](SCR-20221009-l2o.png)

- 重启系统后，可以在 `系统/软件` 下面查看剩余空间，正常情况下，就应该是新挂载分区的大小

![](SCR-20221009-ldn.png)


在后续升级后，只要执行最后一步，重新挂载后就可以恢复原来的配置。

`---EOF---`