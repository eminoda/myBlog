---
title: mintui loadmore 滚动加载和浏览器的兼容问题
tags:
  - vue
  - mint-ui
categories:
  - 开发
  - 前端开发
thumb_img: vue.png
---

## 前言

在开篇之前，如果你要使用 mint-ui 作为 vue 的移动端 ui 框架的话，我给你的建议就是换个别的吧（原因就是这项目活跃度到冰点了），当然这丝毫不影响我们探究浏览器兼容那些事，积累经验就是不放过任何机会。

很早很早以前，使用饿了吗 的 mint-ui 移动框架时，就发现分页加载 loadmore 组件在部分浏览器中不能正常工作（上拉无法加载下一页）。说来惭愧，以前原以为是部分老机器的低版本浏览器问题，全当忽略了，只是简单写了一篇 [vue minuti 分页实现](https://eminoda.github.io/2018/09/04/vue-mintui-page/)，粗略带过了浏览器兼容性的一些问题。

近期又有高频类似的问题出现，甚至 chrome 也是，这就需要紧急解决了。借这个机会再次翻看 loadmore 组件，探究其中真相。

## 兼容问题

### 滚动条

这是第一个兼容问题，可以从这个 [PR](https://github.com/ElemeFE/mint-ui/commit/e7e6f0b1acc766e009dfa670e8a2adc091dc2a68) 上明白问题的原因。

{% asset_img scrollTop.png scrollTop %}

原因就是不同浏览器厂商，对 scrollTop 的识别是不同的。

我们先搞清楚 scrollTop 是什么意思？

当页面内容过长，浏览器就会提供滚动条来存放这部分溢出页面。 scrollTop 就是该元素到窗口可见内容顶部那么个距离（如果没有发生垂直滚动，值就为 0 ）

虽然很多文章列出过 scrollTop 在不同浏览器的支持性，但没有关联版本信息的，随着浏览器的更新变化，无法确信是否现在还是列出过的那样。下面我列下我测试过的几款浏览器（当然主要是移动端，机型为小米）

| 浏览器                      | document.documentElement.scrollTop | document.body.scrollTop |
| --------------------------- | ---------------------------------- | ----------------------- |
| 微信 v7.0.7 （安卓）        | 0                                  | ok                      |
| 小米 v11.0.10（安卓）       | 0                                  | ok                      |
| **Chrome v78.0（安卓）**    | ok                                 | 0                       |
| UC v12.7（安卓）            | 0                                  | ok                      |
| 搜狗 v8.5（PC 调试）        | 0                                  | ok                      |
| **Chrome v76.0（PC 调试）** | ok                                 | 0                       |

排版原因，详细信息单独列出：

| 浏览器                | 详细信息                                                                                                                                                                                                                                                                           |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 微信 v7.0.7 （安卓）  | Mozilla 5.0 (Linux; Android 9; MI 9 Build/PKQ1.181121.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/044904 Mobile Safari/537.36 MMWEBID/3397 MicroMessenger/7.0.7.1521(0x2700073A) Process/tools NetType/WIFI Language/zh_CN |
| 小米 v11.0.10（安卓） | Mozilla 5.0 (Linux; U; Android 9; zh-cn; MI 9 Build/PKQ1.181121.001) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/71.0.3578.141 Mobile Safari/537.36 XiaoMi/MiuiBrowser/11.0.10                                                                                       |
| **Chrome（安卓）**    | Mozilla 5.0 (Linux; Android 9; MI 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.62 Mobile Safari/537.36                                                                                                                                                               |
| UC（安卓）            | Mozilla 5.0 (Linux; U; Android 9; zh-CN; MI 9 Build/PKQ1.181121.001) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/57.0.2987.108 UCBrowser/12.7.1.1051 Mobile Safari/537.36                                                                                            |
| 搜狗（PC 调试）       | Mozilla 5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1                                                                                                                                              |
| **Chrome（PC 调试）** | Mozilla 5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1                                                                                                                                            |

很看到 Chrome 浏览器在 scrollTop 在 **document.documentElement.scrollTop** 上获取不到值，导致了 mint-ui 判断是否加载到页面底部的逻辑“失效”，导致上拉加载失败。

只要在原有判断基础上做如下处理即可：

```js
Math.max(document.body.scrollTop, document.documentElement.scrollTop);
```

因为个人喜好，我通常在搜狗浏览器做开发，但值得一提的是，**虽然搜狗也用的是 Chrome 一样的内核，却在该属性取值却获取不到**（这就很神奇了）。导致了主观上一直认为 Chrome 这样的浏览器不会出现兼容问题。

当然也可以使用 **window.pageYOffset (window.scrollY)** ，上述所测的浏览器都支持这属性。

另外我也同时列了 UC 做个特例说明，因为就算更正了判断逻辑，还是上拉加载还是有问题，这就涉及下个需要剖析的问题 —— **屏幕可视高度**。

### 屏幕可视高度

似乎调整了 scrollTop 的判断方式，有些浏览器功能得到了修复。但这里测试的 uc 浏览器还是不正常，这涉及浏览器的一些功能“优化”。

部分浏览器为了尽可能给用户呈现更多的页面内容，在上拉下拉时，会自动隐藏头部搜索框，或者底部的 tabbar 。这样做固然好，但对代码来说就会造成不小的麻烦。我截了些图来说下现象：

1. 页面初次加载

   注意该属性的取值 document.documentElement.clientHeight = 727 （mint-ui 中可视区域的判断），原本如果浏览器不做优化，那什么问题都没有。

   {% asset_img screen-init.png 未拖动时状态 %}

2. 当开始上拉后

   浏览器头部搜索框开始隐藏，同时 window.innerHeight 开始随着拖动变化，document.documentElement.clientHeight 却一直为初始值。

   {% asset_img screen-header.png 状态栏变化 %}

3. 上拉至顶部后

   搜索框消失，document.documentElement.clientHeight 依旧没有变化，但 window.innerHeight 却为最大的屏幕可视高度

   {% asset_img screen-end.png %}

这样就解释了为何 uc 浏览器不行的原因，需要对原有逻辑做这样的调整：

```js
Math.max(document.documentElement.clientHeight, window.innerHeight);
```

## 总结

上面两块内容只是针对 mint-ui loadmore 上拉加载功能的研究。

对应 demo 可以查看 [https://github.com/eminoda/mint-ui-test](https://github.com/eminoda/mint-ui-test)

浏览器兼容问题处理起来很困难，需要你对相关 js api 都较高的熟悉程度，同时还需要反复的实践来摸索最终的答案。希望通过此文能对解决类似问题有个触类旁通的指引，也可以帮助到有类似问题的同学。
