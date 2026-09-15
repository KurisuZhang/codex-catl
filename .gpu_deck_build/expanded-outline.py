from pathlib import Path
r=Path('/Users/lin/Desktop/catl')
p=r/'output/gpu_rental/GPU_NPU租赁调研_计划大纲与实施说明_修订版.md'
s=p.read_text().replace('（修订版）','（模型增补版）')
s=s.replace('总表、双机 910B、T4 文本与检测、最新视频模型','910B 候选与低精度路径、T4 文本与检测、Wan / HunyuanVideo')
s=s.replace('GLM-5.3、DeepSeek-V4-Pro、Qwen3.8-Flash 对应公开权重','GLM-5.3（含低精度）、GLM-5.3-Flash、DeepSeek-V4-Flash、MiniMax-M3；保留 V4-Pro / Qwen Flash-Next')
s=s.replace('Qwen3.8-27B、YOLO、近期视频生成模型','Qwen3.8-27B、YOLO、Wan / HunyuanVideo')
start=s.index('### 2.2 双机 8 卡 910B')
end=s.index('### 2.3 T4：Qwen3.8-27B')
s=s[:start]+'''### 2.2 双机 8 卡 910B：低精度候选增补

| 模型 | 指定低精度路线 | 本配置结论 |
|---|---|---|
| GLM-5.3 | Ascend W8A8C8；继续考察 W4 | W8 官方参考4A2，双机W4完整权重/框架/kernel链路未证实 |
| GLM-5.3-Flash | Ascend W8A8 | 有2台、每台8卡64GB的A2配方，可进入同配置交付验证 |
| DeepSeek-V4-Flash | Ascend W8A8-mtp；0731 DSpark另锁版本 | 官方支持单台8×64GB A2，可每台独立部署 |
| MiniMax-M3 | Ascend W8A8 | 官方列明至少8×64GB，支持单A2；两台可分别承担服务 |
| DeepSeek-V4-Pro | Ascend W4A8 | 原结论保留：当前配方至少4A2，双机不满足 |
| Qwen3.8-Flash-Next | BF16仓库 + FlagOS定制运行时 | 原结论保留：有昇腾实现，缺双机910B同拓扑证明 |

“官方配方支持”不等于本项目已经实测，也不意味着这些模型可以同时驻留。全部容量以每卡64GB的真实A2整机为前提。

**GLM-5.3 低精度。** 约753B完整参数，理想W8权重约753GB、理想W4约376.5GB；均不含未量化模块、元数据、缓存和通信开销。已找到W8A8C8实验性部署参考4A2；本次没有找到双机W4完整部署链路。因此新增W4考察项，但保留“未确认”，不能把第三方GGUF或GPU量化产物直接视为Ascend可用。[GLM BF16权重](https://huggingface.co/zai-org/GLM-5.3-BF16) · [GLM-5.3 Ascend配方](https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/GLM5.3.html)

**GLM-5.3-Flash W8A8。** 与GLM-5.3不同，约320B总参数、18B激活，包含混合稀疏/线性注意力、mHC、MoE。vLLM-Ascend教程5.2明确双机每台8×64GB，跨节点DP2、节点内TP8并启用EP；容器映射每机davinci0..7。前置条件中“2 A2 (64GB×16)”括号容易误读，应结合5.2和脚本按总16卡理解。模型参考 `Eco-Tech/GLM-5.3-Flash-w8a8`，A2镜像 `quay.io/ascend/vllm-ascend:glm-5.3-flash`；使用专用算子并核对HCCL，启用MTP时草稿为eager。不能换用950DT的W8A8-MXFP8产物。[模型卡](https://huggingface.co/zai-org/GLM-5.3-Flash) · [A2部署教程](https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/GLM5.3-Flash.html) · [教程链接的量化权重](https://www.modelscope.cn/models/Eco-Tech/GLM-5.3-Flash-w8a8)

**DeepSeek-V4-Flash W8A8。** 官方配方直接列明单台A2（8×64GB），依赖Ascend DSA、混合KV、MoE与量化算子。基础MTP路径使用 `DeepSeek-V4-Flash-w8a8-mtp` 与A2 v0.23.0镜像；0731 DSpark权重另需至少v0.25.0及 `DeepSeekV4-flash-0731` 专用A2镜像，不能用旧MTP环境仅替换权重。两台可作为独立服务；如选PD分离，需要重新按专用拓扑验收。[部署教程](https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/DeepSeek-V4-Flash.html) · [教程链接的MTP量化权重](https://www.modelscope.cn/models/Eco-Tech/DeepSeek-V4-Flash-w8a8-mtp)

**MiniMax-M3 W8A8。** 模型卡约428B参数、23B激活，包含MSA稀疏注意力。vLLM-Ascend教程基于v0.27.1，明确W8A8至少8×64GB，并支持单A2；权重链接为 `Eco-Tech/MiniMax-M3-w8a8-0626`。文档部分示例使用A3拓扑，实施时要核对A2的TP/EP映射，不能照搬16逻辑设备命令。950DT的MXFP8、其他GPU的MXFP4均不是同一执行路径。主机驱动/CANN须与实际镜像兼容，不能将v0.27.1包单独安装进旧容器。[模型卡](https://huggingface.co/MiniMaxAI/MiniMax-M3) · [Ascend教程](https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/MiniMax-M3.html) · [教程链接的量化权重](https://www.modelscope.cn/models/Eco-Tech/MiniMax-M3-w8a8-0626)

**保留候选。** V4-Pro W4A8仍需至少4A2参考配置；Flash-Next的FlagRelease示例为单机16逻辑设备，不能直接证明双机910B。此次新增的Flash模型与Pro版本分别判断，禁止混用结论。[V4-Pro](https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/DeepSeek-V4-Pro.html) · [Flash-Next昇腾适配](https://huggingface.co/FlagRelease/Qwen3.8-Flash-Next-BF16-ascend-FlagOS)

建议先分别验证DeepSeek-V4-Flash或MiniMax-M3单机，再验证GLM-5.3-Flash双机。模型仓库及镜像标签来自官方教程引用，量化仓库页面可定位但未下载数百GB文件，权重分片、校验值及加载成功仍需交付阶段验证。

''' + s[end:]
start=s.index('### 2.5 T4：最新视频模型与备选')
end=s.index('## 第三部分：判断模型适配方法论')
s=s[:start]+'''### 2.5 T4：Wan 与 HunyuanVideo

| 具体版本 | 已核验条件 | T4判定与验证路径 |
|---|---|---|
| Wan2.1-T2V-1.3B | 官方低显存参考8.19GB；480P文生视频；Diffusers实现 | 优先PoC：CPU卸载、普通SDPA，检查FP16 DiT数值，VAE保留FP32；不是已确认T4实测 |
| Wan2.2-TI2V-5B | 官方720P单卡卸载命令仍需至少24GB；提供FSDP/Ulysses多卡实现 | 单T4不满足该命令；8T4多卡或量化需要单独验证完整算子/分片/峰值 |
| HunyuanVideo-1.5 | 8.3B；官方卸载门槛14GB；原生generate.py仅BF16/FP32 | 暂不承诺T4；评估Diffusers普通注意力与分块卸载，重新核算精度、峰值、画质与速度 |

**Wan2.1。** 官方8.19GB与RTX4090生成速度不是T4结果。Diffusers示例默认BF16，T4缺原生BF16/FP8执行能力；候选FP16路径要检查溢出、NaN和黑帧，必要模块保留FP32。VAE使用FP32有官方文档依据，文本编码器可CPU执行或分阶段卸载。普通SDPA数学回退可以避免强制使用新GPU专用FlashAttention，但会改变显存和速度，必须重新测量。[Wan2.1官方仓库](https://github.com/Wan-Video/Wan2.1) · [Diffusers Wan文档](https://huggingface.co/docs/diffusers/main/en/api/pipelines/wan)

**Wan2.2。** 24GB指官方TI2V-5B的720P指定卸载命令，不是整个Wan系列的统一下限。官方有8卡FSDP/Ulysses，因此不能声称完全不支持多卡；但“支持多卡”不能直接推出“8张T4可运行”，需要核验精度、attention kernel、分片粒度和每卡峰值。[Wan2.2官方配方](https://github.com/Wan-Video/Wan2.2)

**HunyuanVideo-1.5。** 14GB是在卸载条件下的参考门槛，不能证明T4原版适配。当前原生脚本的dtype选择只接受bf16和fp32，传fp16会被拒绝；Diffusers示例默认BF16。FA、SSTA及FP8优化有各自芯片要求，不应直接启用。可以研究普通注意力与分块卸载路径，但FP32开销、转FP16的质量、完整组件兼容性都需实测。[官方仓库](https://github.com/Tencent-Hunyuan/HunyuanVideo-1.5) · [dtype处理源码](https://github.com/Tencent-Hunyuan/HunyuanVideo-1.5/blob/main/generate.py) · [Diffusers集成](https://huggingface.co/docs/diffusers/main/en/api/pipelines/hunyuan_video15)

T4视频PoC按单卡独立任务起步，完成正确视频后扩展副本。固定分辨率、帧数、步数、随机种子和是否启用超分，检查可播放文件、NaN/黑帧、每卡峰值、主机内存、秒/视频与画质。缩短视频属于功能冒烟，不等于目标时长的生产验收。其他视频模型的既有研究保留于上一修订版，本次重点采用用户指定的两个系列。

''' +s[end:]
s=s.replace('本修订版没有把未知项改写为支持，也没有以较旧视频模型代替用户要求的最新模型。','本增补版区分官方A2配方、资料候选和本机已验证；Wan与HunyuanVideo按具体版本判断，未伪造T4实测。')
(r/'output/gpu_rental/GPU_NPU租赁调研_计划大纲与实施说明_模型增补版.md').write_text(s)
