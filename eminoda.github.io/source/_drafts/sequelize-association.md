---
title: sequelize-association
tags:
---

## nodejs.SequelizeEagerLoadingError: bookTag is not associated to book!

需要设置对象之间的关联

## Unknown column 'bookTag.id' in 'field list'

```
"SELECT `book`.`id`, `book`.`id` AS `Id`, `book`.`name` AS `Name`, `book`.`click_volume` AS `ClickVolume`, `book`.`score` AS `Score`, `book`.`public_date` AS `PublicDate`, `book`.`score_index` AS `ScoreIndex`, `bookTag`.`id` AS `bookTag.id`, `bookTag`.`tag_id` AS `bookTag.tag_id`, `bookTag`.`book_id` AS `bookTag.book_id`, `bookTag`.`book_id` AS `bookTag.bookId` FROM `t_book` AS `book` LEFT OUTER JOIN `t_book_tag` AS `bookTag` ON
`book`.`id` = `bookTag`.`book_id` LIMIT 10;"
```

指定主建 primaryKey: true

```
tag_id: {
    type: BIGINT(20),
    primaryKey: true
}
```

## source&target

## hasOne

```
SELECT `book`.`id` AS `Id`, `book`.`name` AS `Name`, `book`.`click_volume` AS `ClickVolume`, `book`.`score` AS `Score`, `book`.`public_date` AS `PublicDate`, `book`.`score_index` AS `ScoreIndex`, `bookTag`.`tag_id` AS `bookTag.tag_id`, `bookTag`.`book_id` AS `bookTag.book_id`, `bookTag`.`book_id` AS `bookTag.bookId` FROM `t_book` AS `book` LEFT OUTER JOIN `t_book_tag` AS `bookTag` ON `book`.`id` = `bookTag`.`book_id` LIMIT 10;
```

sourceModel.hasOne(targetModel)

targetModel 内涵 source_id

## belongsTo

关联别人

```
"SELECT `book`.`id` AS `Id`, `book`.`name` AS `Name`, `book`.`click_volume` AS `ClickVolume`, `book`.`score` AS `Score`, `book`.`public_date` AS `PublicDate`, `book`.`score_index` AS `ScoreIndex`, `book`.`book_tag_tag_id` AS `bookTagTagId`, `bookTag`.`tag_id` AS `bookTag.tag_id`, `bookTag`.`book_id` AS `bookTag.book_id` FROM `t_book` AS `book` LEFT OUTER JOIN `t_book_tag` AS `bookTag` ON `book`.`book_tag_tag_id` = `bookTag`.`tag_id` LIMIT 10;"
```

sourceModel.belongsTo(targetModel)

sourceModel 会拿 source_target_id 和 target_id 做关联

## hasOne

属于别人的一个

```
SELECT `book`.`id` AS `Id`, `book`.`name` AS `Name`, `book`.`click_volume` AS `ClickVolume`, `book`.`score` AS `Score`, `book`.`public_date` AS `PublicDate`, `book`.`score_index` AS `ScoreIndex`, `bookTag`.`tag_id` AS `bookTag.tag_id`, `bookTag`.`book_id` AS `bookTag.book_id`, `bookTag`.`book_id` AS `bookTag.bookId` FROM `t_book` AS `book` LEFT OUTER JOIN `t_book_tag` AS `bookTag` ON `book`.`id` = `bookTag`.`book_id` LIMIT 10;
```

## include unexpected. Element has to be either a Model, an Association or an object.

include 中的 model 可能非法

## Unknown column 'tags->t_book_tag.created_at' in 'field list'

```
"SELECT `book`.*, `tags`.`id` AS `tags.id`, `tags`.`id` AS `tags.Id`, `tags`.`name` AS `tags.Name`, `tags->t_book_tag`.`created_at` AS `tags.t_book_tag.createdAt`, `tags->t_book_tag`.`updated_at` AS `tags.t_book_tag.updatedAt`, `tags->t_book_tag`.`tag_id` AS `tags.t_book_tag.tag_id`, `tags->t_book_tag`.`book_id` AS `tags.t_book_tag.book_id` FROM (SELECT `book`.`id` AS `Id`, `book`.`name` AS `Name`, `book`.`click_volume` AS `ClickVolume`, `book`.`score` AS `Score`, `book`.`public_date` AS `PublicDate`, `book`.`score_index` AS `ScoreIndex` FROM `t_book` AS `book` LIMIT 10) AS `book` LEFT OUTER JOIN ( `t_book_tag` AS `tags->t_book_tag` INNER JOIN
`t_tag` AS `tags` ON `tags`.`id` = `tags->t_book_tag`.`book_id`) ON `book`.`Id` = `tags->t_book_tag`.`tag_id`;"
```

```
SELECT `book`.*, 
`tags`.`id` AS `tags.Id`, `tags`.`name` AS `tags.Name`, 

`tags->t_book_tag`.`tag_id` AS `tags.t_book_tag.tag_id`, `tags->t_book_tag`.`book_id` AS `tags.t_book_tag.book_id` 

FROM

 (SELECT `book`.`id` AS `Id`, `book`.`name` AS `Name`, `book`.`click_volume` AS `ClickVolume`, `book`.`score` AS `Score`, `book`.`public_date` AS `PublicDate`, `book`.`score_index` AS `ScoreIndex` FROM `t_book` AS `book` LIMIT 10) 
 
 AS `book` 
 
 LEFT OUTER JOIN 
 
 ( `t_book_tag` AS `tags->t_book_tag` INNER JOIN `t_tag` AS `tags` ON `tags`.`id` = `tags->t_book_tag`.`book_id`) 
 
 ON `book`.`Id` = `tags->t_book_tag`.`tag_id`;
```
