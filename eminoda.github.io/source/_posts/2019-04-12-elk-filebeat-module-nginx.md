---
title: Filebeat 修改内置 modules （nginx）
tags: elk
categories:
    - 开发
    - elk
thumb_img: elastic.png
date: 2019-04-12 13:39:18
---

# Filebeat modules

Filebeat 内置提供了许多 **开箱即用** 的 modules （模块），对日志文件做简单的收集和解析处理，相比于直接使用 logstash 方便了很多。

提供如下功能：

-   Filebeat input 配置。设置 log 文件的抓取路径，能根据不同系统设置不同路径。
-   提供 Elasticsearch [Ingest Node](https://www.elastic.co/guide/en/elasticsearch/reference/7.0/ingest.html) pipeline definition （未了解）。大概通过管道解析预处理元数据到 elasticsearch
-   Fields 字段定义
-   简单的 Kibana dashboards 仪表盘示例和 visualize 图标分析

内置模块：
{% asset_img modules.png 内置模块 %}

# 修改 nginx modules

但是问题来了，内置的 nginx modules 只是针对 nginx 的默认 log 格式，如下所示：

```
http {
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';
}
```

但现实，我们的 nginx log 会包含更多字段，比如：请求的响应时间、爬虫打标、登录用户 Id 记录...

这里示范如何修改默认 nginx 配置来达到业务需求。

## 看下目前 nginx 日志格式

先来熟悉下目前 nginx 的日志格式，和看下 filebeat 抓取的元数据

```
http {
    log_format main '$remote_addr $http_x_forwarded_for - '
                    '[$time_local] $request $status $body_bytes_sent $request_time '
                    '$uid '
                    '$http_user_agent '
                    '$spider';
}
```

日志输出（为方便对比，换行展示）：

```
123.125.71.107 - -
[15/May/2019:13:30:27 +0800] GET /news/d72203.html HTTP/1.1 200 28434 0.177
1234567890
Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)
Baiduspider
```

## 修改解析规则

1. 修改 modules 默认引导文件 manifest.yml

    ```
    vi /mydata/filebeat-6.7.1-linux-x86_64/module/nginx/access/manifest.yml
    ```

    ```
    var:
        - name: paths
            default:
                # 如果你 nginx log 输出路径和默认不一致，需要修改
                - /var/log/nginx/*access.log*
            ...
        # 重新指定提取规则文件
        # ingest_pipeline: ingest/default.json
        ingest_pipeline: ingest/pro.json
    ```

2. 修改 ingest 规则文件

    参照上一个修改，此处文件已经变更为 pro.json

    ```
    vi /mydata/filebeat-6.7.1-linux-x86_64/module/nginx/access/ingest/pro.json
    ```

    注意：patterns 为单行内容（为方便对比，换行展示）

    ```js
    "grok": {
        "field": "message",
        "patterns": [
            "\"?%{IP_LIST:nginx.access.remote_ip_list} %{IP_LIST:nginx.access.forward_ip_list} -
            \\[%{HTTPDATE:nginx.access.time}\\] %{GREEDYDATA:nginx.access.info} %{NUMBER:nginx.access.response_code:long} %{NUMBER:nginx.access.body_sent.bytes:long} %{NUMBER:nginx.access.request_time:float}
            (%{NUMBER:nginx.access.uid}|-)
            %{GREEDYDATA:nginx.access.agent}
            %{SPIDER:nginx.access.spider}"
        ],
        "pattern_definitions": {
            "IP_LIST": "%{IP}(\"?,?\\s*%{IP})*|-",
            "SPIDER": "%{WORD}|-"
        },
        "ignore_missing": true
    }
    ...
    ```

    基本是在原有基础上做字段的位置变更，和字段的添加，没有对配置文件 **大改** （也怕改崩 :neutral_face:）

3. 清空 elastisearch 相关内容（未了解，很佛系的操作）

    大改是清除旧索引、模板等历史“缓存”数据

    ```
    DELETE http://192.168.1.65:9201/_ingest/pipeline/*
    ```

    ```
    DELETE http://192.168.1.65:9201/_template/*
    ```

4. 重启 Filebeat ，读取新数据

5. 重建 Kibana Index 索引

    如果你能搜索到你新添加的 Field 字段，恭喜你成功了。

    {% asset_img request_time.png %}

    如果失败，可能有如下原因：

    - 参照步骤 4，可能还有其他数据需要删除
    - 解析规则有问题，比如少个引号，少个空格之类

## Dashboard 实际效果

成功添加字段后，可以在 Kibana 有更丰富的展示

{% asset_img dashboard.png Dashboard %}

左下角的耗时 pipe，根据 request_time 字段统计得出
