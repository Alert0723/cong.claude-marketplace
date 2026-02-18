---
name: pdf2skills
description: |
  This skill should be used when the user asks to "convert pdf to skills", "pdf2skills",
  "extract skills from pdf", "generate claude skills from document", or mentions
  "PDF conversion", "document processing", "skill extraction".
  Also use when AI needs to process PDF documents to create reusable Claude Code skills.
---

# pdf2skills - PDF to Claude Skills Converter

This plugin converts PDF documents into Claude Code skills through an automated pipeline.

## Overview

pdf2skills automates the conversion of PDF documents into structured Claude Code skills:
- Extracts content from PDF using MinerU API (OCR + text extraction)
- Processes content through semantic analysis pipelines
- Generates organized skill directories with proper structure
- Creates navigation routers and domain glossaries

## Configuration

### API Keys Required

The plugin requires two API keys:

1. **SiliconFlow API Key**: For LLM processing (text analysis, skill generation)
   - Get at: https://siliconflow.cn/
   - Used for: Semantic analysis, skill generation, content processing

2. **MinerU API Key**: For PDF to Markdown conversion
   - Get at: https://mineru.net/
   - Used for: OCR, PDF text extraction, markdown conversion

### Configuration Files

**Primary configuration**: `.env` file in plugin scripts directory
```bash
# Location
${CLAUDE_PLUGIN_ROOT}/skills/pdf2skills/scripts/.env
```

**Project configuration**: Optional settings in project local file
```markdown
# Location
.claude/cong.claude-marketplace.local.md

# Content
---
pdf2skills:
  siliconflow_api_key: "your-key"
  mineru_api_key: "your-key"
  default_output_dir: "./skills"
  default_language: "zh"
  resume_on_failure: true
---
```

### Setup Process

Run `/pdf2skills:setup` to:
1. Install Python dependencies
2. Download spaCy English model
3. Create configuration template
4. Prompt for API key configuration

## Usage Commands

### `/pdf2skills:setup`
Configure the plugin environment. Must be run before first use.

### `/pdf2skills:convert <pdf_path>`
Convert a PDF file to Claude skills.

**Parameters**:
- `pdf_path`: Path to PDF file (required)
- `--output-dir` or `-o`: Output directory (default: `<pdf_name>_output`)
- `--language` or `-l`: Language `ch` (Chinese) or `en` (English) (default: `ch`)
- `--resume`: Resume from previous interruption

**Examples**:
```bash
# Basic conversion
/pdf2skills:convert document.pdf

# Custom output directory
/pdf2skills:convert document.pdf --output-dir ./my-skills

# English PDF processing
/pdf2skills:convert document.pdf --language en

# Resume interrupted conversion
/pdf2skills:convert document.pdf --resume
```

## Pipeline Stages

The conversion pipeline includes 8 stages:

1. **PDF → Markdown**: MinerU API extracts text with OCR
2. **Markdown → Chunks**: Onion Peeler performs semantic chunking
3. **Chunks → Density Scores**: Semantic density analysis
4. **Chunks → SKUs**: SKU extraction (knowledge units)
5. **SKUs → Fused SKUs**: Knowledge fusion and deduplication
6. **SKUs → Claude Skills**: Skill generation and formatting
7. **Skills → Router**: Hierarchical navigation generation
8. **SKUs → Glossary**: Domain terminology extraction

## Output Structure

Successful conversion creates:
```
<output_dir>/
├── full.md                          # Extracted markdown
├── full_chunks/                     # Chunked documents
├── full_chunks_density/             # Semantic analysis
└── full_chunks_skus/                # Knowledge units
    ├── skus/                        # Individual SKU files
    ├── buckets.json                 # Grouped SKUs
    ├── router.json                  # Hierarchical router
    ├── glossary.json                # Domain glossary
    └── generated_skills/            # Claude Code Skills
        ├── index.md                 # Skill navigation
        └── <skill-name>/
            ├── SKILL.md             # Main skill file
            └── references/          # Detailed documentation
```

## Best Practices

### PDF Preparation
- Use text-based PDFs (not scanned) for best results
- Ensure good OCR quality for scanned documents
- For large PDFs (>100 pages), consider splitting into sections
- Check language setting (Chinese/English) matches content

### API Usage
- Monitor API usage to avoid rate limits
- SiliconFlow: ~3 second rate limit recommended
- MinerU: Check daily/monthly limits based on plan
- Use `--resume` flag for interrupted conversions

### Skill Quality
- Review generated skills for accuracy
- Manual refinement may be needed for complex topics
- Use glossary and router for navigation
- Test skills in Claude Code environment

## Troubleshooting

### Common Issues

**"API key not configured"**
- Run `/pdf2skills:setup` to configure API keys
- Check `.env` file contains valid keys (not placeholders)

**"Module not found" errors**
- Ensure dependencies installed: `/pdf2skills:setup`
- Check Python version (3.8+ required)

**Rate limit errors**
- Wait and retry with `--resume` flag
- Check API provider dashboard for usage

**Poor OCR quality**
- Try different language setting (`--language en` for English)
- Ensure PDF has clear text (not low-resolution scans)
- Consider pre-processing PDF with better OCR tools

**Memory/Timeout issues**
- For large PDFs, split into smaller sections
- Increase system resources if available
- Use `--resume` to continue from interruption

## Integration with Claude Code

Generated skills can be:
1. **Used directly**: Import skill directories to Claude Code
2. **Customized**: Modify generated SKILL.md files as needed
3. **Extended**: Add examples, templates, or references
4. **Shared**: Package and distribute as skill libraries

## Performance Notes

- Small PDFs (<50 pages): 10-30 minutes
- Medium PDFs (50-200 pages): 30-90 minutes
- Large PDFs (>200 pages): 90+ minutes (consider splitting)
- API costs vary by provider and document size
- Intermediate files use significant disk space (consider cleanup)

## Support

For issues:
1. Check configuration and API keys
2. Verify Python environment and dependencies
3. Review error messages for specific failures
4. Consult plugin documentation in commands/ directory