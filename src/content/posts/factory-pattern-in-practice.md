---
author: ycr97
pubDatetime: 2026-07-19T00:00:00+08:00
title: "一个导入导出改造案例：工厂模式在真实项目中怎么用"
featured: true
draft: false
tags:
  - Java
  - 设计模式
  - 软件设计
category: "软件设计"
description: "结合一次真实的导入导出改造，说明如何用工厂模式替代持续膨胀的条件分支。"
---

# 一个导入导出改造案例，聊聊工厂模式在真实项目里到底怎么用

很多人第一次接触工厂模式，都是在设计模式教材里。

常见的感觉通常有两种：

- 理解了定义，但不知道什么时候该用
- 知道是“把对象创建交给工厂”，但放到业务项目里还是容易写回 `if-else`

这篇文章不讲太多概念，直接结合一次真实项目改造，聊聊工厂模式在实际业务开发里到底怎么落地。

## 事情的起因

最近我们做了一次结案草稿导入导出的改造。

这个功能看起来并不复杂：

- 前端上传 Excel
- 后端解析
- 调中台接口
- 返回导入结果

但问题在于，这个功能不是只有一种类型。

不同活动类型虽然接口形式一致，但内部处理逻辑不同：

- 核心分销是一套 DTO 和 Listener
- 专卖店补贴是一套 DTO 和 Listener
- 陈列活动又是另一套 DTO 和中台导入接口

如果继续按最直接的方式写，代码大概会变成这样：

```java
if ("CORE_DISTRIBUTION".equals(activityTypeCode)) {
    // 核心分销处理
} else if ("SPONSOR_SUBSIDY".equals(activityTypeCode)) {
    // 专卖店补贴处理
} else if ("DISPLAY_ACTIVITY".equals(activityTypeCode)) {
    // 陈列活动处理
}
```

短期看完全没问题。  
但只要你做过几轮业务迭代，就会知道这种代码后面大概率会越来越长。

## 为什么 `if-else` 一开始都很好，后来越来越难受

因为业务系统里的分支通常不是一次性的，而是会不断长出来。

一开始只有 2 种类型时，`if-else` 看起来很自然。  
到了第 3 种、第 4 种、第 5 种，你就会发现几个问题开始冒出来：

- 入口方法越来越长
- 新增类型必须改老代码
- 公共逻辑和类型逻辑混在一起
- 调试时很难快速定位到底是哪一路实现

更麻烦的是，这类代码很容易在多个地方重复出现。

你以为你只是在写一个导入判断，实际上你是在给后续维护埋成本。

## 这时候，工厂模式就值得上场了

工厂模式最适合的，其实就是这种场景：

> 同一个入口，根据不同类型，选择不同实现。

它的重点不是“工厂”两个字，而是把下面这件事抽出来：

> 谁来决定当前请求应该交给哪个实现类处理？

如果这个决定仍然放在 Controller 或主流程方法里，那你的代码很容易继续膨胀。  
如果把这件事集中到工厂中，整体结构就会稳定很多。

## 先说一个不依赖 Spring 的最普通实现

很多人一说工厂模式，就默认得搭配 Spring。其实不是。

不依赖 Spring 的情况下，完全可以这么做。

先定义一个统一接口：

```java
public interface CloseDraftImportHandler {
    String supportActivityTypeCode();
    ImportResultDTO handle(File file);
}
```

然后每个类型写一个自己的实现类：

```java
public class CdImportHandler implements CloseDraftImportHandler {
    @Override
    public String supportActivityTypeCode() {
        return "CORE_DISTRIBUTION";
    }

    @Override
    public ImportResultDTO handle(File file) {
        return new ImportResultDTO();
    }
}
```

再由工厂统一维护映射关系：

```java
public class CloseDraftImportHandlerFactory {

    private final Map<String, CloseDraftImportHandler> handlerMap = new HashMap<>();

    public CloseDraftImportHandlerFactory() {
        register(new CdImportHandler());
        register(new DisplayImportHandler());
        register(new ExclusiveStoreImportHandler());
    }

    private void register(CloseDraftImportHandler handler) {
        handlerMap.put(handler.supportActivityTypeCode(), handler);
    }

    public CloseDraftImportHandler getHandler(String activityTypeCode) {
        return handlerMap.get(activityTypeCode);
    }
}
```

调用方只管这样写：

```java
CloseDraftImportHandler handler = factory.getHandler(activityTypeCode);
handler.handle(file);
```

这已经是一个完整的工厂模式落地了。

## Spring 容器下，工厂模式会更顺手

在 Spring 项目里，这个模式会更自然。

因为你不需要自己手动 `new` 一堆实现类，也不需要自己维护依赖注入。  
你只需要：

- 把具体 handler 交给 Spring 托管
- 工厂注入 `List<Handler>`
- 转成 `Map<activityTypeCode, handler>`

这也是我们这次项目里采用的方式。

## 这次项目里，我们具体怎么落的

我们的做法很简单：

### 第一步，定义统一处理器接口

```java
public interface CloseDraftImportHandler {
    String supportActivityTypeCode();
    ImportResultDTO importCloseCase(MultipartFile file) throws IOException;
}
```

这个接口很重要，因为它统一了两个核心问题：

- 用什么字段做分发
- 每个实现类对外提供什么能力

### 第二步，每种类型写自己的 Handler

例如核心分销：

```java
@Component
@RequiredArgsConstructor
public class CdCloseDraftImportHandler implements CloseDraftImportHandler {

    private final CloseCaseAppServiceI closeCaseAppServiceI;

    @Override
    public String supportActivityTypeCode() {
        return ActivityTypeEnum.CORE_DISTRIBUTION.getCode();
    }

    @Override
    public ImportResultDTO importCloseCase(MultipartFile file) throws IOException {
        CoreDistributionCloseCaseImportListener listener =
                new CoreDistributionCloseCaseImportListener(closeCaseAppServiceI);
        EasyExcel.read(file.getInputStream(), CdCloseCaseImportAppDTO.class, listener)
                .sheet()
                .doRead();
        return listener.getImportResult();
    }
}
```

陈列活动、专卖店补贴也都是同样思路。

每个 handler 各管各的，不需要知道别的类型怎么实现。

### 第三步，让工厂负责分发

```java
@Component
public class CloseDraftImportHandlerFactory {

    private final Map<String, CloseDraftImportHandler> handlerMap;

    public CloseDraftImportHandlerFactory(List<CloseDraftImportHandler> handlers) {
        this.handlerMap = handlers.stream().collect(Collectors.toMap(
                CloseDraftImportHandler::supportActivityTypeCode,
                Function.identity()
        ));
    }

    public CloseDraftImportHandler getHandler(String activityTypeCode) {
        CloseDraftImportHandler handler = handlerMap.get(activityTypeCode);
        if (handler == null) {
            throw new BizException("不支持的活动类型");
        }
        return handler;
    }
}
```

这一步做完之后，主流程就干净了。

### 第四步，统一服务只做一件事：找 handler 并调用

```java
public Response<ImportResultDTO> importCloseCase(MultipartFile file, String activityTypeCode) throws IOException {
    CloseDraftImportHandler handler = factory.getHandler(activityTypeCode);
    return Response.success(handler.importCloseCase(file));
}
```

### 第五步，Controller 变成真正的薄入口

```java
@PostMapping("/draft/import")
public Response<ImportResultDTO> importCloseCase(@RequestParam("activityTypeCode") String activityTypeCode,
                                                 @RequestParam("file") MultipartFile file) throws IOException {
    return closeDraftImportService.importCloseCase(file, activityTypeCode);
}
```

到这里，Controller 不再关心任何类型细节。

## 为什么这次分发一定要用 `activityTypeCode`

这个点其实很关键。

最开始如果选错分发键，后面工厂模式很容易失真。

我们这次明确用的是 `activityTypeCode`，原因很简单：

- 它天然就是“类型”
- 它是稳定路由键
- 不需要额外查一次活动信息
- 与现有统一导出逻辑一致

如果拿 `activityCode` 去做分发，通常还得先查出活动类型，才知道该走哪一路实现。  
这样会让分发逻辑变得绕一层。

工厂模式最怕分发键不清楚。  
一旦分发键不清楚，工厂内部就又会长回复杂判断。

## 这次改造之后，最大的感受是什么

不是“代码更高级了”，而是：

**结构终于顺了。**

改造后最明显的变化有几个。

### 1. 新增类型不再改主流程

以后如果再支持一个新的活动类型，原则上只需要：

- 新增一个 handler
- 实现接口
- 声明支持的 `activityTypeCode`

而不是再去改统一入口里的分支判断。

### 2. 旧接口可以兼容，新逻辑可以统一

这次我们没有直接删掉旧的类型化导入接口，而是让它们内部委托统一服务。  
这样做非常实用：

- 不影响历史调用
- 新逻辑只维护一套
- 后续有时间再慢慢收口

### 3. 导入和导出风格统一了

导出本身就已经在按 handler 思路做统一分发了。  
导入也收成工厂模式之后，整个模块风格会更一致。

## 工厂模式在业务项目里最有价值的地方

很多人会把工厂模式理解成一个“创建对象的模式”。  
这没错，但放到业务开发里，更实用的理解应该是：

> 它是一种组织多实现分发关系的方式。

你真正需要的，不是一个名字叫 Factory 的类。  
你真正需要的是把“按类型切换实现”的复杂度，从主流程里拿出去。

这才是它在真实项目里的价值。

## 什么时候适合用，什么时候别硬上

我自己的经验是，下面这些场景比较适合用工厂模式：

- 明确存在多种实现
- 分发键清晰稳定
- 后续大概率会继续扩展
- 主流程不应该感知具体实现类

反过来，如果只是两个简单分支，而且未来几乎不会扩展，直接写判断未必有问题。

模式从来不是越多越好。  
合适的时候用，才能真正降低复杂度。

## 最后总结一句

这次改造让我更确定一件事：

> 在业务系统里，只要分支开始围绕“类型”持续增长，就应该尽早考虑把 `if-else` 升级成“接口 + 实现类 + 工厂”的结构。

工厂模式并不遥远，它不是面试题里的概念，而是每天都可能用得上的一种工程化手段。

真正的价值，不在于它叫不叫工厂模式，而在于它能不能帮你把系统组织得更稳。
