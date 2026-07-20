---
author: "ycr97"
pubDatetime: 2020-04-09T00:00:00+08:00
title: "踩坑日记--Springboot整合Mybatis配置多数据源"
draft: false
tags: ["Spring"]
category: "Web 开发"
description: "坑 主要的在SpringBoot整合Mybatis配置多数据源的过程中抛异常:==java.lang.IllegalArgumentException: jdbcUrl is required with driverClassName.== 原因: 数据库配置jdbc的==jdbc-url==写成==url== 1.数据库配置文件 注意:url修改为j..."
---

### 坑
###### 主要的在SpringBoot整合Mybatis配置多数据源的过程中抛异常:==java.lang.IllegalArgumentException: jdbcUrl is required with driverClassName.==
### 原因:
###### 数据库配置jdbc的==jdbc-url==写成==url==
#### 1.数据库配置文件

```yaml
spring:
  datasource:
    primarydb:
      jdbc-url: jdbc:mysql://localhost:3306/testdb?serverTimezone=UTC&useUnicode=true&characterEncoding=utf-8&useSSL=false
      username: xxx
      password: ***
      driver-class-name: com.mysql.cj.jdbc.Driver
    secondarydb:
      jdbc-url: jdbc:mysql://localhost:3306/testdb2?serverTimezone=UTC&useUnicode=true&characterEncoding=utf-8&useSSL=false
      username: xxx
      password: ***
      driver-class-name: com.mysql.cj.jdbc.Driver
```
**注意**:url修改为jdbc-url，在单数据源配置中，使用的是url，不是jdbc-url。多数据源配置中使用url启动会报错.我也是参考另外一篇博客https://blog.csdn.net/m0_37872413/article/details/91347083.
#### 2.配置类
##### (1)主数据源配置类:

```java
import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.SqlSessionTemplate;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;

import javax.sql.DataSource;

@Configuration
@MapperScan(basePackages = "com.yy.bootlaunch.generator.testdb", //数据源primary-testdb库接口存放目录
        sqlSessionTemplateRef = "primarySqlSessionTemplate")
public class PrimarydbDataSourceConfig {

    // 将这个对象放入Spring容器中
    @Bean(name = "primaryDataSource")
    // 读取application.properties中的配置参数映射成为一个对象
    // prefix表示参数的前缀
    @ConfigurationProperties(prefix = "spring.datasource.primarydb")   //数据源primary配置
    // 表示这个数据源是默认数据源
    @Primary
    public DataSource testDataSource() {
        return DataSourceBuilder.create().build();
    }

    @Bean(name = "primarySqlSessionFactory")
    @Primary
    // @Qualifier表示查找Spring容器中名字为test1DataSource的对象
    public SqlSessionFactory testSqlSessionFactory(
            @Qualifier("primaryDataSource") DataSource dataSource) throws Exception {
        SqlSessionFactoryBean bean = new SqlSessionFactoryBean();
        bean.setDataSource(dataSource);
        //设置XML文件存放位置，如果参考上一篇Mybatis最佳实践，将xml和java放在同一目录下，这里不用配置
        //bean.setMapperLocations(new PathMatchingResourcePatternResolver().getResources("classpath:mybatis/mapper/test1/*.xml"));
        return bean.getObject();
    }

    @Bean(name = "primaryTransactionManager")
    @Primary
    public DataSourceTransactionManager testTransactionManager(
            @Qualifier("primaryDataSource") DataSource dataSource) {
        return new DataSourceTransactionManager(dataSource);
    }

    @Bean(name = "primarySqlSessionTemplate")
    @Primary
    public SqlSessionTemplate testSqlSessionTemplate(
            @Qualifier("primarySqlSessionFactory") SqlSessionFactory sqlSessionFactory) throws Exception {
        return new SqlSessionTemplate(sqlSessionFactory);
    }

}

```
##### (2)副数据源配置类:

```java

import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.SqlSessionTemplate;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;

import javax.sql.DataSource;

@Configuration
@MapperScan(basePackages = "com.yy.bootlaunch.generator.testdb2",     //注意这里testdb2目录
        sqlSessionTemplateRef = "secondarySqlSessionTemplate")
public class SecondaryDataSourceConfig {

    @Bean(name = "secondaryDataSource")
    @ConfigurationProperties(prefix = "spring.datasource.secondarydb")    //注意这里secondary配置
    public DataSource testDataSource() {
        return DataSourceBuilder.create().build();
    }

    @Bean(name = "secondarySqlSessionFactory")
    public SqlSessionFactory testSqlSessionFactory(
                        @Qualifier("secondaryDataSource") DataSource dataSource) throws Exception {
        SqlSessionFactoryBean bean = new SqlSessionFactoryBean();
        bean.setDataSource(dataSource);
        //bean.setMapperLocations(new PathMatchingResourcePatternResolver().getResources("classpath:mybatis/mapper/test1/*.xml"));
        return bean.getObject();
    }

    @Bean(name = "secondaryTransactionManager")
    public DataSourceTransactionManager testTransactionManager(
                        @Qualifier("secondaryDataSource") DataSource dataSource) {
        return new DataSourceTransactionManager(dataSource);
    }

    @Bean(name = "secondarySqlSessionTemplate")
    public SqlSessionTemplate testSqlSessionTemplate(
                        @Qualifier("secondarySqlSessionFactory") SqlSessionFactory sqlSessionFactory) throws Exception {
        return new SqlSessionTemplate(sqlSessionFactory);
    }

}
```

---

> 本文最初发布于 CSDN：[查看原文](https://blog.csdn.net/qq_42618152/article/details/105405961)。
