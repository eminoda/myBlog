---
title: npm cheerio 模块
tags:
    - npm
categories:
    - 开发
    - node
thumb_img: npm.png
date: 2019-01-24 14:51:46
---

昨天在爬禅道页面的数据，用到了 cheerio ，觉得不错，这里简单介绍下

# [cheerio](https://www.npmjs.com/package/cheerio)

cheerio 用于在 server 端，解析 Html 模板。语法和 jQuery 差不多，很简单。

可以看下官方的描述：

> Fast, flexible & lean implementation of core jQuery designed specifically for the server.

每周将近 200w 的下载量，证明是个不错的包。

## Demo

简单说明下怎么用它来解析 HTML 数据

通过 fetch 获取页面 body 数据

```js
var url = '/zentao/bug-browse-10-resolvedByMe-0--205-1000-1.html';
var data = await promiseFetchUrl(url);
```

使用 cheerio 加载页面数据，使用类似 jq selector 规则进行源数据的获取

```js
var $ = cheerio.load(data.toString());
var $list = $('#bugList tbody').find('tr');
```

遍历，根据数据位置加工成目标数据，存放于 list 对象中

```js
var list = [];
for (var i = 0; i < $list.length; i++) {
	var $item = $list.eq(i).find('td');
	var id = $item
		.eq(0)
		.find('a')
		.text();
	var creator = $item.eq(4).text();
	var title = $item
		.eq(3)
		.find('a')
		.text();
	var href = $item
		.eq(0)
		.find('a')
		.attr('href');
	var index = i + 1;
	list.push({
		index,
		id,
		creator,
		title,
		href
	});
}
```

list 结果：

```js
[
	{
		index: 1,
		id: '039',
		creator: 'xx',
		title: 'xxx',
		href: '/zentao/bug-view-39.html',
		time: '2015-10-10 11:42:09',
		time2: '2015-10-10'
	}
    ...
]
```

## “链式”请求

可能需要更多详细数据，但是这个页面没有提供，需要根据 a 标签再发起请求进行获取。但实际过程会遇到某些问题：

对于上面的 list.href，通过遍历很容易拿到。那怎么在循环里继续发起请求？

可能你会想到：

```js
for(...){
    list[i].data = await fetch(list[i].href);
}
```

如果 list.length 过大，势必会让这样的同步函数执行时间过长，那是不是可以用 promise.all 解决？

```js
var promiseList = [];
for(...){
    promiseList.push(fetchPromise(list[i].href));
}
Promise.all(promiseList).then(data=>{
    ...
})
```

看似很 ok ，其实万万没想到禅道居然还有 **并发限制**，于是有了如下代码：

```js
// promise function
var getTime = async href => {
	var data = await promiseFetchUrl(href);
	var $$ = cheerio.load(data.toString());
	var time = $$('#legendLife table tr')
		.eq(0)
		.find('td')
		.text()
		.split('于 ')[1];
	return time;
};
let count = 100; // 并发次数max限制
let loop = $list.length / count; //分批次数
let pos = 0;
for (var i = 0; i < loop; i++) {
	var promiseTimeFn = [];
	for (var j = pos; j < count + pos && j < $list.length; j++) {
		// 组装每批 promise
		promiseTimeFn.push(getTime(list[j].href));
	}
	var data = await Promise.all(promiseTimeFn);
	// 数据处理
	for (var d = 0; d < data.length; d++) {
		list[d + pos].time = data[d];
		list[d + pos].time2 = data[d].split(' ')[0];
	}
	// 准备下批数据
	pos = count + pos;
}
```
