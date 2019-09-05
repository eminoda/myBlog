---
title: node 和 java 性能对比
tags:
  - 测试
  - ab
categories:
  - 开发
  - 前端开发
date: 2018-11-08 17:33:36
thumb_img: node.png
---

# 背景引出

线上网站遭受攻击，首页被强刷，导致服务器 node 性能过载，影响用户正常页面访问。

大致架构：客户端发起请求 --> node（充当中间件，访问后端 API 渲染页面） --> java（处理业务逻辑）--> database

# 现象&问题

| 现象                         | 疑惑                   |
| ---------------------------- | ---------------------- |
| Nodejs cup 满负载            | 与 Nodejs 高性能不符？ |
| 后端 Java 的负载和 Node 相反 | 怎么性能优于 Nodejs？  |

# node 和 java 来个简单测试（偏娱乐向）

## 前期测试准备

分别用以下方式模拟一个线上获取用户信息的接口：

1. node 直连 mysql
2. node 调用 java 接口来获取数据。

框架：koa+koa-router+sequelize+request+pm2

备注：由于不太清楚后端业务数据取值逻辑，尽可能还原 response data，会存在一定的数据包偏差。

**简要代码**

```js
router.all('/api/java', async function(ctx, next) {
  let uid = ctx.cookies.get('uid');
  // request代理给后端java API接口
  ctx.body = await new Http({ ctx }).request({
    url: '/user/getbalance'
  });
});
```

```js
router.all('/api/node', async function(ctx, next) {
  let uid = ctx.cookies.get('uid');
  // 通过sequelize从mysql查询
  let data = await Promise.all([user.balance(uid), user.integral(uid), user.coupon(uid), user.memberProp(uid)]);
  ctx.body = data;
});
```

## 分组测试&结论

在测试环境，直接局域网 ab 测试，避免网络 io 损耗。
测试不同并发条件（100->200->500->1k->2k），1w 请求总耗时；**同时 node 增加核数（1 核->2 核->4 核->8 核）**

### Java 测试（node 代理给 java）

再次备注：通过 node 访问 java 接口。（要模拟线上环境，会因为 node 的瓶颈造成 java 负载过低）。

{% asset_img java.png 图1（红 深蓝 浅蓝 橘色代表cpu核数） %}

### Node 测试

node 直连数据库
{% asset_img node.png 图2（红 深蓝 浅蓝 橘色代表cpu核数） %}

### Java&node

直接访问 java 接口，硬碰硬
{% asset_img java_node.png 图3 %}

### 结论

1. node 的强项处理非阻塞异步 IO，但由于是单进程，虽然请求数量增加 ↑，实际到达 java 应用的请求被限制在一个峰值 max，解释了**图 1 红柱：当 cpu1 核时，并发数增多，耗时不变**
2. 知道了 node cpu 瓶颈的原因，通过**pm2**增加核数，让 java 得到更多的资源去处理。**图 1 深蓝浅蓝：cpu 核数增加，耗时缩短**
3. 当 cpu 升值 8 核（测试环境满核），node 基本不会 hold 住任何请求（top 小于 50%），直接丢到 java 端，到达 java 请求数倍增，但由于 java 语言特点（同步阻塞式）、外界因素（测试环境复杂），相反时间没有得到下降而是有上升趋势。**图 1 橘色：有上升趋势**
4. 依托于多核的性能，node 充分利用硬件资源，核数增加 ↑，执行能力正比例上升 ↑。**图 2：耗时随 cpu 核数增加，而倍减**
5. **结合图 1，图 2：**打开 cpu 限制后，不难发现 node 性能迅速上升，符合**外界宣传**，（注：使用了 Promise.all 更加快了异步处理速度）
6. **图 3：node 性能好于 java**，但并发 2k 时，两者还是不分上下，还是要分不同场景对 2 者有个组合使用（注：因为数据库等原因，java 在处理业务时，会大批出现 jdbc 等问题）

# apach ab

## 简单介绍

[apache ab](https://httpd.apache.org/docs/2.4/programs/ab.html)

运行脚本:ab + 请求数量 + 并发数量 + 测试地址

```
[root@localhost pressure_analysis]# ab -n 10000 -c 1000 http://127.0.0.1:3301/anal/api/java
```

参数说明：

| 指标                 | 数值                         | 说明                                                        |
| -------------------- | ---------------------------- | ----------------------------------------------------------- |
| Concurrency Level    | 1000                         | 并发数量                                                    |
| Complete requests    | 10000                        | 全部完成的请求数量                                          |
| Time taken for tests | 7.907 seconds                | 运行测试脚本总用时                                          |
| Total transferred    | 2880000 bytes                | 数据包大小                                                  |
| Requests per second  | 1264.76 [#/sec](mean)        | 平均每秒请求数量（Complete requests/Time taken for tests）  |
| Time per request     | 790.661 [ms](mean)           | 单个请求平均耗时（Concurrency Level\*Time taken for tests） |
| Transfer rate        | 355.71 [Kbytes/sec] received | 数据包传输速率                                              |

## ab 工具使用到的一些问题

### apr_socket_recv: Connection reset by peer (104)

> sysctl 命令被用于在内核运行时动态地修改内核的运行参数，可用的内核参数在目录/proc/sys 中。它包含一些 TCP/ip 堆栈和虚拟内存系统的高级选项， 这可以让有经验的管理员提高引人注目的系统性能。

```
[root@localhost pressure_analysis]# vim /etc/sysctl.conf
net.ipv4.tcp_syncookies = 0

[root@localhost pressure_analysis]# sysctl -p
```

### socket: Too many open files (24)

> ulimit 用来限制系统用户对 shell 资源的访问

```
# 注意到open files限制1024
[root@localhost pressure_analysis]# ulimit -a
core file size          (blocks, -c) 0
data seg size           (kbytes, -d) unlimited
scheduling priority             (-e) 0
file size               (blocks, -f) unlimited
pending signals                 (-i) 257702
max locked memory       (kbytes, -l) 64
max memory size         (kbytes, -m) unlimited
open files                      (-n) 1024
pipe size            (512 bytes, -p) 8
POSIX message queues     (bytes, -q) 819200
real-time priority              (-r) 0
stack size              (kbytes, -s) 10240
cpu time               (seconds, -t) unlimited
max user processes              (-u) 257702
virtual memory          (kbytes, -v) unlimited
file locks                      (-x) unlimited

# 修改配置
[root@localhost pressure_analysis]# ulimit  -n 5000
```

# 参考

- [linux 命令](http://man.linuxde.net/sysctl)
- [sysctl](https://www.cnblogs.com/felixzh/p/8295471.html)
- [ulimit](https://blog.csdn.net/hexuan1/article/details/45191549)
