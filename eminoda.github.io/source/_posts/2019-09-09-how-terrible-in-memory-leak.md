---
title: 令人“头大”的 Nodejs 内存泄露
tags:
  - 性能优化
categories:
  - 开发
  - 前端开发
thumb_img: node.png
date: 2019-09-09 18:21:29
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

可以看下这篇文章 [Finding And Fixing Node.js Memory Leaks: A Practical Guide](https://marmelab.com/blog/2018/04/03/how-to-track-and-fix-memory-leak-with-nodejs.html)

- 全局变量
- 代码缓存
- 闭包
- ...

其实不管什么原因，主要还是 **各种引用** 得不到 V8 GC 的释放。如下，扔一段很经典的代码：

```js
function calc(data) {
  return Math.round((data / 1024 / 1024) * 100) / 100 + ' MB';
}
function logger() {
  let mem = process.memoryUsage();
  console.log(new Date(), 'memory now:', calc(mem.rss));
}
var theThing = null;
var replaceThing = function() {
  logger();
  var originalThing = theThing;
  var unused = function foo() {
    if (originalThing) {
      console.log('未被调用，但 originalThing 有个 someMethod 的引用');
    }
  };
  theThing = {
    longStr: new Array(1000000).join('*'),
    someMethod: function() {
      console.log('没做任何事情，但我是闭包');
    }
  };
  console.log('parse');
};
setInterval(replaceThing, 10);
```

执行没多久，就从 20M 飚到 几百 M。究其原因，还是因为闭包引用没有及时被销毁：

虽然 **unused** 没有被调用，但是其中包含 **originalThing** 并指向 **theThing** **，theThing** 在定义时有个 **someMethod** 方法，其就是个闭包（可以访问到 **originalThing**） ，该闭包在 **unused** 中由于引用了 **originalThing** 一直没有被释放。

{% asset_img scope-ref.png 层层嵌套的引用 %}

## 对内存进行“检查”

如果你对这块有查询过相关资料， **heapdump** 这模块应该频繁出现，这里说下如何使用它来监控项目的内存情况。当然还有 **memwatch** ...

### 安装

```js
npm install heapdump -S
```

如果你足够幸运，肯定会出现如下问题：

```txt
error: #error This version of node/NAN/v8 requires a C++11 compiler
```

需要更新 linux 系统的 gcc 等库，原因是原版本过低

```shell
# 安装 repo 仓库
wget http://people.centos.org/tru/devtools-2/devtools-2.repo
mv devtools-2.repo /etc/yum.repos.d

# 安装新库
yum install devtoolset-2-gcc devtoolset-2-binutils devtoolset-2-gcc-c++

# 备份原库
mv /usr/bin/gcc /usr/bin/gcc-4.4.7
mv /usr/bin/g++ /usr/bin/g++-4.4.7
mv /usr/bin/c++ /usr/bin/c++-4.4.7

# 创建快捷方式，将新库链到需要目录
ln -s /opt/rh/devtoolset-2/root/usr/bin/gcc /usr/bin/gcc
ln -s /opt/rh/devtoolset-2/root/usr/bin/c++ /usr/bin/c++
ln -s /opt/rh/devtoolset-2/root/usr/bin/g++ /usr/bin/g++

# 检查版本，确定生效
gcc --version
```

当然系统是 window 可能还会有更坑的问题：安装 node-gyp、python 出错

推荐如下工具，一键安装相关组件依赖（我们只要静静的等待，因为时间有些久）。他会帮你安装 window 对应的 **NET Framework**，python

```js
npm install --global --production windows-build-tools
```

### 使用

线上很简单的做了一个控制台输出，用于定位问题：

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

导入到 chrome 的 profile 面板中，对比前后两个文件的变化，定位问题

{% asset_img devtools.png profile %}

## 猜测的可能点

如果按照上述的“检查”操作还是没有定位到问题点，可能这段会对你有所帮助。

首先此项目是基于 node 的中间层服务，对 api 接口进行转换。用于由后端 api 服务的“升级”平滑各客户端的发版时差。

技术栈：sequelize + koa + pm2 （你最好熟悉项目的主要框架，定位问题有极大帮助）

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
| 代码问题           | ab 压测                     | ok       | 但需增加重视                                                        |
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

   对于为何这段 if/else 会造成内存泄漏，有空再研究下。

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
- [Finding And Fixing Node.js Memory Leaks: A Practical Guide](https://marmelab.com/blog/2018/04/03/how-to-track-and-fix-memory-leak-with-nodejs.html)
- [JavaScript 内存优化](https://www.cnblogs.com/mliudong/p/3635294.html)
- [An interesting kind of JavaScript memory leak](https://blog.meteor.com/an-interesting-kind-of-javascript-memory-leak-8b47d2e7f156?gi=3db08c12c287)
- [4 类 JavaScript 内存泄漏及如何避免](https://jinlong.github.io/2016/05/01/4-Types-of-Memory-Leaks-in-JavaScript-and-How-to-Get-Rid-Of-Them/)
- [JavaScript 闭包详解](https://juejin.im/post/5b3ae7b8f265da62cb1db9e0)
