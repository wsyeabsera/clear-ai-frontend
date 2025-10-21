import { gql } from '@apollo/client';

// Tool Queries
export const LIST_TOOLS = gql`
  query ListTools {
    listTools {
      name
      description
      inputSchema
      outputSchema
    }
  }
`;

export const EXECUTE_TOOL = gql`
  mutation ExecuteTool($name: String!, $params: JSON!) {
    executeTool(name: $name, params: $params) {
      success
      data
      error
      message
      meta
    }
  }
`;

// Plan Queries
export const GET_PLAN = gql`
  query GetPlan($requestId: String!) {
    getPlan(requestId: $requestId) {
      requestId
      query
      plan {
        metadata {
          estimatedDurationMs
          parallelSteps
          query
          requestId
          totalSteps
        }
        steps {
          dependsOn
          description
          parallel
          params
          tool
        }
      }
      status
      createdAt
      executionTimeMs
      validationErrors
    }
  }
`;

export const GET_RECENT_PLANS = gql`
  query GetRecentPlans($limit: Int) {
    getRecentPlans(limit: $limit) {
      requestId
      query
      plan {
        metadata {
          estimatedDurationMs
          parallelSteps
          query
          requestId
          totalSteps
        }
        steps {
          dependsOn
      description
          parallel
          params
          tool
        }
      }
      status
      createdAt
      executionTimeMs
      validationErrors
    }
  }
`;

export const GET_PLAN_STATISTICS = gql`
  query GetPlanStatistics {
    getPlanStatistics {
      total
      byStatus {
        pending
        completed
        failed
        cancelled
      }
      byProvider {
        provider
        count
      }
      averageExecutionTime
    }
  }
`;

// Execution Queries
export const GET_EXECUTION = gql`
  query GetExecution($executionId: String!) {
    getExecution(executionId: $executionId) {
      executionId
      planRequestId
      status
      startedAt
      completedAt
      totalSteps
      completedSteps
      failedSteps
      results {
        completedAt
        dependencies
        error
        params
        result
        retryCount
        startedAt
        status
        stepIndex
        tool
      }
      error
    }
  }
`;

export const GET_EXECUTIONS_BY_PLAN_ID = gql`
  query GetExecutionsByPlanId($planRequestId: String!) {
    getExecutionsByPlanId(planRequestId: $planRequestId) {
      executionId
      planRequestId
      status
      startedAt
      completedAt
      totalSteps
      completedSteps
      failedSteps
      results {
        completedAt
        dependencies
        error
        params
        result
        retryCount
        startedAt
        status
        stepIndex
        tool
      }
      error
    }
  }
`;

export const GET_RECENT_EXECUTIONS = gql`
  query GetRecentExecutions($limit: Int) {
    getRecentExecutions(limit: $limit) {
      executionId
      planRequestId
      status
      startedAt
      completedAt
      totalSteps
      completedSteps
      failedSteps
      results {
        completedAt
        dependencies
        error
        params
        result
        retryCount
        startedAt
        status
        stepIndex
        tool
      }
      error
    }
  }
`;

export const GET_EXECUTION_STATISTICS = gql`
  query GetExecutionStatistics {
    getExecutionStatistics {
      total
      byStatus {
        pending
        running
        completed
        failed
        cancelled
      }
      averageExecutionTime
      successRate
      averageStepsPerExecution
    }
  }
`;

// Analysis Queries
export const GET_ANALYSIS = gql`
  query GetAnalysis($analysisId: String!) {
    getAnalysis(analysisId: $analysisId) {
      analysis_id
      evaluation_metrics {
        average_step_time_ms
        efficiency_score
        error_patterns
        retry_frequency
        step_success_rates
        success_rate
      }
      failure_patterns
      feedback
      improvement_notes
      plan_request_id
      recommendations
      success_indicators
    }
  }
`;

export const GET_ANALYSIS_BY_EXECUTION_ID = gql`
  query GetAnalysisByExecutionId($executionId: String!) {
    getAnalysisByExecutionId(executionId: $executionId) {
      analysis_id
      evaluation_metrics {
        average_step_time_ms
        efficiency_score
        error_patterns
        retry_frequency
        step_success_rates
        success_rate
      }
      failure_patterns
      feedback
      improvement_notes
      plan_request_id
      recommendations
      success_indicators
    }
  }
`;

export const GET_ANALYSIS_STATISTICS = gql`
  query GetAnalysisStatistics {
    getAnalysisStatistics {
      total
      average_success_rate
      average_efficiency_score
      common_error_patterns
      average_execution_time
    }
  }
`;

export const GET_HISTORICAL_CONTEXT = gql`
  query GetHistoricalContext($query: String!, $limit: Int) {
    getHistoricalContext(query: $query, limit: $limit) {
      requestId
      query
      timestamp
      summary
    }
  }
`;

// Summary Queries
export const GET_SUMMARY = gql`
  query GetSummary($summaryId: String!) {
    getSummary(summaryId: $summaryId) {
      content
      execution_id
      format
      plan_request_id
      structured_data {
        answer
        errors
        execution_time_ms
        key_results
        recommendations
        steps_executed
        success
        user_query
      }
      summary_id
    }
  }
`;

export const GET_SUMMARY_BY_EXECUTION_ID = gql`
  query GetSummaryByExecutionId($executionId: String!) {
    getSummaryByExecutionId(executionId: $executionId) {
      content
      execution_id
      format
      plan_request_id
      structured_data {
        answer
        errors
        execution_time_ms
        key_results
        recommendations
        steps_executed
        success
        user_query
      }
      summary_id
    }
  }
`;

export const GET_SUMMARY_STATISTICS = gql`
  query GetSummaryStatistics {
    getSummaryStatistics {
      total
      by_format {
        text
        markdown
        json
        html
      }
      average_content_length
      success_rate
    }
  }
`;

// Orchestrator Statistics
export const GET_ORCHESTRATOR_STATISTICS = gql`
  query GetOrchestratorStatistics {
    getOrchestratorStatistics {
      total_cycles
      successful_cycles
      failed_cycles
      average_cycle_time_ms
      success_rate
      average_plan_steps
      average_execution_time_ms
      common_failure_patterns
      top_queries
    }
  }
`;

// Mutations
export const CREATE_PLAN = gql`
  mutation CreatePlan($query: String!) {
    createPlan(query: $query) {
      createdAt
      executionTimeMs
      plan {
        metadata {
          estimatedDurationMs
          parallelSteps
          query
          requestId
          totalSteps
        }
        steps {
          dependsOn
          description
          parallel
          params
          tool
        }
      }
        query
      requestId
      status
      validationErrors
    }
  }
`;

export const DELETE_PLAN = gql`
  mutation DeletePlan($requestId: String!) {
    deletePlan(requestId: $requestId)
  }
`;

export const EXECUTE_PLAN = gql`
  mutation ExecutePlan($planRequestId: String!) {
    executePlan(planRequestId: $planRequestId) {
      executionId
      planRequestId
      status
      startedAt
      completedAt
      totalSteps
      completedSteps
      failedSteps
      results {
        stepIndex
        tool
        status
        params
        result
        error
        startedAt
        completedAt
        retryCount
        dependencies
      }
      error
    }
  }
`;

export const CANCEL_EXECUTION = gql`
  mutation CancelExecution($executionId: String!) {
    cancelExecution(executionId: $executionId)
  }
`;

export const RETRY_EXECUTION = gql`
  mutation RetryExecution($executionId: String!) {
    retryExecution(executionId: $executionId) {
      executionId
      planRequestId
      status
      startedAt
      completedAt
      totalSteps
      completedSteps
      failedSteps
      results {
        completedAt
        dependencies
        error
        params
        result
        retryCount
        startedAt
        status
        stepIndex
        tool
      }
      error
    }
  }
`;

export const ANALYZE_EXECUTION = gql`
  mutation AnalyzeExecution($executionId: String!) {
    analyzeExecution(executionId: $executionId) {
      analysis_id
      evaluation_metrics {
        average_step_time_ms
        efficiency_score
        error_patterns
        retry_frequency
        step_success_rates
        success_rate
      }
      failure_patterns
      feedback
      improvement_notes
      plan_request_id
      recommendations
      success_indicators
    }
  }
`;

export const GENERATE_SUMMARY = gql`
  mutation GenerateSummary($executionId: String!, $format: SummaryFormat) {
    generateSummary(executionId: $executionId, format: $format) {
      content
      execution_id
      format
      plan_request_id
      structured_data {
        answer
        errors
        execution_time_ms
        key_results
        recommendations
        steps_executed
        success
        user_query
      }
      summary_id
    }
  }
`;

export const PROVIDE_FEEDBACK = gql`
  mutation ProvideFeedback($feedback: FeedbackRequestInput!) {
    provideFeedback(feedback: $feedback) {
      feedback_id
      execution_id
      user_feedback
      rating
      categories
      processed
      created_at
    }
  }
`;

export const PROVIDE_ANALYSIS_FEEDBACK = gql`
  mutation ProvideAnalysisFeedback($planRequestId: String!, $analysisId: String!) {
    provideAnalysisFeedback(planRequestId: $planRequestId, analysisId: $analysisId) {
      success
      message
      feedbackId
    }
  }
`;