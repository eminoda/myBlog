---
title: 同一环境配置多个 java 版本
tags: java
categories:
  - 开发
  - Java 开发
date: 2017-10-23 10:13:35
---

## 场景

测试环境后台 java 测试环境是 java1.7，而因为要安装 jenkins 集成测试，配置新的 tomcat，最低环境需要 1.8。但要确保不影响测试原有 Java 环境。

## 步骤

1. 修改 etc/profile 文件

```
# 新增加java1.8的配置
export JAVA_HOME8=/mydata/jdk1.8.0_144/bin
```

2. 修改 tomcat catalina.sh，指定 java 环境

```
# OS specific support.  $var _must_ be set to either true or false.

export JAVA_HOME=/mydata/jdk1.8.0_144
export JRE_HOME=/mydata/jdk1.8.0_144
```
