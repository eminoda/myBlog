---
title: Vue-SSR 服务器渲染实践
tags: vue
categories:
  - 开发
  - 前端开发
thumb_img: vue2.jpg
date: 2018-11-25 23:18:14
---

# 提前告知

- 参考 [**尤大的 SSR 指南**](https://ssr.vuejs.org)
- 本文 DEMO 已上传至 github，最好拉下来跑下效果，了解 SSR
- 因为 **搞不定** 对 SSR 还是心存疑虑，起码不会投入到实际运用

# 为什么要做 SSR——服务端渲染

- 为了 SEO，为了更好地给爬虫抓取页面信息。提升搜索引擎排名
- 优化页面渲染，节省资源损耗。尤其首屏展示
- 服务端控制必要的业务逻辑，解决信息屏蔽、安全等问题
- 生成静态网站...

# 怎么做——面临的问题

- 从前后端分离的技术变革又回到了后端渲染输出页面的模式
- 前端工作量增加，甚至变困难了
- 需要担心服务端的性能、健壮性问题
- 前后端怎么进行信息交互

# 一张图说明

{% asset_img ssr.png 来自官网，做了些标注 %}

这是 vue-ssr 的核心结构，从上图中我们能看到解决了上述考虑到的问题。

- 不用担心工作量，配置 **entry** 定制前后端的差异，其他交给 **webpack** 打包输出
- 前后端的数据通过 **vuex** 的 store 进行管理，browser 解析 **window.**INITIAL_STATE**** 拿到所需的一切
- 通过 **vue-router** 提前解析处理 **async** 的业务逻辑，render 页面准备输出到浏览器
- 如果觉得复杂有困难，除了看着 SSR 的上手文档，也能尝试官网推荐的 [https://nuxtjs.org/](https://nuxtjs.org/) 和 [https://github.com/vuejs/vue-hackernews-2.0/](https://github.com/vuejs/vue-hackernews-2.0/)

感谢尤大提供了健全的 SSR 方案，不过为了能更好的实现服务端渲染，还是建议从官方的 DEMO 开始。

# 参考代码

[https://github.com/eminoda/vue-ssr](https://github.com/eminoda/vue-ssr)

- “抄”的 vue-ssr 的 demo，如果看文档有问题，可以参考下。
- 异步路由报错，没有解决。原因是 third build plugins 提供了 browser 的变量，不知道以后会不会修正。
