---
title: 前端性能检查 performance
tags: 性能
categories:
  - 开发
  - 性能
thumb_img: javascript.jpg
date: 2019-06-08 00:38:37
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

既然是性能测量，那看下如何设置？

## 如何预埋测试区域

这涉及 mark() 和 measure() 两个 api。

**mark()**

根据给出 name 值，在浏览器的性能输入缓冲区中创建一个相关的timestamp

**measure()**

在浏览器的指定 start mark 和 end mark 间的性能输入缓冲区中创建一个指定的 timestamp

看个例子：

```js
var perf = window.performance;

perf.mark('test-start');
setTimeout(function() {
	perf.mark('test-end');
	perf.measure('test', 'test-start', 'test-end');
}, 1000);
```

用 setTimeout 模拟执行某个耗时事件，前后分别用 mark() 进行预埋测试点，最后用 measure() 进行测试。

## 怎么查看埋点性能值

我们可以使用如下方法获得所有的性能结果

```js
perf.getEntries(); // return PerformanceEntry
```

**PerformanceEntry**
> 对象代表了 performance 时间列表中的单个 metric 数据. 每一个 performance entry 都可以在应用运行过程中通过手动构建 mark 或者 measure (例如调用 mark() 方法) 生成. 此外, Performance entries 在资源加载的时候，也会被动生成（例如图片、script、css等资源加载）

{% asset_img result.png getEntries %}

以上结果较多，可以用这两个 api 进行筛选输出（name or entryType）：

- performance.getEntriesByName(name, type);
- performance.getEntriesByType(type);

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

## timing 和 memory

既然 performance 是获取有关浏览器性能的接口，那肯定提供了页面性能的指标属性

- navigation

	提供了在指定的时间段里发生的操作相关信息，包括页面是加载还是刷新、发生了多少次重定向等等。

- timing 

	包含延迟相关的性能信息。

- memory

	Chrome 添加的一个非标准扩展，这个属性提供了一个可以获取到基本内存使用情况的对象。

通过这些属性，类似上面 measure 的 demo，就能知道浏览器在执行 dom，请求响应，加载等异步处理项目上的损耗。

{% asset_img timing.png timing %}

## 参考

> 我只是知识点的“加工者”，更多内容请查阅原文链接 :thought_balloon: ，同时感谢原作者的付出：

-   [Window​.performance MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/performance)
- [Performance MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Performance)
- [前端性能监控：window.performance 掘金](https://juejin.im/entry/58ba9cb5128fe100643da2cc)