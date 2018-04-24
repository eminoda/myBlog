---
title: koa2用到时一些不懂得东西
date: 2017-11-29 10:05:08
tags: koa2
categories: node web 框架
---
# koa2

> 基于Node.js平台的下一代web开发框架

[koa2-简书](http://www.jianshu.com/p/6b816c609669)

## koa2 middles 级联
Koa 中间件以更传统的方式级联，您可能习惯使用类似的工具 - 之前难以让用户友好地使用 node 的回调。然而，使用 async 功能，我们可以实现 “真实” 的中间件。对比 Connect 的实现，通过一系列功能直接传递控制，直到一个返回，Koa 调用“下游”，然后控制流回“上游”。

## koa2 express的区别（引用几张图，一目了然）
{% asset_img koa2.png 大大的洋葱koa %}
{% asset_img express.png express %}

## koa文档索引
1. [node 兼容问题](https://koa.bootcss.com#-babel-async-)
2. [context 上下文](https://koa.bootcss.com#-context-)
2. [Request 别名](https://koa.bootcss.com#request-)
2. [Response 别名](https://koa.bootcss.com#response-)

# 相关的一些npm modules
## koa-router//express风格的路由
1. 使用（[见官网](https://www.npmjs.com/package/koa-router)）
2. 一些简单使用、介绍
- 创建对象
    ````
    const router = require('koa-router')();
    ````
- 异步方法处理
    ````
    router.get('/', async (ctx, next) {
        ....
    })
    ````

## koa-json//json格式pretty
1. 使用（[见官网](https://www.npmjs.com/package/koa-json)）

## koa-bodyparser//请求body解析
1. 使用[见官网](https://www.npmjs.com/package/koa-bodyparser)
    ````
    const bodyparser = require('koa-bodyparser');
    app.use(bodyparser({
        enableTyp;es: ['json', 'form', 'text']
    }));
    ...
    ctx.request.body;//输出body
    ...
    ````
# Q&A
1. server error ReferenceError: request is not defined
不能直接使用request、response。Koa Context 将 node 的 request 和 response 对象封装到单个对象中。

2. 为何不像express的req，可以直接req.body获取请求体？
看了源码，才知道原来req是stream，是要读取的。http基本功不扎实

3. 