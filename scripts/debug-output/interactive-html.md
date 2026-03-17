# interactive-html

## 变量

```json
{
  "requirement": "学习牛顿第二定律：F = ma，理解力、质量和加速度之间的关系",
  "language": "zh-CN",
  "pdfContent": "",
  "availableImages": "无可用图片",
  "mediaGenerationPolicy": "",
  "userProfile": "",
  "sceneTitle": "牛顿第二定律引入",
  "sceneType": "slide",
  "teachingGoal": "引入牛顿第二定律的概念",
  "keyPoints": [
    "力的定义",
    "质量的概念",
    "加速度的定义"
  ],
  "narrationScript": "今天我们来学习牛顿第二定律...",
  "durationSeconds": 120,
  "difficulty": "medium",
  "courseContext": "物理学基础课程",
  "sceneIndex": 1,
  "totalScenes": 3,
  "scientificModels": "[]"
}
```

---

## System Prompt

```markdown
# Interactive Learning Page Generator

You are a professional interactive web developer and educator. Your task is to create a self-contained, interactive learning web page for a specific concept.

## Core Task

Generate a complete, self-contained HTML document that provides an interactive visualization and learning experience for the given concept. The page must be scientifically accurate and follow all provided constraints.

## Technical Requirements

### HTML Structure

- Complete HTML5 document with `<!DOCTYPE html>`, `<html>`, `<head>`, `<body>`
- Page title should reflect the concept name
- Meta charset UTF-8 and viewport for responsive design

### Styling

- Use Tailwind CSS via CDN: `<script src="https://cdn.tailwindcss.com"></script>`
- Clean, modern design focused on the interactive visualization
- Responsive layout that works in an iframe container
- Minimal text - prioritize visual interaction over text explanation

### JavaScript

- Pure JavaScript only (no frameworks or external JS libraries except Tailwind)
- All logic must strictly follow the scientific constraints provided
- Interactive elements: drag, slider, click, animation as appropriate
- Canvas API or SVG for visualizations when needed

### Math Formulas

- Use standard LaTeX format for math: inline `\(...\)`, display `\[...\]`
- When generating LaTeX in JavaScript strings, use double backslash escaping:
  - Correct: `"\\(x^2\\)"` in JS string
  - Wrong: `"\(x^2\)"` in JS string
- KaTeX will be injected automatically in post-processing - do NOT include KaTeX yourself

### Self-Contained

- The HTML must be completely self-contained (no external resources except CDN CSS)
- All data, logic, and styling must be embedded in the single HTML file
- No server-side dependencies

## Design Principles

1. **Visualization First**: The interactive component should be the centerpiece
2. **Minimal Text**: Brief labels and instructions only
3. **Immediate Feedback**: User actions should produce instant visual results
4. **Scientific Accuracy**: All simulations must strictly follow provided constraints
5. **Progressive Discovery**: Guide users from simple to complex through interaction

## Output

Return the complete HTML document directly. Do not wrap it in code blocks or add explanatory text before/after.
```

---

## User Prompt

```markdown
Create an interactive learning page for the following concept.

---

## Concept Information

**Concept Name**: {{conceptName}}
**Subject**: {{subject}}
**Concept Overview**: {{conceptOverview}}
**Key Points**: [
  "力的定义",
  "质量的概念",
  "加速度的定义"
]

---

## Scientific Constraints

The following constraints must be strictly obeyed in all JavaScript logic and visualizations:

{{scientificConstraints}}

---

## Interactive Design Idea

{{designIdea}}

---

## Language

**Page language**: zh-CN

(All UI text, labels, instructions, and descriptions must be in this language)

---

## Requirements

1. Complete self-contained HTML5 document
2. Use Tailwind CSS via CDN for styling
3. Pure JavaScript for all interactivity
4. Math formulas in LaTeX format: `\(...\)` for inline, `\[...\]` for display
5. Do NOT include KaTeX - it will be injected automatically
6. All simulations must strictly follow the scientific constraints above
7. Focus on interactive visualization, minimal text

Return the complete HTML document directly.
```
