---
title: npm 脚本执行
tags: npm
categories:
    - 前端
    - npm
thumb_img: npm.jpg
---

先看一段代码：

```js
// egg package.json
"scripts": {
    "start": "egg-scripts start --daemon --title=egg-server-example",
    "stop": "egg-scripts stop --title=egg-server-example"
}
```

然后问几个问题：

-   怎么没有类似 **bin/www.js** 的启动文件？
-   **egg-scripts** 没有全局安装，怎么能使用？
-   **--daemon --title=egg-server-example** 怎么其效果？

如果你对这些很模糊，就有必要看下这里解释了。

## npm bin

对于平时使用，我们都知道如下 script 脚本的含义

```js
"scripts":{
    "start":"node ./bin/www.js" // npm [run] start 运行项目 /bin/www.js
}
```

但对于开头所示例的例子，先来回答前两个问题：

**怎么没有类似 bin/www.js 的启动文件？**

可能比较复杂，因为牵扯到 egg 相关东西，简单说被 egg 所封装起来。
