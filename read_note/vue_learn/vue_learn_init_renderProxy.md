<!-- vue_learn--init初始化 渲染代理 -->
# 渲染代理 vm._renderProxy
接着 mergeOptions 后赋值给 vm.$options ，将看到如下代码：
````js
if (process.env.NODE_ENV !== 'production') {
    initProxy(vm)
} else {
    vm._renderProxy = vm
}
````
**initProxy** 作用定义一个 vm._renderProxy 渲染代理的函数

// TODO ptions.render && options.render._withStripped 哪里定义？
````js
initProxy = function initProxy (vm) {
    if (hasProxy) {
        // determine which proxy handler to use
        const options = vm.$options
        const handlers = options.render && options.render._withStripped
        ? getHandler
        : hasHandler
        vm._renderProxy = new Proxy(vm, handlers)
    } else {
        vm._renderProxy = vm
    }
}
````

render 和 render._withStripped 哪里定义先放放，因为从头扫过来没有发现这两个属性，不过重点可以放在后面两个方法：

**getHandler**

src 全局搜索并没有发现 _withStripped，（render._withStripped 出现在 test\unit\features\instance\render-proxy.spec.js，并且赋值 true）
我们又可以把视线放在 getHandler 中。

````js
const getHandler = {
    // 定义一个 get function
    get (target, key) {
        if (typeof key === 'string' && !(key in target)) {
            if (key in target.$data) warnReservedPrefix(target, key)
            else warnNonPresent(target, key)
        }
        return target[key]
    }
}
````

get 能看出是一个 getter 作用的函数，方法作用是从 target 里查询 key 合不合法，然后给予警告。

哪里调用 vm._renderProxy？target 是哪个对象参数？

````js
// src\core\instance\render.js
Vue.prototype._render = function (): VNode {
    ...
    vnode = render.call(vm._renderProxy, vm.$createElement)
    ...
}
function initRender(vm: Component) {
    ...
    // createElement 渲染函数
    vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)
    ....
}
````

可能你也会有和我一样的疑问：_render 哪里冒出来的，执行顺序不对啊？其实看下 vue instance/index.js

````js
function Vue (options) {
  ...
  this._init(options)
}
...
renderMixin(Vue)
````
一开始在 函数声明 的时候就初始化了这些方法。这里做个备注。

**hasHandler** 暂时跳过，作用其实和 getHandler 类似，只是出发点不同。

````js
const hasHandler = {
    // 定义一个 has 函数
    has (target, key) {
        const has = key in target
        const isAllowed = allowedGlobals(key) ||
        (typeof key === 'string' && key.charAt(0) === '_' && !(key in target.$data))
        if (!has && !isAllowed) {
            if (key in target.$data) warnReservedPrefix(target, key)
            else warnNonPresent(target, key)
        }
        return has || !isAllowed
    }
}
````