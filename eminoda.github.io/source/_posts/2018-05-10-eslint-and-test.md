---
title: 代码QA检查和单元测试
tags: eslint
categories:
  - 开发
  - 工程化
thumb_img: balance.jpg
date: 2018-05-10 17:24:09
---


## 质量检查和测试都需要吗？
答案是：两个都要兼得。

项目都是以团队为单位开发，每个人编写的风格不同，技能掌握程度不一致，代码质量更是千差万别。不可避免会造成项目管理上的不可控。
所以必须要引入代码质量规则来监督。

同时需求迭代一多，功能一复杂，敏捷开发没完没了，谁能断言自己的代码没有bug。
另外，如果高层不看重测试，还是进行**人肉测试**，那又能发现多少潜在问题？

关于[如何进行质量检查，请参阅](/2018/05/09/js-project-check/)，使用工具集成到项目中，不用在担心手滑，粗心造成的bug。
同样在前端，不是因为难以测试而不去集成考虑单元测试，甚至e2e方面的测试。这方面的好处，java等后端语言提现的淋漓尽致。

## 这里举个例子

````
var should = require('should')
var needTest = function (status) {
    var defaultValue;
    if (status) {
        defaultValue = 'something happen'
        return defaultValue
    }
    // 有个bug
    return defaultValue.indexOf(1)
}
describe('needTest', function () {
    describe('status=true', function () {
        it('should return something happen', function () {
            should.equal(needTest(true), 'something happen')
        })
    })
    describe('status=false', function () {
        it('should return -1', function () {
            should.equal(needTest(false), '-1')
        })
    })
})
````
我们编写了一个needTest方法，tdd嘛，测试驱动开发，所以针对条件写了2个用例。
符合预期，检查出了一个bug，由于defaultValue么有定义。
{% asset_img demo.png %}

但如果我们使用了eslint，在我们编写needTest的时候就会提示代码错误，就可以提前预防这个error的发生。
{% asset_img eslint.png %}

这个例子主要为了说明，这两者在一起不是增加的开发人员的劳动力和负担。
相反，QA可以从侧面减少测试编写的压力；测试可以补充QA没有发现的问题。
为了让今后的代码更**健康**，我们更无忧无虑，那就赶紧上吧。