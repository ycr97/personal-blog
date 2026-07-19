---
author: "ycr97"
pubDatetime: 2019-07-15T00:00:00+08:00
title: "IDEA创建Web项目"
draft: false
tags: ["IDEA"]
category: "工具与运维"
description: "配置Tomcat 1.进入Run/Configurations 2.选择本地Tomcat路径 绑定项目 配置完之后url变化 新建web Module 勾选web application 在WEB-INF目录下创建classes和lib目录 分别用来装编译后的class文件和项目依赖jar包 进入项目配置 选择Use module compile ou..."
---

#### 配置Tomcat
##### 1.进入Run/Configurations![配置Tomcat](/personal-blog/images/csdn/96010215/01-36d1188502b5.png)
##### 2.选择本地Tomcat路径
![选择Tomcat路径](/personal-blog/images/csdn/96010215/02-da45916ad083.png)
#####  绑定项目![IDEA创建Web项目 图 3](/personal-blog/images/csdn/96010215/03-78de84c29b8b.png)
配置完之后url变化
![IDEA创建Web项目 图 4](/personal-blog/images/csdn/96010215/04-2c45d280f0d7.png)
#### 新建web Module
###### 勾选web application   ![IDEA创建Web项目 图 5](/personal-blog/images/csdn/96010215/05-74e5e4fb62bf.png)
##### 在WEB-INF目录下创建classes和lib目录
分别用来装编译后的class文件和项目依赖jar包
![IDEA创建Web项目 图 6](/personal-blog/images/csdn/96010215/06-a4299b3eec83.png)
##### 进入项目配置
![IDEA创建Web项目 图 7](/personal-blog/images/csdn/96010215/07-50b76d2ee44e.png)
选择Use module compile out path 
目的是为了将编译后的class文件放进classes目录
![IDEA创建Web项目 图 8](/personal-blog/images/csdn/96010215/08-f654706572dc.png)
导入jar
![IDEA创建Web项目 图 9](/personal-blog/images/csdn/96010215/09-d17f41e98431.png)![IDEA创建Web项目 图 10](/personal-blog/images/csdn/96010215/10-f65bb7b9f8f1.png)
勾选jar包
![IDEA创建Web项目 图 11](/personal-blog/images/csdn/96010215/11-2b3927b361bd.png)

配置Artifacts 让Tomcat容器加载这个项目使用
![IDEA创建Web项目 图 12](/personal-blog/images/csdn/96010215/12-81f6fff431c1.png)

---

> 本文最初发布于 CSDN：[查看原文](https://blog.csdn.net/qq_42618152/article/details/96010215)。
