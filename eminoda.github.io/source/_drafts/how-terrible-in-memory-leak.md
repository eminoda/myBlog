---
title: 令人“头大”的 Nodejs 内存泄露
tags:
  - 性能优化
categories:
  - 开发
  - 前端开发
thumb_img: node.png
---

线上环境居然遇到了内存泄露，经过 3 天的摸索，算是解决了：

> 更换 pm2 版本，由 v3.5.1 降为 v3.4.1

对于这个结论还是不太满意，算是歪打正着。不过还是记录下这几天**积累的经验**，说不定对正在看此文的你会有帮助。

## 前言（鼓励）

有幸，我这次有充足的时间去排查，没有其他事情干扰。但线上出现**内存泄漏**，解决起来比业务代码 bug 更难解决，那种头皮发麻的难受。

- 项目代码复杂。排查“泄漏点”，犹如大海捞针
- 开放的前端模式。顾及不暇的 node_modules 模块
- 无形的压力。需要时间拿数据做佐证，时间等的越长，压力越来

不管有没有精力 or 能力，我认为 **解决内存泄漏的最佳实践是：积极的心态 + 冷静的问题定位**。（没错，这是对目前没有解决问题的你说的）

## 内存增长的原因

## 对内存进行“检查”

如果你对这块有查询过相关关键字，heapdump 这模块应该频繁出现，这里说下如何使用它来监控项目的内存情况。当然还有 memwatch ...

### 安装

```js
npm install heapdump -S
```

如果你足够幸运，肯定会出现如下问题：

```txt
error: #error This version of node/NAN/v8 requires a C++11 compiler
```

需要更新 linux 系统的 gcc 等库，版本不合适

```shell
# 安装 repo
wget http://people.centos.org/tru/devtools-2/devtools-2.repo
mv devtools-2.repo /etc/yum.repos.d
yum install devtoolset-2-gcc devtoolset-2-binutils devtoolset-2-gcc-c++
# 新建、重置快捷方式
mv /usr/bin/gcc /usr/bin/gcc-4.4.7
mv /usr/bin/g++ /usr/bin/g++-4.4.7
mv /usr/bin/c++ /usr/bin/c++-4.4.7
ln -s /opt/rh/devtoolset-2/root/usr/bin/gcc /usr/bin/gcc
ln -s /opt/rh/devtoolset-2/root/usr/bin/c++ /usr/bin/c++
ln -s /opt/rh/devtoolset-2/root/usr/bin/g++ /usr/bin/g++
# 检查版本
gcc --version
```

当然系统是 window 可能还会有更坑的问题：安装 node-gyp、python 出错

推荐如下工具，一键安装相关组件依赖

```js
npm install --global --production windows-build-tools
```

### 使用

线上很简单的做了一个控制台输出：

```js
var heapdump = require('heapdump');
let startMem = process.memoryUsage();

function calc(data) {
  return Math.round((data / 1024 / 1024) * 10000) / 10000 + ' MB';
}
// 使用的是 koa
router.all('/foo', async (ctx, next) => {
  let mem = process.memoryUsage();
  logger.debug('memory before', calc(startMem.rss), 'memory now:', calc(mem.rss), 'diff increase', calc(mem.rss - startMem.rss));
  // ...
});
```

这样就能实时看到系统的内存消耗（对比刚启动时）

```txt
2019-09-06 16:30 +08:00: [2019-09-06T16:30:06.700] [DEBUG] transfer - memory before 55.5898 MB memory now: 95.1484 MB diff increase 39.5586 MB
2019-09-06 16:30 +08:00: [2019-09-06T16:30:07.724] [DEBUG] transfer - memory before 56.2148 MB memory now: 69.8438 MB diff increase 13.6289 MB
2019-09-06 16:30 +08:00: [2019-09-06T16:30:10.406] [DEBUG] transfer - memory before 56.2148 MB memory now: 70.5977 MB diff increase 14.3828 MB
2019-09-06 16:30 +08:00: [2019-09-06T16:30:11.018] [DEBUG] transfer - memory before 55.5898 MB memory now: 95.4219 MB diff increase 39.832 MB
2019-09-06 16:30 +08:00: [2019-09-06T16:30:12.827] [DEBUG] transfer - memory before 55.5898 MB memory now: 95.6797 MB diff increase 40.0898 MB
2019-09-06 16:30 +08:00: [2019-09-06T16:30:12.952] [DEBUG] transfer - memory before 55.5898 MB memory now: 94.9688 MB diff increase 39.3789 MB
```

添加个快照路由，在按照需要抓取内存此刻使用情况

```js
router.all('/snapshot', async (ctx, next) => {
  heapdump.writeSnapshot('./dump-' + Date.now() + '.heapsnapshot', function(err) {
    if (err) console.error(err);
  });
});
```

导入到 chrome 的 profile 面板中，查看具体信息

{% asset_img devtools.png profile %}

## 猜测的可能点

按照上面的“检查”操作，还是没有定位到问题点。终究还是要分析项目本身。

首先此项目是基于 node 的中间层服务，对 api 接口进行转换。用于由后端 api 服务的“升级”平滑各客户端的发版时差。

技术栈：sequelize + koa + pm2

有幸有个 **项目 B** 和此项目类似，技术上略有差异，就猜测了几个可能的 **内存泄露** 原因（附参考文章）：

- 代码问题
  - 代码逻辑全局缓存问题
    - [Difference between Map and WeakMap in JavaScript](https://www.mattzeunert.com/2017/01/31/weak-maps.html)
  - 项目本身负载能力
- 访问量（项目 A 高于 项目 B）
  - 对数据库的查询的冲击（sequelize）
    - [sequelize 4.37.7 造成内存泄漏](https://github.com/sequelize/sequelize/issues/9062)
    - [sequelize 中 ladash api 变量未回收](https://github.com/sequelize/sequelize/issues/9276)
  - 日志读写堆积（log4js）
    - [PM2 cluster + log4js？并不理想的组合](https://claude-ray.github.io/2018/12/21/pm2-cluster-log4js/)
- 第三方依赖
  - pm2
    - [pm2 memory leak](https://github.com/Unitech/pm2/issues/4302)

### 验证

| 可能原因           | 测试方式                    | 验证结果 | 备注                                                                |
| ------------------ | --------------------------- | -------- | ------------------------------------------------------------------- |
| 代码问题           | ab 压测                     | ok       | 需增加重视，问题潜在点                                              |
| sequlize 版本问题  | ab 压测                     | ok       | 暂不尝试。目前使用 4.42.0，线上无法承担更换版本的风险               |
| Ladash \_.template | ab 压测                     | ok       | 保持现状                                                            |
| log4js 有背压问题  | ab 压测                     | ok       | pm2 & log4js 使用不够友好，在有替代方案前（比如 winston），保持现状 |
| pm2 版本问题       | 线上降低版本 3.5.1 -> 3.4.1 | 待验证   | 项目 B 使用 3.4.1                                                   |

### 结论

这两天从线上情况上看，修改 pm2 版本后，内存泄漏得到控制。下面由此结论反推验证步骤：

1. 使用 devtools ，发现一天的内存差异，TIMERWRAP 指标突增：

   {% asset_img pm2-timewrap.png profile %}

   TIMERWRAP 是 Node 里 Timer 相关定义，猜测是否有定时器在有规律的无限刷新占用性能。

2. 继续查看，发现 pm2 有些“格格不入”

   {% asset_img pm2-httpMetrics.png profile %}

   metrics 心跳检测，是否有 setTimeout 之类的代码？

3. 查看资料，发现相关 issus 中说代码有 leak

   {% asset_img pm2-io.jpg @pm2/io %}

   查看线上项目相关代码，的确有这段问题代码：

   {% asset_img pm2-memory-leak.png @pm2/io %}

   对于为何这段 if/else 会造成内存泄漏，还需要之后看下 pm2 相关逻辑（放到 todo list 中，谁知道也请公众号留言回复）

## 参考

> 我只是知识点的“加工者”， 更多内容请查阅原文链接 :thought_balloon: ， 同时感谢原作者的付出：

- [JavaScript 内存泄漏教程](http://www.ruanyifeng.com/blog/2017/04/memory-leak.html)
- [深入解析 ES Module](https://zhuanlan.zhihu.com/p/40733281)
- [Difference between Map and WeakMap in JavaScript](https://www.mattzeunert.com/2017/01/31/weak-maps.html)
- [ES6 Map vs WeakMap vs plain Objects – Describing the differences](http://voidcanvas.com/map-weakmap-pojo/)
- [sequelize 4.37.7 造成内存泄漏](https://github.com/sequelize/sequelize/issues/9062)
- [sequelize 中 ladash api 变量未回收](https://github.com/sequelize/sequelize/issues/9276)
- [PM2 cluster + log4js？并不理想的组合](https://claude-ray.github.io/2018/12/21/pm2-cluster-log4js/)
- [pm2 memory leak](https://github.com/Unitech/pm2/issues/4302)
- [记录一次安装 heapdump,报 node-gyp rebuild failed 的问题](https://blog.csdn.net/f_9628/article/details/88708763)
