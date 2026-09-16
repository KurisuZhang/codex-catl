import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const ROOT='/Users/lin/Desktop/catl',B=ROOT+'/.token_mini_build/software-v3';
const SKILL='/Users/lin/.codex/plugins/cache/openai-primary-runtime/presentations/26.909.12148/skills/presentations';
const finalPath=ROOT+'/output/token_mini/分主题审阅/05_软件架构_v3.pptx';
const {finalizePresentation}=await import(pathToFileURL(SKILL+'/container_tools/artifact_tool_utils.mjs').href);
await finalizePresentation({workspaceDir:ROOT,candidatePath:B+'/candidate.pptx',finalPath,pythonExecutable:'/Users/lin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3',integrityValidatorPath:SKILL+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:SKILL+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit','--require-native-table-slide','1','--require-native-table-slide','2'],explicitTotalSlideCount:2,requiredNativeTableOwnerSlides:[1,2],requiredNativeChartOwnerSlides:[],fontPolicy:{basis:'design',families:['Arial Unicode MS']},verifyArtifactToolImport:true,receiptPath:B+'/validation.json'});
const p=await PresentationFile.importPptx(await FileBlob.load(finalPath));
for(let i=0;i<2;i++){let im=await p.export({slide:p.slides.items[i],format:'png',scale:1.5});await fs.writeFile(B+'/final-'+(i+1)+'.png',new Uint8Array(await im.arrayBuffer()));}
console.log('Finalized and rendered 2 slides');
