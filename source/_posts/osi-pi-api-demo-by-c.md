title: OSI PI C API 介绍
date: 2016-03-21 13:26:01
categories: Programming
tags:
- PI
- C
- rtdb

---
## 介绍

PI（Plant Information System）是由美国 OSIsoft 公司开发的一套基于 Client/Server 结构的商品化软件应用平台，是过程工业全厂信息集成的必然选择。作为工厂底层控制网络与上层管理信息系统网络连接的桥梁，PI 在工厂信息集成中扮演着特殊和重要的角色。更详细的介绍，可参考[百度百科](http://baike.baidu.com/view/1510581.htm)或者[官方网站](https://www.osisoft.com/software-support/what-is-pi/What_Is_PI.aspx)

## 登录数据库

要访问数据库，有两种方法，一种是通过用户名和密码登录，另一种是通过 PI Trust。官方是不建议使用密码登录的，所以在开发应用的时候，尽可能使用 PI Trust，但是国内的情况比较混乱，很多生产环境都还是使用第一次方式。

下面分别介绍两种登录方法的使用

### 用户名/密码登录

这种方式比较简单，Server 端几乎不需要任何配置，只要简单添加一个用户即可。

涉及到的 API 函数：
- `piut_setservernode` 设置 PI Server 节点，一般就是 Server 的 IP 地址
- `piut_isconnected` 是否已经和 Server 连接
- `piut_login` 传入用户名/密码，根据返回值判断是否连接成功，如果需要写数据的话，需要注意写权限

> 在 PI 3.x 中，默认是不启用用户名/密码登录的，需要注意

### PI Trust 登录

这种方式，是官方推荐做法，需要在 Server 段添加相应的 PI Trust 设置，可以设置 IP 地址/Client 名称/进程名字等，配置非常灵活。

涉及到的 API 函数：

- `piut_setservernode` 同上
- `piut_isconnected` 同上
- `piut_setprocname` 设置 Client 的进程名，需要和 Server 段设置一致
- `piut_connect` 连接 Server

示例代码，功能就是根据配置参数自动判断连接方式，因为我们生产环境是个很老的现场，所以优先使用用户名/密码登录

``` c
error_t connect_pi(server_info_t *server)
{
    int32_t result;
    int32_t valid;
    int8_t  version[SERVER_FIELD_SIZE];
    int8_t  log_tag[MAX_BUFF_SIZE];
    int8_t  pro_name[SERVER_FIELD_SIZE];

    valid = PIREAD;

    strncpy(log_tag, "connect pi", MAX_BUFF_SIZE);

    if (piut_isconnected() == 0)
    {
        //  retrieves the version number of the PI-API.
        if (piut_getapiversion(version, sizeof(version)) == 0)
        {
            ftrace_log(log_tag, "PI-API version %s", version);
        }

        if (server->misc3 == NULL || strlen(server->misc3) == 0)
        {
            strncpy(pro_name, "pi_snap", SERVER_FIELD_SIZE);
        }
        else
        {
            strncpy(pro_name, server->misc3, SERVER_FIELD_SIZE);
        }

        // sets the active PI Server node where the data for the subsequent
        // PI-API calls will be resolved
        result = piut_setservernode(server->server_ip);

        if (result)
        {
            ftrace_log(log_tag, "piut_setservernode: can not connect to %s", server->server_ip);
            return E_CONNECT_FAILED;
        }

        if (server->usr_name != NULL && strlen(server->usr_name) > 0)
        {
            // establishes a user's access to PI System data based on a login to a configured user database
            result = piut_login(server->usr_name, server->usr_pwd, &valid);

            if (result == 0)
            {
                ftrace_log(log_tag, "piut_login: connect to %s successful, valid=%d", server->server_ip, valid);
                return E_SUCCESS;
            }

            ferror_log(log_tag, "piut_login: connect to %s failed, ret=%d", server->server_ip, result);
        }

        //sets the global process name to the passed string
        piut_setprocname(pro_name);
        result = piut_connect(server->server_ip);

        if (result)
        {
            ferror_log(log_tag, "piut_connect: connect to %s failed, ret=%d", server->server_ip, result);
            return E_CONNECT_FAILED;
        }
    }

    return E_SUCCESS;
}
```

## 初始化测点信息

连接上 Server 之后，需要根据测点信息，转换成数据库中对应的id，方便后面的操作

涉及到的 API 函数：

- `pipt_findpoint` 转换测点名称为测点号 (必须)
- `pipt_pointtypex` 根据测点号查询对应的测点类型
- `pipt_displaydigits` 根据测点号查询显示位数

``` C
static int16_t init_pi_tag(pi_tag_t *tag)
{
    int32_t result;
    int8_t  log_tag[MAX_BUFF_SIZE];
    strncpy(log_tag, "init_pi_tag", MAX_BUFF_SIZE);

    // gets the point number for the given tagname
    result = pipt_findpoint(tag->name, &tag->point_id);

    if (result)
    {
        ftrace_log(log_tag, "fetch point[%s] id failed.", tag->name);
        tag->stat = NOT_EXIST;
        return FALSE;
    }

    // gets the data type code for the passed point number
    result = pipt_pointtypex(tag->point_id, &tag->pt_typex);

    if (result)
    {
        ftrace_log(log_tag, "fetch point[%s] typex failed.", tag->name);
        tag->stat = INVALID;
        return FALSE;
    }

    // gets the display digits attribute for the passed point number
    result = pipt_displaydigits(tag->point_id, &tag->display_prec);

    if (result)
    {
        ftrace_log(log_tag, "fetch point[%s] display digits failed.", tag->name);
        tag->display_prec = -5;
    }

    tag->stat = NORMAL;
    tag->rval = (float64_t) 0.0;
    tag->istat = 0;
    tag->ival = 0;
    tag->flag = 0;

    ftrace_log(log_tag, "name:%s, id:%d, dis_prec: %d,type: %d", tag->name, tag->point_id, tag->display_prec, (int32_t)tag->pt_typex);

    switch (tag->pt_typex)
    {
    case PI_Type_PIstring:
    case PI_Type_blob:
    case PI_Type_PItimestamp:
        if (tag->bsize == 0)
        {
            /* Skip allocation if a subsequent run. */
            if ((tag->bval = (void *)malloc(BVALUE_BUFF)) == NULL)
            {
                error_log(log_tag, "malloc bval failed.");
                destory();
                return E_MALLOC_FAILED;
            }
        }

        tag->bsize = (tag->bsize > BVALUE_BUFF - 1) ? tag->bsize : BVALUE_BUFF - 1;
        memset(tag->bval, 0, (size_t)(tag->bsize + 1));
        break;

    case PI_Type_int16:
    case PI_Type_int32:
        tag->bsize = 0;
        break;

    case PI_Type_digital:
        tag->bsize = 0;
        break;

    default:/* floats, PI2 */
        tag->bsize = 0;
        break;
    } /* End switch */

    return TRUE;
}
```

## 查询实时数据

从快照中查询数据库，可以通过 `pisn_getsnapshot` 或者 `pisn_getsnapshotx` 查询，具体可查考 API 文档。

> 注： `pisn_getsnapshot` 获取的时间只到秒级，如果对时间精度要求比较高，需要使用 `pisn_getsnapshotx`。

``` c
int16_t getsnapshot()
{
    // init parameters etc.
    // ...

    for (index = 0; index < ptbl_data->point_size; index++, tag++)
    {
        // check server connection etc
        // ...
        tag->rval = 0;
        tag->istat = 0;

        result = pisn_getsnapshot(tag->point_id, &tag->rval, &tag->istat, &tag->time);

        if (result == 0)
        {
            ftrace_log(log_tag, "%s[0x%p] pisn_getsnapshot, rval=%f,ival=%d,time=%d", tag->name, tag, tag->rval, tag->istat, tag->time);
        }
        else if (result == -1)
        {
            tag->stat = NOT_EXIST;
            ftrace_log(log_tag, "%s pisn_getsnapshot not exist, result=%d.", tag->name, result);
        }
        else
        {
            tag->stat = INVALID;
            ftrace_log(log_tag, "%s pisn_getsnapshot failed, result=%d.", tag->name, result);
        }
    }

    return TRUE;
}
```

---EOF---
