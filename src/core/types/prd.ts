export interface PainPoint {
  description: string;
  frequency: string;
  severity: string;
  affectedPeople: string;
  currentSolutions: string[];
  scene: string;
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

export interface PRDData {
  meta: {
    projectName: string;
    // Product brief (filled by the onboarding card before stage 0)
    oneLiner: string;
    targetMarket: '' | '百万级大众市场' | '十万级垂直市场' | '万级小众利基' | '未定';
    productForm: '' | 'Web App' | '移动 App' | 'SaaS' | '小程序' | '硬件' | 'API 服务' | '其他';
    coreProblem: '' | '效率工具' | '成本降低' | '体验优化' | '信息不对称' | '社交连接' | '其他';
    constraints: '' | '时间紧（3个月内上线）' | '预算有限' | '团队小' | '技术栈受限' | '无';
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
    finalPRD: '',
  };
}

// Selector options for the onboarding card — single source of truth shared with the UI.
export const ONBOARDING_TARGET_MARKETS = ['百万级大众市场', '十万级垂直市场', '万级小众利基', '未定'] as const;
export const ONBOARDING_PRODUCT_FORMS = ['Web App', '移动 App', 'SaaS', '小程序', '硬件', 'API 服务', '其他'] as const;
export const ONBOARDING_CORE_PROBLEMS = ['效率工具', '成本降低', '体验优化', '信息不对称', '社交连接', '其他'] as const;
export const ONBOARDING_CONSTRAINTS = ['时间紧（3个月内上线）', '预算有限', '团队小', '技术栈受限', '无'] as const;
