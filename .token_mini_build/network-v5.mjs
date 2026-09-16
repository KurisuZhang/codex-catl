import fs from 'node:fs/promises';
import {Presentation,PresentationFile} from '@oai/artifact-tool';
const B='/Users/lin/Desktop/catl/.token_mini_build/network-v5';
const C={navy:'#12304A',ink:'#233D50',teal:'#008E9C',blue:'#377BB5',muted:'#667B89',line:'#D4E0E6',bg:'#F8FAFB',pale:'#E6F3F4',white:'#FFFFFF',amber:'#9B641C'};
const F='Arial Unicode MS';
const p=Presentation.create({slideSize:{width:1280,height:720}});
const refs={t4:'https://www.nvidia.cn/content/dam/en-zz/Solutions/Data-Center/tesla-t4/t4-tensor-core-datasheet.pdf',roce:'https://e.huawei.com/cn/products/computing/ascend/atlas-800t-a2',optics:'https://e.huawei.com/cn/products/dcn-modules/200g',asc:'https://docs.vllm.ai/projects/ascend/en/latest/user_guide/support_matrix/supported_models.html',install:'https://docs.vllm.ai/projects/ascend/en/main/getting_started/installation.html',quant:'https://docs.vllm.ai/en/latest/features/quantization/',gpu:'https://docs.vllm.ai/en/latest/getting_started/installation/gpu/',trt:'https://nvidia.github.io/TensorRT-LLM/reference/support-matrix.html',qwen:'https://huggingface.co/Qwen/Qwen3-8B',awq:'https://huggingface.co/Qwen/Qwen2.5-7B-Instruct-AWQ',ds:'https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-32B',glm:'https://huggingface.co/zai-org/GLM-4.5-Air',yolo:'https://docs.ultralytics.com/models/yolo26',wan:'https://github.com/Wan-Video/Wan2.1',bench:'https://docs.vllm.ai/en/v0.27.0/cli/bench/serve/',metrics:'https://docs.vllm.ai/en/latest/api/vllm/benchmarks/serve/',price:'https://api-docs.deepseek.com/quick_start/pricing/'};
function box(s,x,y,w,h,fill=C.white,stroke=C.line){return s.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:h},fill,line:{fill:stroke,width:1}})}
function txt(s,v,x,y,w,h,size=26,color=C.ink,bold=false,align='left'){const a=s.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});a.text=v;a.text.style={typeface:F,fontSize:size,color,bold,alignment:align,verticalAlignment:'middle',wrap:'square',autoFit:'none',insets:{top:0,bottom:0,left:0,right:0}};return a;}
function rule(s,x,y,w,col=C.line){box(s,x,y,w,1,col,col)}
function node(s,v,x,y,w,h,fill=C.white,color=C.ink,size=24){const a=box(s,x,y,w,h,fill);a.borderRadius=5;a.text=v;a.text.style={typeface:F,fontSize:size,color,alignment:'center',verticalAlignment:'middle',autoFit:'none',insets:{left:10,right:10,top:5,bottom:5}};return a;}
function conn(s,a,b,color=C.teal,side='right',to='left'){s.shapes.connect(a,b,{kind:'elbow',fromSide:side,toSide:to,line:{fill:color,width:2},tail:{type:'triangle',width:'sm',length:'sm'}})}
const themes={2:'目录',3:'A1  硬件设备',4:'A1  硬件设备',5:'A2  网络拓扑',6:'A3  软件架构',7:'A3  软件架构',8:'A4  模型适配',9:'A4  模型适配',10:'A5  模型部署',11:'B1  性能测试',12:'B1  性能测试',13:'B2  Token 收益分析',14:'B2  Token 收益分析',15:'B3  商业协议',16:'B3  商业协议',17:'B4  公司流程',18:'B4  公司流程'};
const subtitles={2:'技术验证与商业验证的范围及评审目标',3:'双机柜资源配置：910B 分柜，T4 均衡布置',4:'功率与配套：逐柜整机峰值决定混装容量',5:'跨柜 RoCE：两台 910B 共用一台交换机',6:'生态与部署路径：软件依赖决定模型适配',7:'MASS 接入与计量：请求到用量的证据链',8:'910B 国产模型：先验证稠密模型，再扩候选',9:'T4 模型分工：文本、检测、视频分别验收',10:'部署与发布：以阶段证据作为上线门槛',11:'压测设计：分别扫描并发与请求到达率',12:'结果判读：服务目标约束下的可售产能',13:'产能估值：三类 Token 分别计算',14:'经济性判断：增量收支、全成本与盈亏边界',15:'计量与结算：请求如何形成双方认可的账单',16:'服务与责任：承诺范围匹配架构和实测能力',17:'协作与回款：各角色按凭证完成交接',18:'闭环验收：下一阶段通过条件与责任'};
function header(n,title,sub){let s=p.slides.add();s.background.fill=C.bg;txt(s,themes[n],60,28,1160,61,46,C.navy,true);txt(s,subtitles[n],62,96,1156,46,30,C.teal,true);txt(s,sub,62,148,1156,43,21,C.muted);rule(s,60,659,1160);txt(s,'token 魔方 Mini实验台',60,674,1000,22,15,C.muted);txt(s,String(n).padStart(2,'0')+' / 18',1105,674,115,22,15,C.muted,false,'right');return s;}

function takeaway(s,v){txt(s,v,62,600,1156,43,24,C.teal,true)}
function notes(s,v,keys=[]){s.speakerNotes.textFrame.setText(v+'\n\n资料查询日期：2026-09-16。方案报告，尚未执行设备部署、压测和交易。\n'+keys.map(k=>k+': '+refs[k]).join('\n'))}
const tableOwners=[];
function table(s,values,x,y,w,h,widths,size=23){tableOwners.push(p.slides.items.indexOf(s)+1);const t=s.tables.add({rows:values.length,columns:values[0].length,left:x,top:y,width:w,height:h,columnWidths:widths,values});t.borders.assign({style:'solid',fill:C.line,width:1});t.cells.block({row:0,column:0,rowCount:values.length,columnCount:values[0].length}).assign({textStyle:{fontSize:size,typeface:F,color:C.ink},margins:{left:13,right:12,top:2,bottom:2},anchor:'center'});for(let r=0;r<values.length;r++)for(let c=0;c<values[0].length;c++){let z=t.getCell(r,c);z.fill=r===0?C.navy:(r%2?C.white:'#EDF4F6');z.text.style={fontSize:size,typeface:F,color:r===0?C.white:C.ink,bold:r===0||c===0};}t.rows[0].height=48;for(let r=1;r<values.length;r++)t.rows[r].height=(h-48)/(values.length-1);return t;}
// 5
{
let s=header(5,'网络拓扑','已确认：1 台 RoCE 交换机、16 条 200GE 链路、双端 32 个光模块。');
const N={biz:'#628E3D',mg:'#159CB7',calc:'#77429B',storage:'#317ABD',core:'#DC803E'};
function wire(a,b,color,from='bottom',to='top',dash=false){return s.shapes.connect(a,b,{kind:'straight',fromSide:from,toSide:to,line:{fill:color,width:1.3,style:dash?'dashed':'solid'}})}
function port(x,y,w=13,col=N.calc,label=''){let a=node(s,label,x,y,w,14,col,C.white,9);a.text.style={typeface:F,fontSize:9,color:C.white,alignment:'center',verticalAlignment:'middle',autoFit:'none',insets:{top:0,bottom:0,left:0,right:0}};return a;}
let ext=node(s,'目标平台 / Internet / 压测入口',451,194,362,32,'#E8F0F9',C.navy,20);
let fw=node(s,'边界防火墙 / 访问控制（复用或补齐）',451,239,362,32,'#F1F5E8',C.ink,18);

wire(ext,fw,N.core);
let ops=node(s,'运维入口 / 管理区',61,241,273,32,'#E7F5FA',C.ink,20);
let mg=node(s,'BMC 带外管理接入交换设备',104,351,313,35,'#D9F2FA',C.ink,20);
let biz=node(s,'业务网接入交换设备',698,351,314,35,'#EDF5E2',C.ink,20);
wire(ops,mg,N.mg);wire(fw,biz,N.biz);
txt(s,'交换设备\n管理口接入带外',63,292,145,48,17,C.muted);
// Legend uses network roles; only RoCE link speed is confirmed.
for(const [i,col,v] of [[0,N.biz,'业务网：速率待盘点'],[1,N.mg,'BMC 网：速率待盘点'],[2,N.calc,'RoCE：200GE'],[3,N.storage,'存储网：可选']]){box(s,909,202+i*29,37,3,col,col);txt(s,v,957,192+i*29,276,24,17,C.ink);}
// Existing CPU rack and the two planned accelerator racks.
box(s,59,428,302,110,'none');box(s,380,428,404,110,'none');box(s,804,428,417,110,'none');

txt(s,'机柜 A · 通算 ×6',65,510,285,25,18,C.navy,true,'center');
txt(s,'机柜 B / 10 kW',625,510,153,25,17,C.navy,true,'center');
txt(s,'机柜 C / 10 kW',1055,510,157,25,17,C.navy,true,'center');
const machines=[
{x:70,w:82,t:'通算 1',kind:'cpu'},{x:165,w:90,t:'通算 2…5',kind:'cpu'},{x:268,w:82,t:'通算 6',kind:'cpu'},
{x:392,w:136,t:'910B-1 / 8 卡\n8×200GE',kind:'npu'},{x:540,w:73,t:'T4-1\n8 卡',kind:'gpu'},{x:619,w:73,t:'T4-2\n8 卡',kind:'gpu'},{x:698,w:73,t:'T4-3\n8 卡',kind:'gpu'},
{x:816,w:136,t:'910B-2 / 8 卡\n8×200GE',kind:'npu'},{x:964,w:73,t:'T4-4\n8 卡',kind:'gpu'},{x:1043,w:73,t:'T4-5\n8 卡',kind:'gpu'},{x:1122,w:86,t:'T4-6\n8 卡',kind:'gpu'}];
const rocePorts=[];const storagePorts=[];
for(const m of machines){
const bp=port(m.x+12,431,14,N.mg);const dp=port(m.x+30,431,14,N.biz);
wire(mg,bp,N.mg);wire(biz,dp,N.biz);
node(s,m.t,m.x,448,m.w,49,m.kind==='npu'?'#EDE4F5':m.kind==='gpu'?'#EAF1F8':'#E3EBF4',C.ink,m.kind==='cpu'?17:18);
if(m.kind==='npu'){let ports=[];for(let j=0;j<8;j++)ports.push(port(m.x+4+j*16,497,13,N.calc,String(j+1)));rocePorts.push(ports);}

}
// 16 physical links, 16 server-side modules and 16 switch-side modules.
const sw=node(s,'RoCE 交换机 ×1（拟放 B 柜）',513,593,513,33,'#EDE4F5',C.ink,20);
for(let group=0;group<2;group++){for(let j=0;j<8;j++){const q=port(540+group*255+j*25,579,18,N.calc,String(group*8+j+1));wire(rocePorts[group][j],q,N.calc);}}
txt(s,'16×200GE',1045,593,172,26,18,N.calc,true);
let stor=node(s,'共享 / 对象存储（可选）\n连接 A / B / C 三柜',61,583,343,43,'#E7EFF9',C.ink,19);
// One aggregated dashed connection per rack represents its nodes' storage access.
for(const x of [315,760,1193]){
 const q=port(x-6,532,13,N.storage);
 wire(q,stor,N.storage,'bottom','top',true);
}



txt(s,'业务 / BMC 逐节点连线，存储网逐柜连线；RoCE 共 16 条物理链路。非 RoCE 设备规格待核定。',62,632,1154,23,17,C.muted);
notes(s,'机柜命名按最新反馈：A为6台通算既有机柜，B/C为两台910B及6台T4所在的两个10kW机柜。机柜B含910B-1、T4-1至3，机柜C含910B-2、T4-4至6。业务网和BMC网以交换设备到各代表节点的独立连线展示。通算2…5代表4台分别接入的服务器。存储网明确连接A、B、C三柜，分别代表通算、910B和T4节点按需接入，每柜一条汇总示意线不等于每柜只有一个物理网口，也不代表新增机柜交换机。存储网仍保留可选状态，具体接口、带宽、设备台数、冗余与存储协议待确认。共享存储设备位置未指定。RoCE交换机1台拟放B柜，两台910B各8条200GE链路，16条光链路双端共32个光模块，T4不接入此计算通信组。机柜C至B跨柜布线。单台RoCE交换机不具备交换机级冗余。入口、防火墙及接入交换设备为逻辑职责，复用及采购数量待核。按用户最新要求移除核心/业务汇聚层，边界防火墙直接连接业务接入交换设备。未完成实机连通测试。硬件主题既有机柜字母将在统一编号时与本页保持一致。');}
await fs.mkdir(B,{recursive:true});
await(await PresentationFile.exportPptx(p)).save(B+'/candidate.pptx');
const im=await p.export({slide:p.slides.items[0],format:'png',scale:1.5});await fs.writeFile(B+'/draft.png',new Uint8Array(await im.arrayBuffer()));
