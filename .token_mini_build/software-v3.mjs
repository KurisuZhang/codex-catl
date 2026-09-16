import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {Presentation,PresentationFile,FileBlob} from '@oai/artifact-tool';
const ROOT='/Users/lin/Desktop/catl',B=ROOT+'/.token_mini_build/software-v3';
const SKILL='/Users/lin/.codex/plugins/cache/openai-primary-runtime/presentations/26.909.12148/skills/presentations';
const C={navy:'#12304A',ink:'#233D50',teal:'#008E9C',blue:'#377BB5',muted:'#667B89',line:'#D4E0E6',bg:'#F8FAFB',pale:'#E6F3F4',white:'#FFFFFF',amber:'#9B641C'};
const F='Arial Unicode MS';
const p=Presentation.create({slideSize:{width:1280,height:720}});
function box(s,x,y,w,h,fill=C.white,stroke=C.line){return s.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:h},fill,line:{fill:stroke,width:1}})}
function txt(s,v,x,y,w,h,size=22,color=C.ink,bold=false,align='left'){const a=s.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});a.text=v;a.text.style={typeface:F,fontSize:size,color,bold,alignment:align,verticalAlignment:'middle',wrap:'square',autoFit:'none',insets:{top:0,bottom:0,left:0,right:0}};return a;}
function node(s,v,x,y,w,h,fill=C.white,color=C.ink,size=20){box(s,x,y,w,h,fill);return txt(s,v,x+5,y+2,w-10,h-4,size,color,false,'center');}
function header(n,sub,lead){let s=p.slides.add();s.background.fill=C.bg;txt(s,'A3  软件架构',60,28,1160,61,46,C.navy,true);txt(s,sub,62,96,1156,46,30,C.teal,true);txt(s,lead,62,148,1156,43,20,C.muted);box(s,60,659,1160,1,C.line,C.line);txt(s,'token 魔方 Mini实验台',60,674,1000,22,15,C.muted);txt(s,n+' / 18',1105,674,115,22,15,C.muted,false,'right');return s;}
function table(s,vals,x,y,width,widths,heights,size=20){let t=s.tables.add({rows:vals.length,columns:vals[0].length,left:x,top:y,width,height:heights.reduce((a,b)=>a+b,0),columnWidths:widths,values:vals});t.borders.assign({style:'solid',fill:C.line,width:1});t.cells.block({row:0,column:0,rowCount:vals.length,columnCount:vals[0].length}).assign({textStyle:{fontSize:size,typeface:F,color:C.ink},margins:{left:10,right:8,top:0,bottom:0},anchor:'center'});for(let r=0;r<vals.length;r++){t.rows[r].height=heights[r];for(let c=0;c<vals[0].length;c++){let z=t.getCell(r,c);z.fill=r===0?C.navy:(r%2?C.white:'#EDF4F6');z.text.style={fontSize:size,typeface:F,color:r===0?C.white:C.ink,bold:r===0||c===0};}}return t;}
const refs=[
['NVIDIA GPU Operator','https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/'],
['NVIDIA Container Toolkit','https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/arch-overview.html'],
['MindCluster 组件','https://www.hiascend.com/document/detail/en/mindcluster/2600/clustersched/schedulingug/docs/en/scheduling/introduction/01_component_description.md'],
['torch_npu 版本配套','https://github.com/Ascend/pytorch/blob/master/COMPATIBILITY.en.md'],
['vLLM GPU 安装','https://docs.vllm.ai/en/latest/getting_started/installation/gpu/'],
['vLLM 量化矩阵','https://docs.vllm.ai/en/latest/features/quantization/'],
['vLLM Ascend 安装','https://docs.vllm.ai/projects/ascend/en/latest/getting_started/installation.html'],
['vLLM Ascend 模型矩阵','https://docs.vllm.ai/projects/ascend/en/latest/user_guide/support_matrix/supported_models.html'],
['SGLang 安装与硬件入口','https://docs.sglang.io/docs/get-started/install'],
['SGLang Ascend 模型表','https://github.com/sgl-project/sglang/blob/main/docs_new/docs/hardware-platforms/ascend-npus/reference/support_models.mdx'],
['SGLang Ascend 安装与依赖','https://docs.sglang.io/docs/hardware-platforms/ascend-npus/getting-started/installation'],
['MindIE 配套要求','https://www.hiascend.com/document/detail/zh/mindie/1.0.RC1/envdeployment/instg/mindie_instg_0015.html']
];
function sources(ids){return '\n\n官方参考文档（查询2026-09-16，动态页面不是本项目冻结版本）：\n'+ids.map(i=>`[${i}] ${refs[i-1][0]}\n${refs[i-1][1]}`).join('\n');}
function tint(t,col,color){for(let r=1;r<t.rows.length;r++)t.getCell(r,col).fill=color;}
{
const s=header('06','T4 与 910B 的完整软件生态对照','分析：同一模型名称背后，是两套驱动、运行库、设备管理和算子实现。');
const vals=[['层次 / 职责','NVIDIA T4','昇腾 910B','对模型部署的影响'],
['01  宿主机','Linux / 内核、NVIDIA Driver\nnvidia-smi / NVML','Linux / 内核、NPU Driver＋固件\nnpu-smi / DCMI','OS、CPU 架构、驱动与镜像匹配'],
['02  计算与通信','CUDA Runtime / Toolkit\ncuBLAS、cuDNN、NCCL','CANN / AscendCL、算子包\nHCCL、ATB（按引擎）','运行库 ABI、算子执行\n及多卡 / 跨机通信'],
['03  容器接入','containerd / Docker\nNVIDIA Container Toolkit','containerd / Docker（核验版本）\nAscend Docker Runtime / 设备挂载','使容器访问设备和驱动\n不自动转换 CUDA 代码'],
['04  K8s 资源','NVIDIA Device Plugin、GFD\nGPU Operator（统一管理）','Ascend Device Plugin\nVolcano / Ascend Operator（按需）','资源发现、分配、调度\n不补齐模型算子'],
['05  监控与运维','DCGM Exporter / Prometheus\nNsight（性能定位）','NPU Exporter / Prometheus\nNodeD / ClusterD、msprof（按需）','设备健康、资源利用率\n及故障 / 性能定位'],
['06  框架适配','PyTorch CUDA 构建\nTransformers / ONNX（按任务）','PyTorch＋torch_npu\nMindSpore（另一条框架路径）','模型结构与算子映射\n扩展包必须匹配框架'],
['07  算子与量化','CUDA / Triton kernel\nAWQ、GPTQ 等按 SM75 核验','Ascend C / Triton-Ascend / ATB\nSGL Kernel NPU；量化按引擎核验','Attention / MoE / 量化 kernel\n须支持硬件、精度与形状'],
['08  推理与服务','文本：vLLM；SGLang 需核验 T4\nYOLO：TensorRT；Wan：独立管线','vLLM＋vLLM Ascend\nSGLang Ascend 后端 / MindIE','引擎、模型、特性支持取交集\n分别提供业务服务接口']];
const t=table(s,vals,60,198,1160,[155,345,355,305],[37,45,45,45,45,45,45,45,49],18);
for(let r=1;r<vals.length;r++){t.getCell(r,1).fill=r%2?'#F1F6EF':'#EAF1E7';t.getCell(r,2).fill=r%2?'#EEF6F8':'#E6F0F4';t.getCell(r,3).text.style={fontSize:18,typeface:F,color:C.muted};}
t.getCell(0,1).fill='#446844';t.getCell(0,2).fill='#17637A';
txt(s,'结论：基础设施决定“设备能否使用”，模型适配与算子、引擎决定“服务能否交付”。',62,609,1156,35,23,C.teal,true);
s.speakerNotes.textFrame.setText('本页按职责从底层到服务层盘点，不表示全部软件都在同一串行调用链上。容器、K8s和监控是部署管理面，框架、算子、运行库是模型执行面。各列列出组件范围及替代路径，不要求全部安装。GPU Operator可管理驱动、Container Toolkit、Device Plugin、GFD、DCGM等，不应与另一个驱动生命周期管理方式重复管理。K8s提供调度，不是推理必须条件，首轮可先单容器验通再纳管。NVIDIA宿主机需可用驱动，CUDA用户态库可位于镜像，运行预编译镜像不必把完整CUDA Toolkit一概装在宿主机。Toolkit用于开发编译，不能与Container Toolkit混淆。Ascend容器接入需按运行时、MindCluster和驱动版本选择部署方式，安装工具名称不能证明任意containerd版本兼容。MindCluster中的NodeD、ClusterD、Volcano与Operator按需要配置，非本项目全部必装。NVIDIA T4不假定具备新GPU的所有精度与kernel能力，不照抄MIG方案。跨机NCCL/HCCL还受网卡、RDMA驱动及网络配置影响，双910B沿已定RoCE方案单独验通信。CANN包含运行和开发能力，ATB按引擎需求装。SGLang Ascend依赖包括匹配的Triton-Ascend及SGL Kernel NPU。PD分离还需核验MemFabric等KV传输组件，MoE场景按版本考虑DeepEP兼容实现，这些属于特性依赖，不是所有模型的必装项。MindIE为另一推理路径，不是vLLM的必装前置。SGLang列为候选生态，并未宣称当前默认镜像支持本台T4。YOLO和Wan保持任务专用推理路径，不能因vLLM支持文本就认为其支持任意视觉模型。'+sources([1,2,3,4,5,7,9,11,12]));
}
{
const s=header('07','软件支持如何转化为模型可部署','方法论：对“模型＋权重格式＋硬件＋引擎版本＋服务规格”验证，而非只查模型名称。');
const steps=[['01  定义任务','固定模型 revision、精度 / 量化\n上下文、并发、TP / PP、接口'],['02  查支持交集','核对硬件、模型与特性矩阵\n反查算子、框架及运行库版本'],['03  冻结软件组合','驱动 / 固件、镜像 digest\n框架、引擎 / 插件、权重 hash'],['04  实机验收','单卡 / 单容器起测，再多卡 / K8s\n质量、显存、TTFT / TPOT、稳定性']];
for(let i=0;i<4;i++){let x=62+i*294;txt(s,steps[i][0],x,202,275,36,25,C.teal,true);box(s,x,242,265,2,C.line,C.line);txt(s,steps[i][1],x,253,275,65,18,C.ink);}
const t=table(s,[['例子：部署 Qwen3-8B','T4 上怎么做','910B 上怎么做'],
['先准备运行环境','安装 NVIDIA 驱动，使用 CUDA 镜像\n镜像内装匹配的 PyTorch 和 vLLM','安装 NPU 驱动与固件，使用 CANN 镜像\n装匹配的 torch_npu、vLLM 和 Ascend 插件'],
['为什么不能直接照搬？','先选 FP16、小上下文、单卡试跑\n8B 权重约 16GB，另需 KV 缓存，可能放不下','CUDA 镜像不能直接用，需换昇腾后端\n还要核对该模型的算子和精度是否受支持'],
['怎么知道真的能用？','若显存不足，选受支持的量化或多卡方案\n同一组问题检查答案，再测并发与响应时间','先检查答案与显存，再测多卡通信和并发\n容器能启动、能识别卡，都不算模型验收']],60,337,1160,[240,460,460],[35,60,60,60],19);
txt(s,'结论：同一个模型，两套软件环境；能加载、答得对、速度达标，才算部署通过。',62,563,1156,48,23,C.teal,true);
txt(s,'官方依据：[1] GPU Operator  [3] MindCluster  [4] torch_npu 配套  [5–6] vLLM 硬件 / 量化',62,612,1156,21,16,C.muted);
txt(s,'[7–8] vLLM Ascend 安装 / 模型矩阵  [9–10] SGLang 安装 / Ascend 模型表   完整链接见备注与参考文档',62,636,1156,20,16,C.muted);
s.speakerNotes.textFrame.setText('示例Qwen/Qwen3-8B用于解释软件依赖，不声称已经部署成功。8B参数×2字节约16GB是粗略十进制权重估算，不是实际模型文件精确大小；T4单卡16GB还需KV缓存及工作区，所以FP16可能超出容量。量化需有兼容权重格式和kernel，不能只改参数名称。910B具体显存仍待核验。方法论是本项目的归纳：可部署集合为模型结构、硬件、精度/量化实现、推理特性和依赖版本的交集，还要满足容量和服务目标。先固定模型revision与权重格式，再选择候选引擎release并反查其依赖，避免把每层latest任意拼接。启动后先测确定性小样本与质量，再观察逐卡权重、KV Cache和工作区峰值；多卡验证并行与通信；最后纳入K8s后复验资源分配、健康检查、失败恢复与同规格性能。T4的SM75满足vLLM基础门槛，不代表任何attention后端、量化或模型特性均可用。当前量化矩阵对Turing的支持随版本变化，不能长期沿用旧版Marlin结论。SGLang有NVIDIA和Ascend入口，但本次资料不能建立当前SGLang/T4完整可运行组合，故保留核验，不标成已支持或绝对不支持。910B按A2路径选择匹配算子和镜像；vLLM Ascend矩阵有Qwen、DeepSeek、GLM家族条目，必须核验具体结构、精度、TP/PP、PD、缓存等特性。SGLang Ascend与MindIE各有自己的版本和模型矩阵，不能相互外推。示例均为筛选判断，未做实机部署或基准测试。YOLO/Wan需以任务仓库、许可和所选后端验收；不新增对具体版本的兼容承诺。最终产物为按设备族和任务区分的镜像清单、模型支持表、测试记录及回退版本。'+sources([4,5,6,7,8,9,10,11,12]));
}
await fs.mkdir(B,{recursive:true});
await(await PresentationFile.exportPptx(p)).save(B+'/candidate.pptx');
for(let i=0;i<2;i++){const im=await p.export({slide:p.slides.items[i],format:'png',scale:1.5});await fs.writeFile(B+'/draft-'+(i+1)+'.png',new Uint8Array(await im.arrayBuffer()));}
await fs.writeFile(B+'/references.json',JSON.stringify(refs,null,2));
console.log('Authored 2 software ecosystem slides');
