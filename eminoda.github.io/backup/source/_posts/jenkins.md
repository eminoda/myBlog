---
title: jenkins入门
date: 2018-04-22 22:30:58
tags:
---
# jenkins介绍
## [什么是jenkins](https://jenkins.io/doc/#what-is-jenkins)
Jenkins是一个独立的开源自动化服务器，可用于自动化各种任务，如构建，测试和部署软件。

# jenkins安装
## 下载安装包
以为使用tomcat运行，选择了war包
{% asset_img war.png jenkins.war %}
分别准备java、tomcat包
{% asset_img installer.png 安装包 %}

## 配置环境变量
{% asset_img javaEnv.png java %}

## jenkins简单配置
{% asset_img install-1.png pwd %}
{% asset_img install-2.png 默认配置安装 %}
{% asset_img install-3.png 首次打开界面 %}

# jenkins全局配置
## git auth
1. 秘钥配置
````
ssh-keygen -t rsa
````
2. 配置Credentials
{% asset_img config-1.png 添加账户 %}
{% asset_img config-2.png 配置github ssh %}

3. 可能需要安装调整git
{% asset_img config-3.png git环境 %}

4. 配置ssh pulish插件
{% asset_img config-4.png ssh pulish %}

# 简单的自动部署流程
1. 创建项目
{% asset_img build-1.png start %}
{% asset_img build-2.png 选择项目类型 %}
2. 配置版本工具
{% asset_img build-3.png git %}
3. 构建前执行（比如删除旧文件、单元测试...）
{% asset_img build-4.png delet old file... %}
4. 构建（项目一些build）
{% asset_img build-5.png shell %}
5. 部署到远端服务器
{% asset_img build-6.png upload %}
6. 构建完成
{% asset_img build-7.png success %}

# 其他