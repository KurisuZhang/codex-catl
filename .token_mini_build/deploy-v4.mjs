import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {Presentation,PresentationFile,FileBlob} from '@oai/artifact-tool';
const ROOT='/Users/lin/Desktop/catl',B=ROOT+'/.token_mini_build/deploy-v4';
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

const s=header('10','模型部署全流程','从模型仓库到 MASS 服务：四个阶段推进，验收通过后发布。');
const xs=[60,358,656,954],w=266;
const names=['模型准备','运行环境','推理服务','验收与交付'];
for(let i=0;i<4;i++){
 txt(s,String(i+1).padStart(2,'0'),xs[i],208,53,45,32,C.teal,true);
 txt(s,names[i],xs[i]+56,208,210,45,27,C.navy,true);
 box(s,xs[i],263,w,3,C.teal,C.teal);
 if(i<3)txt(s,'→',xs[i]+270,214,27,32,25,C.teal,true,'center');
}
const groups=[
[['确定规格','仓库 / revision、精度与卡数\n上下文 / 并发、许可与权限'],['下载与校验','Hugging Face / ModelScope\n权重分片、配置、SHA256'],['准备权重','按需量化 / 格式转换\n补齐 tokenizer 与视觉组件']],
[['节点与驱动','OS、IP / 时间、磁盘 / 权限\n驱动与固件、设备健康'],['模型与镜像分发','各节点权重一致、固定路径\n镜像配套、固定 digest'],['容器接入设备','透传卡与驱动库、挂载目录\n共享内存 / 端口、容器内验卡']],
[['910B 分支','Ascend 镜像＋vLLM Ascend\n按 A2 配方配置精度与并行'],['T4 分支：按适配选引擎','vLLM / SGLang（核验支持）\nOllama / llama.cpp（候选）'],['启动与扩展','先单机低负载；双机先验 RoCE\n再配 rank / TP / DP / EP']],
[['接口与质量','健康检查、模型列表、推理 API\n固定样本、流式输出、停止条件'],['负载与稳定性','增加上下文 / 并发，记录显存\nTTFT / TPOT / 吞吐，视觉另测'],['MASS 接入与发布','鉴权 / 路由 / 计量、端到端验证\n进程托管、监控、小流量与回退']]
];
for(let i=0;i<4;i++)for(let j=0;j<3;j++){
 let y=283+j*86;
 txt(s,groups[i][j][0],xs[i],y,w,29,23,C.navy,true);
 txt(s,groups[i][j][1],xs[i],y+33,w,48,18,C.ink);
}
box(s,60,555,1160,1,C.line,C.line);
const gates=['权重完整且可追溯','容器内设备可用','服务启动且可调用','效果达标并可恢复'];
for(let i=0;i<4;i++)txt(s,'✓  '+gates[i],xs[i],568,w,31,20,C.teal,true);
txt(s,'文本引擎按模型 / 量化 / 算子支持选型；YOLO / Wan 使用独立管线。详细命令见配套操作清单。',62,617,1156,29,20,C.muted);
s.speakerNotes.textFrame.setText('本页将已确认的12步部署流程整合为四阶段。每阶段三项操作，底部为对应完成标准，勾号表示要求而非已经完成。保留权重下载、量化、分发、环境准备、容器设备透传、推理、扩展、验收、平台接入和故障恢复全部环节。T4与910B是不同的候选执行路径，具体模型以06适配结果为准。单机先验通，双机只在需要时执行，不能将所有模型默认扩至双机。MASS实际字段、镜像digest、模型revision和节点配置尚待现场确认。T4文本引擎候选包含vLLM、SGLang、Ollama和llama.cpp。需要核验具体模型、量化格式、SM75算子、软件版本、显存及性能，不代表每个组合都已支持。GGUF是权重格式，llama.cpp仅为此前示例路径。详细操作和命令见07_模型部署_操作清单.md。\nhttps://docs.ollama.com/gpu\nhttps://docs.sglang.io/docs/get-started/install\nhttps://docs.vllm.ai/en/latest/getting_started/installation/gpu/\n'+refs);
await fs.mkdir(B,{recursive:true});await(await PresentationFile.exportPptx(p)).save(B+'/candidate.pptx');
const im=await p.export({slide:s,format:'png',scale:1.5});await fs.writeFile(B+'/draft-1.png',new Uint8Array(await im.arrayBuffer()));
