#!/usr/bin/env bash
set -e

OUTPUT_FILE="ai-input.txt"
INTERACTIVE=false

# Detect -i flag
if [ "$1" == "-i" ]; then
  INTERACTIVE=true
  shift
fi

process_path() {
  local path="$1"
  path=$(echo "$path" | tr -d '\r\n\t ')
  [ -z "$path" ] && return

  if [ -d "$path" ]; then
    if [ -z "$(find "$path" -maxdepth 1 -type f)" ]; then
      echo "Directory $path is empty or contains no files."
      echo ""
      return
    fi
    find "$path" -type f -not -path "*/.git/*" -not -path "*/node_modules/*" -print0 |
      while IFS= read -r -d '' file; do
        echo "File: $file"
        timeout 5 cat "$file" 2>/dev/null || echo "Error: Could not read $file (skipped)"
        echo ""
        echo ""        
      done
  elif [ -f "$path" ]; then
    echo "File: $path"
    timeout 5 cat "$path" 2>/dev/null || echo "Error: Could not read $path (skipped)"
    echo ""
    echo ""    
  else
    echo "Error: Invalid path $path (not a file or directory)"
    echo ""
  fi
}

run_processing() {
  {
    for path in "$@"; do
      process_path "$path"
    done
  } | tee /dev/tty "$OUTPUT_FILE" | pbcopy
}

interactive_loop() {
  echo "Interactive mode: paste paths, press Enter twice to process, empty line to quit."
  while true; do
    batch=()
    while IFS= read -r line; do
      [ -z "$line" ] && break
      batch+=("$line")
    done
    if [ ${#batch[@]} -eq 0 ]; then
      echo "Exiting."
      break
    fi
    run_processing "${batch[@]}"
  done
}

# Logic flow
if $INTERACTIVE; then
  # If args given, process them first
  if [ $# -gt 0 ]; then
    run_processing "$@"
  fi
  interactive_loop
else
  if [ $# -gt 0 ]; then
    run_processing "$@"
    exit 0
  else
    # No args, no -i → default to interactive mode
    INTERACTIVE=true
    interactive_loop
  fi
fi
