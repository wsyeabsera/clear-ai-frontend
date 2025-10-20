'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@apollo/client/react';
import { GET_EXECUTION, GET_ANALYSIS_BY_EXECUTION_ID, GET_SUMMARY_BY_EXECUTION_ID } from '@/lib/graphql/queries';
import { ExecutionResponse, AnalysisResult, SummaryResult } from '@/types';
import { Play, ArrowLeft, CheckCircle, XCircle, AlertCircle, BarChart, FileText } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ExecutionDetailsPage() {
  const params = useParams();
  const executionId = params.executionId as string;

  const { data: executionData, loading: executionLoading, error: executionError } = useQuery(GET_EXECUTION, {
    variables: { executionId },
    pollInterval: 5000, // Refresh every 5 seconds for real-time updates
  });

  const { data: analysisData } = useQuery(GET_ANALYSIS_BY_EXECUTION_ID, {
    variables: { executionId },
    skip: !(executionData as any)?.getExecution, // Only run if execution exists
  });

  const { data: summaryData } = useQuery(GET_SUMMARY_BY_EXECUTION_ID, {
    variables: { executionId },
    skip: !(executionData as any)?.getExecution, // Only run if execution exists
  });

  const execution = (executionData as any)?.getExecution as ExecutionResponse;
  const analysis = (analysisData as any)?.getAnalysisByExecutionId as AnalysisResult;
  const summary = (summaryData as any)?.getSummaryByExecutionId as SummaryResult;


  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'FAILED': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'RUNNING': return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'PENDING': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4 text-gray-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  if (executionLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-2">Loading execution...</p>
        </div>
      </div>
    );
  }

  if (executionError || !execution) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8 text-red-600">
          <p>Error loading execution: {executionError?.message || 'Execution not found'}</p>
          <Button asChild className="mt-4">
            <Link href="/executions">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Executions
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/executions">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Executions
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Execution Details</h1>
            <p className="text-muted-foreground">
              Execution ID: {execution.executionId}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/plans/${execution.planRequestId}`}>
              <FileText className="w-4 h-4 mr-2" />
              View Plan
            </Link>
          </Button>
        </div>
      </div>

      {/* Execution Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            Execution Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusIcon(execution.status)}
                  <Badge variant={execution.status === 'COMPLETED' ? 'default' : execution.status === 'FAILED' ? 'destructive' : 'secondary'}>
                    {execution.status}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-sm font-medium">{execution.completedSteps}/{execution.totalSteps} steps</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Started</p>
                <p className="text-sm font-medium">
                  {execution.startedAt ? new Date(execution.startedAt).toLocaleString() : 'Not started'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-sm font-medium">
                  {execution.completedAt ? new Date(execution.completedAt).toLocaleString() : 'Not completed'}
                </p>
              </div>
            </div>

            {execution.error && (
              <div>
                <h4 className="font-medium mb-2 text-red-600">Error</h4>
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded">{execution.error}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Execution Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Execution Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {execution.results.map((result, idx) => (
              <div key={idx} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Step {result.stepIndex}</span>
                    <Badge>{result.tool}</Badge>
                    <Badge variant={result.status === 'COMPLETED' ? "default" : result.status === 'FAILED' ? "destructive" : "secondary"}>
                      {result.status}
                    </Badge>
                    {result.retryCount > 0 && <Badge variant="outline">Retries: {result.retryCount}</Badge>}
                  </div>
                  <div className="flex gap-2 text-sm text-muted-foreground">
                    {result.startedAt && <span>Started: {new Date(result.startedAt).toLocaleTimeString()}</span>}
                    {result.completedAt && <span>Completed: {new Date(result.completedAt).toLocaleTimeString()}</span>}
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Parameters:</p>
                    <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                      {JSON.stringify(result.params, null, 2)}
                    </pre>
                  </div>
                  {result.result && (
                    <div>
                      <p className="text-sm text-muted-foreground">Result:</p>
                      <pre className="text-xs bg-muted p-2 rounded overflow-x-auto whitespace-pre-wrap break-all">
                        {JSON.stringify(result.result, null, 2)}
                      </pre>
                    </div>
                  )}
                  {result.error && (
                    <div>
                      <p className="text-sm text-red-600">Error:</p>
                      <p className="text-sm text-red-600">{result.error}</p>
                    </div>
                  )}
                  {result.dependencies && result.dependencies.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground">Dependencies:</p>
                      <p className="text-sm">{result.dependencies.join(', ')}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analysis */}
      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="w-4 h-4" />
              Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Feedback</h4>
                <p className="text-sm">{analysis.feedback}</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Evaluation Metrics</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Success Rate: {(analysis.evaluation_metrics.success_rate * 100).toFixed(1)}%</div>
                  <div>Efficiency Score: {(analysis.evaluation_metrics.efficiency_score * 100).toFixed(1)}%</div>
                  <div>Avg Step Time: {analysis.evaluation_metrics.average_step_time_ms}ms</div>
                  <div>Retry Frequency: {analysis.evaluation_metrics.retry_frequency}</div>
                </div>
                {analysis.evaluation_metrics.error_patterns.length > 0 && (
                  <div className="mt-2">
                    <h5 className="font-medium mb-1">Error Patterns:</h5>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      {analysis.evaluation_metrics.error_patterns.map((pattern, idx) => (
                        <li key={idx}>{pattern}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {Object.keys(analysis.evaluation_metrics.step_success_rates).length > 0 && (
                  <div className="mt-2">
                    <h5 className="font-medium mb-1">Step Success Rates:</h5>
                    <div className="text-xs space-y-1">
                      {Object.entries(analysis.evaluation_metrics.step_success_rates).map(([step, rate]) => (
                        <div key={step}>Step {step}: {(rate * 100).toFixed(1)}%</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-medium mb-2">Success Indicators</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {analysis.success_indicators.map((indicator, idx) => (
                    <li key={idx}>{indicator}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">Failure Patterns</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {analysis.failure_patterns.map((pattern, idx) => (
                    <li key={idx}>{pattern}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">Recommendations</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {analysis.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">Improvement Notes</h4>
                <p className="text-sm">{analysis.improvement_notes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Content</h4>
                <p className="text-sm">{summary.content}</p>
              </div>

              <div className="flex gap-2">
                <Badge>Format: {summary.format}</Badge>
                {summary.structured_data && (
                  <Badge variant="outline">
                    {summary.structured_data.success ? 'Success' : 'Failed'}
                  </Badge>
                )}
              </div>

              {summary.structured_data && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Answer</h4>
                    <p className="text-sm">{summary.structured_data.answer}</p>
                  </div>
                  {summary.structured_data.key_results.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Key Results</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {summary.structured_data.key_results.map((result, idx) => (
                          <li key={idx}>{result}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {summary.structured_data.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Recommendations</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {summary.structured_data.recommendations.map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
