---
title: 初识 jenkins
tags: jenkins
categories:
    - 开发
    - 工程化
date: 2018-04-27 10:58:57
thumb_img: jenkins.png
---

{% asset_img start.png %}

## [什么是持续集成（Continuous integration）？](https://baike.baidu.com/item/%E6%8C%81%E7%BB%AD%E9%9B%86%E6%88%90/6250744)

持续集成是一种软件开发实践，即团队开发成员经常集成他们的工作，通过每个成员每天至少集成一次，也就意味着每天可能会发生多次集成。每次集成都通过自动化的构建（包括编译，发布，自动化测试）来验证，从而尽早地发现集成错误。

{% asset_img example-1.jpg 持续集成 %}

### 核心点

-   减少风险
-   减少重复过程
-   任何时间、任何地点生成可部署的软件
-   增强项目的可见性
-   建立团队对开发产品的信心

## [什么是 jenkins？](https://jenkins.io/doc/#what-is-jenkins)

Jenkins 是一个独立的，开源自动化服务器，可用于**自动化**各种任务，如构建，测试和部署软件。

{% asset_img example-2.jpg 持续交付 Continuous Integration %}
{% asset_img example-3.jpg 持续部署 Continuous Delivery %}

## 跑一个例子

### 搭建环境

1. 下载包
   {% asset_img install-1.png %}

2. 配置环境
   {% asset_img install-2.png %}

### 设置 jenkins

1. 开始安装
   {% asset_img setting-1.png 密码配置 %}

{% asset_img setting-2.png 安装默认插件%}

{% asset_img setting-3.png hello jenkins %}

2. 版本库管理
   {% asset_img setting-4.png 添加证书 %}
   {% asset_img setting-5.png 配置ssh %}
   {% asset_img setting-6.png 设置git %}

### 配置 jenkins

1. 创建一个新任务
   {% asset_img config-1.png 创建一个新任务 %}
   {% asset_img config-2.png %}
2. 配置版本工具
   {% asset_img config-3.png git and branch %}
3. 构建脚本（test,build）
4. 开始构建
   {% asset_img config-4.gif 开始构建 %}
5. 验证结果
   {% asset_img config-5.png 构建成功 %}
   {% asset_img config-6.png 代码发布已发布到对应jenkins workspace %}

## 参考

> https://www.zhihu.com/question/23444990 > https://segmentfault.com/a/1190000004639923
