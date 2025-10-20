'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@apollo/client/react';
import {
  GET_ORCHESTRATOR_STATISTICS,
  GET_PLAN_STATISTICS,
  GET_EXECUTION_STATISTICS,
  GET_ANALYSIS_STATISTICS,
  GET_SUMMARY_STATISTICS
} from '@/lib/graphql/queries';
import {
  BarChart3,
  TrendingUp,
  FileText,
  Play,
  BarChart,
  MessageSquare,
  AlertCircle
} from 'lucide-react';

export default function AnalyticsPage() {
  const { data: orchestratorData, loading: orchestratorLoading } = useQuery(GET_ORCHESTRATOR_STATISTICS, {
    pollInterval: 30000,
  });

  const { data: planStatsData, loading: planStatsLoading } = useQuery(GET_PLAN_STATISTICS, {
    pollInterval: 60000,
  });

  const { data: executionStatsData, loading: executionStatsLoading } = useQuery(GET_EXECUTION_STATISTICS, {
    pollInterval: 60000,
  });

  const { data: analysisStatsData, loading: analysisStatsLoading } = useQuery(GET_ANALYSIS_STATISTICS, {
    pollInterval: 60000,
  });

  const { data: summaryStatsData, loading: summaryStatsLoading } = useQuery(GET_SUMMARY_STATISTICS, {
    pollInterval: 60000,
  });

  const orchestratorStats = (orchestratorData as any)?.getOrchestratorStatistics;
  const planStats = (planStatsData as any)?.getPlanStatistics;
  const executionStats = (executionStatsData as any)?.getExecutionStatistics;
  const analysisStats = (analysisStatsData as any)?.getAnalysisStatistics;
  const summaryStats = (summaryStatsData as any)?.getSummaryStatistics;

  const isLoading = orchestratorLoading || planStatsLoading || executionStatsLoading || analysisStatsLoading || summaryStatsLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-2">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            System performance and usage statistics
          </p>
        </div>
      </div>

      {/* Orchestrator Overview */}
      {orchestratorStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Orchestrator Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Cycles</p>
                <p className="text-2xl font-bold">{orchestratorStats.total_cycles}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{(orchestratorStats.success_rate * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Cycle Time</p>
                <p className="text-2xl font-bold">{orchestratorStats.average_cycle_time_ms.toFixed(0)}ms</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Plan Steps</p>
                <p className="text-2xl font-bold">{orchestratorStats.average_plan_steps.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Plans */}
        {planStats && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plans</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{planStats.total}</div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs">{planStats.byStatus.completed}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-xs">{planStats.byStatus.failed}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Avg: {planStats.averageExecutionTime.toFixed(0)}ms
              </p>
            </CardContent>
          </Card>
        )}

        {/* Executions */}
        {executionStats && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Executions</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{executionStats.total}</div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs">{executionStats.byStatus.completed}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-xs">{executionStats.byStatus.failed}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Success: {(executionStats.successRate * 100).toFixed(1)}%
              </p>
            </CardContent>
          </Card>
        )}

        {/* Analysis */}
        {analysisStats && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Analysis</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analysisStats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Avg Success: {(analysisStats.average_success_rate * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">
                Avg Efficiency: {(analysisStats.average_efficiency_score * 100).toFixed(1)}%
              </p>
            </CardContent>
          </Card>
        )}

        {/* Summary */}
        {summaryStats && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Summaries</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryStats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Success: {(summaryStats.success_rate * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">
                Avg Length: {summaryStats.average_content_length.toFixed(0)} chars
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan Status Breakdown */}
        {planStats && (
          <Card>
            <CardHeader>
              <CardTitle>Plan Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm">Completed</span>
                  </div>
                  <span className="font-medium">{planStats.byStatus.completed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-sm">Failed</span>
                  </div>
                  <span className="font-medium">{planStats.byStatus.failed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-sm">Pending</span>
                  </div>
                  <span className="font-medium">{planStats.byStatus.pending}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-500" />
                    <span className="text-sm">Cancelled</span>
                  </div>
                  <span className="font-medium">{planStats.byStatus.cancelled}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Execution Status Breakdown */}
        {executionStats && (
          <Card>
            <CardHeader>
              <CardTitle>Execution Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm">Completed</span>
                  </div>
                  <span className="font-medium">{executionStats.byStatus.completed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-sm">Failed</span>
                  </div>
                  <span className="font-medium">{executionStats.byStatus.failed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-sm">Running</span>
                  </div>
                  <span className="font-medium">{executionStats.byStatus.running}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-sm">Pending</span>
                  </div>
                  <span className="font-medium">{executionStats.byStatus.pending}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-500" />
                    <span className="text-sm">Cancelled</span>
                  </div>
                  <span className="font-medium">{executionStats.byStatus.cancelled}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Failure Patterns */}
      {orchestratorStats && orchestratorStats.common_failure_patterns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Common Failure Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {orchestratorStats.common_failure_patterns.map((pattern: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  <Badge variant="destructive" className="text-xs">
                    {idx + 1}
                  </Badge>
                  <span className="text-sm">{pattern}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Queries */}
      {orchestratorStats && orchestratorStats.top_queries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Top Queries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {orchestratorStats.top_queries.map((query: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    #{idx + 1}
                  </Badge>
                  <span className="text-sm truncate">{query}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
