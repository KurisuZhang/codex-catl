# GPU / NPU 租赁与大模型推理调研

资料核验日期：2026-09-14。PPT 共 14 页，包含封面及 2 页附录。

## 调研目标与口径

为租赁服务器建立可审核的技术依据，依次回答：完整推理需要哪些硬件、指定模型在这些硬件上有何可行路径、如何从 Hugging Face 权重下载验证到持续输出 Token。

目标规模为 2 台昇腾 910B 服务器和 4–6 台 NVIDIA T4 服务器，每台 8 卡。本方案按 **910B 每卡 64GB、T4 每卡 16GB** 测算。910B 具体板卡、显存和整机配置必须在交付时核对，不能仅根据型号推定。

首轮限定文本推理，Qwen 使用 3.8 系列，GLM 使用 5.3。模型清单包含 Qwen3.8-27B、Qwen3.8-Flash-Next、GLM-5.3 与 DeepSeek-V4.1-Flash。Qwen3-8B 仅作基础环境验证。视觉、超长上下文、工具调用、推测解码分别扩展验证。

**证据等级**：厂商规格和框架参考部署属于资料依据；显存计算属于估算；本地硬件支持与吞吐属于待验证项。本项目尚未连接租赁机器，不包含真实 benchmark 或已成功部署声明。

## 14 页讲述大纲

| 页码 | 主题 | 需要讲清楚的内容 | 主要视觉 |
|---|---|---|---|
| 1 | GPU / NPU 服务器与大模型推理 | 调研目标和拟租资源 | NVIDIA 官方产品参考图 |
| 2 | 拟租算力与用途 | 卡数、单机容量、整池容量及用途 | 原生显存柱形图、关键数字 |
| 3 | 完整推理服务器的配置清单 | CPU、RAM、NVMe、网络、软件交付 | 华为产品图、原生配置表 |
| 4 | 两类硬件分池服务 | API 接入、NPU / GPU 资源池、TP 与副本 | 可编辑部署拓扑图 |
| 5 | 目标模型与权重规模 | 完整参数、权重估算、特殊架构 | 模型参数对照表 |
| 6 | 显存预算与精度约束 | 逐卡峰值、缓存、精度与 kernel | 内存构成示意、精度表 |
| 7 | 910B 适配矩阵 | 27B 优先，超大模型参考配置与缺口 | 模型适配矩阵 |
| 8 | T4 适配矩阵 | 小模型多副本，27B 待适配，新架构限制 | 模型适配矩阵 |
| 9 | 硬件可运行模型的判断流程 | 身份、容量、算子、拓扑、正确性、性能 | 六步可编辑流程图 |
| 10 | Hugging Face 下载到首个 Token | 固定版本、完整下载、软件栈与启动 | 官方仓库截图、步骤说明 |
| 11 | 运行验收与 Token 产出测量 | 负载阶梯、性能口径、常见故障 | 测试流程、故障定位表 |
| 12 | 分阶段租赁与验收计划 | 基线、目标模型、规模决策与扩容候选 | 阶段验收表 |
| 13 | 附录 A：最小验证命令 | 下载和 T4 基线服务命令 | 可编辑代码文本 |
| 14 | 附录 B：参考资料与交付清单 | 官方链接、供应商验收内容 | 资料链接、检查清单 |

## 第一部分：需要哪些硬件

### 加速卡容量

| 资源 | 每台配置 | 单台标称显存 | 拟租卡数 | 整池标称显存 |
|---|---|---:|---:|---:|
| 昇腾 910B | 8 × 64GB | 512GB | 16 | 1,024GB |
| NVIDIA T4 | 8 × 16GB | 128GB | 32–48 | 512–768GB |

以上是容量加总，不能当成一个模型可直接访问的统一显存。必须使用受支持的并行策略分配权重和缓存，逐卡满足峰值内存要求。不同芯片的软件栈独立，建议通过 API 路由统一接入，在各自资源池内部部署。

T4 的官方规格为 16GB GDDR6、PCIe 3.0 ×16，显存带宽 320+ GB/s。它属于 Turing / SM75，需关注 PCIe / NUMA 拓扑和卡间通信。硬件规格不能直接换算实际模型 tokens/s。[NVIDIA T4](https://www.nvidia.com/en-us/data-center/tesla-t4/)

### 配套硬件建议

| 配置 | 910B 询价起点 | T4 询价起点 | 核验方式 |
|---|---|---|---|
| CPU | 厂家配套 CPU，核对指令集与容器架构 | 32–64 物理核心 | `lscpu`、CPU / GPU NUMA 亲和性 |
| 主机内存 | 1–2TB | 256–512GB | `free -h`，模型加载峰值 |
| 模型盘 | 4–8TB NVMe | 2–4TB NVMe | `lsblk`、可用容量、实测读取速度 |
| 管理 / API 网络 | 10/25GbE 可作为询价起点 | 10/25GbE 可作为询价起点 | 端口速率、实际吞吐、流量计费 |
| 跨机推理网络 | 优先按 200GbE RDMA 配套评估 | 若跨机切分模型，另测通信成本 | 网卡、交换机、光模块、RDMA、通信库测试 |
| 基础交付 | 系统盘、BMC、机房供电散热、设备权限 | 同左 | 整机健康报告、远程管理、故障响应 |

这些范围是方案建议，**不是模型通用最低配置**。磁盘需容纳原始权重、量化 / 转换产物、下载缓存和日志；主机内存需要覆盖下载、加载与转换阶段，不能只看稳定推理时的占用。

PPT 使用 Atlas 800I A2 作为产品外观参考。官方整机配置包括 4 颗 Kunpeng 920、32 个 DDR4 插槽及 8 个 200GE RoCE 端口，但实际租赁服务器不一定采用同一机箱。应取得具体 BOM 和拓扑，避免把“一个 200G 口”理解为整套 NPU 互联已齐全。冗余电源额定功率也不等于运行功耗。[华为 Atlas 800I A2](https://e.huawei.com/cn/products/computing/ascend/atlas-800i-a2)

### 并行和副本的选择

- TP（张量并行）把一个模型的计算和权重分到多个设备，受切分合法性和通信限制。
- EP（专家并行）用于 MoE 专家的分布，需结合实际 TP / DP / EP 配置计算驻留内存。
- 独立模型副本主要增加聚合请求吞吐，不能保证单请求延迟随卡数下降。
- 首批采用单机验证，再评估跨机。GPU 和 NPU 分池，避免混合到同一通用 TP 组。

## 第二部分：这些服务器可以跑哪些模型

### 模型身份与容量

| 模型 | 需要纳入容量的参数口径 | 16 位权重粗估 | 特殊因素 |
|---|---|---:|---|
| Qwen3.8-27B | 语言约 27B，完整仓库约 28B | 约 56GB | Gated DeltaNet、全注意力、视觉、MTP |
| Qwen3.8-Flash-Next | 主干 125B + n-gram embedding 51B + MTP 4B，另含视觉 | 约 360GB 起 | MoE、QSA、循环状态和额外 embedding |
| GLM-5.3 | 官方 BF16 仓库约 753B | 约 1,506GB | 量化格式、稀疏算子、分布式专家通信 |
| DeepSeek-V4.1-Flash | 主干 552B，另加 Engram、视觉、DSpark 等 | 仅主干约 1,104GB | CED、CSA2、Engram，原始 checkpoint 混合 FP8 / FP4 |

估算为参数量 × 2 bytes，使用十进制 GB，不包含运行缓存。DeepSeek 的 16 位列仅用于统一比较，不是原始下载文件大小。Flash-Next 和 DeepSeek 的激活参数远小于总参数，但容量必须按全部实际驻留权重计算。公开 checkpoint、云服务名称和同系列的其他规格不能相互替代。[Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)、[Qwen3.8-Flash-Next](https://huggingface.co/Qwen/Qwen3.8-Flash-Next)、[GLM-5.3-BF16](https://huggingface.co/zai-org/GLM-5.3-BF16)、[DeepSeek-V4.1-Flash](https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash)

### 精度和 kernel 判断

T4 优先使用 FP16 或已经验证的 W4A16 路径。BF16 checkpoint 可以在部分引擎路径转 FP16，但仍需检查数值稳定性。T4 不具备原生 BF16 / FP8 能力；硬件支持 INT4 不能推出任何 4bit checkpoint 都能直接运行。当前 vLLM 量化矩阵包含 Turing 上 AWQ、GPTQ 和 Marlin 的支持，**Marlin 的 MXFP4 不在 Turing 支持范围内**。不要套用“所有 Marlin 都只能在 Ampere 上运行”的旧判断。[vLLM 量化矩阵](https://docs.vllm.ai/en/latest/features/quantization/)

910B 使用配套驱动、CANN 和 vLLM-Ascend，量化路径按 ModelSlim / Ascend 后端验证。CUDA kernel 无法直接当作 NPU 实现。两类硬件均需逐项确认 attention、GDN、MoE、量化、缓存和图模式的实现，以及对应框架版本。

### 910B 结论

| 模型 | 本轮判断 | 验证起点与边界 |
|---|---|---|
| Qwen3-8B | 优先验证 | 单卡 64GB BF16，4K 上下文，检查环境 |
| Qwen3.8-27B | 优先验证 | 单机 BF16 / W8A8。官方 A2 量化示例 TP2，先降为短上下文和并发 1 |
| Qwen3.8-Flash-Next | 容量可候选、算子待验证 | 单机 512GB 对约 360GB 起的 BF16 权重有容量可能性，但架构与额外模块尚需适配证据 |
| GLM-5.3 | 当前两台不作可用承诺 | BF16 权重超过两台总容量，W8A8C8 文档参考为 4 台 A2；当前实验支持 |
| DeepSeek-V4.1-Flash | 当前两台不作可用承诺 | W8A8 + INT8 Engram 文档参考为 4 台 A2，量化权重的可获取性仍需确认 |

Qwen3.8-27B 的 Ascend 文档基于 vLLM-Ascend 0.23.0，A2 镜像为 `quay.io/ascend/vllm-ascend:v0.23.0`。实施时进一步固定 image digest，不把浮动标签等同于可复现版本。[Qwen3.8-27B Ascend 教程](https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/Qwen3.8-27B.html)

GLM-5.3 的文档参考是 4 台 A2、总计 32 张 64GB 设备，或 2 台 A3，且只覆盖指定版本的多机混合部署。该配置是参考配方，不是数学上的最低卡数。2 台 A2 在 INT8 权重容量层面可能有空间，但上下文、运行缓存、并行切分和稳定性未闭环，因此不应给出可用承诺。[GLM-5.3 Ascend 教程](https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/GLM5.3.html)

DeepSeek-V4.1-Flash 的教程采用 W8A8、INT8 Engram 及 TP8 / DP4 / EP32。核验时文档仍将量化 checkpoint 标为将发布，部署前应验证下载是否可用，或完成受支持的转换。教程未覆盖 Engram 主机卸载，不能假设加 RAM 即可弥补设备内存。A3 每台 8 张 128GB 物理卡可暴露 16 个逻辑设备，不能与 A2 的 8 卡直接按设备数比较。[DeepSeek-V4.1-Flash Ascend 教程](https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/DeepSeek-V4.1-Flash.html)

### T4 结论

| 模型 | 本轮判断 | 验证起点与边界 |
|---|---|---|
| Qwen3-8B | 优先验证 | 2 卡 FP16，完整权重接近或超过单张 T4 容量 |
| Qwen3.8-27B | 容量候选 | 8 卡 FP16 或 2–4 卡 W4A16 仅是容量方案，GDN、SM75 和量化算子待验证 |
| Qwen3.8-Flash-Next | 暂缓首批 | 单机原精度容量不足，低比特产物、额外 embedding 及 kernel 需单独适配 |
| GLM-5.3 | 不建议首批 | 低比特及跨机部署的内存分布、支持和通信成本未验证 |
| DeepSeek-V4.1-Flash | 不建议首批 | 原始 FP8 / FP4 路径和新架构对 T4 需要转换与算子验证 |

Qwen3.8-27B 的约 56GB 权重在 4 张 T4 的 64GB 标称容量内余量较紧，8 卡增加容量余量，但仍不等于证明兼容。官方其他 NVIDIA 新架构上的模型配方也不能直接当作 T4 的验证报告。[Qwen3.8-27B vLLM 配方](https://recipes.vllm.ai/Qwen/Qwen3.8-27B)

## 第三部分：从模型下载到运行的判断方法

### 六道检查

1. **模型身份**：固定 repo、commit SHA、许可证、任务类型。读取 `architectures`、dtype、`quantization_config`、权重索引和 tokenizer / processor 信息。
2. **内存预算**：按每张卡和每个 rank 计算峰值，覆盖权重、未切分模块、量化元数据、缓存、工作区、通信缓冲和图捕获。上下文与并发是预算输入。
3. **执行支持**：核验芯片计算能力与模型架构、attention、MoE、GDN、量化及缓存 kernel 的对应实现。
4. **并行拓扑**：核验 TP / EP 切分、整除约束、每 rank 驻留、卡间和节点间通信。运行 NCCL / HCCL 的配套通信测试。
5. **正确生成**：真实权重成功加载，tokenizer 与模板匹配，API 产生可解码文本，有限值检查和固定样本质量通过。
6. **稳定产出**：在固定请求集、长度、并发与精度下记录输出吞吐、延迟、成功率和显存，完成持续运行与恢复测试。

### 显存计算补充

```text
每卡峰值 = 本卡实际驻留权重
         + KV cache / 循环状态 / 特殊缓存
         + 激活与临时 workspace
         + 通信缓冲、图捕获及内存碎片余量

权重近似字节数 = 总参数量 × 平均每参数字节数
```

16 位、8 位和 4 位权重的理想字节数分别约为 2、1 和 0.5 bytes / 参数，但未量化层、scale / zero point、padding 和额外模块会增加占用。不能仅用“总容量除以卡数”代替实际分片图。

对普通 GQA 全注意力模型，未分片 KV 近似为：

```text
KV bytes = 2 × 层数 × KV 头数 × head_dim
           × 缓存元素字节数 × 所有活跃序列的缓存 Token 总数
```

例如 Qwen3-8B 配置为 36 层、8 个 KV 头、128 维，FP16 KV 约 144KiB / Token。单序列 4,096 Token 约 576MiB，16 条约 9GiB，未计并行分片或 KV 复制。该公式不直接适用于 GDN、MLA、CSA 或 CED。[Qwen3-8B 配置](https://huggingface.co/Qwen/Qwen3-8B/raw/main/config.json)

### 实施前环境记录

在交付服务器记录以下信息，归档到本次实验目录：

```bash
uname -a
lscpu
free -h
lsblk
df -h /data

# NVIDIA 机器
nvidia-smi
nvidia-smi topo -m

# Ascend 机器
npu-smi info

# 在选定容器内部
python -m pip freeze > requirements.freeze.txt
```

另行保存镜像 digest、宿主驱动版本、CANN / CUDA 版本、固件、网络和容器设备映射。NVIDIA 与 Ascend 分别使用匹配软件栈。安装依照对应模型官方容器教程，避免把不相关的驱动、框架和 nightly 版本任意拼接。

### 下载完整模型并固定版本

以下代码在目标服务器执行。本报告没有下载大型权重到办公电脑。需先在选定环境安装兼容的 `huggingface_hub`，受限仓库按许可证要求完成授权，不把访问令牌写进共享脚本。

```python
from pathlib import Path
from huggingface_hub import HfApi, snapshot_download

repo = "Qwen/Qwen3-8B"
model_dir = Path("/data/models/Qwen3-8B")
record_dir = Path("/data/experiments/qwen3-smoke")
record_dir.mkdir(parents=True, exist_ok=True)

# 首次解析后记录 SHA；复现实验时使用已记录的 SHA。
sha = HfApi().model_info(repo).sha
(record_dir / "model_revision.txt").write_text(
    f"repo={repo}\nrevision={sha}\n", encoding="utf-8"
)

snapshot_download(repo_id=repo, revision=sha, local_dir=model_dir)
print("Downloaded:", repo, sha, model_dir)
```

同等 CLI 方法如下，SHA 必须替换为真实记录值：

```bash
hf download Qwen/Qwen3-8B \
  --revision <已记录的commit-SHA> \
  --local-dir /data/models/Qwen3-8B
```

完整下载应保留模型配置、所有权重分片及索引、tokenizer、special token、模板和必要 processor 文件。然后核对 safetensors 索引里的全部分片是否存在。首次调研可先读 metadata，但不能把“下载了配置文件”当作完整模型已就绪。[Hugging Face CLI 文档](https://huggingface.co/docs/huggingface_hub/guides/cli)

### T4 最小基线服务

在已安装并验证 T4 / SM75 支持的 vLLM 容器里执行。以下是起步参数，**尚未在本项目服务器实测**。

```bash
CUDA_VISIBLE_DEVICES=0,1 vllm serve /data/models/Qwen3-8B \
  --dtype float16 \
  --tensor-parallel-size 2 \
  --max-model-len 4096 \
  --max-num-seqs 1 \
  --gpu-memory-utilization 0.85 \
  --enforce-eager \
  --served-model-name smoke-qwen3 \
  --host 127.0.0.1
```

910B 的对应基线使用匹配的 vLLM-Ascend 容器，限制可见 NPU 为一张、使用 `--dtype bfloat16 --tensor-parallel-size 1`，其余短上下文验收思路相同。图模式和更高并发在正确性通过后另测。若后端选择失败，先检查该版本对目标芯片的 attention 支持，不能盲目强制 FlashAttention2。

### API 验证

在服务同机执行，先确认模型列表，再请求生成：

```bash
curl -fsS http://127.0.0.1:8000/v1/models

curl -fsS http://127.0.0.1:8000/v1/chat/completions \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "smoke-qwen3",
    "messages": [{"role": "user", "content": "请用一句中文解释什么是显存。"}],
    "max_tokens": 128,
    "temperature": 0,
    "chat_template_kwargs": {"enable_thinking": false}
  }'
```

通过条件是使用真实模型权重产生可解码、内容合理的回答，`usage` 计数正常，服务日志无 OOM、NaN 或算子错误。端口能访问、`/v1/models` 有返回或未初始化权重的 kernel 自测，都不足以证明真实推理成功。

### 切换目标模型

基线通过后，每次只切换一个变量。Qwen3.8-27B 使用其专用架构支持与 A2 / NVIDIA 对应配方；GLM-5.3 和 DeepSeek-V4.1-Flash 使用各自模型教程。不能只替换上述基线命令中的模型目录。

量化转换必须输出引擎认可的格式，并保存转换工具版本、校准集、原始和转换后权重 SHA / manifest。DeepSeek 原始 checkpoint 的 FP8 / FP4 与 Ascend W8A8 不是可互换文件，Engram、视觉和草稿模块也必须纳入处理。[DeepSeek 配置](https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/config.json)

模板、特殊 token 和 reasoning parser 按模型发布方说明设置。尤其不要把其他 DeepSeek 版本的 chat template 直接用于 V4.1。初次短文本测试可关闭非必需的视觉和推测解码功能，但某个配方必需的架构参数需保留。

### 性能验收与成本口径

| 项目 | 记录要求 |
|---|---|
| 模型与环境 | repo / SHA、精度、镜像 digest、驱动、硬件、TP / DP / EP、启动命令 |
| 请求负载 | 固定提示集，输入 2K / 8K / 32K 分档，输出上限先设 256，并发 1 / 4 / 16 分档 |
| 上下文 | 输入 + 实际输出不超过配置上限，每次增大都重算显存 |
| 延迟 | TTFT 和 TPOT 的 p50、p95，明确采样方式 |
| 吞吐 | 成功请求实际 completion Token 总数 / 测试壁钟时间 |
| 正确性 | 固定样本、量化前后回归、任务质量与数值异常 |
| 稳定性 | 成功率、OOM、峰值显存、重试、建议至少 1 小时持续测试及恢复 |

输出统计区分推理 Token 与最终正文 Token，不混入输入 Token、padding 或请求的最大生成上限。预热与正式测量分开，缓存命中规则固定。聚合吞吐和单用户流式输出速率分别汇报。

```text
日有效 Token ≈ 实测有效输出速率 × 86,400 × 业务占用率 × 可用率
每百万有效 Token 成本 = 日总费用 ÷ (日有效 Token / 1,000,000)
```

若实测速率已经包含空闲、失败或不可用时段，不再重复乘相同折减因素。费用包含租金、网络、存储和运维，待取得报价后计算。本报告不编造租金和 Token 速率。

## 租赁执行建议

先分别用一台 NPU 和一台 T4 做样机验证，再验证 Qwen3.8-27B 和计划承载的小模型服务。以真实负载的吞吐、延迟与费用决定 T4 采用 4 台还是 6 台。合同尽量包含指定模型、精度、负载和恢复要求的验收条款。

若 GLM-5.3 或 DeepSeek-V4.1-Flash 是必须承载的主目标，可将 **4 台 A2 或 2 台 A3** 作为单独询价和 PoC 路径。当前 2 台 A2 方案对应增加 2 台同类设备的候选，但必须先闭环量化权重、专用镜像、RDMA 网络和目标负载。参考配置不等于保证吞吐，也不排除经过验证的其他量化或短上下文方案。

## 官方资料与图片出处

1. [Huawei Atlas 800I A2](https://e.huawei.com/cn/products/computing/ascend/atlas-800i-a2)
2. [NVIDIA T4](https://www.nvidia.com/en-us/data-center/tesla-t4/)
3. [vLLM 量化兼容矩阵](https://docs.vllm.ai/en/latest/features/quantization/)
4. [Qwen3.8-27B 模型卡](https://huggingface.co/Qwen/Qwen3.8-27B)
5. [Qwen3.8-Flash-Next 模型卡](https://huggingface.co/Qwen/Qwen3.8-Flash-Next)
6. [GLM-5.3-BF16 模型卡](https://huggingface.co/zai-org/GLM-5.3-BF16)
7. [DeepSeek-V4.1-Flash 模型卡](https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash)
8. [Qwen3.8-27B Ascend 教程](https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/Qwen3.8-27B.html)
9. [GLM-5.3 Ascend 教程](https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/GLM5.3.html)
10. [DeepSeek-V4.1-Flash Ascend 教程](https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/DeepSeek-V4.1-Flash.html)
11. [Qwen3.8-27B vLLM 配方](https://recipes.vllm.ai/Qwen/Qwen3.8-27B)
12. [Hugging Face 下载 CLI](https://huggingface.co/docs/huggingface_hub/guides/cli)
13. [Qwen3-8B 配置](https://huggingface.co/Qwen/Qwen3-8B/raw/main/config.json)
14. [DeepSeek-V4.1-Flash 配置](https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/config.json)
15. [华为产品图源文件](https://e-file.huawei.com/marketingcloud/pep/asset/2000000101/images/products/computing/ascend/atlas-800i-a2/banner-bequoted.png)
16. [NVIDIA 产品图源文件](https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/tesla-t4/t4-inference-page-t4-banner-2560-u.jpg)

第 10 页截图来自官方 Qwen3.8-27B Hugging Face 仓库。图片用于产品和资料参考，不代表实际交付机器或实际推理结果。相关网页的 `latest` 和仓库 `main` 会变化，实施时应重新核对并固定版本。
