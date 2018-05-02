---
title: webpack最佳实践
tags: webpack
categories:
  - 前端
  - webpack
thumb_img: webpack2.jpg
---

{% asset_img start.jpg %}
标题写的有些博人眼球，主要解决一些项目中常见问题

## 本文适合那些童靴？
1. 熟悉webpack基本配置，需要进阶学习了解更多webpack内容
2. 了解gulp，grunt等其他前端构建工具，这样你才能知道webpack的优缺点
3. 有一定前端经验，不然我文笔不好，很容易看不懂
4. 配置webpack有遇到坑
5. webpack已经使用，但实际操作遇到问题。（如何进行代码丑化、编译速度提升、代码检查、缓存...）

ps：以目前团队在项目遇到问题，给出一些可落地的方案，帮助大家解决困难，如有不正确，欢迎指正

## 最佳实践
### 公用样式分离出来，sass变量由模块js引用，避免打包重复
css出现相同样式覆盖，导致整个css文件过大，影响加载速度
{% asset_img question-1.png %}
重现：
index.js导入2个css文件
{% asset_img answer-1-1.png %}
index和test.scss都分别引用了common.scss
{% asset_img answer-1-2.png %}
common.scss引用了_var.scss变量文件和维护了公共样式
{% asset_img answer-1-3.png %}
结果出现了重复css
{% asset_img answer-1-4.png %}
解决：公用css独立出来（style.scss），避免模块js中重复导入。模块js只导scss变量入(_var.scss)用于编译
{% asset_img answer-1-5.png %}

### sass中的资源文件（如fonts）怎么正确引入
使用__正确的__相对路径，但构建时找不到资源
{% asset_img question-2.png %}
````js
ERROR in ./node_modules/css-loader!./node_modules/sass-loader/lib/loader.js!./src/scss/style.scss
Module not found: Error: Can't resolve '../../assets/fonts/iconfont.eot' in 'E:\webpack_demo\src\scss'
@ ./node_modules/css-loader!./node_modules/sass-loader/lib/loader.js!./src/scss/style.scss 7:92-134 7:177-219
````
[查询sass-loader，得到官方的解决方法](https://github.com/webpack-contrib/sass-loader#problems-with-url)

{% asset_img answer-2-1.png %}
1. 更改相对路径，相对于**模块js**
2. 或者使用resolve-url-loader重写路径，[请再查阅resolve-url-loader的配置](https://github.com/bholloway/resolve-url-loader#apply-via-webpack-config)
3. ...

````
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
````

### 不要乱升级npm模块版本，不然你可能搞不定
写这篇文章，由于要写demo，重新安装模块，然后发现原来的写法报错，然后查实是当前模块版本有bug

使用file-loader，css中引用资源文件路径错误
````js
# BackSlash反斜杠分隔
static\fonts\iconfont.542d8e4.eot    70.9 kB          [emitted]
static\fonts\iconfont.1dab3e0.woff    41.1 kB          [emitted]
static\fonts\iconfont.14df282.ttf    70.8 kB          [emitted]
# 应该为：
static/fonts/iconfont.542d8e4.eot    70.9 kB          [emitted]
static/fonts/iconfont.1dab3e0.woff    41.1 kB          [emitted]
static/fonts/iconfont.14df282.ttf    70.8 kB          [emitted]
````
[原因：不知道为何1.1.8要改动资源文件加载方式，然后1.1.9又fixed](https://github.com/webpack-contrib/file-loader/commit/26e47ca)
很不凑巧我用了1.1.8，也因为这样很庆幸有了这样的实践条目。update version不要太激进
{% asset_img answer-3-1.png %}

### 性能提升（再开文章详讲）

### 未完待续TODO