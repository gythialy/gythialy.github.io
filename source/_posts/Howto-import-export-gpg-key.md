---
title: GPG 导入导出 Key
date: 2017-03-22 15:26:05
categories: Notes
tags: 
- gpg
---

在多台电脑上操作的时候经常会涉及到 GPG 公钥/私钥的导入导出，比方说 GitHub 支持 GPG 加密 Commit，在多台电脑上使用相同的 Key 可以省去很多配置工作。

## 列出本地的所有 Key

执行 `gpg --list-keys` 列出本地所有的密钥

输出结果类似

```
 $ gpg --list-keys /home/$USER/.gnupg/pubring.gpg 
 ----------------------------------- 
pub   4 096R/375A500B 2017-03-22 [有效至：2018-03-22] 
uid                  Goren G (Git) <gythialy.koo+git@gmail.com> 
sub   4096R/ADB9D36C 2017-03-22 [有效至：2018-03-22]
```

## 导出

根据 `375A500B` 导出相应的公钥和私钥

```
gpg --output mygpgkey_pub.gpg --armor --export 375A500B
gpg --output mygpgkey_sec.gpg --armor --export-secret-key 375A500B
```

## 导入

导入刚导入的文件

```
gpg --import ~/mygpgkey_pub.gpg
gpg --allow-secret-key-import --import ~/mygpgkey_sec.gpg
```

## 删除密码

```
gpg --edit-key 375A500B
# 在弹出的界面中输入原来密码，新密码留空即可
passwd
# 保存修改
save
```
> 如果提示 `Sorry, no terminal at all requested - can't get input` 的话，需要 把 `~/.gnupg/gpg.conf` 中的 `no-tty` 注释掉

---EOF---