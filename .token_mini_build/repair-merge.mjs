import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const p=await PresentationFile.importPptx(await FileBlob.load('/Users/lin/Desktop/catl/output/token_mini/Token魔方Mini实验台_完整合并版.pptx'));
await(await PresentationFile.exportPptx(p)).save('/Users/lin/Desktop/catl/.token_mini_build/merged-repaired/candidate.pptx');
console.log(p.slides.items.length);
