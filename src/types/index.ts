// New Backend GraphQL Types
export interface PlanResponse {
  requestId: string;
  query: string;
  plan: Plan;
  status: PlanStatus;
  createdAt: string;
  executionTimeMs?: number;
  validationErrors: string[];
}

export interface Plan {
  metadata: PlanMetadata;
  steps: PlanStep[];
}

export interface PlanMetadata {
  estimatedDurationMs: number;
  parallelSteps: number;
  query: string;
  requestId: string;
  totalSteps: number;
}

export interface PlanStep {
  tool: string;
  params: Record<string, unknown>;
  dependsOn?: number[];
  parallel?: boolean;
  description: string;
}

export type PlanStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface ExecutionResponse {
  executionId: string;
  planRequestId: string;
  status: ExecutionStatus;
  startedAt?: string;
  completedAt?: string;
  totalSteps: number;
  completedSteps: number;
  failedSteps: number;
  results: ExecutionStepResult[];
  error?: string;
}

export type ExecutionStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface ExecutionStepResult {
  stepIndex: number;
  tool: string;
  status: ExecutionStatus;
  params: Record<string, unknown>;
  result?: Record<string, unknown>;
  error?: string;
  startedAt?: string;
  completedAt?: string;
  retryCount: number;
  dependencies: number[];
}

export interface AnalysisResult {
  analysis_id: string;
  plan_request_id: string;
  feedback: string;
  evaluation_metrics: EvaluationMetrics;
  improvement_notes: string;
  success_indicators: string[];
  failure_patterns: string[];
  recommendations: string[];
}

export interface EvaluationMetrics {
  average_step_time_ms: number;
  efficiency_score: number;
  error_patterns: string[];
  retry_frequency: number;
  step_success_rates: Record<string, number>;
  success_rate: number;
}

export interface SummaryResult {
  summary_id: string;
  execution_id: string;
  plan_request_id: string;
  format: SummaryFormat;
  content: string;
  structured_data?: StructuredSummary;
}

export type SummaryFormat = 'TEXT' | 'MARKDOWN' | 'JSON' | 'HTML';

export interface StructuredSummary {
  answer: string;
  errors: string[];
  execution_time_ms: number;
  key_results: string[];
  recommendations: string[];
  steps_executed: number;
  success: boolean;
  user_query: string;
}

export interface ToolResult {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
  message?: string;
  meta?: Record<string, unknown>;
}

export interface Tool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
}

// Statistics Types
export interface PlanStatistics {
  total: number;
  byStatus: PlanStatusCounts;
  byProvider: ProviderCount[];
  averageExecutionTime: number;
}

export interface PlanStatusCounts {
  pending: number;
  completed: number;
  failed: number;
  cancelled: number;
}

export interface ProviderCount {
  provider: string;
  count: number;
}

export interface ExecutionStatistics {
  total: number;
  byStatus: ExecutionStatusCounts;
  averageExecutionTime: number;
  successRate: number;
  averageStepsPerExecution: number;
}

export interface ExecutionStatusCounts {
  pending: number;
  running: number;
  completed: number;
  failed: number;
  cancelled: number;
}

export interface AnalysisStatistics {
  total: number;
  average_success_rate: number;
  average_efficiency_score: number;
  common_error_patterns: string[];
  average_execution_time: number;
}

export interface SummaryStatistics {
  total: number;
  by_format: SummaryFormatCounts;
  average_content_length: number;
  success_rate: number;
}

export interface SummaryFormatCounts {
  text: number;
  markdown: number;
  json: number;
  html: number;
}

export interface OrchestratorStats {
  total_cycles: number;
  successful_cycles: number;
  failed_cycles: number;
  average_cycle_time_ms: number;
  success_rate: number;
  average_plan_steps: number;
  average_execution_time_ms: number;
  common_failure_patterns: string[];
  top_queries: string[];
}

// Feedback Types
export interface FeedbackResult {
  feedback_id: string;
  execution_id: string;
  user_feedback: string;
  rating?: number;
  categories: string[];
  processed: boolean;
  created_at: string;
}

export interface FeedbackResponse {
  success: boolean;
  message: string;
  feedbackId: string;
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
  // Store complete request data from new backend
  requestData?: {
    plan?: PlanResponse;
    execution?: ExecutionResponse;
    analysis?: AnalysisResult;
    summary?: SummaryResult;
  };
}

export interface AgentProgress {
  planner?: ProgressUpdate;
  executor?: ProgressUpdate;
  analyzer?: ProgressUpdate;
  summarizer?: ProgressUpdate;
}

export interface ProgressUpdate {
  requestId: string;
  phase: string;
  progress: number;
  message: string;
  timestamp: string;
}

export interface AgentType {
  id: 'planner' | 'executor' | 'analyzer' | 'summarizer';
  name: string;
  icon: string;
  color: string;
}
