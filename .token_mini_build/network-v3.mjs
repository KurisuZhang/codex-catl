import fs from 'node:fs/promises';
import {Presentation,PresentationFile} from '@oai/artifact-tool';
const B='/Users/lin/Desktop/catl/.token_mini_build/network-v3';
const C={navy:'#12304A',ink:'#233D50',teal:'#008E9C',blue:'#377BB5',muted:'#667B89',line:'#D4E0E6',bg:'#F8FAFB',pale:'#E6F3F4',white:'#FFFFFF',amber:'#9B641C'};
const F='Arial Unicode MS';
const p=Presentation.create({slideSize:{width:1280,height:720}});
const refs={t4:'https://www.nvidia.cn/content/dam/en-zz/Solutions/Data-Center/tesla-t4/t4-tensor-core-datasheet.pdf',roce:'https://e.huawei.com/cn/products/computing/ascend/atlas-800t-a2',optics:'https://e.huawei.com/cn/products/dcn-modules/200g',asc:'https://docs.vllm.ai/projects/ascend/en/latest/user_guide/support_matrix/supported_models.html',install:'https://docs.vllm.ai/projects/ascend/en/main/getting_started/installation.html',quant:'https://docs.vllm.ai/en/latest/features/quantization/',gpu:'https://docs.vllm.ai/en/latest/getting_started/installation/gpu/',trt:'https://nvidia.github.io/TensorRT-LLM/reference/support-matrix.html',qwen:'https://huggingface.co/Qwen/Qwen3-8B',awq:'https://huggingface.co/Qwen/Qwen2.5-7B-Instruct-AWQ',ds:'https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-32B',glm:'https://huggingface.co/zai-org/GLM-4.5-Air',yolo:'https://docs.ultralytics.com/models/yolo26',wan:'https://github.com/Wan-Video/Wan2.1',bench:'https://docs.vllm.ai/en/v0.27.0/cli/bench/serve/',metrics:'https://docs.vllm.ai/en/latest/api/vllm/benchmarks/serve/',price:'https://api-docs.deepseek.com/quick_start/pricing/'};
function box(s,x,y,w,h,fill=C.white,stroke=C.line){return s.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:h},fill,line:{fill:stroke,width:1}})}
function txt(s,v,x,y,w,h,size=26,color=C.ink,bold=false,align='left'){const a=s.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});a.text=v;a.text.style={typeface:F,fontSize:size,color,bold,alignment:align,verticalAlignment:'middle',wrap:'square',autoFit:'none',insets:{top:0,bottom:0,left:0,right:0}};return a;}
function rule(s,x,y,w,col=C.line){box(s,x,y,w,1,col,col)}
function node(s,v,x,y,w,h,fill=C.white,color=C.ink,size=24){const a=box(s,x,y,w,h,fill);a.text=v;a.text.style={typeface:F,fontSize:size,color,alignment:'center',verticalAlignment:'middle',autoFit:'none',insets:{left:10,right:10,top:5,bottom:5}};return a;}
function conn(s,a,b,color=C.teal,side='right',to='left'){s.shapes.connect(a,b,{kind:'elbow',fromSide:side,toSide:to,line:{fill:color,width:2},tail:{type:'triangle',width:'sm',length:'sm'}})}
const themes={2:'目录',3:'A1  硬件设备',4:'A1  硬件设备',5:'A2  网络拓扑',6:'A3  软件架构',7:'A3  软件架构',8:'A4  模型适配',9:'A4  模型适配',10:'A5  模型部署',11:'B1  性能测试',12:'B1  性能测试',13:'B2  Token 收益分析',14:'B2  Token 收益分析',15:'B3  商业协议',16:'B3  商业协议',17:'B4  公司流程',18:'B4  公司流程'};
const subtitles={2:'技术验证与商业验证的范围及评审目标',3:'双机柜资源配置：910B 分柜，T4 均衡布置',4:'功率与配套：逐柜整机峰值决定混装容量',5:'跨柜 RoCE：两台 910B 共用一台交换机',6:'生态与部署路径：软件依赖决定模型适配',7:'MASS 接入与计量：请求到用量的证据链',8:'910B 国产模型：先验证稠密模型，再扩候选',9:'T4 模型分工：文本、检测、视频分别验收',10:'部署与发布：以阶段证据作为上线门槛',11:'压测设计：分别扫描并发与请求到达率',12:'结果判读：服务目标约束下的可售产能',13:'产能估值：三类 Token 分别计算',14:'经济性判断：增量收支、全成本与盈亏边界',15:'计量与结算：请求如何形成双方认可的账单',16:'服务与责任：承诺范围匹配架构和实测能力',17:'协作与回款：各角色按凭证完成交接',18:'闭环验收：下一阶段通过条件与责任'};
function header(n,title,sub){let s=p.slides.add();s.background.fill=C.bg;txt(s,themes[n],60,28,1160,61,46,C.navy,true);txt(s,subtitles[n],62,96,1156,46,30,C.teal,true);txt(s,sub,62,148,1156,43,21,C.muted);rule(s,60,659,1160);txt(s,'token 魔方 Mini实验台',60,674,1000,22,15,C.muted);txt(s,String(n).padStart(2,'0')+' / 18',1105,674,115,22,15,C.muted,false,'right');return s;}

function takeaway(s,v){txt(s,v,62,600,1156,43,24,C.teal,true)}
function notes(s,v,keys=[]){s.speakerNotes.textFrame.setText(v+'\n\n资料查询日期：2026-09-16。方案报告，尚未执行设备部署、压测和交易。\n'+keys.map(k=>k+': '+refs[k]).join('\n'))}
const tableOwners=[];
function table(s,values,x,y,w,h,widths,size=23){tableOwners.push(p.slides.items.indexOf(s)+1);const t=s.tables.add({rows:values.length,columns:values[0].length,left:x,top:y,width:w,height:h,columnWidths:widths,values});t.borders.assign({style:'solid',fill:C.line,width:1});t.cells.block({row:0,column:0,rowCount:values.length,columnCount:values[0].length}).assign({textStyle:{fontSize:size,typeface:F,color:C.ink},margins:{left:13,right:12,top:2,bottom:2},anchor:'center'});for(let r=0;r<values.length;r++)for(let c=0;c<values[0].length;c++){let z=t.getCell(r,c);z.fill=r===0?C.navy:(r%2?C.white:'#EDF4F6');z.text.style={fontSize:size,typeface:F,color:r===0?C.white:C.ink,bold:r===0||c===0};}t.rows[0].height=48;for(let r=1;r<values.length;r++)t.rows[r].height=(h-48)/(values.length-1);return t;}
{
const s=header(5,'网络拓扑','三柜统一接入业务、管理与存储网络，两台 910B 通过独立 RoCE 网络互联。');
const N={biz:'#58844D',mg:'#129AA9',calc:'#7753A3',storage:'#397FBD',core:'#5F778A'};
function line(x,y,w,h,c){return box(s,x,y,w,h,c,c)}
function dev(t,x,y,w,h,c=C.navy,fill='#FFFFFF',size=19){const a=node(s,t,x,y,w,h,fill,c,size);a.line={fill:'#BACBD5',width:1};a.borderRadius=5;return a;}
function wire(a,b,c,from='right',to='left'){return s.shapes.connect(a,b,{kind:'straight',fromSide:from,toSide:to,line:{fill:c,width:1.8}});}
function port(x,y,c,w=10){return box(s,x,y,w,10,c,c)}
const field=box(s,60,196,1160,443,'none','#D4E0E6');field.borderRadius=10;
txt(s,'TOKEN 魔方 Mini 集群',80,202,380,27,19,C.navy,true);
for(const [i,c,t] of [[0,N.biz,'业务'],[1,N.mg,'BMC'],[2,N.storage,'存储（可选）'],[3,N.calc,'RoCE 200GE']]){line(613+i*147,216,21,2,c);txt(s,t,641+i*147,203,142,25,16,C.ink);}
const ext=dev('平台 / Internet\n压测入口',80,244,220,39);
const fw=dev('边界防火墙 / 访问控制',328,244,242,39);
const core=dev('核心 / 业务汇聚',598,244,255,39);
const biz=dev('业务接入交换设备',881,244,319,39,N.biz,'#F1F6F0');
wire(ext,fw,N.core);wire(fw,core,N.core);wire(core,biz,N.biz);
const ops=dev('运维入口 / 管理区',80,302,220,36,N.mg,'#EDF7F8');
const mg=dev('BMC 带外管理接入交换设备',328,302,390,36,N.mg,'#EDF7F8');wire(ops,mg,N.mg);
txt(s,'服务器与交换设备\n管理口接入 BMC 网',755,298,274,42,17,C.muted);
line(101,367,1085,2,N.mg);line(112,388,1074,2,N.biz);line(524,338,1.5,29,N.mg);line(1041,283,1.5,105,N.biz);
for(const [x,w] of [[80,320],[420,380],[820,380]]){const a=box(s,x,409,w,112,'none','#BACBD5');a.borderRadius=5;}
const machines=[{x:92,w:82,t:'通算 1',k:'cpu'},{x:192,w:100,t:'通算 2…5',k:'cpu'},{x:310,w:78,t:'通算 6',k:'cpu'},
{x:432,w:124,t:'910B-1\n8 卡',k:'npu'},{x:566,w:66,t:'T4-1\n8 卡',k:'gpu'},{x:644,w:66,t:'T4-2\n8 卡',k:'gpu'},{x:722,w:66,t:'T4-3\n8 卡',k:'gpu'},
{x:832,w:124,t:'910B-2\n8 卡',k:'npu'},{x:966,w:66,t:'T4-4\n8 卡',k:'gpu'},{x:1044,w:66,t:'T4-5\n8 卡',k:'gpu'},{x:1122,w:66,t:'T4-6\n8 卡',k:'gpu'}];
const calc=[];
for(const m of machines){line(m.x+17,368,1,48,N.mg);line(m.x+35,389,1,27,N.biz);port(m.x+12,416,N.mg);port(m.x+30,416,N.biz);
 dev(m.t,m.x,430,m.w,45,m.k==='npu'?N.calc:C.navy,m.k==='npu'?'#F2EDF8':'#F2F6F9',m.k==='cpu'?17:18);
 if(m.k==='npu'){const pp=[];for(let j=0;j<8;j++)pp.push(port(m.x+3+j*15,476,N.calc,10));calc.push(pp);}
}
txt(s,'机柜 A   通算 ×6 / MASS',90,485,300,29,19,C.navy,true,'center');
txt(s,'机柜 B / 10 kW',574,485,216,29,19,C.navy,true,'center');txt(s,'机柜 C / 10 kW',974,485,216,29,19,C.navy,true,'center');
line(95,542,1085,2,N.storage);line(95,542,1.5,26,N.storage);
for(const x of [376,776,1176]){port(x-4,516,N.storage,9);line(x,525,1,17,N.storage);}
const store=dev('共享存储 / 对象存储（可选）',80,568,320,39,N.storage,'#EDF4FA',19);
txt(s,'A / B / C 三柜节点均接入',88,608,330,21,16,N.storage);
const roce=dev('RoCE 交换机 ×1（拟放 B 柜）',448,582,752,37,N.calc,'#F2EDF8',20);
for(let g=0;g<2;g++)for(let j=0;j<8;j++){const q=port(460+g*384+j*19,571,N.calc,11);wire(calc[g][j],q,N.calc,'bottom','top');}
txt(s,'8×200GE',638,552,130,23,17,N.calc,true);txt(s,'8×200GE',1057,552,130,23,17,N.calc,true);
txt(s,'16 条光链路，双端共 32 个光模块',734,615,457,20,15,C.muted,false,'right');
notes(s,'机柜命名按最新反馈：A为6台通算既有机柜，B/C为两台910B及6台T4所在的两个10kW机柜。机柜B含910B-1、T4-1至3，机柜C含910B-2、T4-4至6。业务网和BMC网用横向汇总线表示同类节点的独立接入关系，横线不表示总线介质或设备串联。存储网明确连接A、B、C三柜，分别代表通算、910B和T4节点按需接入，每柜一条汇总示意线不等于每柜只有一个物理网口，也不代表新增机柜交换机。存储网仍保留可选状态，具体接口、带宽、设备台数、冗余与存储协议待确认。共享存储设备位置未指定。RoCE交换机1台拟放B柜，两台910B各8条200GE链路，16条光链路双端共32个光模块，T4不接入此计算通信组。机柜C至B跨柜布线。单台RoCE交换机不具备交换机级冗余。入口、防火墙、核心及接入交换设备为逻辑职责，复用及采购数量待核。未完成实机连通测试。硬件主题既有机柜字母将在统一编号时与本页保持一致。');}
await fs.mkdir(B,{recursive:true});
await(await PresentationFile.exportPptx(p)).save(B+'/candidate.pptx');
const im=await p.export({slide:p.slides.items[0],format:'png',scale:1.5});await fs.writeFile(B+'/draft.png',new Uint8Array(await im.arrayBuffer()));
