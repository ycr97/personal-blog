---
author: "ycr97"
pubDatetime: 2021-02-22T00:00:00+08:00
title: "Java IO学习之IO模型NIO-1"
draft: false
tags: ["Java","Java IO"]
category: "Java"
description: "Java NIO基本介绍 - java nio 全称Java Non-blocking IO是JDK提供的全新API,从JDK1.4开始改进一系列输入/输出的新特性被称为NIO(New IO 是同步非阻塞的) - NIO的相关类都被放在java.io包下,并且对原有的java.io中的很多类进行改写 - NIO有三大核心部分:Channel(通道),B..."
---

#### Java NIO基本介绍

 - java nio 全称Java Non-blocking IO是JDK提供的全新API,从JDK1.4开始改进一系列输入/输出的新特性被称为NIO(New IO 是**同步非阻塞**的)
 - NIO的相关类都被放在java.io包下,并且对原有的java.io中的很多类进行改写
 - NIO有三大核心部分:**Channel(通道),Buffer(缓冲区),Selector(选择器)**
 - NIO是面向缓冲区(buffer)或者面向块编程的.数据读取到它稍后处理的缓冲区,需要时可在缓冲区中前后移动,这就增加了处理过程中的灵活性,使用它可以提供非阻塞式高伸缩性网络
 - NIO的非阻塞模式,使一个线程从通道发送请求或读取数据,但是它仅能得到目前可用的数据,如果目前没有数据可用时,就什么都不会获取,而不是保持**线程阻塞**所以直至数据变得可以读取之前,该线程可以继续做其他的事情,非阻塞写亦是如此,一个线程请求写入一些数据到某通道,单不需要等待它完全写入,这个线程可以继续做其他的事
 - 通俗理解,NIO可以一个线程去处理多个操作,假设有10000个请求过来,根据实际情况可以分50到100个线程来处理不像之前的BIO(阻塞式)非得分10000个线程来处理
 - HTTP2.0采用了多路复用技术,做到同一个连接并发处理多个请求,并且并发请求比HTTP1.1大几个数量级
 **基本原理图**
![基本原理图](/personal-blog/images/csdn/113942169/01-1ab05e83c4cc.png)
**Java NIO和BIO区别**

 1.BIO是以流的方式处理数据,而NIO是以块的方式处理数据,块I/O的效率比流I/O的效率高得多
 - BIO是阻塞的,NIO是非阻塞的
 - BIO基于字节流或字符流进行操作,而NIO基于Channel(通道)和Buffer(缓冲区)进行操作,数据总是从通道读取到缓冲中,或者从缓冲区中写入通道中Selector(选择器)用于监听多个通道的时间(比如:连接请求,数据到达)因此单个线程就可以监听多个客户端通道
 
 **Selector,Channel,Buffer关系图**
![Java IO学习之IO模型NIO-1 图 2](/personal-blog/images/csdn/113942169/02-53e7fc5616ab.png)
Selector,Channel,Buffer
 - 每个Channel都会对应一个Buffer
 - 一个线程对应一个Selector,一个Selector对应多个Channel(连接)
 - 上图反映出有三个Channel注册到该Selector程序
 - 程序切换到哪个Channel上由事件决定,所以Event是个重要的概念
 - Selector会根据事件在不同的Channel上切换
 - Buffer就是一个内存块,底层就是一个数组
 - 数据的读取和写入,通过Buffer和BIO有本质不同BIO中通过输入输出流来完成读写,不能双向,NIO中通过Buffer即可以读也可以写,但需要切换
 - Channel也是双向的,可以返回底层操作系统的情况,比如Linux底层操作系统通道就是双向的
**缓冲区(Buffer)**
基本介绍: 缓冲是本质上一个可以读写数据的内存区域,可以理解为一个**容器对象(含数组)**该对象提供**一组方法**可以更轻松地使用内存块,缓冲区对象内置一些机制,能够追踪和记录缓冲区的状态变化情况,Channel提供网络,文件读取数据的渠道,但是读取和写入数据都必须经过Buffer
![Java IO学习之IO模型NIO-1 图 3](/personal-blog/images/csdn/113942169/03-d621a03e32a5.png)
**Channel(通道)**
基本介绍:
1. NIO的通道类似于流但有如下的区别:
 - 通道可以同时进行读写,而流只能读或者写
 - 通道可以实现异步的读写数据
 - 通道可以从缓冲读取数据,也可以想缓冲写入数据
2. BIO中的stream是单向的,比如FileInputStream只能单向的读取数据到内存,而NIO中的通道(Channel)是双向的,可以读操作,也可以写操作
3. Channel是一个接口
4. 常用Channel实现类有FileChannel,DatagramChannel,ServerSocketChannel和SocketChannel
5. FileChannel用于文件的数据读写,DatagramChannel用于UDP的数据读写ServerSocketChannel和SocketChannel用于TCP的数据读写

**Selector(选择器)**
![selector selectkey channel关系](/personal-blog/images/csdn/113942169/04-af29ce4dfd1b.png)
对上图解释:

 1. 当客户端连接时,会通过ServerSocketChannel得到SocketChannel
 2. 将SocketChannel注册到Selector上,register(Selector sel, int ops),一个Selector上可以注册多个SocketChannel
 3. 注册会返回一个SelectionKey,会和该Selector关联(集合)
 4. Selector进行监听select方法,返回有事件发生的通道个数
 5. 进一步得到各个SelectionKey(有事件发生)
 6. 在通过SelectionKey反向获取SocketChannel,方法channel()
 7. 可以通过channel,完成业务处理

---

> 本文最初发布于 CSDN：[查看原文](https://blog.csdn.net/qq_42618152/article/details/113942169)。
