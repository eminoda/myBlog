---
title: vue 基础-路由开发指南
tags: vue
categories:
  - 开发
  - 前端开发
thumb_img: vue.png
---

# 前言

《vue 基础》系列是再次回炉 vue 记的笔记，除了官网那部分知识点外，还会加入自己的一些理解。（里面会有部分和官网相同的文案，有经验的同学择感兴趣的阅读）

# 参数传递

示范页面跳转参数传递几个方式。

## query 参数

第一个就是如何获取 url 问号后面的参数，query 就是描述这块参数的“专用单词”。

```js
// url: http://127.0.0.1:8080/#/router/params/foo?name=abc
data() {
  return {
    queryByRoute: this.$route.query, // {name:'abc'}
  };
}
```

## path 参数

基于 Restful 规范，我们会设置动态路由（但整个地址的含义是一样的），这样就会有获取地址上的动态参数的需求。

那怎么方便的获取其中的变量呢？vue-router 也给我准备好了相关 api ，功能是通过 **path-to-regexp** 这个模块完成。

```js
// router.js
{
  name: 'params',
  path: 'params/:pathParam',
  component: Params
}
```

```js
// url: http://127.0.0.1:8080/#/router/params/foo?name=abc
data() {
  return {
    pathParamByRoute: this.$route.params.pathParam // foo
  };
}
```

## props 参数

上面的示例都涉及 this.\$route ，这样使得路由模块和组件的耦合度较高。vue-router 中可以设置 props 属性来注入到 component 中的对应的 props 属性，这样我们的代码会是这样：

```js
// router.js
{
  name: 'params',
  path: 'params/:pathParam',
  component: Params,
  props: true
}
```

```js
// url: http://127.0.0.1:8080/#/router/params/foo?name=abc
props: {
  pathParam: String
},
```

这样我们就能在组件的 props 属性中拿到 url 对应的动态参数。就像父子组件参数传递一样。

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

# 路由跳转

这属于路由参数获取外，用的第一多的功能。下面示例 vue-router 中 4 种常见的跳转用法。

## 普通跳转

声明式：

```html
<router-link :to="paramsRoute">
  <el-button type="primary">试一试：声明式跳转</el-button>
</router-link>
```

编程式：

```js
// paramsRoute: { path: '/router/params/foo', query: { name: 'fromJump' } }
this.$router.push(this.paramsRoute);
```

## replace 跳转

一开始我不太理解 **replace** 有什么用，但当我用到 **element-ui** 中的 **breadcrumb** 面包屑功能时，注意到了其中 **replace** 属性。

> replace: 在使用 to 进行路由跳转时，启用 **replace** 将不会向 **history** 添加新记录

**有什么用？**

我们都知道路由有 history 功能，每当点击浏览器返回时，将回到之前访问的页面记录。

假如页面设计有 3 层（首页、产品列表、产品详情页），当从 1 级页面（首页）跳转到 2 级页面（产品列表）后，我们点击浏览器后退按钮一切都正常；但当 2 级页面跳转到 3 级页面（详情页）后，再返回 2 级页面似乎也没问题，**但当你再次返回时，却又回到了 3 级页面**（其实用户想回到最初的 1 级页面，虽然代码上符合逻辑，但现在一定出错了）

原先我遇到类似问题，都是在最后级页面通过“写死”的路由地址来解决这个 bug，但其实现在有更好的方式，那就是 **replace** 。

如下是模拟这 bug 的重现：

tab 从： 路由跳转 --> 动态路由 --> 路由跳转（清除 history） --> 参数传递

最后 **浏览器返回** 后，路由没有切换到上次访问的路由记录，而是跳到再上次的记录。

{% asset_img replace.gif 一个简单的 gif %}

声明式：

```html
<!-- 注意多了个 replace 属性 -->
<router-link :to="paramsRoute" replace>
  <el-button type="primary">试一试：声明式跳转</el-button>
</router-link>
```

编程式：

```js
this.$router.replace(this.paramsRoute);
```

## 重定向

重定向概念多数出现在服务器端，但路由中的重定向你一定也见过，虽然原理不同，但最终的“效果”类似。

```js
const routes = [{ path: "/", redirect: "/router" }];
```

最终你访问 / 时，页面地址会变成 /router ，并渲染 /router 对应的 component。但需注意：浏览器并没有收到类似 3xx 的重定向状态码。

## “前进/后退” 跳转

```html
<el-button type="primary" @click="$router.go(-1)">试一试：返回上一级历史页面</el-button>
```

类似还有：

```js
this.$router.back();
this.$router.forward();
```

他们都是基于 window.history 相关 api 来实现的功能。

# 嵌套路由

对于简单的路由，我们模板定义如下：

```html
<div id="app">
  <router-view></router-view>
</div>
```

我们可以在路由文件 router.js 中定义一堆路由地址：

```js
const router = [
  {
    path: "/a",
    component: componentA
  },
  {
    path: "/b",
    component: componentB
  }
];
```

这些都是一级路由。那路由怎么实现嵌套呢？

## 父子路由

利用 children 属性

```js
const routes = [
  { path: "/", redirect: "/router" },
  {
    path: "/router",
    component: RouterIndex,
    redirect: "/router/jump",
    children: [
      { name: "jump", path: "jump", component: Jump },
      {
        name: "nest",
        path: "nest",
        component: NestIndex,
        children: [
          {
            name: "wrap",
            path: "wrap",
            component: NestChild1
          }
        ]
      }
      ...
    ]
  }
];
```

这个例子出现了两个 children ，也就是一个普通的 **三级路由** 形式。

{% asset_img nest.png 父子路由嵌套 %}

## 路由多组件

有时候会出现一个路由地址中需要出现 sidebar（侧导航栏） 和 main（主内容）两个 view 模块。

抽象的话，就是存在两个 router-view，这是可以把原先的 component 定义成复数 components，通过 **命名视图** 来完成这样的功能。

{% asset_img peer.png 同级路由 %}

```html
<template>
  <div class="view">
    <h3>路由嵌套</h3>
    <vv-header :headers="headers"></vv-header>
    <router-view></router-view>
    <el-row>
      <el-col :span="12">
        <router-view name="left"></router-view>
      </el-col>
      <el-col :span="12">
        <router-view name="right"></router-view>
      </el-col>
    </el-row>
  </div>
</template>
```

```js
// router.js
{
  name: 'peer',
  path: 'peer',
  components: {
    default: NestChild1,
    left: NestChild2,
    right: NestChild3
  }
}
```

原先我只在一个父组件中使用一个 router-view ，通过 components 的定义可以出现多个 router-view ，来完成多样的布局可能。

# 健壮的路由体系

## 路由守卫

守卫这个思想，最初我是在 angular 看到的，然而 vue 里也有对应的概念。但在整个程序设计语言中，还是觉得用 java 里的拦截器描述最为恰当。

### 全局前置守卫 beforeEach

beforeEach 接受 to、from、next 三个参数，前两者分别是路由对象，代表到哪里去、从哪里来。

next 是整个方法最后 resolve 的回调钩子。如果始终没有在这方法中执行，那么永远进入不到后续路由中。

我们能在里面做什么？看这个例子：

```js
const routers = new Router({
  routes
});

// 拦截
routers.beforeEach((to, from, next) => {
  // 特定路由做验证
  if (to.name == "guard") {
    console.log("验证用户登录");
  }
  next();
});
```

可以对需要的路由做个判断，目标地址如果是需要用户授权的页面，可以在这里统一的做用户信息的判断，来决定是否“放”到后续 to 路由。

### 全局后置路由 afterEach

这是一个 to 路由跳转后，执行的路由方法。与 beforeEach 不同，它不具备 next 参数，也就不具备“守卫”功能。

我们可以统一在此处做些状态信息的处理，以便 component 能更好的处理。

```js
routers.afterEach((to, from) => {
  console.log("路由请求结束");
});
```

### 全局解析守卫

在 afterEach 之前被调用，当路由组件被解析后则触发。

```js
routers.beforeResolve((to, from, next) => {
  console.log("beforeResolve 路由解析");
  next();
});
```

### 路由独享的守卫 beforeEnter

上面这两个都是全局范围的，如果只想让某个特定路由执行特殊“任务”，可以在路由定义上使用 beforeEnter，它和 beforeEach 一样具备守卫功能，即可以调用 next：

```js
{
  name: 'notFound',
  path: '*',
  component: NotFound,
  beforeEnter: (to, from, next) => {
    console.log(from, 'error');
    next();
  }
}
```

### 组件内的守卫 beforeRouteXXX

为了更细粒度的控制组件的交互，vue-router 也提供了组件内部的路由方法，他们和 data、methods 等组件属性一样使用。

使用示例如下：

```js
export default {
  data() {
    return {};
  },
  // 组件还未进入前触发，注意：无法使用 this 来调用相关方法
  beforeRouteEnter(to, from, next) {
    console.log("component beforeRouteEnter");
    next();
  },
  // 动态路由切换地址时才会触发
  beforeRouteUpdate(to, from, next) {
    console.log("component beforeRouteUpdate");
    next();
  },
  // 准备跳转其他路由时触发
  beforeRouteLeave(to, from, next) {
    console.log("component beforeRouteLeave");
    next();
  }
};
```

### 路由执行顺序

分两块：不同路由切换、动态路由切换

记肯定记不住的，我画了一个简单的图供参考：

{% asset_img router-order.png 路由顺序 %}

## 设置路由名称

我们知道每个路由 router 具备 path、component 这两个基础属性，同常我们一个项目里可能所有的路由都是这两个属性。

但你有没有设置过 路由名称？我个人以前是没有用过，因为不知道其中的好处。

它的用法很简单：

```js
// 注意这个 name 属性
{ name: 'dynamic', path: ':dynamic', component: DynamicRouter }
```

你注意到他只是比普通路由多了个 name 属性，但会给整个开发体验上带来一丝“温暖”。

为什么？

以前我们可能直接在路由的跳转中明确写出目标路由的 path ，但这个 path 是极有可能因为疏忽大意少个斜杠或者单词拼写错误而无法跳转，如果没有较完善的测试机制可能很难发现。

现在这个 name 属性会提高我们路由的相对稳定性，也有助于我们的开发效率：

```js
this.$router.push({ name: "dynamic", params: { dynamic: 1 } }).catch(err => {
  err;
});
```

## 动态路由的顺序问题

越来越多的接口是基于 Restful 规范，这样会使得我们出现很多动态路由。但由于各种地址的设计问题，会存在其他路由被这个动态路由覆盖的问题。

```js
[
  { name: 'jump', path: 'jump', component: Jump }
  { name: 'dynamic', path: ':dynamic', component: DynamicRouter },
]
```

你能想象把上述两则路由的顺序颠倒的后果吗？那么永远都不会再触发 jump 路由了。

有幸，我们的 vue-router 基于先定义先执行的原则，相比后端 springboot 一些路由问题解决起来轻松愉快多了。只需要平时多注意些。

## 异步路由加载

经验丰富的我们都清楚，所有 js 打包在一个 bundle 是非常消耗服务器资源的，这毕竟是现代单页面应用的通病。

设置一个菊花 loading 图来让用户体验更加好些，但可以通过路由＋ webpack 的打包机制，利用路由异步动态加载所需要的组件 js，达到优化效果更佳。

现代构建工具已经帮我们把 api 优化好了，简单使用如下：

```js
const RouterIndex = () => require.ensure([], () => require("./pages/Router/Index.vue"), "RouterIndex");
const DynamicRouter = () => import("./pages/Router/DynamicRouter.vue");
const NotFound = () => import("./pages/Router/NotFound.vue");
const Params = () => import("./pages/Router/Params.vue");
```

这样能使得整个服务器的负载压力更小些，用户体验也更好。

## 404 后备选项

通常 404 页面都是由服务器后端来提供，但我们简单的项目通常都是单页面应用，并且页面不经过服务端渲染。

所以对于客户端的异常页面跳转需要有个最后通配的地址来做渲染。使得整个应用“看似”更好些。

你总不希望你做的页面在用户一通乱点后，出现一个 nginx 提供的 404 Not Found 页面吧？

```js
{ path: '*', component: NotFound }
```

# 总结

一个很简单的例子，希望能帮到遇到此类问题的同学。

tips: 如果你需要快速掌握相关 vue 概念，有兴趣可以查看如下项目（当然还在建设中，本文章所有 demo 都处于此处，确保能正常 work ）

> https://gitee.com/eminoda/practice/tree/master/vue-demo
