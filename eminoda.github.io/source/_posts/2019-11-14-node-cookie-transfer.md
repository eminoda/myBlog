---
title: node 作为中间层如何转存 cookie
tags:
  - node
categories:
  - 开发
  - 前端开发
thumb_img: node.png
date: 2019-11-14 18:33:37
---


# 前言

随着前后端服务的分离、主业务服务（java）的“下沉”，类似 BFF（Backends For Frontends）架构的雏形越来越多。node.js 一个能跑 js 的运行平台，让越来越多的前端工程师无语言学习障碍的加入了 node 服务端的阵营。

相信多数团队和我们一样，node 作为一个中间层连通着客户端和后端服务，处理着各种各样的事情。这篇就简单讲下 node 端如何转存 cookie 。

# 场景

先说下问题出现的场景，由于前端本来是接口 api 的使用者，导致很多问题没有遇到过，都是后端服务帮我们处理掉的。

但当 node 介入整个服务体系后，不可避免的就会碰到类似用户登录“失效”这类问题。可以看下如下这图：

{% asset_img miss-cookie.png %}

注意到后一种方式，node 作为中间层充当着接口的传递者，你一定不会忘记处理来自后端的响应信息，但可能会忘记给客户端设置 cookie （如：红框内容），这样就导致一些忽视的问题。

# cookie

好，再来看下 cookie ，这不是 http 协议里的东西，太简单了吧？的确是基础，但有时我们却会轻视这些东西。借这个机会快速过下：

## http 无状态

我们都知道 http 是无状态的协议，每次请求服务端根本不知道之前客户端有什么情况。就此，就有 Cookie 这样的机制，传递一些信息来帮助客户端和服务端建立起一定的关系，并持久化到浏览器，每次请求都把 cookie 发送给服务端，服务端解析后做逻辑处理。比如：用户登录等。

## cookie 存储受那些影响

cookie 存储受 domain、path 的影响（端口除外），你不同的域名、访问地址都会影响到 cookie 的存储。你也不能获取不同域的 cookie 信息，这就是前端经常遇见的 **跨域问题** ，这里不做展开，只希望你特别留一下 domain 和 path 两个属性。

# 实践

下图，是一个简单的客户端请求和服务端响应流程：

{% asset_img cookie-pass.png %}

这里将通过代码来说明如何处理 1、2 两处中间层的交互，来使得最后的 cookie 能顺利给到客户端。

> 备注：代码基于 koa + axios

## 中间层接收后端服务 cookie

首先是服务端向客户端设置 cookie （用户登录成功后，会向客户端设置一个 token 信息，下次从 cookie 获取 token 来验证是否已登录）

我们已经知道 cookie 是受 domain 和 path 影响的，并且是无状态的。假设，后端的 domain 是写死的，一直是往（foo.com）存的，那么我们就需要在中间层重写 cookie 的 domain 和全部 cookie 信息。

```js
const cookie = require('cookie');
function(response){
  let cookies = response.headers['set-cookie'];//['uid=1; Domain=foo.com; Path=/','nick=2; Domain=foo.com; Path=/']
  let targetCookie = {};
  for (let cookieStr of cookies) {
    targetCookie = Object.assign(targetCookie, cookie.parse(cookieStr));
  }
  for(let cookieKey of targetCookie){
    // 设置给 ctx
    this.ctx.cookies.set(cookieKey, targetCookie[cookieKey], {
      path: '/',
      domain: your-domain, // 注意这个！！
      httpOnly: false
    });
  }
}
```

ctx 是 koa 创装的全局对象。先请后端获取响应头中的 cookie 信息，解析出 cookie 的 key-value ，重写到 ctx.cookies 中。

## 中间层发送 cookie 到后端服务

```js
axios.create({
  baseURL: baseURL,
  method: ctx.method,
  timeout: 1000 * 30,
  headers: {
    Cookie: ctx.headers['cookie'] || '',
    Host: ctx.headers['host']
  }
}
```

这个比较容易，通过 ctx.headers 分别获取来自客户端的 cookie 和 host 信息，重新组织好 headers 通过 axios 发送给后端服务。这样后端就知道是哪个域名、哪个 cookie 内容了。

# 总结

## 自定义

如果后端比较“智能”，可以根据请求端的 host 来动态指定响应的 domain ，那么他不用把 cookie 固定往 foo.com 这个域名存。当然目前我们通过重写 cookie 就替后端完成了这样的操作，并且 cookie 的主导权落在了我们前端的手上。

## 节流

我们知道可能客户端会携带大量的 cookie 信息，它将严重影响网络请求和响应的速度。

当我们中间层 node 获得了 cookie 的主导权后，我们完全可以根据业务逻辑来过滤后端不需要的 cookie 信息，从而提升网站的速度。

比如，后端只需要一个 token 的 cookie 信息，那么我们重写 cookie 的时候就发 token 相关的数据即可。

虽然前端介入整个服务体系会使得工作量增加，但如果一切得法，会在某种程度减少整个二次开发的成本，通过 node 中间层的各种“协调”，使后端服务更“稳定”。
