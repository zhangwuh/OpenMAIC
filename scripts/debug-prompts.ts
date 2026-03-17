/**
 * 本地 Prompt 调试脚本
 *
 * 运行方式：
 *   source ~/.nvm/nvm.sh && nvm use v22.22.0 && node --import tsx scripts/debug-prompts.ts
 *
 * 或者添加到 package.json scripts:
 *   "debug:prompts": "tsx scripts/debug-prompts.ts"
 *
 * 功能：
 * - 直接预览所有 prompt 模板
 * - 模拟变量填充
 * - 不需要实际调用 LLM API
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================
// 配置
// ============================================

const PROMPTS_DIR = path.join(process.cwd(), 'lib', 'generation', 'prompts');
const OUTPUT_DIR = path.join(process.cwd(), 'scripts', 'debug-output');

// 测试用例的变量
const TEST_VARIABLES = {
  // 大纲生成
  requirement: '学习牛顿第二定律：F = ma，理解力、质量和加速度之间的关系',
  language: 'zh-CN',
  pdfContent: '',
  availableImages: '无可用图片',
  mediaGenerationPolicy: '',
  userProfile: '',

  // 场景内容生成
  sceneTitle: '牛顿第二定律引入',
  sceneType: 'slide',
  teachingGoal: '引入牛顿第二定律的概念',
  keyPoints: ['力的定义', '质量的概念', '加速度的定义'],
  narrationScript: '今天我们来学习牛顿第二定律...',
  durationSeconds: 120,
  difficulty: 'medium',
  courseContext: '物理学基础课程',
  sceneIndex: 1,
  totalScenes: 3,

  // 交互式场景
  scientificModels: '[]',
};

// ============================================
// Prompt 加载逻辑（复制自 loader.ts，避免依赖）
// ============================================

const snippetCache = new Map<string, string>();

function loadSnippet(snippetId: string): string {
  const cached = snippetCache.get(snippetId);
  if (cached) return cached;

  const snippetPath = path.join(PROMPTS_DIR, 'snippets', `${snippetId}.md`);
  try {
    const content = fs.readFileSync(snippetPath, 'utf-8').trim();
    snippetCache.set(snippetId, content);
    return content;
  } catch {
    return `{{snippet:${snippetId}}}`;
  }
}

function processSnippets(template: string): string {
  return template.replace(/\{\{snippet:(\w[\w-]*)\}\}/g, (_, snippetId) => {
    return loadSnippet(snippetId);
  });
}

function interpolateVariables(template: string, variables: Record<string, unknown>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = variables[key];
    if (value === undefined) return match;
    if (Array.isArray(value)) return JSON.stringify(value, null, 2);
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  });
}

function loadPrompt(promptId: string): { system: string; user: string } | null {
  const promptDir = path.join(PROMPTS_DIR, 'templates', promptId);

  try {
    // 加载 system.md
    const systemPath = path.join(promptDir, 'system.md');
    let systemPrompt = fs.readFileSync(systemPath, 'utf-8').trim();
    systemPrompt = processSnippets(systemPrompt);

    // 加载 user.md（可选）
    const userPath = path.join(promptDir, 'user.md');
    let userPrompt = '';
    try {
      userPrompt = fs.readFileSync(userPath, 'utf-8').trim();
      userPrompt = processSnippets(userPrompt);
    } catch {
      // user.md 可选
    }

    return { system: systemPrompt, user: userPrompt };
  } catch (error) {
    console.error(`加载 prompt ${promptId} 失败:`, error);
    return null;
  }
}

// ============================================
// 所有 Prompt ID
// ============================================

const PROMPT_IDS = [
  'requirements-to-outlines',
  'slide-content',
  'quiz-content',
  'slide-actions',
  'quiz-actions',
  'interactive-scientific-model',
  'interactive-html',
  'interactive-actions',
  'pbl-actions',
] as const;

// ============================================
// 主流程
// ============================================

function main() {
  console.log('🚀 开始 Prompt 调试');
  console.log('📂 Prompts 目录:', PROMPTS_DIR);
  console.log('📄 输出目录:', OUTPUT_DIR);
  console.log('');

  // 创建输出目录
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const allPrompts: Record<string, { system: string; user: string }> = {};

  for (const promptId of PROMPT_IDS) {
    console.log(`\n${'═'.repeat(80)}`);
    console.log(`📋 ${promptId}`);
    console.log('═'.repeat(80));

    const prompt = loadPrompt(promptId);
    if (!prompt) continue;

    allPrompts[promptId] = prompt;

    // 打印原始模板
    console.log('\n🔹 SYSTEM PROMPT (原始模板):');
    console.log('-'.repeat(40));
    console.log(prompt.system.slice(0, 500) + (prompt.system.length > 500 ? '...\n[已截断，完整内容见输出文件]' : ''));

    console.log('\n🔹 USER PROMPT (原始模板):');
    console.log('-'.repeat(40));
    console.log(prompt.user.slice(0, 500) + (prompt.user.length > 500 ? '...\n[已截断，完整内容见输出文件]' : ''));

    // 填充变量后的版本
    const filledSystem = interpolateVariables(prompt.system, TEST_VARIABLES);
    const filledUser = interpolateVariables(prompt.user, TEST_VARIABLES);

    console.log('\n🔹 USER PROMPT (填充变量后):');
    console.log('-'.repeat(40));
    console.log(filledUser.slice(0, 800) + (filledUser.length > 800 ? '...\n[已截断]' : ''));

    // 保存完整版本
    const outputPath = path.join(OUTPUT_DIR, `${promptId}.md`);
    const content = `# ${promptId}

## 变量

\`\`\`json
${JSON.stringify(TEST_VARIABLES, null, 2)}
\`\`\`

---

## System Prompt

\`\`\`markdown
${filledSystem}
\`\`\`

---

## User Prompt

\`\`\`markdown
${filledUser}
\`\`\`
`;
    fs.writeFileSync(outputPath, content, 'utf-8');
    console.log(`\n✅ 已保存: ${outputPath}`);
  }

  // 保存汇总
  const summaryPath = path.join(OUTPUT_DIR, 'summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(allPrompts, null, 2), 'utf-8');
  console.log(`\n\n✅ 汇总已保存: ${summaryPath}`);

  console.log(`\n🎉 完成！共处理 ${Object.keys(allPrompts).length} 个 prompt 模板`);
  console.log(`📂 查看输出: ${OUTPUT_DIR}`);
}

main();