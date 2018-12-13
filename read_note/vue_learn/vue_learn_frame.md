---
vue_learn 框架结构一览
---

## 框架结构
列出主要目录，标注和源码相关用途（其他忽略）

````
├─.github
├─.circleci
├─.gitignore
├─.eslintignore
├─.flowconfig                   # flow 配置文件
├─.babelrc.js
├─.eslintrc.js
├─.editorconfig
├─package.json                  # package，着重script
├─node_modules
├─test
├─types
├─examples
├─benchmarks
├─scripts
|    ├─config.js                # rollup 相关构建脚本
|    ├─...
├─packages                      # 平台相关
|    ├─weex-vue-framework
|    ├─weex-template-compiler
|    ├─vue-template-compiler
|    ├─vue-server-renderer
├─flow                          # flow 相关构建脚本
|  ├─...
├─dist                          # 不同环境输出的vue文件
|  ├─vue.common.dev.js
|  ├─vue.common.js
|  ├─vue.common.prod.js
|  ├─vue.esm.browser.js
|  ├─vue.esm.browser.min.js
|  ├─vue.esm.js
|  ├─vue.js
|  ├─vue.min.js
|  ├─vue.runtime.common.dev.js
|  ├─vue.runtime.common.js
|  ├─vue.runtime.common.prod.js
|  ├─vue.runtime.esm.js
|  ├─vue.runtime.js
|  └vue.runtime.min.js
├─src                           # 我们要关心的目录
|  ├─shared                     # 全局一些方法
|  |   ├─constants.js
|  |   └util.js
|  ├─sfc
|  |  └parser.js
|  ├─server
|  |   ├─create-basic-renderer.js
|  |   ├─create-renderer.js
|  |   ├─render-context.js
|  |   ├─render-stream.js
|  |   ├─render.js
|  |   ├─util.js
|  |   ├─write.js
|  |   ├─webpack-plugin
|  |   ├─template-renderer
|  |   ├─optimizing-compiler
|  |   ├─bundle-renderer
|  ├─platforms                  # 平台相关
|  |     ├─weex
|  |     ├─web
|  ├─core                       # 核心代码区，会在此反复翻阅
|  |  ├─config.js
|  |  ├─index.js
|  |  ├─vdom
|  |  ├─util
|  |  ├─observer
|  |  ├─instance
|  |  ├─global-api
|  |  ├─components
|  ├─compiler
````
## 简易流程
描述Vue是如何工作，不会详细到具体，笼统的讲下流程。也是后续看源码的一个思路指引。

1. 从 package.json 入手

    **vue版本2.5.20**，特此说明

    只针对 **npm run dev** 这么一个脚本说明。其他环境有兴趣的同学可以尝试，学习。
    启动目前只遇到这问题：[vue编译 Error: Could not load /src/core/config](https://segmentfault.com/a/1190000017335977)，其他问题的话欢迎 issue
    ````
    "scripts": {
        "dev": "rollup -w -c scripts/config.js --environment TARGET:web-full-dev"
        ...
    }
    ````

2. 分析 rollup.config

    scripts\config.js

    ````js
    if (process.env.TARGET) {
        module.exports = genConfig(process.env.TARGET)
    }
    // 拿到script脚本设置的目标环境 web-full-dev
    const builds = {
        'web-full-dev': {
            entry: resolve('web/entry-runtime-with-compiler.js'),
            dest: resolve('dist/vue.js'),
            format: 'umd',
            env: 'development',
            alias: { he: './entity-decoder' },
            banner
        }
    }
    // 会返回 rollup 需要的标准配置结构
    function genConfig (name) {
        const opts = builds[name]
        const config = {
            input: opts.entry,
            external: opts.external,
            plugins: [
                replace(),
                flow(),
                buble(),
                alias(Object.assign({}, aliases, opts.alias))
            ].concat(opts.plugins || []),
            output: {
                file: opts.dest,
                format: opts.format,
                banner: opts.banner,
                name: opts.moduleName || 'Vue'
            },
            onwarn: (msg, warn) => {
            }
        }
        return config
    ````
3. 从入口文件开始，一路走到黑

    以下内容按照 **注释的编号顺序** 查看
    
    src\platforms\web\entry-runtime-with-compiler.js
    ````js
    // 1. 引入运行后Vue对象
    import Vue from './runtime/index'
    const mount = Vue.prototype.$mount
    // 定义 Vue.prototype.$mount，在渲染时调用
    Vue.prototype.$mount = function (
        ...
        return mount.call(this, el, hydrating)
    }
    Vue.compile = compileToFunctions
    ````

    src\platforms\web\runtime\index.js
    ````js
    // 2. 引入核心Vue对象
    import Vue from 'core/index'
    // 12. 定义 Vue.prototype.__patch__
    Vue.prototype.__patch__ = inBrowser ? patch : noop
    // 13. 定义 全局
    Vue.prototype.$mount = function(el,hydrating){
        return mountComponent(this, el, hydrating)
    }
    // 结束
    ````

    src\core\index.js
    ````js
    // 3. 引入Vue实例，这是整个Vue的起点，也就是Vue构造函数
    import Vue from './instance/index'
    // 9. 初始化全局方法
    initGlobalAPI(Vue)
    // 11. 定义其他一些 Vue.prototype 方法
    Object.defineProperty(Vue.prototype, '$isServer', {
        get: isServerRendering
    })

    Object.defineProperty(Vue.prototype, '$ssrContext', {
        get () {
            /* istanbul ignore next */
            return this.$vnode && this.$vnode.ssrContext
        }
    })
    ...
    ````

    src\core\instance\index.js
    ````js
    // 4. Vue构造函数
    function Vue (options) {
        ...
        // 5. 调用 Vue.prototype._init，初始化一系列方法
        this._init(options)
    }
    // 定义 初始化 Vue.prototype._init
    initMixin(Vue)
    // 定义 状态设置 Vue.prototype.$set，$delete，$watch
    stateMixin(Vue)
    // 定义 事件方法 Vue.prototype.$on，$once，$off，$emit
    eventsMixin(Vue)
    // 定义 生命周期 Vue.prototype._update，$forceUpdate,$destroy
    lifecycleMixin(Vue)
    // 定义 渲染方法 Vue.prototype.$nextTick，_render
    renderMixin(Vue)
    ````

    src\core\instance\init.js
    ````js
    // 6. 初始化
    Vue.prototype._init = function (options?: Object) {
        ...
        // 7. 初始化 相关方法 变量
        initLifecycle(vm)
        initEvents(vm)
        initRender(vm)
        callHook(vm, 'beforeCreate')
        initInjections(vm) // resolve injections before data/props
        initState(vm)
        initProvide(vm) // resolve provide after data/props
        callHook(vm, 'created')
        ...
        // 8. 渲染并挂载模板
        if (vm.$options.el) {
            vm.$mount(vm.$options.el)
        }
    }
    ````
    src\core\global-api\index.js
    ````js
    // 10. 定于全局方法
    export function initGlobalAPI (Vue: GlobalAPI) {
        ...
        Object.defineProperty(Vue, 'config', configDef)
        Vue.util = {
            warn,
            extend,
            mergeOptions,
            defineReactive
        }

        Vue.set = set
        Vue.delete = del
        Vue.nextTick = nextTick

        Vue.options = Object.create(null)
        ASSET_TYPES.forEach(type => {
            Vue.options[type + 's'] = Object.create(null)
        })
        Vue.options._base = Vue
        initUse(Vue) // 定义 Vue.use
        initMixin(Vue) // 定义 Vue.mixin
        initExtend(Vue) // 定义 Vue.extend
        initAssetRegisters(Vue) // Vue[type](component,directive,filter)
    }
    ````