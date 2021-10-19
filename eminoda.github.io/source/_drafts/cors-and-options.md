---
title: 你了解跨域中的 options 请求吗？
tags: cors
categories:
  - 开发
  - 前端开发
post_img:
  bg_color: "#ff9c6e"
  title: CORS
  title_color: "#fff"
  sub_title: 跨域中的简单请求和复杂请求
  sub_color: "#fff"
---

# 跨域

相关基础概念，在 [CORS MDN](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS) 都有详细的描述。

这篇会针对几个核心点做说明，并结合代码 demo 做些验证。

## 同源策略

> 同源策略是一个重要的安全策略，它用于限制一个 origin 的文档或者它加载的脚本如何能与另一个源的资源进行交互。它能帮助阻隔恶意文档，减少可能被攻击的媒介。

简单说，当我们访问一个网站时，浏览器会对源的不同部分（协议://域名:端口）做检查。用来防止，比如利用它源的存储信息（Cookies...）做不安全的用途。

## 跨域 CORS

但凡被浏览器识别为不同源，浏览器都会认为是跨域，默认是不允许的。

比如：试图在 http://127.0.0.1:4000 中，请求 http://127.0.0.1:3000 的资源会出现如下错误：

{% asset_img cors-error.png 跨域错误 %}

**同源和跨域的判断规则**

当前浏览器访问地址：http://domain/url

| URL                 | 结果 | 原因     |
| ------------------- | ---- | -------- |
| http://domain/other | 同源 | 地址不同 |
| http://domain2      | 跨域 | 域名不同 |
| http://domain:8080  | 跨域 | 端口不同 |
| https://domain      | 跨域 | 协议不同 |

## 简单请求和复杂请求

**简单请求**：满足如下条件的，将不会触发跨域检查：

- 请求方法为：GET、POST、HEAD
- 请求头：Accept、Accept-Language、Content-Language、Content-Type

其中 **Content-Type** 限定为 ：text/plain、multipart/form-data、application/x-www-form-urlencoded

我们可以试着改变下同源规则，以 **GET** 方法为例，看下效果：

> http://127.0.0.1:4000/ 下，请求 http://127.0.0.1:3000 不同端口的地址

{% asset_img easy-request-1.png 简单请求 %}

**复杂请求**：不满足简单请求的都为复杂请求。在发送请求前，会使用 **options** 方法发起一个 **预检请求（Preflight）** 到服务器，以获知服务器是否允许该实际请求。

模拟一个跨域请求：

```js
// 端口不同，content-type 也非限定值
axios.post(
  "http://127.0.0.1:3000/test/cors",
  {},
  {
    headers: {
      "content-type": "application/json",
    },
  }
);
```

能看到在请求之前浏览器会事先发起一个 **Preflight 预检请求**：

{% asset_img options-1.png Preflight %}

这个 **预检请求** 的请求方法为 **options**，同时会包含 **Access-Control-xxx** 的请求头：

{% asset_img options-2.png options请求信息 %}

当然，此时服务端没有做跨域处理（示例使用 express 起的服务，预检请求默认响应 200），就会出现浏览器 CORS 的错误警告。

{% asset_img cors-error.png 跨域错误 %}

# 如何解决跨域

对于跨域，前端再熟悉不过，百度搜索能找到一堆解决方法，关键词不是 **JSONP**，或者添加些 **Access-Control-XXX** 响应头。

本篇将详细说下后一种方式，姑且称为：服务端解决方案。

## 为 options 添加响应头

以 **express** 举例，首先对 **OPTIONS** 方法的请求添加这些响应头，它将根据告诉浏览器根据这些属性进行跨域限制：

```js
app.use(function (req, res, next) {
  if (req.method == "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, PUT, POST, DELETE, OPTIONS"
    );
    res.setHeader("Access-Control-Allow-Headers", "content-type");
    res.status(200).end();
  }
});
```

如果你不对预检接口做正确的设置，那么后续一切都是徒劳。

打个比方：如果 **Access-Control-Allow-Methods** 只设置了 **POST**，如果客户端请求方法为 **PUT**，那么最终会出现跨域异常，并会指出 **PUT** 没有在预检请求中的 **Access-Control-Allow-Methods** 出现：

{% asset_img cors-methods.png 跨域方法错误 %}

所以，以后读懂跨域异常对于正确的添加服务端响应信息非常重要。另外：**GET、POST、HEAD** 属于简单请求的方法，所以即使不在 **Access-Control-Allow-Methods** 定义也不碍事（如果不对请指出）

## 正式的跨域请求

随后对我们代码发出的请求额外添加跨域响应头（这需要和前面的预检接口一致）

```js
if (req.method == "OPTIONS") {
  //...
} else {
  // http://127.0.0.1:3000/test/cors
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
}
```

最后能看到我们等请求正常请求到了：

{% asset_img cors-success.png 跨域请求 %}

## 那对于 OPTIONS 有多少请求头设置呢？

上例出现了我们经常见到的三个，参考 **cors** 库，另外还有其他用于预检请求的响应头：

| 头属性                           | 作用                                         |
| -------------------------------- | -------------------------------------------- |
| Access-Control-Allow-Origin      | 源地址（协议://域名:端口）                   |
| Access-Control-Allow-Methods     | 开放的方法（GET,HEAD,PUT,PATCH,POST,DELETE） |
| Access-Control-Allow-Headers     | 开发的请求头（content-type）                 |
| Access-Control-Max-Age           | 预检请求的缓存时间，10（秒），-1 不缓存      |
| Access-Control-Expose-Headers    | 跨域中，授权客户端能获取到的响应头           |
| Access-Control-Request-Headers   | xxx                                          |
| Access-Control-Allow-Credentials | xxx                                          |
| Vary                             | xxx                                          |
|                                  |
|                                  |
