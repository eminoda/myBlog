---
title: 阿里云 CDN 使用
tags: cdn
categories:
    - 开发
    - 网站优化
date: 2019-02-18 15:47:55
---

# CDN

> 阿里云内容分发网络（Alibaba Cloud Content Delivery Network，简称 CDN）将您源站资源缓存至阿里云遍布全球的加速节点上。当终端用户请求访问和获取这些资源时，无需回源，系统将就近调用 CDN 节点上已经缓存的资源。

> 在不同区域、不同场景下使用 CDN 加速您网站内容的分发，将有效分担源站压力，避免网络拥塞，提升用户访问资源的速度和体验。

# 阿里云 CDN 服务

[万网/阿里云解析与配置 CNAME 流程](https://help.aliyun.com/document_detail/27144.html?spm=5176.11785003.0.0.50bc142faX2uwE)

## 开通 CDN

默认开通是 **流量模式**，根据不同站点的流量选择不同类型的套餐。

## 配置

1. 进到 CDN 控制台，添加新配置

-   **加速域名** 支持泛解析。（这是给 **使用方** 的域名）
-   缓存资源类型 这里选择小文件，诸如：js、css 等
-   来源 目前选择域名来源，自定义不同的二级域名

    {% asset_img setting-cdn.png 示例 %}

2. 记录 CNAME 设置完后，稍等片刻就会出现 CNAME，之后域名解析需要使用

    {% asset_img setting-cdn-result.png 示例 %}

3. **域名解析** 配置修改新增一条 CNAME 类型的记录

    {% asset_img setting-domain.png 示例 %} {% asset_img setting-domain-result.png 示例 %}

## 测试

验证 CDN 是否配置正确：确认 cdn 域名是否解析到 CNAME 上。 {% asset_img ok.png 示例 %}

实际效果：

比如之前有个资源地址：http://image.shidouhua.cn/cdn1.png

当来自客户端的请求获取服务器资源时：

```js
// 首次 200
58.247.91.82 - - [15/Feb/2019:17:27:00 +0800] "GET /cdn1.png HTTP/1.1" 200 117773 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.96 Safari/537.36" "-"
// 第二次 因为浏览器缓存，304
58.247.91.82 - - [15/Feb/2019:17:27:11 +0800] "GET /cdn1.png HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.96 Safari/537.36" "-"
```

当有了 CDN 后，资源地址 **更改** 为：http://imagecdn.shidouhua.cn/cdn1.png

如果配置都 ok ，客户端不会从服务器获取资源，而是从 CDN 节点拿数据，从而 **降低服务器负载，加速网站**

## 更新 CDN 缓存

因为缓存，所以就算原服务器更新的资源，客户端也不会及时生效，这就需要在资源变动时主动通知 CND 节点更新新资源。

手动方式：

{% asset_img fresh.png 示例 %}

缺点：对于大量资源通过这种方式很难控制

接口方式： [RefreshObjectCaches 等](https://help.aliyun.com/document_detail/27200.html?spm=a2c4g.11186623.6.809.24182c7dfXR2eu)

优点：可定制化

缺点：需要开发（但可参考[refresh-aliyun-cdn](https://www.npmjs.com/package/refresh-aliyun-cdn)）
