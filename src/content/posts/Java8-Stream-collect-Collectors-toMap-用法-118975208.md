---
author: "ycr97"
pubDatetime: 2021-07-21T00:00:00+08:00
title: "Java8 Stream collect(Collectors.toMap()) 用法"
draft: false
tags: ["Java"]
category: "Java"
description: "Collectors.toMap 用法 在我们实际开发过程中经常使用到将List 转为Map的过程,在Java8 中Stream提供简便开发的方式 测试 测试DTO 构造数据 三个重载的方法 ### 两个参数 两个参数对应key和value的构造 #### 三个参数 前两个参数同上；第三个参数是解决同一个key有多个value时的解决方式 #### 四..."
---

# Collectors.toMap 用法
在我们实际开发过程中经常使用到将List 转为Map的过程,在Java8 中Stream提供简便开发的方式

### 测试
测试DTO
```java
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author yuchangrong
 * @date 2022/12/01 18:16
 * @description
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Student {
    private String id;

    private String name;

    private String classId;
}
```
构造数据
```java
public List<Student> getList(){
        List<Student> list =new ArrayList<>();
        list.add(new Student("1", "张三", "c1"));
        list.add(new Student("2", "李四", "c1"));
        list.add(new Student("3", "王五", "c1"));
        list.add(new Student("4", "赵四", "c1"));
        list.add(new Student("5", "詹姆斯", "c2"));
        list.add(new Student("6", "杜兰特", "c3"));
        list.add(new Student("7", "哈登", "c3"));
        list.add(new Student("8", "保罗", "c3"));
        list.add(new Student("9", "欧文", "c3"));
        list.add(new Student("10", "艾弗森", "c2"));
        list.add(new Student("11", "乔丹", "c4"));
        return list;
     }
```

## 三个重载的方法
 
- ### 两个参数
两个参数对应key和value的构造
```java
public static <T, K, U>
    Collector<T, ?, Map<K,U>> toMap(Function<? super T, ? extends K> keyMapper,
                                    Function<? super T, ? extends U> valueMapper) {
        return new CollectorImpl<>(HashMap::new,
                                   uniqKeysMapAccumulator(keyMapper, valueMapper),
                                   uniqKeysMapMerger(),
                                   CH_ID);
    }
```
```java
@Test
    public void testMap() {
        Map<String, Student> studentMap = getList().stream().collect(Collectors.toMap(Student::getId, temp -> temp));
        System.out.println(studentMap);
    }
```

- #### 三个参数
前两个参数同上；第三个参数是解决同一个key有多个value时的解决方式
```java
public static <T, K, U>
    Collector<T, ?, Map<K,U>> toMap(Function<? super T, ? extends K> keyMapper,
                                    Function<? super T, ? extends U> valueMapper,
                                    BinaryOperator<U> mergeFunction) {
        return toMap(keyMapper, valueMapper, mergeFunction, HashMap::new);
    }
```
```java
@Test
    public void testMap1() {
        Map<String, List<Student>> studentMap = getList().stream().collect(Collectors.toMap(Student::getClassId, temp -> {
            List<Student> list = new ArrayList<>();
            list.add(temp);
            return list;
        }, (list1, list2) -> {
            list1.addAll(list2);
            return list1;
        }));
        System.out.println(studentMap);
    }
```

- #### 四个参数
四个参数时前三个参数同上；最后一个参数是指定用哪种类型的map
```java
public static <T, K, U, M extends Map<K, U>>
    Collector<T, ?, M> toMap(Function<? super T, ? extends K> keyMapper,
                                Function<? super T, ? extends U> valueMapper,
                                BinaryOperator<U> mergeFunction,
                                Supplier<M> mapSupplier) {
        BiConsumer<M, T> accumulator
                = (map, element) -> map.merge(keyMapper.apply(element),
                                              valueMapper.apply(element), mergeFunction);
        return new CollectorImpl<>(mapSupplier, accumulator, mapMerger(mergeFunction), CH_ID);
    }
```
```java
@Test
    public void testMap2() {
        Map<String, List<Student>> studentMap = getList().stream().collect(Collectors.toMap(Student::getClassId, temp -> {
            List<Student> list = new ArrayList<>();
            list.add(temp);
            return list;
        }, (list1, list2) -> {
            list1.addAll(list2);
            return list1;
        }, LinkedHashMap::new));
        System.out.println(studentMap);
    }
```

---

> 本文最初发布于 CSDN：[查看原文](https://blog.csdn.net/qq_42618152/article/details/118975208)。
