---
title: 开启 Express 模板缓存
tags:
  - express
categories:
  - 开发
  - node
thumb_img: express.png
date: 2019-03-14 13:35:06
---


## 起因

昨天压测某品牌网站首页，效果非常不理想：

> ab 参数：数量 -n 1000，并发 -c 100

{% asset_img ab1.png %}

| 指标             | 结果   |
| ---------------- | ------ |
| 每秒请求数       | 5.95s  |
| 单个请求平均用时 | 168ms  |
| 50% 以上请求用时 | 16-28s |

## 分析

由于首页接口调用繁重，定位问题有些“困难”，一步步看吧：

```js
// 首页
router.get('/', interceptor.fn, function(req, res, next) {
  Promise.all([
    newsService.findAllChannel(),
    newsService.findByAdspaceId(),
    newsService.findFriendLinks(),
    newsService.findAllChannel(),
    ...
  ]).then(function(data) {
    ...
    res.render('page/index.pug');
  }).catch(function(err) {
    next(err);
  });
});
```

### 先排除首页内部第三方服务接口的瓶颈

首页需支持 SEO，做了服务端渲染，并且至少 5 次会调用第三方 api。但这些接口用 ab 比较难制定，用 node 专门写了个测试 api 组合的压测，ab 结果如下：

{% asset_img ab3.png %}

| 指标             | 结果     |
| ---------------- | -------- |
| 每秒请求数       | 88.02s   |
| 单个请求平均用时 | 11.361ms |
| 50% 以上请求用时 | 0.9-8s   |

由于这些第三方服务数据量虽然重，但之前已经做过缓存优化。从结果可以发现并不是瓶颈的主要原因。

### 排除自身服务接口影响

内部服务采用 java，首页对其依赖很少，数据也很轻量。

拿了一个主要接口做测试，结果很理想：

| 指标             | 结果     |
| ---------------- | -------- |
| 每秒请求数       | 569.12s  |
| 单个请求平均用时 | 1.757ms  |
| 50% 以上请求用时 | 0.1-0.7s |

### node 非模板接口

找了一个 **非模板渲染** 的接口，做压测：

| 指标             | 结果       |
| ---------------- | ---------- |
| 每秒请求数       | 1347.95s   |
| 单个请求平均用时 | 0.742ms    |
| 50% 以上请求用时 | 0.07-0.09s |

结果甚至比 java 服务还要优秀，符合 node 本身的事务处理能力

[可参考：node 和 java 性能对比](https://eminoda.github.io/2018/11/08/pressure-test-node-java/)

### 最终定位到 node 渲染层

对比之下，首页就多了 render 页面渲染功能。果断打开 express 模板缓存。

```js
app.set('views', path.join(__dirname, 'views'));
app.set('view cache', true);
app.set('view engine', 'pug');
```

**对比之前未打开缓存**，结果如下：

{% asset_img ab2.png %}

| 指标             | 结果              |
| ---------------- | ----------------- |
| 每秒请求数       | 92.68s vs 5.95s   |
| 单个请求平均用时 | 10.790ms vs 168ms |
| 50% 以上请求用时 | 0.68-3s vs 16-28s |

可以发现性能 **大幅提升**，元凶找到。

具体缓存实现，参见附录。

## 附录（express cache 原理）

express 在启动时，会初始化 render options

```js
app.set('view cache', true);
...
app.render = function render(name, options, callback) {
    ...
    // set .cache unless explicitly provided
    if (renderOptions.cache == null) {
        renderOptions.cache = this.enabled('view cache');
    }
    ...
}
```

express 通过 View 对视图做解析，根据 ext 来选择指定模板引擎，同时第三方模板库会暴露一个 **\_\_express** 供 express 此处调用。

```js
function View(name, options) {
    ...
    if (!opts.engines[this.ext]) {
        // load engine
        var mod = this.ext.substr(1)
        debug('require "%s"', mod)

        // default engine export
        var fn = require(mod).__express

        if (typeof fn !== 'function') {
        throw new Error('Module "' + mod + '" does not provide a view engine.')
        }

        opts.engines[this.ext] = fn
    }
    ...
}
```

```js
// pug express 扩展
/**
 * Express support.
 */
exports.__express = function(path, options, fn) {
	if (options.compileDebug == undefined && process.env.NODE_ENV === 'production') {
		options.compileDebug = false;
	}
	exports.renderFile(path, options, fn);
};
```

打开 express 'view cache' 后，每次模板调用就会事先到缓存中命中，免去文件 io 的损耗和解析。

```js
// pug 模板缓存
function handleTemplateCache(options, str) {
	var key = options.filename;
	if (options.cache && exports.cache[key]) {
		return exports.cache[key];
	} else {
		if (str === undefined) str = fs.readFileSync(options.filename, 'utf8');
		var templ = exports.compile(str, options);
		if (options.cache) exports.cache[key] = templ;
		return templ;
	}
}
```
