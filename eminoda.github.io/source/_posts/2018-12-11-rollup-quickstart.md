---
title: rollup 5分钟入门
tags: rollup
categories:
    - 开发
    - node
thumb_img: rollup.png
date: 2018-12-11 16:31:01
---

# Rollup

不会耽搁太长时间，因为要看 vue 源码，其构建用的是 **rollup** ，而非 webpack。所以简单看了下。

如果要详细了解：[https://rollupjs.org](https://rollupjs.org)

## 简单介绍

和 webpack 一样，是一种“模块”构建工具，但和 webpack 有什么区别？这仁者见智了。起码我刚用 rollup 有以下几个体会：

-   更容易上手。

    可能有 webpack 经验，但简约的配置让一个新手能快速构建项目。

-   指定 lib 输出环境，更适合编译**框架 js**

    通过**--format**，可以指定输出 cmd，umd...等最终文件。

-   Tree-shaking

    没有测试过，但上手 Demo 给的第一感觉就是构件速度稍快些。

以上这些**纯属个人感受**。但不管怎么样，至少是被社区认可的（比如：Vue 就是用 Rollup）

## 上手 Demo

1.  安装 rollup

    ```
    npm install rollup -g
    ```

2.  新建 rollup.config.js

    ```js
    export default {
    	input: './src/main.js',
    	output: {
    		file: './packages/bundle.js',
    		format: 'cjs',
    		name: 'test'
    	}
    };
    ```

3.  目录结构

    ```
    E:.
    │  package.json
    │  test.txt
    │
    ├─packages
    │      bundle.js
    │
    ├─script
    │      rollup.config.js
    │
    └─src
            foo.js
            main.js
    ```

    foo.js

    ```
    console.log('foo init');
    class Foo {
        constructor() {
            this.name = 'foo';
        }
        say() {
            console.log('say...');
        }
    }
    export default Foo;
    ```

    main.js

    ```
    import Foo from "./foo";

    export default function() {
        console.log('load');
        console.log(new Foo().say());
    }
    ```

4.  输出

    执行：

    ```
    rollup -c ./script/rollup.config.js --environment TARGET:dev
    ```

    bundle.js

    ```js
    'use strict';

    console.log('foo init');
    class Foo {
    	constructor() {
    		this.name = 'foo';
    	}
    	say() {
    		console.log('say...');
    	}
    }

    function main() {
    	console.log('load');
    	console.log(new Foo().say());
    }

    module.exports = main;
    ```

    ```

    ```

## 配置介绍

| 命令                       | 说明                                         |
| -------------------------- | -------------------------------------------- |
| -c,--config                | 定义配置文件                                 |
| -o, --file                 | 定义输出位置文件                             |
| -n, --name                 | 在 umd 模式下，定义模块名称                  |
| --environment \<xx:value\> | 设置环境变量，会同步到 **process.env.xx 中** |

[更多详见:https://rollupjs.org/guide/en#command-line-flags](更多详见:https://rollupjs.org/guide/en#command-line-flags)，建议不要看中文版本，有些配置会省略。
