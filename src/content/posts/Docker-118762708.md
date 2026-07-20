---
author: "ycr97"
pubDatetime: 2021-07-15T00:00:00+08:00
title: "Docker"
draft: false
tags: ["Docker"]
category: "工具与运维"
description: "基本命令 启动Docker 停止Docker 重启 Docker状态 用法：docker stats [选项] [容器...] 显示容器资源使用统计的实时流 选项： -a --all 显示所有容器（默认显示正在运行） --format string 使用 Go 模板漂亮地打印图像 --no-stream 禁用流统计并只提取第一个结果 --no-trun..."
---

# 基本命令
### 启动Docker

```powershell
service docker start
```
### 停止Docker

```powershell
service docker stop
```
### 重启
```powershell
service docker restart
```
### Docker状态
```powershell
docker stats 
```
用法：docker stats [选项] [容器...]

显示容器资源使用统计的实时流

**选项：**
  -a
  --all 显示所有容器（默认显示正在运行）
        --format string 使用 Go 模板漂亮地打印图像
       --no-stream 禁用流统计并只提取第一个结果
       --no-trunc 不截断输出

# 容器使用
### 获取镜像

```powershell
docker pull centos
```
选项：
  -a, --all-tags 下载存储库中的所有标记图像
      --disable-content-trust 跳过图像验证（默认为 true）
      --platform string 如果服务器支持多平台，则设置平台
  -q, --quiet 抑制详细输出
### 启动容器
  以镜像启动容器并进入容器
  

```powershell
docker run -it centos /bin/bash
```
参数说明:
- -i ：交互式操作操作
- -t：终端
- /bin/bash：镜像后面的是命令，使用shell路径

退出终端命令：

```powershell
exit
```
### 启动已停止运行的容器
####  首先查看所有容器找到对应id
```powershell
docker ps -a
```
![docker ps -a](/personal-blog/images/csdn/118762708/01-b38986e4d6b4.png)
#### 启动一个已经停止的容器
```powershell
docker start [id]
```
#### 后台运行
```powershell
docker start [id] -a
```
#### 停止正在运行的容器

```powershell
docker stop [id]
```
#### 重启容器

```powershell
docker restart [id]
```
### 进入容器

```powershell
docker exec -it [id] /bin/bash
```

---

> 本文最初发布于 CSDN：[查看原文](https://blog.csdn.net/qq_42618152/article/details/118762708)。
