# Vue 数据响应-总结

已 initState 中的 initData 作为切入点，开始数据响应整个流程

- 通过 mergeOptions 策略，获取 vm.\$options.data 属性
- 将 data 交给 observe()
- observe() 先会检查 data 是否具备观察属性 \_\_ob\_\_，没有创建 Observer 观察者
- 将 \_\_ob\_\_ 作为 data 的数据属性，并且 data.**ob** 的 value 指向 Observer 实例
- 遍历 data 属性，在 data[key] 上定义访问属性 setter/getter
- 当 data[key] 访问属性被触发时，就会对应执行 Dep.notify() 和 Dep.depend()
- 对应就会触发 Watcher 对应方法，在 Watcher 实例上控制对应的变量（当然这块暂时没有细究）

触发 data[key] ，不是在 initState 调用，需要在渲染部分再深入学习

同时对于 Watcher 中的控制依赖 Deps 队列逻辑也没有涉及，之后找空再看下。

上一篇：[Vue 数据响应-监听 watcher](./vue_learn_305_reactive_watcher.md)

下一篇：[Vue 渲染-render](./vue_learn_401_render_start.md)
