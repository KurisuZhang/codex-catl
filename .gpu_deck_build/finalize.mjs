import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const ROOT='/Users/lin/Desktop/catl',B=ROOT+'/.gpu_deck_build';
const SKILL='/Users/lin/.codex/plugins/cache/openai-primary-runtime/presentations/26.909.12148/skills/presentations';
const finalPath=ROOT+'/output/gpu_rental/GPU_NPU租赁与大模型推理调研.pptx';
const {finalizePresentation}=await import(pathToFileURL(SKILL+'/container_tools/artifact_tool_utils.mjs').href);
const result=await finalizePresentation({workspaceDir:ROOT,candidatePath:B+'/candidate.pptx',finalPath,pythonExecutable:'/Users/lin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3',integrityValidatorPath:SKILL+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:SKILL+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit',...[3,5,6,7,8,11,12].flatMap(n=>['--require-native-table-slide',String(n)])],explicitTotalSlideCount:14,requiredNativeTableOwnerSlides:[3,5,6,7,8,11,12],requiredNativeChartOwnerSlides:[2],materializeLiteralChartWorkbooks:true,fontPolicy:{basis:'design',families:['Arial Unicode MS']},verifyArtifactToolImport:true,receiptPath:B+'/validation.json'});
console.log(JSON.stringify(result));
const p=await PresentationFile.importPptx(await FileBlob.load(finalPath));
await fs.mkdir(B+'/final-render',{recursive:true});
for(let i=0;i<p.slides.items.length;i++){
 const image=await p.export({slide:p.slides.items[i],format:'png',scale:1.5});
 await fs.writeFile(B+'/final-render/'+String(i+1).padStart(2,'0')+'.png',new Uint8Array(await image.arrayBuffer()));
 console.log('Final render '+(i+1));
}
