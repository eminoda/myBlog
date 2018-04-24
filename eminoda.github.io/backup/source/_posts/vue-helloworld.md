---
title: vue 问题汇总
date: 2017-12-04 10:34:25
tags: vue
---

# error
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

4. [Vue warn]: Failed to mount component: template or render function not defined.
    
5. [Vue warn]: Property or method "splice" is not defined on the instance but referenced during render. Make sure that this property is reactive, either in the data option, or for class-based components, by initializing the property
    是不是处理过console.log(this)

6. Vue.directive调用vue instance?
    [请移步](https://cn.vuejs.org/v2/api/#VNode-接口)
    [请移步2](https://stackoverflow.com/questions/42777870/vuejs-2-0-how-to-access-vm-instance-within-hook-functions-in-custom-directives)

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

# 概念
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

6. stop prevent区别?
    .stop - 调用 event.stopPropagation()。
    .prevent - 调用 event.preventDefault()。

7. router中，to和:to的区别?

    ````
    vm.to = '/foo'
    <router-link to="to">foo
    //解析为
    <a href="/foo">foo</a>

    <router-link :to="to">foo
    //解析为
    <a href="#/foo">foo</a>
    ````

8. vue的vnode
    [简而已懂的一个blog](https://zhuanlan.zhihu.com/p/29220175)

# vue-mintui
饿了吗不错的ui框架，pc端element，移动端mintui。个人能力有限，用起来有些坑。
1. 上拉组件Loadmore
    问1：由于页面page上有个headerbar，调用onBottomLoaded()后，会自动向下滚动scrollTop += 50。
    解决：首次不重置loadmore.onBottomLoaded()，第二次后再调用。
    {% asset_img loadmore.gif 上拉加载自动上移的问题 %}

    问2：底部有tabbar，list展示补全
    解决：list中设置padding-bottom，拉长list
    {% asset_img loadmore2.gif 上拉加载自动上移的问题 %}

2. vue.esm.js:578 [Vue warn]: Error in created hook: "TypeError: Cannot read property 'onTopLoaded' of undefined"
    钩子函数：refs.loadmore.onBottomLoaded();等 是否写错地方了。

3. Toast全局唯一
    由于每调用接口，就new一个Toast，在不同的tab页下切换会导致不同的Toast显示重叠
    解决：全局初始化一个变量，并且每次new Toast后，获取return的instance，重复调用时先close历史Toast，再open新的。
    
    ````
    showToast: (options) => {
        if (MINUTI.toastInstance) {
            MINUTI.toastInstance.close();
        }
        MINUTI.toastInstance = Toast({
            message: typeof options === 'string' ? options : options.message,
            position: options.position || 'middle',
            duration: options.duration || SYSTEM.TOAST_TIMEOUT
        });
        // console.log(MINUTI.toastInstance.closed);
    }
    ````

4. 选中效果初始加载未实现

````
data() {
    return {
      selected: '1'//字符串还是数字，需要确认
    };
  }
````