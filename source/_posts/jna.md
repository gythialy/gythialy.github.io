---
title: Java 通过 JNA 调用 C/C++ 接口
tags:
  - Java
  - JNA
  - C
categories: Programming
date: 2017-08-07 17:31:21
---


### 缘起

项目中调用了第三方一个 Matlab 实现的数据清洗和机组状态评价的算法，但是对方不会除 Matlab 外的其他语言，最后只用 Matlab 生成了一个 dll/lib 文件。由于对方提供的接口质量真心不好，而且对方也无力修改。最终方案只好由我方在其基础上用 C++ 重新包装一下。在给我方 Client 调用时，需要把从多数据源查询数据的细节封装掉，最终就形成了Java Client-> Java Interface->C++ Interface->Matlab/C++ Interface(第三方) 这样一个诡异的调用链。

因只是 Java 单向调用 C++ 接口，故通过 [JNA][jna] 实现。主要设计到 JNA 的结构体封装，指针声明及取值，结构体指针定义及取值。

### 实现

C++ 的封装接口逻辑非常简单，根据业务提供数据清洗和机组评价的两个接口。

由于Matlab 导出的 dll 效率是真心差，尤其时加载的时候，各种抛异常，每次加载dll大约需耗时20~30s。所以不能每次加载，故提供 `init/terminator` 实现按需加载及停用。

#### C/C++ 头文件定义

```c
#ifndef __CALCULATOR_API_H__
#define __CALCULATOR_API_H__
#include <cstdint>

#ifdef WIN32
#  define EXPORT_API __declspec(dllexport)
#else
#  define EXPORT_API 
#endif

// Random number to avoid errno conflicts
#define CALCULATOR_ENOBASE 112345678

/* Calculator exceptions */
enum
{
	CALCULATOR_EXCEPTION_ILLEGAL_FUNCTION = 0x01,
	CALCULATOR_EXCEPTION_ILLEGAL_PARA
};

#define EMBXILFUN  (CALCULATOR_ENOBASE + CALCULATOR_EXCEPTION_ILLEGAL_FUNCTION)
#define EMBXILPARA  (CALCULATOR_ENOBASE + CALCULATOR_EXCEPTION_ILLEGAL_PARA)

typedef enum
{
	H2 = 0X01,
	CH4,
	C2H2,
	C2H4,
	TOTAL_HYDROCARBON,//总烃
	CO,
	CO2
} OilChromatographyType;

/**
 * 数据清洗结果
 */
typedef struct sImproveResult
{
	int32_t valid; // 有效数据个数
	float validPercent; // 数据有效值占比
	float* abnormalData; // 异常数据
	int32_t abnormal_size; // 异常数据个数
	float* optimizeData; // 优化后的数据
	int32_t optimize_size; // 优化数据个数
} sImproveResult, *ImproveResult;

/**
 * 变压器输入参数
 */
typedef struct sTransformer
{
	float h2Value;
	float totalHydrocarbon; // 总烃
	float c2h2Value;
	float coValue;
	float co2Value;
	float dielectricLoss; // 介损
	float dcResistance; //直阻
	float absorptance; //吸收比
	float polarizeFactor; // 极化系数
	float electricCapacity; // 电容量
	float moisture; // 微水
	float breakdownVoltage; // 击穿电压
	float oilDielectricLoss; // 油介损
	float interfacialTension; //界面张力
	float electricResistivity; //电阻率
	int16_t runningLife; // 运行年限
	float ambientTemperature; // 环境温度
	float jointTemperature; //接头温度
	float oilTankTemperature; // 油箱温度
} sTransformer, *Transformer;

/**
 * 因素状态隶属度结果
 */
typedef struct sFusionResult
{
	float *h1; // 油色谱
	int16_t h1_size;
	float *h2; // 电气试验
	int16_t h2_size;
	float *h3; // 绝缘油
	int16_t h3_size;
	float *h4; // 其余项
	int16_t h4_size;
	float qz1; // 油色谱权重
	float qz2; // 电气试验权重
	float qz3; // 绝缘油权重
	float qz4; // 其余项权重
	float m; // 证据融合参数
	float n; // 证据融合参数
} sFusionResult, *FusionResult;

/**
 * 最终评价结果
 */
typedef struct sFactorResult
{
	float* state;
	int16_t state_size;
	int8_t* comment;
	int16_t comment_len;
} sFactorResult, *FactorResult;

typedef struct
{
	int64_t time;
	float value;
} sImproveInput, *ImproveInput;

typedef struct sReviewResult
{
	Transformer indexScore;
	int16_t indexScore_size;
	FusionResult indexFusion;
	FactorResult factorFusion;
} sReviewResult, *ReviewResult;

#ifdef __cplusplus
extern "C"
{
#endif

	/**
	 * 数据清洗
	 * @param  original[in]     原始数据起始地址
	 * @param  originalLen[in] 原始数据长度
	 * @param  result [out]      数据清洗结果
	 * @return 0:成功;非0：失败
	 */
	EXPORT_API int16_t improve_data(const ImproveInput original, const int32_t originalLen, ImproveResult result);

	/**
	 * 状态评价计算
	 * @param  transformer[in]  主变参数
	 * @param  result[out]     评价结果
	 * @return  0:成功;非0：失败
	 */
	EXPORT_API int16_t review_transformer(const Transformer transformer, ReviewResult result);


	/**
	 * 初始化 dll
	 * @return [description]
	 */
	EXPORT_API int16_t init();

	/**
	 * 根据 err num 获取异常信息描述
	 * @param  errnum[in] errnum
	 * @return  errnum 对应的异常信息描述
	 */
	EXPORT_API const int8_t* calculator_strerror(int errnum);
  
  	/**
  	* 停止计算模块
  	**/
  	EXPORT_API void terminator();

#ifdef __cplusplus
}
#endif
#endif /*__CALCULATOR_API_H__*/
```

#### Java 接口定义

- `CalculatorApi`

  `CalculatorApi` 提供与 C++ 头文件中声明一致的函数定义，继承 `Library`

```java
import com.sun.jna.Library;

public interface CalculatorApi extends Library {

    int improve_data(ImproveInputWrapper.ByReference original, int originalLen, ImproveResultWrapper result);

    int init();

    int review_transformer(TransformerWrapper transformer, ReviewResult result);

    void terminator();
}
```

- `FactorResultWrapper`

  作为 C++ 中 结构体 `FactorResult`的封装类，需要继承`Structure`，原始 `state`定义为 `float *`，通过 `Pointer` 与其对应。必须要实现 `getFieldOrder`,其中字段的顺序必须和 C++ 中保持一致，且所有相关字段必须要设成 `Public` 。使用的时候，用的引用传递，所以必须要实现`Structure.ByReference`接口。具体代码实现如下：

```java
import com.sun.jna.Pointer;
import com.sun.jna.Structure;

import java.util.List;

public class FactorResultWrapper extends Structure {
    private static final List<String> FIELDS_ORDER = createFieldsOrder("state", "state_size", "comment", "comment_len");
    public Pointer state;
    public int state_size;
    public String comment;
    public int comment_len;

    public static class ByReference extends FactorResultWrapper implements Structure.ByReference {
    }

    public static class ByValue extends FactorResultWrapper implements Structure.ByValue {
    }

    public FactorResultWrapper() {
        super();
    }

    @Override
    protected List<String> getFieldOrder() {
        return FIELDS_ORDER;
    }
}
```

- `FusionResultWrapper`

  作为 C++ 中 结构体 `FusionResult`的封装类，定义同上。

```java

import com.sun.jna.Pointer;
import com.sun.jna.Structure;

import java.util.List;

public class FusionResultWrapper extends Structure {
    private static final List<String> FIELDS_ORDER = createFieldsOrder("h1", "h1_size", "h2", "h2_size", "h3", "h3_size",
            "h4", "h4_size", "qz1", "qz2", "qz3", "qz4", "m", "n");
    public Pointer h1;    // 油色谱
    public int h1_size;
    public Pointer h2;    // 电气试验
    public int h2_size;
    public Pointer h3;    // 绝缘油
    public int h3_size;
    public Pointer h4;    // 其余项
    public int h4_size;
    public float qz1;    // 油色谱权重
    public float qz2;    // 电气试验权重
    public float qz3;    // 绝缘油权重
    public float qz4;    // 其余项权重
    public float m;    // 证据融合参数
    public float n;    // 证据融合参数

    public static class ByReference extends FusionResultWrapper implements Structure.ByReference {
    }

    public static class ByValue extends FusionResultWrapper implements Structure.ByValue {
    }

    @Override
    protected List<String> getFieldOrder() {
        return FIELDS_ORDER;
    }
}
```

- `ImproveInputWrapper`

  作为 C++ 中 结构体 `ImproveInput`的封装类，就是基本类型映射。

```java
import com.sun.jna.Structure;

import java.util.List;

public class ImproveInputWrapper extends Structure {
    private static final List<String> FIELDS_ORDER = createFieldsOrder("time", "value");
    public long time;
    public float value;

    public ImproveInputWrapper() {
    }

    public static class ByReference extends ImproveInputWrapper implements Structure.ByReference {
    }

    @Override
    protected List<String> getFieldOrder() {
        return FIELDS_ORDER;
    }
}
```

- `ImproveResultWrapper`

  作为 C++ 中 结构体` ImproveResult`的封装类

```java
import com.sun.jna.Pointer;
import com.sun.jna.Structure;

import java.util.List;

public class ImproveResultWrapper extends Structure {
    private static final List<String> FIELDS_ORDER = createFieldsOrder("valid", "validPercent", "abnormalData", "abnormal_size", "optimizeData", "optimize_size");

    public int valid;            // 有效数据个数
    public float validPercent;        // 数据有效值占比
    public Pointer abnormalData;    // 异常数据
    public int abnormal_size;    // 异常数据个数
    public Pointer optimizeData;    // 优化后的数据
    public int optimize_size;

    public static class ByReference extends ImproveResultWrapper implements Structure.ByReference {
    }

    @Override
    protected List<String> getFieldOrder() {
        return FIELDS_ORDER;
    }
}
```

- `ReviewResult`

  作为 C++ 中 结构体` ReviewResult`的封装类，此处包含多个结构体指针，需要通过 `ByReference`来声明，且需要分配内存。比如 `TransformerWrapper.ByReference indexScore`，需要通过 `toArray`分配内存 

```java
import com.sun.jna.Memory;
import com.sun.jna.Native;
import com.sun.jna.Structure;

import java.util.List;

public class ReviewResult extends Structure {
    private final int STATE_SIZE = 5;
    private static final List<String> FIELDS_ORDER = createFieldsOrder("indexScore", "indexScore_size", "indexFusion", "factorFusion");
    public TransformerWrapper.ByReference indexScore;
    public int indexScore_size;
    public FusionResultWrapper.ByReference indexFusion;
    public FactorResultWrapper.ByReference factorFusion;

    public ReviewResult() {
        super();
        if (indexScore_size == 0)
            indexScore_size = STATE_SIZE;
        indexScore = new TransformerWrapper.ByReference();
        TransformerWrapper[] wrappers = (TransformerWrapper[]) indexScore.toArray(indexScore_size);
        for (TransformerWrapper wrapper : wrappers) {
            wrapper.h2Value = 0f;
            wrapper.totalHydrocarbon = 0f;        // 总烃
            wrapper.c2h2Value = 0f;
            wrapper.coValue = 0f;
            wrapper.co2Value = 0f;
            wrapper.dielectricLoss = 0f;        // 介损
            wrapper.dcResistance = 0f;        //直阻
            wrapper.absorptance = 0f;            //吸收比
            wrapper.polarizeFactor = 0f;        // 极化系数
            wrapper.electricCapacity = 0f;        // 电容量
            wrapper.moisture = 0f;            // 微水
            wrapper.breakdownVoltage = 0f;    // 击穿电压
            wrapper.oilDielectricLoss = 0f;    // 油介损
            wrapper.interfacialTension = 0f;    //界面张力
            wrapper.electricResistivity = 0f; //电阻率
            wrapper.runningLife = 0;        // 运行年限
            wrapper.ambientTemperature = 0f;    // 环境温度
            wrapper.jointTemperature = 0f;        //接头温度
            wrapper.oilTankTemperature = 0f;    // 油箱温度
        }
        indexFusion = new FusionResultWrapper.ByReference();
        indexFusion.h1 = new Memory(STATE_SIZE * Native.getNativeSize(Float.TYPE));
        indexFusion.h1_size = STATE_SIZE;
        indexFusion.h2 = new Memory(STATE_SIZE * Native.getNativeSize(Float.TYPE));
        indexFusion.h2_size = STATE_SIZE;
        indexFusion.h3 = new Memory(STATE_SIZE * Native.getNativeSize(Float.TYPE));
        indexFusion.h3_size = STATE_SIZE;
        indexFusion.h4 = new Memory(STATE_SIZE * Native.getNativeSize(Float.TYPE));
        indexFusion.h4_size = STATE_SIZE;
        factorFusion = new FactorResultWrapper.ByReference();
        factorFusion.state = new Memory(STATE_SIZE * Native.getNativeSize(Float.TYPE));
        factorFusion.state_size = STATE_SIZE;
        factorFusion.comment = "";
        factorFusion.comment_len = 0;
    }

    public static class ByReference extends ReviewResult implements Structure.ByReference {
    }

    @Override
    protected List<String> getFieldOrder() {
        return FIELDS_ORDER;
    }
}
```

- `TransformerWrapper`

  作为 C++ 中 结构体` Transformer`的封装类

```java
import com.sun.jna.Structure;

import java.util.List;

public class TransformerWrapper extends Structure {
    private static final List<String> FIELDS_ORDER = createFieldsOrder("h2Value", "totalHydrocarbon", "c2h2Value", "coValue", "co2Value", "dielectricLoss",
            "dcResistance", "absorptance", "polarizeFactor", "electricCapacity", "moisture", "breakdownVoltage",
            "oilDielectricLoss", "interfacialTension", "electricResistivity", "runningLife", "ambientTemperature",
            "jointTemperature", "oilTankTemperature");

    public float h2Value;
    public float totalHydrocarbon;        // 总烃
    public float c2h2Value;
    public float coValue;
    public float co2Value;
    public float dielectricLoss;        // 介损
    public float dcResistance;        //直阻
    public float absorptance;            //吸收比
    public float polarizeFactor;        // 极化系数
    public float electricCapacity;        // 电容量
    public float moisture;            // 微水
    public float breakdownVoltage;    // 击穿电压
    public float oilDielectricLoss;    // 油介损
    public float interfacialTension;    //界面张力
    public float electricResistivity; //电阻率
    public short runningLife;        // 运行年限
    public float ambientTemperature;    // 环境温度
    public float jointTemperature;        //接头温度
    public float oilTankTemperature;    // 油箱温度

    public static class ByReference extends TransformerWrapper implements Structure.ByReference {
    }
    public static class ByValue extends TransformerWrapper implements Structure.ByValue {
    }

    public TransformerWrapper() {
        super();
    }

    @Override
    protected List<String> getFieldOrder() {
        return FIELDS_ORDER;
    }
}
```

- `CalculatorImpl`

  Java 接口的实现类，首先需要从 Jar 中解压 dll 到指定目录，然后通过此目录加载 dll。依赖关系为 Java 接口通过 JNA 加载`calculator.dll` ，而`calculator.dll`依赖 `pingjia.dll`和另外一个dll。

  三个dll必须在同一目录下， JNA 只需要加载 `calculator.dll`。因为此处只是在 WIN32 平台执行，所以加载时，通过 `Native.loadLibrary` 加载的时候，在文件名前加了 `/`，否则 JNA 会在文件前增加平台相关的perfix导致加载失败。

```java
public class CalculatorImpl implements Calculator {
    private static final Log LOGGER = Logs.getLog(CalculatorImpl.class);
    private static CalculatorApi CALCULATOR_API;
    
    static {
        try {
            String current = System.getProperty("user.dir");
            File matlab = new File(current, "matlab");
            System.setProperty("java.library.path", matlab.getPath());
            System.setProperty("jna.library.path", matlab.getPath());
          	// 从 Jar 包 resources 中解压 dll 到指定目录 
          	// Files.createDirIfNoExists(matlab);
            // Files.clearDir(matlab);
         	
           	// 加载 dll 并映射成 Java 接口
            CALCULATOR_API = Native.loadLibrary("/calculator.dll", CalculatorApi.class);
          	// 初始化dll (C++ 实现)
            int ret = CALCULATOR_API.init();
            LOGGER.debugf("init calculator (%d)", ret);
        } catch (Exception e) {
            LOGGER.error(e.getMessage(), e);
        }
    }
}
```

#### 使用

- `improveData ` 数据清洗，需要根据Java Wrapper的接口，组织数据，内存都在 Java 端分配，由 Java 端负责回收。`Pointer`的内存分配，通过 `new Memory(size)`来分配。

```java
private TwoTuple<String, CalculationResult> improveData(String label, List<TwoTuple<String, Float>> values)
            throws CalculatorException {
        ImproveInputWrapper.ByReference inputsRef = new ImproveInputWrapper.ByReference();
        final int valueSize = values.size();
        ImproveInputWrapper[] inputs = (ImproveInputWrapper[]) inputsRef.toArray(valueSize);
        LOGGER.debug(label + " inputs: ");
        for (int i = 0; i < valueSize; i++) {
            try {
                TwoTuple<String, Float> entry = values.get(i);
                Date date = FORMATTER.parse(entry.getKey());
                inputs[i].time = date.getTime();
                inputs[i].value = entry.getValue();
                LOGGER.debugf("%d: %s(%d) -> %f", i, entry.getKey(), inputs[i].time, inputs[i].value);
            } catch (ParseException e) {
                LOGGER.error(e.getMessage(), e);
            }
        }

        ImproveResultWrapper.ByReference impResultRef = new ImproveResultWrapper.ByReference();
        impResultRef.abnormalData = new Memory(valueSize * Native.getNativeSize(Float.TYPE));
        impResultRef.abnormalData.setFloat(0, 0);
        impResultRef.optimizeData = new Memory(valueSize * Native.getNativeSize(Float.TYPE));
        impResultRef.optimizeData.setFloat(0, 0);
        impResultRef.abnormal_size = 0;
        impResultRef.validPercent = 0;
        impResultRef.optimize_size = 0;

        int flag = CALCULATOR_API.improve_data(inputsRef, inputs.length, impResultRef);
        LOGGER.debug("improve_data flag: " + flag);
        CalculationResult.CalculationResultBuilder builder = CalculationResult.CalculationResultBuilder
                .aCalculationResult().withOriginalData(values);
        if (flag == 0) {
 builder.withValidPercent(impResultRef.validPercent).withValidSize(impResultRef.valid);
            int abnormalSize = impResultRef.abnormal_size;
            LOGGER.debug("abnormalSize: " + abnormalSize);
            if (abnormalSize > 0) {
                float[] abnormalValues = impResultRef.abnormalData.getFloatArray(0, abnormalSize);
                builder.withAbnormalData(Collections.unmodifiableList(Lang.array2list(abnormalValues, Float.class)));
            } else {
                builder.withAbnormalData(Collections.<Float>emptyList());
            }
            int optimizeSize = impResultRef.optimize_size;
            LOGGER.debug("optimizeSize: " + optimizeSize);
            if (optimizeSize > 0) {
                float[] optimizeValues = impResultRef.optimizeData.getFloatArray(0, optimizeSize);
                builder.withOptimizeData(Collections.unmodifiableList(Lang.array2list(optimizeValues, Float.class)));
            } else {
                builder.withOptimizeData(Collections.<Float>emptyList());
            }
        }

        CalculationResult result = builder.build();
        LOGGER.debug(result);

        return new TwoTuple<>(label, result);
    }
```

- `reviewTransformer` 机组状态评价，获取 `float *`的数据时候的，需要通过 `getFloatArray` 获取数据。

```java
private TransformerResult reviewTransformer(Map<String, Float> values) throws CalculatorException {
        TransformerWrapper.ByReference transformerRef = new TransformerWrapper.ByReference();
        setTransformer(transformerRef, values);

        ReviewResult.ByReference reviewResultRef = new ReviewResult.ByReference();
        int flag = CALCULATOR_API.review_transformer(transformerRef, reviewResultRef);
        LOGGER.debugf("review_transformer flag: %d", flag);

        TransformerResult result = new TransformerResult();
        if (flag == 0) {
            float[] states = reviewResultRef.factorFusion.state.getFloatArray(0,
                    reviewResultRef.factorFusion.state_size);
            result.setState(states).setComment(reviewResultRef.factorFusion.comment);

            float[] h1 = reviewResultRef.indexFusion.h1.getFloatArray(0, reviewResultRef.indexFusion.h1_size);
            result.setH1(h1);
            float[] h2 = reviewResultRef.indexFusion.h2.getFloatArray(0, reviewResultRef.indexFusion.h2_size);
            result.setH2(h2);
            float[] h3 = reviewResultRef.indexFusion.h3.getFloatArray(0, reviewResultRef.indexFusion.h3_size);
            result.setH3(h3);
            float[] h4 = reviewResultRef.indexFusion.h4.getFloatArray(0, reviewResultRef.indexFusion.h4_size);
            result.setH4(h4);
            result.setQz1(reviewResultRef.indexFusion.qz1).setQz2(reviewResultRef.indexFusion.qz2)
                    .setQz3(reviewResultRef.indexFusion.qz3).setQz4(reviewResultRef.indexFusion.qz4)
                    .setM(reviewResultRef.indexFusion.m).setN(reviewResultRef.indexFusion.n);

            TransformerWrapper[] wrappers = (TransformerWrapper[]) reviewResultRef.indexScore.toArray(reviewResultRef.indexScore_size);
            Transformer[] transformers = transformerWrapperToTransformer(wrappers);
            result.setTransformers(transformers);
            LOGGER.debug("transfer review result.");
        }

        return result;
    }
```

### 小结

- 优点
  - Java 端不需要编写C/C++代码
- 缺点
  - 需要编写与 C/C++ 对应的结构体映射，碰到复杂的结构体工作量不小
  - 结构体指针/数据通过 `toArray`获取数据时，效率较低，尤其时数据量比较大的时候
  - 如果时C/C++端分配的内存，Java 端管理不了，如果C/C++不提供显式回收接口，会导致内存泄露
  - 代码不规范，破坏了OO封装性，比如 field 必须要 Public
  - 需要实现 `Structure.ByReference`接口，这些明显都可以通过注解来解决



[jna]:https://github.com/java-native-access/jna	"Java Native Access"

---EOF---