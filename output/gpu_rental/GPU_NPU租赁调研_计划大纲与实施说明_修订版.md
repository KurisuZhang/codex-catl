# GPU / NPU 租赁调研：计划大纲与实施说明（修订版）

核验日期：2026-09-14。配套演示文稿共 14 页，只有三个主体部分。目标是判断指定硬件能否稳定产出文本、检测结果或视频，不能用“显存加总够大”代替部署证明。

**本报告属于公开资料与源码核验，未连接租赁服务器，不包含本机运行或性能测试。** 910B 暂按每卡 64GB 计算；实际容量、板卡、主机架构和互联必须由供应商确认。若配置不同，所有预算与结论重新计算。

| 页码 | 层级 | 主题 |
|---|---|---|
| 1 | 封面 | 三大部分及租赁范围 |
| 2–4 | 第一部分：硬件配置清单 | 资源池、单机 BOM、集群配套与最终交付环境 |
| 5–8 | 第二部分：模型适配结论 | 总表、双机 910B、T4 文本与检测、最新视频模型 |
| 9–14 | 第三部分：判断模型适配方法论 | AND 判定、证据清单、内存与精度、下载到输出、实例、验收 |

## 第一部分：硬件配置清单

### 1.1 规模与用途

| 项目 | 910B 池 | T4 池 |
|---|---|---|
| 服务器 | 2 台 | 4–6 台 |
| 每台加速卡 | 8 张 | 8 张 |
| 加速卡总数 | 16 张 | 32–48 张 |
| 单卡标称容量 | 64GB，待确认 | 16GB |
| 单台标称容量 | 512GB | 128GB |
| 全池标称容量 | 1,024GB | 512–768GB |
| 调研目标 | GLM-5.3、DeepSeek-V4-Pro、Qwen3.8-Flash 对应公开权重 | Qwen3.8-27B、YOLO、近期视频生成模型 |

容量加总不是统一显存。模型实例需要框架明确支持模型层分配、TP、EP 或其他并行方式；多副本只增加独立任务容量。两类硬件分池部署，通过业务入口调度。[Huawei 整机参考](https://e.huawei.com/cn/products/computing/ascend/atlas-800i-a2) · [NVIDIA T4](https://www.nvidia.com/en-us/data-center/tesla-t4/)

### 1.2 完整单机 BOM

以下 RAM、磁盘和 CPU 数量是询价建议，不是所有模型的最低部署条件，也不代表预算已经通过。

| 部件 | 910B：每台要求 | T4：每台要求 | 验收方式 |
|---|---|---|---|
| 加速卡 | 8 张、每卡 64GB 待确认 | 8 张、每卡 16GB | 设备清单、容量、健康与独占方式 |
| CPU 与主板 | 厂家配套 CPU / 主板，架构匹配容器 | 32–64 物理核建议；完整主板 | CPU 型号/架构/核数、NUMA |
| 主机内存 | 1–2TB ECC RAM 建议 | 256–512GB ECC RAM 建议 | 实际可用内存、DIMM 与 ECC |
| 卡间承载 | 配套 NPU 板卡与内部互联 | 8 卡插槽、PCIe riser 与供电 | 卡间拓扑、链路速率、NUMA 路径 |
| 系统盘 | 2 × 960GB SSD，RAID1 | 同左 | RAID 状态；可用容量约单盘量级 |
| 模型/缓存盘 | 本地 NVMe 可用 8TB 起 | 本地 NVMe 可用 4TB 起 | 实际可用容量、读写、挂载与权限 |
| 业务网卡 | 按服务流量配置业务端口 | 双口 25GbE 建议 | 带宽、IP、MTU、路由 |
| 跨机互联 | 配套 NPU RDMA 端口和全部链路 | 多副本无需强制跨机模型并行 | HCCL/RDMA 或实际框架通信测试 |
| 管理口 | 独立 BMC，远程开关机/控制台 | 同左 | 管理接入、故障处置 |
| 机箱附件 | 完整机箱、导轨、冗余 PSU、风扇、电源线 | 必须满足 8 张被动散热 T4 的整机风道 | 带载温度、功率、无降频与异常 |

磁盘预算按“原始权重 + 量化产物 + 下载缓存 + 输出文件 + 日志与留存”逐项相加。CPU 卸载还需要计入主机内存及传输开销，不能把大 RAM 当成所有模型适配问题的解决方案。

### 1.3 集群级配套

| 配套 | 规模与要求 |
|---|---|
| NPU 数据网络 | 以实际端口为准。若每台 8 × 200GE，则双机共 16 条接入链路；交换机提供相应端口和交换容量，配齐上联 |
| 线缆/模块 | 16 条光链路需要两端匹配的 32 只模块及 16 条光纤；或选 16 条 AOC，不能两种方案重复计费 |
| T4 业务网络 | 双口 25G 对应 8–12 个服务器接入口，另计交换机上联 |
| 管理网络 | 6–8 个 BMC 接入口，补齐网线、IP 和管理接入 |
| 模型/输出存储 | 镜像仓库、模型归档、视频输出与备份目标；按留存量计算，允许复用已有存储 |
| 接入与监控 | 请求队列、接口、鉴权、日志、监控与告警，可复用现有主机，不需额外 GPU |
| 机房 | 机柜空间、导轨、双路供电/PDU、整机散热、远程控制和故障更换 |

网络速率是项目参考，最终由整机拓扑和专用部署配方确定。一个高速业务口不能自动替代全部 NPU 的 RDMA 链路。PDU 按整机最大功耗和冗余方案规划，不以 PSU 铭牌简单相加作为实际功耗。

### 1.4 最终交付环境

910B：Linux、匹配的驱动/固件/CANN、HCCL/RDMA、模型专用容器与设备权限。T4：Linux、NVIDIA 驱动、包含 SM75 支持的 CUDA/PyTorch 或 TensorRT 环境、容器运行时。文本、检测、视频使用分别固定的环境。

交付物包括：硬件清单、每卡可用显存、拓扑图、通信结果、镜像 digest、框架 commit、依赖锁文件、模型 revision、启动脚本、代表性输入输出及运行日志。不能以“容器能启动”作为目标模型验收。

## 第二部分：模型适配结论

### 2.1 结论标准

- **官方同硬件已验证**：公开文档有对应硬件的运行依据；仍需租赁机复验。
- **可进入 PoC**：有实现路径，但数值、某些算子、逐卡峰值或拓扑尚未完整验证。
- **双机未确认 / 不满足当前配方**：不能签署“可部署”承诺；不等于证明一切未来实现都不可能。
- **当前原版不适配**：存在明确执行条件冲突，例如官方要求 Hopper 而目标为 T4。

### 2.2 双机 8 卡 910B

| 目标 | 查验结果 | 本配置结论 |
|---|---|---|
| GLM-5.3 | BF16 完整权重约 753B，粗估 1,506GB；vLLM-Ascend 有 W8A8C8 实验性配方，参考 4 A2 | BF16 容量不足；W8 理想权重约 753GB 不能证明完整运行。未找到双机 W4 闭环配方，双机不承诺 |
| DeepSeek-V4-Pro | 约 1.6T 总参数、49B 激活；官方 Ascend W4A8 路径明确至少 4 A2 或 2 A3 | 当前 2 A2 不满足这条配方；已经量化为 W4A8，不能再以“改成低精度”略过缺口 |
| Qwen3.8-Flash-Next | 云端 Flash 对应的公开基础权重；FlagOS 发布昇腾适配，定制 SGLang 与算子；示例单机 16 设备 | 有昇腾支持证据，但不能由此推定双机 8 卡 910B；需要核对芯片、逻辑设备、跨机方式与每卡峰值 |

GLM：原始 FP8 checkpoint 不等于昇腾 W8A8C8 产物，量化源和工具要按专用配方核对。4 A2 是参考运行配置，不宜推导成任何上下文下的数学最小节点数。[GLM BF16](https://huggingface.co/zai-org/GLM-5.3-BF16) · [GLM Ascend 教程](https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/GLM5.3.html)

DeepSeek：原始 FP4/FP8 与 Ascend 的 W4A8 打包格式和 kernel 不同。理想全 4bit 为约 800GB，尚未包含未量化模块、元数据和运行开销。A3 每台 8 × 128GB 的配置不能等同 A2 每台 8 × 64GB。[官方模型](https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro) · [Ascend 部署要求](https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/DeepSeek-V4-Pro.html)

Flash-Next：模型全量约 180B 起，BF16 粗估约 360GB 起。公开服务名与可下载仓库要分开。FlagRelease 的 BF16 仓库示例实际开启 MoE W8A16，并依赖替换后的模型/算子文件；因此不能只下载权重后套一个普通 vLLM 命令。[Qwen 模型说明](https://huggingface.co/Qwen/Qwen3.8-Flash-Next) · [FlagRelease 昇腾适配](https://huggingface.co/FlagRelease/Qwen3.8-Flash-Next-BF16-ascend-FlagOS)

参考环境：GLM/DeepSeek 教程使用 vLLM-Ascend v0.23.0 对应配方；Flash-Next 发布镜像标明 CANN8.5、torch_npu2.8、SGLang0.5.11、FlagGems5.3.0，并映射 16 个 davinci 设备，TP4/DP4。实施时记录镜像 digest，核对宿主兼容要求，不直接换成 latest。

**双机 910B 的实施决策**：优先要求供应商提供 Flash-Next 在同芯片、同容量、同节点拓扑下的真实运行记录。GLM 和 DeepSeek 如为硬性交付目标，供应商需提交同配置的新证据，或报价官方参考硬件；本报告不能确认这三者都能在现有双机部署。

### 2.3 T4：Qwen3.8-27B

完整权重约 28B、FP16 粗估约 56GB；单台 8 T4 的 128GB 标称加总仅通过初步容量筛选。[Qwen 官方模型卡](https://huggingface.co/Qwen/Qwen3.8-27B)

候选路径使用包含 Qwen3.5 架构实现的 Transformers 版本，FP16、eager attention，以及 GDN 的 PyTorch 回退；用 Accelerate 按层分配到本机多卡。源码存在 `torch_chunk_gated_delta_rule` 和 `torch_recurrent_gated_delta_rule` 等回退，但这不是本机运行证明。[Transformers 模型源码](https://raw.githubusercontent.com/huggingface/transformers/main/src/transformers/models/qwen3_5/modeling_qwen3_5.py)

先测 batch1、输入 512–1024、输出 128。必须检查：实际加载架构正确、无可选融合算子误选、所有必需算子能在 SM75 执行、FP16 无溢出、输出质量、`hf_device_map`、逐卡峰值、CPU 卸载是否发生。模型层分配不是高效 TP，PCIe 往返和逐层执行可能很慢。通过生成后再评估并行引擎优化。

T4 缺少原生 BF16/FP8 执行能力；硬件 INT4、框架支持 AWQ/GPTQ、该模型量化 kernel 可用，是三个不同条件。不能仅凭通用量化矩阵宣布新模型支持。[vLLM 量化矩阵](https://docs.vllm.ai/en/latest/features/quantization/)

### 2.4 T4：YOLO26

官方 YOLO26 页面列有 T4 TensorRT10 检测测试，可采用 YOLO26s、640 输入、单卡 FP16 作为交付验证起点。在目标 T4 导出 TensorRT engine；按单卡实例扩容。前处理、解码和输出处理仍计入端到端性能。[YOLO26](https://docs.ultralytics.com/models/yolo26/) · [TensorRT 集成](https://docs.ultralytics.com/integrations/tensorrt/)

导出示例（未在本项目硬件执行，实际参数以锁定版本为准）：

```python
from ultralytics import YOLO
model = YOLO("yolo26s.pt")
model.export(format="engine", imgsz=640, batch=1, quantize=16, device=0)
```

记录下载权重校验值、Ultralytics/TensorRT/CUDA 版本。INT8 需代表性校准集，并与 FP16 基线比较 mAP/召回率；不能只比较 engine 大小或速度。

### 2.5 T4：最新视频模型与备选

| 模型 | 实现条件 | T4 判断 |
|---|---|---|
| LTX-2.5 | 22B 视频模型、12B 文本编码器等组件；BF16 主路径，支持卸载及 FP8 低内存方案 | 没有完整 T4 证据。存在 SDPA 回退，不应误说必须 FlashAttention；但转 FP16、量化和完整管线数值仍需新验证 |
| MAGI-2-preview | 114B MoE、6B 激活；官方要求 8 张 Hopper，依赖 MagiAttention/MagiCompiler | 当前原版执行条件不匹配 T4，增加 T4 卡数不能替代架构要求 |
| CogVideoX-2B | 较旧；FP16 推荐，Diffusers、量化/卸载/VAE 分块有公开路径，模型卡提到 T4 | 可作为另一个视频 PoC，不能冒充最新模型；其显存表测试硬件并非 T4，不能直接套数值 |

[LTX-2.5](https://huggingface.co/Lightricks/LTX-2.5) · [LTX 实现与安装](https://github.com/Lightricks/LTX-2) · [MAGI-2-preview](https://huggingface.co/sand-ai/MAGI-2-preview) · [CogVideoX-2B](https://huggingface.co/zai-org/CogVideoX-2b)

若“最新视频模型”必须本地运行，建议按所选模型的官方验证 GPU 单独询价。若先验证 T4 视频能力，使用旧模型备选，明确视频时长、尺寸、质量和速度验收范围。

## 第三部分：判断模型适配方法论

### 3.1 判定对象

一次部署结论绑定以下元组：

`模型 repo + revision + 权重变体 + 量化格式 + 框架/kernel版本 + 驱动运行库 + 每卡硬件/拓扑 + 负载 + 质量阈值`

“这个模型支持 NVIDIA/昇腾”粒度不足，不能作为结论。

设 A=文件完整，B=架构识别，C=精度与必需算子兼容，D=逐卡峰值满足，E=分片通信可行，F=主机资源及完整输入输出组件满足。

**静态合格 = A ∧ B ∧ C ∧ D ∧ E ∧ F。**

**已验证可部署 = 静态合格 ∧ 真实权重正确输出 ∧ 质量回归通过 ∧ 指定负载稳定达标。**

任一失败，当前方案不通过；证据缺失，标为“待验证”，不能当通过。改变精度、模型版本、kernel、设备或负载后，重算相关条件并重新运行验收。

### 3.2 证据清单

| 检查 | 通过标准 | 保存证据 | 失败处理 |
|---|---|---|---|
| 身份与文件 | 确定公开仓库及 SHA；完整权重/配置可获得 | 文件清单、索引、dtype、模型配置、使用条款 | 补齐；确认 API 名称与公开权重关系 |
| 架构 | config 与框架实现匹配 | 类名、源码 commit、模块列表 | 换支持版本或适配实现 |
| 精度与算子 | 每个必需模块都有目标芯片实现或验证过的回退 | kernel 清单、SM/NPU 要求、量化配置与运行日志 | 换后端/转换权重；重新验数值 |
| 内存 | 每 rank 峰值低于实测可用显存 | 分片清单、预算及峰值曲线 | 缩负载、量化或增卡后重算 |
| 并行 | 维度、专家、头数及复制规则合法；通信通过 | 映射、拓扑、HCCL/NCCL或相应通信结果 | 改分片、补链路或换设备 |
| 主机与组件 | RAM/磁盘/IO足够；tokenizer、视觉编码器、VAE、解码器等齐全 | 资源峰值、组件版本、输入输出样本 | 补资源/组件或调整卸载 |
| 数值与质量 | 无 NaN/Inf；固定样本与基线比较通过 | 原始输出、评估集、质量指标 | 查精度和算子；降低性能优化级别后重测 |
| 生产负载 | 约定并发/长度/尺寸下延迟、成功率与质量达标 | 性能日志、故障恢复、持续运行结果 | 定位瓶颈或调整业务目标 |

kernel 清单覆盖 attention、GDN、MoE 路由/GEMM、量化解码、归一化、通信及实际启用的 MTP/视觉/VAE。还要区分 group size、scale dtype、激活精度、KV 精度和打包格式。

### 3.3 内存计算

```text
峰值(rank r) = 驻留权重_r + KV/循环状态_r + 激活/临时工作区_r
             + 通信/图缓存_r + 碎片及安全余量_r
通过条件：每一个 rank 的峰值 < 该 rank 实际可用显存
```

权重按实际张量 dtype、量化布局、分片归属求和，加入未分片 embedding、scale/zero-point、视觉编码器等。参数量 × bit/8 只是下界附近的粗估。

常规 GQA 的 KV 可从 `2 × 层数 × KV头数 × head_dim × 每元素字节 × 缓存Token数` 起算，再按实际复制/切分修正；GDN、MLA 等采用其实现的状态结构，不直接套此公式。视频按帧数、尺寸、VAE 和文本编码器共同计峰值。

推导反例：1.6T × 4/8 ≈ 800GB，小于双机标称 1,024GB；这个算术只检查了理想权重，未证明每卡峰值和执行拓扑，因此不能推出 V4-Pro 双机可部署。

### 3.4 下载到运行的执行步骤

1. 明确任务、输入输出长度/尺寸、并发和质量阈值；形成部署元组。
2. 查看模型卡、`config.json`、分片索引与量化配置；选定框架和硬件配方。
3. 解析 revision 并下载完整 snapshot；保存清单，验证索引对应文件齐全。
4. 如需量化，记录源 SHA、转换工具、校准集、目标配置和权重校验值。
5. 固定容器/依赖，核对设备、运行库、算子及拓扑；完成静态清单。
6. 用真实权重、小负载生成完整结果；检查数值、模板及输出组件。
7. 做固定样本质量回归，再逐级提高负载；每级保存每卡峰值与延迟。
8. 完成持续测试和恢复验证，形成限定配置下的交付报告。

完整下载示例（需要联网与充足磁盘；只是实施示例，未下载这些大型权重）：

```python
import json
from pathlib import Path
from huggingface_hub import HfApi, snapshot_download

repo = "Qwen/Qwen3.8-27B"
revision = HfApi().model_info(repo).sha
target = Path("/data/models/Qwen3.8-27B")
snapshot_download(repo_id=repo, revision=revision, local_dir=target)
manifest = {
    "repo": repo, "revision": revision,
    "files": [{"path": str(p.relative_to(target)), "bytes": p.stat().st_size}
              for p in sorted(target.rglob("*"))
              if p.is_file() and ".cache" not in p.relative_to(target).parts]
}
(target / "deployment-manifest.json").write_text(
    json.dumps(manifest, ensure_ascii=False, indent=2)
)
```

使用 `snapshot_download` 不代表自动验证所有权重的运行适配；还要读取索引、核对文件与可信发布版本。[Hugging Face 下载文档](https://huggingface.co/docs/huggingface_hub/guides/download)

Qwen27 的候选加载方式应在审定版本中使用 FP16、`attn_implementation="eager"`、按层设备映射，并检查默认可选 kernel 是否关闭。这里不提供未经核验的通用一键命令：Ascend 三个目标需要不同专用实现，不能只替换基线命令里的模型名称。

### 3.5 实例推导

**YOLO26s / T4**：官方权重与框架路径存在 → 官方有同硬件 TensorRT10 测试 → 具备同硬件部署依据 → 在交付 T4 导出 engine、复验指定输入、质量与负载 → 通过后写本机验收结果。

**Qwen3.8-27B / 8 T4**：有模型实现与 PyTorch 回退 → FP16 粗估容量有空间 → 完整数值、SM75执行、分层峰值和性能尚未知 → 允许 PoC，不能写“已确认可部署”。

**DeepSeek-V4-Pro W4A8 / 2 A2**：有专用量化路径 → 当前硬件少于该配方至少4A2 → 当前配方不通过。若改硬件或出现新双机实现，重新审核全部条件。

### 3.6 最终验收

| 任务 | 输出证明 | 指标 |
|---|---|---|
| 文本 | 完整回答、实际输入输出 Token 数、固定提示集 | TTFT、TPOT、成功吞吐、错误率、质量回归 |
| 检测 | 框/类别/置信度、固定评估集 | 端到端延迟、FPS、mAP/召回率 |
| 视频 | 可播放文件、帧数/尺寸/FPS/随机种子 | 秒/视频、峰值显存、黑帧与画质 |

性能只在明确输入、输出、并发和精度下比较。持续测试建议至少1小时，另测服务重启与故障恢复；具体阈值需由业务确定，未给阈值时只记录结果，不宣称生产达标。

报告结论模板：

```text
模型仓库 / SHA / 量化产物：
硬件：节点、每卡型号与可用容量、拓扑：
软件：驱动 / CANN或CUDA / 镜像digest / 框架commit：
负载：输入、输出、并发或视频尺寸帧数：
静态条件：逐项通过 / 失败 / 待验证，及证据位置：
真实输出与质量回归：
每卡峰值、延迟、吞吐与错误率：
持续测试及恢复：
结论：仅对以上配置和负载有效；剩余限制：
```

公开网页的 `latest` 和仓库 `main` 会变化；执行时必须重新核对并固定版本。本修订版没有把未知项改写为支持，也没有以较旧视频模型代替用户要求的最新模型。
