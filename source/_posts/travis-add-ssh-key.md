---
title: 在 travis 添加 ssh key
tags:
  - travis
  - SSH
categories: Notes
date: 2017-08-10 10:19:25
---


### 生成 SSH key

- 生成

  ```shell
  ssh-keygen -t rsa -b 4096 -C "<your_email>" -f github_deploy_key -N ''
  ```

  > 注： 这里使用 `github_deploy_key` 作为存储的名字

这会生成两个文件
  - 公钥  `github_deploy_key.pub`
  - 私钥 `github_deploy_key`

- 拷贝公钥到剪贴板

  ```shell
  # Copies the contents of the id_rsa.pub file to your clipboard
  $ clip < ~/.ssh/github_deploy_key.pub
  ```

  > 如果是做为项目的部署公钥，需要添加到项目中，以 GitHub 为例，添加公钥的时候需要勾上 `Allow Write Access`

- 删除 `github_deploy_key.pub`

  ```
  rm github_deploy_key.pub
  ```

  ### 安装 [The Travis Client](https://github.com/travis-ci/travis.rb)

- 首先确保已经安装好 Ruby(1.9.3+)，官方推荐 2.0.0 
-  执行 `gem install travis -v 1.8.8 --no-rdoc --no-ri` 安装 travis client
- 检查安装是否正确 `travis version`


### 加密 SSH key

- 加密文件

  ```shell
  travis encrypt-file github_deploy_key
  ```

  加密后的文件为 `github_deploy_key.enc`

  会输出类似的结果：

  ```shell
  encrypting github_deploy_key for <username>/<repository>
  storing result as github_deploy_key.enc
  storing secure env variables for decryption

  openssl aes-256-cbc -K $encrypted_XXXXXXXXXXXX_key -iv $encrypted_XXXXXXXXXXXX_iv -in github_deploy_key.enc -out github_deploy_key -d

  Pro Tip: You can add it automatically by running with --add.

  Make sure to add github_deploy_key.enc to the git repository.
  Make sure not to add github_deploy_key to the git repository.
  Commit all changes to your .travis.yml.
  ```

  > 注： 如果是 GitHub 项目，建议先通过 `travis login`  登录，然后再通过 `travis encrypt-file github_deploy_key -add` 加密，travis Client 会自动更新 `.traivs.yaml`并且在 travis 中自动添加变量 `encrypted_XXXXXXXXXXXX_key`  和 `encrypted_XXXXXXXXXXXX_iv`

- 删除 `github_deploy_key`

  ```shell
  rm -f github_deploy_key
  ```

  ​

### 修改 `.travis.yaml`

在 `before_install` 添加如下内容：

  ```yaml
  before_install:
  - openssl aes-256-cbc -K $encrypted_a7d17a00ff1b_key -iv $encrypted_a7d17a00ff1b_iv
    -in .travis/github_deploy_key.enc -out ~/.ssh/github_deploy_key -d
  - chmod 600 ~/.ssh/github_deploy_key
  - eval $(ssh-agent)
  - ssh-add ~/.ssh/github_deploy_key
  - cp .travis/ssh_config ~/.ssh/config
  - git config --global user.name 'gythialy'
  - git config --global user.email 'gythialy@users.noreply.github.com'
  ```

> 注： 步骤如下：通过openssl 解密文件并输出到 `~/.ssh/github_deploy_key` 中；设定 `~/.ssh/github_deploy_key` 文件权限并添加到 `ssh-agent` 中

`ssh_config`内容，主要是防止首次连接的时候，会弹出提示。如果有其他的地址，参考此设置即可。

  ```yaml
  Host github.com
      User git
      StrictHostKeyChecking no
      IdentityFile ~/.ssh/github_deploy_key
      IdentitiesOnly yes
  Host gitcafe.com
      User git
      StrictHostKeyChecking no
      IdentityFile ~/.ssh/github_deploy_key
      IdentitiesOnly yes
  Host git.coding.net
      User git
      StrictHostKeyChecking no
      IdentityFile ~/.ssh/github_deploy_key
      IdentitiesOnly yes
  ```

至此，就成功在 travis 中添加了SSH密钥且能建立链接。可用于且不限于：

- 推送 CI 编译后的文件/结果
- 免费构建私有项目（这个可能会违反TOS，不建议...）
- etc....

### 参考

- [Connecting to GitHub with SSH](https://help.github.com/articles/connecting-to-github-with-ssh/)
- [Encrypting Files](https://docs.travis-ci.com/user/encrypting-files/)

---EOF---