---
author: "ycr97"
pubDatetime: 2021-07-19T00:00:00+08:00
title: "JDK源码阅读--HashMap(JDK1.8、Java11)"
draft: false
tags: ["Java"]
category: "Java"
description: "基本介绍 首先要知道HashMap使用到哪些数据结构,JDK1.8中HashMap实现依赖数组,单链表,红黑树实现 利用数组根据数组下标查找元素快的特征(时间复杂度O(1))根据Hash算法利用key的hash来计算存放元素的下标,实现根据key来快速找到下标,从而找到具体存放的Node,但是可能会发生hash冲突,当发生hash冲突时将使用链表纵向存..."
---

# 基本介绍
首先要知道HashMap使用到哪些数据结构,JDK1.8中HashMap实现依赖数组,单链表,红黑树实现
利用数组根据数组下标查找元素快的特征(时间复杂度O(1))根据Hash算法利用key的hash来计算存放元素的下标,实现根据key来快速找到下标,从而找到具体存放的Node,但是可能会发生hash冲突,当发生hash冲突时将使用链表纵向存放元素,1.8之后使用红黑树来优化(链表查找效率低时间复杂度O(n),红黑树查找时间复杂度O(logn))
![基本结构](/personal-blog/images/csdn/118894019/01-332dd77371d9.png)
## 几个内部常量
### 默认初始长度
```java
/**
  * The default initial capacity - MUST be a power of two.
  * 默认初始容量 - 必须是 2 的幂。
  */
static final int DEFAULT_INITIAL_CAPACITY = 1 << 4; // aka 16
```
### 默认负载因子
```java
	/**
	  * The load factor used when none specified in constructor.
	  * 在构造函数中未指定时使用的负载因子。
	  */
    static final float DEFAULT_LOAD_FACTOR = 0.75f;
```
### 转换为树的阈值

```java
	/**
     * The bin count threshold for using a tree rather than list for a
     * bin.  Bins are converted to trees when adding an element to a
     * bin with at least this many nodes. The value must be greater
     * than 2 and should be at least 8 to mesh with assumptions in
     * tree removal about conversion back to plain bins upon
     * shrinkage.
     * 使用树而不是链表的 数组长度计数阈值。将元素添加到至少具有这么多节点的链表时，
     * 链表会转换为树。该值必须大于 2 且至少应为 8，以便与树移除中关于在收缩时
     * 转换回普通bin的假设相匹配。
     */
    static final int TREEIFY_THRESHOLD = 8;
```
### 收缩为链表的阈值

```java
/**
     * The bin count threshold for untreeifying a (split) bin during a
     * resize operation. Should be less than TREEIFY_THRESHOLD, and at
     * most 6 to mesh with shrinkage detection under removal.
     * 在调整大小操作期间取消（拆分）bin 的 bin 计数阈值。 
     * 应小于 TREEIFY_THRESHOLD，最多为 6 以在移除下进行收缩检测。
     */
    static final int UNTREEIFY_THRESHOLD = 6;
```
###  转换为树节点数的阈值

```java
/**
     * The smallest table capacity for which bins may be treeified.
     * (Otherwise the table is resized if too many nodes in a bin.)
     * Should be at least 4 * TREEIFY_THRESHOLD to avoid conflicts
     * between resizing and treeification thresholds.
     * 可以将 bin 树化的最小表容量。 （否则，如果 bin 中的节点过多，则表将调整大小。）
     * 应至少为 4  TREEIFY_THRESHOLD，以避免调整大小和树化阈值之间发生冲突
     */
    static final int MIN_TREEIFY_CAPACITY = 64;
```

### 真实容量(数组长度*负载因子)

```java
 int threshold;
```

# 具体分析
## 构造器
- **无参构造**：当new一个HashMap时使用无参构造器只会初始化loadFactor(加载因子)为DEFAULT_LOAD_FACTOR(默认加载因子:0.75)
- **public HashMap(int initialCapacity)**：指定长度的HashMap,使用指定的长度来构造数组,但是不在这一步去初始化数组,而是在之后的第一次put中,这里并不是指定多少长度就使用多长,而是必须是2的二次幂
 
> 此处涉及到为什么数组长度为什么是二次幂,这样做有两个好处
>   1. 这样运算速度更快,比%运算更快
>   2. 因为在确定桶的位置时确保落在数组的区间内;有一个& (数组长度-1)的操作,二次幂-1保证所有位全部为1运算更快
>   3. (n - 1) & hash，当n为2次幂时，会满足一个公式：(n - 1) & hash = hash % n

**Java8**
```java
static final int tableSizeFor(int cap) {
        int n = cap - 1;
        n |= n >>> 1;
        n |= n >>> 2;
        n |= n >>> 4;
        n |= n >>> 8;
        n |= n >>> 16;
        return (n < 0) ? 1 : (n >= MAXIMUM_CAPACITY) ? MAXIMUM_CAPACITY : n + 1;
}
```
**Java11**
```java
static final int tableSizeFor(int cap) {
    int n = -1 >>> Integer.numberOfLeadingZeros(cap - 1);
    return (n < 0) ? 1 : (n >= MAXIMUM_CAPACITY) ? MAXIMUM_CAPACITY : n + 1;
}

@HotSpotIntrinsicCandidate
public static int numberOfLeadingZeros(int i) {
     // HD, Count leading 0's
     if (i <= 0)
         return i == 0 ? 32 : 0;
     int n = 31;
     if (i >= 1 << 16) { n -= 16; i >>>= 16; }
     if (i >= 1 <<  8) { n -=  8; i >>>=  8; }
     if (i >= 1 <<  4) { n -=  4; i >>>=  4; }
     if (i >= 1 <<  2) { n -=  2; i >>>=  2; }
     return n - (i >>> 1);
}
```

- **public HashMap(int initialCapacity, float loadFactor)**：使用指定的加载因子和长度来构造，同样要使用2的二次幂来作为初始长度
## put

**hash()**
其中使用到key的hashcode来和hashcode右移16位后的值进行异或运算.
网上翻阅博客介绍:

> 目的：减少hash碰撞
在jvm虚拟机中，一个hashcode位32，那么右移16位进行打乱的^操作，即是对低16位一次打乱，而且混合后的低位掺杂了高位的部分特征，使高位的信息也被保留下来
引用博客:https://blog.csdn.net/weixin_41302239/article/details/110250102

**hash()**
```java
static final int hash(Object key) {
    int h;
    return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
}
```

**putval()**
```java
final V putVal(int hash, K key, V value, boolean onlyIfAbsent,
                   boolean evict) {
        Node<K,V>[] tab; Node<K,V> p; int n, i;
        // 判断是否对table初始化如果为空则调用resize()方法进行初始化
        if ((tab = table) == null || (n = tab.length) == 0)
            n = (tab = resize()).length;
        // i= (n - 1) & hash来计算Node放在数组的哪个位置其中n-1为数组的length-1
        // &确保能落在数组的区间内
        if ((p = tab[i = (n - 1) & hash]) == null)
            tab[i] = newNode(hash, key, value, null);
        // 
        else {
            Node<K,V> e; K k;
            // 如果hash相等并且equals相等则覆盖原来的值
            if (p.hash == hash &&
                ((k = p.key) == key || (key != null && key.equals(k))))
                e = p;
            // 如果是树
            else if (p instanceof TreeNode)
                e = ((TreeNode<K,V>)p).putTreeVal(this, tab, hash, key, value);
			// 往链表尾部插入
            else {
                for (int binCount = 0; ; ++binCount) {
                    if ((e = p.next) == null) {
                        p.next = newNode(hash, key, value, null);
                        // 当链表长度大于等于8时转为红黑树
                        if (binCount >= TREEIFY_THRESHOLD - 1) // -1 for 1st
                            treeifyBin(tab, hash);
                        break;
                    }
                    // 如果hash相等并且equals相等则覆盖原来的值不进行任何操作break跳出循环
                    if (e.hash == hash &&
                        ((k = e.key) == key || (key != null && key.equals(k))))
                        break;
                    p = e;
                }
            }
            if (e != null) { // existing mapping for key
                V oldValue = e.value;
                if (!onlyIfAbsent || oldValue == null)
                    e.value = value;
                afterNodeAccess(e);
                return oldValue;
            }
        }
        ++modCount;
        if (++size > threshold)
            resize();
        afterNodeInsertion(evict);
        return null;
    }
```
**resize()**
```java
final Node<K,V>[] resize() {
		// 第一次put此时table还未被初始化,table为null
        Node<K,V>[] oldTab = table;
        // oldCap=0
        int oldCap = (oldTab == null) ? 0 : oldTab.length;
        // 当前容量
        int oldThr = threshold;
        int newCap, newThr = 0;
        if (oldCap > 0) {
            if (oldCap >= MAXIMUM_CAPACITY) {
                threshold = Integer.MAX_VALUE;
                return oldTab;
            }
            else if ((newCap = oldCap << 1) < MAXIMUM_CAPACITY &&
                     oldCap >= DEFAULT_INITIAL_CAPACITY)
                newThr = oldThr << 1; // double threshold
        }
        else if (oldThr > 0) // initial capacity was placed in threshold
            newCap = oldThr;
        // 首次初始阈值表示使用默认值
        else {               // zero initial threshold signifies using defaults
            newCap = DEFAULT_INITIAL_CAPACITY;
            newThr = (int)(DEFAULT_LOAD_FACTOR * DEFAULT_INITIAL_CAPACITY);
        }
        if (newThr == 0) {
            float ft = (float)newCap * loadFactor;
            newThr = (newCap < MAXIMUM_CAPACITY && ft < (float)MAXIMUM_CAPACITY ?
                      (int)ft : Integer.MAX_VALUE);
        }
        threshold = newThr;
        @SuppressWarnings({"rawtypes","unchecked"})
        // 初始化table数组
        Node<K,V>[] newTab = (Node<K,V>[])new Node[newCap];
        table = newTab;
        if (oldTab != null) {
            for (int j = 0; j < oldCap; ++j) {
                Node<K,V> e;
                if ((e = oldTab[j]) != null) {
                    oldTab[j] = null;
                    // 该节点没有next节点,处理不是链表的情况
                    if (e.next == null)
                    	// 重新确认在新数组中的位置,再将该元素放入新数组
                        newTab[e.hash & (newCap - 1)] = e;
                    else if (e instanceof TreeNode)
                        ((TreeNode<K,V>)e).split(this, newTab, j, oldCap);
                    else { // preserve order
                        Node<K,V> loHead = null, loTail = null;
                        Node<K,V> hiHead = null, hiTail = null;
                        Node<K,V> next;
                        do {
                            next = e.next;
                            if ((e.hash & oldCap) == 0) {
                                if (loTail == null)
                                    loHead = e;
                                else
                                    loTail.next = e;
                                loTail = e;
                            }
                            else {
                                if (hiTail == null)
                                    hiHead = e;
                                else
                                    hiTail.next = e;
                                hiTail = e;
                            }
                        } while ((e = next) != null);
                        if (loTail != null) {
                            loTail.next = null;
                            newTab[j] = loHead;
                        }
                        if (hiTail != null) {
                            hiTail.next = null;
                            newTab[j + oldCap] = hiHead;
                        }
                    }
                }
            }
        }
        return newTab;
    }
```
## 关于HashMap的一些问题
###  HashMap的底层结构、原理、扩容机制

HashMap底层结构由数组和链表和红黑树组成

在JDK1.8之前是由数组 + 链表组成

1.7: 数组中存储的是Entry对象, Entry对象包含hash, key, value及下一个节点的引用, 当发生Hash冲突时会通过equals方法对key进行比较一致, 则覆盖并返回原值; 不一致则使用头插法把新加入的元素放入数据对应位置, 原有元素放到新加入元素尾部

JDK1.8开始是由数组 + 链表 + 红黑树组成

1.8: 在JDK1.8引入红黑树数据结构, 目的是针对链表查询效率不高的问题, 提升发生Hash冲突时HashMap的性能，为什么不使用其他的树结构是因为红黑树在插入, 删除, 查询性能中比较平衡, 针对HashMap需要频繁做插入删除等操作, 使用红黑树在综合性能更优   

其中1.8是使用尾插法进行链表元素添加的, 因为本身就需要去遍历链表元素比较key是否相同

1. HashMap是如何确定数组下标的

   先通过Key, 取HashCode通过运算获取到一个Hash值(通过HashCode做异或等操作), 再使用这个Hash值与HashMap的容量使用二进制按位与的操作, 确定数组下标

2. HashMap由哪些数据结构组成

   JDK1.8之前由数组 + 链表组成, JDK1.8开始由数组 + 链表 + 红黑树组成；当链表长度超过8链表转为红黑树；使用红黑树是综合最优的选择相对其他数据结构(如AVL自平衡二叉查找树)综合性能更优红黑树的查询和插入效率都比较高。当红黑树的的节点个数小于6红黑树转为链表这两个阈值不一样主要是防止节点数量在8来回变化导致在红黑树和链表之间来回切换

3. HashMap默认容量和负载因子是多少

   默认容量: 16 默认负载因子: 0.75

4. HashMap初始化时，如果指定容量大小为10，那么实际大小是多少

   16

5. HashMap容量为什么要取2的幂次方

   a. 提升计算效率: 因为在HashMap中计算数组索引位置的公式是index = hash & (n-1)其中n是容量, 如果要让计算结果位于数组的容量范围通常是需要取余(取模)计算, 但是如果是使用按位与, 2幂次方减去1例如16-1=15 用二进制来表示则高位全是0 低位为1111此时使用hash&(n-1)等同于 hash%n(取模运算)但位运算（`&`）比取模（`%`）快数十倍。

   b. 哈希分布更均匀: 当容量为2的幂次方时，哈希值的低位决定了桶的位置。结合良好的哈希函数（如JDK 8中的扰动函数），哈希值的高位也参与运算，从而降低冲突概率。

---

> 本文最初发布于 CSDN：[查看原文](https://blog.csdn.net/qq_42618152/article/details/118894019)。
