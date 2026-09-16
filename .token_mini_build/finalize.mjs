import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const ROOT='/Users/lin/Desktop/catl',B=ROOT+'/.token_mini_build';
const SKILL='/Users/lin/.codex/plugins/cache/openai-primary-runtime/presentations/26.909.12148/skills/presentations';
const finalPath=ROOT+'/output/token_mini/token魔方Mini实验台_项目报告_交付版.pptx';
const owners=JSON.parse(await fs.readFile(B+'/table-owners.json','utf8'));
const {finalizePresentation}=await import(pathToFileURL(SKILL+'/container_tools/artifact_tool_utils.mjs').href);
const result=await finalizePresentation({workspaceDir:ROOT,candidatePath:B+'/candidate.pptx',finalPath,pythonExecutable:'/Users/lin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3',integrityValidatorPath:SKILL+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:SKILL+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit',...owners.flatMap(n=>['--require-native-table-slide',String(n)])],explicitTotalSlideCount:18,requiredNativeTableOwnerSlides:owners,requiredNativeChartOwnerSlides:[],fontPolicy:{basis:'design',families:['Arial Unicode MS']},verifyArtifactToolImport:true,receiptPath:B+'/validation-final.json'});
console.log(JSON.stringify(result));
const p=await PresentationFile.importPptx(await FileBlob.load(finalPath));
await fs.mkdir(B+'/final-render',{recursive:true});
for(let i=0;i<p.slides.items.length;i++){const im=await p.export({slide:p.slides.items[i],format:'png',scale:1.5});await fs.writeFile(B+'/final-render/'+String(i+1).padStart(2,'0')+'.png',new Uint8Array(await im.arrayBuffer()));console.log('Final render '+(i+1));}
