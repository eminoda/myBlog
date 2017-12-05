---
title: vue 问题汇总
date: 2017-12-04 10:34:25
tags: vue
---

# 环境搭建
1. [Vue warn]: Cannot find element: #app
    没有在html模板中*[提供的元素只能作为挂载点](https://cn.vuejs.org/v2/api/#el)*

2. [Vue warn]: You are using the runtime-only build of Vue where the template compiler is not available. Either pre-compile the templates into render functions, or use the compiler-included build.
    [不同构建版本](https://cn.vuejs.org/v2/guide/installation.html#对不同构建版本的解释)
    ````
    # 需要指定所用的vue构建版本
    import Vue from 'vue';
    ````
    webpack别名制定
    ````
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
            'vue$': 'vue/dist/vue.esm.js'
        }
    }
    ````

3. [Vue warn]: Unknown custom element: <app> - did you register the component correctly? For recursive components, make sure to provide the "name" option.
    [Vue组件注册时，没有定义组件name](https://cn.vuejs.org/v2/api/#选项-其它)
    [Vue组件定义规范](https://cn.vuejs.org/v2/api/#Vue-component)

# vue-loader
1. 使用postcss预编译,Module not found: Error: Can't resolve 'sass-loader' in 'e:\github\vue-mintui\helloworld\src'
    ````
    <style lang="sass">
        /* write SASS! */
    </style>
    ````
    [css预处理](https://vue-loader.vuejs.org/zh-cn/configurations/pre-processors.html)

2. Invalid CSS after ".example {": expected "}", was "{"
    确认style的lang的语言是否正确

3. scss引入外部资源
    ````
    <style lang="scss">
        @import "./scss/index.scss";
        /* write SASS! */
    </style>
    ````

# vscode
1. http://eslint.org/docs/rules/space-before-function-paren  Missing space before function parentheses
    [https://github.com/vuejs/vetur/issues/226](https://github.com/vuejs/vetur/issues/226)
    ````
    # user setting
    "vetur.format.defaultFormatter.js": "vscode-typescript",
    "javascript.format.insertSpaceBeforeFunctionParenthesis": true
    ````

2. vetur template format
    ````
    "vetur.format.defaultFormatter.html": "prettier"
    ````

# 一些技巧
1. 异步加载
    [https://router.vuejs.org/zh-cn/advanced/lazy-loading.html](https://router.vuejs.org/zh-cn/advanced/lazy-loading.html)
    ````
    # 方式一：webpack require.ensure
    const ActivityCenter = () => require.ensure([], () => require('./components/Pages/Home/ActivityCenter.vue'), 'ActivtyCenter');
    
    # 方式二：webpack import
    const ActivityCenter = () => {
        return import ('./components/Pages/Home/ActivityCenter.vue');
    }
    # vue:promise 封装
    export default Promise.resolve({
        name: 'Active',
        data () {
            ...
        }
    })
    ````

2. webpack server proxy
    [https://doc.webpack-china.org/configuration/dev-server/#devserver-proxy](https://doc.webpack-china.org/configuration/dev-server/#devserver-proxy)
    ````
    devServer: {
        contentBase: './dist',
        port: '4200',
        // host:'127.0.0.1',//ip 区别localhost
        proxy: {
            '/**/*.api': "http://192.168.1.65:8090"
        }
    }
    ````

3. 与服务端交互Http
    [https://github.com/pagekit/vue-resource](https://github.com/pagekit/vue-resource)
    [https://www.npmjs.com/package/node-fetch](https://www.npmjs.com/package/node-fetch)
    [https://github.com/axios/axios](https://github.com/axios/axios)

4. rem em px
    [https://www.w3cplus.com/css3/define-font-size-with-css3-rem](https://www.w3cplus.com/css3/define-font-size-with-css3-rem)

5. 页面动画效果
    [https://router.vuejs.org/zh-cn/advanced/transitions.html](https://router.vuejs.org/zh-cn/advanced/transitions.html)
    ````
    # 定义vue场景切换的class
    .bounceInRight-enter-active {
        -webkit-animation-duration: 1s;
        animation-duration: 1s;
        -webkit-animation-fill-mode: both;
        animation-fill-mode: both;
        -webkit-animation-name: bounceInRight;
        animation-name: bounceInRight;
    }
    # aminate.css
    @-webkit-keyframes bounceInUp {
        from,
        60%,
        ...
    }
    ````