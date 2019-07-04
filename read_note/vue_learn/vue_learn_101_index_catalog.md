# vue 源码学习

## 初衷:heart:

作为一个 Vue 的重度使用者，一直“无脑”用着官方提供的 API，完成既定需求。表面看似熟悉这门技术框架，但根本不了解其内部机制，就和几根稻草顶着一块砖头一样 **软弱不堪**。

面对有时摸不着原因的 bug，或者控制台的 error 警告，是时候好好“修建”那薄弱的根基。翻看源码不仅仅是为了学习内部原理，更多是跟随专业作者（们）的开发设计思想，开阔自己那 **狭小** 的眼界。

可能会花大量的时间，可能一周、一月、断断续续，总之最终希望 **劳有所获**。事实证明，我已经断断续续花了近半年了 :disappointed_relieved:。

几个小目标 :triangular_flag_on_post:：

- 翻看完 vue code，知晓其中核心原理
- 提升解决 vue 技术问题能力
- 结合自身所欠缺的，学习 **最佳实践**（工具方法、设计模式...）

## 目录介绍 :bookmark_tabs:

- [准备工作](./vue_learn_102_index_prepare.md)
- [框架结构一览](./vue_learn_103_index_frame.md)

- [Vue 初始化-开始](./vue_learn_201_init_start.md)
- [Vue 初始化-选项合并](./vue_learn_202_init_options.md)
- [Vue 初始化-渲染代理](./vue_learn_203_init_renderProxy.md)
- [Vue 初始化-生命周期](./vue_learn_204_init_life.md)
- [Vue 初始化-事件](./vue_learn_205_init_events.md)
- [Vue 初始化-渲染 render](./vue_learn_206_init_render.md)
- [Vue 初始化-生命周期钩子](./vue_learn_207_init_lifeHook.md)
- [Vue 初始化-Injections](./vue_learn_208_init_inject.md)
- [Vue 初始化-initState](./vue_learn_209_init_state.md)
- [Vue 初始化-provide](./vue_learn_210_init_provide.md)
- [Vue 初始化-总结](./vue_learn_211_init_end.md)

- [Vue 数据响应-赋予观察属性 observe](./vue_learn_301_reactive_observe.md)
- [Vue 数据响应-观察者 Observer](./vue_learn_302_reactive_Observer.md)
- [Vue 数据响应-动态响应 defineReactive](./vue_learn_303_reactive_defineReactive.md)
- [Vue 数据响应-观察订阅 dep](./vue_learn_304_reactive_dep.md)
- [Vue 数据响应-监听 watcher](./vue_learn_305_reactive_watcher.md)
- [Vue 数据响应-总结](./vue_learn_306_reactive_end.md)

- [Vue 渲染-render](./vue_learn_401_render_start.md)
- [Vue 渲染-词法解析 AST](./vue_learn_402_render_ast.md)

- [附录 生命周期图示](./vue_learn_001_lifecycle.md)

## 感谢和参考 :sunny:

由于一直在**搬砖**，让自己在技术面前依旧是**新人**，因为我从未深度了解**它们**。所以开始这段旅程前，需要很多人的指点和引导。再次感谢社区那些无私奉献的大佬们。

如果觉得需要更多的参考，可以看下以下链接：

- [Vue 技术内幕--hcysun](http://hcysun.me/vue-design/) 超详细的解读，还有不错的排版
- [ECMAScript 6 入门--阮一峰](http://es6.ruanyifeng.com/)
- [停止学习框架](https://juejin.im/post/5c1a839f518825780008537d)
