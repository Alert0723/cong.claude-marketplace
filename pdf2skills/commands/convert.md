---
description: Convert PDF file to Claude skills
allowed-tools: Bash, Read, AskUserQuestion
---

# pdf2skills Convert

Convert a PDF document to Claude Code skills using the pdf2skills pipeline.

## Usage

```
/pdf2skills:convert <pdf_path> [--output-dir <dir>] [--language <ch|en>] [--resume]
```

### Parameters

- **`pdf_path`** (required): Path to PDF file
- **`--output-dir`** or **`-o`**: Output directory for generated skills (default: `<pdf_name>_output`)
- **`--language`** or **`-l`**: PDF language for OCR processing - `ch` (Chinese) or `en` (English) (default: `ch`)
- **`--resume`**: Resume mode - continue from previous interruption

## Step 1: Validate PDF File

Check if the specified PDF file exists:

```bash
if [ ! -f "${1}" ]; then
  echo "Error: PDF file not found: ${1}"
  exit 1
fi
```

**Windows PowerShell**:
```powershell
if (-not (Test-Path "${1}")) {
  Write-Error "PDF file not found: ${1}"
  exit 1
}
```

## Step 2: Check Environment Configuration

Verify that the .env file exists and contains API keys:

```bash
ENV_FILE="${CLAUDE_PLUGIN_ROOT}/skills/pdf2skills/scripts/.env"
if [ ! -f "${ENV_FILE}" ]; then
  echo "Error: Configuration file not found. Please run /pdf2skills:setup first."
  exit 1
fi

# Check for placeholder API keys
if grep -q "SILICONFLOW_API_KEY=your_siliconflow_api_key" "${ENV_FILE}" || \
   grep -q "MINERU_API_KEY=your_mineru_api_key" "${ENV_FILE}"; then
  echo "Error: API keys not configured. Please update .env file with your API keys."
  echo "Run /pdf2skills:setup to configure."
  exit 1
fi
```

## Step 3: Parse Command Arguments

Extract parameters from command arguments:

- First argument is PDF path
- Parse optional flags: `--output-dir`, `--language`, `--resume`

**Example argument parsing logic**:

```bash
pdf_path="${1}"
output_dir=""
language="ch"
resume=false

shift
while [ $# -gt 0 ]; do
  case "$1" in
    --output-dir|-o)
      output_dir="$2"
      shift 2
      ;;
    --language|-l)
      language="$2"
      shift 2
      ;;
    --resume)
      resume=true
      shift
      ;;
    *)
      echo "Unknown argument: $1"
      shift
      ;;
  esac
done
```

## Step 4: Prepare Output Directory

If output directory not specified, create default:

```bash
if [ -z "${output_dir}" ]; then
  pdf_basename=$(basename "${pdf_path}" .pdf)
  output_dir="./${pdf_basename}_output"
fi

# Create output directory if it doesn't exist
mkdir -p "${output_dir}"
```

## Step 5: Run Conversion Pipeline

Execute the run_pipeline.py script with appropriate arguments:

```bash
cd "${CLAUDE_PLUGIN_ROOT}/skills/pdf2skills/scripts"

# Build command arguments
cmd_args=("python" "run_pipeline.py" "${pdf_path}")

if [ -n "${output_dir}" ]; then
  cmd_args+=("--output-dir" "${output_dir}")
fi

if [ -n "${language}" ]; then
  cmd_args+=("--language" "${language}")
fi

if [ "${resume}" = true ]; then
  cmd_args+=("--resume")
fi

# Execute pipeline
echo "Starting pdf2skills pipeline..."
echo "Command: ${cmd_args[@]}"
"${cmd_args[@]}"
```

**Windows PowerShell alternative**:
```powershell
cd "${CLAUDE_PLUGIN_ROOT}/skills/pdf2skills/scripts"

$cmdArgs = @("python", "run_pipeline.py", "${1}")

if ($output_dir) {
  $cmdArgs += "--output-dir"
  $cmdArgs += $output_dir
}

if ($language) {
  $cmdArgs += "--language"
  $cmdArgs += $language
}

if ($resume) {
  $cmdArgs += "--resume"
}

Write-Host "Starting pdf2skills pipeline..."
Write-Host "Command: $cmdArgs"
& $cmdArgs[0] $cmdArgs[1..($cmdArgs.Length-1)]
```

## Step 6: Monitor Progress

The pipeline will display progress through multiple stages:
1. PDF → Markdown (MinerU API)
2. Markdown → Chunks (Onion Peeler)
3. Chunks → Density Scores (Semantic Density)
4. Chunks → SKUs (SKU Extractor)
5. SKUs → Fused SKUs (Knowledge Fusion)
6. SKUs → Claude Skills (Skill Generator)
7. Skills → Router (Router Generator)
8. SKUs → Glossary (Glossary Extractor)

Each stage will show progress indicators. If interrupted, the pipeline can be resumed with the `--resume` flag.

## Step 7: Output Results

After completion, show the generated outputs:

```bash
echo "Conversion complete!"
echo "Generated outputs:"
echo "  - Skills directory: ${output_dir}/full_chunks_skus/generated_skills/"
echo "  - Router file: ${output_dir}/full_chunks_skus/router.json"
echo "  - Glossary file: ${output_dir}/full_chunks_skus/glossary.json"
```

List generated skills if index.md exists:

```bash
if [ -f "${output_dir}/full_chunks_skus/generated_skills/index.md" ]; then
  echo "Generated skills:"
  cat "${output_dir}/full_chunks_skus/generated_skills/index.md"
fi
```

## Step 8: Error Handling

If pipeline fails, check common issues:

1. **API rate limits**: Wait and retry with `--resume` flag
2. **Network connectivity**: Check internet connection
3. **Insufficient API credits**: Verify API key balance
4. **PDF format issues**: Try different PDF or OCR language setting

Provide troubleshooting guidance based on error messages.

## Step 9: Cleanup (Optional)

Ask user if they want to clean up intermediate files (keep only final skills):

```bash
# Option to remove intermediate directories
echo "Intermediate files occupy significant space."
echo "Remove intermediate files (keep only generated_skills/)?"
# Use AskUserQuestion for confirmation
```

If user confirms, remove intermediate directories while preserving the final skills.

## Notes

- Large PDFs may take significant time (30+ minutes for 100+ pages)
- API usage may incur costs (check SiliconFlow and MinerU pricing)
- Resume mode requires the original output directory structure to be intact
- Generated skills follow Claude Code skill format and can be used directly