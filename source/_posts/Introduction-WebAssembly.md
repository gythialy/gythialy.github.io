---
title: WebAssembly 介绍
tags:
  - WASM
  - WebAssembly
categories: Notes
date: 2020-04-23 14:11:59
---

WebAssembly 是一种运行在现代网络浏览器中的新型代码，并且提供新的性能特性和效果。它设计的目的不是为了手写代码而是为诸如 C、C++ 和 Rust 等低级源语言提供一个高效的编译目标。对于网络平台而言，这具有巨大的意义——这为客户端 app 提供了一种在网络平台以接近本地速度的方式运行多种语言编写的代码的方式；在这之前，客户端 app 是不可能做到的。而且，你在不知道如何编写 WebAssembly 代码的情况下就可以使用它。WebAssembly 的模块可以被导入的到一个网络 app 中，并且暴露出供 JavaScript 使用的 WebAssembly 函数。JavaScript 框架不但可以使用 WebAssembly 获得巨大性能优势和新特性，而且还能使得各种功能保持对网络开发者的易用性。简而言之，可以为 Javascript 提供由 C/C++ 等更高效的语言编写的库。

## 前世今生

### 问题

业务需求越来越复杂，前端的开发逻辑越来越复杂，相应的代码量随之变的越来越多，整个项目的起步的时间越来越长。在性能不好的电脑上，启动一个前端的项目甚至要花上十多秒。除了逻辑复杂、代码量大，还有另一个原因是 JavaScript 这门语言本身的缺陷，JavaScript 没有静态变量类型。这门解释型编程语言的作者 Brendan Eich，仓促的创造了这门如果被广泛使用的语言，以至于 JavaScript 的发展史甚至在某种层面上变成了填坑史。

### asm.js

为了解决这个问题，WebAssembly 的前身，asm.js 诞生了。asm.js 是一个 Javascript 的严格子集，合理合法的 asm.js 代码一定是合理合法的 JavaScript 代码，但是反之就不成立。同 WebAssembly 一样，asm.js 不是用来给各位用手一行一行撸的代码，asm.js 是一个编译目标。它的可读性、可读性虽然比 WebAssembly 好，但是对于开发者来说，仍然是无法接受的。

无论 asm.js 对静态类型的问题做的再好，它始终逃不过要经过 Parser，要经过 ByteCode Compiler，而这两步是 JavaScript 代码在引擎执行过程当中消耗时间最多的两步。而 WebAssembly 不用经过这两步。这就是 WebAssembly 比 asm.js 更快的原因。

### WebAssembly 横空出世

在 2015 年，我们迎来了 WebAssembly，是经过编译器编译之后的代码，体积小、起步快。在语法上完全脱离 JavaScript，同时具有沙盒化的执行环境。WebAssembly 同样的强制静态类型，是 C/C++/Rust 的编译目标。

> 2019 年 12 月 5 日 — 万维网联盟（W3C）宣布 [WebAssembly 核心规范](https://www.w3.org/TR/wasm-core-1/) 成为正式标准

## 工具链

* [AssemblyScript](https://github.com/AssemblyScript/assemblyscript)
  支持直接将 TypeScript 编译成 WebAssembly
* [Emscripten](https://github.com/kripken/emscripten)
  将其 C/C++ 编译成 WebAssembly
* [WABT](https://github.com/WebAssembly/wabt)
  将 WebAssembly 在字节码和文本格式相互转换的一个工具，方便开发者去理解这个 wasm 到底是在做什么事。
* [WebAssembly Studio](https://webassembly.studio/)
  在线 IDE，支持 C/C++/Rust

## 关键概念

### 模块

表示一个已经被浏览器编译为可执行机器码的 WebAssembly 二进制代码。一个模块是无状态的，并且像一个二进制大对象（Blob）一样能够被缓存到 IndexedDB 中或者在 windows 和 workers 之间进行共享（通过 `postMessage()` 函数）。一个模块能够像一个 ES2015 的模块一样声明导入和导出。

### 内存

ArrayBuffer(浏览器 WASM 虚拟机实现），大小可变。本质上是连续的字节数组，WebAssembly 的低级内存存取指令可以对它进行读写操作。

### 表格

带类型数组，大小可变。表格中的项存储了不能作为原始字节存储在内存里的对象的引用（为了安全和可移植性的原因）。

### 实例

一个模块及其在运行时使用的所有状态，包括内存、表格和一系列导入值。一个实例就像一个已经被加载到一个拥有一组特定导入的特定的全局变量的 ES2015 模块。

## 生命周期

![wasm lifecycle](/uploads/wasm_1/wasm_lifecycle.png)

1. 通过工具链把其他语言 (C++、Go、 Rust) 编译成 WebAssembly 汇编格式 `.wasm` 文件
2. 在网页中使用 `fetch`、`XMLHttpRequest` 等获取 `wasm` 文件
3. 将 `.wasm` 编译为模块，编译过程中进行合法性检查
4. 实例化，初始化导入对象，创建模块的实例
5. 执行实例的导出函数，完成所需操作

## 虚拟机体系

![wasm vm system](/uploads/wasm_1/wasm_system.png)

WebAssembly 模块在运行时由以下几部分组成，如上图所示

1. 一个全局类型数，与很多语言不同，在 WebAssembly 中 “类型” 指的并非数据类型，而是函数签名，函数签名定义了函数的参数个数参数类型返回值类型; 某个函 数签名在类型数组中的下标 (或者说位置) 称为类型索引
2. 一个全局函数数组，其中容纳了所有的函数，包括导入的函数以及模块内部定 义的函数，某个函数在函数数组中的下标称为函数索引
3. 一个全局变量数组，其中容纳了所有的全局变量包括导入的全局变量以及 模块内部定义的全局变量，某个全局变量在全局变量数组的下标称为全局变量索引
4. 一个全局表格对象，表格也是一个数组，其中存储了元素 (目前元素类型只能 为函数) 的引用，某个元素在表格中的下标称为元素索引。
5. 一个全局内存对象
6. 一个运行时栈
7. 函数执行时可以访问一个局部变量数组，其中容纳了函数所有的局部变量，某 个局部变量在局部变量数组中的下标称为局部变量索引

> 在 WebAssembly 中，操作某个具体的对象（比如读写某个全局变量）都是通过其索引完成。在当前版本中，所有的索引都是 32 位整形数。

## 参考资料

- [WebAssembly Concepts](https://developer.mozilla.org/en-US/docs/WebAssembly/Concepts)
- [WebAssembly 标准入门](https://book.douban.com/subject/30396640/)

`---EOF---`