'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

export function SystemMetrics() {
  // Mock data - in real app this would come from API
  const metrics = {
    analyzerPerformance: {
      ruleBased: { usage: 45, accuracy: 92, avgTime: 1.2 },
      llmBased: { usage: 55, accuracy: 96, avgTime: 2.8 }
    },
    summarizerPerformance: {
      templateBased: { usage: 30, accuracy: 88, avgTime: 0.8 },
      llmBased: { usage: 70, accuracy: 94, avgTime: 1.5 }
    },
    systemHealth: {
      uptime: 99.8,
      errorRate: 0.2,
      activeConnections: 24
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          System Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Analyzer Performance */}
        <div>
          <h4 className="font-medium mb-3">Analyzer Performance</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Rule-based</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{metrics.analyzerPerformance.ruleBased.usage}%</span>
                <TrendingUp className="w-3 h-3 text-green-500" />
              </div>
            </div>
            <Progress value={metrics.analyzerPerformance.ruleBased.usage} className="h-2" />
            <div className="text-xs text-muted-foreground">
              Accuracy: {metrics.analyzerPerformance.ruleBased.accuracy}% • 
              Avg Time: {metrics.analyzerPerformance.ruleBased.avgTime}s
            </div>
          </div>
          
          <div className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">LLM-based</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{metrics.analyzerPerformance.llmBased.usage}%</span>
                <TrendingUp className="w-3 h-3 text-green-500" />
              </div>
            </div>
            <Progress value={metrics.analyzerPerformance.llmBased.usage} className="h-2" />
            <div className="text-xs text-muted-foreground">
              Accuracy: {metrics.analyzerPerformance.llmBased.accuracy}% • 
              Avg Time: {metrics.analyzerPerformance.llmBased.avgTime}s
            </div>
          </div>
        </div>

        {/* Summarizer Performance */}
        <div>
          <h4 className="font-medium mb-3">Summarizer Performance</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Template-based</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{metrics.summarizerPerformance.templateBased.usage}%</span>
                <TrendingDown className="w-3 h-3 text-red-500" />
              </div>
            </div>
            <Progress value={metrics.summarizerPerformance.templateBased.usage} className="h-2" />
            <div className="text-xs text-muted-foreground">
              Accuracy: {metrics.summarizerPerformance.templateBased.accuracy}% • 
              Avg Time: {metrics.summarizerPerformance.templateBased.avgTime}s
            </div>
          </div>
          
          <div className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">LLM-based</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{metrics.summarizerPerformance.llmBased.usage}%</span>
                <TrendingUp className="w-3 h-3 text-green-500" />
              </div>
            </div>
            <Progress value={metrics.summarizerPerformance.llmBased.usage} className="h-2" />
            <div className="text-xs text-muted-foreground">
              Accuracy: {metrics.summarizerPerformance.llmBased.accuracy}% • 
              Avg Time: {metrics.summarizerPerformance.llmBased.avgTime}s
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-3">System Health</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{metrics.systemHealth.uptime}%</div>
              <div className="text-xs text-muted-foreground">Uptime</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{metrics.systemHealth.errorRate}%</div>
              <div className="text-xs text-muted-foreground">Error Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{metrics.systemHealth.activeConnections}</div>
              <div className="text-xs text-muted-foreground">Active</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
