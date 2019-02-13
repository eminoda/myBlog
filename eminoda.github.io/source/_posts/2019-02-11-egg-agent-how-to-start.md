---
title: egg agent 怎么通知 master 我准备好了
tags:
    - egg
categories:
    - 开发
    - node
thumb_img: egg.png
date: 2019-02-11 13:32:13
---

egg **为企业级框架和应用而生**。在国内，像我们这种小创业公司如果需要 Node 服务端的支持，egg 是不错的框架选型（不吹不黑，很省力）。

学习需要，看了部分源码遇到些“困难”，百度后大多源码解析的 blog 未找到合适的解答（可能我这问题太小了），所以对部分逻辑做了些阅读，这里留做记录。

# 疑问

首先 egg 是通过 parent、master、agent、app 之间的相互通讯对整个应用的“生命周期”进行细致的控制，如下图：

```js
/**
 * master messenger,provide communication between parent, master, agent and app.
 *
 *             ┌────────┐
 *             │ parent │
 *            /└────────┘\
 *           /     |      \
 *          /  ┌────────┐  \
 *         /   │ master │   \
 *        /    └────────┘    \
 *       /     /         \    \
 *     ┌───────┐         ┌───────┐
 *     │ agent │ ------- │  app  │
 *     └───────┘         └───────┘
 **/
```

顺着这样的事件通讯方式，找到如下代码：

```js
// agent_worker.js
agent.ready(err => {
    ...
    agent.removeListener('error', startErrorHandler);
    process.send({ action: 'agent-start', to: 'master' });
});

```

很明显，猜都能猜到这代码作用：通过 IPC 把数据传送给 master。

但是 **疑问** 来了 agent_worker 的 agent-start 怎么告知 master 他准备好了，来执行之后的逻辑？

# 找答案

源码只要抽丝剥茧总能找到答案，这个开卷考试一样，虽然简单，但漏看一些细节可能会消耗你大量的时间。起码我花了一点精力才捋顺出来（:grimacing: level 不够），下面逐步详细说明：

## child_process

egg 的 master-worker 模式在 egg-cluster 模块中实现，由 egg-script 所触发运行。

首先通过 spawn 创建一个新进程去执行 egg 的 master-worker 模式。

```js
// egg-scripts\lib\cmd\start.js
const child = (this.child = spawn(command, eggArgs, options));
```

spawn 的 eggArgs 实际会运行如下 script：

```js
// egg-cluster\index.js
exports.startCluster = function(options, callback) {
	new Master(options).ready(callback);
};
```

Master 实例化后，会创建 agent 进程：

```js
// fork agent worker (agent_worker.js)
const agentWorker = childprocess.fork(this.getAgentWorkerFile(), args, opt);
```

在 agent_worker.js 中代码很简短，很明显能看到如下代码：

```js
// agent_worker.js
agent.ready(err => {
    ...
    agent.removeListener('error', startErrorHandler);
    process.send({ action: 'agent-start', to: 'master' });
});
```

可能就会产生这几个疑问：

-   process.send 肯定会把 **agent-start** 发送出去，master 怎么接收到 **agent-start** 事件？
-   agent_worker fork 完后是不是默认就加载 ready 方法了？

## EventEmitter

先来看第一个问题

> master 怎么接收到 **agent-start** 事件？

Master 继承 EventEmitter，初始化时会监听一系列方法，这里就定义了 **agent-start** 事件的监听，并且只执行一次。

```js
// master.js
class Master extends EventEmitter {
    constructor(options){
        ...
        this.on('agent-exit', this.onAgentExit.bind(this));
        this.on('agent-start', this.onAgentStart.bind(this));
        this.on('app-exit', this.onAppExit.bind(this));
        this.on('app-start', this.onAppStart.bind(this));
        this.on('reload-worker', this.onReload.bind(this));

        // fork app workers after agent started
        this.once('agent-start', this.forkAppWorkers.bind(this));
        ...
    }
}
```

通过 messenger 消息传递方法，建立 master 和 worker 之间的 **事件通讯**。其实内部就是 emit 和 on 的 api 关系。

```js
// messenger.js
sendToMaster(data) {
    this.master.emit(data.action, data.data);
}
```

在 fork agent_worker.js 后，会有个 message 事件监听 agent_worker send 出来的事件，并且也通过 messenger 告知 master。

```js
forkAgentWorker(){
    ...
    agentWorker.on('message', msg => {
        if (typeof msg === 'string') msg = { action: msg, data: msg };
        msg.from = 'agent';
        this.messenger.send(msg);
    });
    ...
}
```

如果没弄清 agent.ready() 这个方法，上面这些都只属于“合理”的猜测。

## get-ready

再来是第二个问题：

> agent_worker fork 完后是不是默认就加载 ready 方法了？

这里开始会涉及 **get-ready** 和 **ready-callback** 阿里大佬写的 npm 工具包，这是解决这个疑问的 **关键之处**。

应该注意到整个 egg 到处都有 ready(...) 式的方法。

首先来看下 [**get-ready**](https://www.npmjs.com/package/get-ready) 有什么用？

-   通过 ready.mixin 将目标对象 obj 绑定到 ready 共享属性上
-   定义 obj.ready(fn)，将 fn 推到 READY_CALLBACKS 队列中
-   传入指定的 flagOrFunction 类型（true），来执行 ready 中预定义好的 READY_CALLBACKS 队列

来看下 agent 相关整个链路怎么做的：

实例化 Agent 对象，调用父类 ready 方法

```js
const agent = new Agent(options);
agent.ready(err => {
    ...
    process.send({ action: 'agent-start', to: 'master' });
});
```

Agent 继承于 EggApplication，并且 EggApplication 也调用父类 ready 方法。同时 EggApplication 继承于 EggCore。

```js
class Agent extends EggApplication {
    ...
}
class EggApplication extends EggCore {
    ...
    this.ready(() => process.nextTick(() => {
      ...
    }));
}
```

EggCore 初始化创建了 Lifecycle，并定义了 ready 方法，实际上返回 Lifecycle 实例方法。

```js
class EggCore extends KoaApplication {
    constructor(options = {}) {
        ...
        this.lifecycle = new Lifecycle({...})
    }
    ready(flagOrFunction) {
        return this.lifecycle.ready(flagOrFunction);
    }
}
```

注意到 Lifecycle 中使用了 get-ready 模块，并且通过 mixin 将 ready 绑定到 this 上。这样 agent_worker 中定义的 agent.ready function 就被加入到队列中。

```js
const getReady = require('get-ready');
class Lifecycle extends EventEmitter {
    constructor(options) {
        getReady.mixin(this);
        ...
        this[INIT_READY]();
    }
}
```

这个链路算是走到底了，但是没有发现那里触发 ready 中定义的 READY_CALLBACKS，即 ready(true) 类似这句话。这就和另一个模块 ready-callback 有关了。

## ready-callback

在 Lifecycle 初始化时，调用 [INIT_READY] 方法，实例化了 Ready 对象。

```js
const { Ready } = require('ready-callback');
[INIT_READY]() {
    this.loadReady = new Ready({ timeout: this.readyTimeout });
    this[DELEGATE_READY_EVENT](this.loadReady);
    this.loadReady.ready(err => {
        ...
    });

    this.bootReady = new Ready({ timeout: this.readyTimeout, lazyStart: true });
    this[DELEGATE_READY_EVENT](this.bootReady);
    this.bootReady.ready(err => {
        this.ready(err || true);
    });
}
```

ready-callback 属于 get-ready 的上层封装，也 mixin 到 Ready 对象上，具备 ready 属性。

在执行相关初始化 api 时，就能看到如下调用逻辑：

```js
start() {
    setImmediate(() => {
        ...
        this.ready(true);
    });
}
```

这样所有的 ready 定义的方法将会被按顺序执行，解释了 agent.ready 的运行触发点。

到此算是解答了开头两个疑问。

## 总结

这个问题其实不算复杂，主要牵扯的对象太多容易乱。这里贴下简易 demo 版本说明下：

```js
const ready = require('get-ready');

class Life {
	constructor() {
		ready.mixin(this);
	}
	start(fn) {
		this.ready = fn;
		this.ready(true);
	}
}

class Core {
	constructor() {
		this.lifecycle = new Life();
	}
	ready(fn) {
		return this.lifecycle.start(fn);
	}
}
class Agent extends Core {
	constructor() {
		super();
	}
}

class Master {
	constructor() {
		ready.mixin(this);
		this.ready(() => {
			console.log('master ready');
		});
		// this.ready(true);
		this.callAgent();
	}
	callAgent() {
		const agent = new Agent();
		agent.ready(err => {
			console.log('agent ready');
		});
	}
}
new Master().ready(undefined); //agent ready
```
