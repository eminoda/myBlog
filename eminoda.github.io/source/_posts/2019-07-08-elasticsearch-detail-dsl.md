---
title: elasticsearch 查询语言 Query DSL
tags: elk
categories:
  - 开发
  - 运维部署
thumb_img: elastic.png
date: 2019-07-08 13:34:04
---

## [Query DSL](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html)

> Domain Specific Language

某种领域中特定的查询语言，这是是指 elasticsearch 中的 query 语言

## Query and filter context

一段查询语句的结果集取决于其中所使用的 **查询内容 query context** 和 **过滤内容 filter context**

### Query context

> How well does this document match this query clause?

这个文档内容匹配查询语句结果怎么样？

注意，查询结果中的 score 受 query context 影响。

### Filter context

> Does this document match this query clause?

这个文档内容匹配这个查询语句吗？

```text
GET *nginx*/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "nginx.access.url":   "/favicon.ico"        }}
      ],
      "filter": [
        { "term":  { "nginx.access.method": "GET" }},
        { "range": { "nginx.access.body_sent.bytes": { "gte": 3000 }}}
      ]
    }
  }
}
```

- 整个 query 属于查询内容 query context
- bool 和 match 被用于 query context 中，会影响查询分数
- filter 用于过滤查询内容
- term 和 range 被用于 filter context 中，不会影响分数

## Match All Query

### Match All Query

最简单的查询方式。查询所有匹配的 documents，如果全部查询出来，则 \_score = 1.0

```text
GET *nginx*/_search
{
  "query": {
    "match_all": {}
  }
}
```

可以设置 boost 来改变结果分数：

```text
GET *nginx*/_search
{
  "query": {
    "match_all": {
      "boost" : 1.2
    }
  }
}

"hits" : {
    "total" : 8,
    "max_score" : 1.2,
    "hits" : [
      {
        "_score" : 1.2,
      }
    ]
}
```

### Match None Query

是 match_all 的反例

```text
GET *nginx*/_search
{
  "query": {
    "match_none":{}
  }
}
```

```text
{
  "hits" : {
    "total" : 0,
    "max_score" : null,
    "hits" : [ ]
  }
}

```

## Full text queries

全文查询允许搜索分析文本字段，在索引中，利用查询字符串处理相同的分析器。

预存数据：

```text
POST /eminoda_test/_doc
{
  "name":"eminoda",
  "age":30,
  "skill":"vue node"
}

POST /eminoda_test/_doc
{
  "name":"mike",
  "age":40,
  "skill":"angular node"
}

POST /eminoda_test/_doc
{
  "name":"cc",
  "age":50,
  "skill":"reactive jquery"
}
```

### match query

> The standard query for performing full text queries, including fuzzy matching and phrase or proximity queries.

这是个标准的查询匹配方式来进行全文匹配,包括模糊，短语，近似查询。

match 接受 text/numerics/dates ，构造一个查询请求，并且分析查询结果。

查询 eminoda_test 索引，documents 中字段为 name ，值为 eminoda 的结果：

```text
GET /eminoda_test/_search
{
  "query": {
    "match": {
      "name": "eminoda"
    }
  }
}
```

```text
{
  "took" : 1,
  "timed_out" : false,
  "_shards" : {
    "total" : 5,
    "successful" : 5,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : 1,
    "max_score" : 0.2876821,
    "hits" : [
      {
        "_index" : "eminoda_test",
        "_type" : "_doc",
        "_id" : "DP1sz2sBqZI9Rs_eLn_H",
        "_score" : 0.2876821,
        "_source" : {
          "name" : "eminoda",
          "age" : 30,
          "skill" : "vue node"
        }
      }
    ]
  }
}

```

**match query** 处理结果是 bool 类型。会构造一个 bool 的查询对 text 文本的分析结果进行返回，默认会对 text 的内容进行 or 操作（有 or 和 and）。

默认搜索器：default search analyzer

比如，skill = jquery node 会返回 3 条记录：

```text
GET /eminoda_test/_search
{
  "query": {
    "match": {
      "skill": "jquery node"
    }
  }
}
```

```text
  "hits" : {
    "total" : 3,
    "max_score" : 0.2876821,
    "hits" : [
      {
        "_index" : "eminoda_test",
        "_type" : "_doc",
        "_id" : "Df1sz2sBqZI9Rs_eNn-v",
        "_score" : 0.2876821,
        "_source" : {
          "name" : "mike",
          "age" : 40,
          "skill" : "angular node"
        }
      },
      {
        "_index" : "eminoda_test",
        "_type" : "_doc",
        "_id" : "Dv1sz2sBqZI9Rs_ePn_E",
        "_score" : 0.2876821,
        "_source" : {
          "name" : "cc",
          "age" : 50,
          "skill" : "reactive jquery"
        }
      },
      {
        "_index" : "eminoda_test",
        "_type" : "_doc",
        "_id" : "DP1sz2sBqZI9Rs_eLn_H",
        "_score" : 0.2876821,
        "_source" : {
          "name" : "eminoda",
          "age" : 30,
          "skill" : "vue node"
        }
      }
    ]
  }
```

如果设置 operator = and ，则会对结果有影响：

```text
GET /eminoda_test/_search
{
  "query": {
    "match": {
      "skill": {
        "query": "jquery node",
        "operator":"and"
      }
    }
  }
}
```

```text
  "hits" : {
    "total" : 0,
    "max_score" : null,
    "hits" : [ ]
  }
```

**[fuzziness](https://www.elastic.co/guide/en/elasticsearch/reference/current/common-options.html#fuzziness)** 允许对模糊查询，并可以设置模糊度。规范讲应该是：[Levenshtein Edit Distance](https://en.wikipedia.org/wiki/Levenshtein_distance)

如，允许对 skill 的 text “出错” 2 个字符：

```text
GET /eminoda_test/_search
{
  "query": {
    "match": {
      "skill":{
        "query":"angularjs",
        "fuzziness": 2
      }
    }
  }
}
```

```text
  "hits" : {
    "total" : 1,
    "max_score" : 0.2054872,
    "hits" : [
      {
        "_index" : "eminoda_test",
        "_type" : "_doc",
        "_id" : "Df1sz2sBqZI9Rs_eNn-v",
        "_score" : 0.2054872,
        "_source" : {
          "name" : "mike",
          "age" : 40,
          "skill" : "angular node"
        }
      }
    ]
  }
```

### match_phrase query

> Like the match query but used for matching exact phrases or word proximity matches.

和 match query 类似，但多用于匹配短语 or 单词的接近匹配。

如果用 match 方式，则会返回 **三条** 记录，此匹配会以 text 内容做精确匹配

```text
GET /eminoda_test/_search
{
  "query": {
    "match_phrase": {
      "skill": "jquery node"
    }
  }
}
```

```text
  "hits" : {
    "total" : 0,
    "max_score" : null,
    "hits" : [ ]
  }
```

### match_phrase_prefix query

> Like the match_phrase query, but does a wildcard search on the final word.

和 match_phrase query 类似，但通过通配符作用于最后个单词匹配

```text
GET /eminoda_test/_search
{
  "query": {
    "match_phrase_prefix": {
      "skill": "a"
    }
  }
}
```

```text
  "hits" : {
    "total" : 1,
    "max_score" : 0.2876821,
    "hits" : [
      {
        "_index" : "eminoda_test",
        "_type" : "_doc",
        "_id" : "Df1sz2sBqZI9Rs_eNn-v",
        "_score" : 0.2876821,
        "_source" : {
          "name" : "mike",
          "age" : 40,
          "skill" : "angular node"
        }
      }
    ]
  }
```

### match_bool_prefix query

> Creates a bool query that matches each term as a term query, except for the last term, which is matched as a prefix query

创建一个 bool 查询来匹配查询结果，除了最后一个作为前缀查询匹配

### multi_match query

> The multi-field version of the match query.

多结果匹配查询

```text
GET /eminoda_test/_search
{
  "query": {
    "multi_match": {
      "query": "eminoda learn angular",
      "fields": ["name","skill"]
    }
  }
}
```

```text
  "hits" : {
    "total" : 2,
    "max_score" : 0.2876821,
    "hits" : [
      {
        "_index" : "eminoda_test",
        "_type" : "_doc",
        "_id" : "Df1sz2sBqZI9Rs_eNn-v",
        "_score" : 0.2876821,
        "_source" : {
          "name" : "mike",
          "age" : 40,
          "skill" : "angular node"
        }
      },
      {
        "_index" : "eminoda_test",
        "_type" : "_doc",
        "_id" : "DP1sz2sBqZI9Rs_eLn_H",
        "_score" : 0.2876821,
        "_source" : {
          "name" : "eminoda",
          "age" : 30,
          "skill" : "vue node"
        }
      }
    ]
  }
```

### common terms query

> A more specialized query which gives more preference to uncommon words.

更特殊的查询方式，针对不友好的单词。

### query_string query

> Supports the compact Lucene query string syntax, allowing you to specify AND|OR|NOT conditions and multi-field search within a single query string. For expert users only.

支持 Lucene 查询字符串语法，允许使用特殊的条件（and、or、not），和多条件的搜索一个简单的查询字符串。

```text
GET /eminoda_test/_search
{
  "query": {
    "query_string": {
      "default_field": "name",
      "query": "mike or eminoda"
    }
  }
}
```

### simple_query_string query

> A simpler, more robust version of the query_string syntax suitable for exposing directly to users.

### intervals query

> A full text query that allows fine-grained control of the ordering and proximity of matching terms

细粒度控制相近匹配结果

## 最后

以上列出目前使用过的几种，其他方式未花时间做过多实践。可结合官网在做深入。
