import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {Presentation,PresentationFile} from '@oai/artifact-tool';

const ROOT='/Users/lin/Desktop/catl', B=ROOT+'/.gpu_deck_build', OUT=ROOT+'/output/gpu_rental';
const SKILL='/Users/lin/.codex/plugins/cache/openai-primary-runtime/presentations/26.909.12148/skills/presentations';
const PY='/Users/lin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3';
const C={navy:'#112A43',ink:'#18354C',blue:'#2778C4',teal:'#148A83',muted:'#61768A',line:'#DCE5ED',bg:'#F7F9FC',white:'#FFFFFF',amber:'#A16C16',red:'#AF4A45',pale:'#E8F2F5'};
const FONT='Arial Unicode MS';
const p=Presentation.create({slideSize:{width:1280,height:720}});
const refs={
 hw:'https://e.huawei.com/cn/products/computing/ascend/atlas-800i-a2',
 t4:'https://www.nvidia.com/en-us/data-center/tesla-t4/',
 quant:'https://docs.vllm.ai/en/latest/features/quantization/',
 q27:'https://huggingface.co/Qwen/Qwen3.8-27B',
 qflash:'https://huggingface.co/Qwen/Qwen3.8-Flash-Next',
 glm:'https://huggingface.co/zai-org/GLM-5.3-BF16',
 ds:'https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro',
 aq:'https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/Qwen3.8-27B.html',
 ag:'https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/GLM5.3.html',
 ad:'https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/DeepSeek-V4-Pro.html',
 hf:'https://huggingface.co/docs/huggingface_hub/guides/cli',
 base:'https://huggingface.co/Qwen/Qwen3-8B',
 baseconfig:'https://huggingface.co/Qwen/Qwen3-8B/raw/main/config.json',
 recipe:'https://recipes.vllm.ai/Qwen/Qwen3.8-27B',
 dsconfig:'https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/config.json'
};
function txt(s,v,x,y,w,h,size=26,color=C.ink,bold=false,align='left'){
 const a=s.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
 a.text=v;a.text.style={fontSize:size,typeface:FONT,color,bold,alignment:align,verticalAlignment:'middle',autoFit:'none',wrap:'square',insets:{top:0,bottom:0,left:0,right:0}};return a;
}
function box(s,x,y,w,h,fill=C.white,stroke=C.line){return s.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:h},fill,line:{fill:stroke,width:1}});}
function line(s,x,y,w,color=C.line){box(s,x,y,w,1,color,color);}
function node(s,v,x,y,w,h,fill=C.white,color=C.ink){const a=box(s,x,y,w,h,fill);a.text=v;a.text.style={fontSize:24,typeface:FONT,color,alignment:'center',verticalAlignment:'middle',insets:{top:10,bottom:10,left:12,right:12},autoFit:'none'};return a;}
function conn(s,a,b,side='right',to='left'){return s.shapes.connect(a,b,{kind:'elbow',fromSide:side,toSide:to,line:{fill:C.muted,width:2},tail:{type:'triangle',width:'sm',length:'sm'}});}
function header(n,title,section,sub=''){
 const s=p.slides.add();s.background.fill=C.bg;
 txt(s,section,60,25,900,25,17,C.teal,true);
 txt(s,title,60,70,1160,66,44,C.navy,true);
 if(sub)txt(s,sub,60,142,1160,44,24,C.muted);
 line(s,60,658,1160);txt(s,'GPU / NPU 租赁调研   ·   2026.09.14',60,674,1000,20,14,C.muted);
 txt(s,String(n).padStart(2,'0')+' / 14',1110,674,110,20,15,C.muted,false,'right');return s;
}
function cite(s,label){txt(s,label,60,630,1155,21,14,C.muted);}
function notes(s,text,keys=[]){s.speakerNotes.textFrame.setText(text+'\n\n参考来源（核验日期：2026-09-14）\n'+keys.map(k=>k+': '+refs[k]).join('\n'));}
function table(s,values,x,y,w,h,widths,size=24){
 const t=s.tables.add({rows:values.length,columns:values[0].length,left:x,top:y,width:w,height:h,columnWidths:widths,values});
 t.borders.assign({style:'solid',fill:C.line,width:1});
 t.cells.block({row:0,column:0,rowCount:values.length,columnCount:values[0].length}).assign({textStyle:{fontSize:size,typeface:FONT,color:C.ink},margins:{left:16,right:13,top:4,bottom:4},anchor:'center'});
 for(let r=0;r<values.length;r++)for(let c=0;c<values[0].length;c++){
  const cell=t.getCell(r,c);cell.fill=r===0?C.navy:(r%2?C.white:'#EDF3F7');
  cell.text.style={fontSize:size,typeface:FONT,color:r===0?C.white:C.ink,bold:r===0||c===0};
 }
 const hh=Math.min(48,h/values.length);t.rows[0].height=hh;
 for(let r=1;r<values.length;r++)t.rows[r].height=(h-hh)/(values.length-1);
 return t;
}
async function img(s,file,x,y,w,h,crop){s.images.add({blob:await fs.readFile(B+'/assets/'+file),contentType:file.endsWith('.jpg')?'image/jpeg':'image/png',position:{left:x,top:y,width:w,height:h},fit:'contain',...(crop?{crop}:{}),alt:file});}
function colorCell(t,r,c,col){t.getCell(r,c).text.style={fontSize:23,typeface:FONT,color:col,bold:true};}

Object.assign(refs,{
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
 hyd:'https://huggingface.co/docs/diffusers/main/en/api/pipelines/hunyuan_video15',
 flag:'https://huggingface.co/FlagRelease/Qwen3.8-Flash-Next-BF16-ascend-FlagOS',
 qcode:'https://raw.githubusercontent.com/huggingface/transformers/main/src/transformers/models/qwen3_5/modeling_qwen3_5.py',
 yolo:'https://docs.ultralytics.com/models/yolo26/',
 trt:'https://docs.ultralytics.com/integrations/tensorrt/',
 ltx:'https://huggingface.co/Lightricks/LTX-2.5',
 ltxcode:'https://github.com/Lightricks/LTX-2',
 magi:'https://huggingface.co/sand-ai/MAGI-2-preview',
 cog:'https://huggingface.co/zai-org/CogVideoX-2b'
});
{
 const s=p.slides.add();s.background.fill=C.navy;
 txt(s,'GPU / NPU 租赁调研',64,53,1100,44,28,'#7CCFC8');
 txt(s,'硬件配置与\n模型部署可行性',60,123,1150,165,62,C.white,true);
 txt(s,'2 台 × 8 卡 910B    /    4–6 台 × 8 卡 T4',64,316,1120,47,28,'#CCDCE8');
 await img(s,'t4_banner.jpg',0,397,1280,150);
 const labels=['01  硬件配置清单','02  模型适配结论','03  判断模型适配方法论'];
 labels.forEach((v,i)=>txt(s,v,64+i*403,586,393,46,25,C.white,true));
 txt(s,'模型增补版  ·  2026.09.14  ·  结论按具体权重、软件栈与硬件条件限定',64,660,1150,25,17,'#A9BDCE');
 notes(s,'全篇仅三大部分：第2–4页硬件配置清单；第5–8页模型适配结论；第9–14页判断模型适配方法论。910B按64GB/卡假设，必须向供应商确认。本报告为公开资料与源码核验，没有租赁设备实测。封面图片为NVIDIA T4官方参考图。',['t4']);
}
{
 const s=header(2,'1.1  硬件范围与资源池','第一部分  /  硬件配置清单','交付范围覆盖服务器、互联、存储、供电散热及管理接入');
 const a=node(s,'统一接入与任务队列\n文本 / 检测 / 视频',60,225,330,90,C.navy,C.white);
 const b=node(s,'910B 池：2 台 × 8 卡\n64GB/卡待确认',480,218,335,110,C.pale);
 const c=node(s,'T4 池：4–6 台 × 8 卡\n16GB/卡',480,441,335,110,'#EBF2FA');
 conn(s,a,b);conn(s,a,c);
 const d=node(s,'同构跨机互联\nHCCL / RDMA',906,218,309,110);
 const e=node(s,'独立任务 / 多副本\n优先单机分配',906,441,309,110);
 conn(s,b,d);conn(s,c,e);
 txt(s,'模型仓库 / 输出存储\n管理网络 / BMC\n机柜 / PDU / 散热',64,384,322,157,27,C.muted);
 txt(s,'标称容量：910B 池 1,024GB；T4 每台 128GB。跨卡、跨机容量需要软件显式分片。',62,577,1155,48,25,C.ink,true);
 cite(s,'架构为本项目方案；硬件参考：Huawei Atlas 800I A2、NVIDIA T4。异构资源池分别运行模型实例');
 notes(s,'每台8卡。总服务器6–8台，NPU16张，GPU32–48张。910B按64GB/卡，单机512GB、双机1024GB；T4单机128GB、全池512–768GB。不能把全部T4的容量视为单模型统一显存。逻辑接入可复用已有主机，不要求新增GPU；检测和视频生成的输出不是LLM正文Token，应分别验收。',['hw','t4']);
}
{
 const s=header(3,'1.2  单台服务器硬件清单','第一部分  /  硬件配置清单','以下是完整租赁 BOM 的询价起点；主机配置为建议值，按最终模型修订');
 table(s,[['硬件项目','910B：每台，合计 2 台','T4：每台，合计 4–6 台'],['加速卡与承载','8 × 64GB；配套板卡互联','8 × 16GB；足量 PCIe 插槽 / 转接板'],['CPU / ECC 内存','厂家配套 CPU；1–2TB RAM','32–64 物理核；256–512GB RAM'],['系统盘','2 × 960GB SSD，RAID1','2 × 960GB SSD，RAID1'],['模型与缓存盘','本地 NVMe 可用容量 8TB 起','本地 NVMe 可用容量 4TB 起'],['网卡 / 管理口','配套 NPU RDMA；业务口；BMC','双口 25GbE；独立 BMC 管理口'],['机箱 / 电源 / 散热','完整机箱、导轨、冗余 PSU、风扇','支持 8 张被动散热卡的整机风道']],60,207,1160,400,[221,466,473],23);
 cite(s,'容量均需以可用容量交付；系统盘 RAID1 不等于两块容量相加。参考：Huawei / NVIDIA；RAM、磁盘为项目建议');
 notes(s,'清单要同时覆盖CPU、主板、ECC DIMM、全部加速卡、板卡内互联/PCIe riser、系统盘及RAID、模型盘、网卡、BMC、机箱、导轨、电源、风扇和电源线。双机910B总RAM2–4TB、本地NVMe可用16TB起；4–6台T4总RAM1–3TB、本地NVMe可用16–24TB起。磁盘按原始权重+转换权重+下载缓存+输出+日志累加；不是显存不足的自动补救。CPU体系结构必须匹配容器。T4为被动散热卡，不能只把卡插入缺少整机风道的主机。8卡PCIe通道与NUMA分布须交付拓扑，不承诺每卡独享CPU直连x16。',['hw','t4']);
}
{
 const s=header(4,'1.3  集群配套与最终交付环境','第一部分  /  硬件配置清单','租赁合同应包含可运行的软件环境与对应硬件，不只交付可登录的裸机');
 table(s,[['配套硬件','数量 / 接口 / 交付要求'],['910B 互联网络','按整机 RDMA 端口配齐交换机、AOC 或光模块与光纤\n若每台 8 × 200GE：共 16 条接入链路，交换容量同步核验'],['业务与管理网络','T4 双口 25G 共 8–12 个接入口；BMC 共 6–8 个接入口\n补齐上联、网线、IP、路由；已有设备可复用'],['共享存储与机房','模型镜像与输出存储、备份目标；容量按留存量计算\n机柜空间、导轨、双路供电 / PDU、散热与远程控制']],60,204,1160,231,[248,912],23);
 txt(s,'910B 交付栈',62,465,550,38,28,C.teal,true);
 txt(s,'Linux + 驱动 / 固件 + CANN\n模型专用容器、HCCL / RDMA、设备权限',62,511,559,73,24);
 txt(s,'T4 交付栈',681,465,538,38,28,C.blue,true);
 txt(s,'Linux + NVIDIA 驱动 + CUDA 容器\nTransformers / TensorRT / Diffusers 按任务固定',681,511,538,73,24);
 cite(s,'每套环境记录镜像 digest、框架 commit、依赖锁文件和启动脚本；不同模型可使用不同容器');
 notes(s,'不要求所有硬件都新购：交换机、镜像仓库、监控与存储可复用但必须写清资源配额。200GE是配套A2参考拓扑，最终以租赁整机实际NPU端口为准，不能只配一条高速业务网线代替NPU互联。若16条光链路，两端共32只匹配模块与16条光纤；AOC为另一方案，不重复计模块。最终交付包括设备健康、8卡可见、ECC/错误检查、拓扑、通信测试、模型文件权限、监控日志、服务启动与重启恢复。电源按厂家整机最大功耗及机房冗余规划，不把PSU铭牌相加当实际功耗。模型镜像不能混用：GLM/DeepSeek配方vLLM-Ascend v0.23.0；Qwen Flash-Next FlagOS使用另一套定制SGLang环境。',['hw','ag','ad','flag']);
}
{
 const s=header(5,'2.1  910B 模型适配结论','第二部分  /  模型适配结论','范围：2 台 × 8 卡 × 64GB；“配方支持”仍须在交付机器复验');
 const t=table(s,[['模型 / 权重路径','本配置结论','关键依据'],['GLM-5.3 · W8A8C8 / W4','双机仍未确认','W8A8C8 参考 4 A2；双机 W4 完整链路未证实'],['GLM-5.3-Flash · W8A8','有双机 A2 配方','2 × 8 卡；DP2 / TP8 + EP，专用镜像与算子'],['DeepSeek-V4-Flash · W8A8','有单机 A2 配方','每台可独立部署；MTP / DSpark 要匹配版本'],['MiniMax-M3 · W8A8','有单机 A2 配方','至少 8 × 64GB；专用 MSA 与量化后端'],['DeepSeek-V4-Pro · W4A8','不满足当前配方','官方仍要求至少 4 A2，保留原结论'],['Qwen3.8-Flash-Next','拓扑仍待核验','有昇腾适配；缺双机 910B 同拓扑证明']],60,205,1160,400,[432,251,477],23);
 for(let r=1;r<=6;r++)colorCell(t,r,1,[2,3,4].includes(r)?C.teal:(r===5?C.red:C.amber));
 cite(s,'依据：vLLM-Ascend 各模型专用教程与 FlagRelease；GLM-5.3 与 GLM-5.3-Flash 是不同架构 / 权重');
 notes(s,'此次补充GLM5.3低精度、GLM5.3Flash、DeepSeekV4Flash和MiniMaxM3，保留V4Pro与QwenFlashNext原候选。三个绿色项表示官方框架提供匹配A2硬件的部署路径，不表示本项目实测。GLM5.3Flash的Prerequisites括号64GB×16容易误读，5.2明确2台每台8卡，启动脚本也映射0..7并全局DP2本机TP8且启用EP，应按16卡总数理解。DeepSeekV4Flash和MiniMaxM3单机W8A8配方可用于每台一个模型服务，但不能由此认为所有模型可以同时驻留。T4的Qwen27与YOLO结论见第7页，视频见第8页。',['ag','gf','df','mm','ad','flag']);
}

{
 const s=header(6,'2.2  910B 低精度部署条件','第二部分  /  模型适配结论','量化权重、推理框架、专用算子和设备拓扑必须采用同一套配方');
 table(s,[['模型','量化 / 框架与 kernel','双机使用方式与限制'],['GLM-5.3','W8A8C8；vLLM-Ascend 专用实现\n不能把原始 FP8 当作 INT8 产物','约 753GB 只是 W8 权重粗估\n参考 4 A2；W4 不能只算容量'],['GLM-5.3-Flash','W8A8；glm-5.3-flash 镜像\n混合注意力 / mHC / MoE 专用算子','2 节点 DP2 / TP8 + EP\n须配 HCCL；MTP 草稿使用 eager'],['DeepSeek-V4-Flash','W8A8-mtp；v0.23.0 配方\nDSA / 混合 KV / MoE 昇腾算子','单台 8 卡可用，两台可分服务\n0731 DSpark 用专用镜像 ≥0.25.0'],['MiniMax-M3','W8A8；文档基于 v0.27.1\nMSA / MoE / Ascend 量化实现','单台至少 8 × 64GB\n不能改用 950DT 的 MXFP8 配方']],60,206,1160,354,[245,465,450],23);
 txt(s,'建议验证次序：DeepSeek-V4-Flash / MiniMax-M3 单机 → GLM-5.3-Flash 双机',62,577,1154,46,25,C.teal,true);
 cite(s,'来源：vLLM-Ascend 专用教程。不同模型分别固定镜像 digest；主机驱动 / CANN 兼容性逐一核对');
 notes(s,'GLM5.3低精度仍然纳入调研，W4理想权重约376.5GB只属于容量下界，不证明有Ascend W4权重及kernel；当前找到的是W8A8C8参考4A2。GLM5.3Flash公开约320B总参数/18B激活，低精度来源Eco-Tech/GLM-5.3-Flash-w8a8，A2镜像quay.io/ascend/vllm-ascend:glm-5.3-flash。A2配方每机8设备、DP2/TP8、EP，不能当两份完全独立模型解释，MTP使用eager草稿。DeepSeekV4Flash的W8A8-mtp官方链接Eco-Tech量化仓库，A2传统MTP镜像v0.23.0；0731 DSpark用DeepSeekV4-flash-0731专用A2镜像、至少v0.25.0，教程同时出现nightly字样，优先固定专用镜像digest，禁止混搭权重和旧镜像。MiniMaxM3官方模型卡约428B/23B激活；vLLM-Ascend专用教程v0.27.1明确单A2 W8A8可部署，但示例A3拓扑不可原样照抄，应核实A2的TP/EP与权重配置。W8约428GB只是粗估，文本编码/视觉/缓存与峰值另计。部署适配文档不是每种上下文、并发、模态均保证。',['ag','gf','gfm','df','mm','mmm']);
}

{
 const s=header(7,'2.3  T4：27B 文本推理与 YOLO','第二部分  /  模型适配结论','同一台 8 卡服务器按任务切分；模型层分配与多副本是不同方式');
 txt(s,'Qwen3.8-27B：单机 8 卡 PoC',62,207,562,43,29,C.blue,true);
 txt(s,'FP16 权重约 56GB，先用短输入、并发 1\nTransformers + Accelerate 分配模型层\nattention 用 eager，GDN 用 PyTorch 回退',62,273,562,133,25);
 txt(s,'仍需通过',62,433,559,36,26,C.amber,true);
 txt(s,'FP16 无溢出；全部算子支持 SM75\n逐卡峰值、生成质量及实际速度\n“device_map”分层不是高效张量并行',62,480,559,110,24);
 txt(s,'YOLO26：官方 T4 路径可采用',682,207,536,43,29,C.teal,true);
 const a=node(s,'视频帧 / 图片\n解码与预处理',688,271,234,87,C.pale);
 const b=node(s,'T4 / TensorRT 10\nYOLO26s FP16',974,271,239,87,C.pale);conn(s,a,b);
 txt(s,'在目标 T4 导出 engine，640 输入起测\n按单卡实例扩展，检测不需要 8 卡 TP\nINT8 另需代表性校准集和质量回归',686,409,529,124,25);
 txt(s,'官方同硬件测试 ≠ 本机交付已验收',686,562,529,37,23,C.muted);
 cite(s,'来源：Qwen 官方模型卡、Transformers qwen3_5 源码；Ultralytics YOLO26 与 TensorRT 集成文档');
 notes(s,'T4为SM75，缺原生BF16/FP8执行能力；不能照搬新GPU专用FlashAttention/FP8路径。Transformers源码有torch_chunk_gated_delta_rule与torch_recurrent_gated_delta_rule回退，包括关键A_log等float32计算；这提供候选实现，不代替完整T4数值测试。先锁定包含该实现的commit，用FP16、eager attention、不启用可选融合kernel、batch1输入512–1024和输出128测试。检查hf_device_map与每卡峰值，不允许无记录的CPU/disk卸载。YOLO26官方模型页提供T4 TensorRT10检测性能；本报告不把其速度当实际业务速度。最新Ultralytics导出接口可使用quantize=16，目标机导出并锁定依赖版本。INT8另做校准及mAP/召回率回归。',['q27','qcode','yolo','trt','t4']);
}
{
 const s=header(8,'2.4  T4 视频生成：Wan 与 HunyuanVideo','第二部分  /  模型适配结论','明确到版本和任务；低显存宣传值不能直接作为 T4 的部署证明');
 table(s,[['候选模型','容量与精度 / kernel 条件','T4 结论'],['Wan2.1-T2V-1.3B\n480P 文生视频','官方低显存参考 8.19GB；不是 T4 实测\nDiffusers 路径，CPU 卸载 / SDPA 回退\nVAE 保留 FP32；DiT 的 FP16 数值需测','优先做 T4 视频 PoC\n先短视频、单卡独立任务\n不承诺官方 4090 的速度'],['Wan2.2-TI2V-5B\n720P 文 / 图生视频','官方单卡卸载配方仍需至少 24GB\n多卡 FSDP / Ulysses 有实现\n但未证明 8 × T4 的完整执行链','单 T4 不满足该配方\n多卡 / 量化列为专项验证\n不能把 128GB 加总当证明'],['HunyuanVideo-1.5\n8.3B 文 / 图生视频','官方卸载门槛 14GB；不是 T4 保证\n原生脚本仅 BF16 / FP32，无 FP16 选项\nFA / SSTA / FP8 路径需另核 SM75','列入候选，暂不承诺\n评估 Diffusers 普通注意力\n精度、峰值与画质均需实测']],60,208,1160,365,[291,518,351],23);
 txt(s,'4–6 台 T4 优先扩展独立视频任务；单个视频使用多卡，需专门验证并行收益。',62,584,1154,41,25,C.blue,true);
 cite(s,'来源：Wan2.1 / Wan2.2、HunyuanVideo-1.5 官方仓库及 Diffusers 文档；均未在本项目 T4 实测');
 notes(s,'按用户要求视频重点转为Wan与HunyuanVideo。Wan2.1-1.3B官方8.19GB和4090速度不可套T4，Diffusers示例默认为BF16，T4无原生BF16/FP8，需评估FP16或必要模块FP32，并检查NaN/黑帧；VAE官方建议FP32。T5等文本编码器可CPU运行或分阶段卸载。普通SDPA数学回退可以避免强制Ampere专用FlashAttention，但可能提高显存和时延，不能沿用原优化配置的内存数字。Wan2.2-5B官方24GB指720P指定卸载命令，存在FSDP+Ulysses多卡实现，不能说完全不支持多卡，但没有T4完整实证。HunyuanVideo1.5的generate.py只接受bf16/fp32，直接加fp16会报错；官方Diffusers默认BF16，低内存14GB不是T4数值/算子证据。可研究Diffusers、普通注意力、分块卸载并关闭专用稀疏/FP8优化，FP32方案还需重算峰值。旧版LTX/MAGI/CogVideo研究留在配套历史说明，本页不以旧模型替代指定候选。',['wan','wan2','wand','hy','hycode','hyd']);
}

{
 const s=header(9,'3.1  适配判断的完整逻辑','第三部分  /  判断模型适配方法论','结论必须绑定：权重版本 × 软件栈 × 硬件拓扑 × 工作负载 × 质量要求');
 const aa=node(s,'模型文件完整\n架构可识别',60,218,270,97);
 const bb=node(s,'精度与全部算子\n支持目标芯片',370,218,270,97);
 const cc=node(s,'逐卡峰值满足\n分片与通信可行',680,218,270,97);
 const dd=node(s,'主机资源\n与输入输出完整',990,218,230,97);
 conn(s,aa,bb);conn(s,bb,cc);conn(s,cc,dd);
 txt(s,'以上条件全部通过（AND）',61,345,1150,45,30,C.teal,true,'center');
 const e=node(s,'静态合格\n允许进入实机验证',90,432,312,104,C.pale);
 const f=node(s,'真实权重生成\n质量与负载测试通过',485,432,312,104,C.pale);
 const g=node(s,'限定配置下\n已验证可部署',881,432,312,104,C.teal,C.white);
 conn(s,e,f);conn(s,f,g);
 txt(s,'任一条件失败：当前方案不通过。缺少证据：标为待验证。修改精度或硬件后重新检查。',62,575,1155,47,24,C.amber,true);
 cite(s,'逻辑为本项目验收方法；“能下载”“能加载”“能生成”“满足生产负载”分别留证据');
 notes(s,'条件集合：A权重与配置完整可获取，B架构与所有必需模块被框架正确识别，C每个算子的dtype/量化格式与芯片及运行库兼容且有实现或已验证回退，D每rank运行峰值小于实际可用显存，E并行切分及通信可行，F主机RAM/磁盘/IO足够且预处理后处理完整。静态资格=A∧B∧C∧D∧E∧F。部署验收=静态资格∧真实权重正确输出∧质量回归∧目标负载稳定运行。任何unknown不能按true处理。通过资料条件只能进入PoC，不能直接声称本机已验证。改量化、kernel、上下文、batch、节点数任一项，都需要重新检查受影响条件并重新验收。',['quant','qcode','ag','ad']);
}
{
 const s=header(10,'3.2  条件、证据与失败处理','第三部分  /  判断模型适配方法论','每一项都必须回答“用什么证明通过”，不以模型名称相近代替兼容性');
 const gateTable=table(s,[['条件','通过证据','不通过时的动作'],['权重与架构','repo / SHA 完整；架构有实现','补齐文件；选择支持该架构的版本'],['精度与 kernel','逐模块 dtype / quant 格式匹配\n目标 SM / NPU 实现或回退可运行','换后端或转换权重；重新验证数值'],['逐卡内存','权重 + 缓存 + 工作区峰值\n每个 rank 均低于可用显存','缩减负载 / 改量化 / 增卡后重算'],['并行与通信','TP / EP / 分层合法；映射明确\n设备拓扑、跨机通信测试通过','改分片；补齐互联；拒绝套用 A3 配方'],['主机与输出链','CPU / RAM / 磁盘满足加载与卸载\ntokenizer / VAE / 解码等组件齐全','补资源或组件；生成完整目标输出'],['质量与服务','样本回归与目标负载测试达标','定位并重测；未达标不作为生产交付']],60,205,1160,392,[202,505,453],23);
 [48,44,64,64,64,64,44].forEach((h,i)=>gateTable.rows[i].height=h);
 cite(s,'证据固定到实际版本：模型 revision、容器 digest、框架 commit、驱动与 CANN / CUDA 版本');
 notes(s,'kernel清单至少覆盖attention、GDN/循环状态、MoE路由及GEMM、量化解码、归一化、通信、MTP/视觉/VAE等实际启用模块。量化名相同不代表pack格式、group size、scale dtype、对称性、激活精度或KV精度相同。先核对checkpoint quantization_config和框架后端，再查每种算子的设备实现。合法TP不仅看卡数，要检查头数、专家数、维度整除、复制模块及框架约束。支持多GPU不等于支持任意跨节点拓扑。CPU卸载须计主机内存和PCIe传输，并在目标延迟下测试。',['quant','qcode','flag','ltxcode']);
}
{
 const s=header(11,'3.3  显存与精度的计算边界','第三部分  /  判断模型适配方法论','模型适配使用逐卡运行峰值；总显存和平均分配只能做第一轮筛选');
 txt(s,'每个 rank 的峰值 = 权重 + KV / 状态 + 激活 / 工作区 + 通信 / 图缓存 + 余量',62,210,1154,73,28,C.navy,true);
 table(s,[['计算环节','具体做法'],['权重','读取实际张量 dtype 与量化配置；按实际分片归属求和\n加入未量化模块、scale / zero-point、复制的 embedding'],['缓存与运行开销','按上下文、并发、图像尺寸或视频帧数估算，再实测峰值\nGDN / MLA 等按实现计算，不直接套通用 KV 公式'],['精度匹配','“INT4 权重 + FP16 激活”与“FP4 + FP8”是不同路径\n硬件、框架、打包格式、kernel 必须同时匹配']],60,317,1160,231,[257,903],23);
 txt(s,'示例：DeepSeek-V4-Pro 理想全 4bit ≈ 800GB ＜ 双机 1,024GB\n但官方 W4A8 仍要求至少 4 A2，因此不能由这个不等式推出双机可部署。',62,565,1151,60,25,C.amber,true);
 cite(s,'参数量 × bit / 8 仅为权重粗估，采用十进制 GB。来源：DeepSeek 官方模型卡及 Ascend 专用部署教程');
 notes(s,'对每rank分别累计W_r+K_r+A_r+C_r+headroom，并与设备实测可用容量比较；特别关注rank0复制组件或视觉编码器集中导致的不均衡。常规GQA KV字节=2×层数×KV头数×head_dim×缓存字节×总缓存token，实际按分片和复制规则修正；该公式不直接适用于GDN、MLA、CSA。MoE激活49B是计算口径，不是只需驻留49B。压低上下文减少KV，但不解决权重布局或缺少kernel。FP16缩小指数范围可能溢出，BF16训练模型转FP16必须质量回归。',['ds','ad','quant']);
}
{
 const s=header(12,'3.4  Hugging Face 到完整输出','第三部分  /  判断模型适配方法论','每一步产生可保存的交付物；成功加载后仍需验证真实输出');
 await img(s,'hf_qwen.png',60,207,559,314);
 txt(s,'官方模型页：模型身份与文件入口',62,532,557,37,22,C.muted);
 const rows=[['01','锁定与下载','保存 repo / SHA；完整 snapshot 与索引'],['02','静态审核','精度、kernel、内存、拓扑条件逐项过关'],['03','固定环境并启动','镜像 digest、依赖锁、设备映射与命令'],['04','真实样本生成','文本 / 检测框 / 可播放视频；检查有限值'],['05','回归与负载验收','质量基线、逐卡峰值、延迟及稳定性']];
 rows.forEach((a,i)=>{let y=202+i*81;txt(s,a[0],662,y,54,34,28,C.teal,true);txt(s,a[1],727,y,485,33,26,C.ink,true);txt(s,a[2],727,y+36,488,38,22,C.muted);});
 cite(s,'截图：Qwen3.8-27B 官方 Hugging Face 仓库。下载与执行示例、证据模板见配套大纲');
 notes(s,'先解析模型main当前commit SHA，再snapshot_download指定revision SHA，归档config、索引、tokenizer、generation config、chat template及全部必要组件。记录下载文件清单/大小和校验信息，避免只下一个分片。若量化转换，记录源SHA、校准集、转换工具版本和产物配置。硬件冒烟测试与目标模型验证分开：设备正常并不证明目标架构正常。LLM输入512–1024、输出128、batch1起测，后按业务负载提升；YOLO从640 batch1；视频按官方支持的分辨率/帧数与低内存选项起测。首个Token不是最终交付，生成完整可解释结果并测质量后才进入持续负载。',['hf','q27','yolo','cog']);
}
{
 const s=header(13,'3.5  三个实例的推导结果','第三部分  /  判断模型适配方法论','同一套逻辑可以得到通过、待验证或不通过，而非统一给出“能跑”');
 table(s,[['判断条件','YOLO26s / T4','Qwen3.8-27B / 8 T4','V4-Pro W4A8 / 2 A2'],['权重 / 框架','官方权重与 TensorRT 路径','官方权重与 Transformers 实现','有 Ascend 专用量化路径'],['精度 / kernel','官方 T4 TensorRT10 测试','FP16 / eager / GDN 回退\n完整数值与 SM75 待测','W4A8 不等于原生 FP4\n按官方 Ascend 算子配套'],['容量 / 拓扑','单卡官方路径有依据\n目标输入 / batch 复验','约 56GB 权重有容量空间\n逐卡分层与峰值待实测','未满足参考至少 4 A2\n理想 800GB 不是运行峰值'],['推导结论','官方同硬件可部署路径\n交付机器仍需验收','允许 PoC\n不能标“已确认可部署”','当前配方不通过\n增至参考硬件或另找证明']],60,208,1160,368,[209,305,327,319],23);
 txt(s,'完整证明 = 固定配置的证据清单 + 可复现启动 + 正确输出 + 目标负载达标。',62,590,1154,37,26,C.teal,true);
 cite(s,'来源：Ultralytics YOLO26；Transformers qwen3_5；vLLM-Ascend DeepSeek-V4-Pro。未进行本项目实机测试');
 notes(s,'用例不是新增模型推荐，而是展示同一判定链的不同结果。YOLO同硬件官方证据覆盖基本执行，生产服务质量和本机配置仍需验收。Qwen27的总容量算术和代码回退只是部分证据，缺失项必须保留待验证状态。DeepSeek双机未达到已公布配方的硬件要求，拒绝用纯权重下界宣称可用；如供应商提供更小配置实现，需要重新核对实际权重、精度、算子、上下文、并发和质量。',['yolo','q27','qcode','ad']);
}
{
 const s=header(14,'3.6  最终验收与资料依据','第三部分  /  判断模型适配方法论','交付结论应写成“某版本模型，在某配置和负载下通过”，保留复现实验');
 table(s,[['任务','必须交付的结果','性能 / 质量指标'],['文本生成','真实请求与完整回答；输入 / 输出 Token 计数','TTFT、TPOT、吞吐、错误率、质量回归'],['目标检测','检测框 / 类别 / 置信度；固定评估集结果','端到端延迟、FPS、mAP / 召回率'],['视频生成','可播放文件；帧数 / 尺寸 / FPS 与随机种子','秒 / 视频、峰值显存、黑帧与画质检查']],60,207,1160,203,[193,498,469],23);
 txt(s,'共同证据包',63,432,1147,38,28,C.navy,true);
 txt(s,'硬件与拓扑清单 · 权重 SHA · 环境版本 · 启动脚本 · 原始日志 · 每卡峰值\n固定负载测试与重启恢复；持续测试建议至少 1 小时，阈值由业务确认',63,482,1150,76,25);
 const links=[['昇腾低精度配方',refs.gf],['MiniMax-M3',refs.mm],['YOLO / T4',refs.yolo],['Wan / 视频',refs.wan],['模型下载',refs.hf]];
 links.forEach((a,i)=>{const t=txt(s,a[0],63+i*235,584,225,32,22,C.blue);t.text.get(a[0]).link={uri:a[1],isExternal:true};});
 cite(s,'公开资料核验日期：2026-09-14。所有来源按页置于演讲者备注；本报告不包含租赁机实际 benchmark');
 notes(s,'最终证据包同时记录硬件设备ID/显存、CPU RAM磁盘、PCIe/NUMA/RDMA拓扑、驱动固件与运行库、镜像digest、框架commit、模型SHA、量化来源、启动参数、代表性输入输出、质量评估、每rank峰值与持续负载。建议至少1小时持续测试不等于覆盖长期可靠性。业务必须给出质量、延迟和并发阈值，未给定前仅报告实测不判定生产达标。完整参考见配套大纲，网页latest与main实施时重新核验锁定。',[...Object.keys(refs).filter(k=>!['dsconfig','aq','base','baseconfig','recipe'].includes(k))]);
}
await fs.mkdir(B+'/expanded-render',{recursive:true});
await (await PresentationFile.exportPptx(p)).save(B+'/expanded-candidate.pptx');
for(let i=0;i<p.slides.items.length;i++){
 const im=await p.export({slide:p.slides.items[i],format:'png',scale:1.5});
 await fs.writeFile(B+'/expanded-render/'+String(i+1).padStart(2,'0')+'.png',new Uint8Array(await im.arrayBuffer()));
 console.log('Rendered '+(i+1));
}
await fs.writeFile(B+'/expanded-notes.json',JSON.stringify(refs,null,2));
