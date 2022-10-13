+++
title = "Kafka on Docker"
description = ""
date = "2020-01-13"
aliases = ["kafka-on-docker"]
tags = ["kafka", "docker"]
author = "Luke Yao"
+++

## 建立Zookeeper容器:

这里用最简单的方式创建一个独立的Zookeeper节点, 如果要考虑zookeeper的高可用, 可以将其做成一个集群, 最好是能有多台机器.

``` shell
$ docker run -d --name zookeeper -p 2181:2181 -t wurstmeister/zookeeper
```

默认的, 容器内配置文件在, /conf/zoo.cfg, 数据和日志目录默认在/data 和 /datalog, 需要的话可以将上述目录映射到宿主机的可靠文件目录下.

## 建立kafka集群节点:

使用docker命令可快速在同一台机器搭建多个kafka, 只需要改变brokerId和端口

-  节点1:

``` shell
$ docker run  -d --name kafka0 -p 9092:9092 \
    -e KAFKA_BROKER_ID=0 \
    -e KAFKA_ZOOKEEPER_CONNECT=192.168.0.103:2181 \
    -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://192.168.0.103:9092 \
    -e KAFKA_LISTENERS=PLAINTEXT://0.0.0.0:9092 \
    -t wurstmeister/kafka
```

-  节点2:

``` shell
$ docker run -d --name kafka1 -p 9093:9093 \
    -e KAFKA_BROKER_ID=1 \
    -e KAFKA_ZOOKEEPER_CONNECT=192.168.0.103:2181 \
    -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://192.168.0.103:9093 \
    -e KAFKA_LISTENERS=PLAINTEXT://0.0.0.0:9093 \
    -t wurstmeister/kafka
```

-  节点3:

``` shell
$ docker run -d --name kafka3 -p 9095:9095 \
    -e KAFKA_BROKER_ID=2 \
    -e KAFKA_ZOOKEEPER_CONNECT=192.168.0.103:2181 \
    -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://192.168.0.103:9095 \
    -e KAFKA_LISTENERS=PLAINTEXT://0.0.0.0:9095 \
    -t wurstmeister/kafka
```

这里面主要设置了 **4** 个参数

```conf
KAFKA_BROKER_ID=0

KAFKA_ZOOKEEPER_CONNECT=192.168.0.103:2181

KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://192.168.0.103:9092

KAFKA_LISTENERS=PLAINTEXT://0.0.0.0:9092
```

中间两个参数的 `192.168.0.102` 改为 `宿主机器` 的IP地址, 如果不这么设置, 可能会导致在别的机器上访问不到 kafka.

## Kafka Manager

``` shell
$ docker run -itd --restart=always --name=kafka-manager -p 9000:9000 \
    -e ZK_HOSTS="192.168.0.103:2181" \
    -t sheepkiller/kafka-manager
```
