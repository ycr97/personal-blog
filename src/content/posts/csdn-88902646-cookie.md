---
author: "ycr97"
pubDatetime: 2019-03-30T00:00:00+08:00
title: "理解Cookie机制"
draft: false
tags: ["Web"]
category: "Web 开发"
description: "为什么需要Cookie和Session ==HTTP== 协议有一个特点:无状态连接.服务端不知道上一次是哪一个客户端请求了自己. 无状态连接带来的问题: 在一次会话(会话是指一个终端用户与交互系统进行通讯的过程，比如从输入账户密码进入操作系统到退出操作系统就是一个会话过程。)中,我们可以查看多个资源,每个资源都会发送请求再响应,每次请求都是客户端发出..."
---

##### 为什么需要Cookie和Session
**==HTTP==** 协议有一个特点:无状态连接.服务端不知道上一次是哪一个客户端请求了自己.
**无状态连接带来的问题:** 在一次会话(会话是指一个终端用户与交互系统进行通讯的过程，比如从输入账户密码进入操作系统到退出操作系统就是一个会话过程。)中,我们可以查看多个资源,每个资源都会发送请求再响应,每次请求都是客户端发出的而Http是无状态连接的,它不知道上一次是谁访问了自己,也就是说在一次会话中,多个请求是无法共享数据的,无法跟踪用户的信息.

**多个请求共享数据示例**
邮箱示例:登录邮箱之后进入邮箱,每个界面都有欢迎该用户的提示.
     由于每个页面都有欢迎用户的提示,而用户名只会在第一次请求时在后台获取,由于HTTP的无状态连接之后的收件箱,一封邮件请求都无法获取用户名.
##### 解决问题

![理解Cookie机制 图 1](/personal-blog/images/csdn/88902646/01-93bdc2bc8654.png)
**一.使用参数传递机制(如上图):**
		我们可以将需要共享的数据通过参数传递来实现共享数据,此方法可以解决问题,但是请求需要将共享的数据全部暴露在浏览器地址栏很不安全;
1.LoginServlet:http://localhost8080./param/list?username=well往下一个请求传递
**LoginServlet**

```java
@WebServlet("/param/login")
public class LoginServlet extends HttpServlet {
	@Override
	protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		req.setCharacterEncoding("UTF-8");
		resp.setContentType("text/html; charset=UTF-8");
		PrintWriter out = resp.getWriter();
		//=====================================================================
		String username = req.getParameter("username");
		out.println("欢迎:"+username+"<br/>");
		out.println("<a href='/two/param/list?username="+username+"'>收件箱</a>");
	}

```
**ListServlet**

```java
@WebServlet("/cookie/list")
public class ListServlet extends HttpServlet {
	@Override
	protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		req.setCharacterEncoding("UTF-8");
		resp.setContentType("text/html; charset=utf-8");
		PrintWriter out = resp.getWriter();
		// ======================================================
		Cookie[] cookies = req.getCookies();
		String username = null;
		for (Cookie cookie : cookies) {
			if ("currentName".equals(cookie.getName())) {
				username = cookie.getValue();
			}
		}
		out.println("欢迎"+username+"</br>");
		for (int i = 0; i < 6; i++) {
			out.println("<a href='/two/cookie/get'>一封邮件</a></br>");
		}
	}
}
```

使用参数传递的方式会将共享数据放入到请求行中(GET请求),我们需要将共享数据放入到请求头中;这时就有了**Cookie**机制

**二.Cookie:**
Cookie是客户端技术,程序把每个用户的数据以cookie的形式写给各自的浏览器,当用户再次发出请求去访问服务器中的web资源时,就会带着各自的数据去,这样Web资源处理时就是用户各自的数据了.
**LoginServlet**
```java
@WebServlet("/cookie/login")
public class LoginServlet extends HttpServlet {

	@Override
	protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		req.setCharacterEncoding("UTF-8");
		resp.setContentType("text/html; charset=utf-8");
		PrintWriter out = resp.getWriter();
		// =========================================================
		String username = req.getParameter("username");
		Cookie cookie = new Cookie("currentName", username);
		cookie.setMaxAge(60);
		resp.addCookie(cookie);

		out.println("欢迎:" + username);
		out.print("<a href='/two/cookie/list'>收件箱</a>");
	}
}

```
**ListServlet**
```java
@WebServlet("/cookie/list")
public class ListServlet extends HttpServlet {
	@Override
	protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		req.setCharacterEncoding("UTF-8");
		resp.setContentType("text/html; charset=utf-8");
		PrintWriter out = resp.getWriter();
		// ======================================================
		Cookie[] cookies = req.getCookies();
		Cookie username;
		for (int i = 0; i < cookies.length; i++) {
			username = cookies[i];
			System.out.println(username.getName() + "--" + username.getValue());
		}
		String name = cookies[0].getValue();
		out.println("欢迎"+name+"</br>");
		for (int i = 0; i < 6; i++) {
			out.println("<a href='/two/cookie/get'>一封邮件</a></br>");
		}
	}
}

```
![理解Cookie机制 图 2](/personal-blog/images/csdn/88902646/02-21ec201a74e6.jpeg)
![有无Cookie对比](/personal-blog/images/csdn/88902646/03-5edb54570987.jpeg)
上图是有无Cookie的请求头响应头对比
可以看出设置Cookie后响应头中携带Cookie数据,保存至浏览器.每次请求请求头携带Cookie数据进行请求,让服务端识别.

##### Cookie的操作
**1.** 创建Cookie对象:
			```Cookie cookie = new Cookie(String name, String value);```
			参数:name,当前cookie取一个唯一的名字
					value,存储在cookie的共享数据,只能是String类型
**2.** 把Cookie放入响应中,响应经浏览器,把共享数据存储在浏览器中
			```resp.addCookie(cookie);```
**3.** 获取Cookie以及Cookie中的数据:
因为Cookie已经存在于请求头中,因此应该通过request去获取
```
Cookie[] cookies = req.getCookies();
```
获取当前Cookie的名字
```
String name = cookie.getName();
```
获取当前Cookie的值
```
String value = cookie.getValue();
```
**4** Cookie的中文问题
使用编码再解码的方式

```
String name = "西门吹雪";
//编码
String temp = URLEncoder.encode(name, "UTF-8");
//解码
String str = URLEncoder.decode(temp, "UTF -8");
```
**5.** 修改Cookie的值
方式1:创建一个同名Cookie
方式2: ```cookie.setValue("新的值")```
**6.** Cookie的分类
会话Cookie:关闭浏览器之后,Cookie就销毁了.
持久化Cookie:Cookie可以保存指定的时间段.
设置Cookie的最大存活时间: ```cookie.setMaxAge(int seconds);```
seconds == 0:删除Cookie.
seconds <  0:会话Cookie.
seconds > 0:存储指定的秒数
**7.** 删除Cookie:cookie.setMaxAge(0);

---

> 本文最初发布于 CSDN：[查看原文](https://blog.csdn.net/qq_42618152/article/details/88902646)。
