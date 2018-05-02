---
title: webpack快速入门
tags: webpack
categories:
  - 前端
  - webpack
thumb_img: webpack.jpg
---

{% asset_img start.png %}

## [什么是webpack](https://webpack.js.org/concepts/)
webpack是模块打包工具，官网介绍就是辣么简单

## webpack和gulp
如果新项目用什么构建，我觉得webpack足矣。如果追求更好的构建，到部署等需求，应该webpack+少量的gulp。
从使用gulp和webpack的实践上看，webpack给我带来很多好处：
1. plugins不要费尽心思去找，webpack官网给你罗列了基本够用的插件
2. 模块化打包。以前用gulp还是传统的手动导入js、css，现在webpack可以一条龙服务
3. 各种loader，方便配置es6，jslint等...
4. 相比以前写各种gulp task，现在webpack配置更像一个框架，系统化配置调教，不用再像gulp可能还在为task执行顺序发愁。

缺点：
1. 如果真的有，那就是编译、构建速度真慢。虽然有很多解决方法，但破电脑真心带不动。
2. 配置繁琐

当然两者不能这样比较
webpack是模块化的解决方法，只是里面有了gulp的许多功能
gulp、grunt是构建工具，当然浅显的看没有webpack强大
平时使用，具体看大家的需求定位。

## 核心概念(官网有中文介绍，直接点进去看)
- [entry（模块入口）](https://doc.webpack-china.org/concepts/#入口-entry-)
- [output（文件输出）](https://doc.webpack-china.org/concepts/#出口-output-)
- [loader（构建工具）](https://doc.webpack-china.org/concepts/#loader)
- [plugins（构建插件）](https://doc.webpack-china.org/concepts/#插件-plugins-)

## 入门配置
### 模块入口
````
entry: {
    index: './src/index.js' //定义模块，文件相对webpack配置路径
}
````

