import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {Presentation,PresentationFile,FileBlob} from '@oai/artifact-tool';
const ROOT='/Users/lin/Desktop/catl',B=ROOT+'/.token_mini_build/model-v3';
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

{
const s=header('08','适配方法论：逐关核验，最后用实机结果判定','先固定模型版本、权重格式和服务目标：输入 / 输出长度、并发数，或图像 / 视频规格。');
const steps=[
['01','硬件支持这种精度吗？','查卡型、单卡显存和官方精度能力，再核对驱动 / CANN / CUDA 配套。\nT4 优先核验 FP16 / INT8 路径；4 位权重还需专用算子，不能只看“支持 INT8”。','产物：卡型＋精度候选'],
['02','推理引擎能运行这个模型吗？','查具体模型结构、量化格式、注意力 / MoE 算子和多卡模式的版本支持。\n例如：T4 的 Qwen3.5-9B 先查 llama.cpp 的 GGUF 路径；910B 查 Ascend 后端。','产物：可复现的软件组合'],
['03','每张卡的显存够吗？','逐卡峰值＝权重分片＋复制权重＋KV 缓存＋工作区 / 通信缓冲＋预留空间。\n例：9B × 2 字节 ≈18GB，仅 FP16 权重已超 T4 16GB，需量化或受支持的多卡方案。','产物：卡数与负载上限'],
['04','部署效果达到要求吗？','先加载并用固定样本检查输出质量，再增加上下文与并发，记录显存和响应时间。\n双机验证 HCCL / RoCE；YOLO 测检测精度与延迟，Wan 测视频质量与生成耗时。','产物：测试记录与验收结论']];
steps.forEach((v,i)=>{let y=201+i*100;txt(s,v[0],62,y,57,45,32,C.teal,true);txt(s,v[1],135,y,1060,31,24,C.navy,true);txt(s,v[2],135,y+35,1060,51,19,C.ink);txt(s,v[3],860,y+1,355,28,18,C.teal,false,'right');});
txt(s,'判定：四关通过才标“适配通过”；资料匹配标“候选”；缺少双机证据标“待验证”。',62,606,1156,35,23,C.teal,true);
s.speakerNotes.textFrame.setText('本页是项目适配方法。硬件支持、软件支持、容量和服务质量必须同时满足。权重量化位宽不等于所有计算都使用该精度，W4A8需要相应加载器、量化格式和kernel。不能看到T4支持INT8就认定任意4位或8位模型可用，也不能将BF16或FP8权重直接视为T4原生支持。冻结驱动/固件、CANN或CUDA、框架、引擎插件版本、镜像digest及模型revision。显存核算以实际文件和加载布局为准，MoE按全部权重而非激活参数，考虑复制与分片不均衡。短上下文低并发成功仅证明该规格，不能推断长上下文生产能力。910B每卡64GB仍是待核验假设。\n\n'+sourceText);
}
{
const s=header('09','现有设备的模型适配清单','910B：2 台 × 8 卡，暂按 64GB / 卡；T4：6 台 × 8 卡 × 16GB。以下均未完成实机验收。');
const v=[['设备 / 候选模型','精度与引擎路径','参考规模 / 当前判断'],
['910B  Qwen3.8-27B','BF16 / W8A8，vLLM Ascend [5]','单台 A2 参考，优先验证'],
['910B  MiniMax-M3','W8A8，vLLM Ascend [4]','单台 A2 参考，单机候选'],
['910B  GLM-5.3-Flash','W8A8，vLLM Ascend [2]','双台 A2 参考，双机候选'],
['910B  Kimi-K2.6','W4A8，vLLM Ascend [6]','双台 A2 参考，16 卡候选'],
['910B  DeepSeek-V4.1-Flash','W8A8，vLLM Ascend [1]','参考为四台 A2；双机显存 / 并行待验证'],
['910B  GLM-5.3','W8A8C8，vLLM Ascend，实验支持 [3]','参考为四台 A2；双机显存 / 并行待验证'],
['T4  Qwen3.5-0.8B / 2B / 4B','兼容的 FP16 / GGUF，llama.cpp [12]','单卡候选，逐型号验证算子与显存'],
['T4  Qwen3.5-9B','GGUF Q4_K_M，llama.cpp [8]','已有单 T4 目录参考，优先验证'],
['T4  YOLO26n','PyTorch 基线 / TensorRT [9]','已有 T4 基准，验证实际检测任务'],
['T4  Wan2.1-T2V-1.3B','独立视频管线，核验 FP16 后端 [10]','8.19GB 官方参考非 T4 实测，条件候选']];
let t=table(s,v,60,202,1160,[355,400,405],[34,34,34,34,34,34,34,34,34,34,34],18);
for(let r=1;r<v.length;r++){t.getCell(r,2).text.style={fontSize:18,typeface:F,color:[5,6,10].includes(r)?C.amber:C.teal};if(r>=7)t.getCell(r,0).fill='#E6F0F4';}
txt(s,'结论：先验证 Qwen3.8-27B、T4 的 Qwen3.5-9B 量化与 YOLO26n，再扩展候选。',62,585,1156,34,23,C.teal,true);
txt(s,'四机参考不等于双机不可部署。模型独立评估，不代表可同时驻留。Qwen 按总参数 <20B 筛选 T4 候选。',62,624,1156,25,17,C.muted);
s.speakerNotes.textFrame.setText('查询2026-09-16。表中为特定路径资料初筛，不是全部模型普查或实机通过清单。A2/64GB需确认实际910B硬件。GLM5.3-Flash指南第5.2节为2台各8×64GB TP8/DP2参考。Kimi双A2 W4A8使用16卡。DeepSeek与GLM5.3的四A2方案只能证明参考范围，尚未完成双机逐卡权重、缓存、工作区、复制开销与并行算子核验，不能认定双机不可部署或必需扩容。DeepSeek参考TP8/DP4/EP32；改16卡需重新验证。GLM5.3是实验支持。T4 Qwen9B路径来自HF Endpoints目录unsloth/Qwen3.5-9B-GGUF Q4_K_M，不能当作本项目实测。Qwen0.8/2/4B是待验证候选，模型格式、vision projector与kernel须匹配。Wan官方8.19GB为1.3B参考数据，不保证T4速度或显存峰值。T4不默认原生BF16/FP8支持。W8A8为8位权重和激活，W4A8为4位权重/8位激活，C8为8位KV缓存。每个模型分别测容量和质量，不能将全16卡同时分配给多模型。\n\n'+sourceText);
}
await fs.mkdir(B,{recursive:true});
await(await PresentationFile.exportPptx(p)).save(B+'/candidate.pptx');
for(let i=0;i<2;i++){const im=await p.export({slide:p.slides.items[i],format:'png',scale:1.5});await fs.writeFile(B+'/draft-'+(i+1)+'.png',new Uint8Array(await im.arrayBuffer()));}
