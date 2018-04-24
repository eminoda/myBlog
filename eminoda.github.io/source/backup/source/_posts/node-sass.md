---
title: node8下node-sass报错
date: 2017-07-18 10:09:55
tags:
  - npm
  - node8
categories: npm
comments: true
---

# 安装node-sass报错
1. 重新安装node-sass
````
npm rebuild node-sass --force 
````

2. 重新安装gulp-sass等用到sass的npm模块
[gulp-sass for Node 8.x](https://github.com/dlmanning/gulp-sass/issues/610)