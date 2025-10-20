'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ProgressUpdate, AgentType } from '@/types';
import { cn } from '@/lib/utils';

interface AgentProgressCardProps {
  agent: 'planner' | 'executor' | 'analyzer' | 'summarizer';
  progress: ProgressUpdate;
}

const agentConfig: Record<string, AgentType> = {
  planner: {
    id: 'planner',
    name: 'Planner',
    icon: '🗺️',
    color: '#8b5cf6',
  },
  executor: {
    id: 'executor',
    name: 'Executor',
    icon: '⚡',
    color: '#f59e0b',
  },
  analyzer: {
    id: 'analyzer',
    name: 'Analyzer',
    icon: '📊',
    color: '#10b981',
  },
  summarizer: {
    id: 'summarizer',
    name: 'Summarizer',
    icon: '📝',
    color: '#06b6d4',
  },
};

export function AgentProgressCard({ agent, progress }: AgentProgressCardProps) {
  const config = agentConfig[agent];
  const isComplete = progress.progress === 100;
  const isActive = progress.progress > 0 && progress.progress < 100;

  return (
    <Card className={cn(
      "transition-all duration-300",
      isActive && "ring-2 ring-primary/20",
      isComplete && "bg-green-50 border-green-200"
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{config.icon}</span>
            <span className="font-medium text-sm">{config.name}</span>
          </div>
          <Badge
            variant={isComplete ? "default" : isActive ? "secondary" : "outline"}
            className={cn(
              "text-xs",
              isComplete && "bg-green-100 text-green-800",
              isActive && "bg-blue-100 text-blue-800"
            )}
          >
            {progress.progress}%
          </Badge>
        </div>

        <Progress
          value={progress.progress}
          className="h-2 mb-2"
        />

        <p className="text-xs text-muted-foreground">
          {progress.message}
        </p>

        {progress.phase && progress.phase !== 'processing' && (
          <div className="mt-2">
            <Badge variant="outline" className="text-xs">
              {progress.phase}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
