# CC数据库管理工具

#### 介绍

CC数据库管理工具 一款为热门数据库系统打造的管理客户端，支持建表、查询等常用功能，力求打造成简便好用的SQL工具

基于eletron + vue + node + ts + java

v1.0.2 预览版已发布 （没买代码签名，安装报毒请忽略）

优化了列表卡顿

包含 数据库连接 数据库sql执行 关键词提示等

目前支持mysql MariaDB oracle sqlserver

其中oracle不支持多条sql同时执行

#### 支持的数据库系统

| *数据库* | *SQL 查询* | *数据编辑* | *表设计器*|*智能提示*|
|-------|---------|--------|--------| --------|
|   MySQL    | 支持      | 计划中    | 计划中 | 支持 |
| MariaDB |  支持      | 计划中    | 计划中 | 支持 |
| Oracle  |  支持      | 计划中     | 计划中 | 支持 |
| SQL Server   | 支持      | 计划中     | 计划中 | 支持 |
| PostgreSQL  |         |        |
| Redis  |         |        |
| SQLite  |         |        |

#### 源码

github: https://github.com/elicscc/CCDataLink

gitee: https://gitee.com/elicscc/ccdata-link


#### 下载

win64版本下载： [下载链接](https://github.com/elicscc/CCDataLink/releases/download/v1.0.2-alpha/CC.1.0.2.exe)

外链地址： https://share.weiyun.com/z6qlN8Es

#### 软件架构
软件架构说明
1. 目前只能升级到electron 10   再往上升级nodejava编译不通过
2. 用户安装的时候会复制一个jdk到C盘目录
3. electron-re 子进程管理
4. vxe-table 列表虚拟滚动

#### 软件截图


![](readmeimg/c01.jpg)
![](readmeimg/2.jpg)
![](readmeimg/3.jpg)
![](readmeimg/6.jpg)
![](readmeimg/889.jpg)

