'use client';

import { AgentProgressCard } from './AgentProgressCard';
import { useAgentStore } from '@/lib/stores/agentStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AgentFlowProgressProps {
  requestId: string;
}

export function AgentFlowProgress({ requestId }: AgentFlowProgressProps) {
  const { getProgress } = useAgentStore();
  const progress = getProgress(requestId);

  if (!progress) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Agent Pipeline Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {progress.planner && (
          <AgentProgressCard agent="planner" progress={progress.planner} />
        )}
        {progress.executor && (
          <AgentProgressCard agent="executor" progress={progress.executor} />
        )}
        {progress.analyzer && (
          <AgentProgressCard agent="analyzer" progress={progress.analyzer} />
        )}
        {progress.summarizer && (
          <AgentProgressCard agent="summarizer" progress={progress.summarizer} />
        )}
      </CardContent>
    </Card>
  );
}
