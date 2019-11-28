---
title: vue-base-vueRouter
tags: vue
categories:
  - 开发
  - 前端开发
thumb_img: vue.png
---

# 前言

《vue 基础》系列是再次回炉 vue 记的笔记，除了官网那部分知识点外，还会加入自己的一些理解。（里面会有部分和官网相同的文案，有经验的同学择感兴趣的阅读）

# 动态路由

所谓动态路由，就是以冒号 :xxx 来定义地址某部分的路由，通常是基于 Restful 规范，比如下面使用动态的 id 定义的地址：

```js
const routes = [
  {
    path: "/user/:id",
    component: User
  }
];
```

## 问题

相信经验丰富的你一定遇到过这样的问题：明明地址变了，但组件没有重新进行“刷新”。

我们可以通过 vue 的生命周期来验证组件是否会重新渲染：

```js
created() {
  this.$message('当前组件被创建');
},
methods: {
  changeRouterUrl() {
    this.id++;
    this.$router.push({ path: '/router/' + this.id });
  }
}
```

当我每次通过 button 触发 changeRouterUrl 方法来进行 id 的累加使得 url 发生变化。但 created 一直没有执行第二次。

{% asset_img dynamic.gif 一个简单的 gif %}

那怎么解决的？

## 解决

我们知道当定义好 Vue.use(Router); 后，我们就能在实例化后的 vue 中，通过 this.\$route 路由对象来获取相关属性了。

知道这点后，就通过 watch 来监听 \$route 对象即可。

同时也能用 \$route 中对应的 to、from 概念对应上 watch 接受的 newVal、oldVal 两个变化前后的参数。

```js
watch: {
  $route(to, from) {
    this.$message('路由更新了，你可以在这里做任何事情');
  }
}
```

{% asset_img watchRouter.gif 一个简单的 gif %}

这样就能在每次动态路由改动时，通过监听 \$route 来自定义需要刷新组件那部分的数据了。

# 总结

一个很简单的例子，希望能帮到遇到此类问题的同学。

tips: 如果你需要快速掌握相关 vue 概念，有兴趣可以查看如下项目（当然还在建设中，本文章所有 demo 都处于此处，确保能正常 work ）

> https://gitee.com/eminoda/practice/tree/master/vue-demo

