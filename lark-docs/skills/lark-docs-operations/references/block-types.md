# Block Types Reference

Complete block type mapping for Feishu docx API.

## Text Blocks

| block_type | Type | Description |
|------------|------|-------------|
| 1 | Page | Document root |
| 2 | Text | Plain text paragraph |
| 3 | Heading1 | Level 1 heading |
| 4 | Heading2 | Level 2 heading |
| 5 | Heading3 | Level 3 heading |
| 6 | Heading4 | Level 4 heading |
| 7 | Heading5 | Level 5 heading |
| 8 | Heading6 | Level 6 heading |
| 9 | Heading7 | Level 7 heading |
| 10 | Heading8 | Level 8 heading |
| 11 | Heading9 | Level 9 heading |
| 12 | Bullet | Unordered list item |
| 13 | Ordered | Ordered list item |
| 14 | Code | Code block |
| 15 | Quote | Blockquote |
| 16 | Equation | Mathematical formula |
| 17 | Todo | Todo/checkbox item |

## Rich Content Blocks

| block_type | Type | Description |
|------------|------|-------------|
| 18 | Bitable | Embedded bitable |
| 19 | Callout | Highlighted block |
| 20 | ChatCard | Chat card |
| 21 | Diagram | Flowchart/UML |
| 22 | Divider | Horizontal line |
| 23 | File | File attachment |
| 24 | Grid | Multi-column layout |
| 25 | GridColumn | Grid column |
| 26 | Iframe | Embedded webpage |
| 27 | Image | Image |
| 28 | Isv | ISV widget |
| 29 | Mindnote | Mind map |
| 30 | Sheet | Embedded spreadsheet |
| 31 | Table | Table |
| 32 | TableCell | Table cell |
| 33 | TitledBlock | Block with title |
| 34 | TableView | Table view |

## Common Block JSON Examples

### Heading
```json
{
  "block_type": 3,
  "heading1": {
    "elements": [
      { "text_run": { "content": "Heading Text" } }
    ]
  }
}
```

### Text Paragraph
```json
{
  "block_type": 2,
  "text": {
    "elements": [
      { "text_run": { "content": "Paragraph content" } }
    ]
  }
}
```

### Bullet List
```json
{
  "block_type": 12,
  "bullet": {
    "elements": [
      { "text_run": { "content": "List item" } }
    ]
  }
}
```

### Code Block
```json
{
  "block_type": 14,
  "code": {
    "style": { "language": 1 },
    "elements": [
      { "text_run": { "content": "console.log('Hello');" } }
    ]
  }
}
```
