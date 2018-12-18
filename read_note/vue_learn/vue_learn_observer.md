<!-- vue_learn--observer 观察者模型 -->
# Observer 观察者模型
紧接着 vue.prototype.init ，看下 beforeCreate 后发生哪些事情
````js
...
callHook(vm, 'beforeCreate')
initInjections(vm) // resolve injections before data/props
initState(vm)
initProvide(vm) // resolve provide after data/props
callHook(vm, 'created')
```` 