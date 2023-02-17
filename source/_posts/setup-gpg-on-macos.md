---
title: macOS 设置 GPG
tags:
  - macOS
  - gpg
categories: Notes
date: 2023-02-17 11:13:20
---

- 安装 `gpg` 和 `pinentry`
`brew install gpg pinentry-mac`

- 修改 `gpg-agent` 配置
`echo pinentry-program $(whitch pinentry-mac) >> ~/.gnupg/gpg-agent.conf`

- 通过 `gpgconf` 检查配置
```
gpg:OpenPGP:/opt/homebrew/Cellar/gnupg/2.4.0/bin/gpg
gpgsm:S/MIME:/opt/homebrew/Cellar/gnupg/2.4.0/bin/gpgsm
keyboxd:Public Keys:/opt/homebrew/Cellar/gnupg/2.4.0/libexec/keyboxd
gpg-agent:Private Keys:/opt/homebrew/Cellar/gnupg/2.4.0/bin/gpg-agent
scdaemon:Smartcards:/opt/homebrew/Cellar/gnupg/2.4.0/libexec/scdaemon
dirmngr:Network:/opt/homebrew/Cellar/gnupg/2.4.0/bin/dirmngr
pinentry:Passphrase Entry:/opt/homebrew/opt/pinentry/bin/pinentry
```

- 检查 `pinentry-mac` 是否能正确弹出密码界面
`echo GETPIN | pinentry-mac`

- 修改 git 签名配置
```
git config --global user.signingkey F0406D8A
git config --global commit.gpgsign true
git config --global gpg.program $(which gpg)
```

- 测试签名是否正确
`echo "test" | gpg --clearsign`

  输出结果：
  ```
  gpg: using "F0406D8A525890198021BB243D8D256084332679" as default secret key for signing
  -----BEGIN PGP SIGNED MESSAGE-----
  Hash: SHA512

  test
  -----BEGIN PGP SIGNATURE-----

  iQEzBAEBCgAdFiEE8EBtilJYkBmAIbskPY0lYIQzJnkFAmPsoRUACgkQPY0lYIQz
  JnkqTQf8DSIYBfaB6ijhO3U7K4FYvCjeMACV3UbuRJI6WxEyDkn4Iglaw/Y4C/s5
  U12ba4PIGLmzqRSkISFbIj+5eKH97CQoB/kVlfQWL+wkYCpTWNAIPEBa7FGU4BYN
  9dSW/00XEdrWz9Lvzb0QAP2t9a8DIPIhyDGpQoxfq+0enZuFJKMRtKPzDKkpaylG
  MTEYEwV5VnyYNsIu8K37h27oPWKPSadT3SGM+m4vFP68V9Thw0/qZFJS8NW7OW8b
  RwB5FVSIsORypAtN0AtzzTd8cxEq6Rf9rPkYgtfeGGrCzZdyfKsPe/AoWEP5/ZuY
  FzQGzjxomBPHLDt7k89Aq5mwK2NAKw==
  =73Fx
  -----END PGP SIGNATURE-----
  ```

- 诊断问题
```
# Kill gpg-agent
killall gpg-agent

# Run gpg-agent in daemon mode
gpg-agent --daemon
```

`---EOF---`