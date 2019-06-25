<!-- vue_learn--前言 -->

# vue 源码学习

## 初衷:heart:

随着前端的坑越来来越深，虽然 **学的动**，但动不动一个新框架，一次大更新，总是被人赶着走。所以是时候打开 vue 源码去看下其实现机制。不能光停留在使用 vue 全家桶 **用户** 角色上。希望为时不晚。

可能会花大量的时间，可能一周、一月、断断续续，总之最终希望 **劳有所获**。

几个小目标:triangular_flag_on_post:：

-   翻完 vue code，知晓其中原理
-   学习 **最佳实践**（小的 可能一些 util 方法，大的 比如设计模式），
-   提升解决 vue 技术问题能力
-   理解整个 vue 的设计思想（万变不离其宗，也是这次学习的最终奥义）

**和别人的源码解读有什么不同？**

已经用过 vue 撸过几个项目了，但是无论从优化，还是使用原理上都未曾深入过，通过这次学习希望能 **知其所以然** :smile:

## 目录介绍 :bookmark_tabs:

-   [准备工作](./vue_learn_prepare.md)
-   [框架结构一览](./vue_learn_frame.md)

-   [初始化-开始](./vue_learn_init_start.md)
-   [初始化-选项合并](./vue_learn_init_options.md)
-   [初始化-渲染代理](./vue_learn_init_renderProxy.md)
-   [初始化-生命周期](./vue_learn_init_life.md)
-   [初始化-事件](./vue_learn_init_events.md)
-   [初始化-生命周期 钩子](./vue_learn_init_lifeHook.md)
-   [初始化-initInjections](./vue_learn_init_initInjections.md)
-   [初始化-initState](./vue_learn_init_initState.md)
-   [初始化-initProvide](./vue_learn_init_initProvide.md)
-   [初始化-总结](./vue_learn_init_end.md)

-   [响应式-创建观察者对象](./vue_learn_reactive_observe.md)
-   [响应式-观察者对象](./vue_learn_reactive_Observer.md)
-   [响应式-定义响应方法](./vue_learn_reactive_defineReactive.md)
-   [响应式-观察订阅 dep](./vue_learn_reactive_dep.md)
-   [响应式-监听 watcher](./vue_learn_reactive_watcher.md)

-   [渲染-render](./vue_learn_render_parser.md)
-   [渲染-模板编译器 createCompiler](./vue_learn_render_parser.md)

-   [-](-)
-   [附录 生命周期图示](./vue_learn_appendix_life.md)
-   demo

    -   **base\_** 基础工具方法。

## 感谢和参考 :sunny:

由于一直在**搬砖**，让自己在技术面前依旧是**新人**，因为我从未深度了解**它们**。所以开始这段旅程前，需要很多人的指点和引导。再次感谢社区那些无私奉献的大佬们。

如果觉得需要更多的参考，可以看下以下链接：

-   [Vue 技术内幕--hcysun](http://hcysun.me/vue-design/) 超详细的解读，基本看他就够了
-   [ECMAScript 6 入门--阮一峰](http://es6.ruanyifeng.com/)
-   [停止学习框架](https://juejin.im/post/5c1a839f518825780008537d)