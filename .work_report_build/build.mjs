import fs from 'node:fs/promises';
import {Presentation, PresentationFile, FileBlob} from '@oai/artifact-tool';
import {finalizePresentation} from '/Users/lin/.codex/plugins/cache/openai-primary-runtime/presentations/26.909.12148/skills/presentations/container_tools/artifact_tool_utils.mjs';
const root='/Users/lin/Desktop/catl';
const build=root+'/.work_report_build';
const skill='/Users/lin/.codex/plugins/cache/openai-primary-runtime/presentations/26.909.12148/skills/presentations';
const font='Arial Unicode MS';
const p=Presentation.create({slideSize:{width:1600,height:900}});
const s=p.slides.add();
s.background.fill='#FFFFFF';
const c={navy:'#18334C',body:'#364C5D',muted:'#7D8B96',teal:'#008B84',blue:'#2A68A8',amber:'#A97621'};
function text(t,x,y,w,h,size=28,color=c.body,bold=false){
 const a=s.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
 a.text=t;a.text.style={typeface:font,fontSize:size,color,bold,alignment:'left',verticalAlignment:'middle',wrap:'square',autoFit:'none',insets:{top:0,bottom:0,left:0,right:0}};
 return a;
}
text('工作进展汇报',78,48,1400,68,52,c.navy,true);
text('Token 实验台建设与 P8000 测试',80,128,1390,42,27,c.muted);

text('01',80,224,64,48,32,c.teal,true);
text('Token 魔方 Mini',164,217,345,48,32,c.navy,true);
text('实验台',164,262,345,45,32,c.navy,true);
text('已完成梳理',164,319,330,35,25,c.teal,true);
text('完成 Token 生产与平台销售闭环验证内容梳理',580,221,950,48,31,c.navy,true);
text('技术验证',580,281,135,40,27,c.teal,true);
text('硬件设备、网络拓扑、软件架构、模型适配与部署',728,281,785,40,27);
text('商业验证',580,330,135,40,27,c.teal,true);
text('性能测试、Token 收益分析',728,330,785,40,27);

text('02',80,431,64,48,32,c.amber,true);
text('移动迷你试验台',164,424,350,48,32,c.navy,true);
text('租赁推进',164,469,345,45,32,c.navy,true);
text('待商务流程初稿',164,526,355,35,25,c.amber,true);
text('已确定配置：2 台 910B + 6 台 NVIDIA T4',580,428,950,48,31,c.navy,true);
text('当前进展',580,489,135,40,27,c.amber,true);
text('持续推动租赁，等待夏新完成商务流程初稿',728,489,785,40,27);

text('03',80,636,64,48,32,c.blue,true);
text('P8000 测试',164,629,360,48,32,c.navy,true);
text('细化测试进行中',164,695,355,35,25,c.blue,true);
text('已完成一轮初步测试，正在学习并开展细化测试',580,633,950,48,31,c.navy,true);
text('环境与通信',580,695,150,40,27,c.blue,true);
text('RDMA 测试、驱动环境验证',751,695,760,40,27);
text('模型与推理',580,744,150,40,27,c.blue,true);
text('模型文件验证、模型可用性验证、推理引擎参数确定',751,744,760,40,27);
text('性能测试',580,793,150,40,27,c.blue,true);
text('LLM 吞吐性能测试',751,793,760,40,27);

s.speakerNotes.textFrame.setText('信息来源：用户提供的三项工作内容。第一项仅明确完成实验台与闭环验证内容梳理，不将其表述为所有技术及商业验证均已完成。第二项设备数量单位为台，非卡数。P8000仅完成一轮初步测试，细化测试仍在进行，未提供测试结果或性能指标。');
const candidate=build+'/candidate.pptx';
await(await PresentationFile.exportPptx(p)).save(candidate);
const final=root+'/output/工作进展汇报_Token实验台与P8000测试.pptx';
await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:final,pythonExecutable:'/Users/lin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','15240000,8572500','--validate-bullet-geometry','--validate-heading-fit'],explicitTotalSlideCount:1,requiredNativeTableOwnerSlides:[],requiredNativeChartOwnerSlides:[],fontPolicy:{basis:'design',families:[font]},verifyArtifactToolImport:true,receiptPath:build+'/validation.json'});
const deck=await PresentationFile.importPptx(await FileBlob.load(final));
const preview=await deck.export({slide:deck.slides.items[0],format:'png',scale:1});
await fs.writeFile(root+'/output/工作进展汇报_预览.png',new Uint8Array(await preview.arrayBuffer()));
console.log(final);
