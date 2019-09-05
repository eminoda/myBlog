---
title: apache ab 工具如何发送 post 请求
tags:
  - 测试
  - ab
categories:
  - 开发
  - 自动化测试
no_sketch: true
date: 2018-11-16 11:21:33
---

主要记录下 post 方式，ab 基础入门请点击查看如下文章的底部备注：

[https://eminoda.github.io/2018/11/08/pressure-test-node-java/](https://eminoda.github.io/2018/11/08/pressure-test-node-java/)

**起因**：用 ab 压了网站页面，我们一致认为瓶颈是在 foo 后端服务，但他们又需要我们单压他们接口，ok 没问题（省去十万字解释），但他们的开发又不熟悉 ab 不能提供给运维，最后只能我们前端测下 foo 后端服务。

> 没办法，目前虽然公司的前端处于食物链底部，但是每个前端都是具备全栈能力的，学习力太强大

不扯皮，开始吧：

1. 某后端服务接口的特性

   - request header ： application/json
   - request method ： post

2. 准备 node 服务
   - 用 **koa-bodyparser** 做请求 data 的解析
   - 用 **koa-router** 做接口接入
   ```
   router.post('/api/test', async function(ctx, next) {
       console.log(ctx.request.body);
       console.log(ctx.method);
       console.log(ctx.headers);
       ctx.body = {
           param: ctx.request.body
       }
   })
   ```
3. 测试 ab 脚本

   这里只是简单测试 json 格式的 post 请求。

   ```
   [root@localhost ~]# ab -n 1 -c 1  -T application/json -p 1.json  "http://127.0.0.1:3301/anal/api/test"
   ```

   要注意如下几点：

   - **-p** 定义 post 方法需要传输的 file
   - file 默认是寻找 **/root** 路径下目标文件，可以通过 tab 确认
   - file 可能需要注意换行符等问题（目前我这边没有问题）
   - **-T** 是和-p 搭配使用，指定 header

   file（1.json）: 后缀任意，格式需要 json

   ```
   {"channelId":xx}
   ```

   结果：node 成功接收到 ab 请求

   ```
   <-- POST /anal/api/test
       { channelId: xx }
       POST
       { 'content-length': '18',
           'content-type': 'application/json',
           host: '127.0.0.1:3301',
           'user-agent': 'ApacheBench/2.3',
           accept: '*/*' }
   POST /anal/api/test - 5ms
   --> POST /anal/api/test 200 10ms 27b
   ```

4. 切换到目标 foo 服务

   失败，问题丢到 foo 团队处理，鬼知道他们服务有什么“鸟蛋设定”

   ```
   [root@localhost ~]# ab -n 1 -c 1  -T application/json -p 1.json  "http://xxx"
   This is ApacheBench, Version 2.3 <$Revision: 655654 $>
   Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
   Licensed to The Apache Software Foundation, http://www.apache.org/

   Benchmarking cms.niu100.com (be patient)...apr_poll: The timeout specified has expired (70007)
   ```

写在最后，虽然还是要和他们后端服务做对接，了解有什么深坑在里面。但站在一个前端开发角度，又离那个“顶峰”进了一步

参考：

- [https://www.tanglei.name/blog/Apache-benchmarking-usage.html](https://www.tanglei.name/blog/Apache-benchmarking-usage.html)
- [https://www.jianshu.com/p/66ad2f9570f8](https://www.jianshu.com/p/66ad2f9570f8)
