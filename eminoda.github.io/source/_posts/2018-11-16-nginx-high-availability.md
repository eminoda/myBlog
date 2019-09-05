---
title: 初涉 nginx 高可用
tags: nginx
categories:
  - 开发
  - 运维部署
thumb_img: keepalived.png
date: 2018-11-16 17:03:49
---

# [什么是高可用](https://zh.wikipedia.org/zh-hans/%E9%AB%98%E5%8F%AF%E7%94%A8%E6%80%A7)

> 高可用性（英语：high availability，缩写为 HA），IT 术语，指系统无中断地执行其功能的能力，代表系统的可用性程度。是进行系统设计时的准则之一。高可用性系统与构成该系统的各个组件相比可以更长时间运行

衡量指标：A（可用性）=MTBF/(MTBF+MTTR)

- MTBF(Mean Time Between Failure 平均故障间隔)
- MTTR(Mean Time to Restoration 平均恢复时间)

**最佳实践**

- 消除单点故障，不会因为单点问题，导致整个系统链的故障
- 加强节点健壮性，同样避免单点故障问题
- 实时监测系统异常情况，有问题及时“处理”

# nginx+keepalived 高可用

## [负载均衡 upstream](http://nginx.org/en/docs/http/ngx_http_upstream_module.html)

```
upstream expressServer {
    server 127.0.0.1:6601;
    server 127.0.0.1:6602;
}
server {
    listen          66;
    location / {
        proxy_pass http://expressServer;
    }
}
```

访问：192.168.1.65:66，nginx 自动分配规则自动分配到对应服务地址（6601,6602）

**更多参数**
| 配置 | 作用 |
| --- | --- |
| weight=number | 权重 |
| max_conns=number | 最大连接数，默认 0 不限制 |
| max_fails=number | 监控链接健康状况，默认 1 |
| fail_timeout=time | 超时时间，默认 10sed，服务器 disconnect、超时都会造成不可用 |
| backup | “备胎“ |
| down | 取消 |

## 健康检查 healthcheck

nginx 提供健康检查模块 **ngx_http_upstream_hc_module**，但是看到下面那句话只能绕道了：

> This module is available as part of our commercial subscription.

## keepalived

市面上有很多可选方案，只是 keepalived 文档多，选择了解一番。以下配置停留在 helloworld 程度，更多功能参阅官网了解。

1. 环境配置

   ```
   yum install keepalived
   service keepalived start
   ```

   日志文件位置（默认）:/var/log/messages

2. 配置文件

   master

   ```
   global_defs {
   notification_email {
       245978782@qq.com
   }
   notification_email_from 245978782@qq.com
   smtp_server 127.0.0.1
   smtp_connect_timeout 30
   router_id LVS_DEVEL
   }
   vrrp_instance VI_1 {
       state MASTER    # 注意配置
       interface eth5  # 注意配置
       mcast_src_ip 192.168.1.65   # 注意配置
       virtual_router_id 51
       priority 101    # 注意配置
       advert_int 1
       authentication {
           auth_type PASS
           auth_pass 1111
       }
       virtual_ipaddress {
           192.168.1.213
       }
   }
   ```

   从

   ```
   global_defs {
   notification_email {
       245978782@qq.com
   }
   notification_email_from 245978782@qq.com
   smtp_server 127.0.0.1
   smtp_connect_timeout 30
   router_id LVS_DEVEL
   }
   vrrp_instance VI_1 {
       state BACKUP    # 注意配置
       interface eth1  # 注意配置
       mcast_src_ip 192.168.1.74   # 注意配置
       virtual_router_id 51
       priority 100    # 注意配置
       advert_int 1
       authentication {
           auth_type PASS
           auth_pass 1111
       }
       virtual_ipaddress {
       192.168.1.213
       }
   }
   ```

3. 场景测试

   **手动关闭 master keepalived**

   主服务 keepalived 关闭

   ```
   [root@localhost ~]# service keepalived stop
   ```

   MASTER log：vip 实例被移除

   ```
   Nov 14 15:52:28 localhost Keepalived[56457]: Stopping Keepalived v1.2.13 (03/19,2015)
   Nov 14 15:52:28 localhost Keepalived_vrrp[56459]: VRRP_Instance(VI_1) sending 0 priority
   Nov 14 15:52:28 localhost Keepalived_vrrp[56459]: VRRP_Instance(VI_1) removing protocol VIPs.
   ```

   BACKUP log：从服务被 vip 绑定

   ```
   Nov 14 15:52:31 station74 Keepalived_vrrp[59094]: VRRP_Instance(VI_1) Transition to MASTER STATE
   Nov 14 15:52:32 station74 Keepalived_vrrp[59094]: VRRP_Instance(VI_1) Entering MASTER STATE
   Nov 14 15:52:32 station74 Keepalived_vrrp[59094]: VRRP_Instance(VI_1) setting protocol VIPs.
   Nov 14 15:52:32 station74 Keepalived_vrrp[59094]: VRRP_Instance(VI_1) Sending gratuitous ARPs on eth1 for 192.168.1.213
   Nov 14 15:52:32 station74 Keepalived_healthcheckers[59093]: Netlink reflector reports IP 192.168.1.213 added
   Nov 14 15:52:37 station74 Keepalived_vrrp[59094]: VRRP_Instance(VI_1) Sending gratuitous ARPs on eth1 for 192.168.1.213
   ```

   **应用宕机（nginx、tomcat、node...），自动切换**

   不同应用只是针对不同的 sh 脚本处理不同，原理类似。下面给出 nginx 判断（百度上基本都类似，再根据自己逻辑改吧改吧就行了）

   ```
   #!/bin/bash
   status=100 # 测试，为了让if条件能够命中
   count=$(ps -C nginx --no-heading|wc -l)
   if [ "$count" -lt "$status" ]
   then
       sleep 2
       service keepalived stop # 关闭keepalived
   else
       echo "nginx is started"
   fi
   ```

   keepalived.conf 主从都需要修改，监听脚本

   ```
   vrrp_script chk_http_port {
       script "/mydata/FE_shell/check.sh"
       interval 1       # check every second
       weight -2        # default prio: -2 if connect fails
   }
   vrrp_instance VI_1 {
       # 脚本追踪
       track_script {
           chk_http_port weight 2    # +2 if process is present
       }
   }
   ```

   结果：keepalive 轮询查询脚本，当服务“异常”，自动关闭 keepalived，ip 漂移到从服务。在脚本上可以继续加工复杂化，循环监听应用状态，再重启 keepalived。

## 最后（很重要）

阿里云**ecs 不支持 Keepalived 的虚拟漂移 IP，除了 slb 还没有额外的服务来配置**

备注：2018-11-14 提的工单，不知道日后会不会有这项服务/功能

你上面看到的配置，若不是自己建服，用的阿里云估计要歇菜了。如果有什么其他方式能实现，欢迎留言讨论。

# 参考

- [web 应用的负载均衡、集群、高可用(HA)解决方案——了解基础知识](http://aokunsang.iteye.com/blog/2053719)
- [高可用-HA](https://zh.wikipedia.org/wiki/%E9%AB%98%E5%8F%AF%E7%94%A8%E6%80%A7)
- [keepalived+nginx 高可用](https://blog.csdn.net/e421083458/article/details/30092795)
- [http://www.keepalived.org/manpage.html](http://www.keepalived.org/manpage.html)
