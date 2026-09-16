# 06 模型适配：分析逻辑与参考资料

查询日期：2026-09-16。所有结论为资料筛选，未实机验收。

## 第1页

判断为本项目根据官方项目指南作出的条件分析。A2卡型与64GB必须由实物确认。W8A8为8位权重/8位激活，W4A8为4位权重/8位激活，C8指8位KV缓存。每个模型必须使用指南匹配的镜像、权重格式和并行配置。GLM5.3-Flash指南第3节描述含歧义，第5.2节明确2台A2各8×64GB，TP8且跨节点DP2，不能误读为每台16卡。MiniMax-M3约428B总参数，W8A8单A2是参考路径，BF16需至少双A2。Kimi-K2.6为1T总参数，32B激活参数不能当作显存计算基数。DeepSeek-V4.1-Flash为552B总参数，现有指南列4台A2或2台A3，A3不能等同本项目A2；本页暂缓意为缺少当前2台规模已验证路径，不宣称其他量化/卸载方案绝对不可能。其量化权重还需按指南核验获取与ModelSlim转换。GLM5.3指南标Experimental。所有模型先验权重可获取和软件版本配套，固定输入长度、输出长度和并发，再测逐卡峰值、固定题集回答质量及TTFT/TPOT。双机还需HCCL/RoCE验证。结论统计4个候选不意味着四个模型可同时部署。

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

本页统计指定范围内已核实的候选，不声称穷尽所有可运行模型。Qwen3.5官方0.8B/2B/4B/9B均低于20B。未将Qwen3.8-27B或Qwen3.5-35B-A3B纳入，后者虽激活3B但总参数35B。HF Inference Endpoints目录列unsloth/Qwen3.5-9B-GGUF Q4_K_M、llama.cpp、1×NVIDIA T4，这是平台参考配置，不是本项目测试结果，也不等于Qwen官方量化权重。0.8/2/4B单卡为容量与架构支持推断，需实测对应GGUF转换/视觉投影和CUDA构建。9B×2字节约18GB为权重粗估，另外还有KV和工作区，不能据此承诺上下文或并发。T4按支持的FP16或量化路径部署，不默认支持原生BF16/FP8。Qwen3.5混合注意力算子需要核验，vLLM的T4基础门槛不能证明具体模型后端兼容。YOLO26n官方文档有T4 TensorRT基准，本项目仍需验证匹配版本、导出和质量，INT8需校准。Wan2.1-T2V-1.3B官方显存8.19GB仅作初筛，不是T4保障；需要核验模型dtype、注意力实现和必要的CPU卸载，固定分辨率/帧数/步数后评估可交付性，不把视频生成速度当作Token吞吐。模型部署和商业使用前记录对应许可证与权重来源。

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