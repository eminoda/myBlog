---
title: 初识 graphQL
tags: graphQL node
categories:
  - 前端
  - node
thumb_img: graphQL.png
---

# [graphQL](http://graphql.github.io/)
> A query language for your API
GraphQL用于作为API查询的一种语言，针对API服务提供全面、易懂的数据描述，使得客户端能够能容易，能好的获取数据。一个强大的**developer tools**

当然我们只看[graphQL.js](http://graphql.github.io/graphql-js/)

# 快速上手
## Basic Types 基础类型
- String
- Int
- Float
- Boolean
- ID

**默认每个类型可以为空，可以定义！来特殊注明不能为空**

````
type Query{
    hello:String
    test:String!
    number:Int
}
````

如果test定义为String，若没有数据将返回null。
````
{"data":{"hello":"Hello world!","test":null,"num":1}}
````
定义String!，若无数据，将报错：
````
{   "errors":[{
        "message":"Cannot return null for non-nullable field Query.test.","locations":[{"line":1,"column":9}],"path":["test"]
    }],
    "data":null
}
````

## Passing Arguments 传递参数
````
var schema = buildSchema(`
  type Query{
    hello:String
    test:String!
    num(numDice: Int!, numSides: Int):Int
  }
`)
var root = {
  hello: () => {
    return 'Hello world!';
  },
  test: () => {
    return 'test';
  },
  num: (args) => {
    // { numDice: 2, numSides: 3 }
    console.log(args);
    return 1;
  }
};
graphql(schema, '{ hello test num(numDice:2,numSides:3)}', root).then((response) => {
    // {"data":{"hello":"Hello world!","test":"123","num":1}}
});
````

## 使用Express构建GraphQL服务
````
npm install express express-graphql graphql --save
````
app.js
````
var gql1 = require('./graph/test1.js');
var app = express();
app.use('/gql', gql1);
````
graph/test1.js
````
var {
    buildSchema
} = require('graphql');
var graphqlHTTP = require('express-graphql');

let schema = buildSchema(`
type Query{
  hello:String
  test:String!
  num(numDice: Int!, numSides: Int):Int
}
`)
let root = {
    hello: () => {
        return 'Hello world!';
    },
    test: () => {
        return 'test';
    },
    num: (args) => {
        // { numDice: 2, numSides: 3 }
        console.log(args);
        return 1;
    }
};
module.exports = graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
})
````
插件效果：
{% asset_img graphQL-express.png  %}
**express-graphql**会自动解析req.query的参数。当然还可以集成其他中间件Middleware([**Passport**](http://www.passportjs.org/),**express-jwt**,**express-session**)来稳定、扩展这个微服务。

## Mutations and Input Types 根据输入值改变行为
````
let schema = buildSchema(`
# 定义传入对象类型
input MessageInput{
    message:String
}
# 定义Message对象，类似泛型
type Message{
    message:String
}
# 某种行为
type Mutation {
    # 保存传入数据
    setMessage(input: MessageInput): Message
}
# Query必须定义
type Query {
    getMessage: String
}
`)
````
````js
// 定义Message对象
function Message(input) {
    this.message = input.message;
}
// 模拟数据源
var fakeDatabase = {
    message: 'data from DB'
};
var root = {
    // 实现保存数据，返回新Message对象
    setMessage: function (input) {
        // { input: { message: 'abc' } }
        return new Message(input.input);
    },
    getMessage: function () {
        return fakeDatabase.message;
    }
};
````
{% asset_img gql.png  %}

如果没使用express-graph方式：
````
graphql(schema,
    `
    mutation CreateMessage($input: MessageInput) {
        setMessage(input:$input){message}
    
}`, root, {}, {
        input: {
            message: "123"
        }
    },
    "CreateMessage"
).then((response) => {
    console.log(response);
});
````

# Queries and Mutations 查询和转变
## Fields 字段（像是定义一个对象）
在query定义fields，来告诉GraphQL该查询什么数据与之对应。
每个fields有自己的name，和字符串的type（对象中属性）

{% asset_img fields.png %}
````
let schema = buildSchema(`
    type Query{
        hexo:Hexo
    }
    type Hexo{
        name:String,
        age:Int
    }
`)
function Hexo(name, age) {
    this.name = name;
    this.age = age;
}
var root = {
    hexo: () => {
        return new Hexo('abc', 12);
    }
};
````

**注意：**
fields中的属性可以按需定义，但是前提是schema要维护好。在这个前提下，query可以任意增减属性，相当于数据过滤效果
````
query{
  hexo{
    name
    country
  }
}
"message": "Cannot query field \"country\" on type \"Hexo\"."
````
## Arguments 参数
在query定义参数列表，供root解析处理。

{% asset_img arguments.png %}
````
let schema = buildSchema(`
    type Query{
        hexo(id:ID):Hexo
    }
    type Hexo{
        id:ID,
        name:String,
        age:Int
    }
`)
function Hexo(id, name, age) {
    this.id = id;
    this.name = name;
    this.age = age;
}
var root = {
    hexo: ({
        id
    }) => {
        return new Hexo(id, 'abc', 12);
    }
};
````

**注意：**
在query参数列表也要和schema定义一致；同时root中获取传入的参数需要通过**解构**来获取
````
type Query{
    hexo(ids:ID):Hexo
}
"message": "Unknown argument \"id\" on field \"hexo\" of type \"Query\". Did you mean \"ids\"?"
````

## Aliases 别名
query通过类似泛型的说明（不知是否恰当），自定义返回数据的对象字段。
{% asset_img alias.png %}

**注意**
对象，字段属性都是可以起别名的

## Fragments 片段
类似上面那个需求，可能我们都很多复杂的字段，可以通过这种片段的方式简化gql代码。同时fragments又是依托于对象，理解query更为快速
{% asset_img fragment.png %}

## Inline Fragments
query中，行内片段。多用于interface的数据


## Operation name 操作说明
用于**query, mutation, or subscription and describes**，说明本次操作的意图。当然像query，也可以省略operation name（类似匿名查询）。
主要作用，更语义的说明query是干啥的，也在调试服务端时，分析gql logger。
{% asset_img operationName.png %}

## Variables 变量
上些例子，都是在query的fields上配置参数，并且参数是写死的。通常在实际应用上，我们需要动态可变的参数。
可以看下图中$input:
{% asset_img variables.png %}
- 在query中，使用**$variableName**类似占位符一样，定义静态值
- 在query上，声明**$variableName**。
- 维护请求字段variableName，传入数据

**注意**
- 声明参数，**需要用$前缀说明**
- $episode: Episode = JEDI 方式定义输入参数默认值

## Directives 指令
可以制定fields中字段的显示，如果field中某个字段是对象，可以在指令后面继续和field定义字段方式一样，定义属性
````
  hexo(id:$input){
    id
    name
  	friend @skip(if: $ignoreAge){
      id
      name
    }
  }
````
- @include(if: Boolean)  Only include this field in the result if the argument is true
- @skip(if: Boolean) Skip this field if the argument is true.
{% asset_img directives.png %}
**注意**
query上的参数，需要指定**!**

## Mutations 行为改变
GrapQL是查询语句，但是避免不了某些查询会持久化数据或者更改，像crud里面的create，update，delete等情况。为区别query，可以使用mutations，就是体现这种约定。
{% asset_img mutations.png %}
````
let schema = buildSchema(`
    type Hexo{
        id:ID,
        name:String,
        age:Int,
        friend:Hexo
    }
    type Mutation{
        createHexo:Hexo
    }
`)
var root = {
    createHexo: () => {
        return new Hexo(444, 'bbb', 44);
    }
};
````
**注意**
搞清mutation和query区别，通常mutation也有自己的mutation fields。**mutation fields是依次执行，而query的fields是并列**

## Meta fields
query增加**_typename**，将返回schema的type
{% asset_img meta.png %}

# [Schemas and Types](http://graphql.github.io/learn/schema/)
## Type system
这是个简单的query语句，但能看到如下特点：
- 定义一个根对象，如果你隐去query 和 operation name
- 设置一个hexo，当做fields
- 根据查询的数据对象，将包含id、name fields

````
query queryHexo{
  hexo{
    id
    name
  }
}
````
## Object types and fields
在schems中,定义Hexo这样一个type，在Query中会使用到这个type
````
type Hexo{
    id:ID,
    name:String,
    age:Int
}
type Query{
    hexo(id:ID):Hexo
}
````
- **Hexo** GraphQL Object Type
- id,name,age 作为fields，在Type里
- 每个field将对应有scalar types

## Scalar types
fields在解析时，会有对应的类型作为区分。
- Int: A signed 32‐bit integer.
- Float: A signed double-precision floating-point value.
- String: A UTF‐8 character sequence.
- Boolean: true or false.
- ID: The ID scalar type represents a unique identifier, often used to refetch an object or as the key for a cache. The ID type is serialized in the same way as a String; however, defining it as an ID signifies that it is not intended to be human‐readable.

## Enumeration types
枚举类型，有个好处：对于已知的后台枚举数据，可以预先控制
````
enum Action{
    superman,
    people
}
type Hexo{
    id:ID,
    name:String,
    age:Int,
    action:Action
}
````

## Lists and Non-Null
定义数据列表、非空类型
````
type Hexo{
    name:String!,
    friends:[Hexo]
}
````

## Interfaces
了解面向对象，基本知道抽象，实现之类的概念。
这里GraphQL也有这样的思想，如下：
可以定义一个Animal，然后Hexo，People分别对Animal实现，并且扩展，有什么好处？
**在不同查询结果中，可以维护不同的type**，来获取指定的对象数据。
````
type Query{
    hexo(id:ID):People
}
interface Animal{
    id:ID
}
type Hexo implements Animal{
    id:ID,
    name:String,
    age:Int,
    friends:[Hexo]!
}
type People implements Animal{
    id:ID,
    name:String
}
````

## Union types
要疯了已经，因为没有测出来
直接转到下一内容

# 来看下JS实际运用
