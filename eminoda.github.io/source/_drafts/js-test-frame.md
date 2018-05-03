---
title: 前端测试框架
tags: 
  - jasmine
  - mocha
  - karma
  - jest
categories:
  - 前端
  - test
thumb_img: test.png
---

{% asset_img test.png %}
前端已经不是以前引入个jquery，写个css，组成个html，大家嘻嘻哈哈看看玩玩。
现在前端已经工程化，有复杂的构建工具，模块打包器，各种MVC等思想的框架。众多人员迭代着不同的需求，敏捷开发必然会出现错误。后台java等有着一套成熟的unit test模式，当然我们前端也有丰富的测试工具（框架），来完善修正，提前发现我们代码漏洞。

## 以下算是目前比较流程的Test Framework
- [jasmine](https://jasmine.github.io/)
- [mocha](https://mochajs.org/)
- [karma](https://karma-runner.github.io/2.0/index.html)
- [jest](https://facebook.github.io/jest/en/)

## 先来一波欧气对比
{% asset_img jasmine.png %}
{% asset_img mocha.png %}
{% asset_img karma.png %}
{% asset_img jest.png %}

## 了解测试几个概念
### TDD
Test-Driven Development，测试驱动开发。
在编写某个功能的代码之前先编写测试代码，然后只编写使测试通过的功能代码，通过测试来推动整个开发的进行。这有助于编写简洁可用和高质量的代码，并加速开发过程。

### BDD
Behavior Driven Development，行为驱动开发。
是测试驱动开发的延伸。是一种敏捷软件开发的技术。
因为在TDD中，我们并不能完全保证根据设计所编写的测试就是用户所期望的功能。BDD将这一部分简单和自然化，用自然语言来描述，让开发、测试、BA以及客户都能在这个基础上达成一致。因为测试优先的概念并不是每个人都能接受的，可能有人觉得系统太复杂而难以测试，有人认为不存在的东西无法测试。所以，我们在这里试图转换一种观念，那便是考虑它的行为，也就是说它应该如何运行，然后抽象出能达成共识的规范。

## 进一步了解这些框架

## 参考
> https://www.cnblogs.com/ustbwuyi/archive/2012/10/26/2741223.html
> https://www.zhihu.com/question/20161970