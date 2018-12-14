<!-- vue_learn--前言 -->

# vue 源码学习

## 初衷:heart:
随着前端的坑越来来越深，虽然 **学的动**，但动不动一个新框架，一次大更新，总是被人赶着走。所以是时候打开 vue 源码去看下其实现机制。不能光停留在使用 vue 全家桶 **用户** 角色上。希望为时不晚。

可能会花大量的时间，可能一周、一月、断断续续，总之最终希望 **劳有所获**。

几个小目标:triangular_flag_on_post:：
- 翻完vue code，知晓其中原理
- 学习 **最佳实践**（小的 可能一些util方法，大的 比如设计模式），
- 提升解决 vue 技术问题能力
- 理解整个 vue 的设计思想（万变不离其宗，也是这次学习的最终奥义）

**备注**

由于也是边看边学，有些点在阅读时也会不知何意，以 **TODO** 的形式标注。等回过头再来看下是否能够读懂。

**和大佬们的源码解析有什么不同？**

我的标题是 **学习** :smile:，学习中总有理解错误的地方（你懂的）。但正因为是新手起步，会贴出一些 **js基础** 和其他方面的理解。

## 目录介绍 :bookmark_tabs:
- [准备工作](./vue_learn_prepare.md)
- [框架结构一览](./vue_learn_frame.md)
- [初始化-开始](./vue_learn_init_start.md)
- [初始化-选项合并](./vue_learn_init_options.md)
- [初始化-渲染代理](./vue_learn_init_renderProxy.md)
- [初始化-生命周期](./vue_learn_init_life.md)
- [初始化-事件](./vue_learn_init_events.md)
- [初始化-生命周期 钩子](./vue_learn_lifeHook.md)
- [-](-)
- [附录 生命周期图示](./vue_learn_appendix_life.md)
- demo

    - **base\_** 基础工具方法。

## 感谢和参考 :sunny:	
由于一直在**搬砖**，让自己在技术面前依旧是**新人**，因为你根本不了解**她们**。所以开始这段旅程前，需要很多人的指点和引导。再次感谢社区那些无私奉献的大佬们。

如果觉得需要更多 权威、正确的参考，可以看下以下链接：
- [Vue技术内幕--hcysun](http://hcysun.me/vue-design/) 超详细的解读，基本看他就够了
- [ECMAScript 6 入门--阮一峰](http://es6.ruanyifeng.com/)

