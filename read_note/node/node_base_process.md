---
node基础——process
---

# process

> The process object is a global that provides information about, and control over, the current Node.js process. As a global, it is always available to Node.js applications without using require().

process 是 Node.js 进程中全局范围的变量，不需要 require 引入，直接可以使用。

值得注意，process 是 EventEmitter 的实例对象

平时接触也只和 process.env.xx 环境变量有关，当接触到 egg.js 底层一些源码时，发现更多自己不常用 node api 在一个项目中起到很关键的作用。

## Event:'beforeExit'

> The 'beforeExit' event is emitted when Node.js empties its event loop and has no additional work to schedule.

beforeExit 在 node 中的事件队列为空并且没有额外的计划执行时被触发。

注意：

-   beforeExit callback fn 调用时会有一个 process.exitCode 作为参数
-   如果 beforeExit 有 **异步调用**，会使得 Node 进程不会退出继续执行
-   在 process.exit() or 未捕捉异常 情况时，beforeExit 不会被执行
-   beforeExit 不要和 exit 混用

```js
var count = 0;
process.on('beforeExit', exitCode => {
	console.log(`exitCode:${exitCode}`);
	// process 不会退出，继续触发 beforeExit
	setTimeout(() => {
		console.log(count++);
	}, 0);
});
// 由于异步操作，beforeExit 陷入循环，exit 不会被执行
process.on('exit', () => {
	console.log(88);
});
```

## Event: 'exit'

发生在两种情况：

-   通过 process.exit() 显示调用
-   Node 没有“事情”可做时。（The Node.js event loop no longer having any additional work to perform.）

和 beforeExit 类似，但对于 **异步** 操作要注意：

exit 不会执行 async 操作，当事件触发时，node 会马上执行定义好的同步方法

```js
process.on('exit', exitCode => {
	setTimeout(() => {
		console.log('88'); // no print
	}, 0);
});
```

## Event:'disconnect'

建立在 IPC 机制上的子进程如果“失联”了，就会触发 disconnect

```js
// master
const { fork } = require('child_process');
const child = fork('./childProcess.js', {
	stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
	detached: true
});

setTimeout(() => {
	child.disconnect();
}, 3000);

child.stdout.pipe(process.stdout);
```

```js
// child
process.on('disconnect', () => {
	console.log('child process is disconnected');
});
```

## Event:'message'

发生在 IPC 通信上

```js
// master
// 事件会一直 holding
child.on('message', msg => {
	console.log(msg);
});
```

```js
// child
process.send({ from: 'child', data: 'hello message' });
```

## Event:'unhandledRejection'

用于使用 Promise 时，未定义 reject 和 未 catch 异常时的“提醒”

```js
let condition = true;
let promiseFn = () => {
	return new Promise((resolve, reject) => {
		if (condition) {
			condition = !condition;
			resolve(true);
		} else {
			reject(false);
		}
	});
};
promiseFn().then(data => {
	console.log(data);
	return promiseFn();
});
process.on('unhandledRejection', (reason, p) => {
	// Unhandled Rejection at: Promise { <rejected> false } reason: false
	console.log('Unhandled Rejection at:', p, 'reason:', reason);
});
```

## Event:'rejectionHandled'

是 unhandledRejection 事件的补充，如果 unhandledRejection 中对 promise 做了 reject/catch 处理就会触发。

```js
process.on('unhandledRejection', (reason, p) => {
	console.log('Unhandled Rejection at:', p, 'reason:', reason);
	p.catch(err => {});
});
process.on('rejectionHandled', reason => {
	console.log('rejectionHandled called');
	console.log(reason);
});
```

## Event:'uncaughtException'

为了防止 node 单线程因为异常未 try-catch 造成系统宕机，有了 uncaughtException 这个事件。

```js
// 异常监听 要放在之前，不然捕捉不到
process.on('uncaughtException', err => {
	console.log(err);
});
throw new Error('error');
```

## Event:'warning'

警告提示

```js
// 设置事件监听数量，node 会弹出系统警告
// (node:18608) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 2 foo listeners added. Use emitter.setMaxListeners() to increase limit
const events = require('events');
events.defaultMaxListeners = 1;
process.on('foo', () => {});
process.on('foo', () => {});
```

但如果加入 warning 监听，就可以将这种“异常”放到业务代码中更好的处理

```js
// node --no-warnings ./warning.js
process.on('warning', warning => {
	console.log(warning.name);
	console.log(warning.message);
	// console.log(warning.stack);
});
```

注意：
上面利用 **--no-warnings** 关闭了系统警告输出

类似还有如下参数：

-   --trace-warnings 打印 warning 堆栈
-   --throw-deprecation 打印废弃信息
-   --trace-deprecation 打印废弃信息堆栈
-   --no-deprecation 不输出废弃信息

## Event:'Signal'

监听 POSIX 标准的 signal，[见：signal.7](http://man7.org/linux/man-pages/man7/signal.7.html)

也可以看下 [linux signals 标识](https://eminoda.github.io/2019/01/21/linux-signals/)

```js
process.on('SIGINT', () => {
	console.log('Received SIGINT. Press Control-D to exit.');
});
```

## 常用 API

**process.exit([code])**

process.abort(),process.exit([code]),process.kill(pid[, signal]) 都用于程序的退出。

但在细节上有些不同

-   process.abort() 个人认为用于程序的异常中断，依靠 linux unlimit 设置，会有 core dump 文件来还原当时中断的场景（领域过于高深，18 年 D2 就有大佬讲过）
-   process.exit() 会传递一个 exitCode（Default: 0） 标识退出信号
-   process.kill 根据 pid signal（Default: 'SIGTERM'） 来杀进程

这里有篇文章解释的很详细 [How to Exit in Node.js](https://stackabuse.com/how-to-exit-in-node-js/)

**process.argv**

输出命令行参数列表。比如 yargs 之类的模块

```js
// node ./api.js --test=1 -test2=2 test3=3
var args = process.argv;
// [ 'D:\\tool\\node\\install\\node.exe',
//   'e:\\github\\myBlog\\read_note\\node\\demo\\process\\api.js',
//   '--test=1',
//   '-test2=2',
//   'test3=3' ]
console.log(args);
```

有个比较相近的 api: process.argv0, 用来进程的执行“来源”

```js
// D:\\tool\\node\\install\\node.exe ./api.js
console.log(process.argv0); // D:\\tool\\node\\install\\node.exe
```

```js
// node ./api.js
console.log(process.argv0); // node
```

**process.pwd()**

显示当前文件执行路径，可以通过 process.chdir 进行修改，如果不行就报错

```js
console.log(process.cwd());

try {
	process.chdir('/github');
	console.log(process.cwd());
} catch (err) {
	console.log(err);
}
```
