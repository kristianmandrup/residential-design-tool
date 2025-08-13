#!/usr/bin/env bash
set -e

OUTPUT_FILE="ai-input.txt"
INTERACTIVE=false
CLEAR_FILE=false
QUIET_MODE=false

# Function to show usage
show_usage() {
  echo "Usage: $0 [-i] [-c] [-q] [paths...]"
  echo "  -i    Interactive mode (enter paths interactively)"
  echo "  -c    Clear output file before processing"
  echo "  -q    Quiet mode (don't print file contents to console)"
  echo "  -h    Show this help message"
  echo ""
  echo "Examples:"
  echo "  $0 src/components                    # Process directory, show content"
  echo "  $0 -c src/file.tsx                  # Clear file first, then process"
  echo "  $0 -q src/components                # Process quietly (only to file)"
  echo "  $0 -cq src/components               # Clear file, process quietly"
  echo "  $0 -i                               # Interactive mode"
  echo "  $0 -c -i src/components             # Clear file, process args, then interactive"
}

# Parse flags
while getopts "icqh" opt; do
  case $opt in
    i)
      INTERACTIVE=true
      ;;
    c)
      CLEAR_FILE=true
      ;;
    q)
      QUIET_MODE=true
      ;;
    h)
      show_usage
      exit 0
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      show_usage
      exit 1
      ;;
  esac
done

# Shift to remove processed options
shift $((OPTIND-1))

# Clear file if requested
if $CLEAR_FILE; then
  echo "Clearing $OUTPUT_FILE..."
  > "$OUTPUT_FILE"
  echo "File cleared."
  echo ""
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
  local file_count=0
  local processed_paths=()
  
  # Count files and collect paths for summary
  for path in "$@"; do
    processed_paths+=("$path")
    if [ -f "$path" ]; then
      ((file_count++))
    elif [ -d "$path" ]; then
      local dir_files=$(find "$path" -type f -not -path "*/.git/*" -not -path "*/node_modules/*" | wc -l)
      file_count=$((file_count + dir_files))
    fi
  done

  echo "Processing ${#processed_paths[@]} path(s), estimated $file_count file(s)..."
  echo ""

  if $QUIET_MODE; then
    # Quiet mode: only output to file, show progress to console
    {
      for path in "$@"; do
        process_path "$path"
      done
    } >> "$OUTPUT_FILE"
    
    # Copy to clipboard
    pbcopy < "$OUTPUT_FILE"
    
    echo "✅ Processing complete!"
  else
    # Normal mode: output to both console and file
    {
      for path in "$@"; do
        process_path "$path"
      done
    } | tee -a "$OUTPUT_FILE" | pbcopy
    
    echo "✅ Processing complete!"
  fi
  
  # Show summary
  echo ""
  echo "📄 Output saved to: $(pwd)/$OUTPUT_FILE"
  echo "📋 Content copied to clipboard"
  
  # Show file size
  if [ -f "$OUTPUT_FILE" ]; then
    local file_size=$(du -h "$OUTPUT_FILE" | cut -f1)
    local line_count=$(wc -l < "$OUTPUT_FILE")
    echo "📊 File size: $file_size, Lines: $line_count"
  fi
  
  echo ""
}

interactive_loop() {
  echo "Interactive mode: paste paths, press Enter twice to process, empty line to quit."
  echo "Current mode: $(if $QUIET_MODE; then echo 'Quiet (file only)'; else echo 'Normal (console + file)'; fi)"
  echo ""
  
  while true; do
    batch=()
    echo "Enter paths (press Enter twice when done, or empty line to quit):"
    while IFS= read -r line; do
      [ -z "$line" ] && break
      batch+=("$line")
    done
    if [ ${#batch[@]} -eq 0 ]; then
      echo "Exiting interactive mode."
      break
    fi
    run_processing "${batch[@]}"
    echo "Ready for next batch..."
    echo ""
  done
}

# Show initial status
echo "AI Content Extractor"
echo "==================="
if $CLEAR_FILE; then
  echo "Mode: Clear + $(if $QUIET_MODE; then echo 'Quiet'; else echo 'Normal'; fi)"
else
  echo "Mode: $(if $QUIET_MODE; then echo 'Quiet'; else echo 'Normal'; fi) (append)"
fi
echo "Output: $(pwd)/$OUTPUT_FILE"
echo ""

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