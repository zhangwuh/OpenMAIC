# OpenMAIC 项目总结

## 一、创建 Classroom 完整调用链

### 路径一：直接存储（简单路径）

```
POST /api/classroom
    │
    ├─ 验证请求体
    │
    ├─ persistClassroom()
    │   ├─ ensureClassroomsDir()
    │   ├─ writeJsonFileAtomic()
    │   │   └─ 写入 data/classrooms/{id}.json
    │   └─ 返回 classroom URL
    │
    └─ 返回 { id, url }
```

### 路径二：AI 生成课堂（完整路径）

```
POST /api/generate-classroom
    │
    ├─ 解析请求体
    │
    ├─ buildRequestOrigin()  → 获取 baseUrl
    │
    ├─ createClassroomGenerationJob()
    │   └─ 写入 data/classroom-jobs/{jobId}.json (状态: queued)
    │
    ├─ after(() => runClassroomGenerationJob())  ← Next.js 后台执行
    │   │
    │   └─ runClassroomGenerationJob()
    │       ├─ markClassroomGenerationJobRunning()
    │       │
    │       ├─ generateClassroom()  ← 核心生成逻辑
    │       │   │
    │       │   ├─ [Step 1] 初始化
    │       │   │   ├─ resolveModel() → 获取 LLM 模型配置
    │       │   │   └─ resolveApiKey() → 验证 API Key
    │       │   │
    │       │   ├─ [Step 2] generateSceneOutlinesFromRequirements()
    │       │   │   ├─ buildPrompt() → 构建大纲生成提示词
    │       │   │   ├─ callLLM() → 调用 AI 生成大纲
    │       │   │   └─ parseJsonResponse() → 解析 JSON 结果
    │       │   │
    │       │   ├─ [Step 3] 循环生成每个场景 (for each outline)
    │       │   │   ├─ generateSceneContent() → 生成场景内容
    │       │   │   ├─ generateSceneActions() → 生成动作列表
    │       │   │   └─ createSceneWithActions() → 创建场景
    │       │   │       └─ api.createScene() → 写入内存 store
    │       │   │
    │       │   ├─ [Step 4] persistClassroom()
    │       │   │   └─ 写入 data/classrooms/{id}.json
    │       │   │
    │       │   └─ 返回 GenerateClassroomResult
    │       │
    │       └─ markClassroomGenerationJobSucceeded()
    │
    └─ 立即返回 202 { jobId, pollUrl, pollIntervalMs }
```

### 关键文件位置

| 文件 | 职责 |
|------|------|
| [route.ts](app/api/generate-classroom/route.ts) | API 入口，创建 Job 并触发后台任务 |
| [classroom-job-runner.ts](lib/server/classroom-job-runner.ts) | 执行生成任务的 Runner |
| [classroom-generation.ts](lib/server/classroom-generation.ts) | 核心生成逻辑编排 |
| [outline-generator.ts](lib/generation/outline-generator.ts) | Stage 1: 从需求生成场景大纲 |
| [scene-generator.ts](lib/generation/scene-generator.ts) | Stage 2: 生成场景内容和动作 |
| [classroom-storage.ts](lib/server/classroom-storage.ts) | 持久化存储 classroom 数据 |
| [classroom-job-store.ts](lib/server/classroom-job-store.ts) | Job 状态管理 |

### 数据流向

```
用户需求 → 场景大纲[] → 场景内容 → 动作列表[] → 完整场景[] → JSON 文件
```

---

## 二、System Prompt 和 User Prompt 组装流程

### 核心代码位置

| 步骤 | 文件 | 行号 | 功能 |
|------|------|------|------|
| **1. 构建变量** | [outline-generator.ts](lib/generation/outline-generator.ts#L96-L108) | 96-108 | 收集变量，调用 `buildPrompt()` |
| **2. 调用 AI** | [outline-generator.ts](lib/generation/outline-generator.ts#L124) | 124 | `aiCall(prompts.system, prompts.user)` |
| **3. 组装 messages** | [classroom-generation.ts](lib/server/classroom-generation.ts#L119-L122) | 119-122 | 构建 `messages` 数组 |
| **4. 调用 LLM** | [llm.ts](lib/ai/llm.ts#L308-L310) | 308-310 | 执行 `generateText()` |

### 完整调用链

```
┌─────────────────────────────────────────────────────────────────┐
│  Step 1: buildPrompt() - 构建带变量的 prompt                      │
│  位置: lib/generation/outline-generator.ts:96-108               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  const prompts = buildPrompt(PROMPT_IDS.REQUIREMENTS_TO_OUTLINES, {
│    requirement: requirements.requirement,  // 用户需求
│    language: requirements.language,         // 语言
│    pdfContent: pdfText,                     // PDF内容
│    availableImages: availableImagesText,    // 可用图片
│    userProfile: userProfileText,            // 用户信息
│  });
│                                                                 │
│  // 返回: { system: string, user: string }                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 2: aiCall() - 业务层调用                                   │
│  位置: lib/generation/outline-generator.ts:124                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  const response = await aiCall(prompts.system, prompts.user, visionImages);
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 3: callLLM() - 组装 messages 数组                          │
│  位置: lib/server/classroom-generation.ts:115-128               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  const aiCall: AICallFn = async (systemPrompt, userPrompt) => {
│    const result = await callLLM({
│      model: languageModel,
│      messages: [
│        { role: 'system', content: systemPrompt },  // System Prompt
│        { role: 'user', content: userPrompt },      // User Prompt
│      ],
│      maxOutputTokens: modelInfo?.outputWindow,
│    }, 'generate-classroom');
│    return result.text;
│  };
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 4: generateText() - AI SDK 执行                            │
│  位置: lib/ai/llm.ts:308-310                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  const result = await generateText({
│    model,
│    messages: [...],  // 包含 system + user 消息
│  });
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 所有 Prompt 组装位置

```typescript
// lib/generation/scene-generator.ts

// 1. Slide 内容生成 (行 538-547)
const prompts = buildPrompt(PROMPT_IDS.SLIDE_CONTENT, {
  title, description, keyPoints, assignedImages, canvas_width, canvas_height
});
await aiCall(prompts.system, prompts.user, visionImages);  // 行 561

// 2. Quiz 内容生成 (行 642)
const prompts = buildPrompt(PROMPT_IDS.QUIZ_CONTENT, {...});
await aiCall(prompts.system, prompts.user);  // 行 656

// 3. Slide 动作生成 (行 926-934)
const prompts = buildPrompt(PROMPT_IDS.SLIDE_ACTIONS, {
  title, keyPoints, description, elements, courseContext, agents
});
await aiCall(prompts.system, prompts.user);  // 行 940

// 4. Quiz 动作生成 (行 955-962)
const prompts = buildPrompt(PROMPT_IDS.QUIZ_ACTIONS, {...});
await aiCall(prompts.system, prompts.user);  // 行 968

// 5. Interactive 动作生成 (行 981)
const prompts = buildPrompt(PROMPT_IDS.INTERACTIVE_ACTIONS, {...});
await aiCall(prompts.system, prompts.user);  // 行 995

// 6. PBL 动作生成 (行 1008)
const prompts = buildPrompt(PROMPT_IDS.PBL_ACTIONS, {...});
await aiCall(prompts.system, prompts.user);  // 行 1022
```

### 关键接口定义

```typescript
// lib/generation/pipeline-types.ts
type AICallFn = (
  systemPrompt: string,
  userPrompt: string,
  images?: Array<{ id: string; src: string }>
) => Promise<string>;

// lib/generation/prompts/loader.ts
function buildPrompt(
  promptId: PromptId,
  variables: Record<string, unknown>
): { system: string; user: string } | null;
```

---

## 三、Prompt 模板列表

| Prompt ID | 用途 | 模板位置 |
|-----------|------|----------|
| `requirements-to-outlines` | 从需求生成场景大纲 | `templates/requirements-to-outlines/` |
| `slide-content` | 生成 Slide 内容 | `templates/slide-content/` |
| `quiz-content` | 生成 Quiz 内容 | `templates/quiz-content/` |
| `slide-actions` | 生成 Slide 动作 | `templates/slide-actions/` |
| `quiz-actions` | 生成 Quiz 动作 | `templates/quiz-actions/` |
| `interactive-scientific-model` | 交互式场景科学建模 | `templates/interactive-scientific-model/` |
| `interactive-html` | 生成交互式 HTML | `templates/interactive-html/` |
| `interactive-actions` | 生成交互式场景动作 | `templates/interactive-actions/` |
| `pbl-actions` | 生成 PBL 场景动作 | `templates/pbl-actions/` |

### 调试 Prompt

```bash
# 运行 prompt 调试脚本
source ~/.nvm/nvm.sh && nvm use v22.22.0 && pnpm dlx tsx scripts/debug-prompts.ts

# 输出位置
scripts/debug-output/
├── requirements-to-outlines.md
├── slide-content.md
├── quiz-content.md
├── slide-actions.md
├── quiz-actions.md
├── interactive-*.md
├── pbl-actions.md
└── summary.json
```