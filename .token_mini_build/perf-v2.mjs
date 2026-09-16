import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {Presentation,PresentationFile,FileBlob} from '@oai/artifact-tool';
const ROOT='/Users/lin/Desktop/catl',B=ROOT+'/.token_mini_build/perf-v2';
const SKILL='/Users/lin/.codex/plugins/cache/openai-primary-runtime/presentations/26.909.12148/skills/presentations';
const C={navy:'#12304A',ink:'#233D50',teal:'#008E9C',blue:'#377BB5',muted:'#667B89',line:'#D4E0E6',bg:'#F8FAFB',pale:'#E6F3F4',white:'#FFFFFF',amber:'#9B641C'};
const F='Arial Unicode MS';
const p=Presentation.create({slideSize:{width:1280,height:720}});
function box(s,x,y,w,h,fill=C.white,stroke=C.line){return s.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:h},fill,line:{fill:stroke,width:1}})}
function txt(s,v,x,y,w,h,size=22,color=C.ink,bold=false,align='left'){const a=s.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});a.text=v;a.text.style={typeface:F,fontSize:size,color,bold,alignment:align,verticalAlignment:'middle',wrap:'square',autoFit:'none',insets:{top:0,bottom:0,left:0,right:0}};return a;}
function node(s,v,x,y,w,h,fill=C.white,color=C.ink,size=20){box(s,x,y,w,h,fill);return txt(s,v,x+5,y+2,w-10,h-4,size,color,false,'center');}
function header(n,sub,lead){let s=p.slides.add();s.background.fill=C.bg;txt(s,'B1  性能测试',60,28,1160,61,46,C.navy,true);txt(s,sub,62,96,1156,46,30,C.teal,true);txt(s,lead,62,148,1156,43,20,C.muted);box(s,60,659,1160,1,C.line,C.line);txt(s,'token 魔方 Mini实验台',60,674,1000,22,15,C.muted);txt(s,n+' / 18',1105,674,115,22,15,C.muted,false,'right');return s;}
function table(s,vals,x,y,width,widths,heights,size=20){let t=s.tables.add({rows:vals.length,columns:vals[0].length,left:x,top:y,width,height:heights.reduce((a,b)=>a+b,0),columnWidths:widths,values:vals});t.borders.assign({style:'solid',fill:C.line,width:1});t.cells.block({row:0,column:0,rowCount:vals.length,columnCount:vals[0].length}).assign({textStyle:{fontSize:size,typeface:F,color:C.ink},margins:{left:10,right:8,top:0,bottom:0},anchor:'center'});for(let r=0;r<vals.length;r++){t.rows[r].height=heights[r];for(let c=0;c<vals[0].length;c++){let z=t.getCell(r,c);z.fill=r===0?C.navy:(r%2?C.white:'#EDF4F6');z.text.style={fontSize:size,typeface:F,color:r===0?C.white:C.ink,bold:r===0||c===0};}}return t;}


const refs='查询2026-09-16：\nhttps://docs.vllm.ai/en/latest/benchmarking/cli/\nhttps://docs.vllm.ai/en/latest/cli/bench/serve/\nhttps://github.com/sgl-project/sglang/blob/main/docs/developer_guide/benchmark_and_profiling.md\nhttps://github.com/modelscope/evalscope/blob/main/docs/en/user_guides/stress_test/quick_start.md\nhttps://docs.vllm.ai/en/latest/design/metrics/';
{
let s=header('11','压测方法：逐级加压，找到满足服务目标的最大并发','从独立压测机直连推理服务测基线，再经 MASS 复测；固定模型、精度、卡数、长度和缓存场景。');
txt(s,'01  选择开源压测工具',62,201,1156,33,25,C.teal,true);
const v=[['工具','调用入口','本项目用法'],['vLLM 自带工具','vllm bench serve','设置 --max-concurrency 与 --request-rate'],['SGLang 自带工具','python -m sglang.bench_serving','设置 --max-concurrency，导出逐请求结果'],['EvalScope（统一复测）','evalscope perf --api openai --stream','使用 --parallel 扫并发，对齐两类服务的负载']];
table(s,v,60,245,1160,[240,430,490],[32,34,34,34],18);
const x=[62,460,858];const data=[
['02  构造三组负载','无命中：独立前缀，核验命中≈0\n有命中：预热公共前缀＋不同后缀\n混合：按业务比例组合，实测命中率'],
['03  逐级增加并发','示例：1、2、4、8、16、32…\n临界区细扫，直至超时 / SLA 失败\n记录实际在途请求与服务端排队'],
['04  复测最大可用并发','每档预热后测稳态，临界点重复3次\n吞吐不再增加且延迟上升时标饱和\n最大可用并发须满足延迟与成功率']];
for(let i=0;i<3;i++){txt(s,data[i][0],x[i],401,365,35,24,C.teal,true);txt(s,data[i][1],x[i],445,365,94,20,C.ink);}
txt(s,'测量纪律：流式响应计时；预热不计入；三组保持相同输入 / 输出长度；记录失败与提前结束。',62,562,1156,30,21,C.navy,true);
txt(s,'交付结果：并发—吞吐—P95 延迟曲线，分别标注饱和点与满足 SLA 的最大可用并发。',62,603,1156,33,23,C.teal,true);
s.speakerNotes.textFrame.setText('并发阶梯、稳态复测次数为本项目测试方案，不是工具默认规则。先定义P95 TTFT/TPOT或E2E及成功率阈值。达到配置并发不等于服务端实际运行同等请求数，需记录在途、运行、等待和请求速率。闭环并发压测用无限到达率结合max-concurrency，有利于测给定并发承载；另按真实到达率做开放负载测试，验证队列不会持续增长。建议每档预热后至少测5分钟，临界点重复3次，再做30分钟持续验证；样本不足时延长。所有具体时长是建议。工具版本/参数以冻结版本--help核对，不能把SGLang工具误当作必须部署SGLang服务。缓存命中由服务端实际计数校验，重启或重置缓存应只在隔离测试实例上操作。缓存预热在计时外，正式缓存用例使用相同token前缀和不同后缀。前缀模板/BOS/系统提示会影响块级命中。压力机CPU网络需留余量。\n'+refs);
}
{
let s=header('12','记录指标：延迟、并发与三类 Token 吞吐','每个模型 × 精度 × 卡数 × 长度组合 × 缓存场景 × 并发档，单独保留一行结果和原始请求记录。');
const v=[['必须记录的指标','定义与单位','统计 / 取数方式'],
['并发与可靠性','配置 / 实际并发、请求速率、成功率\n超时数、错误数、排队长度','压测端请求日志＋服务端运行 / 等待指标'],
['TTFT：首 Token 延迟','首个有效输出 Token 时间－请求发出时间\n单位 ms，记录 P50 / P95 / P99','客户端流式计时，包含网络、排队和 Prefill'],
['TPOT：平均后续 Token 间隔','（最后 Token 时间－首 Token 时间）/（输出数－1）\n单位 ms/token，输出数≤1时不计算','逐请求计算再汇总分位数；另存 E2E 延迟'],
['Prefill 无命中吞吐','Σ（输入 Token－命中 Token）×60 / T\n单位 token/min','分别报告冷 / 热 / 混合场景，T 为统一计时秒数'],
['Prefill 缓存命中吞吐','Σ 命中 Token ×60 / T\n单位 token/min，表示缓存复用服务量','读实际 cached_tokens；缺失则标不可得'],
['Decode 输出吞吐','Σ 实际输出 Token ×60 / T\n单位 token/min','以实际返回 Token 计数，不能使用最大输出长度'],
['辅助与资源指标','输入 / 输出总量、命中率、E2E 分位数\n逐卡峰值显存、利用率、功率 / 网络','命中率＝命中输入 / 总输入；保留版本与卡数']];
table(s,v,60,201,1160,[260,540,360],[35,46,46,46,46,46,46,46],18);
txt(s,'口径：统一测量窗口及请求集合；报告成功请求吞吐，同时保留失败请求数量和资源消耗。',62,584,1156,29,21,C.teal,true);
txt(s,'缓存命中吞吐不是重新计算的算力吞吐。混部测得的是服务吞吐，不能直接当作独立 P / D 集群产能。',62,623,1156,27,18,C.muted);
s.speakerNotes.textFrame.setText('T为统一测量窗口秒数；同一批成功请求及其输入、实际命中、实际输出构成可对账数据。推荐测量阶段请求全部完成或超时后结束计时，包含排空时间，预热请求排除。若选择固定稳态窗口，只统计窗口内事件并明确跨界请求处理，不混用两种口径。客户端计时应记录发送、首有效token、最后有效token、请求结束时间。SSE空块、角色块不算首token，一个chunk可能包含多个token，因此只能估计token间隔时需明确标注；TPOT按实际token数量和首末时刻计算，不把每个chunk当token。TTFT并非纯prefill时延，需纯计算耗时另采引擎prefill/queue指标。TPOT逐请求后汇总，不能拿吞吐倒数替代。cached_tokens必须是实际复用量，不可使用设计前缀长度代替；如用服务端Prometheus计数，核实版本、单位和是否包含预热/失败/其他流量，计数器重启与跨卡汇总也要处理，不能无条件与成功请求口径混算。量化、缓存配置、引擎版本、镜像、并行、输入输出长度、工具、随机种子及完整命令都归档。单卡归一化token/s=token/min÷60÷实际占用卡数，仅作为同规格平均值；PD混部不能按同一批卡重复计算两份产能。所有表格为空白记录规范，未伪造测试结果。\n'+refs);
}
await fs.mkdir(B,{recursive:true});await(await PresentationFile.exportPptx(p)).save(B+'/candidate.pptx');
for(let i=0;i<2;i++){const im=await p.export({slide:p.slides.items[i],format:'png',scale:1.5});await fs.writeFile(B+'/draft-'+(i+1)+'.png',new Uint8Array(await im.arrayBuffer()));}
