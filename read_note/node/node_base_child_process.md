---
node基础——child_process
---

# child_process

Node.js 是 **单线程** 的，不像其他对象语言有多线程机制（比如：java），要解决多线程带来问题（变量共享，锁...），通过异步非阻塞设计模式使得它很高效，适合高并发这样的业务场景。但由于这样的单线程会导致如下几个问题：

-   未充分利用 cpu 核心
-   一些程序问题会 down 掉整个应用

为了解决这样的问题，node 本身提供了 **child_process**，cluster 方式来尽可能提升核心使用和程序的稳定性。例如： master-worker 机制。具体不再展开，这里只为了引出 child_process 这个基础 API。

## 线程和进程

只是做个基础知识补充，[查看详情](https://www.kancloud.cn/revin/nodejs/176210)

**进程**

> 是系统进行资源分配和调度的基本单位，是操作系统结构的基础。进程是程序的实体。

**线程**

> 是操作系统能够进行运算调度的最小单位。它被包含在进程之中，**是进程中的实际运作单位**。一个进程中可以并发多个线程，每条线程并行执行不同的任务。

## child_process.spawn()

```js
child_process.spawn(command[, args][, options])
```

**spawn()** 按照名称意思——孵化，通过这个 api 可以创建一个子进程，父子进程通过 IPC 进行通信。
基于 spawn ，还有适用不同场景的 api，如：**exec，execFile，fork**

基本用法：

```js
const { spawn } = require('child_process');
// 显示 /usr 路径下文件信息
const ls = spawn('ls', ['-lh', '/usr']);

ls.stdout.on('data', data => {
	console.log(`stdout: ${data}`);
});
...
```

配置详情：

-   command \<string\> 执行程序命令
-   args \<string[]\> 程序参数
-   options
    -   cwd \<string\> Current working directory of the child process.
    -   env \<Object\> Environment key-value pairs.
    -   argv0 \<string\> Explicitly set the value of argv[0] sent to the child process. This will be set to command if not specified.
    -   stdio \<Array\> | \<string\> Child's stdio configuration (see options.stdio).
    -   detached \<boolean\> Prepare child to run independently of its parent process. Specific behavior depends on the platform, see options.detached).
    -   uid \<number\> Sets the user identity of the process.
    -   gid \<number\> Sets the group identity of the process.
    -   shell \<boolean\> | \<string\> If true, runs command inside of a shell. Uses '/bin/sh' on UNIX, and process.env.ComSpec on Windows. A different shell can be specified as a string. See Shell Requirements and Default Windows Shell. Default: false (no shell).
    -   windowsVerbatimArguments \<boolean\> No quoting or escaping of arguments is done on Windows. Ignored on Unix. This is set to true automatically when shell is specified. Default: false.
    -   windowsHide \<boolean\> Hide the subprocess console window that would normally be created on Windows systems. Default: false.

**options.detached**

说是子进程有自己的控制台，不受父进程的退出而关闭，但没试出来

**options.stdio**

用于配置子进程与父进程之间建立的管道。分别对应子进程的 stdin、stdout、stderr。

定义规则：

-   pipe == ['pipe', 'pipe', 'pipe'],default
-   ignore == ['ignore', 'ignore', 'ignore']
-   inherit == ['inherit', 'inherit', 'inherit'] 或 [0,1,2]

options.stdio 对应 child process 的 fd（文件描述符），fd 的 0、1、2 对应 stdin、stdout、stderr。额外的 fd 用于创建父子进程通信的管道方式：

-   pipe: 基础父子进程的管道。
-   ipc: 创建消息传递的 ipc 通道，会使得特定的方法 API 得到开放。process.disconnect()、process.send()
-   ignore: 忽略 fd
-   inherit: 继承父进程的 stdio 流
-   \<Stream\> 对象
-   正整数
-   null、undefined

**pipe 和 ipc 的问题**

```js
// parent.js
const spawnCmd = spawn('node', ['child.js'], {
	detached: false,
	stdio: ['pipe', 'pipe', 'pipe', 'pipe'] // 修改为 ipc 就可以使用相关api
});
// child.js
...
process.disconnect();// error:TypeError: process.disconnect is not a function
...
```

**父子进程通信**

```js
// parent.js
spawnCmd.on('message', msg => {
	console.log('message::' + msg);
});
// child.js
process.send('hello');
```

**关闭 IPC 通道**

如果 child 中还有和 parent 的交互，就会报错。

```js
// parent.js
spawnCmd.on('disconnect', msg => {
	console.log('disconnect::' + msg);
});

// child.js
process.disconnect();
... // 其他逻辑，error:Error [ERR_IPC_CHANNEL_CLOSED]: channel closed
```

**子进程结束**

如果是子进程执行完全部，code=null，否则对应 signal。注意 event close 是最后执行的。

```js
// parent.js
spawnCmd.on('close', msg => {
	console.log(`close::code::${code},signal::${signal}`);
});
spawnCmd.on('exit', (code, signal) => {
	console.log(`exit::code::${code},signal::${signal}`);
});
```
