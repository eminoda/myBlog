---
title: log4js 在 pm2 cluster 下的配置
tags:
  - pm2
  - log4js
  - node
categories:
  - 开发
  - 前端开发
thumb_img: node.png
date: 2019-10-22 14:05:03
---


log4js 算是“出镜率”很高的日志记录工具了，适用于大多数的日志需求（日志分级、按时间分割文件、按不同分类记录等...）。

但在 **多线程** 状态下，结果却不符合预期，比如：日志不输出、记录也不完整。

社区解决方案很详细，这里做个总结。

## 普通的 log4js 配置（单线程）

```js
// config.js
module.exports = {
  appenders: {
    out: {
      type: "console"
    },
    access: {
      type: "dateFile", // 日期类型
      filename: "log/node/buss", // 日志输出路径，及命名
      pattern: "yyyy-MM-dd.log", // 日志命名的时间戳
      alwaysIncludePattern: true
    },
    error: {
      type: "dateFile",
      filename: "log/node/error",
      pattern: "yyyy-MM-dd.log",
      alwaysIncludePattern: true
    }
  },
  categories: {
    default: {
      appenders: ["access", "out", "error"],
      level: "debug"
    }
  }
};
```

调用

```js
const log4js = require("log4js");
log4js.configure(require("./config.js"));
const logger = log4js.getLogger("foo");

logger.info("say somthing");
```

一切都符合预期

## 当遇到 PM2 时（cluster）

为充分利用 cpu ，给应用开启多核能力，最方便莫过于使用 pm2 模块。具体使用不做赘述，[简单使用，官网的文档足够了](http://pm2.keymetrics.io/docs/usage/pm2-doc-single-page/)

但开启多 cluster 后，log4js 日志却没有输出，不然也不会有那么多人苦恼了。

### 配置修改

直接贴出“可用”配置

**修改 log4js 配置**

回到官网，[看下有什么特殊配置，点击查看](https://log4js-node.github.io/log4js-node/api.html#configuration-object)，不过还得抱怨一下，log4js 的文档真的很“蛋疼”。

log4js.config.js

```js
module.exports = {
  /**
   * pm2 (boolean) (optional)
   * - set this to true if you’re running your app using pm2,
   * otherwise logs will not work (you’ll also need to install pm2-intercom as pm2 module: pm2 install pm2-intercom)
   */
  pm2: true,
  /**
   * pm2InstanceVar (string) (optional, defaults to ‘NODE_APP_INSTANCE’)
   * - set this if you’re using pm2 and have changed the default name of the NODE_APP_INSTANCE variable.
   */
  pm2InstanceVar: "isMaster"
  /**
   * disableClustering (boolean) (optional)
   * - set this to true if you liked the way log4js used to just ignore clustered environments,
   * or you’re having trouble with PM2 logging. Each worker process will do its own logging. Be careful with this if you’re logging to files, weirdness can occur.
   */
  // disableClustering: true,

  // 原有配置，这里不再列举
  appenders: {}
  categories: {}
};
```

pm2.json

```json
{
  "apps": [
    {
      "name": "logger-test",
      "script": "http.js",
      "ignoreWatch": ["node_modules"],
      "instances": "4",
      "watch": false,
      "error_file": "log/pm2/error.log",
      "out_file": "log/pm2/out.log",
      "pid_file": "log/pm2/pid.log",
      "merge_logs": true,
      "instance_var": "isMaster"
    }
  ]
}
```

### 修改配置说明

pm2.json

```json
"instance_var": "NODE_APP_INSTANCE"
```

设置 instance_var 实例变量，在交给 pm2 运行后，会自动赋值给 process.env.NODE_APP_INSTANCE 。详细说明可以看下 [官网说明](http://pm2.keymetrics.io/docs/usage/environment/#specific-environment-variables)

log4js.conf.js

```js
{
  pm2: true,
  pm2InstanceVar: "NODE_APP_INSTANCE"
}
```

先结合 pm2 的 instance_var 配置，看下 log4js 的 pm2InstanceVar ，这两者必须设置的值相同。因为有关 isPM2Master 的逻辑判断：

```js
const isPM2Master = () => pm2 && process.env[pm2InstanceVar] === "0";
```

再来具体看下 log4js 相关代码：

```js
// node_modules\log4js\lib\clustering.js
if (!disabled) {
  configuration.addListener(config => {
    // ...
    ({
      pm2,
      disableClustering: disabled,
      pm2InstanceVar = "NODE_APP_INSTANCE"
    } = config);
    // ...
    // just in case configure is called after shutdown
    if (pm2) {
      process.removeListener("message", receiver);
    }
    if (cluster && cluster.removeListener) {
      cluster.removeListener("message", receiver);
    }

    if (disabled || config.disableClustering) {
      debug("Not listening for cluster messages, because clustering disabled.");
    } else if (isPM2Master()) {
      // PM2 cluster support
      // PM2 runs everything as workers - install pm2-intercom for this to work.
      // we only want one of the app instances to write logs
      debug("listening for PM2 broadcast messages");
      process.on("message", receiver);
    } else if (cluster.isMaster) {
      debug("listening for cluster messages");
      cluster.on("message", receiver);
    } else {
      debug("not listening for messages, because we are not a master process");
    }
}
```

根据新增参数，预先移除原有的事件监听方式，当 isPM2Master 判断为 pm2 为主进程时，pm2-intercom 作为新的消息收发“中转站”。

这就是为何配置了 log4js 的配置，但 **没有安装 pm2-intercom** ，就会发生日志不输出的情况。

当然如果你图方便，在出现一些“未知错误”，可以尝试在 log4js 添加如下配置：

```js
disableClustering: true;
```

它会使上面所说的方式失效，每个线程将会单独向目标日志文件输出内容，表明似乎问题可以解决，但是在高频访问下会出现日志缺失的情况。毕竟日志文件被多个进程写入放操作着。

## 有效的日志管理

对于一个线上的项目，可能需要一些其他手段来对日志做维护管理。既然现在说 pm2 ，就要看下其日志插件：**pm2-logrotate**

来看下具体配置：

```
[root@localhost ~]# pm2 get pm2-logrotate
== pm2-logrotate ==
┌────────────────┬─────────────────────┐
│ key            │ value               │
├────────────────┼─────────────────────┤
│ max_size       │ 10M                 │
│ retain         │ 10                  │
│ compress       │ false               │
│ dateFormat     │ YYYY-MM-DD_HH-mm-ss │
│ workerInterval │ 30                  │
│ rotateInterval │ 0 0 * * *           │
│ rotateModule   │ true                │
└────────────────┴─────────────────────┘
```

### 定时轮询

**rotateInterval** 和 **workerInterval** 都有定时的作用。

前者通过编写 cron 表达式，约定每隔多少时间 **强制** 检查日志的状态。

```shell
# 每日零点
rotateInterval: 0 0 * * *
# 每分钟
rotateInterval: */1 * * * *
```

后者 workerInterval 是约定固定秒数来查询日志状况。（默认 30 秒）

### 日志分割条件

**max_size** 和 **retain** 分别来约束日志的大小，和文件个数

每次 **定时轮询** 触发后，会对文件大小，数量进行检查。超过约定的值，则会重新创建新文件。

### 实际运用

假设单日日志产出为 10G ，按照 rotateInterval 每天零点进行切割日志，虽然有章法，但如果要从 10G 大小的日志文件中排查问题，这似乎有些困难。

我们可以设置 max_size 为 100M ，这样 10G 总大小的文件，将在一天中被切成 100 个。

甚至如果每天的访问量有迹可循，比如上午 9-12 点会出现高峰，其他时间相对低频。可以进一步优化 workerInterval 和 rotateInterval cron 表达式：

```shell
pm2 set pm2-logrotate:workerInterval 3600 #每小时轮训检查
pm2 set pm2-logrotate:rotateInterval 0/30 0,9,10,11,12 * * * #每天 0 点，以及 9~12 点每半小时触发
```

这样在高访问时间段，可以跟有效的分割日志。（美中不足的是如果符合日志分割条件，00:00 和 00:30 时，会出现两份日志，强迫症表示不太适应）

## 参考

> 我只是知识点的“加工者”， 更多内容请查阅原文链接 :thought_balloon: ， 同时感谢原作者的付出：

- [记 nodejs 在 pm2 下使用 log4js cluster 模式的日志打印丢失问题](https://my.oschina.net/xuyang950520/blog/2934086)
- [再说打日志你不会，pm2 + log4js，你值得拥有](https://juejin.im/post/5b7d0e20f265da43231f00d4)
- [PM2 cluster + log4js？并不理想的组合](https://claude-ray.github.io/2018/12/21/pm2-cluster-log4js/)
