from pathlib import Path
root=Path('/Users/lin/Desktop/catl')
b=root/'.gpu_deck_build'
s=(b/'revise.mjs').read_text()
s=s.replace("Object.assign(refs,{", """Object.assign(refs,{
 gf:'https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/GLM5.3-Flash.html',
 gfm:'https://huggingface.co/zai-org/GLM-5.3-Flash',
 df:'https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/DeepSeek-V4-Flash.html',
 mm:'https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/MiniMax-M3.html',
 mmm:'https://huggingface.co/MiniMaxAI/MiniMax-M3',
 wan:'https://github.com/Wan-Video/Wan2.1',
 wan2:'https://github.com/Wan-Video/Wan2.2',
 wand:'https://huggingface.co/docs/diffusers/main/en/api/pipelines/wan',
 hy:'https://github.com/Tencent-Hunyuan/HunyuanVideo-1.5',
 hycode:'https://github.com/Tencent-Hunyuan/HunyuanVideo-1.5/blob/main/generate.py',
 hyd:'https://huggingface.co/docs/diffusers/main/en/api/pipelines/hunyuan_video15',""")
def replace_slide(n,code):
 global s
 start=s.index('{\n const s=header('+str(n)+',')
 end=s.index('\n{\n const s=header('+str(n+1)+',',start)
 s=s[:start]+code.strip()+ '\n'+s[end:]
replace_slide(5,r"""
{
 const s=header(5,'2.1  910B 模型适配结论','第二部分  /  模型适配结论','范围：2 台 × 8 卡 × 64GB；“配方支持”仍须在交付机器复验');
 const t=table(s,[['模型 / 权重路径','本配置结论','关键依据'],['GLM-5.3 · W8A8C8 / W4','双机仍未确认','W8A8C8 参考 4 A2；双机 W4 完整链路未证实'],['GLM-5.3-Flash · W8A8','有双机 A2 配方','2 × 8 卡；DP2 / TP8 + EP，专用镜像与算子'],['DeepSeek-V4-Flash · W8A8','有单机 A2 配方','每台可独立部署；MTP / DSpark 要匹配版本'],['MiniMax-M3 · W8A8','有单机 A2 配方','至少 8 × 64GB；专用 MSA 与量化后端'],['DeepSeek-V4-Pro · W4A8','不满足当前配方','官方仍要求至少 4 A2，保留原结论'],['Qwen3.8-Flash-Next','拓扑仍待核验','有昇腾适配；缺双机 910B 同拓扑证明']],60,205,1160,400,[432,251,477],23);
 for(let r=1;r<=6;r++)colorCell(t,r,1,[2,3,4].includes(r)?C.teal:(r===5?C.red:C.amber));
 cite(s,'依据：vLLM-Ascend 各模型专用教程与 FlagRelease；GLM-5.3 与 GLM-5.3-Flash 是不同架构 / 权重');
 notes(s,'此次补充GLM5.3低精度、GLM5.3Flash、DeepSeekV4Flash和MiniMaxM3，保留V4Pro与QwenFlashNext原候选。三个绿色项表示官方框架提供匹配A2硬件的部署路径，不表示本项目实测。GLM5.3Flash的Prerequisites括号64GB×16容易误读，5.2明确2台每台8卡，启动脚本也映射0..7并全局DP2本机TP8且启用EP，应按16卡总数理解。DeepSeekV4Flash和MiniMaxM3单机W8A8配方可用于每台一个模型服务，但不能由此认为所有模型可以同时驻留。T4的Qwen27与YOLO结论见第7页，视频见第8页。',['ag','gf','df','mm','ad','flag']);
}
""")
replace_slide(6,r"""
{
 const s=header(6,'2.2  910B 低精度部署条件','第二部分  /  模型适配结论','量化权重、推理框架、专用算子和设备拓扑必须采用同一套配方');
 table(s,[['模型','量化 / 框架与 kernel','双机使用方式与限制'],['GLM-5.3','W8A8C8；vLLM-Ascend 专用实现\n不能把原始 FP8 当作 INT8 产物','约 753GB 只是 W8 权重粗估\n参考 4 A2；W4 不能只算容量'],['GLM-5.3-Flash','W8A8；glm-5.3-flash 镜像\n混合注意力 / mHC / MoE 专用算子','2 节点 DP2 / TP8 + EP\n须配 HCCL；MTP 草稿使用 eager'],['DeepSeek-V4-Flash','W8A8-mtp；v0.23.0 配方\nDSA / 混合 KV / MoE 昇腾算子','单台 8 卡可用，两台可分服务\n0731 DSpark 用专用镜像 ≥0.25.0'],['MiniMax-M3','W8A8；文档基于 v0.27.1\nMSA / MoE / Ascend 量化实现','单台至少 8 × 64GB\n不能改用 950DT 的 MXFP8 配方']],60,206,1160,354,[245,465,450],23);
 txt(s,'建议验证次序：DeepSeek-V4-Flash / MiniMax-M3 单机 → GLM-5.3-Flash 双机',62,577,1154,46,25,C.teal,true);
 cite(s,'来源：vLLM-Ascend 专用教程。不同模型分别固定镜像 digest；主机驱动 / CANN 兼容性逐一核对');
 notes(s,'GLM5.3低精度仍然纳入调研，W4理想权重约376.5GB只属于容量下界，不证明有Ascend W4权重及kernel；当前找到的是W8A8C8参考4A2。GLM5.3Flash公开约320B总参数/18B激活，低精度来源Eco-Tech/GLM-5.3-Flash-w8a8，A2镜像quay.io/ascend/vllm-ascend:glm-5.3-flash。A2配方每机8设备、DP2/TP8、EP，不能当两份完全独立模型解释，MTP使用eager草稿。DeepSeekV4Flash的W8A8-mtp官方链接vllm-ascend量化仓库，A2传统MTP镜像v0.23.0；0731 DSpark用DeepSeekV4-flash-0731专用A2镜像、至少v0.25.0，教程同时出现nightly字样，优先固定专用镜像digest，禁止混搭权重和旧镜像。MiniMaxM3官方模型卡约428B/23B激活；vLLM-Ascend专用教程v0.27.1明确单A2 W8A8可部署，但示例A3拓扑不可原样照抄，应核实A2的TP/EP与权重配置。W8约428GB只是粗估，文本编码/视觉/缓存与峰值另计。部署适配文档不是每种上下文、并发、模态均保证。',['ag','gf','gfm','df','mm','mmm']);
}
""")
replace_slide(8,r"""
{
 const s=header(8,'2.4  T4 视频生成：Wan 与 HunyuanVideo','第二部分  /  模型适配结论','明确到版本和任务；低显存宣传值不能直接作为 T4 的部署证明');
 table(s,[['候选模型','容量与精度 / kernel 条件','T4 结论'],['Wan2.1-T2V-1.3B\n480P 文生视频','官方低显存参考 8.19GB；不是 T4 实测\nDiffusers 路径，CPU 卸载 / SDPA 回退\nVAE 保留 FP32；DiT 的 FP16 数值需测','优先做 T4 视频 PoC\n先短视频、单卡独立任务\n不承诺官方 4090 的速度'],['Wan2.2-TI2V-5B\n720P 文 / 图生视频','官方单卡卸载配方仍需至少 24GB\n多卡 FSDP / Ulysses 有实现\n但未证明 8 × T4 的完整执行链','单 T4 不满足该配方\n多卡 / 量化列为专项验证\n不能把 128GB 加总当证明'],['HunyuanVideo-1.5\n8.3B 文 / 图生视频','官方卸载门槛 14GB；不是 T4 保证\n原生脚本仅 BF16 / FP32，无 FP16 选项\nFA / SSTA / FP8 路径需另核 SM75','列入候选，暂不承诺\n评估 Diffusers 普通注意力\n精度、峰值与画质均需实测']],60,208,1160,365,[291,518,351],23);
 txt(s,'4–6 台 T4 优先扩展独立视频任务；单个视频使用多卡，需专门验证并行收益。',62,584,1154,41,25,C.blue,true);
 cite(s,'来源：Wan2.1 / Wan2.2、HunyuanVideo-1.5 官方仓库及 Diffusers 文档；均未在本项目 T4 实测');
 notes(s,'按用户要求视频重点转为Wan与HunyuanVideo。Wan2.1-1.3B官方8.19GB和4090速度不可套T4，Diffusers示例默认为BF16，T4无原生BF16/FP8，需评估FP16或必要模块FP32，并检查NaN/黑帧；VAE官方建议FP32。T5等文本编码器可CPU运行或分阶段卸载。普通SDPA数学回退可以避免强制Ampere专用FlashAttention，但可能提高显存和时延，不能沿用原优化配置的内存数字。Wan2.2-5B官方24GB指720P指定卸载命令，存在FSDP+Ulysses多卡实现，不能说完全不支持多卡，但没有T4完整实证。HunyuanVideo1.5的generate.py只接受bf16/fp32，直接加fp16会报错；官方Diffusers默认BF16，低内存14GB不是T4数值/算子证据。可研究Diffusers、普通注意力、分块卸载并关闭专用稀疏/FP8优化，FP32方案还需重算峰值。旧版LTX/MAGI/CogVideo研究留在配套历史说明，本页不以旧模型替代指定候选。',['wan','wan2','wand','hy','hycode','hyd']);
}
""")
s=s.replace("['昇腾配方',refs.ad]","['昇腾低精度配方',refs.gf]").replace("['Flash-Next 适配',refs.flag]","['MiniMax-M3',refs.mm]").replace("['视频模型',refs.ltx]","['Wan / 视频',refs.wan]")
s=s.replace("调研修订版  ·", "模型增补版  ·")
s=s.replace("revision-render","expanded-render").replace("revision-candidate","expanded-candidate").replace("revision-notes.json","expanded-notes.json")
(b/'expanded.mjs').write_text(s)
f=(b/'revision-finalize.mjs').read_text().replace('GPU_NPU租赁与模型适配方案.pptx','GPU_NPU租赁与模型适配方案_模型增补版.pptx').replace('revision-candidate','expanded-candidate').replace('revision-validation-final','expanded-validation').replace('revision-final-render','expanded-final-render')
(b/'expanded-finalize.mjs').write_text(f)
f=(b/'revision-pdf.py').read_text().replace('revision-final-render','expanded-final-render').replace('GPU_NPU租赁与模型适配方案_预览.pdf','GPU_NPU租赁与模型适配方案_模型增补版_预览.pdf')
(b/'expanded-pdf.py').write_text(f)
