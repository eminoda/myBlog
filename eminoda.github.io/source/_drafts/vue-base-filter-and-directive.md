---
title: vue 基础-过滤器 filter 和指令 directive 示例
tags: vue
categories:
  - 开发
  - 前端开发
thumb_img: vue.png
---

# 前言

《vue 基础》系列是再次回炉 vue 记的笔记，除了官网那部分知识点外，还会加入自己的一些理解。（里面会有大部分和官网相同的文案，有经验的同学择感兴趣的阅读）

说下 vue 里过滤器 filter 和指令 directvie 相关用法。

# filter 过滤器

过滤器 filter 没什么好说，我第一次接触是在使用 angular.js ，通过 filter 能对模板上写的数据进行二次加工。

我们不用通过计算属性 computed，或者某个地方对数据进行新的赋值等操作，在模板上简单的通过 xxx | filter 编写即可。

通过几个例子来说明用法：

## 字典文案 filter

将通过接口获取到的 value （ number 类型），在前端转换成对应的文案。

```js
Vue.filter("drawStatus", function(value) {
  let types = ["处理中", "已完成", "已驳回", "待放款", "放款中", "已撤销"];
  return types[value] || "其他";
});
```

{% asset_img filter-value-html.png %}

## 时间格式 filter

一般，后端返回时间存储格式和前端展示会有差异，封装 **moment** 工具库，以过滤器 filter 形式来简化这种格式化操作。

```js
Vue.filter("timeFormat", function(value, format) {
  return value ? moment(value).format(format || "YYYY-MM-DD HH:mm:ss") : "";
});
```

{% asset_img filter-params-html.png %}

注意：这个 timeFormat 过滤器示范了如何传递第二个参数。

# directive 指令

vue 里的指令都默认以 **v-** 开头，像：v-for 、v-if、v-model ... 等等。我们也可以自定义指令，根据需要作出不同的功能指令属性，简化 vue 逻辑代码。

## 钩子函数介绍

在开始举例前，看下自定义指令里的钩子函数：

- bind

  只调用一次，指令第一次绑定到元素时调用。在这里可以进行一次性的初始化设置。

- inserted

  被绑定元素插入父节点时调用 (仅保证父节点存在，但不一定已被插入文档中)。

- update

  所在组件的 VNode 更新时调用，但是可能发生在其子 VNode 更新之前。指令的值可能发生了改变，也可能没有。需要通过前后值得比较来确定不必要的更新。

- componentUpdated

  指令所在组件的 VNode 及其子 VNode 全部更新后调用。

- unbind

  只调用一次，指令与元素解绑时调用。

相信除了 bind、unbind 能明确他们的作用，其他三个描述会有些朦胧，我第一次看真的是不懂（借这个机会，下面会尽可能说明白）。

## 钩子函数执行点

我录制了一个 gif ，希望大家能对钩子函数有个感性认识。

分三个阶段：

- 加载页面，默认组件 A 进行加载
- 切换组件 B
- 再次切换至 A 组件

{% asset_img directive-hook-order.gif 钩子函数执行顺序 %}

能看到指令的 **bind** 、 **inserted** 是在生命周期 **mounted** 之前进行执行的；同时 **unbind** 在组件销毁时触发。

{% asset_img directive-hook-order.png 钩子函数执行顺序 %}

那 **update** 、 **componentUpdated** 呢？

他们在数据更新时被触发调用，并且是在生命周期 **beforeUpdate** 和 **updated** 之间完成。

{% asset_img directive-hook-order2.png 钩子函数执行顺序 %}

## 钩子函数参数

- bind

  只调用一次，指令**第一次绑定**到元素时调用。通常做数据初始化

- inserted

  被绑定元素插入父节点时调用 (仅保证父节点存在，但不一定已被插入文档中)。

  **什么意思？**

  比如我们指令所属标签的子标签内含操作 dom 的指令或者逻辑，比如 v-if

  {% asset_img directive-insert.png %}

  如果我们的 v-if 为 false ，然后你会发现，虽然 insert 被触发了，但页面实际上没有子标签内容的插入，可能你需要避免这方面的 bug 产生。

- update

  所在组件的 VNode 更新时调用，但是可能发生在其子 VNode 更新之前。指令的值可能发生了改变，也可能没有。但是你可以通过比较更新前后的值来忽略不必要的模板更新。

  **什么意思？**

  当我们绑定在指令上的数据发生更新时（数据 从 1 更新为 2），会触发 update 钩子

  ```js
  update: function(el, binding, vnode, oldVnode) {
    console.log('[directive parent]', `update`);
    console.log('<update>', 'bind-value', binding.value); // 2
    console.log('<update>', 'bind-oldValue', binding.oldValue); // 1
  }
  ```

  此时 binding.value 就更新了。

  但注意，下图中的红框内容，虽然当前 vnode 更新了相关元素，但其子 VNode 却没有变化。

  {% asset_img directive-update.png %}

  {% asset_img directive-update2.png %}

  所以你就需要根据不同的场景来选择更新模板的契机，以免不必要的“浪费”。

- componentUpdated

  指令所在组件的 VNode 及其子 VNode 全部更新后调用。

  当解释清了 update ，那么 componentUpdated 你应当能明白，当整个 vnode 完成更新则触发。

- unbind

  只调用一次，指令与元素解绑时调用。
