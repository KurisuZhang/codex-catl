import fs from 'node:fs/promises';
import {Presentation,PresentationFile} from '@oai/artifact-tool';
const p=Presentation.create({slideSize:{width:1280,height:720}});
const s=p.slides.add();s.background.fill='#F4F7FB';
const t=s.shapes.add({geometry:'textbox',position:{left:60,top:40,width:1100,height:80},fill:'none',line:{fill:'none',width:0}});
t.text='GPU／NPU 租赁与大模型推理';t.text.style={fontSize:46,typeface:'Arial Unicode MS',bold:true,color:'#142B45',insets:{top:0,left:0,right:0,bottom:0},autoFit:'none'};
const tb=s.tables.add({rows:3,columns:3,left:60,top:160,width:1160,height:260,values:[['硬件','配置','建议'],['昇腾910B','2台 × 8卡 × 64GB','先验证模型'],['NVIDIA T4','4–6台 × 8卡 × 16GB','单机多副本']]});
tb.cells.block({row:0,column:0,rowCount:3,columnCount:3}).assign({textStyle:{fontSize:25,typeface:'Arial Unicode MS',color:'#142B45'},margins:{left:16,right:16,top:12,bottom:12}});
for(let c=0;c<3;c++){tb.getCell(0,c).fill='#142B45';tb.getCell(0,c).text.style={fontSize:25,typeface:'Arial Unicode MS',color:'#FFFFFF',bold:true};}
await (await PresentationFile.exportPptx(p)).save('/Users/lin/Desktop/catl/.gpu_deck_build/pilot.pptx');
const png=await p.export({slide:s,format:'png',scale:1});await fs.writeFile('/Users/lin/Desktop/catl/.gpu_deck_build/pilot.png',new Uint8Array(await png.arrayBuffer()));
console.log('pilot exported');
