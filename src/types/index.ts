// GraphQL Types
export interface ExecutionResult {
  requestId: string;
  message: string;
  toolsUsed: string[];
  data: Record<string, unknown>;
  analysis?: Analysis;
  metadata: ResponseMetadata;
}

export interface Analysis {
  requestId: string;
  analysis: {
    summary: string;
    insights: Insight[];
    entities: Entity[];
    anomalies: Anomaly[];
  }
  metadata: AnalysisMetadata;
}

export interface Insight {
  type: string;
  description: string;
  confidence: number;
  supportingData: Record<string, unknown>[];
}

export interface Entity {
  id: string;
  type: string;
  name: string;
  attributes: Record<string, unknown>;
  relationships?: Relationship[];
}

export interface Relationship {
  type: string;
  targetEntityId?: string;
  strength?: string;
}

export interface Anomaly {
  type: string;
  description: string;
  severity: string;
  affectedEntities: string[];
  data: Record<string, unknown>;
}

export interface AnalysisMetadata {
  toolResultsCount: number;
  successfulResults?: number;
  failedResults?: number;
  analysisTimeMs: number;
}

export interface ResponseMetadata {
  requestId: string;
  totalDurationMs: number;
  timestamp: string;
  error?: boolean;
}

export interface ProgressUpdate {
  requestId: string;
  phase: string;
  progress: number;
  message: string;
  timestamp: string;
}

export interface PlanResult {
  requestId: string;
  plan: Plan;
  metadata: PlanMetadata;
  status?: string;
}

export interface Plan {
  steps: PlanStep[];
}

export interface PlanStep {
  tool: string;
  params: Record<string, unknown>;
  dependsOn?: number[];
  parallel?: boolean;
}

export interface PlanMetadata {
  query: string;
  timestamp: string;
  estimatedDurationMs?: number;
}

export interface ToolResult {
  success: boolean;
  tool: string;
  data?: Record<string, unknown>;
  error?: ErrorDetails;
  metadata: ToolResultMetadata;
}

export interface ErrorDetails {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ToolResultMetadata {
  executionTime: number;
  timestamp: string;
  retries?: number;
}

export interface ExecutionResults {
  requestId: string;
  results: ToolResult[];
  metadata: ExecutionMetadata;
}

export interface ExecutionMetadata {
  totalDurationMs: number;
  successfulSteps: number;
  failedSteps: number;
  timestamp: string;
}

export interface SystemMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  avgDuration: number;
  uptime: number;
}

// Frontend Types
export interface Session {
  id: string;
  name: string;
  messages: Message[];
  status: 'active' | 'completed' | 'error';
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  requestId?: string;
  analysis?: Analysis;
  // NEW: Store complete request data
  requestData?: {
    plan?: PlanResult;
    execution?: ExecutionResults;
    analysis?: Analysis;
    summary?: SummaryResult;
  };
}

export interface AgentProgress {
  planner?: ProgressUpdate;
  executor?: ProgressUpdate;
  analyzer?: ProgressUpdate;
  summarizer?: ProgressUpdate;
}

export interface SummaryResult {
  requestId: string;
  message: string;
  toolsUsed: string[];
  metadata: ResponseMetadata;
}

export interface AgentType {
  id: 'planner' | 'executor' | 'analyzer' | 'summarizer';
  name: string;
  icon: string;
  color: string;
}

// Agent Configuration Types
export * from './agent-config';
