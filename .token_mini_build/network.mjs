import fs from 'node:fs/promises';
import {Presentation,PresentationFile} from '@oai/artifact-tool';
const B='/Users/lin/Desktop/catl/.token_mini_build';
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
// 1
{
let s=p.slides.add();s.background.fill=C.bg;
txt(s,'token 魔方\nMini实验台',70,142,1120,200,72,C.navy,true);
txt(s,'Token 生产与平台销售闭环验证',74,385,1110,60,34,C.teal);
rule(s,74,520,1128);
txt(s,'prepare:张帅',74,568,800,40,27);txt(s,'2026年9月16日',74,621,900,32,24,C.muted);
notes(s,'内部立项与跨部门评审。依据已确认的执行文档v1.5制作，保留11个主题，合计18页。');}
// 2
{
let s=header(2,'验证范围与评审目标','首轮用一个文本服务贯通生产、计量与平台对账，再验证真实结算回款。');
txt(s,'A  技术验证',64,214,540,48,33,C.teal,true);txt(s,'B  商业验证',668,214,550,48,33,C.blue,true);
txt(s,'硬件设备与功率边界\n网络拓扑与跨柜 RoCE\n软件架构与 MASS 接入\n模型适配与部署验收',65,288,530,208,28);
txt(s,'性能测算与可售产能\nToken 收益与盈亏边界\n商业协议与结算证据\n公司流程与回款验收',669,288,542,208,28);
rule(s,62,533,1155);txt(s,'本次评审形成：首轮服务范围、必补资源资料、平台试供给通过条件。',63,555,1155,62,27,C.navy,true);
notes(s,'优先建议Qwen3-8B作为910B文本联调候选，具体平台采购规格尚未确认。YOLO和Wan独立PoC，不阻塞首个文本计量案例。技术验证完成不代表商业闭环完成。');}
// 3
{
let s=header(3,'两台 910B 分柜，形成两个独立算力资源池','已确认 14 台服务器：16 张 910B NPU、48 张 T4 GPU及 6 台通算服务器。');
for(let k=0;k<2;k++){let x=64+k*260;box(s,x,211,236,363,'#EDF3F6');txt(s,'机柜 '+(k?'B':'A')+'  /  10 kW',x+10,220,216,40,24,C.navy,true,'center');node(s,'910B 服务器 ×1\n8 张 NPU',x+16,277,204,81,C.pale,C.teal);for(let j=0;j<3;j++)node(s,'T4 ×1  /  8 张 GPU',x+16,372+j*49,204,40,C.white,C.blue,20);}
table(s,[['设备','数量与核心配置'],['昇腾 910B','2 台 × 8 张 NPU\n子型号与显存待盘点'],['NVIDIA T4','6 台 × 8 张 GPU\n单卡 16GB GDDR6'],['通算服务器','6 台，已有机柜\nCPU / 内存 / 系统盘 / 数据盘'],['RoCE 与光链路','1 台交换机，16 条链路\n32 个 200GE 光模块']],605,211,614,363,[190,424],23);
takeaway(s,'每柜 1 台 910B＋3 台八卡 T4 为拟议装载，须通过整机功率和安装核验。');
notes(s,'机柜图为资源布置示意，不代表U位尺寸。通算服务器仅列配置类别，不画进两新柜。910B整机单台超过5kW为用户输入，因此两台不可装入同一10kW机柜。卡数计算2×8=16，6×8=48。T4多卡显存不是天然连续显存。RoCE交换机拟放A柜，图上不占服务器槽，功率另计。',['t4']);}
// 4
{
let s=header(4,'混装能否上线，取决于逐柜整机峰值预算','10 kW 是机柜容量等级。八卡 T4 的 CPU、风扇和电源损耗都要纳入。');
txt(s,'P910B + 3 × PT4 + P网络 + P预留 ≤ P机柜可用',65,214,1150,66,33,C.teal,true);
table(s,[['配套类别','上线前必备项','核验重点'],['整机与存储','机箱、主板、CPU、内存、风扇、冗余电源\n系统盘、模型/日志盘、按需磁盘控制器','八卡槽位、PCIe / Riser\n峰值功耗与散热'],['网络与光纤','业务网卡、BMC 口、业务/管理交换机\nRoCE 交换机、32 个光模块、16 组光纤','端口、上联线缆、管理网线\n速率、接口和距离'],['机柜与机房','导轨、PDU、电源线、接地、理线\n供电回路、UPS、制冷','持续容量、U 位、承重\n冗余供电工况'],['既有 / 可选','6 台通算配套按现状盘点\n可选共享存储、备份及存储网','复用边界、留存需求\n不重复新增机柜']],60,285,1160,304,[190,603,367],22);
takeaway(s,'上架门槛：设备/运维提供两柜功率表和配件差缺清单，超限则调整 T4 分布。');
notes(s,'P均为相应整机/设备的设计负载峰值，不能用GPU板卡功耗代替整机，不能将冗余PSU铭牌额定值简单相加。P机柜可用由机房在回路、PDU、故障供电及制冷条件下确认，不自动等于标称10kW。A柜网络负载含RoCE交换机，B柜按实际驻留设备计。覆盖14台整机及网络设备管理。');}
// 5
{
let s=header(5,'网络拓扑','已确认：1 台 RoCE 交换机、16 条 200GE 链路、双端 32 个光模块。');
const N={biz:'#73A943',mg:'#139CC9',calc:'#77429B',storage:'#317ABD',core:'#DC803E'};
function wire(a,b,color,from='bottom',to='top',dash=false){return s.shapes.connect(a,b,{kind:'straight',fromSide:from,toSide:to,line:{fill:color,width:1.3,style:dash?'dashed':'solid'}})}
function port(x,y,w=13,col=N.calc,label=''){let a=node(s,label,x,y,w,14,col,C.white,9);a.text.style={typeface:F,fontSize:9,color:C.white,alignment:'center',verticalAlignment:'middle',autoFit:'none',insets:{top:0,bottom:0,left:0,right:0}};return a;}
let ext=node(s,'目标平台 / Internet / 压测入口',451,194,362,32,'#E8F0F9',C.navy,20);
let fw=node(s,'边界防火墙 / 访问控制（复用或补齐）',451,239,362,32,'#F1F5E8',C.ink,18);
let core=node(s,'核心 / 业务汇聚交换设备',451,285,362,32,'#FBECDD',C.ink,20);
wire(ext,fw,N.core);wire(fw,core,N.core);
let ops=node(s,'运维入口 / 管理区',61,241,273,32,'#E7F5FA',C.ink,20);
let mg=node(s,'BMC 带外管理接入交换设备',104,351,313,35,'#D9F2FA',C.ink,20);
let biz=node(s,'业务网接入交换设备',698,351,314,35,'#EDF5E2',C.ink,20);
wire(ops,mg,N.mg);wire(core,biz,N.biz);
txt(s,'交换设备\n管理口接入带外',63,292,145,48,17,C.muted);
// Legend uses network roles; only RoCE link speed is confirmed.
for(const [i,col,v] of [[0,N.biz,'业务网：速率待盘点'],[1,N.mg,'BMC 网：速率待盘点'],[2,N.calc,'RoCE：200GE'],[3,N.storage,'存储网：可选 / 虚线']]){box(s,909,202+i*29,37,3,col,col);txt(s,v,957,192+i*29,276,24,17,C.ink);}
// Existing CPU rack and the two planned accelerator racks.
box(s,59,428,302,110,'#F0F4F7');box(s,380,428,404,110,'#F1F7F7');box(s,804,428,417,110,'#F1F7F7');

txt(s,'A 柜 / 10 kW',629,509,150,25,17,C.muted,true,'center');
txt(s,'B 柜 / 10 kW',1065,509,150,25,17,C.muted,true,'center');
const machines=[
{x:70,w:82,t:'通算 1',kind:'cpu'},{x:165,w:90,t:'通算 2…5',kind:'cpu'},{x:268,w:82,t:'通算 6',kind:'cpu'},
{x:392,w:136,t:'910B-A / 8 卡\n8×200GE',kind:'npu'},{x:540,w:73,t:'T4-1\n8 卡',kind:'gpu'},{x:619,w:73,t:'T4-2\n8 卡',kind:'gpu'},{x:698,w:73,t:'T4-3\n8 卡',kind:'gpu'},
{x:816,w:136,t:'910B-B / 8 卡\n8×200GE',kind:'npu'},{x:964,w:73,t:'T4-4\n8 卡',kind:'gpu'},{x:1043,w:73,t:'T4-5\n8 卡',kind:'gpu'},{x:1122,w:86,t:'T4-6\n8 卡',kind:'gpu'}];
const rocePorts=[];const storagePorts=[];
for(const m of machines){
const bp=port(m.x+12,431,14,N.mg);const dp=port(m.x+30,431,14,N.biz);
wire(mg,bp,N.mg);wire(biz,dp,N.biz);
node(s,m.t,m.x,448,m.w,49,m.kind==='npu'?'#EDE4F5':m.kind==='gpu'?'#EAF1F8':'#E3EBF4',C.ink,m.kind==='cpu'?17:18);
if(m.kind==='npu'){let ports=[];for(let j=0;j<8;j++)ports.push(port(m.x+4+j*16,497,13,N.calc,String(j+1)));rocePorts.push(ports);}
if(m.kind==='cpu')storagePorts.push(port(m.x+52,497,14,N.storage));
}
// 16 physical links, 16 server-side modules and 16 switch-side modules.
const sw=node(s,'RoCE 交换机 ×1（拟放 A 柜）',513,593,513,33,'#EDE4F5',C.ink,20);
for(let group=0;group<2;group++){for(let j=0;j<8;j++){const q=port(540+group*255+j*25,579,18,N.calc,String(group*8+j+1));wire(rocePorts[group][j],q,N.calc);}}
txt(s,'跨柜光纤',1045,560,172,26,18,N.calc,true);
let stor=node(s,'可选存储网 / 共享存储\n通算及加速节点按需接入',61,583,343,43,'#E7EFF9',C.ink,19);for(const q of storagePorts)wire(q,stor,N.storage,'bottom','top',true);

txt(s,'接入层为逻辑设备组，数量、冗余与速率待盘点。6 台通算已有机柜，承载 MASS 等；混装须核验功率。',62,632,1154,23,17,C.muted);
notes(s,'按用户参考图的分层拓扑画法改绘，保留本项目规模。层级：平台入口、边界访问控制、核心业务汇聚、带外与业务接入、服务器端口、RoCE及可选存储。图中防火墙、核心/业务/管理交换设备是复用或补齐的逻辑职责，不代表已确认新增采购数量，实际可合并或按冗余需求拆分。运维管理区独立接入BMC网，不将BMC暴露在业务入口。每个代表服务器上方青色/绿色小口分别为BMC/业务；中间通算2…5代表四台同配置接入关系，总通算6台。T4全部六台逐台展示，每台8卡。两台910B各8条200GE实际光链路连接同一RoCE交换机，交换机侧端口1–16编号仅作接线示意，待实际端口映射确认。16条链路需要双端32个模块。交换机拟放A柜，B柜8条跨柜；没有额外Spine交换机，不具备交换机级冗余。紫线只连910B，不将T4接入HCCL通信组。业务/BMC速率未知，不照搬参考图的1G/25G/400G。可选存储图中绘制通算侧示意，910B/T4按需要另接存储交换机。光纤、模块、距离、FEC/MTU、IP、PFC/ECN及HCCL按设备兼容方案验证。图为拟议方案，未声称已完成连通与带宽测试。参考图仅用于布局风格，不照搬其设备或规格。',['roce','optics']);}
// 6
{
let s=header(6,'生态差异决定模型的部署路径','完整版本组合需要匹配驱动、运行时、模型算子和推理引擎。');
table(s,[['层次','NVIDIA T4 路径','昇腾 910B 路径'],['硬件与设备','驱动、容器设备支持\nT4 / SM75','驱动、固件、容器设备映射\n910B 子型号待核'],['运行时与通信','CUDA、计算库、NCCL','CANN、算子库、HCCL'],['框架与模型','PyTorch、Transformers\n量化权重及兼容 kernel','PyTorch + torch_npu 等适配\n量化与算子工具链'],['任务与引擎','文本：兼容 vLLM\nYOLO：ONNX / TensorRT\nWan：官方推理流程','国产文本：vLLM Ascend\n或 MindIE 对应路径\n按模型单独验证']],60,209,1160,366,[190,485,485],24);
takeaway(s,'先冻结可运行镜像再扩功能。T4 的 TensorRT 路径不能推导为 TensorRT-LLM 支持。');
notes(s,'两列为候选替代路径，不要求全部组件同时安装。T4支持FP16及经核验的INT4/INT8路径；BF16/FP8原生能力不能按新卡假定。CUDA专用kernel无法直接搬到Ascend。固定OS/CPU架构、驱动、固件、CUDA或CANN、框架、引擎和镜像digest，按选定release支持矩阵验收。当前文档快照只是研究来源，不宣称latest镜像已在本机验证。vLLM不作为YOLO或Wan统一引擎。',['gpu','quant','trt','install']);}
// 7
{
let s=header(7,'MASS 接入要保留从请求到用量的证据','6 台既有通算承载逻辑组件，具体能力归属和逐台部署待平台文档确认。');
let ctl=node(s,'管理配置：模型登记、资源配额、版本发布',63,212,1156,53,'#EDF1F4',C.muted);
const ns=[node(s,'平台请求\n租户 / 请求 ID',63,319,224,82),node(s,'接入鉴权\n模型路由 / 限流',349,319,263,82),node(s,'910B / T4 推理服务\n模型与版本',681,319,295,82,C.pale),node(s,'服务结果',1033,319,185,82)];for(let i=0;i<3;i++)conn(s,ns[i],ns[i+1],C.blue);s.shapes.connect(ctl,ns[2],{kind:'elbow',fromSide:'bottom',toSide:'top',line:{style:'dashed',fill:C.muted,width:1.5}});
const us=[node(s,'原始用量事件\n输入 / 输出 / 缓存',348,480,264,82),node(s,'去重与规则计算\n保留原始记录',681,480,295,82),node(s,'账单明细\n对账差异',1033,480,185,82)];conn(s,ns[2],us[0],C.teal,'bottom','top');conn(s,us[0],us[1]);conn(s,us[1],us[2]);txt(s,'拟集成职责\nMASS 已有能力\n需逐项核对',64,467,241,105,24,C.muted);
takeaway(s,'同一请求 ID 关联版本、状态、用量与账单。事件去重和重试计费分别处理。');
notes(s,'图为逻辑架构，未声称全部功能属于MASS或已部署。管理/配置、请求、计量三个职责分开。计量字段：tenant_id、request_id、attempt_id、event_id、model/version、tokenizer版本、开始结束时间、状态、input/output/cache_hit/cache_miss、规则版本、原始证据引用。缓存量按双方计费规则核对，框架缓存块计数不得直接当计费Token。YOLO与Wan使用task_id和图片/视频任务单位。');}
// 8
{
let s=header(8,'910B 先完成一个稠密模型，再扩国产候选','筛选顺序：许可与平台规格、引擎支持、逐卡容量、通信、质量与负载验证。');
table(s,[['候选模型','精度与起测路径','本轮判断与证据边界'],['Qwen / Qwen3-8B','BF16 或 FP16\n短上下文、低并发起测','建议首个文本联调候选\n官方 A2/A3 家族支持'],['DeepSeek-R1-\nDistill-Qwen-32B','16 位或适配量化\n先核算权重＋KV＋工作区','进入条件性 PoC\n蒸馏家族为实验性适配'],['zai-org / GLM-4.5-Air','16 位或匹配 W8A8 路径\n核对 MoE 分片和通信','容量核验后再启动\n家族支持不等于本台成功']],60,213,1160,299,[370,372,418],23);
txt(s,'逐卡峰值 = 本卡权重＋KV Cache＋激活/工作区＋通信缓冲＋余量',64,532,1150,52,27,C.navy,true);
takeaway(s,'16 张卡是资源总量。910B 显存未知，暂不承诺完整 DeepSeek 大模型的双机容量。');
notes(s,'固定候选ID：Qwen/Qwen3-8B；deepseek-ai/DeepSeek-R1-Distill-Qwen-32B；zai-org/GLM-4.5-Air。权重revision/hash、目标引擎release与镜像digest待设备验证阶段冻结，不能把研究候选称为已验收配置。Qwen3-Dense在当前A2/A3矩阵支持；DeepSeek Distill标为experimental。GLM-4.5-Air主干总参数106B、激活12B，仓库张量统计约110B，容量以实际权重字节与加载策略为准，不能按激活参数估算。优先单机支持的并行配置，只有容量或性能需要时再双机HCCL。备选完整DeepSeek-R1/V3.2须另算量化/双机容量，当前不承诺。所有模型均未本机实测。',['asc','qwen','ds','glm']);}
// 9
{
let s=header(9,'T4 按三类任务部署，分别验证交付能力','6 台八卡服务器共 48 张 GPU。单卡 16GB，多副本和多卡并行按任务选择。');
table(s,[['任务 / 首选候选','起测路径','验收指标与判断'],['量化文本\nQwen2.5-7B-Instruct-AWQ','vLLM + 兼容 AWQ kernel\nFP16 激活，先单卡短上下文','质量、TTFT / TPOT、Token/s\n优先 PoC，实机待验'],['目标检测\nYOLO26n','PyTorch 基线\nONNX / TensorRT 优化','mAP、召回率、端到端延迟\n图片/帧吞吐，复验 T4 参考'],['视频生成\nWan2.1-T2V-1.3B','官方流程与必要卸载\n核验 dtype / attention 后端','质量、分辨率/帧数/步数\n生成耗时、视频/小时\n条件性 PoC']],60,211,1160,346,[365,385,410],23);
takeaway(s,'文本模型按总参数 <20B 筛选。Wan 低显存参考不能证明 T4 的生成速度可交付。');
notes(s,'完整ID：Qwen/Qwen2.5-7B-Instruct-AWQ，Ultralytics YOLO26n，Wan-AI/Wan2.1-T2V-1.3B。7B AWQ先验证单卡容量与SM75 kernel，不保证任意上下文/并发。量化只降低字节数，不减少参数量。可增加同系列14B量化作为备选，需重新核验。YOLO官方表有T4/TensorRT列，不搬用其速度作为本台结果；模型/软件许可及商用供给方式待核。Wan仓库低显存参考约8.19GB，非T4完整兼容证据，需检验FP16数值、注意力后端和卸载开销；不搬用4090速度。各任务固定独立镜像，不默认TP8。48卡在任务之间按卡时分配，不重复满额计收入。',['t4','awq','quant','yolo','wan']);}
// 10
{
let s=header(10,'模型发布以阶段证据为门槛','部署流程从设备验收开始，到可回退的服务版本结束。以下为待执行流程。');
const steps=[['01  设备与网络','资产与健康记录\n功率 / 光链路 / HCCL'],['02  环境与模型','镜像与权重校验\n许可 / Tokenizer / 模板'],['03  服务启动','精度 / 上下文 / 并行\n健康检查与启动日志'],['04  正确性','中文 / 多轮 / 流式\n质量集与异常请求'],['05  MASS 与平台','鉴权 / 路由 / 计量\n同批请求联调记录'],['06  性能与发布','稳定性 / 限流 / 恢复\n配额、告警与回退版本']];
for(let i=0;i<6;i++){let col=i%3,row=Math.floor(i/3),x=62+col*401,y=217+row*169;txt(s,steps[i][0],x,y,367,45,29,C.teal,true);txt(s,steps[i][1],x,y+54,365,84,25);rule(s,x,y+148,361);}
takeaway(s,'每阶段不通过即定位修复并回归。可发布产物是版本包、验收记录与回退配置。');
notes(s,'建议操作记录包含nvidia-smi或npu-smi设备识别、每台8卡、PCIe/NUMA与网络，版本与镜像digest，模型文件hash与许可证。服务配置固定max_model_len、精度、量化、TP/PP/副本及CPU/内存限制。文本验证流式chunk边界、模板、截断、超时和输入输出计数。YOLO额外核验预/后处理、类别和坐标；Wan异步队列、任务状态、生成参数及结果文件交付。单模型成功不能外推所有候选。');}
// 11
{
let s=header(11,'压测同时扫描并发与请求到达率','先固定模型、任务规格和服务目标，再从单实例扩到资源池和平台入口。');
txt(s,'并发初探',63,209,288,45,29,C.teal,true);txt(s,'1 / 2 / 4 / 8 / 16 / 32',358,210,860,46,33,C.navy,true);
txt(s,'四类输入输出组合，分别测试未命中与重复前缀。边界未出现时继续加压。',64,267,1147,55,25);
node(s,'vllm bench serve --backend openai\n--model <服务模型> --base-url <地址>\n--max-concurrency 8 --request-rate inf\n--save-result --save-detailed',62,341,691,208,C.navy,C.white,24);
txt(s,'执行与记录',801,345,400,42,29,C.teal,true);txt(s,'预热后至少重复 3 次\n记录样本数和测试窗口\n保留实际到达率与错误率\n检查客户端和接入层瓶颈',801,399,403,143,24);
takeaway(s,'完整可复制脚本在备注及随附文件。示例参数是初探设定，正式阈值由平台需求确定。');
notes(s,'采用vLLM 0.27.0 CLI文档核验客户端参数，客户端版本与服务器版本可不同。正式执行先vllm --version及vllm bench serve --help。完整脚本见交付benchmark_template.sh，默认本地无认证端点，外部平台需按实际鉴权接入。初探随机输入长度256/输出128、1024/128、256/512、1024/512，随机负载不替代真实质量集。缓存场景用固定可重复前缀数据集并通过服务端计数确认，随机数据不能声称缓存命中。请求率实验单独设置1/2/4…req/s，实际率受并发上限影响。正式质量阈值、TTFT/TPOT及成功率先约定，小样本P99不做可靠尾延迟承诺。',['bench','metrics']);}
// 12
{
let s=header(12,'可售产能来自满足质量与延迟条件的负载','结果判读方法：在同一请求集合、同一统计窗口内汇总，当前没有实测结果。');
table(s,[['指标','计算或判读','对经营测算的影响'],['TTFT / TPOT','TTFT：发出请求到首 Token\nTPOT：(末到达时刻−首到达时刻)\n÷ (输出 Token 数−1)','TTFT 含排队与网络\n纯 Prefill 耗时需服务端 trace'],['并发与吞吐','报告实际并发、到达率、成功率\n输入/输出 Token 数 ÷ 窗口秒数','选择满足服务目标的稳定负载\n避免只取无约束峰值'],['计费 Token/s','同一窗口分别汇总合格输出\n未命中输入、命中输入','request_goodput 单位是请求/s\n缓存块数需映射为计费 Token'],['YOLO / Wan','检测质量＋图片/帧吞吐\n视频质量＋任务数/小时','按任务规格单独计价\n不套文本 Token 指标']],60,200,1160,382,[198,475,487],23);
takeaway(s,'产能交付表应绑定模型版本、卡数、任务规格、SLO、样本数和原始用量证据。');
notes(s,'TPOT仅用于输出Token数≥2的样本，stream chunk不等于Token。统计所有请求错误与超时，分位数记录样本量。合格Token/s采用事先约定的合格请求集合，质量门槛不能仅靠客户端耗时替代。输入总数=命中+未命中（按约定计费边界）。client request_goodput为满足SLO请求数/秒，不能直接代入Token公式；输出吞吐是实际输出Token/秒。单卡吞吐不线性外推48卡，分别实测资源池和MASS入口。',['metrics','bench']);}
// 13
{
let s=header(13,'三类 Token 分别估值，采购价决定可结算收入','以下为产能计算口径。S = 30×24×3600 = 2,592,000 秒。');
txt(s,'Decode 月价值 = TGSout × S × Nout × Pout ÷ 10⁶ × ηout\n未命中 Prefill 月价值 = TGSunc × S × Nunc × Punc ÷ 10⁶ × ηunc\n命中 Prefill 月价值 = TGScache × S × Ncache × Pcache ÷ 10⁶ × ηcache',63,207,1155,149,27,C.navy,true);
table(s,[['公开市场参照（USD / 百万 Token）','输出','输入未命中','输入命中'],['DeepSeek-V4.1-Flash  高峰','1.20','0.30','0.006'],['DeepSeek-V4.1-Flash  非高峰','0.60','0.15','0.003']],60,391,1160,150,[596,172,215,177],22);
txt(s,'价格查询：2026-09-16，仅作市场参照。该 API 与本台候选并非同一模型，不能代入报价。',64,554,1145,38,21,C.muted);
takeaway(s,'TGS 按单卡才乘卡数；混合部署三类速率共用同一负载，已含损耗时不再乘同一 η。');
notes(s,'原公式完整保留：Decode集群月价值=Decode TGS×30×24×3600×Decode GPU总卡数×Decode单价/1000000×产出率。Prefill非命中与cache各用相应TGS、GPU总卡数、单价及计费产出率。910B资源卡为NPU，N泛指该资源池实际参与卡数。若直接使用集群Token/s则不再乘N。Mini基线Prefill/Decode混合部署，三类产能来自同一工作负载，不相加独立压测峰值。缓存TGS为可计费逻辑命中Token速率，不代表实际执行完整Prefill。η仅反映未在测量中体现的可用性/需求/可计费损失，避免重复打折。市场价格适用deepseek-flash(DeepSeek-V4.1-Flash)，高峰UTC工作日01:00–04:00及06:00–10:00，其余非高峰。公开API美元零售价不是本项目平台采购价，且与首选Qwen3-8B及蒸馏模型不同，不可直接估收入。YOLO按图片/任务，Wan按视频任务或合同单位另算。实际结算=双方认可用量×约定采购价±调整，实际回款以银行凭证为准。',['price']);}
// 14
{
let s=header(14,'是否值得供给，要同时看增量收支和全成本','缺少实测产能、采购价与成本，当前能够给出盈亏条件，不能给出确定利润。');
txt(s,'月经营结果 = 文本收入＋检测收入＋视频收入−项目成本',65,211,1150,63,33,C.teal,true);
table(s,[['决策视角','纳入成本','能回答的问题'],['增量运营收支','新增电费、网络、机房与运维\n按实际承担范围计入','已有设备试供给\n能否覆盖新增现金支出'],['全成本经营结果','增量成本＋折旧/租赁\n既有通算和机柜的约定分摊','持续经营与后续扩容\n是否具备经济性']],60,302,1160,199,[225,559,376],24);
txt(s,'盈亏边界：固定业务组合时，采购价系数 k* = 月成本 ÷ 基准月收入',64,526,1152,41,26,C.navy,true);
takeaway(s,'采购价、需求利用、缓存比例和卡时分配分别做敏感性分析，资源重分配后需重测产能。');
notes(s,'令R0是同一模型组合、同币种税口径、固定卡时与负载下以基准采购价计算的月收入，若三类单价同比例乘k且成本不变，则盈亏k*=C/R0；R0=0时无此边界。若收入uRfull、成本F+uV，则u*=F/(Rfull−V)，仅当Rfull>V且u*≤1才存在该区间的盈亏可能。缓存比例改变会影响计费价格和产能，不可只改一个数就声称真实利润。月电量=实测平均kW×小时，机柜10kW不是持续负载。CAPEX与折旧不得同月重复全额计成本。实际T4卡时在文本/检测/视频间分配，总和不超过48张×可用时间。利润、应收与回款分别记录；共享CPU机柜已有资源按项目分摊，避免重复新增。');}
// 15
{
let s=header(15,'计量约定决定一条请求能否成为账单','拟议条款从平台接受的服务目录开始，连接双方认可的用量证据。');
const lab=['服务目录\n模型 / 任务规格','请求或任务\n统一关联 ID','用量明细\n计数与状态','对账确认\n差异与冲正','结算条目\n单价与周期'];let prev;for(let i=0;i<5;i++){let a=node(s,lab[i],62+i*237,218,211,95,i===4?C.pale:C.white);if(prev)conn(s,prev,a);prev=a;}
table(s,[['必须约定','拟议处理方式','留存证据'],['输入、输出与缓存','统一 Tokenizer 和缓存定义\n三类单价、币种税费分别写明','规则版本、原始计数\n平台与供应方明细'],['超时、重试、部分输出','逐类约定是否计费\n重复事件去重，重试保留关联','attempt ID、状态\n实际交付量与异常记录'],['对账差异与结算','确定权威依据、核验时限\n冲正、补结算和账期','差异单、确认单\n结算单与调整记录']],60,338,1160,246,[248,528,384],23);
takeaway(s,'技术可运行仍需平台认可模型、区域、容量与质量规格，才具备采购前提。');
notes(s,'本页为商务讨论清单，并非已签协议或法律意见。首批用同一请求样本比对Tokenizer、推理返回usage、接入记录及平台账单。需约定失败/取消/重试/部分输出及缓存口径，不能由技术默认免费或收费。检测/视频分别约定规格、质量、任务单位及价格。合同还需价格变更、税费、付款账户、争议处理和开票要求，以双方最终文本为准。');}
// 16
{
let s=header(16,'服务承诺应受当前架构和实测能力约束','拟议协议在可验收范围内确定服务窗口、维护、故障处理与责任。');
table(s,[['当前约束','需要约定的边界','验收与责任证据'],['一台 RoCE 交换机','无交换机级冗余\n维护窗口、故障响应与赔付边界','故障演练与恢复记录\n运维联系人和升级路径'],['性能尚未实测','绑定模型、精度、上下文与配额\n以验收负载确定服务目标','双方验收报告\n监控口径与限流记录'],['模型与版本会变化','变更审批、回归测试和回退\n禁用不满足许可的供给方式','模型权利依据\n版本清单与发布记录'],['数据、暂停与退出','用途、留存、权限和责任分工\n余额清算、数据处理与开票回款','访问与删除记录\n最终对账单及回款凭证']],60,214,1160,365,[248,504,408],24);
takeaway(s,'SLA 数值和赔付条款留待验收及双方协商，现阶段不承诺未经验证的可用性。');
notes(s,'拟议条款由商务/法务/财务评审。单交换机故障可能影响双机并行服务，同一资源池内独立单机服务的影响依赖网络与路由。合同约定故障责任归属、供应方与平台侧原因判定、不可用统计、维护排除项、赔付上限、退出与余额清算。数据最小留存及安全职责按实际数据和适用制度审查，不假定客户数据可任意留存或用于训练。');}
// 17
{
let s=header(17,'公司交接以凭证推进，直至开票与回款','建议流程：技术、商务和财务在每个阶段明确接收什么产物。');
table(s,[['责任角色','立项与准备','验收与试供给','月度经营与回款'],['项目负责人','资源与预算确认\n首轮范围批准','阶段评审\n试供给决策','经营复盘\n后续资源决策'],['技术 / 运维','设备、网络和模型\n版本与部署记录','质量/压测验收\n接入、发布与回退','用量明细与告警\n差异核验与复测'],['商务 / 法务','平台采购规格\n模型与服务权利','报价和合同评审\n双方验收确认','对账确认与争议\n逾期跟进与变更'],['财务','成本边界与预算\n价格口径核对','报价及结算条款\n账期和开票要求','结算、开票与收款\n凭证归档和分摊']],60,209,1160,371,[207,309,309,335],23);
takeaway(s,'同批请求贯通用量、对账确认、结算、发票与回款，才能宣称完成商业闭环。');
notes(s,'表以角色为泳道、阶段为列。公司制度未提供，不虚构审批姓名或时限。重要交接：技术产能报告传商务财务形成报价；商务法务确认条款后技术按配额发布；技术给出用量明细、商务获取平台对账确认、财务形成结算及发票、商务财务跟踪到账。真实商业闭环需要实际交易与凭证；模拟账单仅作为计量验证。');}
// 18
{
let s=header(18,'下一阶段以一个可复现服务完成验证','当前已确认资源基线与分柜原则，模型、平台采购和实测证据仍需逐步补齐。');
table(s,[['评审事项','进入下一阶段的通过条件','下一项证据 / 责任'],['首轮服务范围','Qwen3-8B 等具体版本完成\n质量、负载与计量联调','显存/功率清单、版本包\n设备运维与模型负责人'],['平台试供给','平台接受服务规格\n性能目标、采购价和规则明确','接入验收、报价与协议\n平台技术、商务、财务'],['商业闭环与扩容','同批真实用量完成结算回款\n订单需求和经济性支持扩容','对账单、回款、经营复盘\n商务、财务、项目负责人']],60,214,1160,312,[250,476,434],25);
txt(s,'当前决策建议：继续最小文本闭环验证。YOLO 与 Wan 保持独立 PoC。',63,551,1154,65,29,C.teal,true);
notes(s,'本次报告不声称设备已上架、模型已部署、压测已通过、合同已签或款项已到账。与第2页三项评审目标对应：确定首轮范围；明确资源资料及责任；设置试供给门槛。扩容依据需要实际质量、产能、订单与全成本经济性，不以峰值吞吐或能输出文本为充分理由。');}

p.slides.items[10].speakerNotes.textFrame.setText('完整压测脚本模板（未执行）：\n'+await fs.readFile('/Users/lin/Desktop/catl/output/token_mini/benchmark_template.sh','utf8')+'\n官方参数依据：'+refs.bench+'\n查询日期：2026-09-16。缓存命中另用重复前缀工作负载并核对服务端实际计数。');
await fs.mkdir(B+'/network-render',{recursive:true});
await(await PresentationFile.exportPptx(p)).save(B+'/network-candidate.pptx');
await fs.writeFile(B+'/table-owners.json',JSON.stringify([...new Set(tableOwners)]));
for(let i=0;i<p.slides.items.length;i++){let im=await p.export({slide:p.slides.items[i],format:'png',scale:1});await fs.writeFile(B+'/network-render/'+String(i+1).padStart(2,'0')+'.png',new Uint8Array(await im.arrayBuffer()));console.log('render '+(i+1));}
