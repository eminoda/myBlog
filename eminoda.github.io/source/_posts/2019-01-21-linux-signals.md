---
title: linux signals 标识
tags: linux
categories:
  - 前端
  - linux
no_sketch: true
date: 2019-01-21 18:02:08
---


# linux standard signals

15 年左右，阿里的“死马”（我忘记花名叫啥了）提到了 [graceful-process](https://www.npmjs.com/package/graceful-process) ，然后看到如下代码：

```js
process.once('SIGTERM', () => {
	printLogLevels.info && logger.info('[%s] receive signal SIGTERM, exiting with code:0', label);
	exit(0);
});
```

process 因为是 EventEmitter 的延伸类，具备监听事件功能。但是 **SIGTERM** 是什么？在 Node 官网只看到这样一个地址：[http://man7.org/linux/man-pages/man7/signal.7.html](http://man7.org/linux/man-pages/man7/signal.7.html)

下面一起来了解下：

## signal

首先 **signal** 是 Linux 支持 POSIX 范式约定的标识。

signal 用途分类：

| dispositions | 描述                                                                  |
| ------------ | --------------------------------------------------------------------- |
| Term         | Default action is to terminate the process.                           |
| Ign          | Default action is to ignore the signal.                               |
| Core         | Default action is to terminate the process and dump core (see         |
| core(5)).    |
| Stop         | Default action is to stop the process.                                |
| Cont         | Default action is to continue the process if it is currently stopped. |

**Standard signals** 标准信号：

> Linux supports the standard signals listed below. Several signal numbers are architecture-dependent, as indicated in the "Value" column. (Where three values are given, the first one is usually valid for alpha and sparc, the middle one for x86, arm, and most other architectures, and the last one for mips. (Values for parisc are not shown; see the Linux kernel source for signal numbering on that architecture.) A dash (-) denotes that a signal is absent on the corresponding architecture.

SIGTERM 是 **Standard signals** 的一种，见下表：

| Signal  | Value    | Action | Comment                                                                 |
| ------- | -------- | ------ | ----------------------------------------------------------------------- |
| SIGHUP  | 1        | Term   | Hangup detected on controlling terminal or death of controlling process |
| SIGINT  | 2        | Term   | Interrupt from keyboard                                                 |
| SIGQUIT | 3        | Core   | Quit from keyboard                                                      |
| SIGILL  | 4        | Core   | Illegal Instruction                                                     |
| SIGABRT | 6        | Core   | Abort signal from abort(3)                                              |
| SIGFPE  | 8        | Core   | Floating-point exception                                                |
| SIGKILL | 9        | Term   | Kill signal                                                             |
| SIGSEGV | 11       | Core   | Invalid memory reference                                                |
| SIGPIPE | 13       | Term   | Broken pipe: write to pipe with no readers; see pipe(7)                 |
| SIGALRM | 14       | Term   | Timer signal from alarm(2)                                              |
| SIGTERM | 15       | Term   | Termination signal                                                      |
| SIGUSR1 | 30,10,16 | Term   | User-defined signal 1                                                   |
| SIGUSR2 | 31,12,17 | Term   | User-defined signal 2                                                   |
| SIGCHLD | 20,17,18 | Ign    | Child stopped or terminated                                             |
| SIGCONT | 19,18,25 | Cont   | Continue if stopped                                                     |
| SIGSTOP | 17,19,23 | Stop   | Stop process                                                            |
| SIGTSTP | 18,20,24 | Stop   | Stop typed at terminal                                                  |
| SIGTTIN | 21,21,26 | Stop   | Terminal input for background process                                   |
| SIGTTOU | 22,22,27 | Stop   | Terminal output for background process                                  |

能看到 **SIGTERM** 归类在 Term ，用于终止程序运行，当然根据更细致的行为可能要选择不同的 signal。

## kill

大概了解了 **signals**，之后可以再回顾下 **kill** 命令。

```
[root@localhost ~]# kill
kill: usage: kill [-s sigspec | -n signum | -sigspec] pid | jobspec ... or kill -l [sigspec]
[root@localhost ~]# kill -l
 1) SIGHUP	 2) SIGINT	 3) SIGQUIT	 4) SIGILL	 5) SIGTRAP
 6) SIGABRT	 7) SIGBUS	 8) SIGFPE	 9) SIGKILL	10) SIGUSR1
11) SIGSEGV	12) SIGUSR2	13) SIGPIPE	14) SIGALRM	15) SIGTERM
16) SIGSTKFLT	17) SIGCHLD	18) SIGCONT	19) SIGSTOP	20) SIGTSTP
21) SIGTTIN	22) SIGTTOU	23) SIGURG	24) SIGXCPU	25) SIGXFSZ
26) SIGVTALRM	27) SIGPROF	28) SIGWINCH	29) SIGIO	30) SIGPWR
31) SIGSYS	34) SIGRTMIN	35) SIGRTMIN+1	36) SIGRTMIN+2	37) SIGRTMIN+3
38) SIGRTMIN+4	39) SIGRTMIN+5	40) SIGRTMIN+6	41) SIGRTMIN+7	42) SIGRTMIN+8
43) SIGRTMIN+9	44) SIGRTMIN+10	45) SIGRTMIN+11	46) SIGRTMIN+12	47) SIGRTMIN+13
48) SIGRTMIN+14	49) SIGRTMIN+15	50) SIGRTMAX-14	51) SIGRTMAX-13	52) SIGRTMAX-12
53) SIGRTMAX-11	54) SIGRTMAX-10	55) SIGRTMAX-9	56) SIGRTMAX-8	57) SIGRTMAX-7
58) SIGRTMAX-6	59) SIGRTMAX-5	60) SIGRTMAX-4	61) SIGRTMAX-3	62) SIGRTMAX-2
63) SIGRTMAX-1	64) SIGRTMAX
```

能看到里面提供一大堆 signal 选项。

平时使用的如下命令，作用就是结合上面的 **Standard signals** 的 Value 来进行操作的。很容易查找出 -9 对应 **SIGKILL**。

```js
kill -9 process id
```

到此，回到最初的 node 代码，就知晓其中的含义了。
