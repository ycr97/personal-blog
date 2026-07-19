---
author: "ycr97"
pubDatetime: 2021-03-28T00:00:00+08:00
title: "Servlet请求过程"
draft: false
tags: ["Servlet"]
category: "Web 开发"
description: "Servlet请求流程 学习J2EE理解servlet处理请求的流程(第一个Servlet程序HelloWorld版本) 当我们在浏览器输入url地址进行请求时服务端在接收请求的整个流程如下图所示 其中分请求是否为第一次请求 第一次请求: ①.解析请求信息,解析/one/hello; 上下文路径(环境):/one. 资源名称:/hello. ②.根据上..."
---

#### Servlet请求流程
学习J2EE理解servlet处理请求的流程(第一个Servlet程序HelloWorld版本)

当我们在浏览器输入url地址进行请求时服务端在接收请求的整个流程如下图所示

![Servlet请求过程 图 1](/personal-blog/images/csdn/115289988/01-0267e0fe314c.png)

其中分请求是否为第一次请求

第一次请求:

①.解析请求信息,解析/one/hello;

上下文路径(环境):/one.

资源名称:/hello.

②.根据上下文路径/one去Tomcat根/conf下找到server.xml文件获取所有的<Context>元素再判断哪一个<Context>元素的path属性值为/one,接着找到<Context>的docBase属性值,该属性值就是当前访问项目的根路径.

③.再从当前项目的根路径下的WEB-INF目录中识别web.xml文件.

④.获取web.xml文件中所有的url-pattern元素,判断是否存在/hello的属性值(找不到则报404错误).

⑤.根据/hello资源名称最终获取对应的Servlet类的全限定名(类的包名.类名).

⑥.根据Servlet的全限定名,使用反射调用构造器创建对象Servlet obj = Class.forName(Servlet全限定名).

(把创建的Servlet对象存储到Servlet缓存池中,供下一次请求使用)

⑦.容器创建ServletConfig对象再使用Servlet对象调用init方法进行初始化 obj.init(config).

⑧.容器创建ServletRequest,ServletResponse对象再使用Servlet对象调用service方法进行服务obj.service(req, resp).

⑨.在service方法中对客户端做响应操作.

非第一次请求

前五步与上述前五步相同.

⑥.从Tomcat中的Servlet实例缓存池中取出HelloServlet对象

⑦.创建HttpRequest,HttpResponse对象调用Service方法进行服务 obj.service(req, resp).

⑧.在service方法中对客户端做响应.

上述流程均有Tomcat容器完成,Servlet,ServletConfig,HttpRequest,HttpResp对象均由容器创建.

Servlet中方法调用先后顺序:init---->service---->destroy运行时如下图所示:

![Servlet请求过程 图 2](/personal-blog/images/csdn/115289988/02-74686ae0139b.png)
(图片转载)

以上就是整个Servlet接收请求的过程,可能写的并不完善,主要是记录学习的一个过程.

---

> 本文最初发布于 CSDN：[查看原文](https://blog.csdn.net/qq_42618152/article/details/115289988)。
