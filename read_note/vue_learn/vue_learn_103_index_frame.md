# Vue 框架结构

列出 vue 项目主要目录，标注和源码相关用途（其他忽略），这样在后续的阅读中知道是哪一块内容了。

```
├─.github                       # 工程化配置文件 start
├─.circleci
├─.gitignore
├─.eslintignore
├─.flowconfig
├─.babelrc.js
├─.eslintrc.js
├─.editorconfig                 # 工程化配置文件 end
├─package.json                  # package，着重 script
├─node_modules
├─test                          # 测试，如果你的项目需要 vue 的测试可以参考
├─types
├─examples
├─benchmarks                    # 性能实验对比
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
├─dist                          # 不同环境输出的 vue 文件
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
|  ├─shared                     # 全局的常量、方法
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
```

## 先粗略全览下框架

简单描述 Vue 是工作的流程，也是后续看源码的一个思路指引。

1. 从 package.json 入手

   选择版本：**vue 版本 ~~2.5.20~~ 2.6.10**（2019 年，尤大说要升级 3.0，不过感觉 delay 的风险很大）

   看下开发脚本：**npm run dev**

   ```js
   "scripts": {
       "dev": "rollup -w -c scripts/config.js --environment TARGET:web-full-dev"
       ...
   }
   ```

   启动目前只遇到这问题：[vue 编译 Error: Could not load /src/core/config](https://segmentfault.com/a/1190000017335977)

2. 分析 rollup.config

   ```js
   // vue/scripts/config.js

   // 拿到 script 脚本设置的环境 web-full-dev，返回对应配置 config 并导出
   if (process.env.TARGET) {
     module.exports = genConfig(process.env.TARGET);
   }
   const builds = {
     'web-full-dev': {
       entry: resolve('web/entry-runtime-with-compiler.js'),
       dest: resolve('dist/vue.js'),
       format: 'umd',
       env: 'development',
       alias: { he: './entity-decoder' },
       banner
     }
   };
   // 会返回 rollup 需要的标准配置结构
   function genConfig(name) {
     const opts = builds[name];
     const config = {
       input: opts.entry,
       external: opts.external,
       plugins: [replace(), flow(), buble(), alias(Object.assign({}, aliases, opts.alias))].concat(opts.plugins || []),
       output: {
         file: opts.dest,
         format: opts.format,
         banner: opts.banner,
         name: opts.moduleName || 'Vue'
       },
       onwarn: (msg, warn) => {}
     };
     // ...
     return config;
   }
   ```

3. 从入口文件 entry 开始，一路走到黑

   以下内容按照 **注释的编号顺序** 查看

   ```js
   // vue/src/platforms/web/entry-runtime-with-compiler.js

   // 【1】 引入运行时 Vue 对象
   import Vue from './runtime/index';
   const mount = Vue.prototype.$mount;
   // 【8】定义 Vue.prototype.$mount，在渲染时调用
   Vue.prototype.$mount = function() {
     // ...
     return mount.call(this, el, hydrating);
   };
   Vue.compile = compileToFunctions;
   // 【9】 将初始化好的 Vue 构造函数交付给我们使用者，在 new Vue({ el:'#app',data:{} }) 后，开始【10】
   export default Vue;
   ```

   ```js
   // vue/src/platforms/web/runtime/index.js

   // 【2】 引入核心 Vue 对象
   import Vue from 'core/index';
   // ...
   // 【6】 定义 Vue.prototype.__patch__
   Vue.prototype.__patch__ = inBrowser ? patch : noop;
   // 【7】 定义 Vue.prototype.$mount
   Vue.prototype.$mount = function(el, hydrating) {
     return mountComponent(this, el, hydrating);
   };
   ```

   ```js
   // vue/src/core/index.js

   // 【3】 引入 Vue 构造函数
   import Vue from './instance/index';
   // 【5】 初始化些 全局方法
   initGlobalAPI(Vue);
   // ...
   export default Vue;
   ```

   ```js
   // vue/src/core/instance/index.js

   // 【4】 定义 Vue 构造函数，并初始化
   function Vue (options) {
       ...
       // 【10】调用 Vue.prototype._init，初始化一系列方法
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

   export default Vue
   ```

   ```js
   // vue/src/core/instance/init.js

   Vue.prototype._init = function (options?: Object) {
       // ...
       initLifecycle(vm)
       initEvents(vm)
       initRender(vm)
       callHook(vm, 'beforeCreate')
       initInjections(vm) // resolve injections before data/props
       initState(vm)
       initProvide(vm) // resolve provide after data/props
       callHook(vm, 'created')
       ...
       // 【11】 渲染并挂载模板，执行【8】中 $mount
       if (vm.$options.el) {
           vm.$mount(vm.$options.el)
       }
   }
   ```

到此 Vue 主要流程结束，后续开始解读其中细节，从 Vue 构造函数的 \_init 开始看。

上一篇：[准备工作](./vue_learn_102_index_prepare.md)

下一篇：[Vue 初始化-初始化开始](./vue_learn_201_init_start.md)
