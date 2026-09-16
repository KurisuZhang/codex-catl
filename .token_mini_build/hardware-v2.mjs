import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {Presentation,PresentationFile,FileBlob} from '@oai/artifact-tool';
const ROOT='/Users/lin/Desktop/catl',B=ROOT+'/.token_mini_build/hardware-v2';
const SKILL='/Users/lin/.codex/plugins/cache/openai-primary-runtime/presentations/26.909.12148/skills/presentations';
const C={navy:'#12304A',ink:'#233D50',teal:'#008E9C',blue:'#377BB5',muted:'#667B89',line:'#D4E0E6',bg:'#F8FAFB',pale:'#E6F3F4',white:'#FFFFFF',amber:'#9B641C'};
const F='Arial Unicode MS';
const p=Presentation.create({slideSize:{width:1280,height:720}});
function box(s,x,y,w,h,fill=C.white,stroke=C.line){return s.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:h},fill,line:{fill:stroke,width:1}})}
function txt(s,v,x,y,w,h,size=22,color=C.ink,bold=false,align='left'){const a=s.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});a.text=v;a.text.style={typeface:F,fontSize:size,color,bold,alignment:align,verticalAlignment:'middle',wrap:'square',autoFit:'none',insets:{top:0,bottom:0,left:0,right:0}};return a;}
function node(s,v,x,y,w,h,fill=C.white,color=C.ink,size=20){box(s,x,y,w,h,fill);return txt(s,v,x+5,y+2,w-10,h-4,size,color,false,'center');}
function header(n,sub,lead){let s=p.slides.add();s.background.fill=C.bg;txt(s,'A1  硬件设备',60,28,1160,61,46,C.navy,true);txt(s,sub,62,96,1156,46,30,C.teal,true);txt(s,lead,62,148,1156,43,20,C.muted);box(s,60,659,1160,1,C.line,C.line);txt(s,'token 魔方 Mini实验台',60,674,1000,22,15,C.muted);txt(s,n+' / 18',1105,674,115,22,15,C.muted,false,'right');return s;}
function table(s,vals,x,y,width,widths,heights,size=20){let t=s.tables.add({rows:vals.length,columns:vals[0].length,left:x,top:y,width,height:heights.reduce((a,b)=>a+b,0),columnWidths:widths,values:vals});t.borders.assign({style:'solid',fill:C.line,width:1});t.cells.block({row:0,column:0,rowCount:vals.length,columnCount:vals[0].length}).assign({textStyle:{fontSize:size,typeface:F,color:C.ink},margins:{left:10,right:8,top:3,bottom:3},anchor:'center'});for(let r=0;r<vals.length;r++){t.rows[r].height=heights[r];for(let c=0;c<vals[0].length;c++){let z=t.getCell(r,c);z.fill=r===0?C.navy:(r%2?C.white:'#EDF4F6');z.text.style={fontSize:size,typeface:F,color:r===0?C.white:C.ink,bold:r===0||c===0};}}return t;}
{
const s=header('03','机柜布局与服务器配置','14 台服务器分布于 3 个机柜：2 台 910B、6 台八卡 T4、6 台通算。');
txt(s,'机柜布局（示意，非实际 U 位）',62,199,501,32,23,C.navy,true);
for(let k=0;k<3;k++){
 const x=62+k*166;box(s,x,239,152,312,'#EDF3F6');txt(s,k<2?'机柜 '+(k===0?'A':'B'):'机柜 C',x+3,248,146,29,22,C.navy,true,'center');txt(s,k<2?'10 kW / 拟装载':'既有 / 通算专用',x+3,277,146,25,16,C.muted,false,'center');
 if(k<2){node(s,'910B-'+(k+1)+'\n8 张 NPU',x+10,314,132,67,C.pale,C.teal,20);for(let j=0;j<3;j++)node(s,'T4-'+(k*3+j+1)+'  8 卡',x+10,391+j*44,132,35,C.white,C.blue,19);}
 else {for(let j=0;j<6;j++)node(s,'通算-'+(j+1),x+10,314+j*36,132,29,C.white,C.ink,18);}
}
txt(s,'A / B：模型推理\nC：MASS 平台及支撑服务',62,560,490,53,21,C.ink);
table(s,[['服务器 / 数量','单台配置'],['910B ×2\n共 16 张 NPU','已定：8×910B，8×200GE RoCE\n参考：4×Kunpeng 920_5250，24×32GB 内存\n系统盘 2×480GB SATA，数据盘 4×1.92TB NVMe\n参考卡标为 Ascend 910_4-64G，需核对型号'],['T4 ×6\n共 48 张 GPU','已定：8×NVIDIA T4（单卡 16GB）\n待补：CPU、内存、系统盘、数据盘、网卡\n整机需核验八卡槽位、供电和散热'],['通算 ×6\n既有设备','参考：2×Intel 5218R，12×32GB DDR4 2933\n系统盘 2×480GB，数据盘 14×1.92TB SATA SSD\n网络 2×GE＋4×10GE，现有配置待资产核对']],580,204,638,[142,496],[39,142,105,108],19);
txt(s,'上架条件：每柜 1 台 910B＋3 台 T4＋网络设备的整机峰值及预留，不得超过机柜可用功率。',62,619,1155,29,19,C.teal,true);
s.speakerNotes.textFrame.setText('依据用户2026-09-16提供的硬件参考截图：/Users/lin/Desktop/截屏2026-09-16 14.01.50.png。已确定台数、卡数及RoCE配置来自本任务用户要求。参考配置为候选BOM，不代表现有实物验收结果。截图CPU型号照录Kunpeng 920_5250；加速卡照录Ascend 910_4-64G，与用户指定910B尚需按物料编码及设备报告确认，不把64G视为910B已验收显存。通算参考CPU单颗2.1GHz/20核，2颗合计40核；内存384GB。910B参考内存768GB。容量均原始配置，不推定RAID后的可用空间。T4的CPU、内存和磁盘无参考，故不编造。T4单卡16GB沿用原报告NVIDIA数据表 https://www.nvidia.cn/content/dam/en-zz/Solutions/Data-Center/tesla-t4/t4-tensor-core-datasheet.pdf 。机柜C按最新用户要求展示6台既有通算，容量未指定。两台910B每台超过5kW为用户输入，A/B各一台；混装方案须核验整机峰值、U位、承重、制冷、PDU和故障供电。功率超过可用额度时调整T4位置，不表示本方案已通过上架验收。');
}
{
const s=header('04','网络、存储与上架配套清单','盘点口径：已确定数量直接列示，参考规格保留，选配设备单独计算。');
table(s,[['设备类别','数量 / 状态','配置与盘点要求'],['RoCE 交换机','1 台，已确定','参考 32×200GE；本期接入 16 个 200GE 端口\n另一参考为 16×400GE 分拆接入，需核验端口分拆及线缆兼容'],['RoCE 光链路','16 条链路\n32 个光模块','两台 910B 各 8 条 200GE；服务器端 16 个＋交换机端 16 个模块\n配套 16 组光纤，按模块接口和跨柜距离选型'],['业务交换机','数量待盘点','参考 48×25GE＋8×100GE；核对服务器网卡、上联与所需光模块'],['管理交换机','数量待盘点','参考 48×GE/10GE；接入 14 台服务器 BMC 及交换设备管理口'],['对象存储','可选，数量待定','参考：2×Intel 4214R，12×16GB 内存，2×480GB SSD\n20×8TB HDD，2×1.6TB NVMe，2×1GE＋4×10GE'],['整机配件','逐台核对','机箱、主板、CPU/散热器、内存、系统/数据盘、磁盘控制器（按需）\n八卡槽位及 Riser、网卡/BMC、风扇、冗余电源、导轨'],['机柜及机房','逐柜核对','PDU、电源线、接地、理线器、管理网线、业务光模块及光纤\n供电回路、UPS、制冷、U 位及承重，核验新增与既有资源差缺']],60,204,1160,[177,160,823],[37,57,57,45,45,57,57,57],19);
txt(s,'盘点结果应形成逐台配置表、逐端口接线表和逐柜功率表，再确定补购数量。',62,625,1156,28,21,C.teal,true);
s.speakerNotes.textFrame.setText('来源：用户硬件参考截图 /Users/lin/Desktop/截屏2026-09-16 14.01.50.png 及用户本任务已确认配置。交换机48口等为参考规格，不是本期已批准采购清单。RoCE已确认1台；32×200GE与16×400GE为参考的两种选择，不累计成两台。400GE分拆还需核验breakout能力、端口模式、FEC、模块和线缆兼容，不能仅凭MPO线认定可用。32个200GE模块是两台910B共16条光链路双端总数，不包含业务网络模块。参考服务器网络原文：网卡0为6×GE（1个Mgmt管理网口、1个调试串口、4个板载口），另行写4×GE+4×25GE+2×200GE+2×200GE+2×200GE+2×200GE+2×25GE+IPMI。该参考将串口与GE混列、管理项可能重复，因此不直接累加成采购数量；RoCE按已确定每机8×200GE，业务网及BMC按实物端口表去重核验。对象存储参考CPU单颗2.4GHz/12核，硬盘原始容量不能直接作为可用容量，冗余策略及台数尚未定义。对象存储不计入14台已确定服务器，也不擅自放入现有三柜。所有整机配件包含检查完整性，并非主张现有设备全部重新采购。');
}
await fs.mkdir(B,{recursive:true});
await(await PresentationFile.exportPptx(p)).save(B+'/candidate.pptx');
for(let i=0;i<2;i++){let im=await p.export({slide:p.slides.items[i],format:'png',scale:1.5});await fs.writeFile(B+'/draft-'+(i+1)+'.png',new Uint8Array(await im.arrayBuffer()));}
console.log('Authored 2 hardware slides');
