---
title: webpack-problem-collection
tags: webpack
categories:
  - 前端
  - webpack
no_sketch: true
---

记录webpack开发中遇到的问题，及处理

## Invalid CSS after "...load the styles": expected 1 selector or at-rule, was "var content = requi"
loader重复定义
比如你用vue-cli造个轮子，然后他定义css解析是在webpack.dev.conf.js中，无脑复制过去。又在webpack.base.conf.js里按照自己方式定义了个css loader，就会有问题。

webpack.dev.conf.js
````js
const devWebpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap, usePostCSS: true })
  }
}
````

参考:
> https://github.com/vuejs-templates/webpack-simple/issues/107