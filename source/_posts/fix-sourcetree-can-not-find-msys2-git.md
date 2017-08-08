title: 修正 SourceTree 无法识别 msys2 中 Git
date: 2016-03-23 09:33:32
categories: Notes
tags:
- SourceTree
- Git
---

### 问题

SourceTree 真是一个让人又爱又恨的产品，小问题不断，但是在免费的 Git 的 GUI 里面还算优秀的。因为 TortoiseGit 对 msys2 支持不好，我又回到 SourceTree 阵营了, SourceTree 为主， CLI 辅助。 因为 SourceTree 不能识别 msys2 的 Git，虽然其自带一个内嵌的 Git，这样就导致了我需要配置两份全局的 gitconfig。

### 解决方案

其实原因很简单，因为 SourceTree 要求 Git 所在目录必须同时有 bin 和 cmd 文件夹。听起来很2是吧？知道了原因要解决起来就很简单。

1. 我的 msys2 安装在 `d:\msys64`，在 SourceTree 中选择 **系统安装的Git** (工具/选项/Git)

    在 AppData 中的 `user.config` 配置中 `GitSystemPath` 节点会自动识别出 msys2 的路径
    ```xml
    <setting name="GitSystemPath" serializeAs="String">
        <value>D:\msys64\usr</value>
    </setting>
    ```

2. 通过 [mklink](https://technet.microsoft.com/en-us/library/cc753194.aspx) 建立一个链接

    在 `D:\msys64\usr` 建立链接
    ```mklink /D cmd bin```

---EOF---
