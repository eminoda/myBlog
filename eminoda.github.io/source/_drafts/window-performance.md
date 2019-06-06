---
title: 前端性能检查 window.performance
tags: 性能
categories:
    - 开发
    - 性能
thumb_img: javascript.jpg
---

看 Vue 时注意到如下代码：

```js
startTag = `vue-perf-start:${vm._uid}`;
endTag = `vue-perf-end:${vm._uid}`;
mark(startTag);
do_work();
vm._name = formatComponentName(vm, false);
mark(endTag);
measure(`vue ${vm._name} init`, startTag, endTag);
```

基本能猜到里面是在做什么，分别在 do_work() 前后打标点，然后计算执行该方法的消耗

mark 和 measure 定义如下：

```js
const perf = window.performance;
mark = tag => perf.mark(tag);
measure = (name, startTag, endTag) => {
	perf.measure(name, startTag, endTag);
	perf.clearMarks(startTag);
	perf.clearMarks(endTag);
	// perf.clearMeasures(name)
};
```

我没有用过 window.performance，那它到底是什么？现在开始学习吧。

# window.performance

> Web Performance API 允许网页访问某些函数来测量网页和 Web 应用程序的性能，包括 Navigation Timing API 和高分辨率时间数据。

## 如何预埋测试区域

这和 mark() 和 measure() 有关

先来看个例子：

```js
var perf = window.performance;

perf.mark('test-start');
setTimeout(function() {
	perf.mark('test-end');
	perf.measure('test', 'test-start', 'test-end');
}, 1000);
```

## 怎么得出性能值

```js
perf.getEntriesByName('test');
// 会输出一个 [PerformanceMeasure] 数组对象
// [{
//      duration: 1000.4449998959899
//      entryType: "measure"
//      name: "test"
//      startTime: 1374241.1400000565
// }]
```

## 参考

> 我只是知识点的“加工者”，更多内容请查阅原文链接 :thought_balloon: ，同时感谢原作者的付出：

-   [Window​.performance MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/performance)
