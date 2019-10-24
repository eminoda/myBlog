---
node 基础 —— child_process
---

# child_process

Node.js 是 **单线程** （纯 js 实现的部分） 的，不像其他对象语言有多线程机制（比如：java），要解决多线程带来问题（变量共享，锁...），通过异步非阻塞设计模式使得它很高效，适合高并发这样的业务场景。但由于这样的单线程会导致如下几个问题：

- 未充分利用 cpu 核心
- 一些程序问题会 crush 掉整个应用

为了解决这样的问题，node 本身提供了 **child_process**， **cluster** 方式来尽可能提升核心使用和程序的稳定性。例如： master-worker 机制。具体不再展开，这里只为了引出 child_process 这个基础 API。

## 线程和进程（补充）

只是做个基础知识补充，[查看详情](https://www.kancloud.cn/revin/nodejs/176210)

### 进程

是系统进行资源分配和调度的基本单位，是操作系统结构的基础。进程是程序的实体。

### 线程

是操作系统能够进行运算调度的最小单位。它被包含在进程之中，**是进程中的实际运作单位**。一个进程中可以并发多个线程，每条线程并行执行不同的任务。

## 异步 API

### child_process.spawn()

**spawn()** 按照名称意思——孵化，通过这个 api 可以创建一个子进程，父子进程通过 IPC 进行通信 、管道 pipe 传输。

基于 spawn ，还衍生出不同场景的 api，如：**exec，execFile，fork**

```js
child_process.spawn(command[, args][, options])
```

[点击查看详细说明](https://nodejs.org/dist/latest/docs/api/child_process.html#child_process_child_process_spawn_command_args_options)

#### 举个简单的例子

node -v ：

```js
const { spawn } = require("child_process");

const nodeCommond = spawn("node", ["-v"]);

nodeCommond.stdout.on("data", data => {
  console.log(`stdout: ${data}`); // v8.9.0
});

nodeCommond.on("close", code => {
  console.log(`child process exited with code ${code}`); // child process exited with code 0
});
```

#### 多命令组合操作

比如通过 ps 查询有多少 pm2 相关进程，等价于：ps ax |grep pm2（需在 Linux 上运行）：

```js
const { spawn } = require("child_process");
const ps = spawn("ps", ["ax"]);
const grep = spawn("grep", ["pm2"]);

ps.stdout.on("data", data => {
  grep.stdin.write(data);
});
ps.on("close", code => {
  console.log("ps code", code);
  if (code !== 0) {
    console.log(`ps process exited with code ${code}`);
  }
  grep.stdin.end();
});

grep.stdout.on("data", data => {
  console.log("grep", "print data");
  console.log(data.toString());
});
grep.on("close", code => {
  console.log("grep code", code);
  if (code !== 0) {
    console.log(`grep process exited with code ${code}`);
  }
});

/**
 * ps code 0
 * grep print data
 * 28849 ?        Ssl    5:04 PM2 v3.2.2: God Daemon (/root/.pm2)
 * 28859 ?        Ssl    2:22  \_ node /root/.pm2/modules/pm2-intercom/node_modules/pm2-intercom/i
 * 31891 ?        Ssl    0:52  \_ node /root/.pm2/modules/pm2-logrotate/node_modules/pm2-logrotate
 *
 * grep code 0
 */
```

#### options.detached

当被设定为 ture 时，会让子进程独立从父进程中独立出来，它具有自己的运行窗口（在后台，看不见），相当于守护进程。

```js
const { spawn } = require("child_process");
const fs = require("fs");

// process.argv[0]: node program exe
const subProcess = spawn(process.argv[0], ["./script/say.js"], {
  detached: true,
  stdio: ["ignore"]
});
```

运行后，无法看到 subProcess 的具体情况，parent 进程又被 hold 住。

```
subProcess.unref();
```

设置 unref 将使得 父子进程 切断联系，主进程 hold 释放。但还看不出 detached 的作用。

**测试守护特性**

重设 subProcess.stdout stream 可以看到子进程输出的内容，但设置 detached = false：

```js
const subProcess = spawn(process.argv[0], ["./script/say.js"], {
  detached: false,
  stdio: ["ignore", fs.openSync("./script/out.log", "a"), fs.openSync("./script/out.log", "a")]
});
```

能看到主进程被 hold 住，out.log 持续输出，但主进程一旦被关闭，则停止输出。

再将 detached = true ，即使主进程关闭，子进程也在持续工作。

### options.stdio

stdio 是进程的 **标准输入输出** 流。

stdio 分 \<array\> | \<string\> 类型。数组中的值分别代表 stdin、stdout、stderr。

可以通过字符串来简化数组类型的说明：

- pipe: ['pipe', 'pipe', 'pipe'] (the default)
- ignore: ['ignore', 'ignore', 'ignore']
- inherit: ['inherit', 'inherit', 'inherit'] or [0, 1, 2]

数组类型的值可以是如下字段：

- pipe：创建父子进程间的通讯通道

  ```js
  // 这样 childPipe 有了自己的 stdio 管道
  const childProcess = spawn("node", ["-v"], { stdio: "pipe" });

  childProcess.stdout.on("data", data => {
    console.log(`stdout: ${data}`); // v8.9.0
  });
  // v8.9.0
  ```

- ipc：创建父子进程间的 ipc 通信机制通道

  ```js
  const childProcess = spawn("node", ["./script/childSend.js"], {
    stdio: ["pipe", null, "pipe", "ipc"]
  });

  childProcess.on("message", data => {
    console.log(`from child`, data);
  });

  childProcess.stdout.on("data", data => {
    console.log(`stdout: ${data}`); // v8.9.0
  });
  // stdout: console.log data

  // from child hello parent
  // stdout: console.log data

  // from child hello parent
  // stdout: console.log data
  ```

  ```js
  setInterval(() => {
    console.log("console.log data");
    process.send("hello parent");
  }, 1000);
  ```

- ignore：忽略

  ```js
  const childProcess = spawn("node", ["-v"], { stdio: "ignore" });

  // 会报错
  // childProcess.stdout.on("data", data => {
  //   console.log(`stdout: ${data}`); // v8.9.0
  // });
  ```

- inherit：子进程的 stdio 执行权交给父进程对应的 stdio

  ```js
  // child process data 直接打印在 parent process 控台上
  const childProcess = spawn("node", ["-v"], { stdio: "inherit" });
  // v8.9.0

  // 会报错
  // childProcess.stdout.on("data", data => {
  //   console.log(`stdout: ${data}`); // v8.9.0
  // });
  ```

- Stream：使用个其他流对象，代替 stdio
- integer
- null，undefined：当 fds 0,1,2 位置设置该值，则会使用 pipe 模式；当 fds 3 位置为该值，则会使用 ignore。

### child_process.exec(command[, options][, callback])

[点击查看详细说明](https://nodejs.org/dist/latest/docs/api/child_process.html#child_process_child_process_exec_command_options_callback)

```js
const { exec } = require("child_process");

const nodeProcess = exec("node -v", (err, stdout, stderr) => {
  console.log(err, stdout, stderr); //null 'v8.9.0\r\n' ''
});
```

### child_process.execFile(file[, args][, options][, callback])

[点击查看详细说明](https://nodejs.org/dist/latest/docs/api/child_process.html#child_process_child_process_execfile_file_args_options_callback)

```js
const { execFile } = require("child_process");

// linux
const linuxProcess = execFile("./script/say.sh", { shell: true }, (err, stdout, stderr) => {
  console.log(err, stdout, stderr);
});

// window 这里的 file 不能为路径，需要通过 cwd 来指定
const winProcess = execFile("say.bat", { shell: true, cwd: "./script" }, (err, stdout, stderr) => {
  console.log(err, stdout, stderr);
});
```

execFile 和 exec 类似，但不会有个 shell 脚本执行器，可以通过 options.shell 来打开（Unix 是 /bin/sh ，Windows 是 process.env.ComSpec）。

### child_process.fork(modulePath[, args][, options])

[点击查看详细说明](https://nodejs.org/dist/latest/docs/api/child_process.html#child_process_child_process_fork_modulepath_args_options)

是 spawn 延伸出出来的特殊方法，fork 子进程。父子进程通过 IPC 方式通讯。

```js
// parent
const { fork } = require("child_process");

const child = fork("./script/childSend", {});

child.on("message", data => {
  console.log(data);
});
```

```js
// child
setInterval(() => {
  process.send("hello parent");
}, 3000);
```

## 同步 API

和异步 API 类似，除了具有同步机制。

- child_process.spawnSync()
- child_process.execSync()
- child_process.execFileSync()

## ChildProcess

### Event

- message
- close
- disconnect
- error
- exit

```js
const nodeCommond = spawn("node", ["./script/say.js"], {
  stdio: [null, null, null, "ipc"]
});

nodeCommond.stdout.on("data", data => {
  console.log(`stdout: ${data}`); // v8.9.0
});
nodeCommond.on("close", code => {
  console.log("close");
});
nodeCommond.on("disconnect", code => {
  console.log("disconnect");
});
nodeCommond.on("message", code => {
  console.log("message");
});
nodeCommond.on("error", code => {
  console.log("error");
});
nodeCommond.on("exit", code => {
  console.log("exit");
});
```

```js
let count = 0;
let timer = setInterval(() => {
  count = count + 1;
  console.log(`${new Date()}`, " say data", `count=${count}`);

  if (count == 1) {
    process.send("message");
  }
  if (count == 5) {
    process.disconnect();
  }
  if (count == 10) {
    precess.kill("SIGHUP");
    // clearInterval(timer);
  }
}, 1000);
```

```txt
stdout: Thu Oct 24 2019 17:31:25 GMT+0800 (中国标准时间)  say data count=1

message
stdout: Thu Oct 24 2019 17:31:26 GMT+0800 (中国标准时间)  say data count=2

stdout: Thu Oct 24 2019 17:31:27 GMT+0800 (中国标准时间)  say data count=3

stdout: Thu Oct 24 2019 17:31:28 GMT+0800 (中国标准时间)  say data count=4

stdout: Thu Oct 24 2019 17:31:29 GMT+0800 (中国标准时间)  say data count=5

disconnect
stdout: Thu Oct 24 2019 17:31:30 GMT+0800 (中国标准时间)  say data count=6

stdout: Thu Oct 24 2019 17:31:31 GMT+0800 (中国标准时间)  say data count=7

stdout: Thu Oct 24 2019 17:31:32 GMT+0800 (中国标准时间)  say data count=8

stdout: Thu Oct 24 2019 17:31:33 GMT+0800 (中国标准时间)  say data count=9

stdout: Thu Oct 24 2019 17:31:34 GMT+0800 (中国标准时间)  say data count=10

exit
close
```

需要注意 disconnect 需要在 IPC 模式下会被触发，同时非 IPC 模式，如果子进程涉及调用 send 方法，会使得子进程停止。

### 其他 API

具体使用到时，去 [官网查询](https://nodejs.org/dist/latest/docs/api/child_process.html#child_process_class_childprocess)，这里不做赘述。

## 关于我

如果你觉得这篇文章对你有帮助， 请点个赞或者分享给更多的道友。 

也可以扫码关注我的 **微信订阅号 - [ 前端雨爸 ]**， 第一时间收到技术文章 :rocket:， 工作之余我会持续输出 :fire:

![微信订阅号-前端雨爸](https://raw.githubusercontent.com/eminoda/myBlog/master/read_note/imgs/webcat-qrcode.jpg)

最后感谢阅读， 你们的支持是我写作的最大动力 :tada: