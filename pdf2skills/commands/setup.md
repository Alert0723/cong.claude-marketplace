---
description: Set up pdf2skills environment (Python dependencies, spaCy model, API configuration)
allowed-tools: Bash, Read, Edit, Write, AskUserQuestion
---

# pdf2skills Setup

This command sets up the pdf2skills plugin environment, including:
1. Python environment check (Python 3.8+)
2. Install Python dependencies from requirements.txt
3. Download spaCy English model (`en_core_web_sm`)
4. Create configuration file template (.env)
5. Prompt for API key configuration

## Step 1: Check Python Environment

Check if Python 3.8+ is available:

**macOS/Linux**:
```bash
python3 --version
```

**Windows**:
```powershell
python --version
```

If Python is not installed or version is below 3.8, ask user to install Python 3.8+ first.

## Step 2: Install Dependencies

Navigate to the plugin scripts directory and install Python dependencies:

```bash
cd "${CLAUDE_PLUGIN_ROOT}/skills/pdf2skills/scripts"
pip install -r requirements.txt
```

If `pip` is not available, try `pip3`. If permission error occurs, suggest using `--user` flag or virtual environment.

## Step 3: Download spaCy Model

Download the English language model for spaCy:

```bash
python -m spacy download en_core_web_sm
```

If using Python 3 explicitly, use `python3` instead.

## Step 4: Check Existing Configuration

Check if `.env` file already exists in the scripts directory:

```bash
if [ -f "${CLAUDE_PLUGIN_ROOT}/skills/pdf2skills/scripts/.env" ]; then
  echo "Configuration file already exists"
  cat "${CLAUDE_PLUGIN_ROOT}/skills/pdf2skills/scripts/.env"
else
  echo "No configuration file found"
fi
```

If configuration exists, ask user if they want to update it.

## Step 5: Create/Update Configuration

Copy `.env.example` to `.env` and prompt user for API keys:

```bash
cd "${CLAUDE_PLUGIN_ROOT}/skills/pdf2skills/scripts"
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "Created .env configuration file"
fi
```

### Ask for API Keys

Use AskUserQuestion to get API keys from user:

1. **SiliconFlow API Key**: Required for LLM processing
2. **MinerU API Key**: Required for PDF to Markdown conversion

If user provides keys, update the `.env` file:

```bash
sed -i "s|SILICONFLOW_API_KEY=.*|SILICONFLOW_API_KEY=${SILICONFLOW_KEY}|" .env
sed -i "s|MINERU_API_KEY=.*|MINERU_API_KEY=${MINERU_KEY}|" .env
```

**Windows PowerShell alternative**:
```powershell
(Get-Content .env) -replace 'SILICONFLOW_API_KEY=.*', "SILICONFLOW_API_KEY=${SILICONFLOW_KEY}" | Set-Content .env
(Get-Content .env) -replace 'MINERU_API_KEY=.*', "MINERU_API_KEY=${MINERU_KEY}" | Set-Content .env
```

## Step 6: Verify Configuration

Check that the .env file contains valid API keys (not the placeholder values):

```bash
grep -E "SILICONFLOW_API_KEY|MINERU_API_KEY" "${CLAUDE_PLUGIN_ROOT}/skills/pdf2skills/scripts/.env"
```

If keys are still placeholders, warn user that they need to update them before using the conversion functionality.

## Step 7: Test Environment

Run a simple test to verify Python environment and imports work:

```bash
cd "${CLAUDE_PLUGIN_ROOT}/skills/pdf2skills/scripts"
python -c "import requests, numpy, spacy; print('Dependencies loaded successfully')"
```

If any import fails, show error and suggest re-running dependency installation.

## Step 8: Update Project Configuration

Check if the project's local configuration file (`.claude/cong.claude-marketplace.local.md`) contains pdf2skills configuration. If not, ask user if they want to add it.

Configuration template for project local file:

```markdown
---
pdf2skills:
  siliconflow_api_key: "your-siliconflow-key"
  mineru_api_key: "your-mineru-key"
  default_output_dir: "./skills"
  default_language: "zh"
  resume_on_failure: true
---
```

If user agrees, add this section to the local configuration file.

## Step 9: Completion

Notify user that setup is complete and they can now use `/pdf2skills:convert` to convert PDF files to Claude skills.

**Note**: If API keys are not configured, remind user to update the `.env` file before attempting conversion.