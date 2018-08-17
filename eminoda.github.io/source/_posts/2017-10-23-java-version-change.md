---
title: 同一环境配置多个java版本
tags: java
categories:
  - 前端
  - java
data: 2017-10-23 10:13:35
---


## 场景
测试环境后台java测试环境是java1.7，而因为要安装jenkins集成测试，配置新的tomcat，最低环境需要1.8。但要确保不影响测试原有Java环境。

## 步骤
1. 修改etc/profile 文件
````
# 新增加java1.8的配置
export JAVA_HOME8=/mydata/jdk1.8.0_144/bin
````

2. 修改tomcat catalina.sh，指定java环境
````
# OS specific support.  $var _must_ be set to either true or false.

export JAVA_HOME=/mydata/jdk1.8.0_144
export JRE_HOME=/mydata/jdk1.8.0_144
````