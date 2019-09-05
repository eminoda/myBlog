---
title: webpack 最佳实践
tags: webpack
categories:
  - 开发
  - 前端开发
thumb_img: webpack2.jpg
date: 2018-05-02 22:15:17
---

{% asset_img start.jpg %}
标题写的有些博人眼球，主要解决一些项目中常见问题

## 本文适合那些童靴？

1. 熟悉 webpack 基本配置，需要进阶学习了解更多 webpack 内容
2. 了解 gulp，grunt 等其他前端构建工具，这样你才能知道 webpack 的优缺点
3. 有一定前端经验，不然我文笔不好，很容易看不懂
4. 配置 webpack 有遇到坑
5. webpack 已经使用，但实际操作遇到问题。（如何进行代码丑化、编译速度提升、代码检查、缓存...）

ps：以目前团队在项目遇到问题，给出一些可落地的方案，帮助大家解决困难，如有不正确，欢迎指正

## 最佳实践

### 如何区分不同环境加载不同配置

1. 维护 npm script，构建不同命令，加载不同配置文件

```json
"scripts": {
    "start": "cross-env NODE_ENV=development webpack-dev-server --inline --progress --config build/webpack.dev.conf.js",
    "build:test": "cross-env NODE_ENV=development webpack --config build/webpack.dev.conf.js",
    "build:production": "cross-env NODE_ENV=production webpack --config build/webpack.pro.conf.js"
}
```

    npm run start //开发脚本
    npm run build:test //测试环境打包
    npm run build:production //线上环境打包

2. [配置 DefinePlugin](https://webpack.js.org/plugins/define-plugin/#usage)

```js
plugins: [new webpack.DefinePlugin(config.systemEnv())];
```

### 公用样式分离出来，sass 变量由模块 js 引用，避免打包重复

css 出现相同样式覆盖，导致整个 css 文件过大，影响加载速度
{% asset_img question-1.png %}
重现：
index.js 导入 2 个 css 文件
{% asset_img answer-1-1.png %}
index 和 test.scss 都分别引用了 common.scss
{% asset_img answer-1-2.png %}
common.scss 引用了\_var.scss 变量文件和维护了公共样式
{% asset_img answer-1-3.png %}
结果出现了重复 css
{% asset_img answer-1-4.png %}
解决：公用 css 独立出来（style.scss），避免模块 js 中重复导入。模块 js 只导 scss 变量入(\_var.scss)用于编译
{% asset_img answer-1-5.png %}

### sass 中的资源文件（如 fonts）怎么正确引入

使用**正确的**相对路径，但构建时找不到资源
{% asset_img question-2.png %}

错误如下：

```js
ERROR in ./node_modules/css-loader!./node_modules/sass-loader/lib/loader.js!./src/scss/style.scss
Module not found: Error: Can't resolve '../../assets/fonts/iconfont.eot' in 'E:\webpack_demo\src\scss'
@ ./node_modules/css-loader!./node_modules/sass-loader/lib/loader.js!./src/scss/style.scss 7:92-134 7:177-219
```

[查询 sass-loader，得到官方的解决方法](https://github.com/webpack-contrib/sass-loader#problems-with-url)

{% asset_img answer-2-1.png %}

1. 更改相对路径，相对于**模块 js**
2. 或者使用 resolve-url-loader 重写路径，[请再查阅 resolve-url-loader 的配置](https://github.com/bholloway/resolve-url-loader#apply-via-webpack-config)
3. ...

```
# 采用resolve-url-loader解决方式
{
    test: /\.scss$/,
    use: ExtractTextPlugin.extract({
        fallback: "style-loader",
        use: [{
            loader: "css-loader" // translates CSS into CommonJS
        }, {
            loader: "resolve-url-loader"
        }, {
            loader: "sass-loader?sourceMap" // compiles Sass to CSS
        }]
    })
}
```

### 不要乱升级 npm 模块版本，不然你可能搞不定

写这篇文章，由于要写 demo，重新安装模块，然后发现原来的写法报错，然后查实是当前模块版本有 bug

使用 file-loader，css 中引用资源文件路径错误

```js
# BackSlash反斜杠分隔
static\fonts\iconfont.542d8e4.eot    70.9 kB          [emitted]
static\fonts\iconfont.1dab3e0.woff    41.1 kB          [emitted]
static\fonts\iconfont.14df282.ttf    70.8 kB          [emitted]
# 应该为：
static/fonts/iconfont.542d8e4.eot    70.9 kB          [emitted]
static/fonts/iconfont.1dab3e0.woff    41.1 kB          [emitted]
static/fonts/iconfont.14df282.ttf    70.8 kB          [emitted]
```

[原因：不知道为何 1.1.8 要改动资源文件加载方式，然后 1.1.9 又 fixed](https://github.com/webpack-contrib/file-loader/commit/26e47ca)
很不凑巧我用了 1.1.8，也因为这样很庆幸有了这样的实践条目。update version 不要太激进
{% asset_img answer-3-1.png %}

### 性能提升-外部资源文件导入

使用 externals 关联 cdn 文件

```js
externals: {
    'vue': 'Vue',
    'vue-router': 'VueRouter',
    'vuex': 'Vuex',
    'rx-lite': 'Rx'
}
```

index.html

```html
...
<script src="/static/vue.all.js"></script>
```

### 未完待续 TODO

- jade、pug 如何使用 html-webpack-plugin 到出文件
- 多页面配置
- 性能提升-多线程并行操作
- 性能提升-别名 alias
- 资源文件缓存策略
