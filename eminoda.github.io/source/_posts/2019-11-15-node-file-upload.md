---
title: node 文件上传
tags:
  - node
categories:
  - 开发
  - 前端开发
thumb_img: node.png
date: 2019-11-15 14:47:17
---


# 前言

文件上传一个基础服务端功能，比如：上传一张用户头像。

由于我自己 node api 使用的不多，借这个“文件上传”功能，来了解 node 服务端如何接收客户端的文件，然后存储到服务器上，完成整个功能。

# 文件上传

先看下流程图：

{% asset_img upload-order.png %}

通常会有两种简单的场景：

- 客户端上传图片，服务端解析后，保存在当前服务器，回告客户端，整个流程结束。
- 可能还会有其他服务器需要这个上传文件，这时就涉及两个服务端之间的上传通讯过程。

下面按照这两个场景，分步看下实际怎么处理：

## 解析客户端请求

必须要提前说的是，浏览器端通常需要通过 form 表单组件来触发上传文件弹框的 **激活**。上传图片的 ajax 还需要添加特定的请求头：**multipart/form-data** 。

这里使用 **formidable** 这个工具模块，来解析来自客户端 request 中的上传文件，毕竟我们自己写代码解析太麻烦了。

```js
const formidable = require("formidable");
module.exports = async (ctx, next) => {
  let form = new formidable.IncomingForm();
  let fileUploadPath = await new Promise(function(resolve, reject) {
    form.parse(ctx.req, function(err, fields, files) {
      if (err) {
        throw err;
      } else {
        // picFile 是上传文件的 key
        if (files && files.picFile) {
          // 保存到服务器
          util
            .saveFile(files.picFile)
            .then(data => {
              resolve(data);
            })
            .catch(err => {
              reject(err);
            });
        } else {
          throw new Error("...");
        }
      }
    });
  });
};
```

借助 formidable ，整个请求流的解析还是很方便的。通过 form.parse 就能帮我们拿到上传的资源文件 file 对象，然后我们可以进行下步“文件落地”的操作。

## 通过 fs 实现文件落地

这里简单说下 fs 如何保存 file ，当然如果你比较熟悉 node 的话，可以选择性的跳过。

```js
function saveFile(file) {
  return new Promise((resolve, reject) => {
    try {
      // 读取文件
      fs.readFile(file.path, function(err, data) {
        if (err) {
          reject(err);
          return;
        }
        // 简单的判断文件后缀
        let ext = file.name.match(/\.(?:[a-zA-Z]+$)/);
        if (!ext) {
          resolve(new Error("文件后缀不正确"));
          return;
        }
        // 给文件去个新名字，并写到服务器的资源文件路径
        let tempFileName = new Date().getTime() + ext;
        let tempUploadDir = path.resolve(process.env.UPLOAD_DIR, tempFileName);
        fs.writeFile(tempUploadDir, data, function(err) {
          if (err) {
            reject(err);
            return;
          }
          resolve(tempUploadDir);
        });
      });
    } catch (err) {
      reject(err);
    }
  });
}
```

因为服务器的资源处理会比较重要，上例中只是简单的示例如何保存上传资源。实际操作中，需要对上传文件的后缀、大小、以及定期控制文件夹文件数量等有个更为严格的处理。

以防止服务器被攻击等情况的发生。

## 重写 node 请求，发送给后端

一般情况，我们完成上述两个步骤，基本文件上传的整个流程结束了。但可能 node 服务端只是个中间层，真正的资源落地需要在业务后端存储，这时就需要把上面存在中间层的资源，再次发到后端服务。

这里用到了 **form-data** 模块，来模拟类似浏览器 form 的提交信息。

```js
const FormData = require("form-data");

router.post('/upload', async (ctx, next) => {
    let formData = new FormData();
    formData.append("picFile", fs.createReadStream(tempUploadDir));

    let respData = await yourAxios().request({
        url: ctx.path,
        method: ctx.method,
        data: formData,
        headers: {
            "Content-Type": `multipart/form-data; boundary=${formData._boundary}`
        }
    });
    ctx.body = respData;
}

```

拿到在中间层存储的文件路径，通过 fs 转成 ReadStream 并构造成一个 formData。再通过 axios 等 http 服务工具发送给后端服务。

当然整个请求的 header 和 data 需要符合后端的接收标准（下图，举个例子）：

{% asset_img http-upload.png %}

# 总结

上述是一个较为完整的文件上传说明，希望对此类有问题的同学能有启发作用。
