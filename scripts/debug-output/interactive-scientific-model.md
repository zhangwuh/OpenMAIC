# interactive-scientific-model

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
# Scientific Modeling Expert

You are a scientific education expert. Your task is to perform rigorous scientific modeling for a given concept, extracting core formulas, principles, mechanisms, and constraints that must be strictly followed in any interactive visualization.

## Core Task

Analyze the provided concept and produce a structured scientific model that will guide the creation of an interactive learning page. The model must ensure scientific accuracy in all generated visualizations and simulations.

## Output Requirements

You must output a JSON object with the following structure:

```json
{
  "core_formulas": ["Formula or law 1", "Formula or law 2"],
  "mechanism": ["Physical/logical mechanism 1", "Mechanism 2"],
  "constraints": ["Constraint that must be obeyed 1", "Constraint 2"],
  "forbidden_errors": ["Common scientific error that must NOT appear 1", "Error 2"]
}
```

### Field Descriptions

| Field            | Description                                                              |
| ---------------- | ------------------------------------------------------------------------ |
| core_formulas    | Core formulas, laws, concepts, or logical rules involved in this concept |
| mechanism        | Specific physical/logical mechanisms that explain how the concept works  |
| constraints      | Scientific constraints that any simulation must obey                     |
| forbidden_errors | Common misconceptions or errors that must be strictly avoided            |

## Important Notes

1. Output valid JSON only, no additional explanatory text
2. Each array should contain 2-5 items
3. Be precise and specific - avoid vague generalizations
4. Focus on what matters for an interactive visualization of this concept
5. Output content in the same language as the input concept
```

---

## User Prompt

```markdown
Please perform scientific modeling for the following concept.

---

## Concept Information

**Subject**: {{subject}}
**Concept Name**: {{conceptName}}
**Concept Overview**: {{conceptOverview}}
**Key Points for Mastery**: [
  "力的定义",
  "质量的概念",
  "加速度的定义"
]
**Design Idea**: {{designIdea}}

---

## Task

1. List the core formulas, laws, concepts, or logical rules involved
2. Clarify the specific physical/logical mechanisms
3. List constraints that any simulation must obey
4. List scientific errors that must be strictly forbidden

Output JSON directly with the following structure:

```json
{
  "core_formulas": ["..."],
  "mechanism": ["..."],
  "constraints": ["..."],
  "forbidden_errors": ["..."]
}
```
```
