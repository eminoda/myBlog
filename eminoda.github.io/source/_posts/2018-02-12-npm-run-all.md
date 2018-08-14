---
title: 前端npm多script任务合并执行
date: 2018-02-12 12:01:03
tags: node
categories:
  - 前端
  - node
  - npm
no_sketch: true
---

有没有和我遇到类似的经历？

用Node作为服务端写server，然后前端页面因为代理，特定的构建任务等原因又要用gulp or webpack起个server。然后造成这样的情况，每次开始**搬砖前**，需要起两个命令窗口。
{% asset_img example.png %}

如果你也是这样，不防试试这个npm模块，**好处就是一个ide对应一个命令窗口，一定程度提升开发效率**

## [npm-run-all](https://www.npmjs.com/package/npm-run-all)
> A CLI tool to run multiple npm-scripts in parallel or sequential.

**github评价也不差**
{% asset_img github.png %}

**如何使用**
````
npm install npm-run-all --save-dev
````

**具体命令配置**
[请查阅npm-run-all](https://github.com/mysticatea/npm-run-all/blob/HEAD/docs/npm-run-all.md)

**2个快捷方式**
- run-s 顺序启动
- run-p 并行启动

## 举个例子
package.json
````
"scripts": {
  "start": "run-p node-server build-server",
  "build-server": "cross-env NODE_ENV=development webpack-dev-server --inline --progress --config build/webpack.dev.conf.js",
  "node-server": "cross-env NODE_ENV=development nodemon --delay 1000ms -e js,html bin/www.js"
}
````

**node-server**
定义node服务，使用nodemon监控Node代码变化

**build-server**
定义webpack服务，实时构建前端代码代码

**start**
使用npm-run-all使得以上两个script在一个cmd窗口中并行执行，虽然以上两个具有watch效果，但同一窗口依旧有效。

## 特此说明 
此文作于2018-8-14，与blog记录日期不同，用于纪念niu100.pc项目的创建日