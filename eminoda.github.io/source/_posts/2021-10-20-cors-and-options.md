---
title: 你知道为何跨域中会发送 options 请求？
tags: cors
categories:
  - 开发
  - 前端开发
post_img:
  bg_color: '#ff9c6e'
  title: CORS
  title_color: '#fff'
  sub_title: 跨域中的简单请求和复杂请求
  sub_color: '#fff'
date: 2021-10-20 14:22:29
---


# 前言

相关跨域等概念，都能在 [CORS MDN](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS) 找到对应的说明描述。

本篇会针对几个知识点做说明，并结合代码示例做一些实操，加深理解（而不是跟着百度人云亦云）。

## 同源策略

> 同源策略是一个重要的安全策略，它用于限制一个 origin 的文档或者它加载的脚本如何能与另一个源的资源进行交互。它能帮助阻隔恶意文档，减少可能被攻击的媒介。

简单说，当我们访问一个网站时，浏览器会对源地址的不同部分（协议://域名:端口）做检查。比如防止利用它源的存储信息（Cookies...）做不安全的用途。

## 跨域 CORS

但凡被浏览器识别为不同源，浏览器都会认为是跨域，默认是不允许的。

比如：试图在 http://127.0.0.1:4000 中，请求 http://127.0.0.1:3000 的资源会出现如下错误：

{% asset_img cors-error.png 跨域错误 %}

这也是前端 100% 在接口调试中会遇到的问题。

**同源和跨域的判断规则**

当前浏览器访问地址：http://domain/url

| URL                 | 结果 | 原因     |
| ------------------- | ---- | -------- |
| http://domain/other | 同源 | 地址不同 |
| http://domain2      | 跨域 | 域名不同 |
| http://domain:8080  | 跨域 | 端口不同 |
| https://domain      | 跨域 | 协议不同 |

## 简单请求和复杂请求

相信都会在浏览器的 Network 中看到两个同样地址的请求，有没有想过这是为什么呢？这是因为在请求中，会分为 **简单请求** 和 **复杂请求** 。

**简单请求**：满足如下条件的，将不会触发跨域检查：

- 请求方法为：**GET** 、**POST** 、 **HEAD**
- 请求头：**Accept**、**Accept-Language**、**Content-Language**、**Content-Type**

其中 **Content-Type** 限定为 ：text/plain、multipart/form-data、application/x-www-form-urlencoded

我们可以更改同源规则，看下如下示例：

> http://127.0.0.1:4000/ 下，请求 http://127.0.0.1:3000 不同端口的地址

{% asset_img easy-request-1.png 简单请求 %}

域名不同，这已经跨域了。但由于请求方法为 **GET**，符合 **简单请求**，请求将正常工作。

**复杂请求**：不满足简单请求的都为复杂请求。在发送请求前，会使用 **options** 方法发起一个 **预检请求（Preflight）** 到服务器，以获知服务器是否允许该实际请求。

模拟一个跨域请求：

```js
// 端口不同，content-type 也非限定值
axios.post(
  'http://127.0.0.1:3000/test/cors',
  {},
  {
    headers: {
      'content-type': 'application/json',
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
  if (req.method == 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'content-type');
    res.status(200).end();
  }
});
```

如果你不对 **预检接口** 做正确的设置，那么后续一切都是徒劳。

打个比方：如果 **Access-Control-Allow-Methods** 只设置了 **POST**，如果客户端请求方法为 **PUT**，那么最终会出现跨域异常，并会指出 **PUT** 没有在预检请求中的 **Access-Control-Allow-Methods** 出现：

{% asset_img cors-methods.png 跨域方法错误 %}

所以，以后读懂跨域异常对于正确的添加服务端响应信息非常重要。另外：**GET、POST、HEAD** 属于简单请求的方法，所以即使不在 **Access-Control-Allow-Methods** 定义也不碍事（如果不对请指出）

## 正式的跨域请求

随后对我们代码发出的请求额外添加跨域响应头（这需要和前面的预检接口一致）

```js
if (req.method == 'OPTIONS') {
  //...
} else {
  // http://127.0.0.1:3000/test/cors
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
}
```

最后能看到我们等请求正常请求到了：

{% asset_img cors-success.png 跨域请求 %}

# 对于跨域请求头的说明

上例出现了我们经常见到的三个：**Access-Control-Allow-Origin**，**Access-Control-Allow-Methods**，**Access-Control-Allow-Headers**。

参考 **cors** 库，另外还有其他用于预检请求的响应头：

| 头属性                           | 作用                                       |
| -------------------------------- | ------------------------------------------ |
| Access-Control-Allow-Origin      | 判断源地址（协议://域名:端口）             |
| Access-Control-Allow-Methods     | 限定方法（GET,HEAD,PUT,PATCH,POST,DELETE） |
| Access-Control-Allow-Headers     | 限定请求头（content-type）                 |
| Access-Control-Max-Age           | 预检请求的缓存时间（单位为秒，-1 不缓存）  |
| Access-Control-Expose-Headers    | 授权客户端能获取到的响应头                 |
| Access-Control-Request-Headers   | 客户端生成的请求头                         |
| Access-Control-Allow-Credentials | 限定客户端可以携带敏感信息                 |
| Vary                             | 定义可变化的头，防止浏览器缓存             |

下面将对上面这些头做个说明。

## Access-Control-Allow-Origin

在 **预检请求** 和 **正常请求** 告知浏览器被允许的源。支持通配符“\*”，但不支持以逗号“,”分割的多源填写方式。

如果尝试些多个域名，则会出现如下错误：

> Response to preflight request doesn't pass access control check: The 'Access-Control-Allow-Origin' header contains multiple values 'aaa,bbb', but only one is allowed.

{% asset_img cors-access-orgin.png 多源错误 %}

另外，也不建议 **Access-Control-Allow-Origin** 以通配符方式定义，这样会增加安全隐患，最好以请求方的 **origin** 来赋值。

```js
const origin = req.headers.origin;
res.setHeader('Access-Control-Allow-Origin', origin || '*');
// 因为会随着客户端请求的 Origin 变化，所以标识 Vary，让浏览器不要缓存
res.setHeader('Vary', 'Origin');
```

## Access-Control-Allow-Methods

被允许的 **Http** 方法，按照需要填写，支持多个，例如： **GET** , **HEAD** , **PUT** , **PATCH** , **POST** , **DELETE** 。

由于判断 **简单请求** 之一的 **HTTP** 方法默认为 **GET** ， **POST** ， **HEAD** ，所以这些即使不在 **Access-Control-Allow-Methods** 约定，浏览器也是支持的。

比如：如果服务端定义 **PUT** 方法，而客户端发送的方法为 **DELETE**，则会出现如下错误：

```js
res.setHeader('Access-Control-Allow-Methods', 'PUT');
```

> Method DELETE is not allowed by Access-Control-Allow-Methods in preflight response.

{% asset_img cors-access-method.png 方法错误 %}

## Access-Control-Allow-Headers

在 **预检接口** 告知客户端允许的请求头。

像 **简单请求** 约定的请求头默认支持： **Accept** 、 **Accept-Language** 、 **Content-Language** 、 **Content-Type** （**text/plain、multipart/form-data、application/x-www-form-urlencoded**）

如果客户端的请求头不在定义范围内，则会报错：

> Request header field abc is not allowed by Access-Control-Allow-Headers in preflight response.

{% asset_img cors-access-headers.png 请求头错误 %}

需要将此头调整为：

```js
res.setHeader('Access-Control-Allow-Headers', 'content-type, abc');
```

## Access-Control-Max-Age

定义 **预检接口** 告知客户端允许的请求头可以缓存多久。

默认时间规则：

- 在 Firefox 中，上限是 24 小时 （即 86400 秒）。
- 在 Chromium v76 之前， 上限是 10 分钟（即 600 秒)。
- 从 Chromium v76 开始，上限是 2 小时（即 7200 秒)。
- Chromium 同时规定了一个默认值 5 秒。
- 如果值为 -1，表示禁用缓存，则每次请求前都需要使用 OPTIONS 预检请求。

比如设置为 5 秒后，客户端在第一次会发送 **预检接口** 后，5 秒内将不再发送 **预检接口**：

```js
res.setHeader('Access-Control-Max-Age', '5');
```

{% asset_img cors-access-maxage.gif 缓存示例 %}

## Access-Control-Allow-Credentials

跨域的请求，默认浏览器不会将当前地址的 Cookies 信息传给服务器，以确保信息的安全性。如果有需要，服务端需要设置 **Access-Control-Allow-Credentials** 响应头，另外客户端也需要开启 **withCredentials** 配置。

```js
// 客户端请求
axios.post(
  'http://127.0.0.1:3000/test/cors',
  {},
  {
    headers: {
      'content-type': 'application/json',
      abc: '123',
    },
    withCredentials: true,
  }
);
```

```js
// 所有请求
res.setHeader('Access-Control-Allow-Credentials', 'true');
```

需要注意的是，**Access-Control-Allow-Origin** 不能设置通配符“\*”方式，会出现如下错误：

{% asset_img cors-access-credentials.png 不支持通配符 %}

这个 **Access-Control-Allow-Origin** 必须是当前页面源的地址。

## Access-Control-Expose-Headers

和 **Access-Control-Allow-Credentials** 类似，如果服务端有自定义设置的请求头，跨域的客户端请求在响应信息中是接收不到该请求头的。

```js
// 服务端
res.setHeader('def', '123');
```

```js
axios
  .post(
    'http://127.0.0.1:3000/test/cors',
    {},
    {
      headers: {
        'content-type': 'application/json',
        abc: '123',
      },
      withCredentials: true,
    }
  )
  .then((data) => {
    console.log(data.headers.def); //undefined
  });
```

需要在服务端设置 **Access-Control-Expose-Headers** 响应头，并标记哪些头是客户端能获取到的：

```js
res.setHeader('Access-Control-Expose-Headers', 'def');
res.setHeader('def', '123');
```

## Access-Control-Request-Headers

我试了半天没找到 **Access-Control-Request-Headers** 的使用示例，其实它是根据当前请求的头拼接得到的。

如果客户端的请求头为：

```json
{
  "content-type": "application/json",
  "abc": "123",
  "xyz": "123",
},
```

那么浏览器最后会在 **预检接口** 添加一个 **Access-Control-Request-Headers** 的头，其值为：abc,content-type,xyz。然后服务端再根据 **Access-Control-Allow-Headers** 告诉浏览器服务端的请求头支持说明，最后浏览器判断是否会有跨域错误。

另外，对于服务端也需要针对 **Access-Control-Request-Headers** 做 **Vary** 处理：

```js
res.setHeader('Vary', 'Origin' + ', ' + req.headers['access-control-request-headers']);
```

如此，对于跨域及其怎么处理头信息会有个基本的概念。希望在遇到类似问题能有章法的解决，而非胡乱尝试。
