---
title: jenkins自动部署
tags: jenkins
categories:
  - 运维
date: 2018-04-27 10:59:04
thumb_img: jenkins2.jpg
---


## **传统**方式
{% asset_img example-1.gif %}
我们要经历哪些步骤？
- 打开IDE，进入项目
- 构建项目
- 将build的包复制出来
- 打开ftp工具，进入指定路径
- 上传包，解压包
- 打开shell工具，重启服务器

## 持续交付
{% asset_img example-2.jpg %}

### 配置git
{% asset_img config-1.png %}

### 配置SSH
{% asset_img config-2.png 下载插件 %}
{% asset_img config-3.png 配置ssh认证 %}
{% asset_img config-4.png 配置ssh认证 %}
{% asset_img config-5.png 构建时候对远端server做一些处理 %}
{% asset_img config-6.png foo %}

## 持续部署
{% asset_img example-3.jpg %}

### 配置github hook
1. github设置
{% asset_img github-1.png 设置token %}
{% asset_img github-2.png 保存好token %}
{% asset_img github-3.png 进入项目，开启jenkins服务 %}

2. jenkins设置
{% asset_img github-4.png 设置github credentials %}
{% asset_img github-5.png 配置github credentials %}
{% asset_img github-6.png 开始hook %}

## 现在
{% asset_img example-2.gif %}
我们要经历哪些步骤？
- 提交代码
- 等着看结果...