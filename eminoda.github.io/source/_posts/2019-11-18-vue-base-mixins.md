---
title: vue 基础- mixins 多继承方式的代码复用
tags: vue
categories:
  - 开发
  - 前端开发
thumb_img: vue.png
date: 2019-11-18 00:41:12
---

# 前言

《vue 基础》系列是再次回炉 vue 记的笔记，除了官网那部分知识点外，还会加入自己的一些理解。（里面会有部分和官网相同的文案，有经验的同学择感兴趣的阅读）

先前讲过选项/组合中的 extends 属性，他属于一种单继承方式，我们已经能享受到它给我带来的代码复用“福利”。这里再介绍下和它类似的属性 mixins 。

# mixins 使用

类型可是：Array<Object\>

mixins 接受一个混入对象的数组，该混入对象可以使用正常 Vue 定义的那些选项。如果你的混入包含一个钩子而创建组件本身也有一个，两个函数都将被调用。

## 基本使用

这是 mixins 定义，里面定义了一个钩子函数 created ，和默认 methods。

```js
export default {
  created() {
    console.log("parent1 created");
  },
  methods: {
    buttonClick() {
      console.log("parent1 method click");
    }
  }
};
```

这是一个普通的 vue 组件，通过 mixins 混入一些初始化定义。

```js
import mixins1 from "../../mixins/preper";
export default {
  name: "Home",
  components,
  mixins: [mixins1],
  data() {
    return {
      banner: {
        height: 0
      },
      msg: 1
    };
  },
  methods: {
    buttonClick() {
      console.log("child method click");
    }
  },
  created() {
    console.log("child created");
  }
};
```

看下实际效果：

{% asset_img mixins.png %}

正如官网所说，mixins 上如果定义一些生命周期的钩子函数，默认执行顺序将会合并按照 mixins 先，当前 vue 实例后的顺序执行。

同时如果有相同的属性，比如 methods 中某个方法命名一致，将会被覆盖。这也是我们要的继承复用效果。

## 多个 mixins

那如果有多个 mixins 会是什么效果？

我再定义了个差不多的 mixins2 ，来看下实际的输出情况：

```js
mixins: [mixins1, mixins2],
```

两个混入对象的钩子方法均得到了调用，并且顺序按照 mixins 的数组顺序执行。

{% asset_img mixins2.png %}

# 和 extends 的区别

其实代码效果和 extends 一样，目的都能实现代码继承。区别不同的是 mixins 是接受一个数组形式的对象，换句话说子类能继承多个父类的定义。而 extends 只能继承一个，也就是单继承和多继承的区别。

不过需要注意的是：extends 和 mixins 的顺序不是那么随意，**extends 优先于 mixins** 。

```js
mixins: [mixins1, mixins2],
extends: extend,
```

{% asset_img mixins3.png %}

# 总结

介绍了 mixins 的使用，也通过和 extends 的结合使用来说明这两者的细微不同，这样在代码上使用继承来达到某些代码功能复用时能有个正确的选择判断。
