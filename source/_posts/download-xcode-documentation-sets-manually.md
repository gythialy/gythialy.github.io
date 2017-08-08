title: 手动下载 XCode 文档和模拟器
date: 2016-03-26 23:04:45
categories: Notes
tags:
- OS X
- XCode
---
## 缘起

由于众所周知的原因，也就是 Apple 的云真的很烂，App Store 还能通过 DNS 等手段加速更新。对于 XCode 简直就是噩梦，挂不挂都是一个样子，非常慢。不幸中之大幸，虽然 XCode 本身下载很慢，但是可以手动下载好之后，通过 XCode 安装。

## 文档

手动下载文档可以通过以下几步解决，via [stackoverflow](https://stackoverflow.com/questions/1131119/download-xcode-documentation-sets-manually)。

1. 通过这个[地址](https://developer.apple.com/library/downloads/docset-index.dvtdownloadableindex)找到需要下载的文件的路径
  ```xml
  <!-- START OS X doc set -->
  <dict>
    <key>fileSize</key>
    <integer>931959772</integer>
    <key>identifier</key>
    <string>com.apple.adc.documentation.OSX</string>
    <key>name</key>
    <string>OS X 10.11.4 Documentation</string>
    <key>source</key>
    <string>https://devimages.apple.com.edgekey.net/docsets/20160321/031-52211-A.dmg</string>
    <key>userInfo</key>
    <dict>
      <key>ActivationPredicate</key>
      <string>$XCODE_VERSION &gt;= '7.3'</string>
      <key>Category</key>
      <string>Documentation</string>
      <key>IconType</key>
      <string>IDEDownloadablesTypeDocSet</string>
      <key>InstallPrefix</key>
      <string>$(HOME)/Library/Developer/Shared/Documentation/DocSets</string>
      <key>InstalledIfAllReceiptsArePresentOrNewer</key>
      <dict>
        <key>com.apple.pkg.10.9.OSXDocset</key>
        <string>10.9.0.0.1.1458364023</string>
      </dict>
      <key>RequiresADCAuthentication</key>
      <false/>
      <key>Summary</key>
      <string>My description of content</string>
    </dict>
    <key>version</key>
    <string>1014.5</string>
  </dict>
  <!-- END OS X doc set -->
  ```
    下载 `source` 节点对应的内容，在这个示例中也就是[这个](https://devimages.apple.com.edgekey.net/docsets/20160321/031-52211-A.dmg)，可以通过第三方的下载工具，比如 asia2 下载。

1. 按照 `identifier string` + `-` + `version string` + `.dmg` 的格式重命名文件，在这个示例中也就是 `com.apple.adc.documentation.OSX-1014.5.dmg`

1. 把重命名后的文件放到 `~/Library/Caches/com.apple.dt.Xcode/Downloads/` 中，如果没有 `Downloads` 文件夹就创建一个，
如果 `Downloads` 中有后缀为 `dvtdownloadableindex` 的文件，全部删除
1. 删除 `~/Library/Developer/Shared/Documentation/DocSets` 中对应的 docset
1. 在 XCode 中 Preferences/Download 中下载对应的文档，XCode 会校验刚才复制过去的文件进行安装

## 模拟器

1. 打开 XCode，Preferences/Download 中下载模拟器
1. 打开 Console.app，清空日志
1. 在 XCode 中取消下载
1. 在 Console.app 中会看到取消的日志，其他包含完整的下载地址
1. 通过 asia2 等第三方工具下载刚才地址中的文件
1. 把下载好的文件复制到 `~/Library/Caches/com.apple.dt.Xcode/Downloads` 中，如果没有 `Downloads` 文件夹就创建一个，
如果 `Downloads` 中有后缀为 `dvtdownloadableindex` 的文件，全部删除
1. 在 XCode 中安装刚才下载的模拟器

> 如果需要删除不需要的模拟器，可以在 `/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneSimulator.platform/Developer/SDKs` 中直接删除

---EOF---
