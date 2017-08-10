---
layout: h
title: install and config supervisor
tags:
  - Supervisor
  - Ubuntu
categories: Notes
date: 2017-08-10 15:17:29
---




### 在线安装

- 通过 `Setuptools`安装

  `easy_install supervisor`

- Ubuntu 安装

  `sudo apt-get install supervisor `

### 离线安装

- 从 [PyPi](http://pypi.python.org/pypi/supervisor) 下载 `supervisor`离线包
- 下载依赖项
  - setuptools (latest) from [http://pypi.python.org/pypi/setuptools](http://pypi.python.org/pypi/setuptools).
  - meld3 (latest) from [http://www.plope.com/software/meld3/](http://www.plope.com/software/meld3/).
- 分别通过 `python setup.py install` 安装

> 注：根据不同的系统，可能需要 root 权限执行安装

<!--- more--->

### 配置

- 生成默认配置

  ```shell
  # 创建配置文件目录
  mkdir -p /etc/supervisor
  # 生成默认配置
  sudo sh -c '/usr/local/bin/echo_supervisord_conf  > /etc/supervisor/supervisor.conf'
  ```

- 修改配置
  ```
  [program:jx-ws]
  command                 = /bin/bash jx-ws
  directory               = /home/${user.home}/opt/jx-ws-shadow-1.0.0/bin
  autostart               = true
  autorestart             = true
  stdout_logfile          = /var/log/ws/out.log
  stdout_logfile_maxbytes = 50MB
  stderr_logfile          = /var/log/ws/err.log
  stderr_logfile_maxbytes = 10MB
  ```

  说明: 
   - 如果启动的程序为 shell，需要在前面增加 `/bin/bash`
   - `directory` 设置为可执行程序的上级目录
   - log目录不会自动创建，需手动创建，但是日志文件会自动生成
   - Java 中通过 `user.dir`获取到的目录为 `supervisor` 的目录，如需获取程序所在 jar 的运行目录需自行处理
   - 启动需要 root 权限，可通过 `sudo supervisord -c /etc/supervisor/supervisor.conf` 指定配置路径

### 运行

- 启动 `sudo supervisord -c /etc/supervisor/supervisor.conf`

  ```shell
  supervisord -- run a set of applications as daemons.

  Usage: /usr/bin/supervisord [options]

  Options:
  -c/--configuration FILENAME -- configuration file
  -n/--nodaemon -- run in the foreground (same as 'nodaemon=true' in config file)
  -h/--help -- print this usage message and exit
  -v/--version -- print supervisord version number and exit
  -u/--user USER -- run supervisord as this user (or numeric uid)
  -m/--umask UMASK -- use this umask for daemon subprocess (default is 022)
  -d/--directory DIRECTORY -- directory to chdir to when daemonized
  -l/--logfile FILENAME -- use FILENAME as logfile path
  -y/--logfile_maxbytes BYTES -- use BYTES to limit the max size of logfile
  -z/--logfile_backups NUM -- number of backups to keep when max bytes reached
  -e/--loglevel LEVEL -- use LEVEL as log level (debug,info,warn,error,critical)
  -j/--pidfile FILENAME -- write a pid file for the daemon process to FILENAME
  -i/--identifier STR -- identifier used for this instance of supervisord
  -q/--childlogdir DIRECTORY -- the log directory for child process logs
  -k/--nocleanup --  prevent the process from performing cleanup (removal of
                     old automatic child log files) at startup.
  -a/--minfds NUM -- the minimum number of file descriptors for start success
  -t/--strip_ansi -- strip ansi escape codes from process output
  --minprocs NUM  -- the minimum number of processes available for start success
  --profile_options OPTIONS -- run supervisord under profiler and output
                               results based on OPTIONS, which  is a comma-sep'd
                               list of 'cumulative', 'calls', and/or 'callers',
                               e.g. 'cumulative,callers')
  ```

- 查看状态 `sudo supervisorctl status`

  ```shell
  supervisorctl -- control applications run by supervisord from the cmd line.

  Usage: /usr/bin/supervisorctl [options] [action [arguments]]

  Options:
  -c/--configuration FILENAME -- configuration file path (default /etc/supervisord.conf)
  -h/--help -- print usage message and exit
  -i/--interactive -- start an interactive shell after executing commands
  -s/--serverurl URL -- URL on which supervisord server is listening
       (default "http://localhost:9001").
  -u/--username USERNAME -- username to use for authentication with server
  -p/--password PASSWORD -- password to use for authentication with server
  -r/--history-file -- keep a readline history (if readline is available)

  action [arguments] -- see below

  Actions are commands like "tail" or "stop".  If -i is specified or no action is
  specified on the command line, a "shell" interpreting actions typed
  interactively is started.  Use the action "help" to find out about available
  actions.
  ```

### [XML-RPC API Documentation](http://supervisord.org/api.html)

- 配置

  ```
  [inet_http_server]        ; inet (TCP) server disabled by default
  port=127.0.0.1:9001       ; (ip_address:port specifier, *:port for all iface)
  username=ops              ; (default is no username (open server))
  password=vipshop          ; (default is no password (open server))
  ```

- 连接

  ```python
  import xmlrpclib
  server = xmlrpclib.Server('http://ops:vipshop@127.0.0.1:9001/RPC2')
  ```

- 查询API 支持的接口

  ```python
  methods = server.system.listMethods()
  print methods
  ```



---EOF---