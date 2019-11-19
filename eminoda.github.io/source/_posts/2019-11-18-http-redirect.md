---
title: http 页面重定向 redirect
tags: http
categories:
  - 开发
  - 前端开发
thumb_img: javascript.jpg
date: 2019-11-18 12:54:25
---


# 前言

页面的重定向想必大家都知道，如果你是用过 koa ，那么通过如下代码，就能让网页跳转至指定页面：

```js
if (forceLogin) {
  ctx.redirect("/user/login?backUrl=" + decodeURIComponent(ctx.path));
}
```

或者你用过 java 的重定向：

```js
response.sendRedirect("redirectUrl");
```

那么框架内部到底是怎么实现页面重定向的呢？这篇小短文可能会让你更加清楚其中的一些原理。

# 重定向

## 概念

当你在浏览器访问 A 地址时，你会看到浏览器会刷新进度条，地址栏被更新为 B 地址。这就是 URL 重定向。

这样类似的技术，就是由 Http 协议定义的。重定向操作是由服务端向客户端发送特定的响应状态来触发，这类状态有个专门的状态码：3xx ，当浏览器接收后，将会进行页面的重定向，即地址发生了跳转。

## 几种状态码

| 状态码 | 含义               | 类型       | 说明                                                     |
| ------ | ------------------ | ---------- | -------------------------------------------------------- |
| 301    | Moved Permanently  | 永久重定向 | 网站重构。方法变更为 Get                                 |
| 308    | Permanent Redirect | 永久重定向 | 方法和消息主体都不发生变化                               |
| 302    | Found              | 临时重定向 | 页面暂不可用。方法变更为 Get                             |
| 303    | See Other          | 临时重定向 | 用于 PUT 或 POST 请求后，方法变更为 Get ，消息主体会丢失 |
| 307    | Temporary Redirect | 临时重定向 | 方法和消息主体都不发生变化                               |
| 300    | Multiple Choice    | 特殊重定向 | 多种重定向选择                                           |
| 304    | Not Modified       | 特殊重定向 | 配合缓存头，实现资源缓存，和重定向没有关系               |

## 302 和 301 的区别

上面列了许多 3xx 的状态码，但平时我们最多用的是 301 和 302，这里就详细解释这两个的区别：

### 301

永久重定向。如果 A 地址被 301 到 B 地址后，后续再次请求 A 地址的话，浏览器就会默认首次请求 B 地址，不会再有 A 地址的请求。

{% asset_img 301.png %}

等看到第一次访问 /api/books/111 时，页面被重定向到 /api/books，浏览器发送两次请求。但后续再次请求 /api/books/111 时，直接请求了 /api/books 。

所以通常该状态码用于网站重构，告知搜索引擎你以后访问我 301 重定向的地址。

### 302

相反，302 就是临时重定向。

平时我们登陆页面的授权跳转都是基于此状态码。因为客户端访问的页面是临时不可用，满足了某些条件后，可以继续使用。

{% asset_img 302.png %}

对比 301 的请求，能看到两次 /api/books/222 的请求都被“记录在案”。

# koa 中的重定向

来看下 koa 中 response 的 redirect 的重定向源码：

```js
  redirect(url, alt) {
    // location 设置 location 请求头
    if ('back' == url) url = this.ctx.get('Referrer') || alt || '/';
    this.set('Location', url);

    // status 默认 302 状态码
    if (!statuses.redirect[this.status]) this.status = 302;

    // 根据不同访问类型，设置不同 body 的返回内容
    // html
    if (this.ctx.accepts('html')) {
      url = escape(url);
      this.type = 'text/html; charset=utf-8';
      this.body = `Redirecting to <a href="${url}">${url}</a>.`;
      return;
    }

    // text
    this.type = 'text/plain; charset=utf-8';
    this.body = `Redirecting to ${url}.`;
  }
```

能看到在这段重定向的代码中，分别设置了 location 和 状态码，依靠他们来完成重定向的功能。

当然我们可以自己简单的实现一个服务器重定向功能：

```js
const http = require("http");
http
  .createServer((req, res) => {
    let url = req.url;
    if (url == "/redirect") {
      res.writeHead(302, {
        Location: "/goHere"
      });
      res.write("ready redirect");
    }
    if (url == "/goHere") {
      res.write("<head><meta charset='utf-8'/></head><h1>我是重定向后的页面</h1>");
    }
    res.end();
  })
  .listen(3000);
```

# 总结

如果你只是单纯的使用框架的 redirect api，而不清楚其内部的原理，可能这篇会帮助你了解更多些。毕竟这是 Http 的基础，会让你对浏览器的重定向有个概念。
