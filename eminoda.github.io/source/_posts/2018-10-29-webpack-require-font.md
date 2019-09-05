---
title: webpack 中使用 sass-loader 如何正确加载 font 字体
tags: webpack
categories:
  - 开发
  - 前端开发
thumb_img: webpack.png
date: 2018-10-29 17:27:44
---

## 出现的问题

使用 webpack 通常会用到 sass-loader，当然这不是重点。问题是引用 font 字体文件时会出现如下错误：

{% asset_img 1.png %}

再看看目录结构和引用方式：

{% asset_img 2.png %}

```js
@font-face {font-family: "iconfont";
    src: url('../../assets/fonts/iconfont.eot?t=1540697325659'); /* IE9*/
    src: url('../../assets/fonts/iconfont.eot?t=1540697325659#iefix') format('embedded-opentype'), /* IE6-IE8 */
    url('../../assets/fonts/iconfont.woff?t=1540697325659') format('woff'),
    url('../../assets/fonts/iconfont.ttf?t=1540697325659') format('truetype'), /* chrome, firefox, opera, Safari, Android, iOS 4.2+*/
    url('../../assets/fonts/iconfont.svg?t=1540697325659#iconfont') format('svg'); /* iOS 4.1- */
  }
```

而然文件引用层级和目录的结构又是正确的，为什么加载字体文件的时候会出问题？

## 官方解释

[https://github.com/webpack-contrib/sass-loader#problems-with-url](https://github.com/webpack-contrib/sass-loader#problems-with-url)

{% asset_img 3.png %}

简单讲就是 sass-loader 这个加载器没有提供 url 重写的功能，所以导致即使你文件路径是“正确的”，其实还是引用不到。
再画个重点：其实通过 background 之类用到 url，还是加载不到资源的，只是我们可能通常会把 font 文件通过抽取到公共目录下，导致 url rewriting 的问题会被暴露出来。

拿 background 举 2 个例子：

index.scss //没有报错。引用和资源路径对象，其实只是误打误撞而已

```
@import "./common/testSass.scss";
.image{
    width: 100px;
    height: 100px;
    border:1px solid green;
    background: url('../assets/images/logo.png') 100% 100%;
}
```

testSass.scss //报错。看似引用正确，其实和 font 的问题一致

```
.image{
    width: 100px;
    height: 100px;
    border:1px solid green;
    background: url('../../assets/images/logo.png') 100% 100%;
}
```

## 如何解决

理解上面问题出现的原因，给出“可以”解决问题的方法：**把../../ 改成 ../**

testSass.scss // success

```
.image{
    width: 100px;
    height: 100px;
    border:1px solid green;
    background: url('../assets/images/logo.png') 100% 100%;
}
```

iconfont.scss // success

```
@font-face {font-family: "iconfont";
    src: url('../assets/fonts/iconfont.eot?t=1540697325659'); /* IE9*/
    src: url('../assets/fonts/iconfont.eot?t=1540697325659#iefix') format('embedded-opentype'), /* IE6-IE8 */
    url('../assets/fonts/iconfont.woff?t=1540697325659') format('woff'),
    url('../assets/fonts/iconfont.ttf?t=1540697325659') format('truetype'), /* chrome, firefox, opera, Safari, Android, iOS 4.2+*/
    url('../assets/fonts/iconfont.svg?t=1540697325659#iconfont') format('svg'); /* iOS 4.1- */
  }
```

因为上面 出问题 的引用都是通过 css-loader ，所以根据上面的问题描述，得出：即使是子目录的文件还是根据入口文件来做引用(即 index.scss 的位置)。

官方其实给出了 2 个方案：

- Add the missing url rewriting using the resolve-url-loader. Place it before the sass-loader in the loader chain.
- Library authors usually provide a variable to modify the asset path. bootstrap-sass for example has an \$icon-font-path. Check out this working bootstrap example.

具体什么含义，可以参考 webpack 中文社区的解释。[https://webpack.docschina.org/loaders/sass-loader/](https://webpack.docschina.org/loaders/sass-loader/)

## 最终方案

安装 **relative-url-loader**

```
module: {
    rules: [
        {
            test: /\.scss$/,
            use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: ['css-loader', 'resolve-url-loader', 'sass-loader?sourceMap=true']
                    // use: ['css-loader', 'sass-loader']
                })
        }
```

sass 中的资源文件，按照“正确”的引用定义

```
@font-face {font-family: "iconfont";
    src: url('../../assets/fonts/iconfont.eot?t=1540697325659'); /* IE9*/
    src: url('../../assets/fonts/iconfont.eot?t=1540697325659#iefix') format('embedded-opentype'), /* IE6-IE8 */
    url('../../assets/fonts/iconfont.woff?t=1540697325659') format('woff'),
    url('../../assets/fonts/iconfont.ttf?t=1540697325659') format('truetype'), /* chrome, firefox, opera, Safari, Android, iOS 4.2+*/
    url('../../assets/fonts/iconfont.svg?t=1540697325659#iconfont') format('svg'); /* iOS 4.1- */
  }
```

```
.image{
    width: 100px;
    height: 100px;
    border:1px solid green;
    background: url('../../assets/images/logo.png') 100% 100%;
}
```

## 总结

这问题其实看到正确的文档内容，很快速能够解决，希望能帮到各位。
