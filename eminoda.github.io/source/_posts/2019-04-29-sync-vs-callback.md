---
title: 同步函数 vs 回调函数
tags:
  - node
categories:
  - 开发
  - node
thumb_img: node.png
date: 2019-04-29 16:05:01
---

## 起因

闲来蛋疼，为解决 **window 无法删除 node_modules 此类长路径文件这问题**。这两天在鼓弄一个 [删除工具](https://github.com/eminoda/deleteTool)

> https://github.com/eminoda/deleteTool （喜欢的可以 start 下）

但程序 **删除速度** 没有达到预期，觉得过慢。猜想应该是图方便快速使用了 **fs xxSync()** 方法导致（黑人脸）？

决定使用 callback 回调函数的 api 实现遍，做了如下测试，结果有些意思。

## 实验 Demo

分别选取 **readdir/readdirSync** 和 **readFile/readFileSync** 做简单的测试，代码见 **附录**

### readdir vs readdirSync

读取一个含有多目录的文件夹，重复 1w 次。

| readdir  | 1    | 2    | 3    | 平均（ms） |
| -------- | ---- | ---- | ---- | ---------- |
| callback | 744  | 770  | 815  | 776.3      |
| sync     | 1327 | 1410 | 1450 | 1395.6     |

### readFile vs readFileSync

由于读取文件有打开数量限制，这里把重复次数改为 1k 次

| readFile | 1   | 2   | 3   | 平均（ms） |
| -------- | --- | --- | --- | ---------- |
| callback | 154 | 153 | 152 | 153        |
| sync     | 184 | 180 | 182 | 183        |

### deleteTool 两个版本的差异

删除一个稍大的 node_modules 文件

| deleteTool | 平均（ms） | 备注                                                              |
| ---------- | ---------- | ----------------------------------------------------------------- |
| callback   | 38890      | [项目地址](https://github.com/eminoda/deleteTool/tree/sync)       |
| sync       | 51461      | [见 branch sync](https://github.com/eminoda/deleteTool/tree/sync) |

## 结论

以上只是简单测试 2 个常用的 api，但结果基本趋于一致，使用 **callback 方式比同步函数有更快的"速度"**

个人觉得还是和 **Nodejs 事件 I/O** 有关 ，**异步非阻塞** 这种设计模式本身就是优于 **同步阻塞** 的。syncXX 方法或许直接交给 libuv 同步处理。但紧接着就有一个疑问：为什么要推出 sync 这类方法？

或许为了提升代码可读性，对编码更为友好，增加开发体验？？？但似乎还是站不住脚，没做过多调研。

另一方面，考虑 Node 版本差异所致，上面 Demo 基于 v8.12，可能 **用最新的 version 或许这两种方式差距就微乎其微了**。这个结论或许你们亲自试过才知道。

## 附录

个人觉得这样写应该没啥 **歧义**，如果有问题欢迎 issue，一同交流

**callback 方式**

```js
const fs = require('fs');
let pList = [];
for (let i = 0; i < 10000; i++) {
	let pItem = function() {
		return new Promise((resolve, reject) => {
			fs.readdir('./services', function(err, files) {
				if (!err) {
					resolve(files);
				} else {
					reject(false);
				}
			});
		});
	};
	pList.push(pItem());
}

module.exports = Promise.all(pList);
```

**sync 方式**

```js
const fs = require('fs');
let pList = [];
for (let i = 0; i < 10000; i++) {
	let pItem = function() {
		return new Promise((resolve, reject) => {
			try {
				let files = fs.readdirSync('./services');
				resolve(files);
			} catch (err) {
				reject(err);
			}
		});
	};
	pList.push(pItem());
}
module.exports = Promise.all(pList);
```

计算时间

```js
const start = new Date().getTime();
const pAll = require('./callback');
// const pAll = require('./sync');

pAll.then(data => {
	caleTime(start);
});

function caleTime(start) {
	const end = new Date().getTime();
	console.log(end - start);
}
```
