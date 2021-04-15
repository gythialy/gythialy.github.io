---
title: 在 Ubuntu 中自动挂载 SMB 共享
date: 2021-04-15 10:19:36
tags:
- Linux
- Ubuntu
- SMB
- Samba
categories: Notes
---

1. 安装 CIFS Utils pkg
    ```bash
    sudo apt-get install cifs-utils
    ```
2. 创建一个挂载点
    ```
    sudo mkdir /mnt/local_share
    ```
3. 创建文件保存 `~/.smbcredentials` 来保存 SMB 用户名和密码
    ```
    username=smb_share
    password=share_password
    ```
4.  在 `/etc/fstab` 最后添加配置实现自动挂载
    ```
    # /etc/fstab
    /$smb_server/share /mnt/local_share cifs credentials=/home/$user/.smbcredentials,uid=1000,gid=1000,iocharset=utf8 0 0
    ```
    > 注：`$smb_server` 为 SMB 服务器地址，`$user` 为当前用户名，`uid/gid` 为当前用户的 `uid` 和 `gid`，可以通过 `id $(whoami)` 查看

`---EOF---`