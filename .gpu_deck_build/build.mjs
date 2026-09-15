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
 ds:'https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash',
 aq:'https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/Qwen3.8-27B.html',
 ag:'https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/GLM5.3.html',
 ad:'https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/DeepSeek-V4.1-Flash.html',
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

// 01. Cover
{
 const s=p.slides.add();s.background.fill=C.navy;
 txt(s,'算力租赁调研',65,56,1080,40,25,'#7CCFC8');
 txt(s,'GPU / NPU 服务器\n与大模型推理',60,132,1140,170,62,C.white,true);
 txt(s,'硬件配置、模型适配与 Token 产出验证',65,327,1120,56,29,'#CCDCE8');
 await img(s,'t4_banner.jpg',0,429,1280,150);
 txt(s,'2 台昇腾 910B  +  4–6 台 NVIDIA T4',65,609,1110,34,26,C.white);
 txt(s,'租赁方案与验证计划    2026.09.14',65,660,1100,23,17,'#A9BDCE');
 notes(s,'汇报范围：文本推理与 Token 输出。每台服务器8卡，910B按64GB/卡方案测算，T4按16GB/卡。14页包含封面及2页附录。全部吞吐结论留待租赁交付机器实测。封面产品参考图来自NVIDIA，卡片外观不代表服务器整机。\n图片：https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/tesla-t4/t4-inference-page-t4-banner-2560-u.jpg',['t4']);
}
// 02. Fleet and native chart
{
 const s=header(2,'拟租算力与用途','01  硬件方案','先建立可重复的 Token 生成基线，再决定扩容数量');
 txt(s,'昇腾 910B',65,214,510,40,30,C.teal,true);
 txt(s,'2 台  /  16 张 NPU',65,267,540,55,39,C.navy,true);
 txt(s,'单机 8 × 64GB = 512GB\n两台标称总容量 1,024GB',65,337,555,76,26);
 line(s,65,438,530);
 txt(s,'优先验证 Qwen3.8-27B\n大模型跨机方案另做验证',65,466,545,76,26);
 txt(s,'单台服务器加速卡总显存（GB）',680,212,540,37,25,C.ink,true);
 const ch=s.charts.add('bar',{position:{left:650,top:268,width:565,height:238},categories:['910B 8卡','T4 8卡'],series:[{name:'标称显存 GB',values:[512,128],fill:C.teal,points:[{idx:0,fill:C.teal},{idx:1,fill:C.blue}]}],hasLegend:false,barOptions:{direction:'bar',grouping:'clustered',gapWidth:110},xAxis:{textStyle:{fontSize:21,typeface:FONT,fill:C.ink}},yAxis:{min:0,max:600,majorUnit:200,textStyle:{fontSize:17,typeface:FONT,fill:C.muted},majorGridlines:{fill:C.line,width:1}},dataLabels:{showValue:true,position:'outEnd',textStyle:{fontSize:25,typeface:FONT,fill:C.ink}},chartFill:'none',plotAreaFill:'none'});
 txt(s,'T4：4–6 台，32–48 张 GPU\n全池 512–768GB，适合小模型多副本',675,535,550,72,25);
 cite(s,'容量为标称加总，不是单模型可直接使用的统一显存。来源：NVIDIA T4；910B 按本方案 64GB/卡假设');
 notes(s,'计算：2×8×64=1024GB，4至6×8×16=512至768GB。单节点显存512GB与128GB。图为容量对比，不代表算力或吞吐倍数。异构卡不能直接组成一个通用张量并行实例。GB按厂商标称口径列示，实际可用容量以设备工具为准。采购前必须确认910B具体板卡和显存，不可只写910B型号。',['hw','t4']);
}
// 03. BOM
{
 const s=header(3,'完整推理服务器的配置清单','01  硬件方案','加速卡之外，主机内存、磁盘和互联同样影响模型加载与运行');
 await img(s,'atlas800i.png',68,210,346,226,{left:0.16,top:0.28,right:0.12,bottom:0.04});
 txt(s,'Atlas 800I A2 产品参考图',62,454,355,35,21,C.ink,true);
 txt(s,'实际租赁机型待供应商确认\n表内主机配置为询价起点',62,503,350,66,23,C.muted);
 table(s,[['配置项','910B 服务器','T4 服务器'],['加速卡','8 × 64GB','8 × 16GB'],['CPU / 主机内存','厂家配套 CPU\n建议 1–2TB RAM','32–64 物理核\n建议 256–512GB'],['本地 NVMe','建议 4–8TB','建议 2–4TB'],['节点间网络','跨机优先 200GbE\nRDMA，核对完整链路','副本用 10/25GbE\n跨机需单独测通信'],['交付环境','驱动 / CANN / 容器\n设备权限与健康检查','驱动 / CUDA / 容器\nPCIe / NUMA 拓扑']],440,204,780,388,[145,317,318],23);
 cite(s,'图片与整机规格参考：华为 Atlas 800I A2。CPU、RAM、NVMe 和管理网络为本方案建议，不是通用最低要求');
 notes(s,'服务器必须包含可用系统盘、模型盘、网络端口、所需交换机与光模块、机房供电散热、远程管理及运维支持。NVMe容量按原始权重、转换权重、下载缓存和日志共同规划。Atlas800I A2官方配置有4颗Kunpeng920、32个DDR4槽、8个200GE RoCE端口；实际租赁机箱可能不同，应以BOM和现场工具为准。200GbE不能只确认一个管理口，需核验每个NPU对外链路、交换机无阻塞情况和RDMA配置。冗余电源额定总功率不能当整机运行功耗。\n图片：https://e-file.huawei.com/marketingcloud/pep/asset/2000000101/images/products/computing/ascend/atlas-800i-a2/banner-bequoted.png',['hw','t4']);
}
// 04. native topology
{
 const s=header(4,'两类硬件分池服务','01  硬件方案','请求路由统一接入，模型实例在同类硬件内运行');
 const api=node(s,'业务请求\nOpenAI 兼容 API',62,315,224,110,C.navy,C.white);
 const rt=node(s,'模型路由\n与请求队列',350,315,200,110);
 const a=node(s,'910B 节点 A\n8 张 NPU',682,228,231,100,C.pale);
 const b=node(s,'910B 节点 B\n8 张 NPU',976,228,231,100,C.pale);
 const t=node(s,'T4 节点 1…4–6\n每台 8 张 GPU',682,457,525,105,'#EBF2FA');
 conn(s,api,rt);conn(s,rt,a);conn(s,rt,t);conn(s,a,b);
 txt(s,'NPU 池：单机验证，跨机时启用 HCCL / RDMA',680,177,542,40,22,C.teal,true);
 txt(s,'跨机是否划算，取决于通信占比与内存分布',680,350,540,46,23,C.muted);
 txt(s,'GPU 池：优先单机 TP 或多个独立副本',680,408,535,35,22,C.blue,true);
 txt(s,'TP 将一个模型分到多卡。独立副本增加总吞吐，未必降低单请求延迟。',63,585,1150,42,25,C.ink);
 cite(s,'架构为本项目建议。T4 常见卡间通路为 PCIe，不能按 NVLink 互联假设规划');
 notes(s,'图中连接均为逻辑部署关系。910B节点之间的线表示可选同构分布式通信，初始27B验证可以每节点独立运行。不要把NVIDIA和Ascend设备混合到同一张量并行组。标准Dense模型的DP通常是独立模型副本，带专家并行的MoE参考部署中DP/EP的含义需要结合引擎实际映射解释，不能简单把4个DP组视为4个完整独立副本。两类资源池统一鉴权、监控和请求入口。',['hw','t4','ag','ad']);
}
// 05. model facts
{
 const s=header(5,'目标模型与权重规模','02  模型适配','容量按全部驻留权重估算，MoE 激活参数量主要反映每步计算量');
 table(s,[['模型','参数口径','16 位权重粗估','关键适配点'],['Qwen3.8-27B','语言 27B\n完整仓库约 28B','约 56GB','Gated DeltaNet\n全注意力 / 视觉 / MTP'],['Qwen3.8-Flash-Next','主干 125B + n-gram 51B\n+ MTP 4B，另含视觉','约 360GB 起','MoE / QSA / GDN\n额外 embedding 驻留'],['GLM-5.3','完整仓库约 753B','约 1,506GB','量化格式与稀疏算子\n跨节点专家通信'],['DeepSeek-V4.1-Flash','主干 552B\n另加 Engram 等模块','主干约 1,104GB\n全量更高','CED / CSA2 / Engram\n原始权重 FP8 / FP4']],60,205,1160,361,[291,326,216,327],23);
 txt(s,'本轮优先文本生成。视觉、超长上下文和推测解码分别验收。',62,589,1150,38,26,C.teal,true);
 cite(s,'来源：各模型 Hugging Face 官方模型卡与配置。权重粗估使用参数量 × 2 bytes，不包含缓存和运行开销');
 notes(s,'估算采用十进制GB，实际safetensors索引、dtype、未量化模块和运行时装载清单优先于模型名称。DeepSeek-V4.1-Flash原始checkpoint不是BF16，表中16位列仅用于统一容量比较。Qwen3.8-Flash-Next的主干125B与6B激活口径不能代替整体权重容量。Qwen3.8是系列名称，云端Flash/Max服务名也不能直接等同于这里的公开checkpoint。Qwen3-8B另作为设备与引擎冒烟测试，不作为目标版本替代。',['q27','qflash','glm','ds','dsconfig']);
}
// 06. memory & precision
{
 const s=header(6,'显存预算与精度约束','02  模型适配','权重装得下只是第一道条件，运行峰值必须逐卡满足');
 txt(s,'单卡峰值显存',65,209,1140,37,29,C.navy,true);
 const pieces=[['本卡权重',326,C.blue],['KV / 循环状态',328,C.teal],['激活与工作区',252,'#63889C'],['安全余量',220,'#A7BAC7']];
 let x=65;for(const [v,w,col] of pieces){node(s,v,x,264,w,67,col,C.white);x+=w+9;}
 txt(s,'权重近似 = 参数量 × 每参数字节数 ÷ 分片数\n再加入未分片模块、量化元数据和负载相关缓存',65,354,1140,68,26);
 table(s,[['硬件','优先精度路径','关键限制'],['T4 / SM75','FP16；经验证的 AWQ / GPTQ\n等 W4A16 权重与 kernel','无原生 BF16 / FP8\nMarlin 支持 Turing，但不含 MXFP4'],['910B / Ascend','BF16 / FP16；ModelSlim\nW8A8 + Ascend 量化后端','CANN、驱动、vLLM-Ascend 配套\nCUDA 专用 kernel 不能直接复用']],60,429,1160,188,[225,475,460],23);
 cite(s,'示意块宽度不代表占比。来源：vLLM 量化兼容矩阵；Ascend 模型教程。KV 量化与权重量化需分别确认');
 notes(s,'运行峰值应在每个rank上分别计算，包括权重、KV cache或循环状态、激活/临时workspace、通信buffer、图捕获和碎片余量，不能只看整池总显存。基础Dense GQA的KV bytes=2×层数×KV头数×head_dim×缓存字节×token总数。以Qwen3-8B配置36层、8KV头、128维、FP16为例，每token144KiB；单序列4096token为576MiB，16条为9GiB，未计分片或复制。GDN、MLA、CSA和CED需按各模型实际缓存实现计算，不能套同一公式。T4上BF16权重转FP16仍需数值回归；硬件INT4支持不等于所有4bit模型格式可直接运行。当前vLLM矩阵明确Turing支持AWQ/GPTQ/Marlin，但Marlin MXFP4除外。',['quant','baseconfig','aq','dsconfig']);
}
// 07. Ascend matrix
{
 const s=header(7,'910B：27B 优先，超大模型另设方案','02  模型适配','范围：2 台 × 8 卡 × 64GB。以下为调研判断，尚未在租赁机器实测');
 const t=table(s,[['模型','本轮结论','建议配置 / 主要证据'],['Qwen3-8B 基线','优先验证','单张 64GB，BF16，4K 上下文起测'],['Qwen3.8-27B','优先验证','单机 BF16 或 W8A8；官方 A2 量化示例 TP2'],['Qwen3.8-Flash-Next','容量可候选\n算子待验证','单机 BF16 约 360GB 起；新增架构与驻留策略待适配'],['GLM-5.3','两台不作承诺','BF16 容量不足；W8A8C8 参考为 4 台 A2'],['DeepSeek-V4.1-Flash','两台不作承诺','W8A8 + INT8 Engram 参考为 4 台 A2\n量化权重发布状态仍需确认']],60,207,1160,379,[300,230,630],23);
 colorCell(t,1,1,C.teal);colorCell(t,2,1,C.teal);for(const r of [3,4,5])colorCell(t,r,1,C.amber);
 txt(s,'4 台 A2 / 2 台 A3 是文档参考配置，不能解释为理论最小卡数。',62,592,1150,35,25,C.ink,true);
 cite(s,'来源：vLLM-Ascend Qwen3.8-27B、GLM-5.3、DeepSeek-V4.1-Flash 教程；GLM-5.3 当前标为 Experimental');
 notes(s,'910B的2台总标称1024GB不足以装载GLM5.3的1506GB BF16权重，也不足以装载DeepSeek4.1Flash至少1104GB BF16主干。INT8理论容量可能在2节点内，但不足以据此承诺指定上下文和并发可用。GLM文档4A2按脚本DP4×TP8计32张64GB设备。DeepSeek4.1Flash文档同为4A2，每台8×64GB，或者2A3，每台8×128GB物理卡、16个逻辑设备。A3逻辑设备数量不能与A2物理卡数直接对比。当前DeepSeek量化checkpoint在教程中仍写will be published，下载或转换产物是额外先决条件。Qwen27文档基于vLLM-Ascend0.23.0，A2镜像v0.23.0，TP2 W8A8为参考，最初试验主动缩小至4096上下文和并发1。',['aq','ag','ad','qflash','base']);
}
// 08. T4 matrix
{
 const s=header(8,'T4：小模型多副本更适合作为首批用途','02  模型适配','单台 128GB 标称显存，扩到 4–6 台主要用于增加独立服务实例');
 const t=table(s,[['模型','本轮结论','可尝试范围 / 主要限制'],['Qwen3-8B 基线','优先验证','2 卡 FP16，短上下文；跑通后评估单机多副本'],['Qwen3.8-27B','容量候选','8 卡 FP16 或 2–4 卡 W4A16 仅为容量方案\n须验证 GDN、SM75、attention / 量化 kernel'],['Qwen3.8-Flash-Next','暂缓首批','原精度单机不足；低比特权重与 n-gram 策略待验证'],['GLM-5.3','不建议首批','需低比特与跨机并行，量化支持和通信成本未闭环'],['DeepSeek-V4.1-Flash','不建议首批','原始 FP8 / FP4 路径不适配 T4 原生能力\n需要权重转换及新架构算子验证']],60,207,1160,379,[300,230,630],23);
 colorCell(t,1,1,C.teal);colorCell(t,2,1,C.amber);for(const r of [3,4,5])colorCell(t,r,1,C.red);
 txt(s,'T4 的数量不能替代对新模型 kernel 的验证。',62,592,1150,35,27,C.blue,true);
 cite(s,'来源：NVIDIA T4、vLLM 量化矩阵及官方模型卡。容量候选不代表已可运行，跨机总显存也不能保证可用');
 notes(s,'Qwen3-8B完整16位权重接近或超过单T4显存，应以2卡FP16开始。Qwen27完整约56GB权重，4张T4虽有64GB标称容量但余量偏紧，8卡容量更宽裕，仍必须检查混合架构TP合法性、引擎版本及SM75执行支持。W4A16不是任意模型都能直接用，需匹配量化checkpoint和后端。不能把官方在Blackwell验证的Qwen27配方自动当T4兼容证据。多节点T4可能用更低比特或offload装入部分大模型，但目标是稳定Token产出，不作为首批承诺。FlashAttention2等后端需查具体版本支持，不能强制假定T4可用。',['t4','quant','recipe','qflash','glm','dsconfig']);
}
// 09. decision flow
{
 const s=header(9,'硬件能否运行模型的判断流程','03  验证方法','每个判断都形成证据，最后用实际生成与负载测试验收');
 const tops=[['01  模型身份','repo / revision\n完整权重与许可证'],['02  内存预算','逐卡权重与缓存\n上下文 / 并发'],['03  执行支持','架构 / dtype\nattention / MoE kernel']];
 const bottoms=[['06  稳定产出','TTFT / TPOT / 吞吐\n错误率与持续运行'],['05  正确生成','模板 / tokenizer\n有限值与回答质量'],['04  并行拓扑','TP / EP 合法划分\nPCIe / HCCL / RDMA']];
 const ns=[];tops.forEach((a,i)=>{const x=60+i*410;ns.push(node(s,a[0]+'\n\n'+a[1],x,211,340,139,C.white));});
 const ms=[];bottoms.forEach((a,i)=>{const x=60+i*410;ms.push(node(s,a[0]+'\n\n'+a[1],x,430,340,139,i===0?C.pale:C.white));});
 conn(s,ns[0],ns[1]);conn(s,ns[1],ns[2]);conn(s,ns[2],ms[2],'bottom','top');
 conn(s,ms[2],ms[1],'left','right');conn(s,ms[1],ms[0],'left','right');
 txt(s,'未通过容量：缩短上下文、量化或增卡      未通过算子：匹配后端、转换权重或更换硬件',62,368,1150,49,23,C.amber);
 cite(s,'顺序按编号执行。方法为本项目验收设计；模型兼容证据见各框架官方支持矩阵与模型配方');
 notes(s,'流程顺序01至06。检查点1记录确切repo、commit SHA、许可证、任务类型、权重文件大小与dtype。检查点2算每个rank峰值，不能只看总池。检查点3须有该版本架构以及attention/GDN/MoE/量化kernel的实现，并支持目标芯片。检查点4验证分片整除约束和通信。检查点5不能把服务端口打开或随机权重kernel测试当作成功，应检查真实权重生成、token计数、非NaN/Inf、固定提示词质量及量化前后回归。检查点6在明确工作负载与SLO下实测，结果连同镜像digest和启动参数归档。',['quant','aq','ag','ad']);
}
// 10. download workflow
{
 const s=header(10,'Hugging Face 下载到首个 Token','03  验证方法','先用 Qwen3-8B 检查环境，再切换目标模型的专用配方');
 await img(s,'hf_qwen.png',60,209,616,346);
 txt(s,'Qwen3.8-27B 官方仓库页面',60,565,613,33,22,C.muted);
 const rows=[['1','锁定版本','保存 repo、commit SHA 与模型配置'],['2','下载完整仓库','权重分片、索引、tokenizer、模板'],['3','选择软件栈','T4 用 CUDA；910B 用 CANN / Ascend'],['4','启动并生成','4K 上下文、并发 1；验证 API 输出']];
 rows.forEach((a,i)=>{const y=203+i*100;txt(s,a[0],721,y,50,43,34,C.teal,true);txt(s,a[1],782,y,426,35,27,C.navy,true);txt(s,a[2],782,y+41,426,45,22,C.muted);if(i<3)line(s,780,y+88,431);});
 cite(s,'截图：Hugging Face / Qwen3.8-27B。下载方法：huggingface_hub CLI。完整示例与检查项见配套大纲');
 notes(s,'截图为模型仓库页面，不是本项目已运行证明。完整snapshot下载避免缺tokenizer或索引，不只下载某个权重分片。先读取config.architectures、torch_dtype/quantization_config、model.safetensors.index.json，之后选择后端镜像和量化产物。统一记录宿主驱动与运行库版本，NPU不要直接使用CUDA镜像。最新main与模型专用tag未必兼容，需记录image digest与框架commit。先跑短文本且关闭额外推测解码，目标模型的必需专用参数仍按配方保留。',['q27','hf','aq','recipe','base']);
}
// 11. acceptance & troubleshooting
{
 const s=header(11,'运行验收与 Token 产出测量','03  验证方法','本方案不预填 tokens/s；性能结论以租赁交付环境的实测为准');
 txt(s,'测试负载',62,202,1100,35,28,C.navy,true);
 const a=node(s,'短文本基线\n上下文 4K / 并发 1',62,252,332,78,C.pale);
 const b=node(s,'负载阶梯\n输入 2K / 8K / 32K',474,252,332,78);
 const c=node(s,'并发与稳定性\n并发 1 / 4 / 16 + 持续测试',884,252,334,78);
 conn(s,a,b);conn(s,b,c);
 txt(s,'固定提示集与生成上限，按实际输出 Token 计数，记录 TTFT、TPOT 与完成吞吐。',62,351,1153,64,25);
 table(s,[['现象','优先定位','验收证据'],['加载 / 推理 OOM','权重分片、KV、图捕获工作区','每卡峰值显存，失败请求与对应负载'],['算子报错 / NaN','模型架构、dtype、kernel 版本','日志、固定样本输出、精度回归'],['卡多却慢 / 通信超时','PCIe / NUMA、RDMA、并行方式','通信测试，TTFT / TPOT 的 p50、p95']],60,435,1160,172,[263,413,484],23);
 cite(s,'建议持续测试至少 1 小时。输入长度 + 实际输出不得超过配置上下文。报告分别列明成功率及模型推理/正文 Token 口径');
 notes(s,'TTFT为首Token延迟，TPOT为后续每Token平均时间。聚合输出吞吐取成功请求实际生成completion tokens总数/测试壁钟时间，明确是否含推理Token，不混入输入Token或padding。负载阶梯增加上下文时需同步重新计算显存并配置max_model_len，输出上限可先设256，再评估长生成。排除预热后记录p50/p95、成功率、OOM、设备占用、重试与1小时持续测试。日有效Token可按实测稳态有效输出速率×86400×业务占用率×可用率估算，但如果基准已包含空闲或失败，避免重复折减。每百万有效Token成本=日总费用/(日有效Token/1e6)，费用包括租金、网络、存储与运维。数值均待实测和报价，不提供虚构预测。',['base','aq','ag','ad']);
}
// 12. decision
{
 const s=header(12,'分阶段租赁与验收计划','04  建议与决策','先获得可复现的模型服务结果，再按真实业务负载确认租赁规模');
 table(s,[['阶段','执行范围','完成条件'],['第一阶段\n设备与基线','各取 1 台验证，Qwen3-8B 首个 Token\n核验 910B 64GB 与 T4 16GB 实卡','环境记录齐全\n生成正确、设备与通信正常'],['第二阶段\n目标模型验证','910B 优先 Qwen3.8-27B\nT4 评估小模型副本与 27B 适配','精度回归通过\n固定负载下性能达到业务要求'],['第三阶段\n租赁规模决策','据吞吐和报价确定 T4 为 4 台或 6 台\nGLM / DeepSeek 大模型单独报价','每百万有效 Token 成本\n持续运行与故障恢复通过']],60,207,1160,274,[234,583,343],24);
 txt(s,'若 GLM-5.3 / DeepSeek-V4.1-Flash 是硬性目标',63,509,1145,39,28,C.navy,true);
 txt(s,'参考路径：补至 4 台 A2，或评估 2 台 A3。\n先确认量化权重、专用镜像与网络，再做目标负载 PoC。',63,559,1145,63,26,C.amber);
 cite(s,'扩容是依据官方部署示例提出的候选方案，需供应商实测与报价确认。GLM 为实验支持，DeepSeek 量化产物需核验可获得性');
 notes(s,'初步判断当前配置可以构建中小模型服务池，但不能对三个最新系列的全部大模型统一承诺可用。原计划2台910B和4至6台T4保留为目标规模，建议合同包含样机PoC或分阶段验收，避免在算子兼容未证实前仅按显存总和做采购。目标27B优先利用单机NPU，T4用于成熟较小模型、多副本或额外兼容性实验。大模型推荐4A2或2A3来自参考部署，非最低配置、非吞吐承诺，若更低比特/较短上下文可用可重算。报价比较时固定模型版本、精度、上下文、并发、吞吐和延迟口径。',['aq','ag','ad','t4']);
}
// 13. executable baseline appendix
{
 const s=header(13,'附录 A：最小验证命令','附录','起步命令示例，需先安装匹配镜像与驱动；完整请求和环境记录见配套大纲');
 txt(s,'下载：固定同一个 commit SHA',63,203,566,36,27,C.navy,true);
 box(s,61,256,557,213,C.navy,C.navy);
 txt(s,'hf download Qwen/Qwen3-8B \\\n  --revision <已记录的 SHA> \\\n  --local-dir /data/models/Qwen3-8B',81,274,518,127,21,C.white);
 txt(s,'完整 snapshot 包含权重、索引与 tokenizer。',65,486,550,53,23,C.muted);
 txt(s,'接口：POST /v1/chat/completions',64,559,550,38,23,C.teal,true);
 txt(s,'检查返回文本、usage 与服务端错误日志。',64,602,550,28,22,C.muted);
 txt(s,'T4：2 卡 FP16 的基线服务',667,203,550,36,27,C.navy,true);
 box(s,663,256,557,334,C.navy,C.navy);
 txt(s,'vllm serve /data/models/Qwen3-8B \\\n  --dtype float16 \\\n  --tensor-parallel-size 2 \\\n  --max-model-len 4096 \\\n  --max-num-seqs 1 \\\n  --gpu-memory-utilization 0.85 \\\n  --enforce-eager \\\n  --served-model-name smoke-qwen3 \\\n  --host 127.0.0.1',682,274,521,296,21,C.white);
 cite(s,'910B 基线：使用匹配的 vLLM-Ascend 容器，dtype 改 bfloat16、TP 改 1。目标大模型按各自配方部署');
 notes(s,'命令为未执行示例。占位SHA必须替换为真实commit，配套大纲提供自动解析并保存SHA的snapshot_download代码。首个Token验收使用模型真实权重、官方chat template及固定提示词，推荐请求max_tokens128，Qwen3 enable_thinking=false，temperature0。启动服务后在同机请求localhost:8000，检查模型列表和实际回答，再增加请求压力。enforce-eager只降低初始图编译复杂度，生产性能应在正确性验证后对图模式重新测试。目标Qwen3.8-27B、GLM、DeepSeek的启动脚本不能只改这条基线命令的路径，需使用专用模型支持与量化参数。',['hf','base','aq','ag','ad']);
}
// 14. source hyperlinks & supplier checklist
{
 const s=header(14,'附录 B：参考资料与交付清单','附录','资料核验日期：2026 年 9 月 14 日；详细链接与计算依据见演讲者备注和配套大纲');
 txt(s,'官方资料',64,205,530,36,29,C.navy,true);
 const links=[['硬件：Huawei Atlas 800I A2',refs.hw],['硬件：NVIDIA T4',refs.t4],['精度与 kernel：vLLM 量化矩阵',refs.quant],['部署：Qwen3.8-27B / Ascend',refs.aq],['部署：GLM-5.3 / Ascend',refs.ag],['部署：DeepSeek-V4.1-Flash / Ascend',refs.ad],['模型下载：Hugging Face CLI',refs.hf]];
 links.forEach((a,i)=>{const atext=txt(s,a[0],65,260+i*45,595,36,23,C.blue);atext.text.get(a[0]).link={uri:a[1],isExternal:true};});
 txt(s,'供应商交付时核验',737,205,477,36,29,C.navy,true);
 const items=['板卡型号、显存及独占方式','CPU / RAM / NVMe 实际配置','卡间与跨机拓扑、RDMA 链路','驱动、CANN / CUDA、镜像版本','指定模型的输出与负载测试报告','租金、带宽存储费用及故障响应'];
 items.forEach((v,i)=>{txt(s,String(i+1).padStart(2,'0'),740,267+i*54,49,36,23,C.teal,true);txt(s,v,798,263+i*54,415,44,23,C.ink);});
 cite(s,'本报告包含资料推导与待验证项，不包含租赁机器的实际 benchmark 结果');
 notes(s,'核心资料均使用模型发布方、硬件厂商或推理框架官方文档。各个结论在相关页备注附具体链接。网页latest与模型main会变化，实施时重新核对并固定revision、镜像digest、驱动与运行库版本。验收证据至少包含启动命令、完整依赖清单、代表性请求/响应、每卡内存、通信测试与benchmark结果。',[...Object.keys(refs)]);
}

await fs.mkdir(OUT,{recursive:true});await fs.mkdir(B+'/render',{recursive:true});
await (await PresentationFile.exportPptx(p)).save(B+'/candidate.pptx');
for(let i=0;i<p.slides.items.length;i++){
 const image=await p.export({slide:p.slides.items[i],format:'png',scale:1.5});
 await fs.writeFile(B+'/render/'+String(i+1).padStart(2,'0')+'.png',new Uint8Array(await image.arrayBuffer()));
 console.log('Rendered '+(i+1));
}
if(process.argv.includes('--finalize')){
 const {finalizePresentation}=await import(pathToFileURL(SKILL+'/container_tools/artifact_tool_utils.mjs').href);
 const result=await finalizePresentation({workspaceDir:ROOT,candidatePath:B+'/candidate.pptx',finalPath:OUT+'/GPU_NPU租赁与大模型推理调研.pptx',pythonExecutable:PY,integrityValidatorPath:SKILL+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:SKILL+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit',...[3,5,6,7,8,11,12].flatMap(n=>['--require-native-table-slide',String(n)])],explicitTotalSlideCount:14,requiredNativeTableOwnerSlides:[3,5,6,7,8,11,12],requiredNativeChartOwnerSlides:[2],materializeLiteralChartWorkbooks:true,fontPolicy:{basis:'design',families:[FONT]},verifyArtifactToolImport:true,receiptPath:B+'/validation.json'});console.log(JSON.stringify(result));
}
console.log('Deck complete');
