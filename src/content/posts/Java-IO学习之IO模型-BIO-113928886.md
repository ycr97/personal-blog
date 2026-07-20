---
author: "ycr97"
pubDatetime: 2021-02-22T00:00:00+08:00
title: "Java IO学习之IO模型--BIO"
draft: false
tags: ["Java","Java IO"]
category: "Java"
description: "Java BIO 1. Java BIO就是传统的Java IO编程,其相关的类和接口都在java.io 2. BIO(blocking io):同步阻塞,服务器实现模式为一个连接一个线程,即客户端有连接请求时服务端就需要启动一个线程进行处理,如果这个线程不做任何事那么会造成不必要的线程开销,可以通过线程池机制改善(实现多个客户连接服务器) 3. BI..."
---

#### Java BIO

 1. Java BIO就是传统的Java IO编程,其相关的类和接口都在java.io
 2. BIO(blocking io):同步阻塞,服务器实现模式为一个连接一个线程,即客户端有连接请求时服务端就需要启动一个线程进行处理,如果这个线程不做任何事那么会造成不必要的线程开销,可以通过**线程池机制改善**(实现多个客户连接服务器)
 3. BIO方式适合连接数目比较小且固定的架构,这种方式对服务器资源要求比较高,并发局限于应用中,JDK1.4以前唯一的选择,程序简单易理解.
 
 
 **工作原理图**![工作原理图](/personal-blog/images/csdn/113928886/01-9af1f01c8ee6.png)
BIO编程简单流程:
 1. 服务端启动一个ServerSocket
 2. 客户端启动Socket对服务器进行通信,默认情况下服务器需要对每个客户建立一个线程与之通信
 3. 客户端发出请求后,先咨询服务器是否有线程响应,如果没有则等待或拒绝
 4. 如果有响应,客户端会等待请求结束后,再继续执行
**示例**

```java
public class BIOServer {

    public static void main(String[] args) throws IOException {
        // 使用线程池方案
        // 1.创建线程池
        // 2.创建ServerSocket有连接则创建新线程与之通信
        ExecutorService threadPool = Executors.newCachedThreadPool();
        // 创建serverSocket
        ServerSocket server = new ServerSocket(6666);
        System.out.println("Server is Running");

        while (true) {
            // 监听,等待客户端连接
            System.out.println("wait connection...");
            final Socket socket = server.accept();
            System.out.println("Connect 1 Client");
            // 创建一个线程,与之通信
            threadPool.execute(() -> {
                handler(socket);
            });
        }

    }

    public static void handler(Socket socket) {
        try {
            System.out.println("current thread info : " + Thread.currentThread().getId() + " "
            + "Thread name : " + Thread.currentThread().getName());

            InputStream inputStream = socket.getInputStream();
            byte[] bytes = new byte[8];

            while (true) {
                System.out.println("read...");
                int read = inputStream.read(bytes);
                System.out.println("read success");
                if (read != -1) {
                    System.out.println(new String(bytes));
                } else {
                    break;
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            System.out.println("close client connection");
            try {
                socket.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}
```
**Java BIO问题分析:**

 1. 每个请求都需要独立创建独立的线程,与对应的客户端进行数据Read,业务处理,数据Write
 2. 当并发较大时,客户端需要**创建大量的线程**,系统资源占用较大
 3. 当连接建立后,当前线程没有数据可读,则线程就阻塞在Read操作上,造成资源浪费

---

> 本文最初发布于 CSDN：[查看原文](https://blog.csdn.net/qq_42618152/article/details/113928886)。
