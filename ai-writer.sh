#!/usr/bin/env bash
set -e

INTERACTIVE=false
DRY_RUN=false
VERBOSE=false
FORCE=false
INPUT_FILE=""

# Write back with dry run first
# ./ai-writer.sh -d ai-output.txt

# Actually write the files  
# ./ai-writer.sh -f ai-output.txt

# Function to show usage
show_usage() {
  echo "Usage: $0 [-i] [-d] [-v] [-f] [input_file]"
  echo "  -i    Interactive mode (confirm each file write)"
  echo "  -d    Dry run (show what would be written without writing)"
  echo "  -v    Verbose mode (show detailed processing info)"
  echo "  -f    Force mode (overwrite without confirmation)"
  echo "  -h    Show this help message"
  echo ""
  echo "Input can be:"
  echo "  - A file containing AI extractor output"
  echo "  - Stdin (pipe content or paste interactively)"
  echo ""
  echo "Examples:"
  echo "  $0 ai-input.txt                     # Process file"
  echo "  $0 -d ai-input.txt                  # Dry run to see what would happen"
  echo "  $0 -i ai-input.txt                  # Interactive confirmation for each file"
  echo "  $0 -f ai-input.txt                  # Force overwrite without confirmation"
  echo "  pbpaste | $0                        # Process clipboard content"
  echo "  cat output.txt | $0 -v              # Process with verbose output"
}

# Parse flags
while getopts "idvfh" opt; do
  case $opt in
    i)
      INTERACTIVE=true
      ;;
    d)
      DRY_RUN=true
      ;;
    v)
      VERBOSE=true
      ;;
    f)
      FORCE=true
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

# Determine input source
if [ $# -gt 0 ]; then
  INPUT_FILE="$1"
  if [ ! -f "$INPUT_FILE" ]; then
    echo "Error: File '$INPUT_FILE' not found" >&2
    exit 1
  fi
fi

# Function to create directory if it doesn't exist
ensure_directory() {
  local file_path="$1"
  local dir_path=$(dirname "$file_path")
  
  if [ ! -d "$dir_path" ]; then
    if $VERBOSE; then
      echo "  📁 Creating directory: $dir_path"
    fi
    if ! $DRY_RUN; then
      mkdir -p "$dir_path"
    fi
  fi
}

# Function to confirm file write
confirm_write() {
  local file_path="$1"
  local exists="$2"
  
  if $FORCE; then
    return 0
  fi
  
  if $INTERACTIVE; then
    if $exists; then
      echo -n "File '$file_path' exists. Overwrite? [y/N]: "
    else
      echo -n "Write new file '$file_path'? [Y/n]: "
    fi
    read -r response
    case $response in
      [yY]|[yY][eE][sS]) return 0 ;;
      "") [ "$exists" = false ] && return 0 || return 1 ;;
      *) return 1 ;;
    esac
  fi
  
  return 0
}

# Function to write file content
write_file() {
  local file_path="$1"
  local content="$2"
  local file_exists=false
  
  [ -f "$file_path" ] && file_exists=true
  
  if $VERBOSE; then
    if $file_exists; then
      echo "  ✏️  Updating: $file_path"
    else
      echo "  ✨ Creating: $file_path"
    fi
    echo "  📊 Content size: $(echo "$content" | wc -c | tr -d ' ') bytes, $(echo "$content" | wc -l | tr -d ' ') lines"
  fi
  
  if $DRY_RUN; then
    echo "  [DRY RUN] Would write to: $file_path"
    if $VERBOSE && [ -n "$content" ]; then
      echo "  Content preview (first 3 lines):"
      echo "$content" | head -3 | sed 's/^/    /'
      local total_lines=$(echo "$content" | wc -l | tr -d ' ')
      if [ "$total_lines" -gt 3 ]; then
        echo "    ... ($(($total_lines - 3)) more lines)"
      fi
    fi
    return 0
  fi
  
  if ! confirm_write "$file_path" $file_exists; then
    echo "  ⏭️  Skipped: $file_path"
    return 0
  fi
  
  ensure_directory "$file_path"
  echo "$content" > "$file_path"
  
  if $VERBOSE || $INTERACTIVE; then
    echo "  ✅ Written: $file_path"
  fi
}

# Main processing function
process_content() {
  local current_file=""
  local current_content=""
  local file_count=0
  local line_number=0
  local in_file=false
  
  while IFS= read -r line; do
    ((line_number++))
    
    # Check if this is a file header line (starts with "File: ")
    if [[ "$line" =~ ^//\ File:\ (.+)$ ]]; then
      # Write previous file if we have one
      if [ -n "$current_file" ] && [ -n "$current_content" ]; then
        write_file "$current_file" "$current_content"
        ((file_count++))
      fi
      
      # Start new file
      current_file="${BASH_REMATCH[1]}"
      current_content=""
      in_file=true
      
      if $VERBOSE; then
        echo "🔍 Found file: $current_file (line $line_number)"
      fi
      
    elif $in_file; then
      # Add line to current file content
      if [ -n "$current_content" ]; then
        current_content="$current_content"$'\n'"$line"
      else
        current_content="$line"
      fi
    fi
  done
  
  # Write the last file if we have one
  if [ -n "$current_file" ] && [ -n "$current_content" ]; then
    write_file "$current_file" "$current_content"
    ((file_count++))
  fi
  
  echo ""
  echo "✅ Processing complete!"
  echo "📊 Files processed: $file_count"
}

# Show initial status
echo "AI Output File Writer"
echo "===================="
if $DRY_RUN; then
  echo "Mode: DRY RUN (no files will be written)"
elif $INTERACTIVE; then
  echo "Mode: Interactive (will confirm each write)"
elif $FORCE; then
  echo "Mode: Force (will overwrite without confirmation)"
else
  echo "Mode: Normal (will overwrite existing files)"
fi

if [ -n "$INPUT_FILE" ]; then
  echo "Input: $INPUT_FILE"
else
  echo "Input: stdin"
fi

echo "Verbose: $(if $VERBOSE; then echo 'ON'; else echo 'OFF'; fi)"
echo ""

# Process the input
if [ -n "$INPUT_FILE" ]; then
  process_content < "$INPUT_FILE"
else
  if [ -t 0 ]; then
    echo "Reading from stdin. Paste content and press Ctrl+D when done:"
    echo ""
  fi
  process_content
fi