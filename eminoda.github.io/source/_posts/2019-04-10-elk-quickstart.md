---
title: ELK 上手使用
tags: elk
categories:
  - 开发
  - elk
thumb_img: elastic.png
date: 2019-04-10 00:00:01
---

## ELK 简单介绍

ELK 是三个开源框架的缩写（Elasticsearch、Logstash、Kibana），用于收集海量日志，并做统计分析。
这样一套协议栈称为 ELK Stack（Elastic Stack）

[Elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)

> Elasticsearch 是一个分布式、RESTful 风格的搜索和数据分析引擎，能够解决不断涌现出的各种用例。作为 Elastic Stack 的核心，它集中存储您的数据，帮助您发现意料之中以及意料之外的情况。

[Filebeat](https://www.elastic.co/guide/en/beats/filebeat/current/index.html)

> Filebeat 作为一个轻量级的日志数据收集和发送工具。安装在日志生产服务器后，将按照你指定的日志进行监控，并发送给 Elasticsearch、Logstash 等服务进行后续操作。

{% asset_img filebeat.png %}

[logstash](https://www.elastic.co/guide/en/logstash/current/introduction.html)

> Logstash 是个开源的数据收集引擎，通过管道能对数据实时做处理。其周边有丰富的插件来对：输出流、过滤器、输出流等做强大的控制。

[kibana](https://www.elastic.co/guide/en/kibana/current/introduction.html)

> Kibana 和 Elasticsearch 一同工作，利用 Kibana 可以用图形化，更简便的方式对 Elasticsearch 中的索引进行搜索操作，也能只做图标来更好的分析数据的价值。

[Elasticsearch Service 云服务（阿里云的产品）](https://www.elastic.co/cn/cloud/elasticsearch-service)

## 下载和启动

官网上已有很每一步的安装说明，如果有其他问题可以参照本文 **附录**

- [Download elasticsearch](https://www.elastic.co/downloads/elasticsearch)
- [Download kibana](https://www.elastic.co/downloads/kibana)
- [Download logstash](https://www.elastic.co/cn/downloads/logstash)
- [Download Filebeat](https://www.elastic.co/cn/downloads/beats/filebeat)

```
# 以下非守护模式
[elker@localhost elasticsearch-6.7.0]$ bin/elasticsearch
[root@localhost kibana-6.7.0-linux-x86_64]# ./bin/kibana
[root@localhost logstash-6.7.0]# ./bin/logstash -f logstash.conf
```

# Demo

Elasticsearch、logstash、kibana 为了方便测试都在一台测试机上

## 配置 nginx

由于默认 elasticsearch、kibana 只开放 localhost 权限（可能我配置问题），所以通过 nginx 反向代理对外暴露服务。

```
# elk elasticsearch
server {
	listen          9201;
	location / {
		proxy_set_header Host $host;
		proxy_pass  http://localhost:9200;
	}
}

# elk kibana
server {
	listen          5602;
	location / {
		proxy_set_header Host $host;
		proxy_pass  http://localhost:5601;
	}
}
```

## 启动 Elasticsearch 和 Kibana

## 配置 logstash

1. 先了解数据 input、output 解析结果

   通过控制台键入数据，已 debug 的方式查看 logstash 输出结果：

   ```
   ./bin/logstash -e 'input { stdin { } } output { stdout {} }'
   ```

   启动后在控制台输入 **helloworld** 看下输出内容

   ```
   [root@localhost logstash-6.7.0]# bin/logstash -e 'input { stdin { } } output { stdout {} }'
   ...
   helloworld
   /mydata/ELK/logstash-6.7.0/vendor/bundle/jruby/2.5.0/gems/awesome_print-1.7.0/lib/awesome_print/formatters/base_formatter.rb:31: warning: constant ::Fixnum is deprecated
   {
         "@version" => "1",
         "message" => "helloworld",
       "@timestamp" => 2019-04-09T02:30:45.390Z,
             "host" => "localhost"
   }
   ```

2. nginx 日志解析

   将 input 数据替换成本地的 nginx 访问日志，修改 **logstash.conf**

   通过 gork 自定义匹配 log 数据，一一映射。并将 output 挂到 elasticsearch 节点

   ```
   input {
     file {
       path => "/var/log/nginx/access.log"
       start_position => "beginning"
       type => "my-nginx-log"
     }
   }
   # nginx 日志格式
   # log_format main
   #   $remote_addr $http_x_forwarded_for [$time_local]
   #   $request $status $body_bytes_sent $request_time $http_user_agent';
   filter {
     grok {
       match => { "message" => "%{IPORHOST:remote_addr} - \[%{HTTPDATE:time_local}\] %{NOTSPACE:method} %{NOTSPACE:request_url} HTTP/%{NUMBER:httpversion} %{INT:status} %{INT:body_bytes_sent} %{NUMBER:request_time:float} %{GREEDYDATA:http_user_agent}" }
     }
   }
   output {
     elasticsearch { hosts => ["localhost:9200"] }
     stdout { codec => rubydebug }
   }
   ```

3. 在 logstash 安装目录下，启动

   ```
   [root@localhost logstash-6.7.0]# bin/logstash -f logstash.conf
   ```

## 结果

如果日志数据被 logstash 定义的规则命中后，就会输出给 Elasticsearch，最后体现在 kibana 主页面上

{% asset_img elk-nginx-discover.png logstash.log %}

同时也能绘制简单的图标，用来分析数据

{% asset_img elk-visualize.png 接口耗时 %}

# 附录

## 安装问题

1. 指定 JDK 版本

   可能项目环境不支持需要低版本 JDK，ElasticSearch 至少需要 1.8 版本。需要修改启动文件：

   ```
    #!/bin/bash
    # CONTROLLING STARTUP:
    #
    # This script relies on a few environment variables to determine startup
    # behavior, those variables are:
    #
    # ES_PATH_CONF -- Path to config directory
    # ES_JAVA_OPTS -- External Java Opts on top of the defaults set
    #
    # Optionally, exact memory values can be set using the `ES_JAVA_OPTS`. Note that
    # the Xms and Xmx lines in the JVM options file must be commented out. Example
    # values are "512m", and "10g".
    #
    # ES_JAVA_OPTS="-Xms8g -Xmx8g" ./bin/elasticsearch

    export JAVA_HOME=/mydata/jdk1.8.0_144
    export PATH=$JAVA_HOME/bin:$PATH

    source "`dirname "$0"`"/elasticsearch-env
   ```

2. 不允许 root 用户启动

   ```
   [root@localhost elasticsearch-6.7.0]# bin/elasticsearch
   [2019-04-04T16:27:25,217][WARN ][o.e.b.ElasticsearchUncaughtExceptionHandler] [unknown] uncaught exception in thread [main]
   org.elasticsearch.bootstrap.StartupException: java.lang.RuntimeException: can not run elasticsearch as root
   ```

   添加 **新用户**，授权到对一目录

   ```
   [root@localhost ELK]# useradd elker
   [root@localhost ELK]# passwd elker
   [root@localhost ELK]# chown -R elker ./elasticsearch-6.7.0
   [root@localhost ELK]#
   [root@localhost ELK]# cd elasticsearch-6.7.0
   [root@localhost elasticsearch-6.7.0]# bin/elasticsearch

   ```

3. filebeat 开启 kibana dashboards 报错

   ```
   [root@station74 filebeat-6.7.1-linux-x86_64]# ./filebeat setup --dashboards
   Loading dashboards (Kibana must be running and reachable)
   Exiting: fail to create the Kibana loader: Error creating Kibana client: Error creating Kibana client: fail to get the Kibana version: HTTP GET request to /api/status fails: fail to execute the HTTP GET request: Get http://localhost:5601/api/status: dial tcp 127.0.0.1:5601: connect: connection refused. Response: .
   ```

   设置 filebeat.yml kibana host 地址

## 参考

- [集中式日志系统 ELK 协议栈详解](https://www.ibm.com/developerworks/cn/opensource/os-cn-elk/index.html)

- [ELK+Filebeat 集中式日志解决方案详解](https://www.ibm.com/developerworks/cn/opensource/os-cn-elk-filebeat/index.html)

- [删除 ELK 历史数据](https://www.cnblogs.com/hark0623/p/7418385.html)
