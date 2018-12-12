---
vue_learn 框架一览
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
描述Vue是如何工作，不会详细到具体，笼统的讲下流程
1. 从 package.json 入手

    **vue版本2.5.20**，特此说明

    只针对 **npm run dev** 这么一个脚本。其他环境有兴趣的同学可以尝试，学习。
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
3. 确定编译的起始文件 entry-runtime-with-compiler.js

    src\platforms\web\entry-runtime-with-compiler.js