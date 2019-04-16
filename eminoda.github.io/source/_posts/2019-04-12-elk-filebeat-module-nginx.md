---
title: filebeat 修改内置 nginx 配置
tags: elk
categories:
  - 开发
  - elk
thumb_img: elastic.png
date: 2019-04-12 13:39:18
---

相比于直接使用 logstash，filebeat **开箱即用** 的 modules 方式，可以直接几分钟的设置能看到分析图表。

但是问题来了，内置的 nginx modules 只是针对默认的 nginx log format，这里示范如何修改默认 nginx 配置来达到业务需求。

需求：添加 \$request_time 字段，记录请求时间

## 修改 nginx 日志格式

在默认 format 后，追加 \$request_time

```
http {
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for" $request_time';

    access_log  /var/log/nginx/access.log  main;

    ...
}
```

## 修改 nginx module 参数

1. 修改 default.json

   vi ./filebeat-6.7.1-linux-x86_64/module/nginx/access/ingest/default.json

   这里不（wo）敢（pa）破（wan）坏（huai）已有 pattarn，只在规则末尾添加需求字段。

   能看到 patterns 和 nginx format 对应，在最后同样添加的解析，新命名为 nginx.access.request_time，并设置 **数据类型**

   ```
   {
       "description": "Pipeline for parsing Nginx access logs. Requires the geoip and user_agent plugins.",
       "processors": [
           {
               "grok": {
                   "field": "message",
                   "patterns": [
                       "\"?%{IP_LIST:nginx.access.remote_ip_list} - %{DATA:nginx.access.user_name} \\[%{HTTPDATE:nginx.access.time}\\] \"%{GREEDYDATA:nginx.access.info}\" %{NUMBER:nginx.access.response_code:long} %{NUMBER:nginx.access.body_sent.bytes:long} \"%{DATA:nginx.access.referrer}\" \"%{DATA:nginx.access.agent}\" %{NUMBER:nginx.access.request_time:long}"

                   ],
                   "pattern_definitions": {
                       "IP_LIST": "%{IP}(\"?,?\\s*%{IP})*"
                   },
                   "ignore_missing": true
               }
           },
       ...
   ```

2. 清空 elasticsearch ingest

   ```
   DELETE http://192.168.1.65:9201/_ingest/pipeline/*
   ```

3. 删除 elasticsearch file

   ```
   DELETE http://192.168.1.65:9201/file*
   ```

4. 重新创建 Kibana Index

   发现添加字段生效

   {% asset_img request_time.png %}

## Dashboard 实际效果

左下角的耗时 pipe，根据 request_time 统计得出

{% asset_img dashboard.png Dashboard %}
