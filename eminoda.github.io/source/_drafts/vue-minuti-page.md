---
title: vue minuti 分页实现
tags: 
  - vue
  - minu-ti
categories:
  - 前端
  - vue
no_sketch: true
---

来谈下使用 **vue+minuti** 如何实现上拉，下拉分页数据加载操作。
分两块内容：
- minuti loadmore使用示例
- 分页中可以积累的知识点

# minuti loadmore组件
{% asset_img loadmore.gif 实际效果 %}

[官方API](http://mint-ui.github.io/docs/#/zh-cn2/loadmore)

template
````html
<mt-loadmore :top-method="loadTop" :bottom-method="loadBottom" :bottom-all-loaded="allLoaded" ref="loadmore">
  <div class="line-item" v-for="(item,index) in list" :key="index">
    <span class="title">{{index}}</span>
    <span class="desc">{{item.id}}</span>
  </div>
</mt-loadmore>
````

vue script
````js
methods: {
  // 模拟接口数据
  buildList: function () {
    let nextPageList = [];
    for (let index = 1; index <= 15; index++) {
      nextPageList.push({ id: new Date().getTime() + Math.random(1) * 10 });
    }
    return nextPageList;
  },
  // 下拉
  loadTop: function () {
    console.log('loadTop');
    this.list = this.buildList();
    let self = this;
    // 重置上拉开关
    self.allLoaded = false;
    setTimeout(function () {
      // 消除loading icon
      self.$refs.loadmore.onTopLoaded();
    }, 500)
  },
  loadBottom: function () {
    console.log('loadBottom');
    let self = this;
    // 关闭上拉加载
    self.allLoaded = true;
    setTimeout(function () {
      // 校验接口数据，判断是否继续打开上拉加载开关
      self.allLoaded = false;
      self.list = self.list.concat(self.buildList());
      // 消除loading icon
      self.$refs.loadmore.onBottomLoaded();
    }, 500)
  }
}
````

目前比较主流的前端框架都有非常好用的基础UI组件库，比如：vue 国内就有mintui、elementui。只用非常简单，对照API说明即可完成功能实现。

# 需要get的点
组件库的出现当然为了让开发更容易上手开发应用，提高开发效率。相反也有弊端，我们逐渐缺乏对功能实现的技巧，甚至为了完成某些效果，项目里融入了多个组件库。（所以定期看下比较好用的npm库，是提升自己，不被行业淘汰的方式之一）

如下给出一些可能平时忽略的技术点：
## transform
transform设置translate3d的Y轴，实现类似native那种拉动效果。

{% asset_img transform.gif transform=translate3d(0,?px, 0); %}

[其他一些例子](https://c.runoob.com/codedemo/3391)

## computed & methods & watch 区别
- 计算属性（computed）是基于它们的依赖进行缓存的。只在相关依赖发生改变时它们才会重新求值
- 而methods则需要主动调用。
- 监听（watch）是在Vue实例化的时候调用，遍历 watch 对象的每一个属性。

在loadmore组件中，最频繁的就是上拉下载操作，所以使用了 **computed**
````js
computed: {
  transform() {
    return this.translate === 0 ? null : 'translate3d(0, ' + this.translate + 'px, 0)';
  }
}
````

对于一些延迟返回的status判断，使用了 **watch** 来监听
````js
topStatus(val) {
  this.$emit('top-status-change', val);
  switch (val) {
    case 'pull':
      this.topText = this.topPullText;
      break;
    case 'drop':
      this.topText = this.topDropText;
      break;
    case 'loading':
      this.topText = this.topLoadingText;
      break;
  }
}
````
## $ref
> ref 被用来给元素或子组件注册引用信息。引用信息将会注册在父组件的 $refs 对象上。如果在普通的 DOM 元素上使用，引用指向的就是 DOM 元素；如果用在子组件上，引用就指向组件实例

````js
self.$refs.loadmore.onTopLoaded();
````
````js
onTopLoaded() {
  this.translate = 0;
  setTimeout(() => {
    this.topStatus = 'pull';
  }, 200);
}
````

但是要注意：**因为 ref 本身是作为渲染结果被创建的，在初始渲染的时候你不能访问它们 - 它们还不存在！$refs 也不是响应式的**

## $nextTick
> 将回调延迟到下次 DOM 更新循环之后执行。在修改数据之后立即使用它，然后等待 DOM 更新。它跟全局方法 Vue.nextTick 一样，不同的是回调的 this 自动绑定到调用它的实例上。

用于Dom渲染完，某些数据的更新，则需要使用nextTick加入callback，重新push到vue渲染机制中。

[当然没有那么简单，更多网站有大堆的针对nextTick的解读](https://github.com/Ma63d/vue-analysis/issues/6)
````
onBottomLoaded() {
  this.$nextTick(() => {
    // do something
    this.translate = 0;
  });
}
````

## [nodeType](https://developer.mozilla.org/zh-CN/docs/Web/API/Node/nodeType)
用来区分Html里dom节点类型

| 常量 | value | 说明 |
| --- | --- | --- |
| Node.ELEMENT_NODE | 1 | 元素节点 |
| Node.TEXT_NODE | 3 | 元素节点或者文字 |
| Node.PROCESSING_INSTRUCTION_NODE | 7 | xml顶部的声明 |
| Node.COMMENT_NODE | 8 | 注释 |
| Node.DOCUMENT_NODE | 9 | document.nodeType |
| Node.DOCUMENT_TYPE_NODE | 10 | document.doctype.nodeType |
| Node.DOCUMENT_FRAGMENT_NODE | 11 | 虚拟节点 document.createDocumentFragment().nodeType |

````js
getScrollEventTarget(element) {
  let currentNode = element;
  // 判断是否全局滚动条
  while (currentNode && currentNode.tagName !== 'HTML' &&
    currentNode.tagName !== 'BODY' && currentNode.nodeType === 1) {
    let overflowY = document.defaultView.getComputedStyle(currentNode).overflowY;
    if (overflowY === 'scroll' || overflowY === 'auto') {
      return currentNode;
    }
    currentNode = currentNode.parentNode;
  }
  return window;
}
````

## 关于滚动
**判断页面是否滚动到底部**
````js
if (this.scrollEventTarget === window) {
  return document.body.scrollTop||document.documentElement.scrollTop + document.documentElement.clientHeight >= document.body.scrollHeight;
} else {
  return this.$el.getBoundingClientRect().bottom <= this.scrollEventTarget.getBoundingClientRect().bottom + 1;
}
````

**判断页面是否超过可视屏幕**
````js
if (this.scrollEventTarget === window) {
  this.containerFilled = this.$el.getBoundingClientRect().bottom >=
    document.documentElement.getBoundingClientRect().bottom;
} else {
  this.containerFilled = this.$el.getBoundingClientRect().bottom >=
    this.scrollEventTarget.getBoundingClientRect().bottom;
}
````

**获取滚动条距离顶部距离**
````
if (element === window) {
  return Math.max(window.pageYOffset || 0, document.documentElement.scrollTop);
} else {
  return element.scrollTop;
}
````

[**浏览器兼容问题**](https://segmentfault.com/a/1190000008065472)
- chrome 只认识：document.body.scrollTop
- ie678：document.documentElement.scrollTop
- ie9及以上：window.pageYOffset或者document.documentElement.scrollTop

所以自己实现时，注意这些点，饿了吗这个框架貌似很久没有merge了