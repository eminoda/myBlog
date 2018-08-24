---
title: Restful 最佳实践
tags: node restful
categories:
  - 前端
  - restful
thumb_img: restful.png
date: 2018-08-24 15:58:11
---


# 前言
restful（Representational State Transfer）近年来听到的次数逐渐增多，自打前后端分离开始流行，服务端越来越侧重提供API的质量和方式。
不谈restful巴拉巴拉的概念，但从实际落地的效果，看下几个常见的best practice

## 接口定义规范
| resource | get | post | put | delete |
| --- | --- | --- |
| /users | 获取用户列表 | 新增用户 | 更新用户信息 | 删除用户 |
| /users/:id | 根据id获取用户 | return 405 | 根据id更新用户 | 删除指定用户 |
这是rest最明显的特点，通过Http请求方法来判断**同一资源**的不同操作方式的展现。

- 同一资源在不同http method实现不同需求
- 接口最好用复数
- **资源获取**（users，products）以名词代替动词
- **非资源**（calc...）以动词定义
- 接口以资源定义，不要按照功能语义功能

切记不要使用如下方式：
````
/getUsers
/addUsers
/user
/frozenUsers
/activeUser
````

## 请求参数定义
比如维护get api 或者添加query params方式来改变用户状态。应该使用post、put等来修改。
````
/users/:id/frozen
/users/:id?frozen=1
````

## 不同的错误处理
提供针对不同情况的response code和描述错误的信息

## 返回状态码限制
同一接口在不同的method下，不同错误处理，返回的状态码不同。
- 200 OK
- 400 Bad Request
- 401 Unauthorized
- 404 Not Found
- 403 Forbidden
- 500 Internal Server Error

## 版本控制
````
https://api.example.com/v1/users
````

## HATEOAS驱动
HATEOAS(hypermedia as the engine of application state)
整个rest构建的服务，以超文本作为应用状态来驱动。客户端对资源的获取渐进式的方式按需获取。
{% asset_img HATEOAS.png HATEOAS %}
- 第一个层次（Level 0）的 Web 服务只是使用 HTTP 作为传输方式，实际上只是远程方法调用（RPC）的一种具体形式。SOAP 和 XML-RPC 都属于此类。
- 第二个层次（Level 1）的 Web 服务引入了资源的概念。每个资源有对应的标识符和表达。
- 第三个层次（Level 2）的 Web 服务使用不同的 HTTP 方法来进行不同的操作，并且使用 HTTP 状态码来表示不同的结果。如 HTTP GET 方法来获取资源，HTTP DELETE 方法来删除资源。
- 第四个层次（Level 3）的 Web 服务使用 HATEOAS。在资源的表达中包含了链接信息。客户端可以根据链接来发现可以执行的动作。

定义了4个level，不过我们大多停留在0,1级，说白了就是不规范的rest

如：获取学校
````
/api/schools
{
    students:{
        url:'/api/students'
    },
    teachers:{
        url:'/api/teachers'
    }
}
````

## 扩展阅读
[rest action](https://github.com/waylau/rest-in-action)