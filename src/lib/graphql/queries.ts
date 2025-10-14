import { gql } from '@apollo/client';

// Agent Configuration Queries
export const LIST_AGENT_CONFIGS = gql`
  query ListAgentConfigs($type: AgentType, $isActive: Boolean) {
    listAgentConfigs(type: $type, isActive: $isActive) {
      id
      name
      type
      version
      isDefault
      isActive
      description
      config
      metadata {
        performanceMetrics {
          avgConfidence
          avgQualityScore
          totalUsage
        }
      }
      createdAt
    }
  }
`;

export const GET_AGENT_CONFIG = gql`
  query GetAgentConfig($id: ID!) {
    getAgentConfig(id: $id) {
      id
      name
      type
      version
      isDefault
      isActive
      description
      config
      metadata {
        performanceMetrics {
          avgConfidence
          avgQualityScore
          totalUsage
        }
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_DEFAULT_CONFIG = gql`
  query GetDefaultConfig($type: AgentType!) {
    getDefaultConfig(type: $type) {
      id
      name
      config
    }
  }
`;

export const LIST_STRATEGIES = gql`
  query ListStrategies {
    listAnalysisStrategies {
      name
      description
      version
    }
    listSummarizationStrategies {
      name
      description
      version
    }
  }
`;

// Agent Configuration Mutations
export const CREATE_AGENT_CONFIG = gql`
  mutation CreateAgentConfig($input: CreateAgentConfigInput!) {
    createAgentConfig(input: $input) {
      id
      name
      type
      version
      isDefault
      isActive
      description
      config
      createdAt
    }
  }
`;

export const UPDATE_AGENT_CONFIG = gql`
  mutation UpdateAgentConfig($id: ID!, $input: UpdateAgentConfigInput!) {
    updateAgentConfig(id: $id, input: $input) {
      id
      name
      type
      version
      isDefault
      isActive
      description
      config
      updatedAt
    }
  }
`;

export const DELETE_AGENT_CONFIG = gql`
  mutation DeleteAgentConfig($id: ID!) {
    deleteAgentConfig(id: $id)
  }
`;

export const SET_DEFAULT_CONFIG = gql`
  mutation SetDefaultConfig($id: ID!) {
    setDefaultConfig(id: $id) {
      id
      name
      type
      isDefault
    }
  }
`;

export const CLONE_AGENT_CONFIG = gql`
  mutation CloneAgentConfig($id: ID!, $name: String!) {
    cloneAgentConfig(id: $id, name: $name) {
      id
      name
      type
      version
      isDefault
      isActive
      description
      config
      createdAt
    }
  }
`;

// Training & Feedback Queries
export const GET_TRAINING_FEEDBACK = gql`
  query GetTrainingFeedback($id: ID!) {
    getTrainingFeedback(id: $id) {
      id
      requestId
      configId
      agentType
      rating {
        overall
        accuracy
        relevance
        clarity
        actionability
      }
      issues {
        type
        severity
        description
        suggestion
      }
      suggestions
      metadata {
        query
        responseTime
        confidence
        qualityScore
      }
      createdAt
    }
  }
`;

export const LIST_TRAINING_FEEDBACK = gql`
  query ListTrainingFeedback($configId: ID, $agentType: AgentType, $limit: Int, $offset: Int) {
    listTrainingFeedback(configId: $configId, agentType: $agentType, limit: $limit, offset: $offset) {
      id
      requestId
      configId
      agentType
      rating {
        overall
        accuracy
        relevance
        clarity
        actionability
      }
      issues {
        type
        severity
        description
        suggestion
      }
      suggestions
      createdAt
    }
  }
`;

export const GET_TRAINING_STATS = gql`
  query GetTrainingStats($configId: ID!) {
    getTrainingStats(configId: $configId) {
      configId
      totalFeedback
      avgRating
      commonIssues {
        type
        count
        percentage
      }
      recentTrend
      performanceMetrics {
        avgConfidence
        avgQualityScore
        totalUsage
      }
      recommendations
    }
  }
`;

// Training & Feedback Mutations
export const SUBMIT_FEEDBACK = gql`
  mutation SubmitFeedback($input: SubmitFeedbackInput!) {
    submitFeedback(input: $input) {
      id
      requestId
      configId
      agentType
      rating {
        overall
        accuracy
        relevance
        clarity
        actionability
      }
      createdAt
    }
  }
`;

export const TRAIN_CONFIG = gql`
  mutation TrainConfig($configId: ID!, $options: TrainingOptionsInput) {
    trainConfig(configId: $configId, options: $options) {
      configId
      status
      message
      completedAt
    }
  }
`;

export const APPLY_TRAINING_UPDATE = gql`
  mutation ApplyTrainingUpdate($configId: ID!, $updateData: JSON!) {
    applyTrainingUpdate(configId: $configId, updateData: $updateData) {
      id
      name
      config
      updatedAt
    }
  }
`;

// Queries
export const GET_METRICS = gql`
  query GetMetrics {
    getMetrics {
      totalRequests
      successfulRequests
      failedRequests
      avgDuration
      uptime
    }
  }
`;

export const GET_REQUEST_HISTORY = gql`
  query GetRequestHistory($limit: Int, $userId: String) {
    getRequestHistory(limit: $limit, userId: $userId) {
      requestId
      query
      response {
        requestId
        message
        toolsUsed
        data
        analysis {
          summary
          insights {
            type
            description
            confidence
            supportingData
          }
          entities {
            id
            type
            name
            attributes
            relationships {
              type
              targetEntityId
              strength
            }
          }
          anomalies {
            type
            description
            severity
            affectedEntities
            data
          }
          metadata {
            toolResultsCount
            successfulResults
            failedResults
            analysisTimeMs
          }
        }
        metadata {
          requestId
          totalDurationMs
          timestamp
          error
        }
      }
      timestamp
      userId
    }
  }
`;

export const GET_REQUEST = gql`
  query GetRequest($requestId: ID!) {
    getRequest(requestId: $requestId) {
      requestId
      query
      response {
        requestId
        message
        toolsUsed
        data
        analysis {
          summary
          insights {
            type
            description
            confidence
            supportingData
          }
          entities {
            id
            type
            name
            attributes
            relationships {
              type
              targetEntityId
              strength
            }
          }
          anomalies {
            type
            description
            severity
            affectedEntities
            data
          }
          metadata {
            toolResultsCount
            successfulResults
            failedResults
            analysisTimeMs
          }
        }
        metadata {
          requestId
          totalDurationMs
          timestamp
          error
        }
      }
      timestamp
      userId
    }
  }
`;

export const GET_PLAN = gql`
  query GetPlan($requestId: ID!) {
    getPlan(requestId: $requestId) {
      requestId
      plan {
        steps {
          tool
          params
          dependsOn
          parallel
        }
      }
      metadata {
        query
        timestamp
        estimatedDurationMs
      }
      status
    }
  }
`;

export const GET_EXECUTION = gql`
  query GetExecution($requestId: ID!) {
    getExecution(requestId: $requestId) {
      requestId
      status
      totalSteps
      successfulSteps
      failedSteps
      totalDuration
      results {
        step
        tool
        status
        duration
        success
        params
        result
        cached
        error
        timestamp
      }
    }
  }
`;

// Mutations
export const EXECUTE_QUERY = gql`
  mutation ExecuteQuery($query: String!, $userId: String) {
    executeQuery(query: $query, userId: $userId) {
      requestId
      message
      toolsUsed
      data
      analysis {
        summary
        insights {
          type
          description
          confidence
          supportingData
        }
        entities {
          id
          type
          name
          attributes
          relationships {
            type
            targetEntityId
            strength
          }
        }
        anomalies {
          type
          description
          severity
          affectedEntities
          data
        }
        metadata {
          toolResultsCount
          successfulResults
          failedResults
          analysisTimeMs
        }
      }
      metadata {
        requestId
        totalDurationMs
        timestamp
        error
      }
    }
  }
`;

export const PLAN_QUERY = gql`
  mutation PlanQuery($query: String!, $context: JSON) {
    planQuery(query: $query, context: $context) {
      requestId
      plan {
        steps {
          tool
          params
          dependsOn
          parallel
        }
      }
      metadata {
        query
        timestamp
        estimatedDurationMs
      }
      status
    }
  }
`;

export const EXECUTE_TOOLS = gql`
  mutation ExecuteTools($requestId: ID!) {
    executeTools(requestId: $requestId) {
      requestId
      results {
        success
        tool
        data
        error {
          code
          message
          details
        }
        metadata {
          executionTime
          timestamp
          retries
        }
      }
      metadata {
        totalDurationMs
        successfulSteps
        failedSteps
        timestamp
      }
    }
  }
`;

export const ANALYZE_RESULTS = gql`
  mutation AnalyzeResults($requestId: ID!, $analyzerConfigId: ID) {
    analyzeResults(requestId: $requestId, analyzerConfigId: $analyzerConfigId) {
      requestId
      analysis {
        summary
        insights {
          type
          description
          confidence
          supportingData
        }
        entities {
          id
          type
          name
          attributes
          relationships {
            type
            targetEntityId
            strength
          }
        }
        anomalies {
          type
          description
          severity
          affectedEntities
          data
        }
        metadata {
          toolResultsCount
          successfulResults
          failedResults
          analysisTimeMs
        }
      }
      metadata {
        toolResultsCount
        successfulResults
        failedResults
        analysisTimeMs
      }
    }
  }
`;

export const SUMMARIZE_RESPONSE = gql`
  mutation SummarizeResponse($requestId: ID!, $summarizerConfigId: ID) {
    summarizeResponse(requestId: $requestId, summarizerConfigId: $summarizerConfigId) {
      requestId
      message
      toolsUsed
      metadata {
        requestId
        totalDurationMs
        timestamp
      }
    }
  }
`;

export const GET_ANALYSIS = gql`
  query GetAnalysis($requestId: ID!) {
    getAnalysis(requestId: $requestId) {
      requestId
      analysis {
        summary
        insights {
          type
          description
          confidence
          supportingData
        }
        entities {
          id
          type
          name
          attributes
          relationships {
            type
            targetEntityId
            strength
          }
        }
        anomalies {
          type
          description
          severity
          affectedEntities
          data
        }
        metadata {
          toolResultsCount
          successfulResults
          failedResults
          analysisTimeMs
        }
      }
      metadata {
        toolResultsCount
        successfulResults
        failedResults
        analysisTimeMs
      }
    }
  }
`;

export const CANCEL_QUERY = gql`
  mutation CancelQuery($requestId: ID!) {
    cancelQuery(requestId: $requestId)
  }
`;

// Subscriptions
export const QUERY_PROGRESS_SUBSCRIPTION = gql`
  subscription QueryProgress($requestId: ID!) {
    queryProgress(requestId: $requestId) {
      requestId
      phase
      progress
      message
      timestamp
    }
  }
`;

export const PLANNER_PROGRESS_SUBSCRIPTION = gql`
  subscription PlannerProgress($requestId: ID!) {
    plannerProgress(requestId: $requestId) {
      requestId
      phase
      progress
      message
      timestamp
    }
  }
`;

export const EXECUTOR_PROGRESS_SUBSCRIPTION = gql`
  subscription ExecutorProgress($requestId: ID!) {
    executorProgress(requestId: $requestId) {
      requestId
      phase
      progress
      message
      currentStep
      timestamp
    }
  }
`;

export const ANALYZER_PROGRESS_SUBSCRIPTION = gql`
  subscription AnalyzerProgress($requestId: ID!) {
    analyzerProgress(requestId: $requestId) {
      requestId
      phase
      progress
      message
      timestamp
    }
  }
`;

export const SUMMARIZER_PROGRESS_SUBSCRIPTION = gql`
  subscription SummarizerProgress($requestId: ID!) {
    summarizerProgress(requestId: $requestId) {
      requestId
      phase
      progress
      message
      timestamp
    }
  }
`;
