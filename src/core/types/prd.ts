export interface PainPoint {
  description: string;
  frequency: string;
  severity: string;
  affectedPeople: string;
  currentSolutions: string[];
  scene: string;
  // V-model deep-probe fields: surface statement, scene survey record, 5-Why conclusion
  rawSurface?: string;       // What the user literally said (the "faster horse")
  sceneSurvey?: string;      // A real observed/remembered scene: who, when, where, how they coped
  deepWhy?: string;          // The root-level need after peeling 3-5 layers of why
}

export interface ExistingSolution {
  name: string;
  weakness: string;
}

export interface Persona {
  name: string;
  age: string;
  occupation: string;
  needs: string;
  scenario: string;
  willingnessToPay: string;
}

export interface Feature {
  name: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  solvesPainPoint: string;
  complexity: '低' | '中' | '高';
  description: string;
}

// Field Research stage: a record of one real-world observation or retrospective interview.
// The point is past BEHAVIOR — never "what they might do".
export interface SceneSurvey {
  interviewee: string;      // Who was observed/interviewed (role or alias)
  time: string;             // When it happened (e.g. "上周三下午")
  place: string;            // Where it happened
  observedBehavior: string; // What they actually did, step by step
  stuckPoint: string;       // Where exactly they got stuck or frowned
  copingStrategy: string;   // How they coped (the workaround)
  directQuote?: string;     // A verbatim quote from the interviewee (if any)
}

// Solution Mirror stage: Ford's "faster horse" sanity-check per feature.
// Re-examines each P0 feature against the deep goal it claims to serve.
export interface MirrorReview {
  featureName: string;             // The feature the user said they wanted
  userSaid: string;                // The "faster horse" — user's surface request
  realGoal: string;                // The real goal behind it
  simplerPath: string;             // A simpler way to reach the same goal
  verdict: '保留' | '替换' | '删除'; // Decision after the mirror check
  rationale: string;               // Why this verdict
}

export interface PRDData {
  meta: {
    projectName: string;
    // Product brief (filled by the onboarding card before stage 0)
    oneLiner: string;
    targetMarket: '' | '百万级大众市场' | '十万级垂直市场' | '万级小众利基' | '未定';
    productForm: '' | 'Web App' | '移动 App' | 'SaaS' | '小程序' | '硬件' | 'API 服务' | '其他';
    coreProblem: '' | '效率工具' | '成本降低' | '体验优化' | '信息不对称' | '社交连接' | '其他';
    constraints: '' | '时间紧（3个月内上线）' | '预算有限' | '团队小' | '技术栈受限' | '无';
    // V-model: "谁的什么问题" — the user must state who and a first-cut scenario up front
    targetUser: string;       // e.g. "初中班主任", "我们小区带娃的妈妈"
    initialScene: string;     // e.g. "每学期排家访路线时"
    // Newbie guide: user's self-assessment of pain depth
    painDepthHint: string;    // e.g. "表层", "深层", "不确定"
    createdAt: string;
    updatedAt: string;
    model: string;
  };
  painPoints: PainPoint[];
  validation: {
    conclusion: string;
    isUniversal: boolean;
    existingSolutions: ExistingSolution[];
    marketGap: string;
    feasibilityScore: number;
  };
  userGroups: {
    targetMarket: string;
    personas: Persona[];
    marketSizeEstimate: string;
  };
  requirements: {
    features: Feature[];
    mvpScope: string;
    userStories: string[];
  };
  // Two V-model extension stages
  sceneSurveys: SceneSurvey[];
  mirrorReview: MirrorReview[];
  finalPRD: string;
}

export function createEmptyPRD(): PRDData {
  return {
    meta: {
      projectName: '',
      oneLiner: '',
      targetMarket: '',
      productForm: '',
      coreProblem: '',
      constraints: '',
      targetUser: '',
      initialScene: '',
      painDepthHint: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      model: '',
    },
    painPoints: [],
    validation: {
      conclusion: '',
      isUniversal: false,
      existingSolutions: [],
      marketGap: '',
      feasibilityScore: 0,
    },
    userGroups: {
      targetMarket: '',
      personas: [],
      marketSizeEstimate: '',
    },
    requirements: {
      features: [],
      mvpScope: '',
      userStories: [],
    },
    sceneSurveys: [],
    mirrorReview: [],
    finalPRD: '',
  };
}

// Selector options for the onboarding card — single source of truth shared with the UI.
export const ONBOARDING_TARGET_MARKETS = ['百万级大众市场', '十万级垂直市场', '万级小众利基', '未定'] as const;
export const ONBOARDING_PRODUCT_FORMS = ['Web App', '移动 App', 'SaaS', '小程序', '硬件', 'API 服务', '其他'] as const;
export const ONBOARDING_CORE_PROBLEMS = ['效率工具', '成本降低', '体验优化', '信息不对称', '社交连接', '其他'] as const;
export const ONBOARDING_CONSTRAINTS = ['时间紧（3个月内上线）', '预算有限', '团队小', '技术栈受限', '无'] as const;

// V-model scene survey helpers — used in real-scene probing prompts.
export const SCENE_TIME_OPTIONS = ['今天', '昨天', '本周内', '本月内', '记不清'] as const;
export const COPING_STRATEGY_OPTIONS = [
  '手工记录（纸/便签）',
  '手机备忘录/笔记 App',
  'Excel/表格',
  '微信群/聊天记录',
  '拜托别人/甩手不管',
  '忍着、没有替代方案',
  '其他',
] as const;

// Solution Mirror verdicts — Ford's "faster horse" check.
export const MIRROR_VERDICT_OPTIONS = ['保留', '替换', '删除'] as const;
