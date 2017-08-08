title: eDNA C API 介绍
date: 2016-03-22 09:30:11
categories: Programming
tags:
- C
- eDNA
- rtdb
---

## 介绍

eDNA是一个领导性的实时/历史数据系统。eDNA采集、存储和展示大量的工程和运行信息。eDNA将深入在整个企业范围内的数据采集上来，以极高的无损压缩方式存储起来，使得以时间序列频繁变化的数据能以原有的数据精度和时间精度在线保存多达几十年。eDNA使基于运行状况的及时和准确的决策成为可能，极大地降低运行成本。eDNA具有完全分布的体系结构，让正确的人在正确的时间做出正确的决定。eDNA是一套实时的运行管理解决方案，它提供了对你的生产运行中无限制的观察和分析，使得你能够根据丰富的信息迅速地做出决策，你的一线生产能力将会大大提高。via [印步](http://www.ybsoftware.com.cn/products.asp)

## API

eDNA 分为两种：
- 常规API：支持 C/C++/Visual Basic 等。这种方式需要自己组装报文，虽然有相关 API 函数支持，但是实际应用起来还是比较麻烦
- EzDNA：封装了常用的操作，只需要引入一个头文件 (`EzDnaApi.h`) 即可。

> 注：两种方式都需要安装 eDNA 的 Client 程序。

## 示例代码

涉及到的 API 函数：

- `DNAGoodPointFormat` 检查测点名称是否符合命名规范
- `DoesIdExist` 检查测点是否存在
- `DNAGetRTFull` 查询指定测点的实时数据
- `DNAGetHSFull` 同上

> 注： `DNAGetHSFull` 查询到的时间精度是毫秒，如果对时间有要求，建议使用此函数。但是在实际使用过程中，发现此函数有时候会查询不到数据。

```C
int16_t getsnapshot()
{
    edna_tag_t  *tag;
    int32_t     index;
    int32_t     *buff_size;
    int16_t     counter;
    int32_t		ret;
    int8_t      log_tag[MAX_BUFF_SIZE];
    int8_t	szValue[EDNA_LEN];
    int32_t ptTime;

    int8_t szmS[EDNA_LEN];
    uint16_t pusStatus;
    int8_t szStatus[EDNA_LEN];
    int8_t szDesc[EDNA_DESC_LEN];
    int8_t szUnits[EDNA_LEN];

    strncpy(log_tag, "getsnapshot", MAX_BUFF_SIZE);
    // init parameters
    // ....

    for (index = 0; index < ptbl_data->point_size; index++, tag++)
    {
        // other stuff
        // ...

        if (tag->flag == E_EMPTY_TAG) continue;

        // tests the string, validating it as a fully qualified eDNA point name
        if (DNAGoodPointFormat(tag->name) == 0)
        {
            tag->flag = INVALID;
            continue;
        }

        // check point name is exist
        if (!DoesIdExist(tag->name))
        {
            tag->flag = NOT_EXIST;
            continue;
        }

        // retrieves the value, time and status in their raw formats
        ret = DNAGetRTFull(tag->name, &tag->value, szValue, EDNA_LEN, &ptTime, tag->ts,
                          EDNA_LEN, &pusStatus, szStatus, EDNA_LEN, szDesc,
                          EDNA_DESC_LEN, szUnits, EDNA_LEN);

#if 0

        ret = DNAGetHSFull(tag->name, &tag->value, szValue, EDNA_LEN, &ptTime, tag->ts,
                           EDNA_LEN, &tag->ms, szmS, EDNA_LEN, &pusStatus, szStatus,
                           EDNA_LEN, szDesc, EDNA_DESC_LEN, szUnits, EDNA_LEN);
#endif


        tag->flag = (ret == 0) ? NORMAL : OFFLINE;
    }

    return TRUE;
}
```

---EOF---
