import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {Presentation,PresentationFile,FileBlob} from '@oai/artifact-tool';
const ROOT='/Users/lin/Desktop/catl',B=ROOT+'/.token_mini_build/deploy-v2';
const SKILL='/Users/lin/.codex/plugins/cache/openai-primary-runtime/presentations/26.909.12148/skills/presentations';
const C={navy:'#12304A',ink:'#233D50',teal:'#008E9C',blue:'#377BB5',muted:'#667B89',line:'#D4E0E6',bg:'#F8FAFB',pale:'#E6F3F4',white:'#FFFFFF',amber:'#9B641C'};
const F='Arial Unicode MS';
const p=Presentation.create({slideSize:{width:1280,height:720}});
function box(s,x,y,w,h,fill=C.white,stroke=C.line){return s.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:h},fill,line:{fill:stroke,width:1}})}
function txt(s,v,x,y,w,h,size=22,color=C.ink,bold=false,align='left'){const a=s.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});a.text=v;a.text.style={typeface:F,fontSize:size,color,bold,alignment:align,verticalAlignment:'middle',wrap:'square',autoFit:'none',insets:{top:0,bottom:0,left:0,right:0}};return a;}
function node(s,v,x,y,w,h,fill=C.white,color=C.ink,size=20){box(s,x,y,w,h,fill);return txt(s,v,x+5,y+2,w-10,h-4,size,color,false,'center');}
function header(n,sub,lead){let s=p.slides.add();s.background.fill=C.bg;txt(s,'A5  模型部署',60,28,1160,61,46,C.navy,true);txt(s,sub,62,96,1156,46,30,C.teal,true);txt(s,lead,62,148,1156,43,20,C.muted);box(s,60,659,1160,1,C.line,C.line);txt(s,'token 魔方 Mini实验台',60,674,1000,22,15,C.muted);txt(s,n+' / 18',1105,674,115,22,15,C.muted,false,'right');return s;}
function table(s,vals,x,y,width,widths,heights,size=20){let t=s.tables.add({rows:vals.length,columns:vals[0].length,left:x,top:y,width,height:heights.reduce((a,b)=>a+b,0),columnWidths:widths,values:vals});t.borders.assign({style:'solid',fill:C.line,width:1});t.cells.block({row:0,column:0,rowCount:vals.length,columnCount:vals[0].length}).assign({textStyle:{fontSize:size,typeface:F,color:C.ink},margins:{left:10,right:8,top:0,bottom:0},anchor:'center'});for(let r=0;r<vals.length;r++){t.rows[r].height=heights[r];for(let c=0;c<vals[0].length;c++){let z=t.getCell(r,c);z.fill=r===0?C.navy:(r%2?C.white:'#EDF4F6');z.text.style={fontSize:size,typeface:F,color:r===0?C.white:C.ink,bold:r===0||c===0};}}return t;}


const refs='官方资料：\nhttps://huggingface.co/docs/huggingface_hub/en/guides/cli\nhttps://github.com/modelscope/modelscope/blob/master/docs/source/command.md\nhttps://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/Qwen3.8-27B.html\nhttps://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md\nhttps://docs.ultralytics.com/models/yolo26/\nhttps://github.com/Wan-Video/Wan2.1';
function rows(s,data){data.forEach((v,i)=>{let y=198+i*70;txt(s,v[0],62,y,45,37,27,C.teal,true);txt(s,v[1],122,y,265,32,23,C.navy,true);txt(s,v[2],400,y,817,54,19,C.ink);});}
{
let s=header('10a','部署流程 ①：下载模型，准备可复现的运行环境','主线示例：910B 部署 Qwen3.8-27B；T4 部署 Qwen3.5-9B GGUF 量化版。');
rows(s,[
['01','确定部署规格','记录仓库 ID、固定 revision、精度、引擎版本、卡数、上下文和并发。\n核验模型许可 / 访问授权，确认单卡显存、CPU 架构和可用磁盘空间。'],
['02','准备节点与目录','核对 OS、时间同步、DNS、节点 IP、端口和挂载权限，准备模型 / 日志目录。\n安装配套驱动与固件，用 npu-smi info / nvidia-smi 确认设备数量与健康。'],
['03','下载完整模型','HF：hf download <仓库> --revision <版本> --local-dir <目录>\nModelScope：modelscope download --model <仓库> --revision <版本> --local_dir <目录>'],
['04','核验文件与权重','检查全部权重分片、索引、config、tokenizer、chat template；视觉模型补齐组件。\n对照来源校验文件，记录 SHA256。量化格式须匹配引擎，转换后重新验证质量。'],
['05','分发权重与镜像','将同一版本权重复制到各节点相同路径，或挂载共享存储，再核对文件清单。\n拉取匹配 CPU 架构、驱动和引擎的镜像并记录 digest；禁止随意混装 latest。'],
['06','启动容器并验设备','只读挂载权重，挂载日志 / 缓存目录，配置设备透传、共享内存与服务端口。\n910B 使用 CANN / Ascend 镜像；T4 使用 CUDA 镜像，容器内再次确认卡可见。']]);
txt(s,'本页完成标准：权重完整且版本一致，镜像可复现，容器内设备可用。',62,620,1156,29,23,C.teal,true);
s.speakerNotes.textFrame.setText('所有尖括号参数均需替换；这是操作流程，不是已经执行的部署。HF与ModelScope仓库ID和revision分别确认，不能假设两个平台版本号一致。受限仓库按许可申请访问，凭据注入下载环境，不写进镜像或PPT。下载工具安装到独立环境并记录版本。磁盘预留下载缓存、量化中间文件和镜像空间。校验索引引用的所有文件，不能只检查文件数量；如使用GGUF分片必须齐全，多模态补齐投影文件。量化权重来源与转换工具记录在清单。910B需确认具体卡型与固件，不能用A3镜像替代A2。容器设备、驱动库挂载和共享内存按对应官方配套命令配置，不提供适用于所有设备的统一docker参数。\n'+refs);
}
{
let s=header('10b','部署流程 ②：启动推理，验证服务，接入 MASS','先在单机低负载下跑通，再扩展双机 / 多副本；每一步保留日志和验收结果。');
rows(s,[
['07','单机启动推理','910B：按 Qwen3.8-27B 的 A2 指南启动 vllm serve，设置模型路径和并行度。\nT4：llama-server -m <GGUF> -ngl 99 -c 4096 --host 0.0.0.0 --port 8000'],
['08','检查首次推理','查看加载 / 算子编译日志与逐卡显存；检查 /health、/v1/models。\n调用 /v1/chat/completions，验证非空回答、流式输出、停止条件和模型名称。'],
['09','扩展双机或副本','双机先跑 HCCL / RoCE 通信测试，再配置节点 IP、rank、TP / DP / EP 和端口。\n两机权重 / 镜像一致，按指南先主节点后工作节点；T4 优先扩单卡服务副本。'],
['10','质量与负载验收','固定题集对照基线，逐步增加输入长度、输出长度、并发，检查错误与显存峰值。\n记录 TTFT、TPOT、吞吐和持续运行表现；YOLO / Wan 另验任务质量与耗时。'],
['11','接入平台与访问控制','配置服务地址、模型名、鉴权、超时、限流、路由和健康检查，接入 MASS。\n用平台 API Key 端到端调用，核对流式响应、用量统计、失败请求及计费口径。'],
['12','发布与故障恢复','按平台要求纳入 K8s 或进程托管，配置资源申请、探针、日志、指标和告警。\n小流量发布，演练重启 / 下线 / 旧版本回退，归档启动脚本、配置和测试记录。']]);
txt(s,'交付物：模型与镜像清单、启动配置、测试报告、平台调用记录、回退方案。',62,620,1156,29,23,C.teal,true);
s.speakerNotes.textFrame.setText('示例启动参数是低负载起点，不代表已验证服务规格。llama.cpp必须采用支持Qwen3.5 GGUF结构与T4 CUDA的构建；-ngl 99尝试卸载模型层到GPU，不保证整个模型都装下，应观察日志；上下文4096为示例。视觉输入另配投影模型。910B按A2专用配方冻结模型/引擎/插件版本，不强行通用vllm命令。模型首次加载可能较慢，健康检查要等待就绪后执行。多机并行不是强制步骤，单卡/单机通过后只对选定双机模型执行；尚未有当前双机证据的GLM5.3/DeepSeekV4.1需要先做专项验证。平台接口未知，MASS的菜单/API/计量字段需按实际文档映射，本页给出接入输入和验收标准，未虚构平台命令。YOLO和Wan是独立任务服务，不套文本聊天端点和token指标。正式流量入口应由网关鉴权访问控制，内部服务绑定0.0.0.0不代表对公网开放。\n'+refs);
}
await fs.mkdir(B,{recursive:true});await(await PresentationFile.exportPptx(p)).save(B+'/candidate.pptx');
for(let i=0;i<2;i++){const im=await p.export({slide:p.slides.items[i],format:'png',scale:1.5});await fs.writeFile(B+'/draft-'+(i+1)+'.png',new Uint8Array(await im.arrayBuffer()));}
