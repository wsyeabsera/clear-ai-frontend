export type AgentType = 'analyzer' | 'summarizer';

export interface AgentConfig {
  id: string;
  name: string;
  version: number;
  type: AgentType;
  isDefault: boolean;
  isActive: boolean;
  description?: string;
  config: AnalyzerConfig | SummarizerConfig;
  metadata?: {
    performanceMetrics?: {
      avgConfidence: number;
      avgQualityScore: number;
      totalUsage: number;
      lastUsed?: string;
      successRate?: number;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface AnalyzerConfig {
  llmConfig: LLMConfig;
  anomalyThreshold: number;
  minConfidence: number;
  enableStatisticalAnalysis: boolean;
  enableChainOfThought: boolean;
  enableSelfCritique: boolean;
  analysisStrategies: string[];
  promptTemplates?: {
    systemPrompt?: string;
    chainOfThoughtPrompt?: string;
    validationPrompt?: string;
  };
}

export interface SummarizerConfig {
  llmConfig: LLMConfig;
  maxLength: number;
  format: 'plain' | 'markdown' | 'json';
  tone: 'professional' | 'casual' | 'technical';
  summarizationStrategies: string[];
  promptTemplates?: {
    systemPrompt?: string;
  };
}

export interface LLMConfig {
  temperature: number;
  maxTokens: number;
  model: string;
  provider: string;
}

export interface TrainingFeedback {
  id: string;
  requestId: string;
  configId: string;
  agentType: AgentType;
  rating: {
    overall: number;
    accuracy?: number;
    relevance?: number;
    clarity?: number;
    actionability?: number;
  };
  issues: FeedbackIssue[];
  suggestions: string[];
  metadata?: {
    query?: string;
    responseTime?: number;
    confidence?: number;
    qualityScore?: number;
  };
  createdAt: string;
}

export interface FeedbackIssue {
  type: 'accuracy' | 'relevance' | 'clarity' | 'completeness' | 'actionability' | 'tone';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  suggestion?: string;
}

export interface TrainingStats {
  configId: string;
  totalFeedback: number;
  avgRating: number;
  commonIssues: {
    type: string;
    count: number;
    percentage: number;
  }[];
  recentTrend: 'improving' | 'declining' | 'stable';
  performanceMetrics: {
    avgConfidence: number;
    avgQualityScore: number;
    totalUsage: number;
  };
  recommendations: string[];
}

export interface Strategy {
  name: string;
  description: string;
  version: string;
}

// Input types for mutations
export interface CreateAgentConfigInput {
  name: string;
  type: AgentType;
  description?: string;
  config: AnalyzerConfig | SummarizerConfig;
  isActive?: boolean;
}

export interface UpdateAgentConfigInput {
  name?: string;
  description?: string;
  config?: AnalyzerConfig | SummarizerConfig;
  isActive?: boolean;
}

export interface SubmitFeedbackInput {
  requestId: string;
  configId: string;
  agentType: AgentType;
  rating: {
    overall: number;
    accuracy?: number;
    relevance?: number;
    clarity?: number;
    actionability?: number;
  };
  issues?: FeedbackIssue[];
  suggestions?: string[];
  metadata?: {
    query?: string;
    responseTime?: number;
    confidence?: number;
    qualityScore?: number;
  };
}

export interface TrainingOptionsInput {
  maxIterations?: number;
  learningRate?: number;
  targetImprovement?: number;
}
