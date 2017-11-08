---
title: 如何自定义java版本
date: 2017-10-23 10:13:35
tags: java
categories: java
---

# 场景
内网环境后天java测试环境是java1.7，而因为要安装jenkins集成测试，其默认环境1.8。但要确保不影响测试原有环境。

# 步骤
1. 修改etc/profile 文件
````
# 新增加java1.8的配置
export JAVA_HOME8=/mydata/jdk1.8.0_144/bin
````

2. 修改tomcat catalina.sh
````
# OS specific support.  $var _must_ be set to either true or false.

export JAVA_HOME=/mydata/jdk1.8.0_144
export JRE_HOME=/mydata/jdk1.8.0_144
````



