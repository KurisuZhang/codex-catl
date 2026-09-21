import fs from 'node:fs/promises';
import {Presentation,PresentationFile,FileBlob} from '@oai/artifact-tool';
import {finalizePresentation} from '/Users/lin/.codex/plugins/cache/openai-primary-runtime/presentations/26.909.12148/skills/presentations/container_tools/artifact_tool_utils.mjs';
const root='/Users/lin/Desktop/catl',build=root+'/.work_report_build';
const skill='/Users/lin/.codex/plugins/cache/openai-primary-runtime/presentations/26.909.12148/skills/presentations';
const p=Presentation.create({slideSize:{width:1600,height:900}}),s=p.slides.add();s.background.fill='#FFFFFF';
const font='Arial Unicode MS',c={navy:'#18334C',body:'#364C5D',muted:'#7D8B96',green:'#008B84',yellow:'#A97621'};
function txt(t,x,y,w,h,size=26,color=c.body,bold=false){const a=s.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});a.text=t;a.text.style={typeface:font,fontSize:size,color,bold,alignment:'left',verticalAlignment:'middle',wrap:'square',autoFit:'none',insets:{top:0,bottom:0,left:0,right:0}};return a;}
txt('工作进展汇报',76,40,800,66,50,c.navy,true);
txt('Token 实验台报告、移动服务器租赁与 P8000 测试',78,111,1400,40,26,c.muted);
// Completion status is the only color-coded content.
txt('01',78,192,50,42,26,c.muted);
txt('Token 魔方 Mini',144,182,290,43,29,c.navy,true);
txt('实验台报告',144,221,290,43,29,c.navy,true);
txt('已完成',144,271,290,49,37,c.green,true);
txt('已完成报告梳理，覆盖 Token 生产与平台销售闭环验证',472,184,1050,45,28,c.navy,true);
txt('技术验证',472,244,140,38,26,c.navy,true);
txt('硬件设备、网络拓扑、软件架构、模型适配与部署',630,244,888,38,26);
txt('商业验证',472,290,140,38,26,c.navy,true);
txt('性能测试、Token 收益分析',630,290,888,38,26);

// Lease milestones, with shared platform/network details stated once.
txt('02',78,385,50,42,26,c.muted);
txt('移动服务器租赁',144,376,295,44,29,c.navy,true);
txt('未完成',144,432,290,49,37,c.yellow,true);
txt('待商务流程初稿',144,491,290,36,23,c.muted);
txt('已确定 2 台 910B + 6 台 NVIDIA T4，待夏新完成商务流程初稿',472,374,1050,43,27,c.navy,true);
const vals=[
 ['阶段','时间','地点','算力资源','组网方 / 带宽'],
 ['流程调试期','9/30–10/30','移动漳湾机房','2 台 910B + 6 台 T4\n后续迁移至展示期','移动 / 500 Mbps'],
 ['安全测试期','10/20–11/10','21C Token 魔方','18 台报废通算服务器\n其中 4 台以上带 GPU','时代 / 1 Gbps'],
 ['最终展示期','11/10–2027/5/10','21C Token 魔方','8 台 910B + 10 台 T4','时代 / 1 Gbps']
];
const heights=[42,63,63,59];
const tb=s.tables.add({rows:4,columns:5,left:472,top:430,width:1050,height:227,columnWidths:[140,210,190,310,200],values:vals});
tb.borders.assign({style:'solid',fill:'#DCE3E8',width:0.65});
tb.cells.block({row:0,column:0,rowCount:4,columnCount:5}).assign({textStyle:{fontSize:23,typeface:font,color:c.body},margins:{left:12,right:8,top:0,bottom:0},anchor:'center'});
for(let r=0;r<4;r++){tb.rows[r].height=heights[r];for(let col=0;col<5;col++){let cell=tb.getCell(r,col);cell.fill=r===0?'#EDF2F5':'#FFFFFF';cell.text.style={fontSize:r===0?23:22,typeface:font,color:r===0?c.navy:c.body,bold:r===0};}}
txt('三个阶段均使用 MOMA 平台，通过互联网访问',474,666,1046,32,22,c.muted);

txt('03',78,752,50,42,26,c.muted);
txt('P8000 测试',144,743,295,44,29,c.navy,true);
txt('未完成',144,799,290,49,37,c.yellow,true);
txt('已完成一轮初步测试，正在学习并开展细化测试',472,741,1050,43,28,c.navy,true);
txt('环境与通信：RDMA 测试、驱动环境验证',472,794,1050,35,25);
txt('模型与推理：模型文件与可用性验证、推理引擎参数确定',472,831,1050,35,25);
txt('性能：LLM 吞吐性能测试',1120,794,404,35,25);
s.speakerNotes.textFrame.setText('来源：用户工作内容及微信图片_20260918173112_75_2.jpg。完成状态：Token魔方Mini实验台报告已完成，移动服务器租赁与P8000测试未完成。报告已完成并不表示所有技术和商业验证均已完成。租赁计划：流程调试期9月30日至10月30日，移动漳湾机房，2台910B+6台T4，后续迁移至展示期，移动负责组网，MOMA，互联网500Mbps。安全测试期10月20日至11月10日，21C token魔方，18台报废通算服务器，其中4台以上带GPU，时代负责组网，MOMA，互联网1Gbps。最终展示期11月10日至2027年5月10日，21C token魔方，8台910B+10台T4，时代负责组网，MOMA，互联网1Gbps。原图前两段未写年份，正文保持月日，最终终止时间明确为2027年。阶段日期存在重叠，按原图保留。设备单位为台。P8000初测一轮已完成，细化测试进行中。');
const candidate=build+'/candidate-status.pptx';await(await PresentationFile.exportPptx(p)).save(candidate);
const final=root+'/output/工作进展汇报_完成状态与租赁时间线.pptx';
await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:final,pythonExecutable:'/Users/lin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','15240000,8572500','--validate-bullet-geometry','--validate-heading-fit','--require-native-table-slide','1'],explicitTotalSlideCount:1,requiredNativeTableOwnerSlides:[1],requiredNativeChartOwnerSlides:[],fontPolicy:{basis:'design',families:[font]},verifyArtifactToolImport:true,receiptPath:build+'/validation-status.json'});
const deck=await PresentationFile.importPptx(await FileBlob.load(final));
const preview=await deck.export({slide:deck.slides.items[0],format:'png',scale:1});await fs.writeFile(root+'/output/工作进展汇报_完成状态与租赁时间线.png',new Uint8Array(await preview.arrayBuffer()));
console.log(final);
