#!/usr/bin/env bash
set -e

INTERACTIVE=false
DRY_RUN=false
VERBOSE=false
FORCE=false
ALLOW_DELETE=false
SAFE_DELETE=true
INPUT_FILE=""

# Write back with dry run first
# ./ai-writer.sh -d ai-output.txt

# Actually write the files  
# ./ai-writer.sh -f ai-output.txt

# Delete files with confirmation
# ./ai-writer.sh --delete ai-output.txt

# Delete files in dry run mode
# ./ai-writer.sh -d --delete ai-output.txt

# Function to show usage
show_usage() {
  echo "Usage: $0 [-i] [-d] [-v] [-f] [--delete] [--unsafe-delete] [input_file]"
  echo ""
  echo "File Operations:"
  echo "  -i, --interactive       Interactive mode (confirm each operation)"
  echo "  -d, --dry-run          Dry run (show what would happen without doing it)"
  echo "  -v, --verbose          Verbose mode (show detailed processing info)"
  echo "  -f, --force            Force mode (overwrite/delete without confirmation)"
  echo "  --delete               Enable file deletion (processes '// Delete:' lines)"
  echo "  --unsafe-delete        Allow deletion of system/important files"
  echo "  -h, --help             Show this help message"
  echo ""
  echo "Input can be:"
  echo "  - A file containing AI extractor output"
  echo "  - Stdin (pipe content or paste interactively)"
  echo ""
  echo "File Markers:"
  echo "  // File: path/to/file.ext    - Create/update file"
  echo "  // Delete: path/to/file.ext  - Delete file (requires --delete flag)"
  echo "  // Remove: path/to/file.ext  - Alias for Delete"
  echo ""
  echo "Examples:"
  echo "  $0 ai-input.txt                     # Process file (write only)"
  echo "  $0 -d ai-input.txt                  # Dry run to see what would happen"
  echo "  $0 -i ai-input.txt                  # Interactive confirmation for each file"
  echo "  $0 -f ai-input.txt                  # Force overwrite without confirmation"
  echo "  $0 --delete ai-input.txt            # Enable deletions with confirmation"
  echo "  $0 -d --delete ai-input.txt         # Dry run with deletions"
  echo "  $0 -f --delete ai-input.txt         # Force deletions without confirmation"
  echo "  pbpaste | $0                        # Process clipboard content"
  echo "  cat output.txt | $0 -v              # Process with verbose output"
  echo ""
  echo "Safety Notes:"
  echo "  - Deletions are disabled by default (use --delete to enable)"
  echo "  - System files and important directories are protected"
  echo "  - Use --unsafe-delete to bypass safety checks (not recommended)"
}

# Parse flags
while [[ $# -gt 0 ]]; do
  case $1 in
    -i|--interactive)
      INTERACTIVE=true
      shift
      ;;
    -d|--dry-run)
      DRY_RUN=true
      shift
      ;;
    -v|--verbose)
      VERBOSE=true
      shift
      ;;
    -f|--force)
      FORCE=true
      shift
      ;;
    --delete)
      ALLOW_DELETE=true
      shift
      ;;
    --unsafe-delete)
      ALLOW_DELETE=true
      SAFE_DELETE=false
      shift
      ;;
    -h|--help)
      show_usage
      exit 0
      ;;
    -*)
      echo "Invalid option: $1" >&2
      show_usage
      exit 1
      ;;
    *)
      INPUT_FILE="$1"
      shift
      ;;
  esac
done

# Validate input file
if [ -n "$INPUT_FILE" ] && [ ! -f "$INPUT_FILE" ]; then
  echo "Error: File '$INPUT_FILE' not found" >&2
  exit 1
fi

# Safety check for protected paths
is_protected_path() {
  local file_path="$1"
  local protected_patterns=(
    "^/bin/"
    "^/sbin/"
    "^/usr/bin/"
    "^/usr/sbin/"
    "^/etc/"
    "^/boot/"
    "^/sys/"
    "^/proc/"
    "^/dev/"
    "^/var/log/"
    "^/var/run/"
    "^/tmp/\\.\\."
    "^/home/[^/]*/\\."
    "^\\.\\./"
    "package\\.json$"
    "package-lock\\.json$"
    "yarn\\.lock$"
    "Cargo\\.toml$"
    "Cargo\\.lock$"
    "go\\.mod$"
    "go\\.sum$"
    "\\.git/"
    "\\.gitignore$"
    "README\\."
    "LICENSE"
    "COPYING"
  )
  
  if ! $SAFE_DELETE; then
    return 1  # Allow deletion if unsafe mode is enabled
  fi
  
  for pattern in "${protected_patterns[@]}"; do
    if [[ "$file_path" =~ $pattern ]]; then
      return 0  # Protected
    fi
  done
  
  return 1  # Not protected
}

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

# Function to confirm operations
confirm_operation() {
  local operation="$1"
  local file_path="$2"
  local exists="$3"
  
  if $FORCE; then
    return 0
  fi
  
  if $INTERACTIVE; then
    case $operation in
      "write")
        if $exists; then
          echo -n "File '$file_path' exists. Overwrite? [y/N]: "
        else
          echo -n "Write new file '$file_path'? [Y/n]: "
        fi
        ;;
      "delete")
        echo -n "🗑️  Delete file '$file_path'? [y/N]: "
        ;;
    esac
    
    read -r response
    case $response in
      [yY]|[yY][eE][sS]) return 0 ;;
      "") 
        if [ "$operation" = "write" ] && [ "$exists" = false ]; then
          return 0
        else
          return 1
        fi
        ;;
      *) return 1 ;;
    esac
  fi
  
  return 0
}

# Function to delete file
delete_file() {
  local file_path="$1"
  local file_exists=false
  
  [ -f "$file_path" ] && file_exists=true
  
  if ! $file_exists; then
    if $VERBOSE; then
      echo "  ⚠️  File not found (already deleted?): $file_path"
    fi
    return 0
  fi
  
  # Safety check
  if is_protected_path "$file_path"; then
    echo "  🛡️  PROTECTED: Refusing to delete system/important file: $file_path"
    if ! $SAFE_DELETE; then
      echo "    (Use --unsafe-delete to override, but this is dangerous!)"
    fi
    return 1
  fi
  
  if $VERBOSE; then
    echo "  🗑️  Deleting: $file_path"
    if [ -f "$file_path" ]; then
      local file_size=$(stat -f%z "$file_path" 2>/dev/null || stat -c%s "$file_path" 2>/dev/null || echo "unknown")
      echo "  📊 File size: $file_size bytes"
    fi
  fi
  
  if $DRY_RUN; then
    echo "  [DRY RUN] Would delete: $file_path"
    return 0
  fi
  
  if ! confirm_operation "delete" "$file_path" true; then
    echo "  ⏭️  Skipped deletion: $file_path"
    return 0
  fi
  
  rm "$file_path"
  
  if $VERBOSE || $INTERACTIVE; then
    echo "  ✅ Deleted: $file_path"
  fi
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
  
  if ! confirm_operation "write" "$file_path" $file_exists; then
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
  local delete_count=0
  local line_number=0
  local in_file=false
  
  while IFS= read -r line; do
    ((line_number++))
    
    # Check if this is a file header line (starts with "// File: ")
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
      
    # Check if this is a delete line (starts with "// Delete: " or "// Remove: ")
    elif [[ "$line" =~ ^//\ (Delete|Remove):\ (.+)$ ]]; then
      # Write previous file if we have one
      if [ -n "$current_file" ] && [ -n "$current_content" ]; then
        write_file "$current_file" "$current_content"
        ((file_count++))
      fi
      
      # Reset file state
      current_file=""
      current_content=""
      in_file=false
      
      local delete_file_path="${BASH_REMATCH[2]}"
      
      if $VERBOSE; then
        echo "🗑️  Found delete instruction: $delete_file_path (line $line_number)"
      fi
      
      if $ALLOW_DELETE; then
        delete_file "$delete_file_path"
        ((delete_count++))
      else
        echo "  ⚠️  DELETE DISABLED: Would delete '$delete_file_path' (use --delete flag to enable)"
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
  echo "📊 Files written: $file_count"
  if $ALLOW_DELETE; then
    echo "🗑️  Files deleted: $delete_count"
  fi
  if ! $ALLOW_DELETE && $delete_count -gt 0; then
    echo "⚠️  Delete instructions found but ignored (use --delete to enable)"
  fi
}

# Show initial status
echo "AI Output File Writer & Deleter"
echo "==============================="
if $DRY_RUN; then
  echo "Mode: DRY RUN (no files will be written or deleted)"
elif $INTERACTIVE; then
  echo "Mode: Interactive (will confirm each operation)"
elif $FORCE; then
  echo "Mode: Force (will overwrite/delete without confirmation)"
else
  echo "Mode: Normal (will overwrite existing files)"
fi

echo "Delete operations: $(if $ALLOW_DELETE; then echo 'ENABLED'; else echo 'DISABLED (use --delete to enable)'; fi)"
if $ALLOW_DELETE; then
  echo "Safety mode: $(if $SAFE_DELETE; then echo 'ON (protected files safe)'; else echo 'OFF (--unsafe-delete enabled)'; fi)"
fi

if [ -n "$INPUT_FILE" ]; then
  echo "Input: $INPUT_FILE"
else
  echo "Input: stdin"
fi

echo "Verbose: $(if $VERBOSE; then echo 'ON'; else echo 'OFF'; fi)"
echo ""

# Safety warning for deletion
if $ALLOW_DELETE && ! $DRY_RUN; then
  echo "⚠️  WARNING: File deletion is enabled!"
  if ! $SAFE_DELETE; then
    echo "🚨 DANGER: Unsafe deletion mode - system files are NOT protected!"
  fi
  if ! $FORCE && ! $INTERACTIVE; then
    echo "Files will be deleted without confirmation (use -i for interactive mode)"
  fi
  echo ""
fi

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