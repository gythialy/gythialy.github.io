---
title: WebAssembly S 表达式
tags:
  - WASM
  - WebAssembly
categories: Notes
date: 2020-05-28 16:21:19
---


为了能够让人类阅读和编辑 WebAssembly，wasm 二进制格式提供了相应的文本表示。这是一种用来在文本编辑器、浏览器开发者工具等工具中显示的中间形式。本文用基本语法的方式解释了这种文本表示是如何工作的，以及它是如何与它表示的底层字节码，及在 JavaScript 中表示 wasm 的封装对象关联起来的。

本质上，这种文本形式更类似于处理器的汇编指令。

## S - 表达式

不论是二进制还是文本格式，WebAssembly 代码中的基本单元是一个模块。在文本格式中，一个模块被表示为一个大的 S - 表达式。

S - 表达式是一个非常古老和非常简单的用来表示树的文本格式。因此，我们可以把一个模块想象为一棵由描述了模块结构和代码的节点组成的树。不过，与一门编程语言的抽象语法树不同的是，WebAssembly 的树是相当平的，也就是大部分包含了指令列表。

首先，让我们看下 S - 表达式长什么样。树上的每个一个节点都有一对括号——(...)——包围。括号内的第一个标签告诉你该节点的类型，其后跟随的是由空格分隔的属性或孩子节点列表。

S - 表达式如下：

```html
(module (memory 1) (func))
```

这条表达式，表示一棵根节点为 “模块（module）” 的树，该树有两个孩子节点，分别是 属性为 1 的 “内存（memory）” 节点 和 一个 “函数（func）” 节点。
<!-- more -->

### 节点类型

| 节点   | 类型              |
| ------ | ----------------- |
| module | 根节点，即 Module |
| memory | Memory            |
| data   | Memory 初始值     |
| table  | Table             |
| elem   | Table 初始值      |
| import | 导入对象          |
| export | 到处对象          |
| type   | 函数签名          |
| global | 全局变量          |
| func   | 函数              |
| param  | 函数参数          |
| result | 函数返回值        |
| local  | 局部变量          |
| start  | 开始函数          |


## 工具链

WebAssembly 由很多工具来支持开发者构建处理源文件输出二进制文件。如果你是一个写编译器的人、想尝试低级代码或只想尝试使用原始的 WebAssembly 格式进行试验，这些工具适合你。

### [WABT](https://github.com/WebAssembly/wabt): WebAssembly 二进制工具

 wabt 可以将二进制的 WebAssembly 代码和人类可以阅读的文本格式代码相互转换。文本格式代码类似于 S-表达式，这种文本格式的代码可以方便 WebAssembly 的编译器输出并进行分析和调试。

- wasm2wat

  将 WebAssembly 二进制转换为 S-表达式。输入二进制文件，输出一个包含可以读文本的文件 (`.wat`)。开发者可以编辑文本文件，然后再将其转换为二进制文件，比如优化算法、追踪问题、插入调试语句等等。

- wat2wasm

  和 wasm2wat 是反的，将 `.wat` 文件转换为二进制的 WebAssembly 文件。使用 wasm2wast 和 wast2wasm 可以掌控 WebAssembly 的二进制代码。

- wasm-interp

  实现了基于堆栈机的解释器，直接解释 WebAssembly 二进制文件。和浏览器将 WebAssembly 二进制通过 JIT 转换成目标机器的原生代码不一样的是，它不需要加载时间。这个解释器对单元测试、检测二进制文件可用性等等很有用。是脱离浏览器的一个环境。

###  Binaryen

  [Binaryen](https://github.com/WebAssembly/binaryen) 是一套全面的工具，用作将 WebAssembly 作为输出格式定位的编译器的后端。它具有 C API 和一套自己的逻辑程序的中间表示 ([IR](https://en.wikipedia.org/wiki/Intermediate_representation))，并可以在 IR 上执行一些优化，支持代码合并等。

  比如，binaryen 使用了 [asm2wasm](https://github.com/WebAssembly/binaryen/blob/master/src/asm2wasm.h) 作为编译器，将 asm.js 转换成 WebAssembly 文件。它还支持 LLVM 编译器的基础架构，可以将 Rust 转换成 WebAssembly。

  通过 binaryen，可以进行编译、优化，它提供了一个壳，可以解释 WebAssembly 代码，汇编和反汇编，可以将 asm.js 和 LLVM `.s` 文件转换成 WebAssembly 等等。

## 示例

```lisp
;; learn-wasm.wast

(module
  ;; In WebAssembly, everything is included in a module. Moreover, everything
  ;; can be expressed as an s-expression. Alternatively, there is the
  ;; "stack machine" syntax, but that is not compatible with Binaryen
  ;; intermediate representation (IR) syntax.

  ;; The Binaryen IR format is *mostly* compatible with WebAssembly text format.
  ;; There are some small differences:
  ;; local_set -> local.set
  ;; local_get -> local.get

  ;; We have to enclose code in functions

	;; 在 WebAssembly 中，所有的内容都包含在一个模块中。此外，所有的内容可以用 s-表达式来表示。
  ;; 另外，还可以用 "堆栈机" 语法，但这与 Binaryen 中间表示 (IR) 语法不兼容。

  ;; Binaryen IR 格式与 WebAssembly 文本格式 * 基本兼容，有一些小的区别。
  ;; local_set -> local.set
  ;; local_get -> local.get

 	;; Data Types
  (func $data_types
    ;; WebAssembly 只有四种类型:
    ;; i32 - 32 bit integer
    ;; i64 - 64 bit integer (not supported in JavaScript)
    ;; f32 - 32 bit floating point
    ;; f64 - 64 bit floating point

    ;; 我们可以通过 "local" 关键字定义本地变量
    ;; 我们必须在函数使用之前定义好所有的变量

    (local $int_32 i32)
    (local $int_64 i64)
    (local $float_32 f32)
    (local $float_64 f64)

		;; 这些未初始化的变量，可以通过 <type>.const 设置它们的值:

    (local.set $int_32 (i32.const 16))
    (local.set $int_32 (i64.const 128))
    (local.set $float_32 (f32.const 3.14))
    (local.set $float_64 (f64.const 1.28))
  )

  ;; 基本操作
  (func $basic_operations

    ;; 在 WebAssembly 中，一切都是 S-表达式，包括计算或者获取一些变量的值

    (local $add_result i32)
    (local $mult_result f64)

    (local.set $add_result (i32.add (i32.const 2) (i32.const 4)))
    ;; add_result 的值现在是 6!

    ;; 我们必须保证每个操作的类型正确
    ;; (local.set $mult_result (f32.mul (f32.const 2.0) (f32.const 4.0))) ;; WRONG! mult_result is f64!
    (local.set $mult_result (f64.mul (f64.const 2.0) (f64.const 4.0)))

    ;; WebAssembly has some builtin operations, like basic math and bitshifting.
    ;; Notably, it does not have built in trigonometric functions.
    ;; In order to get access to these functions, we have to either
    ;; - implement them ourselves (not recommended)
    ;; - import them from elsewhere (later on)
  )

  ;; 函数
  ;; 通过 `param` 关键字定义参数, 通过 `result` 关键字定义返回值
  ;; 栈中的唯一值就是最终的返回值
  ;; 通过 `call` 关键字调用其他函数

  (func $get_16 (result i32)
    (i32.const 16)
  )

  (func $add (param $param0 i32) (param $param1 i32) (result i32)
    (i32.add
      (local.get $param0)
      (local.get $param1)
    )
  )

  (func $double_16 (result i32)
    (i32.mul
      (i32.const 2)
      (call $get_16))
  )

  ;; Up until now, we haven't be able to print anything out, nor do we have
  ;; access to higher level math functions (pow, exp, or trig functions).
  ;; Moreover, we haven't been able to use any of the WASM functions in Javascript!
  ;; The way we get those functions into WebAssembly
  ;; looks different whether we're in a Node.js or browser environment.

  ;; 可以通过 Binaryen 优化输入二进制文件:
  ;; wasm-opt learn-wasm.wasm -o learn-wasm.opt.wasm -O3 --rse

  ;; With our compiled WebAssembly, we can now load it into Node.js:
  ;; const fs = require('fs')
  ;; const instantiate = async function (inFilePath, _importObject) {
  ;;  var importObject = {
  ;;     console: {
  ;;       log: (x) => console.log(x),
  ;;     },
  ;;     math: {
  ;;       cos: (x) => Math.cos(x),
  ;;     }
  ;;   }
  ;;  importObject = Object.assign(importObject, _importObject)
  ;;
  ;;  var buffer = fs.readFileSync(inFilePath)
  ;;  var module = await WebAssembly.compile(buffer)
  ;;  var instance = await WebAssembly.instantiate(module, importObject)
  ;;  return instance.exports
  ;; }
  ;;
  ;; const main = function () {
  ;;   var wasmExports = await instantiate('learn-wasm.wasm')
  ;;   wasmExports.print_args(1, 0)
  ;; }

  ;; The following snippet gets the functions from the importObject we defined
  ;; in the JavaScript instantiate async function, and then exports a function
  ;; "print_args" that we can call from Node.js

  (import "console" "log" (func $print_i32 (param i32)))
  (import "math" "cos" (func $cos (param f64) (result f64)))

  (func $print_args (param $arg0 i32) (param $arg1 i32)
    (call $print_i32 (local.get $arg0))
    (call $print_i32 (local.get $arg1))
  )
  (export "print_args" (func $print_args))

  ;; Loading in data from WebAssembly memory.
  ;; Say that we want to apply the cosine function to a Javascript array.
  ;; We need to be able to access the allocated array, and iterate through it.
  ;; This example will modify the input array inplace.
  ;; f64.load and f64.store expect the location of a number in memory *in bytes*.
  ;; If we want to access the 3rd element of an array, we have to pass something
  ;; like (i32.mul (i32.const 8) (i32.const 2)) to the f64.store function.

  ;; In JavaScript, we would call `apply_cos64` as follows
  ;; (using the instantiate function from earlier):
  ;;
  ;; const main = function () {
  ;;   var wasm = await instantiate('learn-wasm.wasm')
  ;;   var n = 100
  ;;   const memory = new Float64Array(wasm.memory.buffer, 0, n)
  ;;   for (var i=0; i<n; i++) {
  ;;     memory[i] = i;
  ;;   }
  ;;   wasm.apply_cos64(n)
  ;; }
  ;;
  ;; This function will not work if we allocate a Float32Array on the JavaScript
  ;; side.

  (memory (export "memory") 100)

  (func $apply_cos64 (param $array_length i32)
    ;; declare the loop counter
    (local $idx i32)
    ;; declare the counter that will allow us to access memory
    (local $idx_bytes i32)
    ;; constant expressing the number of bytes in a f64 number.
    (local $bytes_per_double i32)

    ;; declare a variable for storing the value loaded from memory
    (local $temp_f64 f64)

    (local.set $idx (i32.const 0))
    (local.set $idx_bytes (i32.const 0)) ;; not entirely necessary
    (local.set $bytes_per_double (i32.const 8))

    (block
      (loop
        ;; this sets idx_bytes to bytes offset of the value we're interested in.
        (local.set $idx_bytes (i32.mul (local.get $idx) (local.get $bytes_per_double)))

        ;; get the value of the array from memory:
        (local.set $temp_f64 (f64.load (local.get $idx_bytes)))

        ;; now apply the cosine function:
        (local.set $temp_64 (call $cos (local.get $temp_64)))

        ;; now store the result at the same location in memory:
        (f64.store
          (local.get $idx_bytes)
          (local.get $temp_64))

        ;; do it all in one step instead
        (f64.store
          (local.get $idx_bytes)
          (call $cos
            (f64.load
              (local.get $idx_bytes))))

        ;; increment the loop counter
        (local.set $idx (i32.add (local.get $idx) (i32.const 1)))

        ;; stop the loop if the loop counter is equal the array length
        (br_if 1 (i32.eq (local.get $idx) (local.get $array_length)))
        (br 0)
      )
    )
  )
  (export "apply_cos64" (func $apply_cos64))

  ;; Wasm is a stack-based language, but for returning values more complicated
  ;; than an int/float, a separate memory stack has to be manually managed. One
  ;; approach is to use a mutable global to store the stack_ptr. We give
  ;; ourselves 1MiB of memstack and grow it downwards.
  ;;
  ;; Below is a demonstration of how this C code **might** be written by hand
  ;;
  ;;   typedef struct {
  ;;       int a;
  ;;       int b;
  ;;   } sum_struct_t;
  ;;
  ;;   sum_struct_t sum_struct_create(int a, int b) {
  ;;     return (sum_struct_t){a, b};
  ;;   }
  ;;
  ;;   int sum_local() {
  ;;     sum_struct_t s = sum_struct_create(40, 2);
  ;;     return s.a + s.b;
  ;;   }

  ;; Unlike C, we must manage our own memory stack. We reserve 1MiB
  (global $memstack_ptr (mut i32) (i32.const 65536))

  ;; Structs can only be returned by reference
  (func $sum_struct_create
        (param $sum_struct_ptr i32)
        (param $var$a i32)
        (param $var$b i32)
    ;; c// sum_struct_ptr->a = a;
    (i32.store
      (get_local $sum_struct_ptr)
      (get_local $var$a)
    )

    ;; c// sum_struct_ptr->b = b;
    (i32.store offset=4
      (get_local $sum_struct_ptr)
      (get_local $var$b)
    )
  )

  (func $sum_local (result i32)
    (local $var$sum_struct$a i32)
    (local $var$sum_struct$b i32)
    (local $local_memstack_ptr i32)

    ;; reserve memstack space
    (i32.sub
      (get_global $memstack_ptr)
      (i32.const 8)
    )
    tee_local $local_memstack_ptr ;; tee both stores and returns given value
    set_global $memstack_ptr

    ;; call the function, storing the result in the memstack
    (call $sum_struct_create
      ((;$sum_struct_ptr=;) get_local $local_memstack_ptr)
      ((;$var$a=;) i32.const 40)
      ((;$var$b=;) i32.const 2)
    )

    ;; retrieve values from struct
    (set_local $var$sum_struct$a
      (i32.load offset=0 (get_local $local_memstack_ptr))
    )
    (set_local $var$sum_struct$b
      (i32.load offset=4 (get_local $local_memstack_ptr))
    )

    ;; unreserve memstack space
    (set_global $memstack_ptr
        (i32.add
          (get_local $local_memstack_ptr)
          (i32.const 8)
        )
    )

    (i32.add
      (get_local $var$sum_struct$a)
      (get_local $var$sum_struct$b)
    )
  )
  ;; 导出函数
  (export "sum_local" (func $sum_local))
)
```


## 参考链接

- [Understanding WebAssembly text format](https://developer.mozilla.org/zh-CN/docs/WebAssembly/Understanding_the_text_format)
- [WebAssembly 标准入门](https://book.douban.com/subject/30396640/)
- [Learn WebAssembly in Y minutes](https://learnxinyminutes.com/docs/wasm/)
