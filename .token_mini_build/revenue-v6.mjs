import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {Presentation,PresentationFile,FileBlob} from '@oai/artifact-tool';
const ROOT='/Users/lin/Desktop/catl',B=ROOT+'/.token_mini_build/revenue-v6';
const SKILL='/Users/lin/.codex/plugins/cache/openai-primary-runtime/presentations/26.909.12148/skills/presentations';
const C={navy:'#12304A',ink:'#233D50',teal:'#008E9C',blue:'#377BB5',muted:'#667B89',line:'#D4E0E6',bg:'#F8FAFB',pale:'#E6F3F4',white:'#FFFFFF',amber:'#9B641C'};
const F='Arial Unicode MS';
const p=Presentation.create({slideSize:{width:1280,height:720}});
function box(s,x,y,w,h,fill=C.white,stroke=C.line){return s.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:h},fill,line:{fill:stroke,width:1}})}
function txt(s,v,x,y,w,h,size=22,color=C.ink,bold=false,align='left'){const a=s.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});a.text=v;a.text.style={typeface:F,fontSize:size,color,bold,alignment:align,verticalAlignment:'middle',wrap:'square',autoFit:'none',insets:{top:0,bottom:0,left:0,right:0}};return a;}
function node(s,v,x,y,w,h,fill=C.white,color=C.ink,size=20){box(s,x,y,w,h,fill);return txt(s,v,x+5,y+2,w-10,h-4,size,color,false,'center');}
function header(n,sub,lead){let s=p.slides.add();s.background.fill=C.bg;txt(s,'B2  Token 收益分析',60,28,1160,61,46,C.navy,true);txt(s,sub,n==='14'?130:62,96,n==='14'?1090:1156,46,n==='14'?28:30,C.teal,true);txt(s,lead,62,148,1156,43,20,C.muted);box(s,60,659,1160,1,C.line,C.line);txt(s,'token 魔方 Mini实验台',60,674,1000,22,15,C.muted);txt(s,n+' / 18',1105,674,115,22,15,C.muted,false,'right');return s;}
function table(s,vals,x,y,width,widths,heights,size=20){let t=s.tables.add({rows:vals.length,columns:vals[0].length,left:x,top:y,width,height:heights.reduce((a,b)=>a+b,0),columnWidths:widths,values:vals});t.borders.assign({style:'solid',fill:C.line,width:1});t.cells.block({row:0,column:0,rowCount:vals.length,columnCount:vals[0].length}).assign({textStyle:{fontSize:size,typeface:F,color:C.ink},margins:{left:10,right:8,top:0,bottom:0},anchor:'center'});for(let r=0;r<vals.length;r++){t.rows[r].height=heights[r];for(let c=0;c<vals[0].length;c++){let z=t.getCell(r,c);z.fill=r===0?C.navy:(r%2?C.white:'#EDF4F6');z.text.style={fontSize:size,typeface:F,color:r===0?C.white:C.ink,bold:r===0||c===0};}}return t;}



{
let s=header('13','月收入测算：三类 Token 分开计价，再求和','统一使用同一负载下整套服务的吞吐（token/min），单价取数值，单位为元 / 百万 Token。');

const labels=['输出月收入','未命中输入月收入','缓存命中输入月收入'];
const types=['输出','未命中输入','缓存命中输入'];
for(let i=0;i<3;i++){
 let y=199+i*103;
 box(s,60,y,1160,91,i%2?'#EEF5F6':C.white,C.teal);
 txt(s,labels[i]+'＝',78,y+5,1124,27,23,C.teal,true);
 txt(s,'［整套服务'+types[i]+'吞吐 ×（30天 × 24小时/天 × 60分钟/小时）',78,y+33,1124,26,20,C.navy);
 txt(s,'  × 可计费产出比例 × '+types[i]+'单价］÷ 1,000,000',78,y+60,1124,26,20,C.navy);
}
txt(s,'吞吐用 token/min；单价取数值（元 / 百万 Token）。整套服务吞吐已包含卡数，不再乘卡数。',62,515,1156,29,20,C.ink);
txt(s,'可计费产出比例：实际月度可计费用量，占按该压测速度持续运行30天的理论用量比例。',62,549,1156,28,20,C.ink);
box(s,60,588,1160,52,'#E6F3F4',C.teal);
txt(s,'文本月收入＝输出月收入＋未命中输入月收入＋缓存命中输入月收入',75,598,1130,32,24,C.teal,true);
s.speakerNotes.textFrame.setText('本页为量纲一致的收入估算，不是实测收入。定义每类整套服务吞吐为成功请求口径token/min，30天为43200分钟，每百万token价格除1000000。各类可计费产出比例分别估计，代表实际月可计费量除该类压测速率乘43200的参考量；不是简单设备利用率，应包含需求、在线时长和可结算范围中尚未体现的差异，避免重复扣减已有损失。混部时三类速率必须来自同一负载，且不能把每类独立峰值当作同时可交付。缓存命中输入是逻辑复用量，按缓存结算价，不是完整prefill计算量。使用整套服务吞吐不乘卡数，只有卡均吞吐才在其他口径下需要乘卡数。同一币种税口径结算。配套第二页使用DeepSeek官方价格作参考，假设算例合计6713.28元，非实测或实际收入。');
}

{
let s=header('14','DeepSeek-V4.1-Flash：官方价格与文本收入算例','人民币 / 百万 Token，查询日期 2026-09-16。API 模型名：deepseek-flash。');
s.background.fill=C.white;
s.images.add({blob:await fs.readFile(ROOT+'/.token_mini_build/revenue-v5/deepseek.png'),contentType:'image/png',alt:'DeepSeek 官方标识',fit:'contain',position:{left:60,top:97,width:58,height:58}});
function seventy(){return 70;}
table(s,[['官方公开 API 单价','输入未命中','输入缓存命中','输出'],['空闲时段','1元','0.02元','4元'],['高峰时段','2元','0.04元','8元']],60,200,1160,[365,265,265,265],[33,35,35],21);
txt(s,'高峰：北京时间周一至周五 9:00–12:00、14:00–18:00；其余为空闲时段。',62,310,1156,27,18,C.muted);
txt(s,'假设同一负载：输入600,000 token/min，90%命中；输出60,000 token/min，产出比例50%。',62,350,1156,31,20,C.navy,true);
table(s,[['按空闲时段单价估值','月收入计算（元）','结果'],['未命中输入','［60,000 ×（30 × 24 × 60）× 50% × 1］÷ 1,000,000','1,296.00元'],['缓存命中输入','［540,000 ×（30 × 24 × 60）× 50% × 0.02］÷ 1,000,000','233.28元'],['输出','［60,000 ×（30 × 24 × 60）× 50% × 4］÷ 1,000,000','5,184.00元']],60,394,1160,[245,735,180],[33,36,36,36],19);
box(s,60,552,1160,49,'#E6F3F4',C.teal);
txt(s,'文本月收入估值＝1,296.00＋233.28＋5,184.00＝6,713.28元',75,560,1130,33,25,C.teal,true);
txt(s,'吞吐与产出比例均为假设，非设备实测。此处统一按空闲价估值；实际跨时段须按各时段用量分别计价。',62,610,1156,25,17,C.muted);
txt(s,'公开 API 零售价仅作参照，不等于平台采购价或已实现收入。官方价格链接见备注与配套说明。',62,638,1156,19,16,C.muted);
s.speakerNotes.textFrame.setText('本主题仅计算文本收入，不纳入YOLO或视频收入。官方中文价格页截至2026-09-16列DeepSeek-V4.1-Flash（deepseek-flash）：每百万token空闲输入未命中1元、命中0.02元、输出4元，高峰分别2、0.04、8元。高峰北京时间周一至周五9-12和14-18，其余空闲。来源https://api-docs.deepseek.com/zh-cn/quick_start/pricing/?article_id=article_1779470751466_8 。Logo来自官方GitHub账号https://github.com/deepseek-ai.png 。示例是以空闲价为统一基准的产能估值，不能将全天实际服务全部按空闲价视为真实结算。真实结算将高峰和空闲的实际可计费量分别乘相应价格后求和，合同采购价另按约定。全部吞吐是同一假设负载，输入600000分为未命中60000和命中540000；输出60000与输入不同类别，不从输入中扣除。乘50%只一次，全部吞吐为集群值不乘卡数。月理论分钟用30×24×60，三类金额1296、233.28、5184，总6713.28。尚未证明此模型能在项目两台910B按该负载部署，数值不代表容量或性能承诺。');
}
await fs.mkdir(B,{recursive:true});await(await PresentationFile.exportPptx(p)).save(B+'/candidate.pptx');
