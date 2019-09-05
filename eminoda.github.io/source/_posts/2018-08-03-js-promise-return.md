---
title: prmoise 返回遇到个问题
tags:
  - js
categories:
  - 开发
  - 前端开发
no_sketch: true
date: 2018-08-03 23:37:36
---

## new Promise 如何 return Promise

```js
test('book>>saveBook', () => {
  expect.assertions(1);
  return spiderService.getBookBasicInfo().then(data => {
    expect(data).not.toBeNull();
  });
});
```

在用 Jest 时候，发现无论怎么设置 timeout 总是超时，然后发现如下代码是有问题的：

```js
getBookBasicInfo: function () {
    // create new Promise
    return new Promise((resolve, reject) => {
        spider
            .end((err, res) => {
                if (!err) {
                    // some code
                    ...
                    // return Promise,这段有问题
                    return bookService.saveBook(books);
                } else {
                    reject(err);
                }
            });
    });
}
```

其实应该把 **bookService.saveBook(books)** 获取到 promise 的 resolve 和 reject,给新的 Promise 使用

```js
getBookBasicInfo: function () {
    return new Promise((resolve, reject) => {
        spider
            .end((err, res) => {
                if (!err) {
                    // some code
                    ...
                    // here is right
                    bookService.saveBook(books).then(data => {
                        resolve(data);
                    }).catch(err => {
                        reject(err);
                    })
                } else {
                    logger.error(err);
                    reject(err);
                }
            });
    });
}
```
