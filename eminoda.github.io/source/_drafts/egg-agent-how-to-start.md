---
title: egg agent 怎么通知 master "I'm ready"
tags:
    - egg
categories:
    - 前端
    - node
thumb_img: egg.png
---

egg **为企业级框架和应用而生**。在国内，像我们这种创业公司如果需要 Node 服务端的支持，egg 是不错的框架选型（不吹不黑，很省力）。

学习需要，看了部分源码遇到些“困难”，百度后大多源码解析的 blog 未找到合适的解答（可能我这问题太小了），所以对部分逻辑做了些阅读，这里留做记录。

# 疑问

egg 是通过 master,agent,worker 之间的通讯对整个应用的“生命周期”进行细致的控制，如下图：

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

但是疑问来了 agent_worker 怎么告知 master 他准备好了，master 主进程你继续执行后面的逻辑？

# 找答案

源码只要抽丝剥茧总能找到答案，这个开卷考试一样，虽然简单，但漏看一些细节可能会消耗你大量的时间。起码我花了一点经历才摸索出来（:grimacing: level 不够）

## child_process

这算是 node api 的基础，这里可能需要对 spawn 之类的方法有个概念。这样才能知道 master 和 agent 之间通讯的最基本原理。这里不多做说明。

```js
// master.js
class Master extends EventEmitter {
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
```

```js
// agent_worker.js
agent.ready(err => {
    ...
    agent.removeListener('error', startErrorHandler);
    process.send({ action: 'agent-start', to: 'master' });
});

```

## get-ready

这里开始会涉及 **get-ready** 和 **ready-callback** 两个大佬写的 npm 工具包，这是解决这个疑问的关键之处。

应该注意到整个 egg 到处都有 ready(...) 式的方法。

首先来看下 [**get-ready**](https://www.npmjs.com/package/get-ready) 有什么用？
- 通过 ready.mixin 将目标对象 obj 绑定到 ready 共享属性上