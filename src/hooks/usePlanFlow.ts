'use client';

import { useMutation } from '@apollo/client/react';
import { PLAN_QUERY, EXECUTE_TOOLS, ANALYZE_RESULTS, SUMMARIZE_RESPONSE } from '@/lib/graphql/queries';
import { usePlanStore } from '@/lib/stores/planStore';
import { PlanResult, ExecutionResults, SummaryResult } from '@/types';

export function usePlanFlow() {
  const { setPlan, clearPlan } = usePlanStore();
  const [planQuery, { loading: planLoading, error: planError }] = useMutation(PLAN_QUERY);
  const [executeTools, { loading: executeLoading, error: executeError }] = useMutation(EXECUTE_TOOLS);
  const [analyzeResults, { loading: analyzeLoading, error: analyzeError }] = useMutation(ANALYZE_RESULTS);
  const [summarizeResponse, { loading: summarizeLoading, error: summarizeError }] = useMutation(SUMMARIZE_RESPONSE);

  const generatePlan = async (query: string) => {
    try {
      const { data } = await planQuery({ 
        variables: { query } 
      });
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((data as any)?.planQuery) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const planResult = (data as any).planQuery as PlanResult;
        setPlan(planResult.requestId, planResult.plan);
        return planResult;
      }
    } catch (error) {
      console.error('Failed to generate plan:', error);
      throw error;
    }
  };

  const executePlan = async (requestId: string) => {
    try {
      const { data } = await executeTools({ 
        variables: { requestId } 
      });
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((data as any)?.executeTools) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const executionResult = (data as any).executeTools as ExecutionResults;
        clearPlan();
        return executionResult;
      }
    } catch (error) {
      console.error('Failed to execute plan:', error);
      throw error;
    }
  };

  const analyzeExecution = async (requestId: string, analyzerConfigId?: string) => {
    try {
      const { data } = await analyzeResults({ 
        variables: { requestId, analyzerConfigId } 
      });
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((data as any)?.analyzeResults) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const analysisResult = (data as any).analyzeResults;
        return analysisResult;
      }
    } catch (error) {
      console.error('Failed to analyze results:', error);
      throw error;
    }
  };

  const summarizeResults = async (requestId: string, summarizerConfigId?: string) => {
    try {
      const { data } = await summarizeResponse({ 
        variables: { requestId, summarizerConfigId } 
      });
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((data as any)?.summarizeResponse) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const summaryResult = (data as any).summarizeResponse as SummaryResult;
        return summaryResult;
      }
    } catch (error) {
      console.error('Failed to summarize results:', error);
      throw error;
    }
  };

  const executeComplete = async (query: string, analyzerConfigId?: string, summarizerConfigId?: string) => {
    try {
      // Step 1: Plan
      const planResult = await generatePlan(query);
      if (!planResult) throw new Error('Plan generation failed');

      // Step 2: Execute
      const executionResult = await executePlan(planResult.requestId);
      if (!executionResult) throw new Error('Execution failed');

      // Step 3: Analyze
      const analysisResult = await analyzeExecution(planResult.requestId, analyzerConfigId);
      if (!analysisResult) throw new Error('Analysis failed');

      // Step 4: Summarize (NEW)
      const summaryResult = await summarizeResults(planResult.requestId, summarizerConfigId);
      if (!summaryResult) throw new Error('Summarization failed');

      return {
        planResult,
        executionResult,
        analysisResult,
        summaryResult
      };
    } catch (error) {
      console.error('Complete flow failed:', error);
      throw error;
    }
  };

  return { 
    generatePlan, 
    executePlan,
    analyzeExecution,
    summarizeResults,
    executeComplete,
    planLoading,
    executeLoading,
    analyzeLoading,
    summarizeLoading,
    planError,
    executeError,
    analyzeError,
    summarizeError,
  };
}
