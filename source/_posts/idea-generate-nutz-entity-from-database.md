---
title: IDEA 通过数据库生成 Nutz 实体类
date: 2018-02-07 15:41:49
categories: Programming 
tags:
- Groovy
- IDEA
- IDEA
- Nutz
---

## 缘起

[Nutz](https://github.com/nutzam/nutz) 是一套开源的 Web Framework(Mvc/Ioc/Aop/Dao/Json)，其中 Dao 模块是针对 JDBC 的薄封装，事务模板，无缓存。在数据库已经设计好之后，手动写对应的 Entity 的话，是个无比痛苦且无意义的事情。下面就通过 IDEA 自带的 DataGrip 基础上根据数据库信息一键生成 Entity

## 插件

-  在 `Scratches` 视图下的 `Extensions/schema` 新建一个文件，命名任意，比如 `Generate nutz POJOs.groovy`

    ![Scratches](/uploads/Snipaste_2018-02-07_15-53-39.png)

<!-- more -->

- 把下面的代码复制到刚才创建的文件中

    ```groovy
    import com.intellij.database.model.DasTable
    import com.intellij.database.model.ObjectKind
    import com.intellij.database.util.Case
    import com.intellij.database.util.DasUtil

    /*
    * Available context bindings:
    *   SELECTION   Iterable<DasObject>
    *   PROJECT     project
    *   FILES       files helper
    */

    /* 包名，也可以直接修改生成的 Java 文件 */
    packageName = "com.sample;"
    typeMapping = [
            (~/(?i)int/)                      : "long",
            (~/(?i)float|double|decimal|real/): "double",
            (~/(?i)datetime|timestamp/)       : "java.sql.Timestamp",
            (~/(?i)date/)                     : "java.sql.Date",
            (~/(?i)time/)                     : "java.sql.Time",
            (~/(?i)/)                         : "String"
    ]

    FILES.chooseDirectoryAndSave("Choose directory", "Choose where to store generated files") { dir ->
        SELECTION.filter { it instanceof DasTable && it.getKind() == ObjectKind.TABLE }.each { generate(it, dir) }
    }

    def generate(table, dir) {
        def className = javaName(table.getName(), true)
        def fields = calcFields(table)
        new File(dir, className + ".java").withPrintWriter { out -> generate(out, table, className, fields) }
    }

    def generate(out, table, className, fields) {
        out.println "package $packageName"
        /* 可在此添加需要导入的包名，也可通过 IDE 批量修改生成的 Java 文件 */
        out.println ""
        out.println ""
        out.println "@Table(\"${table.getName()}\")"
        out.println "public class $className {"
        out.println ""
        fields.each() {
            if (it.annos != "") out.println "  ${it.annos}"
            out.println "  @Column(\"${it.col}\")"
            out.println "  private ${it.type} ${it.name};"
        }
        out.println ""
        fields.each() {
            out.println ""
            out.println "  public ${it.type} get${it.name.capitalize()}() {"
            out.println "    return ${it.name};"
            out.println "  }"
            out.println ""
            out.println "  public void set${it.name.capitalize()}(${it.type} ${it.name}) {"
            out.println "    this.${it.name} = ${it.name};"
            out.println "  }"
            out.println ""
        }
        out.println "}"
    }

    def calcFields(table) {
        DasUtil.getColumns(table).reduce([]) { fields, col ->
            def spec = Case.LOWER.apply(col.getDataType().getSpecification())
            def typeStr = typeMapping.find { p, t -> p.matcher(spec).find() }.value
            fields += [[
                            name : javaName(col.getName(), false),
                            type : typeStr,
                            col  : col.getName(),
                            annos: ""]]
        }
    }

    def javaName(str, capitalize) {
        def s = com.intellij.psi.codeStyle.NameUtil.splitNameIntoWords(str)
                .collect { Case.LOWER.apply(it).capitalize() }
                .join("")
                .replaceAll(/[^\p{javaJavaIdentifierPart}[_]]/, "_")
        capitalize || s.length() == 1 ? s : Case.LOWER.apply(s[0]) + s[1..-1]
    }

    ```
- 生成 Entity

![Generate Entity](/uploads/Snipaste_2018-02-07_15-53-09.png)

> 注：首先需要创建数据库连接，选中要生成的 Entity 的表，右键选择 `Generate nutz POJOs.groovy` 即可。


## 后记

代码在 IDEA 自带的 `Generate POJOs.groovy` 基础上修改而成，如果需要其他规范的实体类，比如 [JPA](http://www.oracle.com/technetwork/java/javaee/tech/persistence-jsp-140049.html) 只要稍作修改即可。

`---EOF---`