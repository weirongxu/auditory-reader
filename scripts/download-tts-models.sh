#!/usr/bin/env bash
set -euo pipefail

BASE_URL="https://github.com/k2-fsa/sherpa-onnx/releases/download"
VOCODER_URL="https://github.com/k2-fsa/sherpa-onnx/releases/download/vocoder-models/hifigan_v2.onnx"

DEST_DIR="server-data/tts-models"
mkdir -p "$DEST_DIR"

download() {
  local url="$1" dest="$2"
  if [ -e "$dest" ]; then
    echo "skip (exists): $dest"
    return
  fi
  echo "downloading: $url"
  curl -fL --retry 3 -o "$dest.part" "$url"
  mv "$dest.part" "$dest"
}

download_and_extract() {
  local asset="$1"
  local name="${asset%.tar.bz2}"
  download "$BASE_URL/tts-models/$asset" "$DEST_DIR/$asset"
  if [ ! -d "$DEST_DIR/$name" ]; then
    echo "extracting: $asset"
    tar -xjf "$DEST_DIR/$asset" -C "$DEST_DIR"
  fi
  echo "done: $name"
}

download_vocoder() {
  download "$VOCODER_URL" "$DEST_DIR/hifigan_v2.onnx"
}

MODEL="${1:-all}"
case "$MODEL" in
  kokoro)
    download_and_extract "kokoro-int8-multi-lang-v1_1.tar.bz2"
    ;;
  matcha)
    download_and_extract "matcha-icefall-zh-baker.tar.bz2"
    download_vocoder
    ;;
  melo)
    download_and_extract "vits-melo-tts-zh_en.tar.bz2"
    ;;
  all)
    download_and_extract "kokoro-int8-multi-lang-v1_1.tar.bz2"
    download_and_extract "matcha-icefall-zh-baker.tar.bz2"
    download_vocoder
    download_and_extract "vits-melo-tts-zh_en.tar.bz2"
    ;;
  *)
    echo "usage: $0 [kokoro|matcha|melo|all]" >&2
    exit 1
    ;;
esac
