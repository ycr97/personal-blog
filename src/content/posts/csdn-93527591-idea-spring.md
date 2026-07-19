---
author: "ycr97"
pubDatetime: 2019-06-24T00:00:00+08:00
title: "IDEA创建Spring项目"
draft: false
tags: ["Spring","IDEA"]
category: "工具与运维"
description: "使用IDEA创建Spring项目 1.新建Module 2.新建目录 在Module目录下新建lib目录和resources目录,lib目录用于存放依赖jar包,resources目录用于存放Spring配置文件 3.设置目录属性 4.设置依赖jar包 将spring-core,spring-beans拷入lib目录下,并且在Project Struc..."
---

### 使用IDEA创建Spring项目
#### 1.新建Module
![新建Module](/personal-blog/images/csdn/93527591/01-819e08384102.png)
#### 2.新建目录
在Module目录下新建lib目录和resources目录,lib目录用于存放依赖jar包,resources目录用于存放Spring配置文件
![新建目录](/personal-blog/images/csdn/93527591/02-0318099d6c59.png)
#### 3.设置目录属性
![IDEA创建Spring项目 图 3](/personal-blog/images/csdn/93527591/03-5d66c5f86860.png)![设置sourcesfolder](/personal-blog/images/csdn/93527591/04-cfc6bf381f77.png)
![设置bin目录](/personal-blog/images/csdn/93527591/05-fafd22ab5a6e.png)
#### 4.设置依赖jar包
将spring-core,spring-beans拷入lib目录下,并且在Project Structure依赖本地jar包
![IDEA创建Spring项目 图 6](/personal-blog/images/csdn/93527591/06-851508733e70.png)
记住依赖包前打勾,并且点apply
![IDEA创建Spring项目 图 7](/personal-blog/images/csdn/93527591/07-0c9ccd8c4b2e.png)
最后运行

#### 5.新建ApplicationContext.xml
新建xml作为Spring配置文件

![IDEA创建Spring项目 图 8](/personal-blog/images/csdn/93527591/08-5bd1bcdeba59.png)![IDEA创建Spring项目 图 9](/personal-blog/images/csdn/93527591/09-e94bce484d58.png)
![IDEA创建Spring项目 图 10](/personal-blog/images/csdn/93527591/10-03ce30922d67.png)

---

> 本文最初发布于 CSDN：[查看原文](https://blog.csdn.net/qq_42618152/article/details/93527591)。
