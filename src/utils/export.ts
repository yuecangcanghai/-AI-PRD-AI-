import { PRDData } from '../core/types/prd';

export function exportPRD(prd: PRDData): void {
  const content = prd.finalPRD || generateMarkdownPRD(prd);
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${prd.meta.projectName || 'product'}-prd.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function copyPRDToClipboard(prd: PRDData): void {
  const content = prd.finalPRD || generateMarkdownPRD(prd);
  navigator.clipboard.writeText(content);
}

function generateMarkdownPRD(prd: PRDData): string {
  const lines: string[] = [];

  lines.push(`# ${prd.meta.projectName || '未命名产品'} - 产品需求文档 (PRD)\n`);
  lines.push(`> 生成时间：${new Date(prd.meta.updatedAt).toLocaleDateString()}`);
  lines.push(`> 使用模型：${prd.meta.model || 'N/A'}\n`);

  lines.push('## 1. 项目概述\n');
  if (prd.painPoints.length > 0) {
    lines.push(`**解决的问题：** ${prd.painPoints[0].description}\n`);
  }

  lines.push('## 2. 痛点与背景\n');
  prd.painPoints.forEach((pp, i) => {
    lines.push(`### 痛点 ${i + 1}`);
    lines.push(`- **描述：** ${pp.description}`);
    lines.push(`- **频率：** ${pp.frequency}`);
    lines.push(`- **严重度：** ${pp.severity}`);
    lines.push(`- **影响人群：** ${pp.affectedPeople}`);
    lines.push(`- **场景：** ${pp.scene}`);
    if (pp.currentSolutions.length > 0) {
      lines.push(`- **现有方案：** ${pp.currentSolutions.join('、')}`);
    }
    lines.push('');
  });

  lines.push('## 3. 痛点验证\n');
  if (prd.validation.conclusion) {
    lines.push(`**结论：** ${prd.validation.conclusion}\n`);
    lines.push(`**可行性评分：** ${prd.validation.feasibilityScore}/10\n`);
    if (prd.validation.existingSolutions.length > 0) {
      lines.push('**竞品分析：**\n');
      lines.push('| 方案 | 缺陷 |');
      lines.push('|------|------|');
      prd.validation.existingSolutions.forEach((s) => {
        lines.push(`| ${s.name} | ${s.weakness} |`);
      });
      lines.push('');
    }
    lines.push(`**市场空白：** ${prd.validation.marketGap}\n`);
  }

  lines.push('## 4. 目标用户\n');
  if (prd.userGroups.targetMarket) {
    lines.push(`**目标市场：** ${prd.userGroups.targetMarket}\n`);
  }
  prd.userGroups.personas.forEach((p, i) => {
    lines.push(`### 用户画像 ${i + 1}：${p.name}`);
    lines.push(`- **年龄：** ${p.age}`);
    lines.push(`- **职业：** ${p.occupation}`);
    lines.push(`- **核心需求：** ${p.needs}`);
    lines.push(`- **使用场景：** ${p.scenario}`);
    lines.push(`- **付费意愿：** ${p.willingnessToPay}`);
    lines.push('');
  });

  lines.push('## 5. 功能需求\n');
  const priorityGroups = ['P0', 'P1', 'P2', 'P3'] as const;
  const priorityLabels: Record<string, string> = { P0: 'MVP 核心功能', P1: '重要功能', P2: '锦上添花', P3: '未来考虑' };
  priorityGroups.forEach((p) => {
    const features = prd.requirements.features.filter((f) => f.priority === p);
    if (features.length > 0) {
      lines.push(`### ${p} - ${priorityLabels[p]}\n`);
      features.forEach((f) => {
        lines.push(`- **${f.name}**（复杂度：${f.complexity}）：${f.description}`);
        lines.push(`  - 解决痛点：${f.solvesPainPoint}`);
      });
      lines.push('');
    }
  });

  if (prd.requirements.mvpScope) {
    lines.push(`### MVP 范围\n`);
    lines.push(`${prd.requirements.mvpScope}\n`);
  }

  if (prd.requirements.userStories.length > 0) {
    lines.push('### 用户故事\n');
    prd.requirements.userStories.forEach((s) => lines.push(`- ${s}`));
    lines.push('');
  }

  lines.push('---\n');
  lines.push(`> 由 ProductForge AI 产品顾问生成`);
  lines.push(`> 生成时间：${new Date().toISOString().split('T')[0]}`);
  lines.push(`> 使用模型：${prd.meta.model || 'N/A'}`);

  return lines.join('\n');
}
