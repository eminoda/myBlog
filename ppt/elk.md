title: elk 实践
speaker: shixinghao
plugins: echarts

<slide class="bg-black-blue aligncenter" image="./images/elk/index.png .dark">

# ELK 实战 {.text-landing.text-shadow}

By shixinghao {.text-intro}

[:fa-github: Github](https://github.com/ksky521/nodeppt){.button.ghost}

---

<slide class="bg-black-blue aligncenter">

## 什么是 ELK

![产品](./public/images/elk/product.png)

ELK 其实并不是一款软件，而是一整套解决方案，是三个软件产品的首字母缩写，Elasticsearch，Logstash 和 Kibana. {.text-intro}

这样种集合现在称为 Elastic Stack

---

<slide class="bg-black-blue aligncenter">

## Filebeat(Beats)

轻量型 (lightweight) 日志采集器

部署在生产服务器，**收集** 日志文件 **自动择机** 发送给 Logstash、elasticsearch {.text-intro}

当您要面对成百上千、甚至成千上万的服务器、虚拟机和容器生成的日志时，请告别 SSH 吧。

---

<slide class="bg-black-blue aligncenter">

!![filebeat-harvester](./public/images/elk/filebeat-harvester.png .size-50)

---

<slide class="bg-black-blue aligncenter">

!![filebeat-module](./public/images/elk/filebeat-module.png .size-30)

---

<slide class="bg-black-blue aligncenter">

ingest gork(nginx)

```shell {.animated.fadeInUp}
66.249.79.242 - - [18/Apr/2019:18:21:22 +0800] GET / HTTP/1.1 200 24299 0.501 - Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html) Googlebot
```

```shell
"grok": {
    "field": "message",
    "patterns": [
        "\"?%{IP_LIST:nginx.access.remote_ip_list} %{IP_LIST:nginx.access.forward_ip_list} - \\[%{HTTPDATE:nginx.access.time}\\] %{GREEDYDATA:nginx.access.info} %{NUMBER:nginx.access.response_code:long} %{NUMBER:nginx.access.body_sent.bytes:long} %{NUMBER:nginx.access.request_time:float} (%{NUMBER:nginx.access.uid}|-) %{GREEDYDATA:nginx.access.agent} %{SPIDER:nginx.access.spider}"
    ],
    "pattern_definitions": {
        "IP_LIST": "%{IP}(\"?,?\\s*%{IP})*|-",
        "SPIDER": "%{WORD}|-"
    },
    "ignore_missing": true
}
```

---

<slide class="bg-black-blue aligncenter">
## Logstash

集中、转换和存储数据

!![logstash](./public/images/elk/logstash.png .size-30)

---

<slide class="bg-black-blue aligncenter">

!![logstash-code](./public/images/elk/logstash-code.png .size-100)

logstash.conf

---

<slide class="bg-black-blue aligncenter">
## Kibana

视图界面

通过 Kibana，您能够对 Elasticsearch 中的数据进行 **可视化** 并在 Elastic Stack 进行操作{.text-intro}

---

<slide class="bg-black-blue aligncenter">

!![kibana-dashboard](./public/images/elk/kibana-dashboard.png .size-100)

---

<slide class="bg-black-blue alignleft">

## Elasticsearch

数据分析搜索

Elasticsearch 是高度可伸缩的开源全文搜索和分析引擎。 你可以即时存储、搜索并分析大容量数据。可靠的底层引擎和技术通常应对复杂的搜索场景和需求。{.text-intro}

---

<slide class="bg-black-blue aligncenter">

---
