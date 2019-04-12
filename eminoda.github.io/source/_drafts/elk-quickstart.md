---
title: ELK 上手使用
tags:
---

# ELK

## 简单介绍

ELK 是三个开源框架的缩写（Elasticsearch、Logstash、Kibana），用于收集海量日志，并做统计分析。
这样一套协议栈称为 ELK Stack（Elastic Stack）

[Elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)

> Elasticsearch 是一个分布式、RESTful 风格的搜索和数据分析引擎，能够解决不断涌现出的各种用例。作为 Elastic Stack 的核心，它集中存储您的数据，帮助您发现意料之中以及意料之外的情况。

[Filebeat](https://www.elastic.co/guide/en/beats/filebeat/current/index.html)

Filebeat 作为一个轻量级的日志数据收集和发送工具。安装在日志生产服务器后，将按照你指定的日志进行监控，并发送给 Elasticsearch、Logstash 等服务进行后续操作。

{% asset_img filebeat.png %}

[kibana](1)

[logstash](2)

## 下载和启动

- [Download elasticsearch](https://www.elastic.co/downloads/elasticsearch)
- [Download kibana](https://www.elastic.co/downloads/kibana)
- [Download logstash](https://www.elastic.co/cn/downloads/logstash)
- [Download Filebeat](https://www.elastic.co/cn/downloads/beats/filebeat)

```
[elker@localhost elasticsearch-6.7.0]$ bin/elasticsearch
[root@localhost kibana-6.7.0-linux-x86_64]# ./bin/kibana
bin/logstash -f logstash.conf
```

# 环境安装

# Filebeat 配置

[下载地址 https://www.elastic.co/cn/downloads/beats/filebeat](https://www.elastic.co/cn/downloads/beats/filebeat)

## 配置 yml

- [路径地址变量](https://www.elastic.co/guide/en/beats/filebeat/current/directory-layout.html)

- [filebeat.yml 参数解释](https://www.elastic.co/guide/en/beats/filebeat/current/filebeat-reference-yml.html)

```
[root@station74 filebeat-6.7.1-linux-x86_64]# vi ./filebeat.yml

# 设置数据来源
filebeat.inputs:
- type: log
  enabled: true
  # 这里选择 nginx 的日志
  paths:
    - /var/log/nginx/*.log

# 设置数据输出方向，交给 elasticsearch 搜索处理
output.elasticsearch:
  hosts: ["192.168.1.65:9201"]
```

## 启动

- -e 堆栈信息的输出
- -c 指定配置文件路径(default "filebeat.yml")

```
[root@station74 filebeat-6.7.1-linux-x86_64]# ./filebeat -e -c filebeat.yml
```

配置都 ok，就能在 kibana 管理界面看到 filebeat 输出过来的 log

{% asset_img filebeat-indexcreate.png 索引创建 %}

## 开启 filebeat dashboards

默认 kibana dashboards 是没有开箱即用的仪表盘信息，但可以设置 filebeat 设置。

{% asset_img filebeat-dashboards.png 初始化状态 %}

提前需要设置 kibana 的地址

```
setup.kibana:
  host: "192.168.1.65:5602"
```

```
[root@station74 filebeat-6.7.1-linux-x86_64]# ./filebeat setup --dashboards
Loading dashboards (Kibana must be running and reachable)
Loaded dashboards
```

{% asset_img filebeat-dashboards-setup.png 开启后 %}

## 通过 modules 快速“拆解”日志

[提供三种方式](https://www.elastic.co/guide/en/beats/filebeat/current/configuration-filebeat-modules.html#configuration-filebeat-modules) ，这里拿 nginx 来举例（预设的 modules 还有 system、mysql 等）

可以在安装目录下的 /module 中看到其他 modules

1.  设置 modules.d 预设模块

    可以对正在运行中 filebeat 生效

    ```
    # 开启
    ./filebeat modules enable nginx
    # 关闭
    ./filebeat modules disable nginx
    # 查看状态
    ./filebeat modules list
    ```

2.  配置启动参数 --modules

    ```
    [root@station74 filebeat-6.7.1-linux-x86_64]# ./filebeat --modules nginx
    ```

3.  修改 filebeat.yml 文件

    [特殊变量的设置](https://www.elastic.co/guide/en/beats/filebeat/current/specify-variable-settings.html)

    ```
    # 开启 modules，自定义 nginx 日志位置
    filebeat.modules:
      - module: nginx
        access:
          var.paths: ["/var/log/nginx/access.log*"]
    ```

## 其他设置

[安全验证](https://www.elastic.co/guide/en/beats/filebeat/current/filebeat-configuration.html)

[Elasticsearch Service 云服务（阿里云的产品）](https://www.elastic.co/cn/cloud/elasticsearch-service)

# kibana

[时间单位](https://www.elastic.co/guide/en/elasticsearch/reference/6.7/common-options.html#date-math)

# logstash

## 简单介绍

配置数据读取输出规则

```
bin/logstash -e 'input { stdin { } } output { stdout {} }'
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

## nginx 日志解析

配置 logstash 解析规则，定义数据来源等信息

```
input {
  file {
    path => "/var/log/nginx/access.log"
    start_position => "beginning"
    type => "my-nginx-log"
  }
}
# log_format main
#   $remote_addr
#   $http_x_forwarded_for
#   [$time_local]
#   $request
#   $status
#   $body_bytes_sent
#   $request_time
#   $http_user_agent';
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

在 logstash 安装目录下，启动

```
[root@localhost logstash-6.7.0]# bin/logstash -f logstash.conf
```

日志数据被 logstash 规则都命中后，就会体现在 kabana 主页面上

{% asset_img elk-nginx-discover.png %}

同时也能绘制简单的图标，用来分析数据

{% asset_img elk-visualize.png %}

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
