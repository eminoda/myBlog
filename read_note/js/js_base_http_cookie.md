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
