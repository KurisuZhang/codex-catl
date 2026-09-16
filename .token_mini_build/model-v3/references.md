# 06 模型适配：分析逻辑与参考资料

查询日期：2026-09-16。所有结论为资料筛选，未实机验收。

## 第1页

本页是项目适配方法。硬件支持、软件支持、容量和服务质量必须同时满足。权重量化位宽不等于所有计算都使用该精度，W4A8需要相应加载器、量化格式和kernel。不能看到T4支持INT8就认定任意4位或8位模型可用，也不能将BF16或FP8权重直接视为T4原生支持。冻结驱动/固件、CANN或CUDA、框架、引擎插件版本、镜像digest及模型revision。显存核算以实际文件和加载布局为准，MoE按全部权重而非激活参数，考虑复制与分片不均衡。短上下文低并发成功仅证明该规格，不能推断长上下文生产能力。910B每卡64GB仍是待核验假设。

[1] DeepSeek-V4.1-Flash 部署指南
https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/DeepSeek-V4.1-Flash.html

[2] GLM-5.3-Flash 部署指南
https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/GLM5.3-Flash.html

[3] GLM-5.3 部署指南
https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/GLM5.3.html

[4] MiniMax-M3 部署指南
https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/MiniMax-M3.html

[5] Qwen3.8-27B 部署指南
https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/Qwen3.8-27B.html

[6] Kimi-K2.6 部署指南
https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/Kimi-K2.6.html

[7] Qwen3.5 官方模型卡
https://huggingface.co/Qwen/Qwen3.5-9B

[8] Hugging Face 单卡 T4 部署目录
https://endpoints.huggingface.co/catalog/collection/qwen?inferenceServer=llamacpp

[9] YOLO26 官方文档
https://docs.ultralytics.com/models/yolo26/

[10] Wan2.1 官方仓库
https://github.com/Wan-Video/Wan2.1

[11] vLLM GPU 支持要求
https://docs.vllm.ai/en/latest/getting_started/installation/gpu/

[12] Qwen3.5 官方小模型
https://huggingface.co/Qwen/Qwen3.5-4B

## 第2页

查询2026-09-16。表中为特定路径资料初筛，不是全部模型普查或实机通过清单。A2/64GB需确认实际910B硬件。GLM5.3-Flash指南第5.2节为2台各8×64GB TP8/DP2参考。Kimi双A2 W4A8使用16卡。DeepSeek与GLM5.3的四A2方案只能证明参考范围，尚未完成双机逐卡权重、缓存、工作区、复制开销与并行算子核验，不能认定双机不可部署或必需扩容。DeepSeek参考TP8/DP4/EP32；改16卡需重新验证。GLM5.3是实验支持。T4 Qwen9B路径来自HF Endpoints目录unsloth/Qwen3.5-9B-GGUF Q4_K_M，不能当作本项目实测。Qwen0.8/2/4B是待验证候选，模型格式、vision projector与kernel须匹配。Wan官方8.19GB为1.3B参考数据，不保证T4速度或显存峰值。T4不默认原生BF16/FP8支持。W8A8为8位权重和激活，W4A8为4位权重/8位激活，C8为8位KV缓存。每个模型分别测容量和质量，不能将全16卡同时分配给多模型。

[1] DeepSeek-V4.1-Flash 部署指南
https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/DeepSeek-V4.1-Flash.html

[2] GLM-5.3-Flash 部署指南
https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/GLM5.3-Flash.html

[3] GLM-5.3 部署指南
https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/GLM5.3.html

[4] MiniMax-M3 部署指南
https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/MiniMax-M3.html

[5] Qwen3.8-27B 部署指南
https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/Qwen3.8-27B.html

[6] Kimi-K2.6 部署指南
https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/Kimi-K2.6.html

[7] Qwen3.5 官方模型卡
https://huggingface.co/Qwen/Qwen3.5-9B

[8] Hugging Face 单卡 T4 部署目录
https://endpoints.huggingface.co/catalog/collection/qwen?inferenceServer=llamacpp

[9] YOLO26 官方文档
https://docs.ultralytics.com/models/yolo26/

[10] Wan2.1 官方仓库
https://github.com/Wan-Video/Wan2.1

[11] vLLM GPU 支持要求
https://docs.vllm.ai/en/latest/getting_started/installation/gpu/

[12] Qwen3.5 官方小模型
https://huggingface.co/Qwen/Qwen3.5-4B