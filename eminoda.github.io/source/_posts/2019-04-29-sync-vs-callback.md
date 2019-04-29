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


在鼓弄一个 [删除工具](https://github.com/eminoda/deleteTool)，但程序 **删除速度** 没有达到预期。考虑是否图方便快速使用了 **fs xxSync()** 方法导致？尝试使用 callback 会有所改善，做了如下测试，结果有些意思。

测试 Demo 如下：

使用 readdir 和 readdirSync 读取一个含有多目录的文件夹，重复 1w 次。

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

测试结果

| readdir/readdirSync | 1    | 2    | 3    | 平均   |
| ------------------- | ---- | ---- | ---- | ------ |
| callback            | 744  | 770  | 815  | 776.3  |
| sync                | 1327 | 1410 | 1450 | 1395.6 |

由于读取文件有打开数量限制，这里把重复次数改为 1k 次

| readFile/readFileSync | 1   | 2   | 3   | 平均 |
| --------------------- | --- | --- | --- | ---- |
| callback              | 154 | 153 | 152 | 153  |
| sync                  | 184 | 180 | 182 | 183  |

## 思考

以上只是简单测试 2 个常用的 api，但结果基本趋于一致，使用 **callback 方式比同步函数有更快的"速度"**

就和 Nodejs 问世一样，异步非堵塞这种设计模式本身就是优于堵塞式的。但紧接着就有一个疑问：为什么要推出 sync 这类方法？

我想要么就是大势所趋，提升开发体验，优化代码可读性、编写性。但似乎还是站不住脚，没做过多调研。

上面测试基于的 Node 环境是 V8.12，有兴趣的道友试下更高的版本，或许就两者就不会有这些差距。
