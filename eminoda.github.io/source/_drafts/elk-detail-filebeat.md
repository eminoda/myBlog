---
title: Filebeat 配置详解
tags: elk
categories:
    - 开发
    - elk
thumb_img: elastic.png
---

# Filebeat

[下载地址 https://www.elastic.co/cn/downloads/beats/filebeat](https://www.elastic.co/cn/downloads/beats/filebeat)

## 配置 yml

-   [路径地址变量](https://www.elastic.co/guide/en/beats/filebeat/current/directory-layout.html)

-   [filebeat.yml 参数解释](https://www.elastic.co/guide/en/beats/filebeat/current/filebeat-reference-yml.html)

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

-   -e 堆栈信息的输出
-   -c 指定配置文件路径(default "filebeat.yml")

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

## 关于自定义 filebeat output index 文件名

[https://www.elastic.co/guide/en/beats/filebeat/current/elasticsearch-output.html](https://www.elastic.co/guide/en/beats/filebeat/current/elasticsearch-output.html)
[https://www.elastic.co/guide/en/beats/filebeat/current/configuration-template.html](https://www.elastic.co/guide/en/beats/filebeat/current/configuration-template.html)

## 其他设置

[安全验证](https://www.elastic.co/guide/en/beats/filebeat/current/filebeat-configuration.html)
2019-04-17T17:45:54.428+0800 ERROR instance/beat.go:802 Exiting: Error importing Kibana dashboards: fail to import the dashboards in Kibana: Error importing directory /mydata/filebeat-7.0.0-linux-x86_64/kibana: Failed to import dashboard: Failed to load directory /mydata/filebeat-7.0.0-linux-x86_64/kibana/7/dashboard:
error loading /mydata/filebeat-7.0.0-linux-x86_64/kibana/7/dashboard/Filebeat-Zeek-Overview.json: returned 400 to import file: <nil>. Response: {"statusCode":400,"error":"Bad Request","message":"Document \"7cbb5410-3700-11e9-aa6d-ff445a78330c\" has property \"dashboard\" which belongs to a more recent version of Kibana (7.0.0)."}
Exiting: Error importing Kibana dashboards: fail to import the dashboards in Kibana: Error importing directory /mydata/filebeat-7.0.0-linux-x86_64/kibana: Failed to import dashboard: Failed to load directory /mydata/filebeat-7.0.0-linux-x86_64/kibana/7/dashboard:
error loading /mydata/filebeat-7.0.0-linux-x86_64/kibana/7/dashboard/Filebeat-Zeek-Overview.json: returned 400 to import file: <nil>. Response: {"statusCode":400,"error":"Bad Request","message":"Document \"7cbb5410-3700-11e9-aa6d-ff445a78330c\" has property \"dashboard\" which belongs to a more recent version of Kibana (7.0.0)."}
