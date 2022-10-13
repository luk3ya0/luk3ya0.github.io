+++
title = "Docker MySQL Canal"
description = ""
date = "2020-05-28"
aliases = ["about-canal","mysql-binlog"]
author = "Luke Yao"
tags = ["mysql", "docker", "canal", "binlog"]
+++

## 创建 docker network

```bash
docker network create --subnet=172.18.0.0/16 mynetwork
# 172.17.0.0/16 has been used as default network
```

## 镜像准备

1. docker desktop for Mac \> Preferences \> Docker Engine \> 配置 docker 镜像

2. 使用命令 `docker pull canal/canal-server` 拉取 canal-server 镜像

3. 使用命令 `docker pull mysql` 拉取 mysql 镜像

4. 使用命令 `docker pull canal/canal-admin` 拉取 canal-admin 镜像

## 容器拉起

1. MySQL - 33306

``` bash
docker run -d --name mysql --net mynetwork --ip 172.18.0.6 -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root mysql
```

2. Canal-Server

``` bash
docker run -d --name canal-server --net mynetwork --ip 172.18.0.9 -p 11111:11111 canal/canal-server
```

## MySQL的配置修改

以上只是初步准备好了基础的环境, 但是怎么让canal伪装成salve并正确获取mysql中的binary log呢？

对于自建 MySQL , 需要先开启 `Binlog` 写入功能, 配置 `binlog-format` 为 ROW 模式, 通过修改mysql配置文件来开启 bin~log~, 使用 `find / -name my.cnf` 查找 `my.cnf`, 修改文件内容如下

```pkgconfig
[mysqld]
log-bin=mysql-bin # 开启 binlog
binlog-format=ROW # 选择 ROW 模式
server_id=1       # 配置 MySQL replaction 需要定义, 不要和 canal 的 slaveId 重复
```

进入 MySQL 容器, 创建账户 canal 并授于相关权限


```shell
$ docker exec -it mysql /bin/bash
...
# mysql -uroot -proot
...
mysql> CREATE USER canal IDENTIFIED BY 'canal';
Query OK, 0 rows affected (0.01 sec)

mysql> GRANT SELECT, REPLICATION SLAVE, REPLICATION CLIENT ON *.* TO 'canal'@'%';
Query OK, 0 rows affected (0.00 sec)

mysql> -- GRANT ALL PRIVILEGES ON *.* TO 'canal'@'%' ;
mysql> FLUSH PRIVILEGES;
Query OK, 0 rows affected (0.00 sec)

mysql>
```

验证:

``` bash
mysql> show variables like 'log_bin';
+---------------+-------+
| Variable_name | Value |
+---------------+-------+
| log_bin       | ON    |
+---------------+-------+
1 row in set (0.00 sec)

mysql> show variables like 'binlog_format';
+---------------+-------+
| Variable_name | Value |
+---------------+-------+
| binlog_format | ROW   |
+---------------+-------+
1 row in set (0.00 sec)

mysql> show master status;
+------------------+----------+--------------+------------------+-------------------+
| File             | Position | Binlog_Do_DB | Binlog_Ignore_DB | Executed_Gtid_Set |
+------------------+----------+--------------+------------------+-------------------+
| mysql-bin.000001 |      156 |              |                  |                   |
+------------------+----------+--------------+------------------+-------------------+
1 row in set (0.00 sec)

mysql>
```
