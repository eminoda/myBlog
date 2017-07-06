---
title: nginx-403
date: 2017-07-06 09:26:35
tags:
  - nginx
  - nginx-forbidden
categories: nginx
comments: true
---

## 现象
{% asset_img 1.png forbidden %}

## 解决
修改nginx配置 user权限

````
#user nginx
user root
````