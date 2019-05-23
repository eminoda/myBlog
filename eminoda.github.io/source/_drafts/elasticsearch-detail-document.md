---
title: elasticsearch-detail-document
tags: elk
categories:
    - 开发
    - elk
thumb_img: elastic.png
---

# 读写 documents

Elasticsearch 中的索引 index 被划分在 **分片 shards** 中，每个 shard 会有多个副本 copies。

这些 copies 称为副本集 **replication group**，在 documents 的添加和移除中一定保持同步性。

Elasticsearch 的数据副本模型 replication model 基于主备份模型 primary-backup model，类似分布式存储系统（Replication in Log-Based Distributed Storage Systems）

## Index API

```
PUT /eminoda/_doc/1
{
  "name":"aaaa",
  "age":1
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
    "total" : 2, # 副本（主副本+复制副本）数量
    "successful" : 1, # 操作成功数量
    "failed" : 0
  },
  "_seq_no" : 0,
  "_primary_term" : 1
}
```
