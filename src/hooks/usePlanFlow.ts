'use client';

import { useMutation } from '@apollo/client/react';
import { CREATE_PLAN, EXECUTE_PLAN, ANALYZE_EXECUTION, GENERATE_SUMMARY } from '@/lib/graphql/queries';
import { usePlanStore } from '@/lib/stores/planStore';
import { PlanResponse, ExecutionResponse, AnalysisResult, SummaryResult } from '@/types';

export function usePlanFlow() {
  const { setPlan, setExecution, setExecuting, clearAll } = usePlanStore();

  const [createPlanMutation, { loading: planLoading, error: planError }] = useMutation(CREATE_PLAN);
  const [executePlanMutation, { loading: executeLoading, error: executeError }] = useMutation(EXECUTE_PLAN);
  const [analyzeExecutionMutation, { loading: analyzeLoading, error: analyzeError }] = useMutation(ANALYZE_EXECUTION);
  const [generateSummaryMutation, { loading: summarizeLoading, error: summarizeError }] = useMutation(GENERATE_SUMMARY);

  const createPlan = async (query: string, llmProvider?: string): Promise<PlanResponse> => {
    try {
      const { data } = await createPlanMutation({
        variables: { query, llmProvider }
      });

      if ((data as any)?.createPlan) {
        const planResult = (data as any).createPlan as PlanResponse;
        setPlan(planResult);
        return planResult;
      }
      throw new Error('No plan data returned');
    } catch (error) {
      console.error('Failed to create plan:', error);
      throw error;
    }
  };

  const executePlan = async (planRequestId: string): Promise<ExecutionResponse> => {
    try {
      setExecuting(true);
      const { data } = await executePlanMutation({
        variables: { planRequestId }
      });

      if ((data as any)?.executePlan) {
        const executionResult = (data as any).executePlan as ExecutionResponse;
        setExecution(executionResult);
        return executionResult;
      }
      throw new Error('No execution data returned');
    } catch (error) {
      console.error('Failed to execute plan:', error);
      throw error;
    } finally {
      setExecuting(false);
    }
  };

  const analyzeExecution = async (executionId: string): Promise<AnalysisResult> => {
    try {
      const { data } = await analyzeExecutionMutation({
        variables: { executionId }
      });

      if ((data as any)?.analyzeExecution) {
        return (data as any).analyzeExecution as AnalysisResult;
      }
      throw new Error('No analysis data returned');
    } catch (error) {
      console.error('Failed to analyze execution:', error);
      throw error;
    }
  };

  const generateSummary = async (executionId: string, format?: string): Promise<SummaryResult> => {
    try {
      const { data } = await generateSummaryMutation({
        variables: { executionId, format }
      });

      if ((data as any)?.generateSummary) {
        return (data as any).generateSummary as SummaryResult;
      }
      throw new Error('No summary data returned');
    } catch (error) {
      console.error('Failed to generate summary:', error);
      throw error;
    }
  };

  const executeCompleteFlow = async (query: string, llmProvider?: string) => {
    try {
      // Step 1: Create Plan
      const planResult = await createPlan(query, llmProvider);
      if (!planResult) throw new Error('Plan creation failed');

      // Step 2: Execute Plan
      const executionResult = await executePlan(planResult.requestId);
      if (!executionResult) throw new Error('Execution failed');

      // Step 3: Analyze Execution
      const analysisResult = await analyzeExecution(executionResult.executionId);
      if (!analysisResult) throw new Error('Analysis failed');

      // Step 4: Generate Summary
      const summaryResult = await generateSummary(executionResult.executionId, 'INTELLIGENT');
      if (!summaryResult) throw new Error('Summary generation failed');

      return {
        plan: planResult,
        execution: executionResult,
        analysis: analysisResult,
        summary: summaryResult
      };
    } catch (error) {
      console.error('Complete flow failed:', error);
      clearAll();
      throw error;
    }
  };

  return {
    createPlan,
    executePlan,
    analyzeExecution,
    generateSummary,
    executeCompleteFlow,
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
