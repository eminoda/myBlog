---
title: jenkins自动集成部署
date: 2017-11-21 17:27:50
tags:
  - jenkins自动部署
categories: jenkins
---

# jenkins
## jenkins是什么？
自行百度
[jenkins](https://jenkins.io/)

## 准备工作
1. 安装必要的插件（太多，大概尽可能截全，初始化jenkins会默认装常用的plugins）
    {% asset_img 1.png plugins %}
    {% asset_img 2.png gitlab %}
    {% asset_img 3.png ssh %}

2. ssh服务器
    {% asset_img 4.png 系统设置 %}
    {% asset_img 5.png ssh设置 %}

3. gitlab验证
    {% asset_img 6.png 证书 %}
    {% asset_img 7.png gitlab %}

## 一个部署流程Demo(参考)
1. 新建项目
    {% asset_img 8.png 1 %}
2. 配置版本工具
    {% asset_img 9.png 2 %}
3. 构建前，清空旧文件（自定义）
    {% asset_img 10.png 3 %}
4. 构建中，处理构建后jenkins workspace的文件
    {% asset_img 11.png 4 %}
5. 同步到远程服务器，并重启服务等操作
    {% asset_img 12.png 5 %}


## Q&A（测试环境仅供参考）
1. tomcat & java 的版本问题？
javac 1.8.0
tomcat Apache Tomcat/8.5.20
(java env)[https://jenkins.io/doc/book/installing/#prerequisites]

2. 测试环境java版本过低，不隐藏业务环境，如何处理（jenkins部在同一个机子上）？
````
vi catalina.sh

export JAVA_HOME=/mydata/jdk1.8.0_144
export JRE_HOME=/mydata/jdk1.8.0_144
````

3. ssh cmd
````
ssh-keygen -t rsa
ssh-copy-id -i ~/.ssh/id_rsa.pub "root@x.x.x.x"
````

4. jenkins配置config.xml参考
    {% asset_img config.xml 4 %}