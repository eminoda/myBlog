---
title: 数据库日期类型在 sequelize 的使用
tags: sequelize
categories:
  - 开发
  - 前端开发
date: 2020-11-15 17:23:38
---

# 前言

对于前端虽说有 Node.js 加持，能胜任多平台的产品开发，但因为不是主攻后端，一些数据库知识点偏弱，加上使用 sequelize 等库开箱即用的 api，使得某些细节处理不当很容易导致一些问题。

这篇就谈谈时间（时区）相关的概念，数据库中日期类型，以及结合 sequelize 的实际使用心得。

# 几种时间约定

## GMT 格林威治标准时间

> 格林尼治平均时间（Greenwich Mean Time，GMT）是指位于英国伦敦郊区的皇家格林尼治天文台当地的平太阳时，因为本初子午线被定义为通过那里的经线。

为了形象理解，找了张时区的地理图：

{% asset_img timezone.jpg %}

能看到整个地球被划分为 24 个时区，以本初子午线为分割点（0 时区），以左为西时区，以右为东时区，我国为东 8 区。

```js
new Date()
Sun Nov 15 2020 09:00:00 GMT+0800 (中国标准时间)
```

## UTC 协调世界时

> 以原子时秒长为基础，在时刻上尽量接近于世界时的一种时间计量系统。**比 GMT 更为精确**。

```js
// 返回协调世界时（UTC）相对于当前时区的时间差值，单位为分钟。
const offsetZone = new Date().getTimezoneOffset() / 60; // -8
new Date().toUTCString(); // "Sun, 15 Nov 2020 01:00:00 GMT"
```

## ISO 8601

> 国际标准 ISO 8601，是国际标准化组织的日期和时间的表示方法，全称为《数据存储和交换形式·信息交换·日期和时间的表示方法》。

格式：**YYYY-MM-DDTHH:mm:ss.sssZ**

```js
new Date().toISOString(); // "2020-11-15T01:00:00.000Z"
```

# 数据库中的日期类型

先看下数据库有日期类型，以及他们的特点：

| 类型      | 长度    | 日期格式            | 日期范围                                  | 特殊                                |
| --------- | ------- | ------------------- | ----------------------------------------- | ----------------------------------- |
| DATETIME  | 8 bytes | YYYY-MM-DD HH:MM:SS | 1000-01-01 00:00:00 ~ 9999-12-31 23:59:59 | 不涉及时区（依照数据源原样存储）    |
| TIMESTAMP | 4 bytes | YYYY-MM-DD HH:MM:SS | 19700101080001~20380119111407             | 涉及时区（将当地时间转为 UTC 储存） |
| TIME      | 3 bytes | HH:MM:SS            | -838:59:59~838:59:59                      | -                                   |
| DATE      | 3 bytes | YYYY-MM-DD          | 1000-01-01 ~ 9999-12-31                   | -                                   |
| YEAR      | 1 bytes | YYYY                | 1901 ~ 2155                               | -                                   |

能看到对 **DATETIME** 和 **TIMESTAMP** 做了特殊说明，他们两者在和 **sequelize** 一起使用时必然会遇到些问题，下面通过一个例子来说明。

# sequelize 中的日期类型

## Demo

首先创建 **time_diff** 表，创建不同的日期类型字段：

```js
+-------------+-------------+------+-----+---------+----------+
| Field       | Type        | Null | Key | Default | Extra    |
+-------------+-------------+------+-----+---------+----------+
| source_time | varchar(60) | YES  |     | NULL    |          |
| t_date      | date        | YES  |     | NULL    |          |
| t_datetime  | datetime    | YES  |     | NULL    |          |
| t_timestamp | timestamp   | YES  |     | NULL    |          |
+-------------+-------------+------+-----+---------+----------+
```

然后通过 **Model.create** 往该表插入一条数据（每列赋值均为 **new Date** ）

```js
// 模型定义
const TimeDiff = sequelize.define(
  'TimeDiff',
  {
    sourceTime: DataTypes.STRING,
    tDate: DataTypes.DATE,
    tDatetime: DataTypes.DATE,
    tTimestamp: DataTypes.DATE,
  },
  {
    freezeTableName: true,
    tableName: 'time_diff',
    timestamps: false,
    underscored: true,
  }
);

const time = new Date();
console.log('time', time);

// 新增记录
TimeDiff.create({
  sourceTime: time.toString(),
  tDate: time,
  tDatetime: time,
  tTimestamp: time,
});
```

结果能看到虽然在 sequelize 中对每列的值设置都一样,但实际却不同:

```
+-----------------------------------------------+------------+---------------------+---------------------+
| source_time                                   | t_date     | t_datetime          | t_timestamp         |
+-----------------------------------------------+------------+---------------------+---------------------+
| Mon Nov 09 2020 21:25:32 GMT+0800 (GMT+08:00) | 2020-11-09 | 2020-11-09 13:25:32 | 2020-11-09 21:25:32 |
+-----------------------------------------------+------------+---------------------+---------------------+
```

能看到 **t_date** 只展示了年月日 **YYYY-MM-DD** ， **t_datetime** 和 **t_timestamp** 虽然日期格式都为 **YYYY-MM-DD HH:mm:ss** ，但之间相差 8 小时，那怎么将他们入库时时区相同呢？

## 时区设置

那就要在 sequelize 设置制定时区了：

```js
const config = {
  database: 'ebone',
  username: 'root',
  password: 'root',
};

const options = {
  host: '127.0.0.1',
  dialect: 'mysql',
  timezone: '+08:00', // 时区设置
};

const sequelize = new Sequelize(config.database, config.username, config.password, options);
```

设置完毕后，我们再插入一条数据将发现这两个字段时区相同了：

```
+-----------------------------------------------+------------+---------------------+---------------------+
| source_time                                   | t_date     | t_datetime          | t_timestamp         |
+-----------------------------------------------+------------+---------------------+---------------------+
| Mon Nov 09 2020 21:25:32 GMT+0800 (GMT+08:00) | 2020-11-09 | 2020-11-09 13:25:32 | 2020-11-09 21:25:32 |
| Mon Nov 09 2020 21:37:20 GMT+0800 (GMT+08:00) | 2020-11-09 | 2020-11-09 21:37:20 | 2020-11-09 21:37:20 |
+-----------------------------------------------+------------+---------------------+---------------------+
```

## 查询的“不同”

除了插入行数据，当我们查询记录时，能看到更有意思的现象（**不设置 sequelize 时区选项**）：

```js
TimeDiff.findAll({
  raw: true,
}).then((data) => {
  console.log(data);
});
```

```js
[
  // 未设置时区时，新增的数据
  {
    sourceTime: 'Mon Nov 09 2020 21:25:32 GMT+0800 (GMT+08:00)',
    tDate: '2020-11-09',
    tDatetime: '2020-11-09T13:25:32.000Z', // ？？？
    tTimestamp: '2020-11-09T13:25:32.000Z',
  },
  // 已设置时区时，新增的数据
  {
    sourceTime: 'Mon Nov 09 2020 21:37:20 GMT+0800 (GMT+08:00)',
    tDate: '2020-11-09',
    tDatetime: '2020-11-09T21:37:20.000Z', // ？？？
    tTimestamp: '2020-11-09T13:37:20.000Z',
  },
];
```

先熟悉下 iso 规范的时间，实际本地时间是多少？

```js
const moment = require('moment');
const isoDate = '2020-11-09T13:25:32.000Z';

moment(isoDate).format('YYYY-MM-DD HH:mm:hh'); //2020-11-09 21:25:09
```

能看到通过 sequelize 查询到的这两条数据有这三个特点：

1. **sequelize** 帮我们把 **tDatetime** 和 **tTimestamp** 统一为 iso 时间格式（UTC）
2. 对 **DateTime** 类型的字段会将实际落库值直接转为 UTC 时间
3. 对 **Timestamp** 类型的字段会考虑时区的不同

而当我们 **sequelize** 设置时区（+8:00）后，看下取值的结果：

```js
[
  {
    sourceTime: 'Mon Nov 09 2020 21:25:32 GMT+0800 (GMT+08:00)',
    tDate: '2020-11-09',
    tDatetime: '2020-11-09T05:25:32.000Z',
    tTimestamp: '2020-11-09T13:25:32.000Z',
  },
  {
    sourceTime: 'Mon Nov 09 2020 21:37:20 GMT+0800 (GMT+08:00)',
    tDate: '2020-11-09',
    tDatetime: '2020-11-09T13:37:20.000Z',
    tTimestamp: '2020-11-09T13:37:20.000Z',
  },
];
```

TimeStamp 结果不变，而对 Datetime 类型的字段做了对应的转换（而非直接取出）

# 为何会有这样的不同呢？

## 插入

我们设置时间类型的字段都会通过 **sequelize** 进行转义，并进入 **\_applyTimezone** 方法。如果我们没有设置过时区，默认时区为 +00:00（options.timezone 判断非空）：

```js
class DATE extends ABSTRACT {
  _applyTimezone(date, options) {
    if (options.timezone) {
      if (momentTz.tz.zone(options.timezone)) {
        return momentTz(date).tz(options.timezone);
      }
      // moment(date).utcOffset('+00:00')
      return (date = moment(date).utcOffset(options.timezone));
    }
    return momentTz(date);
  }
}
```

而 **utcOffset** 起什么作用呢？首先看下默认情况下 **utcOffset** （不设置参数时），utc 时区的偏移量：

```js
moment().utcOffset(); // 480(480/60=8小时) +08:00
```

**当未设置时区时（+00:00）:**

如果设置 **2020-11-09 21:25:32** 值时，通过 **utcOffset(+00:00)** 方法偏移后，对于 DateTime 将落库 **2020-11-09 13:25:32**；

由于数据库 mysql 设置的时区为本地时间，实际落库为 **2020-11-09 13:25:32** 多加 8 小时，最终为：**2020-11-09 21:25:32**

**当设置时区时（+08:00）：**

通过 **utcOffset(+08:00)** 方法偏移后，值还为 **2020-11-09 21:25:32**，DateTime 将会比之前多 8 小时；

由于和 mysql 时区一致，对于 **TimeStamp** 的落库值为：**2020-11-09 21:25:32**

## 查询

通过 **seqeulize** 从 **mysql** 查询时，会对取到结果进行解析，对于 **DateTime** 类型的字段会执行 **parse** 方法：

```js
// Datetime
// sequelize\lib\dialects\mysql\data-types.js
class DATE extends BaseTypes.DATE {
  // 2020-11-09 13:25:32
  static parse(value, options) {
    value = value.string();
    // ...
    if (moment.tz.zone(options.timezone)) {
      value = moment.tz(value, options.timezone).toDate();
    } else {
      // new Date("2020-11-09 13:25:32 +08:00")
      value = new Date(`${value} ${options.timezone}`);
    }
    return value;
  }
}
```

如果我们设置了 **options.timezone** ，则会在最后添加时区值。

对于 **Timestamp** 类型，会选择 **mysql2** 模块内置的方法进行解析：

```js
// mysql2\lib\parsers\text_parser.js
function readCodeFor(type, charset, encodingExpr, config, options) {
  // ...
  switch (type) {
    //...
    case Types.DATE:
      // ...
      return `packet.parseDate('${timezone}')`;
    case Types.DATETIME:
    case Types.TIMESTAMP:
      if (helpers.typeMatch(type, dateStrings, Types)) {
        return 'packet.readLengthCodedString("ascii")';
      }
      return `packet.parseDateTime('${timezone}')`;
    case Types.TIME:
      return 'packet.readLengthCodedString("ascii")';
  }
}
```

```js
// mysql2\lib\packets\packet.js
class Packet {
  // ...
  // +08:00
  parseDateTime(timezone) {
    // 2020-11-09 21:25:32
    const str = this.readLengthCodedString('binary');
    if (str === null) {
      return null;
    }
    if (!timezone || timezone === 'local') {
      return new Date(str);
    }
    // new Date("2020-11-09 21:25:32+08:00")
    return new Date(`${str}${timezone}`);
  }
}
```

对于上述两种类型选择对应解析方法都功能都是相同的，那为何会有上面查询出结果“不同”的现象？原因还是 **DateTime，TimeStamp 和时区的关系**。

我们以这条记录，在不同时区设置的查询结果进行分析：

```
+-----------------------------------------------+------------+---------------------+---------------------+
| source_time                                   | t_date     | t_datetime          | t_timestamp         |
+-----------------------------------------------+------------+---------------------+---------------------+
| Mon Nov 09 2020 21:25:32 GMT+0800 (GMT+08:00) | 2020-11-09 | 2020-11-09 13:25:32 | 2020-11-09 21:25:32 |
+-----------------------------------------------+------------+---------------------+---------------------+
```

**当没有设置过时区（+00:00）时：**

如果 **DateTime** 库值为 **2020-11-09 13:25:32**，最终通过 parse 方法，将返回 new Date('2020-11-09 13:25:32+00:00')，转为 iso 格式，即为：**2020-11-09T13:25:32.000Z**；

如果 **TimeStamp** 库值为 **2020-11-09 21:25:32**，由于时区不一致，首先 mysql 会根据时区转为 UTC 时间（少 8 小时）为：**2020-11-09 13:25:32**，再进行解析，最终和上面的 **DateTime** 类型的结果一样。

**sequelize** 插叙查询结果如下：

```js
{
  sourceTime: 'Mon Nov 09 2020 21:25:32 GMT+0800 (GMT+08:00)',
  tDate: '2020-11-09',
  tDatetime: '2020-11-09T13:25:32.000Z', // ？？？
  tTimestamp: '2020-11-09T13:25:32.000Z',
}
```

**而当设置时区后（+08:00）后：**

**DateTime** 类型，对应返回 new Date('2020-11-09 13:25:32+08:00')，转为 iso 格式，即为：**2020-11-09T05:25:32.000Z**；

而由于 **sequelize** 和 **mysql** 时区一致，TimeStamp 取出的值直接为：**2020-11-09 21:25:32**，在通过 iso 转换，则为：**2020-11-09T13:25:32.000Z**。

```js
{
  sourceTime: 'Mon Nov 09 2020 21:25:32 GMT+0800 (GMT+08:00)',
  tDate: '2020-11-09',
  tDatetime: '2020-11-09T05:25:32.000Z',
  tTimestamp: '2020-11-09T13:25:32.000Z',
},
```

# 总结

因为时区涉及数据库 和 sequelize 的设置，同时对于不同时区的客户端解析 ISO 格式时间也会不同，所以有几个最佳实践：

- 对 DateTime 类型的字段要小心处理
- sequelize 的时区设置要和数据库保持一致
- 服务端相关时间做好服务端解析后，再输出给客户端，减少客户端对时间的操作

## 参考

https://dev.mysql.com/doc/refman/8.0/en/datetime.html
