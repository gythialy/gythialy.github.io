---
title: Golang 实现 WebAssembly VM
tags:
  - WASM
  - Golang
  - WebAssembly
categories: Programming
date: 2020-06-12 10:27:06
---

## 背景

由于 [WebAssembly Interface Types](https://github.com/webassembly/interface-types) 还处于草案阶段，目前 WASM 只支持四种基本类型，本质上来说没什么大用。



在实际的开发中，数据结构肯定是远比 `i32,i64,f32,f64` 这四种基本类型来得复杂的，至少可能是一个复杂的结构体。比如，我需要把一组 key/value 存起来，然后可以通过 key 查询到对应的 value。按照目前的 WASM 的规范，这个实现都是比较麻烦的。key/value 可能是字符串或者其他结构，但是不管什么类型，在内存都是按照字节序的方式存储，所以只需要把类型编码成字节序放到内存中，这样这个结构就可以转化成内存的起始地址（指针）和数据长度，这两个值就是 `i32/i64`，并且都是 WASM 支持的类型。



函数声明

- 对外 API

  为了对调用者友好，调用这不需要处理 `slice` 的地址

```rust
  // 把 key/value 写入存储
  pub fn storage_write(key: &[u8], val: &[u8])

// 根据 key 查询对应的 value
  pub fn storage_read(key: &[u8]) -> Option<Vec<u8>>
```

- 内部接口


在虚拟机中注入这两个 `host function` 来实现具体的逻辑

  ```rust
  extern "C" {
          pub fn qlcchain_storage_read(
              key: *const u8,
              klen: u32,
              val: *mut u8,
              vlen: u32,
              offset: u32,
          ) -> u32;
          pub fn qlcchain_storage_write(key: *const u8, klen: u32, val: *const u8, vlen: u32);
      }
  ```
<escape><!-- more --></escape>

## WASM 二进制

### Rust 实现

`invoke` 作为对外的入口点，调用此函数，就可以实现把 key/val 存储起来，然后通过 key 查询对应的 val

- Cargo.toml

  ```toml
  [package]
  name = "example01"
  version = "0.1.0"
  authors = ["gythialy <gythialy.koo+github@gmail.com>"]
  edition = "2018"

  # See more keys and their definitions at https://doc.rust-lang.org/cargo/reference/manifest.html

  [lib]
  crate-type = ["cdylib"]

  [dependencies]

  [profile.release]
  lto = true
  opt-level = 's'
  ```

- lib.rs

  ```rust
  mod env {
      extern "C" {
          pub fn qlcchain_storage_read(
              key: *const u8,
              klen: u32,
              val: *mut u8,
              vlen: u32,
              offset: u32,
          ) -> u32;
          pub fn qlcchain_storage_write(key: *const u8, klen: u32, val: *const u8, vlen: u32);
          pub fn qlcchain_storage_delete(key: *const u8, klen: u32);
          pub fn qlcchain_debug(val: *const u8, len: u32);
      }
  }

  pub fn storage_write(key: &[u8], val: &[u8]) {
      unsafe {
          env::qlcchain_storage_write(
              key.as_ptr(),
              key.len() as u32,
              val.as_ptr(),
              val.len() as u32,
          );
      }
  }

  pub fn storage_delete(key: &[u8]) {
      unsafe {
          env::qlcchain_storage_delete(key.as_ptr(), key.len() as u32);
      }
  }

  pub fn storage_read(key: &[u8]) -> Option<Vec<u8>> {
      const INITIAL: usize = 32;
      let mut val = vec![0; INITIAL];
      let size = unsafe {
          env::qlcchain_storage_read(
              key.as_ptr(),
              key.len() as u32,
              val.as_mut_ptr(),
              val.len() as u32,
              0,
          )
      };

      if size == core::u32::MAX {
          return None;
      }
      let size = size as usize;
      val.resize(size, 0);
      if size > INITIAL {
          let value = &mut val[INITIAL..];
          debug_assert!(value.len() == size - INITIAL);
          unsafe {
              env::qlcchain_storage_read(
                  key.as_ptr(),
                  key.len() as u32,
                  value.as_mut_ptr(),
                  value.len() as u32,
                  INITIAL as u32,
              )
          };
      }

      Some(val)
  }

  pub fn debug(val: &[u8]) {
      unsafe {
          env::qlcchain_debug(val.as_ptr(), val.len() as u32);
      }
  }

  #[no_mangle]
  pub fn invoke() {
      let key = "key01";
      let val = "val01";
      storage_write(key.as_bytes(), val.as_bytes());

      if let Some(val) = storage_read(key.as_bytes()) {
          debug(val.as_slice());
      }
  }
  ```

- 编译

  ```shell
  RUSTFLAGS="-C link-arg=-zstack-size=32768" cargo build --release --target wasm32-unknown-unknown
  ```

### `wat` 文件

<details>
 <summary>WAT 文件</summary>
 {% gist gythialy/40e05f90ef5809590e1c6ade70692424 %}
</details>


## VM 实现

[gasm](https://github.com/mathetake/gasm) 作为 WASM v1 的最小实现，支持解析执行 WASM 二进制文件和注入 `host function`。做为 WASM VM MVP 在此基础上做一些简单的封装。



1. 根据刚才 Rust 中的定义的函数名注入 `host function`，比如 `qlcchain_storage_write` 对应 `qlcSetDataFun`
2. 根据回调中的 key/value 的起始地址和长度，获取响应的字节序，就可以解码出对应的数据结构
3. 也可以根据 key/value 的内存地址，修改相应的数据



完整的测试代码



```go
package main

import (
	"bytes"
	"fmt"
	"io/ioutil"
	"reflect"
	"testing"

	"github.com/mathetake/gasm/hostfunc"
	"github.com/mathetake/gasm/wasi"
	"github.com/mathetake/gasm/wasm"
	"github.com/stretchr/testify/require"
)

func TestWASM(t *testing.T) {
  // 读取 WASM 二进制文件
	buf, err := ioutil.ReadFile("../data/example.wasm")
	require.NoError(t, err)

	mod, err := wasm.DecodeModule(bytes.NewBuffer(buf))
	require.NoError(t, err)

	cache := make(map[string]string, 0)
	qlcSetDataFun := func(vm *wasm.VirtualMachine) reflect.Value {
		return reflect.ValueOf(func(keyPtr, keyLen, valPtr, valLen uint32) {
			fmt.Printf("set mem: key:(%d,%d); val:(%d,%d)\n", keyPtr, keyLen, valPtr, valLen)
			memory := vm.Memory
			key := memory[keyPtr : keyPtr+keyLen]
			data := memory[valPtr : valPtr+valLen]
			cache[string(key)] = string(data)
			fmt.Printf("decoce: %s[%s]\n", string(key), string(data))
		})
	}

	qlcGetDataFun := func(vm *wasm.VirtualMachine) reflect.Value {
		return reflect.ValueOf(func(keyPtr, keyLen, valPtr, valLen, offset uint32) uint32 {
			fmt.Printf("get mem: key:(%d,%d); val:(%d,%d),offset:%d\n", keyPtr, keyLen, valPtr, valLen, offset)
			memory := vm.Memory
			key := memory[keyPtr : keyPtr+keyLen]
			keyStr := string(key)
			if v, ok := cache[keyStr]; ok {
				data := []byte(v)
				// FIXME: check mem length
				copy(memory[valPtr:], data[offset:offset+valLen])
				return uint32(len(data))
			}
			return 0
		})
	}

	qlcDebug := func(vm *wasm.VirtualMachine) reflect.Value {
		return reflect.ValueOf(func(valPtr, valLen uint32) {
			fmt.Printf("debug: %d, %d\n", valPtr, valLen)
			memory := vm.Memory
			data := memory[valPtr : valLen+valPtr]
			fmt.Println(string(data))
		})
	}

	builder := hostfunc.NewModuleBuilderWith(wasi.Modules)
	builder.MustSetFunction("env", "qlcchain_storage_write", qlcSetDataFun)
	builder.MustSetFunction("env", "qlcchain_storage_read", qlcGetDataFun)
	builder.MustSetFunction("env", "qlcchain_debug", qlcDebug)

  // 构建 WASM VM
	vm, err := wasm.NewVM(mod, builder.Done())
	require.NoError(t, err)

  // 调用 `invoke`
	_, _, err = vm.ExecExportedFunction("invoke")
	require.NoError(t, err)
}
```

## 结语

- WASM v1 支持的内容有限，想实现更高级的功能需要做不少额外的工作，但也不是不可能
- 现有大多数的 WASM VM 的实现都不支持或者不完整支持 JIT/AOP，执行效率有限
- 未来 `WebAssembly Interface Types` 等规范发布的话，更容易支持复杂业务
-  [wasm-bindgen](https://crates.io/crates/wasm-bindgen) 已经支持 Rust 生态的 `WebAssembly Interface Types`

## 参考链接

- [ontology-wasm-cdt-rust](https://github.com/ontio/ontology-wasm-cdt-rust)

`---EOF---`