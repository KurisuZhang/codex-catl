#!/usr/bin/env bash
# Usage: URL=http://host:8000/v1/completions MODEL=name TOK=/path/tokenizer bash 08_缓存压测.sh zero 16
# Run only against an isolated test endpoint. Server cache mode must be set beforehand.
set -euo pipefail
: "${URL:?Set URL to /v1/completions}"
: "${MODEL:?Set served model ID}"
: "${TOK:?Set matching local tokenizer path}"
mode=${1:?Choose zero or hot90}
concurrency=${2:-16}
case "$concurrency" in ''|*[!0-9]*) echo 'Concurrency must be a positive integer' >&2; exit 2;; esac
if ((concurrency < 1)); then exit 2; fi
case "$mode" in
 zero) prefix=0; suffix=12800;;
 hot90) prefix=11520; suffix=1280;;
 *) echo 'Choose zero or hot90' >&2; exit 2;;
esac
warmup=64
if ((concurrency > warmup)); then warmup=$concurrency; fi
outdir="${RESULT_ROOT:-./cache-results}/${mode}-c${concurrency}-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$outdir"
evalscope perf --help > "$outdir/tool-help.txt"
python -m pip show evalscope > "$outdir/tool-version.txt"
# Input length semantics verified against the referenced random_dataset.py implementation.
# Validate actual prompt_tokens=12800 on the installed version before the full run.
evalscope perf --api openai --stream \
 --url "$URL" --model "$MODEL" --tokenizer-path "$TOK" \
 --dataset random --tokenize-prompt --prefix-length "$prefix" \
 --min-prompt-length "$suffix" --max-prompt-length "$suffix" \
 --min-tokens 128 --max-tokens 128 --parallel "$concurrency" \
 --number "${REQUEST_COUNT:-2000}" --warmup-num "$warmup" \
 2>&1 | tee "$outdir/console.log"
# Retain EvalScope's detailed output directory printed in console.log.
# A hot90 run is only accepted as 90% after measuring cached/input tokens.
