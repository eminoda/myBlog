---
title: 前端 npm 多 script 任务合并执行
date: 2018-02-12 12:01:03
tags: node
categories:
  - 开发
  - 前端开发
no_sketch: true
---

有没有和我遇到类似的经历？

用 Node 作为服务端写 server，然后前端页面因为代理，特定的构建任务等原因又要用 gulp or webpack 起个 server。然后造成这样的情况，每次开始**搬砖前**，需要起两个命令窗口。
{% asset_img example.png %}

如果你也是这样，不防试试这个 npm 模块，**好处就是一个 ide 对应一个命令窗口，一定程度提升开发效率**

## [npm-run-all](https://www.npmjs.com/package/npm-run-all)

> A CLI tool to run multiple npm-scripts in parallel or sequential.

**github 评价也不差**
{% asset_img github.png %}

**如何使用**

```
npm install npm-run-all --save-dev
```

**具体命令配置**
[请查阅 npm-run-all](https://github.com/mysticatea/npm-run-all/blob/HEAD/docs/npm-run-all.md)

**2 个快捷方式**

- run-s 顺序启动
- run-p 并行启动

## 举个例子

package.json

```
"scripts": {
  "start": "run-p node-server build-server",
  "build-server": "cross-env NODE_ENV=development webpack-dev-server --inline --progress --config build/webpack.dev.conf.js",
  "node-server": "cross-env NODE_ENV=development nodemon --delay 1000ms -e js,html bin/www.js"
}
```

**node-server**
定义 node 服务，使用 nodemon 监控 Node 代码变化

**build-server**
定义 webpack 服务，实时构建前端代码代码

**start**
使用 npm-run-all 使得以上两个 script 在一个 cmd 窗口中并行执行，虽然以上两个具有 watch 效果，但同一窗口依旧有效。

## 特此说明

此文作于 2018-8-14，与 blog 记录日期不同，用于纪念 niu100.pc 项目的创建日
