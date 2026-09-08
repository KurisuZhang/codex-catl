# AI Infra 知识库：从 GPU 服务器选型到 Token 交付


## 1. 业务需求建模

### 1.1 场景边界
在线推理、离线批处理与训练／微调

### 1.2 模型类型
Dense／MoE、总参数与激活参数、注意力结构与多模态
存储精度、量化、GPU 数量、并行规模、副本数量、运行时容量
KV 容量、层数、KV Head、上下文长度、并发、存储精度
Prefill／Decode 的计算强度、HBM 访存与通信开销

### 1.3 请求画像
输入输出长度联合分布、到达率、并发、突发与会话复用

### 1.4 服务目标
质量门槛、延迟分位数、吞吐、可用性与服务级目标（SLO）

### 1.5 应用负载
RAG 检索与重排、Agent 多轮调用

### 1.6 建设约束：
自建／租赁、预算、软件生态

### 1.12 初步容量方案
GPU 数量、并行规模、副本数量与故障冗余

## 2. GPU选型

### 2.1 GPU／NPU 计算能力
精度支持、有效算力、算子覆盖与能效

### 2.2 GPU内存体系
HBM／GDDR、容量与带宽、统一内存支持与 ECC

### 2.3 整机配置
GPU 形态、CPU、内存通道、NIC、NVMe 与扩展槽位

### 2.4 单机数据通路
NUMA、PCIe Root Complex、GPU—NIC／NVMe

### 2.5 机柜级拓扑：
[NVLink、NVSwitch 与 NVLink Switch 拓扑](https://docs.nvidia.com/dgx/dgxgb200-user-guide/)、互联域与扩展边界

### 2.6 机柜物理条件
空间、布线、维护通道

### 2.7 机房供电
功率估算

### 2.8 散热架构
风冷、冷板液冷、浸没式液冷与残余风冷需求

### 2.12 采购与交付
物料清单、验收、供货、维保与成本

## 3. 集群网络、分布式通信与存储分发

### 3.1 网络分层与平面
Scale-up／Scale-out
管理、业务、存储与计算网络

### 3.2 网络技术选型
以太网、InfiniBand、RoCEv2 与 RDMA 能力边界
Scale-out 拓扑：[Rail-aligned 与 Leaf-Spine](https://docs.nvidia.com/dgx-superpod/reference-architecture-scalable-infrastructure-gb200/latest/network-fabrics.html)
GPU 直连通信：[GPUDirect RDMA](https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/troubleshooting/gpu_troubleshooting.html)


### 3.5 网络性能控制
ECN／PFC 适用配置、拥塞控制、MTU 与带宽隔离

### 3.6 大模型通信方式
AllReduce、AllGather、ReduceScatter、All-to-All 与点对点传输

### 3.7 通信软件栈
NCCL／RCCL／HCCL、NVSHMEM、通信算法与拓扑映射

### 3.8 存储对象与介质
权重、镜像、评测数据、日志，对象存储、并行文件系统与本地 NVMe
数据生命周期：版本保留、容量配额、备份恢复

### 3.9 存储服务能力
吞吐、IOPS、元数据性能、并发访问与故障冗余

### 3.11 模型加载通路：
并行读取、反序列化、 [GPUDirect Storage 适配](https://docs.nvidia.com/gpudirect-storage/overview-guide/)

## 4. 主机基线与计算软件栈

### 4.2 Linux 基线
内核、资源限制、文件系统、时间同步与自动化装机
主机调优：BIOS、NUMA、CPU／IRQ 亲和性、大页与电源策略

### 4.4 GPU基础软件
固件、内核模块、驱动、CUDA／ROCm／CANN 与版本兼容性

### 4.5 互联基础软件
RDMA 驱动、NIC 固件、Fabric Manager

### 4.6 深度学习依赖
数学库、算子库、通信库、框架与二进制接口兼容性

### 4.7 容器运行环境
OCI Runtime、GPU Container Toolkit、CDI 与设备暴露

### 4.8 镜像工程
可复现构建、依赖锁定、兼容性矩阵与版本回滚

### 4.9 整体测试：
GPU 数值正确性、显存、CPU、内存、磁盘与独占式 [DCGM 主动诊断](https://docs.nvidia.com/datacenter/dcgm/latest/user-guide/feature-overview.html)
链路验收：GPU P2P、NVLink Fabric、RDMA、NCCL Tests 与拓扑一致性
集群稳定性验收：持续压测、功率波动、性能波动


## 5. 算力平台、资源编排与集群调度

### 5.1 部署与设备接入
裸机、容器、Kubernetes 与托管算力
GPU Operator、设备发现、健康状态与可分配资源
Device Plugin、[动态资源分配（DRA）](https://kubernetes.io/docs/concepts/resource-management/dynamic-resource-allocation/)与 ResourceClaim

### 5.4 GPU切片
整卡、MIG、MPS、时间切片与性能隔离边界

### 5.5 节点内资源对齐
[Topology Manager](https://kubernetes.io/docs/tasks/administer-cluster/topology-manager/)、CPU／Memory Manager 与 GPU—NIC 亲和分配

### 5.6 分布式工作组调度
Gang Scheduling、拓扑域约束与多节点协同分配

### 5.8 租户资源治理
配额、优先级、抢占、排队、公平共享与超售边界


## 6. 模型下载、量化校准与编译优化

### 6.1 模型来源与许可：
权重来源、使用授权、来源证明与交付责任

### 6.2 制品完整性：
权重、配置、Tokenizer、Chat Template、处理器与 LoRA 适配器

### 6.3 训练产物接入：
数据版本、Checkpoint 归并、训练状态剥离与推理制品转换

### 6.4 模型版本管理：
模型仓库、内容校验、权重分片与部署版本关联

### 6.5 量化策略：
PTQ／QAT、权重／激活量化、AWQ／GPTQ 与校准集设计

### 6.6 低精度格式：
INT8／INT4、FP8／FP4、缩放粒度与硬件／内核支持矩阵

### 6.7 量化质量验证：
数值误差、任务指标、长上下文退化与回退门槛

### 6.8 算子与内核：
GEMM、Attention、MoE Grouped GEMM、算子融合与自定义算子

### 6.9 内核实现体系：
FlashAttention、FlashInfer、Triton、CUTLASS 与后端适配

### 6.10 图编译与引擎构建：
torch.compile、TensorRT、动态形状分桶、编译缓存与制品可移植性

### 6.11 图捕获与执行重放：
CUDA Graphs、完整／分段捕获、形状约束与显存开销

### 6.12 可复现部署制品：
模型、量化配置、引擎、镜像、硬件架构与构建参数锁定

## 7. 推理执行链路、引擎机制与请求调度

### 7.1 引擎能力矩阵：
vLLM、SGLang、[TensorRT-LLM](https://nvidia.github.io/TensorRT-LLM/features/feature-combination-matrix.html)、模型／硬件支持、版本成熟度与功能组合

### 7.2 请求预处理：
协议解析、模板拼装、Tokenization 与多模态编码

### 7.3 Prefill 执行：
上下文前向计算、KV 建立与首 Token 生成

### 7.4 Decode 执行：
增量前向、KV 读写、自回归迭代与生成状态维护

### 7.5 连续批处理：
Continuous Batching、迭代级调度、Token 预算与并发上限

### 7.6 分块预填充：
[Chunked Prefill](https://docs.vllm.ai/en/latest/configuration/optimization/)、混合批次、Decode 优先与首 Token／逐 Token 延迟权衡

### 7.7 异步执行调度：
CPU／GPU 重叠、双批次重叠、提交开销与执行依赖

### 7.8 请求服务策略：
优先级、长短请求公平性、截止时间与饥饿控制

### 7.9 生成约束：
温度、Top-k／Top-p、结构化解码、工具调用格式与停止条件

### 7.10 投机解码：
[草稿模型、EAGLE／MTP、目标模型验证与接受／拒绝采样](https://docs.vllm.ai/en/stable/features/speculative_decoding/)、分布保持条件与收益边界

### 7.12 引擎请求收尾：
Detokenization、完成／取消状态、输出队列与资源释放

## 8. KV Cache、前缀复用与长上下文管理

### 8.1 分页显存管理：
PagedAttention、块分配、共享引用、写时复制与碎片控制

### 8.2 前缀缓存：
[Prefix Caching 的缓存键与一致性](https://docs.vllm.ai/en/stable/design/prefix_caching/)、Radix Cache、命中判定与失效策略

### 8.3 KV 容量调度：
水位控制、块淘汰、请求抢占、重计算与 OOM 防护

### 8.4 分级缓存：
[HBM、主机内存与外部存储](https://docs.sglang.io/docs/advanced_features/hicache_best_practices)、预取、异步卸载与共享范围

### 8.5 KV 量化：
[存储精度、缩放粒度与尺度校准](https://docs.vllm.ai/en/stable/features/quantization/quantized_kvcache/)、Attention 后端兼容性与质量回归

### 8.6 模型原生状态结构：
MHA／GQA／MQA／MLA、滑动窗口、稀疏注意力与混合状态缓存

### 8.7 上下文长度边界：
训练窗口、RoPE 扩展、位置编码一致性与长文本质量

### 8.8 有损上下文缩减：
Token 选择、KV 淘汰与压缩的语义损失和适用条件

### 8.9 多轮会话状态：
增量上下文、缓存驻留、版本失效与会话过期

### 8.10 多模态缓存：
预处理结果、Encoder Embedding 与语言模型 KV 的生命周期边界

### 8.11 缓存收益评估：
命中率、复用长度、节省计算量、传输代价与有效容量

## 9. 分布式并行、MoE 与推理阶段分离

### 9.1 并行架构选择：
单卡、单机多卡、多机多卡与模型／拓扑约束

### 9.2 张量与流水线并行：
TP／PP、层内分片、微批次、流水线气泡与通信开销

### 9.3 上下文并行：
Prefill／Decode Context Parallelism、KV 分片与长序列扩展

### 9.4 数据并行与副本：
DP、独立服务副本、请求分发与吞吐扩展边界

### 9.5 MoE 专家并行：
EP、Token Dispatch／Combine、All-to-All 与拓扑映射

### 9.6 专家负载均衡：
[EPLB、专家复制与重放置](https://docs.sglang.io/docs/advanced_features/expert_parallelism)、负载偏斜与计算通信重叠

### 9.7 预填充／解码分离：
PD 独立资源池、异构硬件、阶段 SLO 与部署适用边界

### 9.8 KV 跨实例传输：
[NIXL 传输层](https://github.com/ai-dynamo/nixl)、KV Connector、布局转换、传输计算重叠与回退路径

### 9.9 多模态阶段分离：
[编码器／预填充／解码分离（EPD）](https://docs.sglang.io/docs/advanced_features/epd_disaggregation)、Embedding 传输与独立资源配置

### 9.10 多维并行组合：
TP／PP／DP／EP／CP、阶段独立配置与功能兼容性

### 9.11 分布式运行协调：
Rank／进程组、通信初始化、超时、同步与组级一致性

## 10. API 网关、多租户服务与 Token 交付

### 10.1 服务协议：
API 兼容性、模型能力声明、SSE／流式响应与错误语义

### 10.2 请求入口治理：
身份认证、模型授权、上下文校验与多模态输入预算

### 10.3 模型与版本路由：
模型目录、版本别名、灰度分流与后端能力匹配

### 10.4 推理感知路由：
[KV 复用与负载联合决策](https://docs.nvidia.com/dynamo/v-0-8-0/components/router)、会话亲和、拓扑距离与缓存事件

### 10.5 PD 流量编排：
阶段端点选择、KV 交接、请求关联与跨阶段取消

### 10.6 准入与公平使用：
RPM／TPM、并发限制、Token 预算、优先级与租户配额

### 10.7 过载保护：
有界队列、背压、熔断、负载丢弃与能力降级

### 10.8 超时与重试：
截止时间传播、重试预算、幂等性与流式重试边界

### 10.10 批量服务接口：
异步作业、结果持久化、部分失败与交付确认

### 10.11 用量事件采集：
请求／租户／模型版本标识、Token 分类与事件可靠投递

## 11. 性能工程、质量评测与生产容量规划

### 11.1 延迟口径：
TTFT、ITL、TPOT、端到端延迟、测量边界与统计分位数

### 11.2 吞吐与有效产出：
输入／输出 Token 吞吐、RPS、请求级／Token 级 Goodput 与质量门槛

### 11.3 测试分层：
硬件与通信基线、内核微基准、引擎压测与端到端服务验收

### 11.4 负载设计：
开放到达／闭环并发、长度联合分布、冷热缓存、突发与流量回放

### 11.5 基准可复现性：
[压测参数与 SLO 阈值](https://docs.vllm.ai/en/latest/cli/bench/serve/)、版本锁定、预热、稳态与客户端瓶颈排除

### 11.6 性能瓶颈定位：
Roofline、CPU 火焰图、Nsight Systems／Compute 与通信时间线

### 11.7 质量回归：
量化误差、长上下文检索、多模态、结构化输出与任务成功率

### 11.8 优化收益验证：
质量、延迟、吞吐、显存、能耗与负载适用区间

### 11.9 服务验收：
SLO 达标率、持续压测、故障注入、过载退化与结果复现

### 11.10 实测容量曲线：
请求混合、并行配置、并发、吞吐、尾延迟与理论模型校准

### 11.11 生产资源配置：
GPU／副本数量、PD／EPD 配比、峰值余量与故障冗余

### 11.12 持续容量规划：
线上分布漂移、模型升级、扩容触发与选型反馈闭环

## 12. 可观测性、分层诊断与根因分析

### 12.1 遥测体系：
Metrics／Logs／Traces、OpenTelemetry、关联标识与指标基数控制

### 12.2 硬件与机房监控：
DCGM／BMC、SM／HBM 活跃度、功率、温度、降频与液冷状态


### 12.4 主机与网络诊断：
CPU、内存、磁盘、IRQ、RDMA 重传、拥塞与链路退化

### 12.5 引擎运行指标：
[排队、批次、KV 水位、缓存命中与抢占](https://docs.vllm.ai/en/latest/usage/metrics/)、投机接受率与 OOM

### 12.6 请求链路追踪：
网关、预处理、排队、Prefill、KV 传输、Decode 与客户端交付

### 12.7 分布式诊断：
Rank 性能离群、集合通信超时、死锁、专家偏斜与阶段失衡

### 12.10 诊断证据管理：
日志、转储、配置快照、复现样本与根因分析归档

## 15. Token 计量、成本核算与运营决策

### 15.1 产出边界：
计算工作量、生成 Token、成功交付 Token、SLO 有效产出与计费 Token

### 15.7 成本构成：
硬件折旧、租赁、能源、机房、网络、存储、软件许可与运维

### 15.9 单位经济性：
每百万输入／输出／有效 Token 成本、任务成本与定价毛利

### 15.10 计算公式：
TPM、TGS、cache、uncached

### 15.11 经营与建设决策：
自建／租赁、弹性突发、硬件更新、利用率敏感性与扩容投资回收
