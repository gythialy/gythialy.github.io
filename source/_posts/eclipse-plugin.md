title: eclipse 配置及插件 
date: 2018-02-07 09:30:12
categories: Notes 
tags:
- eclipse
- IDE
- Plugin
---

虽然我现在基本上转到 [Jetbrains IDEA](https://www.jetbrains.com/idea/) 了，办公室有些小朋友还是坚守 [eclipse](http://www.eclipse.org/downloads/eclipse-packages/)，简单整理下常用插件和配置。


### 插件

| 名称                                                         | 备注                                                         |                             安装                             |
| ------------------------------------------------------------ | ------------------------------------------------------------ | :------: |
| [Buildship](https://projects.eclipse.org/projects/tools.buildship) | Eclipse Gradle 插件                                          | [![Drag to your running Eclipse* workspace. *Requires Eclipse Marketplace Client](https://marketplace.eclipse.org/sites/all/themes/solstice/public/images/marketplace/btn-install.png)](http://marketplace.eclipse.org/marketplace-client-intro?mpc_install=2306961 "Drag to your running Eclipse* workspace. *Requires Eclipse Marketplace Client") |
| [Darkest Dark Theme w/DevStyle](https://www.genuitec.com/products/devstyle/) | 黑色主题                                                     | [![Drag to your running Eclipse* workspace. *Requires Eclipse Marketplace Client](https://marketplace.eclipse.org/sites/all/themes/solstice/public/images/marketplace/btn-install.png)](http://marketplace.eclipse.org/marketplace-client-intro?mpc_install=3274405 "Drag to your running Eclipse* workspace. *Requires Eclipse Marketplace Client") |
| [Checkstyle](https://checkstyle.github.io/eclipse-cs/)       | 代码风格检查                                                 | [![Drag to your running Eclipse* workspace. *Requires Eclipse Marketplace Client](https://marketplace.eclipse.org/sites/all/themes/solstice/public/images/marketplace/btn-install.png)](http://marketplace.eclipse.org/marketplace-client-intro?mpc_install=150 "Drag to your running Eclipse* workspace. *Requires Eclipse Marketplace Client") |
| [Enhanced Class Decompiler](https://ecd-plugin.github.io/ecd/) | 反编译插件，集成 JD, Jad, FernFlower, CFR, Procyon seamlessly with Eclips | [![Drag to your running Eclipse* workspace. *Requires Eclipse Marketplace Client](https://marketplace.eclipse.org/sites/all/themes/solstice/public/images/marketplace/btn-install.png)](http://marketplace.eclipse.org/marketplace-client-intro?mpc_install=3644319 "Drag to your running Eclipse* workspace. *Requires Eclipse Marketplace Client") |
| [Java Source Attacher](https://marketplace.eclipse.org/content/java-source-attacher) | 下载 jar 包代码包并关联                                      | [![Drag to your running Eclipse* workspace. *Requires Eclipse Marketplace Client](https://marketplace.eclipse.org/sites/all/themes/solstice/public/images/marketplace/btn-install.png)](http://marketplace.eclipse.org/marketplace-client-intro?mpc_install=84997 "Drag to your running Eclipse* workspace. *Requires Eclipse Marketplace Client") |
| [Kotlin](https://github.com/JetBrains/kotlin-eclipse)        | Kotlin 语言支持                                              | [![Drag to your running Eclipse* workspace. *Requires Eclipse Marketplace Client](https://marketplace.eclipse.org/sites/all/themes/solstice/public/images/marketplace/btn-install.png)](http://marketplace.eclipse.org/marketplace-client-intro?mpc_install=2257536 "Drag to your running Eclipse* workspace. *Requires Eclipse Marketplace Client") |
| [SonarLint for Eclipse](https://sonarlint.org/eclipse/)      | 代码静态检查                                                 | [![Drag to your running Eclipse* workspace. *Requires Eclipse Marketplace Client](https://marketplace.eclipse.org/sites/all/themes/solstice/public/images/marketplace/btn-install.png)](http://marketplace.eclipse.org/marketplace-client-intro?mpc_install=2568658 "Drag to your running Eclipse* workspace. *Requires Eclipse Marketplace Client") |
| [SpotBugs](https://github.com/spotbugs/spotbugs)             | 代码静态检查                                                 | [![Drag to your running Eclipse* workspace. *Requires Eclipse Marketplace Client](https://marketplace.eclipse.org/sites/all/themes/solstice/public/images/marketplace/btn-install.png)](http://marketplace.eclipse.org/marketplace-client-intro?mpc_install=3519199 "Drag to your running Eclipse* workspace. *Requires Eclipse Marketplace Client") |
| [TestNG](http://testng.org/doc/eclipse.html)                 | 测试框架                                                     | [![Drag to your running Eclipse* workspace. *Requires Eclipse Marketplace Client](https://marketplace.eclipse.org/sites/all/themes/solstice/public/images/marketplace/btn-install.png)](http://marketplace.eclipse.org/marketplace-client-intro?mpc_install=1549 "Drag to your running Eclipse* workspace. *Requires Eclipse Marketplace Client") |

<!-- more -->

> 注： 如果安装了 [Marketplace Client](https://www.eclipse.org/mpc/) 可直接导入[配置](eclipse-jee.p2f)而无需手动添加。具体步骤为：File->Import/Install/Install Software Items from File，然后选中配置文件即可。

### 配置

- 智能提示

  `Java/Content Assint/Auto Activation/Auto activation triggers for java` 为 `.abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ(, @`

  ![](Snipaste_2018-02-07_14-12-26.png)

- 字体设置

  `General/Appearance/Colors and Fonts`  设置字体

  ![](Snipaste_2018-02-07_14-19-06.png)

- 文件编码

  文件编码默认为 GBK，可通过 `General/Workspace/Text file encoding/Other` 选中 `UTF-8` 修改

  ![](Snipaste_2018-02-07_14-45-09.png)


`---EOF---`