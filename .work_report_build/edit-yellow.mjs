import fs from 'node:fs/promises';
import {PresentationFile, FileBlob} from '@oai/artifact-tool';
import {finalizePresentation} from '/Users/lin/.codex/plugins/cache/openai-primary-runtime/presentations/26.909.12148/skills/presentations/container_tools/artifact_tool_utils.mjs';
const root='/Users/lin/Desktop/catl',build=root+'/.work_report_build';
const skill='/Users/lin/.codex/plugins/cache/openai-primary-runtime/presentations/26.909.12148/skills/presentations';
const p=await PresentationFile.importPptx(await FileBlob.load(root+'/output/工作进展汇报_Token实验台与P8000测试.pptx'));
const snapshot=await p.inspect({kind:'textbox',maxChars:30000});
const targets=new Set(['03','细化测试进行中','环境与通信','模型与推理','性能测试']);
let count=0;
for(const row of snapshot.ndjson.split('\n').filter(Boolean)) {
 const item=JSON.parse(row);
 if(targets.has(item.text??item.textPreview)) {p.resolve(item.id).text.color='#A97621';count++;}
}
if(count!==5) throw new Error('Expected five edits, got '+count);
const candidate=build+'/candidate-yellow.pptx';
await(await PresentationFile.exportPptx(p)).save(candidate);
const final=root+'/output/工作进展汇报_Token实验台与P8000测试_黄色版.pptx';
await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:final,pythonExecutable:'/Users/lin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','15240000,8572500','--validate-bullet-geometry','--validate-heading-fit'],explicitTotalSlideCount:1,requiredNativeTableOwnerSlides:[],requiredNativeChartOwnerSlides:[],fontPolicy:{basis:'design',families:['Arial Unicode MS']},verifyArtifactToolImport:true,receiptPath:build+'/validation-yellow.json'});
const deck=await PresentationFile.importPptx(await FileBlob.load(final));
const preview=await deck.export({slide:deck.slides.items[0],format:'png',scale:1});
await fs.writeFile(root+'/output/工作进展汇报_黄色版预览.png',new Uint8Array(await preview.arrayBuffer()));
console.log(final);
