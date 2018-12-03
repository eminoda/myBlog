---
node基础——npm install --save-dev 和 --save 的区别
---

在 npm 社区，经常能看到如下命令：

```
npm install --save-dev webpack
npm install --save vue
```

那--save-dev 和 --save 有什么区别？

1. package 中所处的位置不同

   - npm install foo --save-dev （-D 缩写）package 将安装在 devDependencies 中
   - npm install foo --save （-S 缩写）package 将安装在 dependencies 中

   ```js
   "dependencies": {
       "accepts": "^1.3.5",
       "koa": "^2.6.1",
       "koa-bodyparser": "^4.2.1",
       "koa-compose": "^4.1.0",
       "koa-router": "^7.4.0"
   },
   "devDependencies": {
       "supervisor": "^0.12.0",
       "webpack": "^4.23.1",
       "webpack-dev-server": "^3.1.10"
   }
   ```

2. 对于 production 环境，可以选择安装 dependencies 的依赖

   ```
   # 不会下载devDependencies的package
   npm install --production
   ```
