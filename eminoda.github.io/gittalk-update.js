const fs = require("fs");
const path = require("path");
const axios = require("axios");
const md5 = require("blueimp-md5");
const yaml = require("yaml-js");
const github = {
    token: "",
    clientID: "f5e934819613a06d3a38",
    clientSecret: "f9ff1926fed5174d6f6e438e5e37dd5341af81fe",
    owner: "eminoda",
    repo: "eminoda.github.io",
};
const ISSUES_API =
    "https://api.github.com/repos/" +
    github.owner +
    "/" +
    github.repo +
    "/issues";
const POST_DIR = path.join(__dirname, "/source/_posts");
const { split } = require("hexo-front-matter");
const { resolve } = require("path");

const lazyTimer = (fn) => {
    return new Promise((resolve, reject) => {
        setTimeout(async () => {
            await fn();
            resolve();
        }, 2);
    });
};
const createIssues = async ({ title, id, filePath }) => {
    const errMsg = [];
    try {
        const { data: issues } = await axios.get(ISSUES_API, {
            params: { labels: ["Gitalk", id].join(",") },
            headers: {
                Authorization: "token " + github.token,
            },
        });
        if (!issues || issues.length == 0) {
            console.log(filePath, "正在创建 issues ...");
            try {
                await axios.post(
                    ISSUES_API,
                    {
                        body:
                            "🚀 " +
                            "location.href" +
                            "\n\n欢迎通过 issues 留言 ，互相交流学习😊",
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

fs.readdirSync(POST_DIR).forEach((item) => {
    const filePath = path.join(POST_DIR, item);
    const stat = fs.statSync(filePath);
    if (stat && !stat.isDirectory()) {
        const str = fs.readFileSync(filePath).toString();
        const yamlStr = str.split("---")[1];
        if (yamlStr) {
            const title = yaml.load(yamlStr).title;
            const id = md5(
                "/" +
                item.slice(0, 10).replace(/-/g, "/") +
                "/" +
                item.slice(11).split(".md")[0] +
                "/"
            );
            pFn.push((next) => {
                lazyTimer(async () => {
                    await createIssues({ title, id, filePath });
                    next();
                });
            });
            // pFn.push(createIssues({ title, id, filePath }));
        }
    }
});

function compose (pFns) {
    return function (next) {
        let index = -1;
        return dispatch(0);
        function dispatch (i) {
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

// compose(pFn)(() => {
//     console.log("over");
// });

axios.get(ISSUES_API, {
    params: {
        per_page: 100,
    },
    headers: {
        // Authorization: "token " + github.token,
        Accept: 'application/vnd.github.v3+json"'
    },
}).then(resp => {
    const { title, id, number } = resp.data[0]
    console.log({ title, id, number })

    axios.delete(ISSUES_API + "/" + id, {
        params: {
            owner: github.owner,
            repo: github.repo,
        },
    }).then(data => {
        console.log(data)
    })
})
