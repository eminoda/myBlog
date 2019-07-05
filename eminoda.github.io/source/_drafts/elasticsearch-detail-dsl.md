---
title: elasticsearch Query DSL
tags:
---

## Query DSL

> Domain Specific Language

某种领域中特定的查询语言，这是是指 elasticsearch 中的 query 语言

## Query and filter context

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

查询所有匹配的 documents，如果全部查询出来，则 \_score = 1.0

```text
GET *nginx*/_search
{
  "query": {
    "match_all": {}
  }
}
```

如果增加条件参数 boost，设置为 1.2 ，则会影响分数

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

## Full text queries

### Match Query

match 接受 text/numerics/dates ，并且分析他们

```text
GET *nginx*/_search
{
  "query": {
    "match": {
      "nginx.access.method":"GET"
    }
  }
}
```

### Match Phrase Query

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

```text

```
