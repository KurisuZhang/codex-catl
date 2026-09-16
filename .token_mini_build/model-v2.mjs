import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {Presentation,PresentationFile,FileBlob} from '@oai/artifact-tool';
const ROOT='/Users/lin/Desktop/catl',B=ROOT+'/.token_mini_build/model-v2';
const SKILL='/Users/lin/.codex/plugins/cache/openai-primary-runtime/presentations/26.909.12148/skills/presentations';
const C={navy:'#12304A',ink:'#233D50',teal:'#008E9C',blue:'#377BB5',muted:'#667B89',line:'#D4E0E6',bg:'#F8FAFB',pale:'#E6F3F4',white:'#FFFFFF',amber:'#9B641C'};
const F='Arial Unicode MS';
const p=Presentation.create({slideSize:{width:1280,height:720}});
function box(s,x,y,w,h,fill=C.white,stroke=C.line){return s.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:h},fill,line:{fill:stroke,width:1}})}
function txt(s,v,x,y,w,h,size=22,color=C.ink,bold=false,align='left'){const a=s.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});a.text=v;a.text.style={typeface:F,fontSize:size,color,bold,alignment:align,verticalAlignment:'middle',wrap:'square',autoFit:'none',insets:{top:0,bottom:0,left:0,right:0}};return a;}
function node(s,v,x,y,w,h,fill=C.white,color=C.ink,size=20){box(s,x,y,w,h,fill);return txt(s,v,x+5,y+2,w-10,h-4,size,color,false,'center');}
function header(n,sub,lead){let s=p.slides.add();s.background.fill=C.bg;txt(s,'A4  模型适配',60,28,1160,61,46,C.navy,true);txt(s,sub,62,96,1156,46,30,C.teal,true);txt(s,lead,62,148,1156,43,20,C.muted);box(s,60,659,1160,1,C.line,C.line);txt(s,'token 魔方 Mini实验台',60,674,1000,22,15,C.muted);txt(s,n+' / 18',1105,674,115,22,15,C.muted,false,'right');return s;}
function table(s,vals,x,y,width,widths,heights,size=20){let t=s.tables.add({rows:vals.length,columns:vals[0].length,left:x,top:y,width,height:heights.reduce((a,b)=>a+b,0),columnWidths:widths,values:vals});t.borders.assign({style:'solid',fill:C.line,width:1});t.cells.block({row:0,column:0,rowCount:vals.length,columnCount:vals[0].length}).assign({textStyle:{fontSize:size,typeface:F,color:C.ink},margins:{left:10,right:8,top:0,bottom:0},anchor:'center'});for(let r=0;r<vals.length;r++){t.rows[r].height=heights[r];for(let c=0;c<vals[0].length;c++){let z=t.getCell(r,c);z.fill=r===0?C.navy:(r%2?C.white:'#EDF4F6');z.text.style={fontSize:size,typeface:F,color:r===0?C.white:C.ink,bold:r===0||c===0};}}return t;}

const refs=[
['DeepSeek-V4.1-Flash 部署指南','https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/DeepSeek-V4.1-Flash.html'],
['GLM-5.3-Flash 部署指南','https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/GLM5.3-Flash.html'],
['GLM-5.3 部署指南','https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/GLM5.3.html'],
['MiniMax-M3 部署指南','https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/MiniMax-M3.html'],
['Qwen3.8-27B 部署指南','https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/Qwen3.8-27B.html'],
['Kimi-K2.6 部署指南','https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/Kimi-K2.6.html'],
['Qwen3.5 官方模型卡','https://huggingface.co/Qwen/Qwen3.5-9B'],
['Hugging Face 单卡 T4 部署目录','https://endpoints.huggingface.co/catalog/collection/qwen?inferenceServer=llamacpp'],
['YOLO26 官方文档','https://docs.ultralytics.com/models/yolo26/'],
['Wan2.1 官方仓库','https://github.com/Wan-Video/Wan2.1'],
['vLLM GPU 支持要求','https://docs.vllm.ai/en/latest/getting_started/installation/gpu/'],
['Qwen3.5 官方小模型','https://huggingface.co/Qwen/Qwen3.5-4B']];
const sourceText=refs.map((r,i)=>`[${i+1}] ${r[0]}\n${r[1]}`).join('\n\n');
function method(s,items){items.forEach((v,i)=>{let x=62+i*294;txt(s,'0'+(i+1),x,202,42,36,25,C.teal,true);txt(s,v,x+47,202,236,36,19,C.ink);});}
{
let s=header('08','910B：6 个指定候选的部署判断','设备前提：2 台 × 8 卡。暂按 A2、64GB / 卡匹配参考方案，实际卡型与显存待核验。');
method(s,['查具体模型部署指南','对齐卡数与量化格式','核算逐卡显存峰值','实测质量、并发与通信']);
const v=[['候选模型','参考配置与精度','本项目判断 / 下一步'],
['Qwen3.8-27B','1 台 A2，BF16 或 W8A8 [5]','优先验证：先完成单机服务闭环'],
['MiniMax-M3','1 台 A2，W8A8 [4]','单机候选：采用对应量化权重与镜像'],
['GLM-5.3-Flash','2 台 A2，W8A8 [2]','双机候选：按指南 TP8 / DP2 验证'],
['Kimi-K2.6','2 台 A2，W4A8 [6]','双机候选：占用 16 卡，先验 RoCE 通信'],
['DeepSeek-V4.1-Flash','4 台 A2，W8A8 [1]','当前暂缓：参考方案较现有多 2 台'],
['GLM-5.3','4 台 A2，W8A8C8 [3]','当前暂缓：参考方案需扩容，且为实验支持']];
let t=table(s,v,60,249,1160,[290,340,530],[38,43,43,43,43,43,43],19);
for(let r=1;r<7;r++){t.getCell(r,2).text.style={fontSize:19,typeface:F,color:r<5?C.teal:C.amber,bold:true};}
txt(s,'结果：4 个模型有当前规模的参考路径，2 个暂不进入首轮部署。',62,555,1156,36,25,C.teal,true);
txt(s,'显存核算包含全部权重、KV 缓存、工作区与通信开销。MoE 按总参数量估算，不按激活参数量。',62,595,1156,26,18,C.ink);
txt(s,'[1–6] vLLM Ascend 模型指南，查询 2026-09-16。以上为资料筛选，均未实机验收，也不代表可同时驻留。',62,629,1156,23,16,C.muted);
s.speakerNotes.textFrame.setText('判断为本项目根据官方项目指南作出的条件分析。A2卡型与64GB必须由实物确认。W8A8为8位权重/8位激活，W4A8为4位权重/8位激活，C8指8位KV缓存。每个模型必须使用指南匹配的镜像、权重格式和并行配置。GLM5.3-Flash指南第3节描述含歧义，第5.2节明确2台A2各8×64GB，TP8且跨节点DP2，不能误读为每台16卡。MiniMax-M3约428B总参数，W8A8单A2是参考路径，BF16需至少双A2。Kimi-K2.6为1T总参数，32B激活参数不能当作显存计算基数。DeepSeek-V4.1-Flash为552B总参数，现有指南列4台A2或2台A3，A3不能等同本项目A2；本页暂缓意为缺少当前2台规模已验证路径，不宣称其他量化/卸载方案绝对不可能。其量化权重还需按指南核验获取与ModelSlim转换。GLM5.3指南标Experimental。所有模型先验权重可获取和软件版本配套，固定输入长度、输出长度和并发，再测逐卡峰值、固定题集回答质量及TTFT/TPOT。双机还需HCCL/RoCE验证。结论统计4个候选不意味着四个模型可同时部署。\n\n'+sourceText);
}
{
let s=header('09','T4：Qwen 小模型、目标检测与视频生成','设备前提：6 台 × 8 卡 × 16GB。先按单卡服务验证，再扩展副本，48 张卡不会自动合并显存。');
method(s,['总参数少于 20B','核验 T4 算子与精度','控制上下文 / 视频规格','分任务验收效果与速度']);
const v=[['候选模型','建议路径与部署条件','筛选结果 / 验收重点'],
['Qwen3.5-0.8B / 2B / 4B','单卡，兼容的 FP16 或 GGUF 量化\n先选支持该架构的 llama.cpp 版本','进入验证：3 个小模型候选\n固定题集、显存峰值、TTFT / TPOT'],
['Qwen3.5-9B','单卡 GGUF Q4_K_M＋llama.cpp [8]\nHF 目录已有 1×T4 配置参考','优先验证：FP16 权重约 18GB\n单卡 16GB 应选量化并验证回答质量'],
['YOLO26n','PyTorch 基线，再导出 TensorRT\n官方已有 T4 TensorRT 测试 [9]','优先验证：固定图像尺寸与批量\n测 mAP、召回率、延迟、图像 / 秒'],
['Wan2.1-T2V-1.3B','独立视频推理管线，先测 480P\n官方约 8.19GB 参考，非 T4 实测 [10]','条件验证：核验 FP16 与注意力后端\n固定帧数 / 步数，测质量与秒 / 视频']];
let t=table(s,v,60,249,1160,[300,440,420],[38,66,66,66,66],19);
for(let r=1;r<5;r++)t.getCell(r,2).text.style={fontSize:19,typeface:F,color:r===4?C.amber:C.teal};
txt(s,'结果：先验证 Qwen3.5-9B 量化与 YOLO26n，Wan 作为视频专项验证。',62,559,1156,37,24,C.teal,true);
txt(s,'范围：已核实 4 个 Qwen3.5 小模型。27B 及 MoE 总参数 ≥20B 的型号不纳入此轮 T4 清单。',62,599,1156,26,18,C.ink);
txt(s,'[7–12] 官方模型卡、部署目录与任务仓库。SM75 基础支持不等于所有 vLLM / SGLang 模型算子可用。',62,630,1156,23,16,C.muted);
s.speakerNotes.textFrame.setText('本页统计指定范围内已核实的候选，不声称穷尽所有可运行模型。Qwen3.5官方0.8B/2B/4B/9B均低于20B。未将Qwen3.8-27B或Qwen3.5-35B-A3B纳入，后者虽激活3B但总参数35B。HF Inference Endpoints目录列unsloth/Qwen3.5-9B-GGUF Q4_K_M、llama.cpp、1×NVIDIA T4，这是平台参考配置，不是本项目测试结果，也不等于Qwen官方量化权重。0.8/2/4B单卡为容量与架构支持推断，需实测对应GGUF转换/视觉投影和CUDA构建。9B×2字节约18GB为权重粗估，另外还有KV和工作区，不能据此承诺上下文或并发。T4按支持的FP16或量化路径部署，不默认支持原生BF16/FP8。Qwen3.5混合注意力算子需要核验，vLLM的T4基础门槛不能证明具体模型后端兼容。YOLO26n官方文档有T4 TensorRT基准，本项目仍需验证匹配版本、导出和质量，INT8需校准。Wan2.1-T2V-1.3B官方显存8.19GB仅作初筛，不是T4保障；需要核验模型dtype、注意力实现和必要的CPU卸载，固定分辨率/帧数/步数后评估可交付性，不把视频生成速度当作Token吞吐。模型部署和商业使用前记录对应许可证与权重来源。\n\n'+sourceText);
}
await fs.mkdir(B,{recursive:true});
await(await PresentationFile.exportPptx(p)).save(B+'/candidate.pptx');
for(let i=0;i<2;i++){const im=await p.export({slide:p.slides.items[i],format:'png',scale:1.5});await fs.writeFile(B+'/draft-'+(i+1)+'.png',new Uint8Array(await im.arrayBuffer()));}
await fs.writeFile(B+'/references.md','# 06 模型适配：分析依据\n\n查询日期：2026-09-16。结论是资料筛选，尚未实机测试。\n\n'+p.slides.items.map((s,i)=>'## 第'+(i+1)+'页\n\n'+s.speakerNotes.textFrame.text).join('\n\n')+'\n\n'+sourceText);
console.log('Authored 2 model slides');
