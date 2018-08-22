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

# API进阶
## [Schemas and Types](http://graphql.github.io/learn/schema/)
经过我们上面的例子，基本已经了解GraphQL的query方式
````
type Message{
  name:String,
  reads:[String]!
  setMessage(content:String):String,
  setType(type:Episode)
}
enum Episode {
    NEWHOPE
    EMPIRE
    JEDI
}
````
常用 
- GraphQL Object Type: Message
- fields: name、reads
- Lists and Non-Null: String! [String] [String]!
- Scalar types: Int,Float,String,Boolean,ID
- 参数列表(Arguments)：**setMessage(content:String):String**
- Enumeration types：Episode

还能和其他对象语言一样，支持接口方式**Interfaces**
````
interface Character {
  id: ID!
  name: String!
  friends: [Character]
  appearsIn: [Episode]!
}
type Human implements Character {
  id: ID!
  name: String!
  friends: [Character]
  appearsIn: [Episode]!
  starships: [Starship]
  totalCredits: Int
}
````

唯一值**Union types**
````
union SearchResult = Human | Droid | Starship
{
  search(text: "an") {
    ... on Human {
      name
      height
    }
    ... on Droid {
      name
      primaryFunction
    }
    ... on Starship {
      name
      length
    }
  }
}
````

输入值类型Input types：多用于Mutation传值
