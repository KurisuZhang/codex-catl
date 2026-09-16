#!/usr/bin/env bash
# Text-service benchmark template; not executed against any service during PPT creation.
# CLI reference: vLLM 0.27.0. Pin the client and verify --help before use.
set -euo pipefail
: "${MODEL:?Set MODEL to the deployed service model ID}"
: "${TOKENIZER:?Set TOKENIZER to the matching local tokenizer path or ID}"
BENCH_URL="${BENCH_URL:-http://127.0.0.1:8000}"
BENCH_DIR="${BENCH_DIR:-./benchmark-results-$(date +%Y%m%d-%H%M%S)}"
BENCH_PROMPTS="${BENCH_PROMPTS:-500}"
mkdir -p "$BENCH_DIR"
vllm --version > "$BENCH_DIR/client-version.txt"
vllm bench serve --help > "$BENCH_DIR/client-help.txt"

# Initial exploration only. Small-sample P99 is not a stable SLA estimate.
# No cache-hit claim: repeat-prefix workloads and server usage evidence are separate.
for lengths in '256 128' '1024 128' '256 512' '1024 512'; do
  read -r input_len output_len <<< "$lengths"
  for concurrency in 1 2 4 8 16 32; do
    for repeat in 1 2 3; do
      vllm bench serve \
        --backend openai --endpoint /v1/completions \
        --base-url "$BENCH_URL" --model "$MODEL" --tokenizer "$TOKENIZER" \
        --dataset-name random --input-len "$input_len" --output-len "$output_len" \
        --num-prompts "$BENCH_PROMPTS" --num-warmups 20 \
        --max-concurrency "$concurrency" --request-rate inf \
        --percentile-metrics ttft,tpot,itl,e2el --metric-percentiles 50,95,99 \
        --save-result --save-detailed --result-dir "$BENCH_DIR" \
        --result-filename "in${input_len}-out${output_len}-c${concurrency}-r${repeat}.json"
    done
  done
done
# Run a separate arrival-rate experiment by replacing inf with chosen rates.
# Preserve actual arrival rate, errors, duration, sample counts and server telemetry.
# For authenticated/chat-only endpoints, adapt the backend, endpoint, template and
# authentication using the installed client's help before running this script.
# request_goodput is requests/s. Aggregate qualified input/output/cache tokens
# separately, using the same request set and time window, before revenue analysis.
