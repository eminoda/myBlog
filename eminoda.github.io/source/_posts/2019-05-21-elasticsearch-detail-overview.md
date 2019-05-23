---
title: Elasticsearch —— 初识大概
tags: elk
categories:
    - 开发
    - elk
thumb_img: elastic.png
date: 2019-05-21 22:59:06
---

# Elasticsearch

Elasticsearch 是高度可伸缩的开源全文搜索和分析引擎。 你可以即时存储、搜索并分析大容量数据。可靠的底层引擎和技术通常应对复杂的搜索场景和需求。

参考官方文档，初识 Elasticsearch 主要的 api 使用。

## [核心理念 Basic Concepts](https://www.elastic.co/guide/en/elasticsearch/reference/current/getting-started-concepts.html)

-   Near Realtime(NRT) 接近实时的搜索能力
-   Cluster & Node （集群和节点）

    集群由多个节点组成，每个节点参与集群的索引和搜索操作，每个节点独一无二，并都指向同一个集群。

-   Index & Document （索引和文档）

    Document 是被索引前的基础数据单位，一个 Index 索引将收集相同特征的文档集合，从而执行索引，搜索，更新等操作。

等相关操作

-   Shards & Replicas 切片和备份

## 集群相关操作

> 以下操作均通过 Kibana > Dev Tools > Console 实践，当然也可以通过 Postman 等工具

### 健康检查

```
GET /_cat/health?v

epoch      timestamp cluster       status node.total node.data shards pri relo init unassign pending_tasks max_task_wait_time active_shards_percent
1555385352 03:29:12  elasticsearch yellow          1         1     13  13    0    0       11             0                  -                 54.2%
```

status 标识集群的“健康”指标，通常 Green、Yellow、Red 分类。Yellow 是指数据可用但没有做备份等处理

> Once that replica gets allocated onto a second node, the health status for this index will turn to green.

### 查询子节点信息

```
GET /_cat/nodes?v

ip             heap.percent ram.percent cpu load_1m load_5m load_15m node.role master name
192.1.2.3           46          51   0    0.00    0.01     0.05 mdi       *      2EI_4xO

```

### 查询索引列表

```
GET /_cat/indices?v

health status index                     uuid                   pri rep docs.count docs.deleted store.size pri.store.size
green  open   .kibana_1                 3KNILZS5QeK5s_a-LlXfPQ   1   0         10            1      109kb          109kb
yellow open   eminoda                   DUdSWSOcRl2EOnR6Qr9rCA   5   1          5            0     16.6kb         16.6kb
yellow open   filebeat-6.7.1-2019.04.15 5JgqfpNLQ-ewjikehGDc2A   3   1      42103            0        9mb            9mb
green  open   .kibana_task_manager      cI56liOAQgGERRqmqsJilw   1   0          2            0     12.8kb         12.8kb
```

## 数据修改

所有的操作，遵循 Restful 规范，很容易理解

### [create 创建索引](https://www.elastic.co/guide/en/elasticsearch/reference/current/getting-started-create-index.html)

```
PUT /eminoda?pretty

{
  "acknowledged" : true,
  "shards_acknowledged" : true,
  "index" : "eminoda"
}
```

```
GET /_cat/indices?v

health status index                        uuid                   pri rep docs.count docs.deleted store.size pri.store.size
yellow open   eminoda                      63rQmVM4SX6dk4HCxSSzqQ   5   1          0            0      1.1kb          1.1kb
```

### add 添加数据

```
# /节点名称/文档标识/Id
# <HTTP Verb> /<Index>/<Endpoint>/<ID>
PUT /eminoda/_doc/1
{
  "name":"eminoda",
  "age":28
}
```

```
{
  "_index" : "eminoda",
  "_type" : "_doc",
  "_id" : "1",
  "_version" : 1,
  "result" : "created",
  "_shards" : {
    "total" : 2,
    "successful" : 1,
    "failed" : 0
  },
  "_seq_no" : 0,
  "_primary_term" : 1
}
```

### query 查询数据

```
GET /eminoda/_doc/1

{
  "_index" : "eminoda",
  "_type" : "_doc",
  "_id" : "1",
  "_version" : 1,
  "_seq_no" : 0,
  "_primary_term" : 1,
  "found" : true,
  "_source" : {
    "name" : "eminoda",
    "age" : 28
  }
}
```

### [delete 删除索引、数据](https://www.elastic.co/guide/en/elasticsearch/reference/current/getting-started-delete-index.html)

```
DELETE /eminoda/_doc/1

{
  "_index" : "eminoda",
  "_type" : "_doc",
  "_id" : "1",
  "_version" : 2,
  "result" : "deleted",
  "_shards" : {
    "total" : 2,
    "successful" : 1,
    "failed" : 0
  },
  "_seq_no" : 1,
  "_primary_term" : 1
}

GET /eminoda/_doc/1

{
  "_index" : "eminoda",
  "_type" : "_doc",
  "_id" : "1",
  "found" : false
}
```

```
DELETE /eminoda

{
  "acknowledged" : true
}
```

### update 修改数据

id 不变，只改变 body 数据，就是更新数据

```
PUT /eminoda/_doc/1
{
  "name":"eminoda2",
  "age":28
}
```

```
# 注意是 update 状态
{
  "_index" : "eminoda",
  "_type" : "_doc",
  "_id" : "1",
  "_version" : 2,
  "result" : "updated",
  "_shards" : {
    "total" : 2,
    "successful" : 1,
    "failed" : 0
  },
  "_seq_no" : 1,
  "_primary_term" : 1
}
```

如果更改 id ，就相当于新添加数据；也可以交给 elasticsearch 自己生成 id（随机编码），改用 POST 方法，同时不指定 id

```
POST /eminoda/_doc
{
  "name":"mike",
  "age":48
}
```

```
{
  "_index" : "eminoda",
  "_type" : "_doc",
  "_id" : "BE2uy2oB3Cyw7jMvGdJt",
  "_version" : 1,
  "result" : "created",
  "_shards" : {
    "total" : 2,
    "successful" : 1,
    "failed" : 0
  },
  "_seq_no" : 0,
  "_primary_term" : 1
}
```

如果要查询上述数据，就要拿指定的 id

```
GET /eminoda/_doc/BE2uy2oB3Cyw7jMvGdJt
```

### [batch 多数据操作](https://www.elastic.co/guide/en/elasticsearch/reference/current/getting-started-batch-processing.html)

批量添加数据

```
# /节点名称/_bulk
POST /eminoda/_bulk
{"index":{"_id":"1", "_type":"_doc"}}
{"name": "Eminoda" }
{"index":{"_id":"2", "_type":"_doc"}}
{"name": "Shinoda" }
```

注意：不能漏掉 \_type，不然会报如下错误

```
"Validation Failed: 1: type is missing;2: type is missing;"
```

批量复杂操作

```
POST /eminoda/_bulk
{"update":{"_id":"1","_type":"_doc"}}
{"doc":{"name":"Lady GAGA"}}
{"delete":{"_id":"2","_type":"_doc"}}
```

## [查询 Search](https://www.elastic.co/guide/en/elasticsearch/reference/current/getting-started-search-API.html)

### 简单查询

```
# /:index/_search
GET /eminoda/_search
```

```
{
  "took" : 0,
  "timed_out" : false,
  "_shards" : {
    "total" : 5,
    "successful" : 5,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : 2,
    "max_score" : 1.0,
    "hits" : [
      {
        "_index" : "eminoda",
        "_type" : "_doc",
        "_id" : "2",
        "_score" : 1.0,
        "_source" : {
          "name" : "Shinoda"
        }
      },
      {
        "_index" : "eminoda",
        "_type" : "_doc",
        "_id" : "1",
        "_score" : 1.0,
        "_source" : {
          "name" : "Eminoda"
        }
      }
    ]
  }
}

```

### 条件查询

查询 index 中匹配所有的 document，并按照 \_id 倒序

参数式：

```
GET /eminoda/_search?q=*sort=_id:desc
```

命令式（Query DSL）：

```
GET /eminoda/_search
{
  "query": {
    "match_all": {}
  },
  "sort": [
    {
       "_id": "desc"
    }
  ]
}
```

类似 sql，你也可以添加 类似 **“分页”** 的条件

```
# 从第一条开始，查询两条数据
GET /eminoda/_search
{
  "query": {
    "match_all": {}
  },
  "size":2,
  "from": 0
}
```

自定义数据 **\_source** 显示特定字段（Field）

```
GET /eminoda/_search
{
  "query": {
    "match_all": {}
  },
  "_source": ["name","age"]
}
```

只限制 age=11 的数据

```
GET /eminoda/_search
{
  "query": {
    "match": {
      "age": 11
    }
  }
}
```

### **部分匹配** 和 **全文匹配**

\_source 如下：

```
POST /eminoda/_bulk?pretty
{"index":{"_id":"1", "_type":"_doc"}}
{"name": "first Juck", "age":11 }
{"index":{"_id":"2", "_type":"_doc"}}
{"name": "second Mike", "age":22 }
```

**match** 将搜索含有 first or Mike 的数据

```
GET /eminoda/_search
{
  "query": {
    "match": {
      "name": "first Mike"
    }
  }
}
```

```
"hits" : [
  {
    "_index" : "eminoda",
    "_type" : "_doc",
    "_id" : "2",
    "_score" : 0.2876821,
    "_source" : {
      "name" : "second Mike",
      "age" : 22
    }
  },
  {
    "_index" : "eminoda",
    "_type" : "_doc",
    "_id" : "1",
    "_score" : 0.2876821,
    "_source" : {
      "name" : "first Juck",
      "age" : 11
    }
  }
]
```

**match_phrase** 将一条都匹配不到，除非把 \_id=1 的数据改为 first Mike

```
GET /eminoda/_search
{
  "query": {
    "match_phrase": {
      "name": "first Mike"
    }
  }
}
```

### bool 查询

-   **should** or
-   **must** and
-   **must_not** all not

上述三个条件可以混用，match 规则也可多条

```
GET /eminoda/_search
{
  "query": {
    "bool": {
      "should": [
        { "match": { "name":"Mike" }},
        { "match": { "name":"first" }}
      ],
      "must": [
        { "match":{ "name":"second" }}
      ]
    }
  }
}
```

### [filter 过滤查询](https://www.elastic.co/guide/en/elasticsearch/reference/current/getting-started-filters.html)

filter 从属于 bool 属性，和 must 并列

```
GET /eminoda/_search
{
  "query": {
    "bool": {
      "should": {
        "match": {"name":"second Mike"} },
      "filter": {
        "range": {
          "age": {
            "gte": 1,
            "lte": 20
          }
        }
      }
    }
  }
}
```

### [aggregation 聚合查询](https://www.elastic.co/guide/en/elasticsearch/reference/current/getting-started-aggregations.html)

类似 sql 的 group by 操作，分组后按照分组数据进行倒叙输出

```
SELECT state, COUNT(*) FROM bank GROUP BY state ORDER BY COUNT(*) DESC LIMIT 10;
```

按照 nickname 字段分组，至多显示 10 组

```
GET /eminoda/_search
{
  "aggs":{
    "group_by_state":{
      "terms": {
        "field": "nickname.keyword",
        "size": 10
      }
    }
  }
}
```

```
{
  "took" : 0,
  "timed_out" : false,
  "_shards" : {
    "total" : 5,
    "successful" : 5,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : 3,
    "max_score" : 1.0,
    "hits" : [
      {
        "_index" : "eminoda",
        "_type" : "_doc",
        "_id" : "2",
        "_score" : 1.0,
        "_source" : {
          "nickname" : "second Mike",
          "age" : 22
        }
      },
      {
        "_index" : "eminoda",
        "_type" : "_doc",
        "_id" : "1",
        "_score" : 1.0,
        "_source" : {
          "nickname" : "first Juck",
          "age" : 11
        }
      },
      {
        "_index" : "eminoda",
        "_type" : "_doc",
        "_id" : "3",
        "_score" : 1.0,
        "_source" : {
          "nickname" : "second Mike",
          "age" : 33
        }
      }
    ]
  },
  "aggregations" : {
    "group_by_state" : {
      "doc_count_error_upper_bound" : 0,
      "sum_other_doc_count" : 0,
      "buckets" : [
        {
          "key" : "second Mike",
          "doc_count" : 2
        },
        {
          "key" : "first Juck",
          "doc_count" : 1
        }
      ]
    }
  }
}
```

分组后，再按照 age 计算平均年龄，放入新字段 average_age，并且 nickname 分组的数据按照 average_age 升序

```
GET /eminoda/_search
{
  "aggs":{
    "group_by_state":{
      "terms": {
        "field": "nickname.keyword",
        "size": 10,
        "order": {
          "_term": "asc"
        }
      },
      "aggs": {
        "average_age": {
          "avg": {
            "field": "age"
          }
        }
      }
    }
  }
}
```

```
  "aggregations" : {
    "group_by_state" : {
      "doc_count_error_upper_bound" : 0,
      "sum_other_doc_count" : 0,
      "buckets" : [
        {
          "key" : "second Mike",
          "doc_count" : 2,
          "average_age" : {
            "value" : 27.5
          }
        },
        {
          "key" : "first Juck",
          "doc_count" : 1,
          "average_age" : {
            "value" : 11.0
          }
        }
      ]
    }
  }
```
