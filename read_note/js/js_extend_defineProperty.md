---
js扩展--defineProperty使用场景
---

# defineProperty

用于定义 Object 上属性类型（数据属性、访问属性），可以看下 [js 基础--面向对象 1.描述对象属性的属性特征](https://github.com/eminoda/myBlog/issues/2)

看 Vue 代码，很好奇 Vue.config 是怎么和 src\core\config.js 做关联的。其实就用了这个 API :grinning:

```js
const configDef = {};
configDef.get = () => config;
if (process.env.NODE_ENV !== "production") {
  configDef.set = () => {
    warn(
      "Do not replace the Vue.config object, set individual fields instead."
    );
  };
}
Object.defineProperty(Vue, "config", configDef);
```

再结合一个简单 Demo，就能体会到其中含义

```js
var config = {
  version: "0.0.1",
  performance: false
};
var configDef = {};
configDef.get = function() {
  return config;
};
// 定义对象
var user = {};
// 挂在一个config属性，并具备getter能力
Object.defineProperty(user, "config", configDef);

console.log(user.config); //{version: "0.0.1", performance: false}
```
