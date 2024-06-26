---
title: 区块链隐私交易
tags:
  - HyperLedger
  - Ethereum
  - Privacy
categories: Notes
date: 2021-04-14 17:23:22
---


## 缘起

区块链是作为一种创新技术，具有三大特点，即 “去中心化”、“集体维护”、“防篡改”。采用区块链技术构建的平台具有极高的数据安全性、集体信任以及数据资产溯源等特性和能力。这些特性和能力为供应链金融搭建可持续运行的安全运营平台提供了可靠的技术支撑环境。

当前区块链技术已经形成了三种类型，即 “公有链”、“私有链” 以及 “联盟链”。

- 以比特币、以太坊为代表的就是典型的 “公有链” 平台。在公有链平台上，最为典型的特点就是 “匿名性”，在匿名环境下如何确保所有成员的 “诚实”，比特币和以太坊都采用了 PoW 的共识模式。PoW 的本质是你付出足够多的计算资源（也就是算力，或者成本），证明你是诚实的。为了确保 PoW 能正常工作，公有链上的节点需要能够查看所有交易的信息

- 私有链就是企业内部使用的区块链平台，与当前的企业信息系统一样与外界保持着高度的安全隔离机制

- 联盟链与公有链最显著的区别是联盟链不采用匿名机制，相反具有严格的成员准入机制。也就是说，所有参与平台的计算节点、业务主体都全部是具名的，并有唯一的身份证书

商业的本质是信息不对称，商业机密是一个企业确立竞争优势的基础。也就是说任何企业不期望自身的商业信息被其它无关企业甚至竞争对手掌握。我们以比特币为例来看，通过区块链浏览器就能查询到区块中交易的一些信息。尽管比特币具有匿名性，但这些信息假如在商业环境中出现，竞争对手有可能分析出来一些商业行为的蛛丝马迹甚至能部分推测出竞争对手的身份和商业策略。区块链技术公开、透明以及分布式存储的特性与商业企业信息保密这一刚性需求产生了矛盾。

<!-- more -->

## 解决思路

### Hyper Ledger

![](network.diagram.1.png)

以 HyperLedger 文档中的场景为例，在网络 N 中，有 CA1-CA4 控制整个网络准入门槛。 现有两个联盟 CC1 和 CC2，A1-A3 为其中三个应用，P1-P3 为三个 peer 节点，O4 为排序节点,这里可以不要考虑，L1-L2 为两种应用场景产生的数据账本。

从图中我们可以看出 A2 同时和 A1、A3 有业务交互，A2 于 A1 交互的时候在通道 C1 上完成，和 A3 交互的时候，通过通道 C2 完成。最终的结果就是虽然 A1 和 A3 都有交互，但是 A1 和 A3 的数据是完全隔离的，A2 同时拥有 A1 和 A3 的数据。虽然 A1、A2、A3 都在同一个网络中，但是不同的应用的数据都是可以在不同的通道上传输，网络的准入又是通过 CA 来控制，在物理层面完成了数据的隔离。

### Ethereum

![](Tessera-Privacy-flow.jpeg)

在 Tessera 的方案是在 BTC/ETH 这种传统公链基础上的扩展，增加了 PTM(Privacy Transaction Manager) 的模块来单独处理隐私交易。每个有隐私交易的需求的节点，都需要单独配置 PTM 模块，并组成 PTM 的网络。比如 A 应用发起一笔隐私交易的请求，区块链节点会把业务数据部分发给 PTM，PTM 加密存储在本地，同时把业务数据发送给参与方 B，B 的 PTM 同样会把数据加密存储在本地。 A 在完成业务数据的加密存储后，会把业务数据的 hash 放到普通的交易中，在整个网络中广播，这样 C 会收到 A/B 产生的这笔交易，但是交易中只有业务数据的 hash，并不知道完整的业务数据，变相完成了隐私交易。

## 结语

综上，HyperLedger 的方案，比较适合没什么历史包袱的项目，从架构上就彻底杜绝了数据泄漏的风险。Tessera 的方案适合在现有区块链项目上的改造，但是由于 BTC/ETH 整个账本的设计，C 虽然不会获得具体的业务数据，但是 C 仍然可以通过分析 A 和 B 的交易数量来推测出一点商业信息。

## 参考链接

- [Tessera](https://github.com/ConsenSys/tessera)
- [HyperLedger Fabric](https://hyperledger-fabric.readthedocs.io/en/latest/index.html)

`---EOF---`
