---
title: 使用node8搭建koa2环境
date: 2017-07-18 09:52:02
tags:
  - koa
  - koa2
  - node8
categories: koa
comments: true
---

## 被整死了
> ka2只支持node7.6以上，低版本只能babel，但部分middleware各种babel不起来，本人技艺不佳，弃。

{% asset_img babel.png koa2 babel %}
## tip（如果还要koa2兼容node6...之类...）
1. [babel文档:https://babeljs.io/docs/plugins](https://babeljs.io/docs/plugins/)
2. babel钩子置于启动文件最上方
3. 从官网koa2上的Demo开始搭建环境（简简单单的async还是ok的），不要直接用koa-generate等生成
4. 直接切node7.6以上version（省时间，早晚还是要切的）