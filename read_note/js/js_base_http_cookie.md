---
js 基础 -- cookie
---

# cookie

处理业务需求遇到过如下几个问题，有必要复盘对 cookie 做个汇总：

- cookie 的存储受 domain 和 path 影响，那 port 端口是会影响？
- js 如何获取浏览器 cookie？
- cookie 的失效时间，以及 maxAge 和 Expires 的区别？
- ...

先介绍下 cookie

HTTP cookie 是当用户访问网页时，由服务端给客户端发送并存储的一个小数据片，由于 HTTP 是无状态的，所以通过 cookie 方式持久化一些有特殊业务作用的数据信息（比如，购物车记录、用户校验信息等）

## cookie 几个重要属性

![cookie 几个重要属性](https://github.com/eminoda/myBlog/blob/master/imgs/js_base/cookie.png?raw=true)


### Domain 和 Path

这两个属性都关系到存储 cookie 的存储域。

基于 cookie 的域名安全机制 **同源策略**，www.a.com 域下是不能够访问 www.b.com 下的 cookie 信息的。

但要注意如果 cookie 存放在顶级域名（top domain）下，www.a.com 是能够访问到 a.com 的信息。

同样的，path 路径如果设置了 /page/user ，那 /page/shop 就拿不到前者的 cookie 信息，最好就设置 / 根路径。

再说下 port

可能你在测试环境部署多套项目，即使一个 ip 不同端口， cookie 也会公用。

### Expires 和 Max-Age

Expires 和 Max-Age 的设置都可以使 cookie 失效过期，只是前者是一个 Date 的日期；后者为过期的秒数，低版本 IE （6，7，8）不支持此属性，绝大多数浏览器都支持此两者属性，并优先支持 Max-Age。

值得注意的，不同的时区 TimeZone，会导致记录到浏览器的过期时间不同，比如：GMT（格林尼治平时），UTC（协调世界时）

````js
new Date(); // Sun Jun 02 2019 23:23:50 GMT+0800 (中国标准时间)
new Date().toUTCString(); // Sun, 02 Jun 2019 15:24:01 GMT
new Date().toGMTString(); // Sun, 02 Jun 2019 15:33:46 GMT

// 另外还有 ISO 标准的时间输出
new Date().toISOString(); // 2019-06-02T15:37:54.607Z
````

另外，前两天遇到 Node 端重写 cookie，由于 java Expires 过期时间的输出“不正确”，导致 koa 的 cookie 解析时间失败，临时做了如下调整：

````js
ctx.cookies.set('name', 'tobi', {
    path: '/',
    domain: 'foo.com',
    expires: new Date((new Date().getTime() + maxAge * 1000)).toUTCString() // maxAge 后端 java 返回获得
});
````

### Secure and HttpOnly

这是从安全的角度的两个属性，如果设置了，前者 Secure 会让浏览器无法通过 javascript 来获取到 cookie 信息；后者 HttpOnly 会让 cookie 信息只在 Https 协议中传输。

## session

与 cookie 不同，前者存放在客户端，后者是记录于浏览器内存中的。 session 是和服务端一同“配合”让数据持久化的技术方案，都是解决 http 无状态这类问题。

服务端向客户端浏览器丢个 sessionId （比如，Tomcat 里的 JESSIONID），每次 http 请求，都会把当前会话的 sessionId 传给服务端，从而处理实际的业务问题。

当然浏览器关闭后，session 域保存的东西就没有了。

## 怎么通过 js 获取 cookie

````js
document.cookie // 即可输出所有 cookie
````

利用正则遍历出所有 cookie

````js
let cookies = document.cookie;
let cRE = /(\w+)=(\w+);/g; // 参考
let result = cRE.exec(cookies);
while(result){
    console.log(`key:${result[1]},value:${result[2]}`);
    result = cRE.exec(cookies);;
}
````

也可以通过 document.cookie.split('; '); 这种简单的方法进行切割分组（npm cookie 就是这样做的）

## cookie 的保护

### 属性入手
对于设置 cookie 几个属性，当然不要忽略 Secure and HttpOnly 这两个属性

### 不要永久缓存
对每个 cookie 设置符合业务需求的过期时间

### 加密
通常我们不会对 cookie 信息进行加密，但既然是本地数据就很容易被人模拟。

为了增加网站安全，可以的话做点 Token 机制的安全手段

## 怎么查看 Chrome 的 Cookie？

当然大家都是专内人士，可以 F12 查看到 cookie 信息。但具体本地的 cookie 存放在哪里呢？

这里介绍个工具 sqlite

> SQLite是一个进程内的库，实现了自给自足的、无服务器的、零配置的、事务性的 SQL 数据库引擎。它是一个零配置的数据库，这意味着与其他数据库一样，您不需要在系统中配置。
就像其他数据库，SQLite 引擎不是一个独立的进程，可以按应用程序需求进行静态或动态连接。SQLite 直接访问其存储文件。

当然我不是转玩这东西的，不过你要知道 chrome 的 cookie 就是靠 sqlite 存放在你的电脑里。

拿 window10 举例，路径在：C:\Users\Administrator\AppData\Local\Google\Chrome\User Data\Default\Cookie (当然这个“数据库”文件你普通方式打开是乱码)

现在简单说下怎么把 cookie 的东西展示出来：

1. 下载并安装 sqlite3
   
    如果你是 window 电脑，就找这个栏目下载 [Precompiled Binaries for Windows](https://www.sqlite.org/download.html)，根据自己系统下载对应的 dll 并放到最后的 sqlite-tools-xxx 中。

2. 执行命令查看

    ![对应命令](https://github.com/eminoda/myBlog/blob/master/imgs/js_base/sqlite3.png?raw=true)

    根据上图能大概了解 cookie 的表格定义，和本地数据信息（不过这些信息都加密的）

## 参考
> 我只是知识点的“加工者”，更多内容请查阅原文链接 :thought_balloon: ，同时感谢原作者的付出：

- [HTTP_cookie wiki](https://en.wikipedia.org/wiki/HTTP_cookie)
- [SQLite 简介](https://www.runoob.com/sqlite/sqlite-intro.html)
- [SQLite 安装](https://www.runoob.com/sqlite/sqlite-installation.html)
- [Set-Cookie MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie)