'use client';

import { useEffect } from 'react';
import { useSubscription } from '@apollo/client/react';
import {
  PLANNER_PROGRESS_SUBSCRIPTION,
  EXECUTOR_PROGRESS_SUBSCRIPTION,
  ANALYZER_PROGRESS_SUBSCRIPTION,
  SUMMARIZER_PROGRESS_SUBSCRIPTION,
} from '@/lib/graphql/queries';
import { useAgentStore } from '@/lib/stores/agentStore';
import { ProgressUpdate } from '@/types';

export function useAgentSubscriptions(requestId: string | null) {
  const { updateProgress } = useAgentStore();

  // Subscribe to all 4 agent progress channels
  const { data: plannerData } = useSubscription(PLANNER_PROGRESS_SUBSCRIPTION, {
    variables: { requestId },
    skip: !requestId,
  });

  const { data: executorData } = useSubscription(EXECUTOR_PROGRESS_SUBSCRIPTION, {
    variables: { requestId },
    skip: !requestId,
  });

  const { data: analyzerData } = useSubscription(ANALYZER_PROGRESS_SUBSCRIPTION, {
    variables: { requestId },
    skip: !requestId,
  });

  const { data: summarizerData } = useSubscription(SUMMARIZER_PROGRESS_SUBSCRIPTION, {
    variables: { requestId },
    skip: !requestId,
  });

  // Update agent store with real-time progress data
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (requestId && (plannerData as any)?.plannerProgress) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updateProgress(requestId, 'planner', (plannerData as any).plannerProgress as ProgressUpdate);
    }
  }, [requestId, plannerData, updateProgress]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (requestId && (executorData as any)?.executorProgress) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updateProgress(requestId, 'executor', (executorData as any).executorProgress as ProgressUpdate);
    }
  }, [requestId, executorData, updateProgress]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (requestId && (analyzerData as any)?.analyzerProgress) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updateProgress(requestId, 'analyzer', (analyzerData as any).analyzerProgress as ProgressUpdate);
    }
  }, [requestId, analyzerData, updateProgress]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (requestId && (summarizerData as any)?.summarizerProgress) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updateProgress(requestId, 'summarizer', (summarizerData as any).summarizerProgress as ProgressUpdate);
    }
  }, [requestId, summarizerData, updateProgress]);

  // Return subscription status for debugging
  return {
    plannerConnected: !!plannerData,
    executorConnected: !!executorData,
    analyzerConnected: !!analyzerData,
    summarizerConnected: !!summarizerData,
  };
}
