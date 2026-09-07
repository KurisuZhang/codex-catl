# AI Infra 工程师知识库：从 GPU 服务器采购到 Token 交付

从 GPU选型 -> Token输出 全流程知识骨架

## 目录

- [1. 模型工作负载分析与容量估算](#layer-1)
- [2. GPU / NPU 芯片选型](#layer-2)
- [3. 异构平台与迁移验证](#layer-3)
- [4. GPU 服务器架构](#layer-4)
- [5. 存储与模型分发](#layer-5)
- [6. 模型下载、完整性校验与入库](#layer-6)
- [7. GPU 组网、集群网络与集合通信](#layer-7)
- [8. Linux 环境搭建](#layer-8)
- [9. GPU Runtime 与容器运行栈](#layer-9)
- [10. Kubernetes GPU 平台](#layer-10)
- [11. GPU 调度与批任务调度](#layer-11)
- [13. 模型架构与分布式并行](#layer-13)
- [14. 推理引擎 & 优化](#layer-14)
- [16. 可观测性与性能监测](#layer-16)
- [17. MaaS、Gateway 与多租户服务](#layer-17)
- [19. Benchmark、SLA 验证与容量规划](#layer-19)
- [20. Token 经济模型](#layer-20)


<a id="layer-1"></a>
## 1. 模型工作负载分析与容量估算

### 1.1 模型结构与请求画像



### 1.2 权重显存


### 1.3 KV Cache 估算


### 1.4 算力、带宽


<a id="layer-2"></a>
## 2. GPU / NPU 芯片选型

### 2.1 选型维度


<a id="layer-3"></a>
## 3. 异构平台与迁移验证



<a id="layer-4"></a>
## 4. GPU 服务器架构

### 4.1 硬件


### 4.2 拓扑


<a id="layer-5"></a>
## 5. 存储与模型分发

关注存储介质、缓存和集群分发；模型从发布源下载、锁定版本、校验



<a id="layer-6"></a>
## 6. 模型下载、完整性校验与入库


### 6.1 下载来源与版本管理


<a id="layer-7"></a>
## 7. GPU 组网、集群网络与集合通信

### 7.1 三层概念不能混淆


### 7.2 网络设计知识


### 7.3 集合通信与性能



<a id="layer-8"></a>
## 8. Linux 环境搭建



<a id="layer-9"></a>
## 9. GPU Runtime 与容器运行栈


```text
硬件 / 固件
  → 宿主机内核与设备驱动
  → 容器设备暴露与运行时集成
  → CUDA / ROCm / CANN 等计算软件栈
  → 通信库与算子库
  → PyTorch 等框架 / 编译器 / 自定义算子
  → 推理或训练程序
```


<a id="layer-10"></a>
## 10. Kubernetes GPU 平台


<a id="layer-11"></a>
## 11. GPU 调度与批任务调度



<a id="layer-13"></a>
## 13. 模型架构与分布式并行


### 13.1 并行方式对照


<a id="layer-14"></a>
## 14. 推理引擎 & 优化

### 14.1 代表性引擎

vLLM， SGLang，TensorRT-LLM



### 14.2 推理性能瓶颈

| 症状 | 候选原因 | 优先取证 |
| --- | --- | --- |
| TTFT 高、队列增长 | 过载、Prefill 慢、冷启动、CPU 前处理慢 | 排队/Prefill 分段、请求长度、CPU |
| TPOT/ITL 高 | Decode 访存、通信、Prefill 干扰、调度暂停 | 每步时间、HBM/通信、Prefill 事件 |
| 显存紧张 | KV 长、并发过高、图/工作区、碎片 | 每卡显存组成、驻留 Token、回收 |
| GPU 忙但交付少 | 无效重试、未通过质量、通信同步、低效 Kernel | 有效 Token、Trace、Kernel 时间线 |
| 一部分 rank 慢 | 拓扑、故障、专家偏斜、批次不均衡 | rank 级延迟与负载、链路计数 |

### 14.3 优化技术与代价

<a id="layer-16"></a>
## 16. 可观测性与性能监测

### 16.1 分层指标体系



### 16.2 告警设计



<a id="layer-17"></a>
## 17. MaaS、Gateway 与多租户服务

### 17.1 控制面与请求数据面



<a id="layer-19"></a>
## 19. Benchmark、SLA 验证与容量规划

### 19.1 统一指标字典

TTFT，TPOT， 总 Token 吞吐， TPM， QPS / RPS


<a id="layer-20"></a>
## 20. Token 经济模型

### 20.1 关键公式
