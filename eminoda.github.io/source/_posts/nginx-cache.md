---
title: nginx-cache
date: 2017-02-17 17:53:33
tags:
  - nginx
  - nginx优化
categories: nginx
comments: true
---

## 帮助文档（对原作者表示感谢）
[nginx proxy](http://www.qttc.net/201307355.html)
[proxy param解释](http://bbs.linuxtone.org/forum.php?mod=viewthread&tid=24357)
[proxy param图例，解释很详细](http://blog.csdn.net/dengjiexian123/article/details/53386586)
## nginx缓存设置
### 现象
nginx error.log 出现warn：an upstream response is buffered to a temporary file
{% asset_img 1.png warn %}

### 优化
  1. 在http模块下，加入缓存配置
  ````
  ##proxy cache##
  client_max_body_size       16m;
  client_body_buffer_size    256k;
  proxy_ignore_headers X-Accel-Expires Expires Cache-Control Set-Cookie;
  proxy_connect_timeout      90;
  proxy_send_timeout         90;
  proxy_read_timeout         90;
  proxy_buffer_size          16k;
  proxy_buffers         4    64k;
  proxy_busy_buffers_size    128k;
  proxy_temp_file_write_size 128k;
  # 临时缓存路径
  proxy_temp_path  /var/cache/nginx/temp_dir;
  # 设置缓存区域大小，存储位置
  proxy_cache_path /var/cache/nginx/cache levels=1:2 keys_zone=cache_one:200m inactive=1d max_size=500m;
  ##proxy end##
  ````

  2. location调用cache
  特别注意，需要对cache**设置http status**，否则不生成缓存文件
  ````
  # 静态资源缓存
  location ~*.(gif|jpg|jpeg|png|js)$ {
    expires 7d;
    proxy_cache_valid  200 304 302 24h;
    proxy_cache       cache_one;
    if ( !-e $request_filename ) {
      proxy_pass  http://127.0.0.1:3005;
    }
  }
  ````
  {% asset_img 2.png 生成缓存文件目录 %}

  3. 效果
  之前，每次去服务器拿资源
  {% asset_img 3.png 服务器命中 %}

  现在，直接去缓存目录获取，不在请求服务器
  {% asset_img 4.png file缓存中命中 %}