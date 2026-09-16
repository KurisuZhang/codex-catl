import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {Presentation,PresentationFile,FileBlob} from '@oai/artifact-tool';
const ROOT='/Users/lin/Desktop/catl',B=ROOT+'/.token_mini_build/toc-v2';
const SKILL='/Users/lin/.codex/plugins/cache/openai-primary-runtime/presentations/26.909.12148/skills/presentations';
const C={navy:'#12304A',ink:'#233D50',teal:'#008E9C',blue:'#377BB5',muted:'#667B89',line:'#D4E0E6',bg:'#F8FAFB',pale:'#E6F3F4',white:'#FFFFFF',amber:'#9B641C'};
const F='Arial Unicode MS';
const p=Presentation.create({slideSize:{width:1280,height:720}});
function box(s,x,y,w,h,fill=C.white,stroke=C.line){return s.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:h},fill,line:{fill:stroke,width:1}})}
function txt(s,v,x,y,w,h,size=22,color=C.ink,bold=false,align='left'){const a=s.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});a.text=v;a.text.style={typeface:F,fontSize:size,color,bold,alignment:align,verticalAlignment:'middle',wrap:'square',autoFit:'none',insets:{top:0,bottom:0,left:0,right:0}};return a;}
function node(s,v,x,y,w,h,fill=C.white,color=C.ink,size=20){box(s,x,y,w,h,fill);return txt(s,v,x+5,y+2,w-10,h-4,size,color,false,'center');}
function header(n,sub,lead){let s=p.slides.add();s.background.fill=C.bg;txt(s,'B2  Token 收益分析',60,28,1160,61,46,C.navy,true);txt(s,sub,n==='14'?130:62,96,n==='14'?1090:1156,46,n==='14'?28:30,C.teal,true);txt(s,lead,62,148,1156,43,20,C.muted);box(s,60,659,1160,1,C.line,C.line);txt(s,'token 魔方 Mini实验台',60,674,1000,22,15,C.muted);txt(s,n+' / 18',1105,674,115,22,15,C.muted,false,'right');return s;}
function table(s,vals,x,y,width,widths,heights,size=20){let t=s.tables.add({rows:vals.length,columns:vals[0].length,left:x,top:y,width,height:heights.reduce((a,b)=>a+b,0),columnWidths:widths,values:vals});t.borders.assign({style:'solid',fill:C.line,width:1});t.cells.block({row:0,column:0,rowCount:vals.length,columnCount:vals[0].length}).assign({textStyle:{fontSize:size,typeface:F,color:C.ink},margins:{left:10,right:8,top:0,bottom:0},anchor:'center'});for(let r=0;r<vals.length;r++){t.rows[r].height=heights[r];for(let c=0;c<vals[0].length;c++){let z=t.getCell(r,c);z.fill=r===0?C.navy:(r%2?C.white:'#EDF4F6');z.text.style={fontSize:size,typeface:F,color:r===0?C.white:C.ink,bold:r===0||c===0};}}return t;}

let s=p.slides.add();s.background.fill=C.bg;
txt(s,'目录',60,28,1160,61,46,C.navy,true);
txt(s,'技术验证与商业验证',62,96,1156,46,30,C.teal,true);
txt(s,'从设备与软件适配，到部署、压测、文本收入与结算回款。',62,148,1156,38,20,C.muted);
txt(s,'A  技术验证',60,205,550,44,30,C.teal,true);
txt(s,'B  商业验证',675,205,545,44,30,C.teal,true);
const rowsA=[['A1  硬件设备','机柜布局、服务器配置与上架配套','03–04'],['A2  网络拓扑','业务、带外管理、RoCE 与存储连接','05'],['A3  软件架构','T4 / 910B 软件生态与模型部署支持','06–07'],['A4  模型适配','适配方法论与现有设备候选模型清单','08–09'],['A5  模型部署','模型下载、环境准备、部署与验收','10']];
const rowsB=[['B1  性能测试','压测方法、最大并发与关键指标记录','11–12'],['B2  Token 收益分析','文本收入公式与 DeepSeek 价格算例','13–14'],['B3  商业协议','计量结算、服务承诺与责任边界','15–16'],['B4  公司流程','角色协作、凭证交接与闭环验收','17–18']];
for(const [rows,x,w] of [[rowsA,60,550],[rowsB,675,545]])for(let i=0;i<rows.length;i++){let y=267+i*73;txt(s,rows[i][0],x,y,w-90,29,24,C.navy,true);txt(s,rows[i][2],x+w-80,y,80,29,20,C.muted,false,'right');txt(s,rows[i][1],x,y+33,w,26,18,C.muted);}
box(s,60,659,1160,1,C.line,C.line);txt(s,'token 魔方 Mini实验台',60,674,1000,22,15,C.muted);txt(s,'02 / 18',1105,674,115,22,15,C.muted,false,'right');
s.speakerNotes.textFrame.setText('目录与当前11份子PPT的顺序一致。封面及目录占第1、2页，九个内容主题占第3至18页。模型适配与模型部署分别列示。收益分析限定文本收入。页码按照当前合并顺序计算。');
await fs.mkdir(B,{recursive:true});await(await PresentationFile.exportPptx(p)).save(B+'/candidate.pptx');
