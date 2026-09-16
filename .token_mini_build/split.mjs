import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import JSZip from 'jszip';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const ROOT='/Users/lin/Desktop/catl',B=ROOT+'/.token_mini_build/split',OUT=ROOT+'/output/token_mini/分主题审阅';
const SRC=ROOT+'/output/token_mini/token魔方Mini实验台_项目报告_网络拓扑细化版.pptx';
const SKILL='/Users/lin/.codex/plugins/cache/openai-primary-runtime/presentations/26.909.12148/skills/presentations';
const {finalizePresentation}=await import(pathToFileURL(SKILL+'/container_tools/artifact_tool_utils.mjs').href);
await fs.mkdir(B,{recursive:true});await fs.mkdir(OUT,{recursive:true});
const defs=[['01_封面',[1]],['02_目录',[2]],['03_硬件设备',[3,4]],['04_网络拓扑',[5]],['05_软件架构',[6,7]],['06_模型适配',[8,9]],['07_模型部署',[10]],['08_性能测试',[11,12]],['09_Token收益分析',[13,14]],['10_商业协议',[15,16]],['11_公司流程',[17,18]]];
const src=await JSZip.loadAsync(await fs.readFile(SRC));
const nativeOwners=[3,4,6,8,9,12,13,14,15,16,17,18];
const manifest={source:SRC,order:[],workflow:'以子PPT为后续修改源，只修改受影响主题；待用户要求合并时按order顺序合并并统一页码。'};
for(const [name,pages] of defs){
 let zip=await JSZip.loadAsync(await fs.readFile(SRC));const keep=new Set(pages);
 const relXml=await zip.file('ppt/_rels/presentation.xml.rels').async('string');
 const dropRel=new Set();
 const relOut=relXml.replace(/<Relationship\b[^>]*\/>/g,x=>{const t=x.match(/Target="([^"]+)"/)?.[1];const m=t?.match(/slides\/slide(\d+)\.xml$/);if(m&&!keep.has(+m[1])){dropRel.add(x.match(/Id="([^"]+)"/)[1]);return '';}return x;});
 zip.file('ppt/_rels/presentation.xml.rels',relOut);
 let presentation=await zip.file('ppt/presentation.xml').async('string');
 presentation=presentation.replace(/<p:sldId\b[^>]*\/>/g,x=>dropRel.has(x.match(/r:id="([^"]+)"/)?.[1])?'':x);
 zip.file('ppt/presentation.xml',presentation);
 const removed=new Set();
 for(const f of Object.keys(zip.files)){const m=f.match(/^ppt\/(?:slides|notesSlides)\/(?:_rels\/)?(?:slide|notesSlide)(\d+)\.xml(?:\.rels)?$/);if(m&&!keep.has(+m[1])){removed.add('/'+f);zip.remove(f);}}
 let ct=await zip.file('[Content_Types].xml').async('string');ct=ct.replace(/<Override\b[^>]*\/>/g,x=>removed.has(x.match(/PartName="([^"]+)"/)?.[1])?'':x);zip.file('[Content_Types].xml',ct);
 if(zip.file('docProps/app.xml')){let a=await zip.file('docProps/app.xml').async('string');a=a.replace(/<Slides>\d+<\/Slides>/,`<Slides>${pages.length}</Slides>`);zip.file('docProps/app.xml',a);}
 const renumber=x=>x.replace(/(notesSlide|slide)(\d+)(\.xml)/g,(all,pre,num,end)=>keep.has(+num)?pre+(pages.indexOf(+num)+1)+end:all);
 const clean=new JSZip();for(const [file,entry] of Object.entries(zip.files)){if(entry.dir)continue;let bytes=await entry.async('nodebuffer');if(file.endsWith('.xml')||file.endsWith('.rels'))bytes=Buffer.from(renumber(bytes.toString('utf8')));clean.file(renumber(file),bytes);}zip=clean;
 const candidate=B+'/'+name+'.pptx';await fs.writeFile(candidate,await zip.generateAsync({type:'nodebuffer',compression:'DEFLATE'}));
 const owners=pages.flatMap((n,i)=>nativeOwners.includes(n)?[i+1]:[]);
 const final=OUT+'/'+name+'.pptx';
 await finalizePresentation({workspaceDir:ROOT,candidatePath:candidate,finalPath:final,pythonExecutable:'/Users/lin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3',integrityValidatorPath:SKILL+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:SKILL+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000',...owners.flatMap(n=>['--require-native-table-slide',String(n)])],explicitTotalSlideCount:pages.length,requiredNativeTableOwnerSlides:owners,requiredNativeChartOwnerSlides:[],fontPolicy:{basis:'design',families:['Arial Unicode MS']},verifyArtifactToolImport:true,receiptPath:B+'/'+name+'.v3.validation.json'});
 const p=await PresentationFile.importPptx(await FileBlob.load(final));if(p.slides.items.length!==pages.length)throw new Error('page count');
 // Preserve slide XML and notes byte for byte, including editable objects and original page markers.
 const result=await JSZip.loadAsync(await fs.readFile(final));for(const n of pages)for(const part of [`ppt/slides/slide${n}.xml`,`ppt/notesSlides/notesSlide${n}.xml`]){const a=await src.file(part).async('nodebuffer'),b=await result.file(part.replace(/(notesSlide|slide)(\d+)(\.xml)/g,(_,pre,num,end)=>pre+(pages.indexOf(+num)+1)+end)).async('nodebuffer');if(!a.equals(b))throw new Error('changed '+part);}
 manifest.order.push({file:name+'.pptx',originalPages:pages,pageCount:pages.length,status:'待审阅'});console.log(name+' verified '+pages.length+' slides');
}
await fs.writeFile(OUT+'/合并顺序.json',JSON.stringify(manifest,null,2));
await fs.writeFile(OUT+'/审阅说明.md','# Token 魔方 Mini 实验台：分主题审阅\n\n最新审阅源为本目录中的11份子PPT。原整套PPT保留作为拆分基线。\n\n## 修改方式\n\n- 直接指定主题与修改意见，例如“修改网络拓扑，调整BMC连线”。\n- 每次只编辑、导出和验证受影响主题，不重新生成整套PPT。\n- 跨主题变更（设备数量、价格口径、全局版式）只同步受影响的主题，并说明范围。\n- 保留原版备份；每个主题确认后更新合并清单中的状态与当前文件名。\n- 最后按你明确要求再合并，不提前覆盖整套PPT。\n\n## 合并顺序\n\n'+manifest.order.map((x,i)=>`${i+1}. ${x.file}：${x.pageCount}页，原第${x.originalPages.join('、')}页`).join('\n')+'\n\n当前保留原页脚页码，便于和原稿对照；最终合并时统一页码和跨页引用。正文、图表、网络连线及演讲者备注均保留。文件状态目前统一为待审阅，不代表已确认。\n');
const bundle=new JSZip();for(const f of await fs.readdir(OUT))bundle.file(f,await fs.readFile(OUT+'/'+f));await fs.writeFile(ROOT+'/output/token_mini/Token魔方Mini实验台_11个主题审阅包.zip',await bundle.generateAsync({type:'nodebuffer',compression:'DEFLATE'}));
