---
title: Elasticsearch Document 文档操作
tags: elk
categories:
  - 开发
  - 运维部署
thumb_img: elastic.png
date: 2019-07-05 16:37:22
---

## [Reading and Writing documents](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-replication.html#_introduction)

Elasticsearch 中的索引 index 被划分在 **分片 shards** 中，每个 shard 会有多个副本 copies。

这些 copies 称为副本集 **replication group**，在添加和移除 documents 的过程中会同步这些 copies。

因为数据集的同步化，让我们在不同 shards 中获取数据一致性，这样称为 replication model 数据副本模型。

Elasticsearch 的数据副本模型 replication model 基于主备份模型 primary-backup model，类似分布式存储系统（Replication in Log-Based Distributed Storage Systems）

关于 documents 的读写设计思想如下：

- [basic_write_model](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-replication.html#_basic_write_model)
- [basic_read_model](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-replication.html#_basic_read_model)

## Index API

### 添加新索引（设置了索引 id）

```text
PUT eminoda_test/_doc/1
{
  "name":"eminoda",
  "age":"30",
  "skill":"vue node"
}
```

```text
{
  "_index" : "eminoda_test",  # 索引名称
  "_type" : "_doc",           # 类型
  "_id" : "1",
  "_version" : 1,
  "result" : "created",
  "_shards" : {               # 见下 shards 描述
    "total" : 2,              # 一共在多少个 shard copies 上操作
    "successful" : 1,         # 有多少个 shard copies 成功执行
    "failed" : 0
  },
  "_seq_no" : 0,
  "_primary_term" : 1
}
```

注意：如果再次执行上述操作，result 将为 updated ，可以设置 **op_type** 参数，使已创建的 doc 再次创建有报错提示。

```text
PUT eminoda_test/_doc/1?op_type=create
{
  "name":"eminoda",
  "age":"30",
  "skill":"vue node"
}
```

```text
{
  "error": {
    "root_cause": [
      {
        "type": "version_conflict_engine_exception",
        "reason": "[_doc][1]: version conflict, document already exists (current version [2])",
        "index_uuid": "bzQU4HCBRxeDAfyX7IPnHw",
        "shard": "3",
        "index": "eminoda_test"
      }
    ],
    "type": "version_conflict_engine_exception",
    "reason": "[_doc][1]: version conflict, document already exists (current version [2])",
    "index_uuid": "bzQU4HCBRxeDAfyX7IPnHw",
    "shard": "3",
    "index": "eminoda_test"
  },
  "status": 409
}
```

### shards

你可以直接阅读 [shards](https://www.elastic.co/guide/en/elasticsearch/reference/current/scalability.html#scalability)

首先，Elasticsearch 可以按照用户设置进行扩容 increase capacity ，会自动分发 automatically distributes 数据到节点，查询操作在各个节点上平衡负载。Elasticsearch 有自己的策略。

Elasticsearch 的 index 索引在一个逻辑分组上 or 多个物理分区上 physical shards ，每个分区 shards 又一个属于它的索引 index。

数据的分发将一个索引横跨多个 shards ，多个 shards 有横跨多个 nodes 节点。Elasticsearch 会自己控制数据的冗余 redundancy，使这些 shards 平衡。

shards 分为两种类型：

- primaries 主区
- replicas 副本区

replicas 是从 primaries 中备份数据，每个 document 索引 index 只属于一个 primaries。

### 添加索引（未指定 id）

上例使用 PUT 指定了索引 id，使用 POST 可以使用让 elasticsearch 自己生成索引值

```text
POST eminoda_test/\_doc
{
  "name":"eminoda2",
  "age":"30",
  "skill":"vue node"
}
```

```text
{
  "_index" : "eminoda_test",
  "_type" : "_doc",
  "_id" : "I7nuwGsBjRxZrv4loy0h",
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

### 关闭新建索引

更改规则，关闭自建索引

```text
PUT _cluster/settings
{
  "persistent": {
    "action.auto_create_index":"false" # 默认 true
  }
}
```

这个再通过 POST、PUT 就无法新建索引

```text
{
  "error" : {
    "root_cause" : [
      {
        "type" : "index_not_found_exception",
        "reason" : "no such index",
        "resource.type" : "index_expression",
        "resource.id" : "eminoda_test",
        "index_uuid" : "_na_",
        "index" : "eminoda_test"
      }
    ],
    "type" : "index_not_found_exception",
    "reason" : "no such index",
    "resource.type" : "index_expression",
    "resource.id" : "eminoda_test",
    "index_uuid" : "_na_",
    "index" : "eminoda_test"
  },
  "status" : 404
}
```

### routing

可以这是一个 **控制器** ，比如 routing，设置一个简单的映射关系，让查询更快速高效

```js
POST eminoda_test/_doc?routing=admin
{
  "name":"eminoda2",
  "age":"30",
  "skill":"vue node"
}
```

查询的数据中会新添加 \_routing 字段：

```text
{
  "_index" : "eminoda_test",
  "_type" : "_doc",
  "_id" : "X7n9wGsBjRxZrv4lpy1O",
  "_score" : 1.0,
  "_routing" : "admin",
  "_source" : {
    "name" : "eminoda2",
    "age" : "30",
    "skill" : "vue node"
  }
}
```

## Get API

### 指定 id 查询

```text
GET eminoda_test/_doc/1

{
  "_index" : "eminoda_test",
  "_type" : "_doc",
  "_id" : "1",
  "_version" : 1,
  "_seq_no" : 0,
  "_primary_term" : 1,
  "found" : true,
  "_source" : {
    "name" : "eminoda",
    "age" : "30",
    "skill" : "vue node"
  }
}
```

### 屏蔽 \_source 数据信息

```text
GET eminoda_test/_doc/1?_source=false

{
  "_index" : "eminoda_test",
  "_type" : "_doc",
  "_id" : "1",
  "_version" : 1,
  "_seq_no" : 0,
  "_primary_term" : 1,
  "found" : true
}
```

### stored_fields 过滤信息

定义数据类型，每个字段 Field 上定义额外属性 store

```text
PUT eminoda_test
{
  "mappings": {
    "_doc":{
      "properties": {
        "nick":{
          "type":"text",
          "store":true
        },
        "nick2":{
          "type":"text",
          "store":false
        }
    }
  }}
}
```

```text
PUT eminoda_test/_doc/1
{
  "nick":"abc",
  "nick2":"efg"
}
```

通过 **stored_fields** 查询，定义 store=false 的字段将被过滤出去

```text
GET eminoda_test/_doc/1?stored_fields=nick,nick2

{
  "_index" : "eminoda_test",
  "_type" : "_doc",
  "_id" : "1",
  "_version" : 1,
  "_seq_no" : 0,
  "_primary_term" : 1,
  "found" : true,
  "fields" : {
    "nick" : [
      "abc"
    ]
  }
}
```

## Delete API

### 删除单个

```text
DELETE eminoda_test/_doc/1
```

```text
{
  "_index" : "eminoda_test",
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

```

### 全部删除

```text
DELETE eminoda_test
```

## Update API

如果没有特殊指定 op_type=create ，PUT 操作会对已添加的 doc 进行 udpate

```text
PUT eminoda_test/_doc/1
{
  "name":"eminoda",
  "age":"30",
  "skill":"vue node"
}

{
  "_index" : "eminoda_test",
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

### 根据查询语句更新

```text
POST eminoda_test/_update_by_query
{
  "script": {
    "source": "ctx._source.age = 33"
  },
  "query": {
    "term": {
      "age": 30
    }
  }
}
```

```text
{
  "took" : 7,             #操作用时
  "timed_out" : false,
  "total" : 1,
  "updated" : 1,
  "deleted" : 0,
  "batches" : 1,
  "version_conflicts" : 0,
  "noops" : 0,
  "retries" : {
    "bulk" : 0,
    "search" : 0
  },
  "throttled_millis" : 0,
  "requests_per_second" : -1.0,
  "throttled_until_millis" : 0,
  "failures" : [ ]
}

```

### Bluk API

版本估计不对，没试出来

### ReIndex API

```text
POST _reindex
{
  "source": {
    "index": "eminoda_test"
  },
  "dest":{
    "index":"eminoda_test_bak"
  }
}
```

```text
#! Deprecation: the default number of shards will change from [5] to [1] in 7.0.0; if you wish to continue using the default of [5] shards, you must manage this on the create index request or with an index template
{
  "took" : 97,
  "timed_out" : false,
  "total" : 1,
  "updated" : 0,
  "created" : 1,
  "deleted" : 0,
  "batches" : 1,
  "version_conflicts" : 0,
  "noops" : 0,
  "retries" : {
    "bulk" : 0,
    "search" : 0
  },
  "throttled_millis" : 0,
  "requests_per_second" : -1.0,
  "throttled_until_millis" : 0,
  "failures" : [ ]
}

```

```text

```

```text

```

```text

```

```text

```

```text

```

```text

```
