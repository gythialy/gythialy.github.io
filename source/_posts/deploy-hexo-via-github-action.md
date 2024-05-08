---
title: 自动部署 Hexo 到 Github Pages
date: 2024-05-08 10:07:03
tags:
- Tips
- Hexo
- GitHub Pages
- GitHub Actions
categories: Notes
---

之前在 [通过 GitHub Actions 自动部署 Hexo](deploy-hexo-to-github-pages-via-github-actions)，通过创建两个不同的分支，`raw` 分支存储原始的 Hexo 项目，`master` 分支存储`hexo generate`编译出来的静态页面，通过 `hexo deploy`来部署。由于使用了 `hexo deploy` 需要设置部署用的 SSH 密钥。

下面的办法更简单，不需要做额外的设置，Hexo 项目在 `main`分支，不需要再添加其他分支。

```yaml
name: Hexo deploy

on:
  push:
    branches:
      - raw
      - main

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      - name: Use Node.js (.tool-versions)
        uses: actions/setup-node@v4
        with:
          node-version-file: ".tool-versions"
      - uses: pnpm/action-setup@v3
        name: Install pnpm
        with:
          version: 8
          run_install: false
      - name: Get pnpm store directory
        shell: bash
        run: |
          echo "STORE_PATH=$(pnpm store path --silent)" >> $GITHUB_ENV
      - uses: actions/cache@v4
        name: Setup pnpm cache
        with:
          path: ${{ env.STORE_PATH }}
          key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-store-
      - name: Install Dependencies
        run: pnpm install
      - name: Build
        run: pnpm run build
      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./public
  deploy:
    needs: build
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4

```

```---EOF---```
