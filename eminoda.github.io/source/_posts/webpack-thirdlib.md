---
title: webpack引入第三方插件
date: 2017-05-02 21:30:24
tags:
  - webpack
categories: webpack
comments: true
---

## cdn外部链接引入
1. script引入第三方js插件
````
<script src="https://cdn.bootcss.com/jquery/1.10.1/jquery.js"></script>
````

2. webpack配置:externals暴露插件变量
````
entry:{
	'vendors':['jquery']//由于已经externals，模块不会被打包
},
externals: {
  jquery: "jQuery"//定义第三方插件全局变量
}
````

3. 业务js
```` 
var $ = require('jquery');//module.exports = jQuery;
````

### 好处
1. 减少js文件大小，增加打包速度
2. 在业务js中定义$,局部引用$或者对应第三方插件变量，防止全局污染

## vendor引入
1. webpack配置 
````
entry:{
	'vendors':['jquery']//会被打包到vendor.js
},
resolve:{
  extensions:['.js', '.css'],
  alias:{
    jquery:path.join(__dirname,'../node_modules/jquery/dist/jquery.js')//减少webpack检索
  }
}
````

2. 业务js
```` 
var $ = require('jquery');
````

### 好处
1. 减低第三方依赖不稳定，可自定义static资源，稳定。
2. 配置resolve加快检索速度（目前没明显发现快很多）

### 坏处
1. vendor庞大，打包速度慢

## webpack第三方插件
1. ProvidePlugin
````
entry:{
	'vendors':['jquery','bootstrap'],
},
resolve:{
  extensions:['.js', '.css'],
  alias:{
    jquery:path.join(__dirname,'../node_modules/jquery/dist/jquery.js'),
    bootstrap:path.join(__dirname,'../node_modules/bootstrap/dist/js/bootstrap.js')
  }
},
plugins:[
	new webpack.ProvidePlugin({
	  $: "jquery",
	  jQuery:"jquery"
	})
]

````
2. 业务js不用再require

### 好处
1. 定义全局化变量，任何js都可以使用$

## 感谢
[webpack引入jquery多种方法探究](https://segmentfault.com/a/1190000007249293)
[provideplugin-vs-externals](http://quabr.com/23305599/webpack-provideplugin-vs-externals)