---
title: Elasticsearch 细节详解
tags: elk
categories:
  - 开发
  - elk
thumb_img: elastic.png
---

# Elasticsearch

Elasticsearch 是高度可伸缩的开源全文搜索和分析引擎。 你可以即时存储、搜索并分析大容量数据。可靠的底层引擎和技术通常应对复杂的搜索场景和需求。

## [核心理念 Basic Concepts](https://www.elastic.co/guide/en/elasticsearch/reference/current/getting-started-concepts.html)

- Near Realtime(NRT) 实时
- Cluster 集群
- Node 节点
- Index 索引
- Document 文档
- Shards & Replicas 切片和备份

## 快速上手

### Cluster 健康状态检查

```
GET /_cat/health?v

epoch      timestamp cluster       status node.total node.data shards pri relo init unassign pending_tasks max_task_wait_time active_shards_percent
1555385352 03:29:12  elasticsearch yellow          1         1     13  13    0    0       11             0                  -                 54.2%
```

### Indices 索引列表

```
GET /_cat/indices?v

health status index                     uuid                   pri rep docs.count docs.deleted store.size pri.store.size
green  open   .kibana_1                 3KNILZS5QeK5s_a-LlXfPQ   1   0         10            1      109kb          109kb
yellow open   eminoda                   DUdSWSOcRl2EOnR6Qr9rCA   5   1          5            0     16.6kb         16.6kb
yellow open   filebeat-6.7.1-2019.04.15 5JgqfpNLQ-ewjikehGDc2A   3   1      42103            0        9mb            9mb
green  open   .kibana_task_manager      cI56liOAQgGERRqmqsJilw   1   0          2            0     12.8kb         12.8kb
yellow open   filebeat-6.7.1-2019.04.12 WHDv4xFZTCy-OGMHyoi8wg   3   1      13056            0      3.9mb          3.9mb

```

### Index 索引操作

创建一个索引

```
PUT /eminoda2?pretty
```

```
GET /_cat/indices?v

health status index                     uuid                   pri rep docs.count docs.deleted store.size pri.store.size
green  open   .kibana_1                 3KNILZS5QeK5s_a-LlXfPQ   1   0         10            1    114.2kb        114.2kb
yellow open   eminoda2                  4oV_rAOJQxuToc1ivnie_w   5   1          0            0       460b           460b
yellow open   eminoda                   DUdSWSOcRl2EOnR6Qr9rCA   5   1          5            0     16.6kb         16.6kb
yellow open   filebeat-6.7.1-2019.04.15 5JgqfpNLQ-ewjikehGDc2A   3   1      42103            0        9mb            9mb
green  open   .kibana_task_manager      cI56liOAQgGERRqmqsJilw   1   0          2            0     25.2kb         25.2kb
yellow open   filebeat-6.7.1-2019.04.12 WHDv4xFZTCy-OGMHyoi8wg   3   1      13056            0      3.9mb          3.9mb
```

向索引添加/修改数据

> 格式：** /:\_index/:\_type/:\_id**

如果数据已存在，则是 update 修改状态

```
PUT /eminoda2/_doc/1?pretty
{
  "name":"first data"
}
```

```
{
  "_index" : "eminoda2",
  "_type" : "_doc",
  "_id" : "2",
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

也可通过 POST 添加数据，生成随机的 id 编码

```
POST /eminoda2/_doc?pretty
{
  "name":"third data"
}
```

查看索引数据

```
GET /eminoda2/_doc/1?pretty

{
  "_index" : "eminoda2",
  "_type" : "_doc",
  "_id" : "1",
  "_version" : 3,
  "_seq_no" : 2,
  "_primary_term" : 1,
  "found" : true,
  "_source" : {
    "name" : "first data"
  }
}
```

删除索引

```
DELETE /eminoda2?pretty

{
  "acknowledged" : true
}
```

### 多数据操作 Batch

格式：** /:\_index/:\_type/:\_bulk**

```
POST /eminoda/_doc/_bulk
{"index":{"_id":"1"}}
{"name": "John Doe" }
{"index":{"_id":"2"}}
{"name": "Jane Doe" }
```

### 查询 Search

```
GET /eminoda/_search

# 查询所有
{
  "query": { "match_all": {} }
}

# 限制长度
{
  "query": { "match_all": {} },
  "size": 1
}

# 分页
{
  "query": { "match_all": {} },
  "from": 10,
  "size": 10
}

# 排序，注意需要 field 字段为数据类型
{
  "query": { "match_all": {} },
  "sort": [
    {
      "age": {
        "order": "desc"
      }
    }
  ]
}

# 限制/匹配字段
{
  "query": { "match_all": {} },
  "_source": "age"
}

{
  "query": {
    "match": {
      "age": 6
    }
  }
}
# 转义
{
  "query": {
    "match_phrase": {
      "age": "6"
    }
  }
}

# 断言
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "age": 6
          }
        }
      ],
      "should": [
        {
          "match": {
            "name": "wrong"
          }
        }
      ],
      "must_not": [
        {
          "match": {
            "name": "wrong"
          }
        }
      ]
    }
  }
}

# 过滤器
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "age": 6
          }
        }
      ],
      "filter": {
        "range": {
          "age": {
            "gte": 0,
            "lte": 20
          }
        }
      }
    }
  }
}

# 聚合 Aggregations
GET /eminoda/_search
{
  "query": {
    "bool": {
      "should": [
        {
          "match": {
            "age": 6
          }
        }
      ],
      "filter": {
        "range": {
          "age": {
            "gte": 0,
            "lte": 20
          }
        }
      }
    }
  },
  "aggs": {
    "group_by_state": {
      "terms": {
        "field": "age"
      }
    }
  }
}

{
  "took" : 2,
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
          "name" : "Jane Doe",
          "age" : 6
        }
      },
      {
        "_index" : "eminoda",
        "_type" : "_doc",
        "_id" : "1",
        "_score" : 0.0,
        "_source" : {
          "name" : "John Doe",
          "age" : 4
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
          "key" : 4,
          "doc_count" : 1
        },
        {
          "key" : 6,
          "doc_count" : 1
        }
      ]
    }
  }
}
```

# 安装

# \_cat api

### 通过 help 查看输出的列字段

```
GET /_cat/master?help

id   |   | node id
host | h | host name
ip   |   | ip address
node | n | node name
```

### Node 状态

```
GET /_cat/nodes?v

ip        heap.percent ram.percent cpu load_1m load_5m load_15m node.role master name
127.0.0.1           30          99   0    0.10    0.05     0.01 mdi       *      JurI_Du
```

通过参数 **h** 过滤列信息

> Each of the commands accepts a query string parameter h which forces only those columns to appear

```
GET /_cat/nodes?v&h=ip,port,heapPercent,name

ip        port heapPercent name
127.0.0.1 9300          31 JurI_Du
```

### 主节点信息

```
GET /_cat/master?v

id                     host      ip        node
JurI_DuhSuGGL0rJPqlpJA 127.0.0.1 127.0.0.1 JurI_Du
```

# Document API

[index Date format](https://www.elastic.co/guide/en/elasticsearch/reference/current/date-math-index-names.html)

## Index API

### GET

```
GET /<cfniu-6.7.1-{now}>/_doc/_ektMWoB3Cyw7jMv7kyk
```

### 重建索引

```
PUT /eminoda1/_doc/1
{
  "version":1,
  "name":"eminoda1"
}
```

```
POST \_reindex
{
  "source": {
  "index": "eminoda1"
},
  "dest":{
  "index":"eminoda2"
}
```

```
PUT /eminoda2/_doc/1
{
  "version":1,
  "name":"eminoda1"
}
```
