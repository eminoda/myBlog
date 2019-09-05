---
title: 使用 cordova 接触混合开发大门
tags: cordova
categories:
  - 开发
  - 前端开发
thumb_img: cordova.png
date: 2018-07-01 23:53:53
---

{% asset_img cordova.png %}

# [Cordova](http://cordova.apache.org/)

早已听过 Cordova 这个名词，但是 3 年多一直没有机会玩下。
通过 Cordova，可以把我们前端的 js、html、css 打包成 app 应用，使用原生 app 的功能。

## 特点

- 跨平台重用代码
  支持多个平台，android、ios...
- 支持离线场景应用
  暂时不知道干什么用，可能类似 PWA 这些功能，ws 之类。
- 访问设备原生 API
  不多说，肯定能调用原生 App 的 SDK。不然还要转个安卓环境干嘛，只是支持到什么程度。

## 还有哪些可以做混合开发

- phoneGap
  更古老的技术，网上说被收购了，然后其核心就是 Cordova。
- ReactNative
  不太喜欢非人类的 JSX，看了 React 一个 Demo 就没什么兴趣了
- Weex
  阿里大厂的 KPI 作品，也是造轮子，不过应该尝试下。

# 如何开始一个 HelloWorld

## 安装 JDK

    不多说，网上一大堆

## 下载 SDK、配置 SDK 环境变量

    [中文社区就有](http://tools.android-studio.org/index.php/sdk)
    环境变量需要配置：platform-tools和tools目录

## 安装 Andriod Studio（我只有 win 系统，所以 ios 暂时玩不了）

1. [下载 android studio](https://developer.android.google.cn/studio/)
   {% asset_img download.png %}

2. 安装（无脑下一步）
   {% asset_img install.png %}

3. 建个项目

- 了解默认模板常见的 project 的结构
  {% asset_img project.png %}
- 配置 AVD，后续 Cordova 会用到（当然可以使用 Cordova-cli，可惜第一次接触嫌麻烦，暂时没看）
  {% asset_img version.png %}
  注意版本，如果过高可能使用 Cordova 会出现一些错误。
  {% asset_img error.png %}

## [Cordova](http://cordova.apache.org/docs/en/latest/guide/cli/index.html)

按照官网撸一边

```
npm install cordova -g //最好别cnpm，可能cordova安装会有问题

cordova create hello com.example.hello HelloWorld //创建项目（文件夹+java pkg格式+app name，大概这意思）

cordova platform add android //构建安卓平台，创建一个标准的安卓project目录

cordova platform ls //核对平台环境信息
    Installed platforms:
        android 7.0.0
    Available platforms:
        browser ~5.0.1
        ios ~4.5.4
        osx ~4.0.1
        windows ~5.0.0
        www ^3.12.0

cordova build android //构架一个apk包
    xxx\hello\platforms\android\app\build\outputs\apk\debug\app-debug.apk

cordova emulate android //启动一个模拟器

cordova run android //将js代码构建成app方式，刷新模拟器
```

目录结构
{% asset_img dir.png 其实我们前端只关心下面www%}

{% asset_img adv.png 顺利的话，出现这个View %}
