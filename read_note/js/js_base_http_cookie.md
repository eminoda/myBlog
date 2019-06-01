---
js 基础 -- cookies
---

# cookies

处理业务需求遇到过如下几个问题，有必要复盘对 cookies 做个汇总：

-   cookies 的存储受 domain 和 path 影响，那 port 端口是会影响？
-   js 如何获取浏览器 cookies？
-   服务端如何重写 cookies 到客户端？
-   cookies 的失效时间，以及 maxAge 和 Expires 的区别？
-   ...

先介绍下 cookies


## 怎么查看 Chrome 的 Cookies？

当然大家都是专内人士，可以 F12 查看到 cookies 信息。但具体本地的 cookies 存放在哪里呢？

这里介绍个工具 sqlite

> SQLite是一个进程内的库，实现了自给自足的、无服务器的、零配置的、事务性的 SQL 数据库引擎。它是一个零配置的数据库，这意味着与其他数据库一样，您不需要在系统中配置。
就像其他数据库，SQLite 引擎不是一个独立的进程，可以按应用程序需求进行静态或动态连接。SQLite 直接访问其存储文件。

当然我不是转玩这东西的，不过你要知道 chrome 的 cookie 就是靠 sqlite 存放在你的电脑里。

拿 window10 举例，路径在：C:\Users\Administrator\AppData\Local\Google\Chrome\User Data\Default\Cookies (当然这个“数据库”文件你普通方式打开是乱码)

现在简单说下怎么把 cookies 的东西展示出来：

1. 下载并安装 sqlite3
   
    如果你是 window 电脑，就找这个栏目下载 [Precompiled Binaries for Windows](https://www.sqlite.org/download.html)，根据自己系统下载对应的 dll 并放到最后的 sqlite-tools-xxx 中。

2. 执行命令查看

    ![对应命令](https://github.com/eminoda/myBlog/blob/master/imgs/js_base/sqlite3.png?raw=true)

    根据上图能清楚了解 cookies 的表格定义，和本地数据信息（不过这些信息都加密的）

## 参考
> 我只是知识点的“加工者”，更多内容请查阅原文链接 :thought_balloon: ，同时感谢原作者的付出：

- [SQLite 简介](https://www.runoob.com/sqlite/sqlite-intro.html)
- [SQLite 安装](https://www.runoob.com/sqlite/sqlite-installation.html)