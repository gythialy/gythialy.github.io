title: Jetty 配置 Log4J
date: 2016-03-28 13:15:48
categories: Notes
tags:
- Jetty
- Log4J
---

## 缘起

我们一台很老的装置中用了 Jetty v7.1.6，由于种种原因，不能升级新版本。某次由于一个 bug 导致一直写日志，最后把硬盘给写爆了，所以用 Log4J 记录日志，方便控制日志大小等。

> 注：在 Jetty 最新的版本中，配置 Log4J 并不需要如此。

## 配置

1. 下载 Log4J
	- log4j-1.2.17.jar
	- slf4j-api-1.7.9.jar
	- slf4j-log4j12-1.7.9.jar

1.  复制 jar 包到 Jetty 目录中 `lib/ext` 文件夹中
    ```
    -rwxr-xr-x 1 root root      0 Jul 16  2010 .donotdelete
    -rw-r--r-- 1 root root 489884 Nov 19 13:06 log4j-1.2.17.jar
    -rw-r--r-- 1 root root  32121 Nov 19 13:09 slf4j-api-1.7.9.jar
    -rw-r--r-- 1 root root   8867 Nov 19 16:55 slf4j-log4j12-1.7.9.jar
    ```

1. 在 Jetty 目录中 resources 文件夹中新建 `log4j.properties`

    ```properties
    # Basic Log4j Configuration with STDOUT and File logging
    log4j.rootLogger=DEBUG, filer

    log4j.appender.stdout=org.apache.log4j.ConsoleAppender
    log4j.appender.stdout.Target=System.out
    log4j.appender.stdout.layout=org.apache.log4j.PatternLayout
    log4j.appender.stdout.layout.ConversionPattern=%d{ABSOLUTE} %5p %c{1}:%L - %m%n

    log4j.appender.filer=org.apache.log4j.RollingFileAppender
    log4j.appender.filer.layout=org.apache.log4j.PatternLayout
    log4j.appender.filer.layout.ConversionPattern=%d{ABSOLUTE} %5p %c{1}:%L - %m%n
    log4j.appender.filer.File=${jetty.home}/logs/jetty.log
    log4j.appender.filer.MaxFileSize=1MB
    log4j.appender.filer.MaxBackupIndex=20
    ```
    > 为了测试日志，配置设置的日志打印级别为DEBUG，单个文件大小为 1M，实际使用中根据具体使用场景调整。

1. 修改 `start.ini`，OPTIONS 中 `ext` 必须放在 `resources` 前面

    ```ini
    #===========================================================
    # Start classpath OPTIONS.
    # These control what classes are on the classpath
    # for a full listing do
    #   java -jar start.jar --list-options
    #-----------------------------------------------------------
    OPTIONS=Server,jsp,jmx,websocket,ext,resources
    #-----------------------------------------------------------
    ```

    > 注：如需手动设置 JVM 内存配置，需要添加 `--exec`。这样就会有一个 java 进程常在。

1. 创建启动脚本，原理很简单，就是设置 `JAVA_HOME` 和 `JETTY_HOME` 两个环境变量，然后调用 Jetty 自身的脚本。如果已经设置全局的环境变量，此步可省略

    ```bash
    #!/bin/sh

    export JAVA_HOME=/usr/java/jdk
    export JETTY_HOME=/home/data/jetty

    cd $JETTY_HOME/bin
    pwd
    case "$1" in
    	start)
    		./jetty.sh start
        		;;
      	stop)
    		./jetty.sh stop
        		;;
    	restart)
       		./jetty.sh restart
    		;;
    	*)
    		echo "Usage: $0 $1 {start|stop|restart}"
    		;;

    esac
    exit 0
    ```

    > 脚本中 `JAVA_HOME` 和 `JETTY_HOME` 是必须的。

## 效果

```
-rw-r--r-- 1 root root   27995 Nov 30 14:51 2015_11_27.stderrout.log
-rw-r--r-- 1 root root    8060 Nov 30 14:51 EA0104-0.log
-rw-r--r-- 1 root root  968686 Nov 30 14:52 jetty.log
-rw-r--r-- 1 root root 1050948 Nov 27 15:57 jetty.log.1
-rw-r--r-- 1 root root 1048812 Nov 27 15:52 jetty.log.10
-rw-r--r-- 1 root root 1050923 Nov 27 15:52 jetty.log.11
-rw-r--r-- 1 root root 1051665 Nov 27 15:49 jetty.log.12
-rw-r--r-- 1 root root 1050713 Nov 27 15:47 jetty.log.13
-rw-r--r-- 1 root root 1051495 Nov 27 15:47 jetty.log.14
-rw-r--r-- 1 root root 1052634 Nov 27 15:47 jetty.log.15
-rw-r--r-- 1 root root 1052521 Nov 27 15:29 jetty.log.16
-rw-r--r-- 1 root root 1049512 Nov 27 15:29 jetty.log.17
-rw-r--r-- 1 root root 1051501 Nov 27 15:29 jetty.log.18
-rw-r--r-- 1 root root 1049831 Nov 27 15:56 jetty.log.2
-rw-r--r-- 1 root root 1051016 Nov 27 15:56 jetty.log.3
-rw-r--r-- 1 root root 1049532 Nov 27 15:56 jetty.log.4
-rw-r--r-- 1 root root 1052064 Nov 27 15:56 jetty.log.5
-rw-r--r-- 1 root root 1049274 Nov 27 15:56 jetty.log.6
-rw-r--r-- 1 root root 1050903 Nov 27 15:56 jetty.log.7
-rw-r--r-- 1 root root 1051740 Nov 27 15:52 jetty.log.8
-rw-r--r-- 1 root root 1052915 Nov 27 15:52 jetty.log.9
-rw-r--r-- 1 root root      55 Nov 27 15:52 start.log
```

> start.log 是 start.jar 创建的，会根据 `etc/jetty-logging.xml` 中配置决定是否从定向内容。

---EOF---
