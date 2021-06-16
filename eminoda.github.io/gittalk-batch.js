// https://blog.jijian.link/2020-01-10/hexo-gitalk-auto-init/
// 模块
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const md5 = require("blueimp-md5");
const yaml = require("yaml-js");

// github 配置
const github = {
  token: "", // 创建 Personal access tokens 得到
  clientID: "f5e934819613a06d3a38",
  clientSecret: "f9ff1926fed5174d6f6e438e5e37dd5341af81fe",
  owner: "eminoda",
  repo: "eminoda.github.io",
};
const ISSUES_API = "https://api.github.com/repos/" + github.owner + "/" + github.repo + "/issues";
const POST_DIR = path.join(__dirname, "/source/_posts");

// 针对 Rate Limiting 限速问题（目前没用）
const lazyTimer = (fn) => {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      await fn();
      resolve();
    }, 0);
  });
};

// 初始化创建 Issues
const createIssues = async ({ title, id, filePath, hrefTitle }) => {
  const errMsg = [];
  try {
    // 是否初始化过
    const { data: issues } = await axios.get(ISSUES_API, {
      params: { labels: ["Gitalk", id].join(",") },
      headers: {
        Authorization: "token " + github.token,
      },
    });
    if (!issues || issues.length == 0) {
      console.log(filePath, "正在创建 issues ...");
      try {
        // 开始初始化
        await axios.post(
          ISSUES_API,
          {
            body: "🚀 " + "https://eminoda.github.io" + hrefTitle + "\n\n欢迎通过 issues 留言 ，互相交流学习😊",
            labels: ["Gitalk", id],
            title,
          },
          {
            headers: {
              Authorization: "token " + github.token,
            },
          }
        );
        console.log(filePath, "创建完毕");
      } catch (err) {
        console.log(filePath, "创建失败");
        errMsg.push({ filePath, msg: "生成 issues 错误", err });
      }
    } else {
      console.log(filePath, "已存在");
    }
  } catch (err) {
    console.log(filePath, "查询失败");
    errMsg.push({ filePath, msg: "新建 issues 错误", err });
  }
  return errMsg;
};

const pFn = [];

// 遍历 post 文件夹，判断有多少文章需要创建评论模块
fs.readdirSync(POST_DIR).forEach((item) => {
  const filePath = path.join(POST_DIR, item);
  const stat = fs.statSync(filePath);
  if (stat && !stat.isDirectory()) {
    const str = fs.readFileSync(filePath).toString();
    const yamlStr = str.split("---")[1];
    if (yamlStr) {
      const title = yaml.load(yamlStr).title;
      const hrefTitle = "/" + item.slice(0, 10).replace(/-/g, "/") + "/" + item.slice(11).split(".md")[0] + "/";
      const id = md5(hrefTitle);
      pFn.push((next) => {
        lazyTimer(async () => {
          await createIssues({ title, id, filePath, hrefTitle });
          next();
        });
      });
      // pFn.push(createIssues({ title, id, filePath }));
    }
  }
});

// 依次发送请求，copy koa-compose
function compose(pFns) {
  return function (next) {
    let index = -1;
    return dispatch(0);
    function dispatch(i) {
      index = i;
      let fn = pFns[i];
      // 最后次
      if (i == pFns.length) fn = next;
      if (!fn) return Promise.resolve();
      try {
        return Promise.resolve(fn(dispatch.bind(null, i + 1)));
      } catch (err) {
        return Promise.reject(err);
      }
    }
  };
}

compose(pFn)(() => {
  console.log("over");
});
