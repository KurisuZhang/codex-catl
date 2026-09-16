import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {Presentation,PresentationFile,FileBlob} from '@oai/artifact-tool';
const ROOT='/Users/lin/Desktop/catl',B=ROOT+'/.token_mini_build/revenue-v3';
const SKILL='/Users/lin/.codex/plugins/cache/openai-primary-runtime/presentations/26.909.12148/skills/presentations';
const C={navy:'#12304A',ink:'#233D50',teal:'#008E9C',blue:'#377BB5',muted:'#667B89',line:'#D4E0E6',bg:'#F8FAFB',pale:'#E6F3F4',white:'#FFFFFF',amber:'#9B641C'};
const F='Arial Unicode MS';
const p=Presentation.create({slideSize:{width:1280,height:720}});
function box(s,x,y,w,h,fill=C.white,stroke=C.line){return s.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:h},fill,line:{fill:stroke,width:1}})}
function txt(s,v,x,y,w,h,size=22,color=C.ink,bold=false,align='left'){const a=s.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});a.text=v;a.text.style={typeface:F,fontSize:size,color,bold,alignment:align,verticalAlignment:'middle',wrap:'square',autoFit:'none',insets:{top:0,bottom:0,left:0,right:0}};return a;}
function node(s,v,x,y,w,h,fill=C.white,color=C.ink,size=20){box(s,x,y,w,h,fill);return txt(s,v,x+5,y+2,w-10,h-4,size,color,false,'center');}
function header(n,sub,lead){let s=p.slides.add();s.background.fill=C.bg;txt(s,'B2  Token 收益分析',60,28,1160,61,46,C.navy,true);txt(s,sub,62,96,1156,46,30,C.teal,true);txt(s,lead,62,148,1156,43,20,C.muted);box(s,60,659,1160,1,C.line,C.line);txt(s,'token 魔方 Mini实验台',60,674,1000,22,15,C.muted);txt(s,n+' / 18',1105,674,115,22,15,C.muted,false,'right');return s;}
function table(s,vals,x,y,width,widths,heights,size=20){let t=s.tables.add({rows:vals.length,columns:vals[0].length,left:x,top:y,width,height:heights.reduce((a,b)=>a+b,0),columnWidths:widths,values:vals});t.borders.assign({style:'solid',fill:C.line,width:1});t.cells.block({row:0,column:0,rowCount:vals.length,columnCount:vals[0].length}).assign({textStyle:{fontSize:size,typeface:F,color:C.ink},margins:{left:10,right:8,top:0,bottom:0},anchor:'center'});for(let r=0;r<vals.length;r++){t.rows[r].height=heights[r];for(let c=0;c<vals[0].length;c++){let z=t.getCell(r,c);z.fill=r===0?C.navy:(r%2?C.white:'#EDF4F6');z.text.style={fontSize:size,typeface:F,color:r===0?C.white:C.ink,bold:r===0||c===0};}}return t;}



{
let s=header('13','月收入测算：三类 Token 分开计价，再求和','统一使用同一负载下整套服务的吞吐（token/min），单价单位为元 / 百万 Token。');

const labels=['输出月收入','未命中输入月收入','缓存命中输入月收入'];
const types=['输出','未命中输入','缓存命中输入'];
for(let i=0;i<3;i++){
 let y=199+i*103;
 box(s,60,y,1160,91,i%2?'#EEF5F6':C.white,C.teal);
 txt(s,labels[i]+'＝',78,y+9,1124,30,24,C.teal,true);
 txt(s,'整套服务'+types[i]+'吞吐 ×（30天 × 24小时/天 × 60分钟/小时）',78,y+44,690,32,20,C.navy);
 txt(s,'× 可计费产出比例 × '+types[i]+'单价 ÷ 1,000,000',772,y+44,430,32,18,C.navy);
}
txt(s,'吞吐用 token/min；单价用元 / 百万 Token。整套服务吞吐已包含卡数，不再乘卡数。',62,515,1156,29,20,C.ink);
txt(s,'可计费产出比例：实际月度可计费用量，占按该压测速度持续运行30天的理论用量比例。',62,549,1156,28,20,C.ink);
box(s,60,588,1160,52,'#E6F3F4',C.teal);
txt(s,'假设算例：输出60,000 token/min，产出50%，单价2元/百万 Token',75,593,1130,22,18,C.ink);
txt(s,'输出月收入＝60,000 ×（30 × 24 × 60）× 50% × 2 ÷ 1,000,000＝2,592元',75,615,1130,23,20,C.teal,true);
s.speakerNotes.textFrame.setText('本页为量纲一致的收入估算，不是实测收入。定义每类整套服务吞吐为成功请求口径token/min，30天为43200分钟，每百万token价格除1000000。各类可计费产出比例分别估计，代表实际月可计费量除该类压测速率乘43200的参考量；不是简单设备利用率，应包含需求、在线时长和可结算范围中尚未体现的差异，避免重复扣减已有损失。混部时三类速率必须来自同一负载，且不能把每类独立峰值当作同时可交付。缓存命中输入是逻辑复用量，按缓存结算价，不是完整prefill计算量。使用整套服务吞吐不乘卡数，只有卡均吞吐才在其他口径下需要乘卡数。同一币种税口径结算。本版删除未经本轮核验的外部价格表，改为合同价格输入。算例60000×43200×0.5×2/1000000=2592元。');
}
{
let s=header('14','收入与利润：先算可结算收入，再扣项目成本','预测收入用于评估产能；实际结算以双方认可的用量、合同价格及调整项为准。');
box(s,60,198,1160,53,'#E6F3F4',C.teal);
txt(s,'文本月收入＝输出月收入＋未命中输入月收入＋缓存命中输入月收入',62,202,1156,45,27,C.teal,true);
box(s,60,258,1160,50,C.white,C.teal);
txt(s,'月经营结果＝文本收入＋检测收入＋视频收入－项目成本',62,261,1156,41,26,C.navy,true);
table(s,[['成本视角','纳入哪些成本','用于判断什么'],['增量运营收支','新增电费、网络、机房与运维\n按项目实际承担范围计入','现有设备提供服务\n能否覆盖新增现金支出'],['全成本经营结果','增量成本＋折旧 / 租赁\n既有通算与机柜按约定分摊','持续经营和后续扩容\n是否具有经济性'] ],60,323,1160,[245,540,375],[36,66,66],21);
box(s,60,507,1160,53,'#E6F3F4',C.teal);
txt(s,'实际文本结算额＝三类实际可计费 Token 数分别乘对应单价 ÷ 1,000,000，再求和',62,513,1156,44,24,C.teal,true);
txt(s,'盈亏平衡：固定业务组合下，月总收入达到月项目成本。\n单独分析结算价格、需求利用、缓存比例与任务分配；调整组合后重新测算产能。',62,568,1156,63,21,C.ink);
s.speakerNotes.textFrame.setText('实际结算还可能有合同约定调整项，实际回款以银行记录为准。YOLO和Wan按图片、视频任务等约定单位计价，不套token公式。增量成本和全成本是不同分析视角，不重复累计。月电量使用实测平均功率乘小时，机柜10kW不是持续耗电值。设备购置款与同设备折旧不得在同一利润口径重复全额扣减。价格币种和税口径保持一致。T4在文本、检测和视频任务间分配卡时，总资源不能重复占用。原版k*符号公式改为中文盈亏条件，避免未定义变量。缺少实测、合同价格和成本时不给出确定利润。');
}
await fs.mkdir(B,{recursive:true});await(await PresentationFile.exportPptx(p)).save(B+'/candidate.pptx');
