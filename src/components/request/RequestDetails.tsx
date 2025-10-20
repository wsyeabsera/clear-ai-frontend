'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AgentFlowProgress } from '@/components/agents/AgentFlowProgress';
import { Message } from '@/types';
import { FileText, Play, BarChart, MessageSquare, AlertCircle } from 'lucide-react';

interface RequestDetailsProps {
  message: Message;
}

function RequestDetailsContent({ message }: RequestDetailsProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!message.requestData) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>No request details available</p>
      </div>
    );
  }

  const { plan, execution, analysis, summary } = message.requestData;

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Request Details</h3>
        <p className="text-sm text-muted-foreground">
          {isClient ? new Date(message.timestamp).toLocaleString() : ''}
        </p>
      </div>

      {/* Agent Progress */}
      {message.requestId && (
        <div className="p-4 border-b">
          <AgentFlowProgress requestId={message.requestId} />
        </div>
      )}

      <Tabs defaultValue="summary" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid w-full grid-cols-4 m-2 flex-shrink-0">
          <TabsTrigger value="summary">
            <MessageSquare className="h-4 w-4 mr-1" />
            Summary
          </TabsTrigger>
          <TabsTrigger value="plan">
            <FileText className="h-4 w-4 mr-1" />
            Plan
          </TabsTrigger>
          <TabsTrigger value="execution">
            <Play className="h-4 w-4 mr-1" />
            Execution
          </TabsTrigger>
          <TabsTrigger value="analysis">
            <BarChart className="h-4 w-4 mr-1" />
            Analysis
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto min-h-0">
          <TabsContent value="summary" className="p-4 h-full overflow-y-auto">
            {summary && (
              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{summary.content}</p>
                  <div className="flex gap-2">
                    <Badge>Format: {summary.format}</Badge>
                    {summary.structured_data && (
                      <Badge variant="outline">
                        {summary.structured_data.success ? 'Success' : 'Failed'}
                      </Badge>
                    )}
                  </div>
                  {summary.structured_data && (
                    <div className="mt-4 space-y-4">
                      {summary.structured_data.answer && (
                        <div>
                          <h4 className="font-medium mb-2">Answer:</h4>
                          <p className="text-sm">{summary.structured_data.answer}</p>
                        </div>
                      )}
                      {summary.structured_data.key_results && summary.structured_data.key_results.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Key Results:</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            {summary.structured_data.key_results.map((result, idx) => (
                              <li key={idx}>
                                {typeof result === 'string' ? result : JSON.stringify(result)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {summary.structured_data.recommendations && summary.structured_data.recommendations.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Recommendations:</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            {summary.structured_data.recommendations.map((rec, idx) => (
                              <li key={idx}>
                                {typeof rec === 'string' ? rec : JSON.stringify(rec)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {summary.structured_data.errors && summary.structured_data.errors.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Errors:</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-red-600">
                            {summary.structured_data.errors.map((error, idx) => (
                              <li key={idx}>
                                {typeof error === 'string' ? error : JSON.stringify(error)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="plan" className="p-4 h-full overflow-y-auto">
            {plan && (
              <Card>
                <CardHeader>
                  <CardTitle>Execution Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">Query:</p>
                    <p className="font-medium">{plan.query}</p>
                  </div>
                  {plan.plan.metadata && (
                    <div className="mb-4 p-3 bg-muted rounded">
                      <h4 className="font-medium mb-2">Plan Metadata:</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Total Steps: {plan.plan.metadata.totalSteps || 0}</div>
                        <div>Parallel Steps: {plan.plan.metadata.parallelSteps || 0}</div>
                        <div>Est. Duration: {plan.plan.metadata.estimatedDurationMs || 0}ms</div>
                        <div>Request ID: {plan.plan.metadata.requestId || 'N/A'}</div>
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    {plan.plan.steps && plan.plan.steps.length > 0 ? plan.plan.steps.map((step, idx) => (
                      <div key={idx} className="p-3 border rounded">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Step {idx + 1}</span>
                          <Badge>{step.tool}</Badge>
                        </div>
                        {step.description && (
                          <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                        )}
                        <pre className="text-xs mt-2 overflow-x-auto max-w-full bg-muted p-2 rounded">
                          {JSON.stringify(step.params, null, 2)}
                        </pre>
                        {step.dependsOn && step.dependsOn.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Depends on: {step.dependsOn.join(', ')}
                          </p>
                        )}
                        {step.parallel && (
                          <Badge variant="outline" className="text-xs mt-1">Parallel</Badge>
                        )}
                      </div>
                    )) : (
                      <p className="text-sm text-muted-foreground">No steps available</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="execution" className="p-4 h-full overflow-y-auto">
            {execution && (
              <Card>
                <CardHeader>
                  <CardTitle>Execution Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold">
                        {execution.totalSteps}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <p className="text-2xl font-bold text-green-600">
                        {execution.completedSteps}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Failed</p>
                      <p className="text-2xl font-bold text-red-600">
                        {execution.failedSteps}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {execution.results && execution.results.length > 0 ? execution.results.map((result, idx) => (
                      <div key={idx} className="p-3 border rounded">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge>Step {result.stepIndex}</Badge>
                            <Badge>{result.tool}</Badge>
                            <Badge variant={result.status === 'COMPLETED' ? "default" : result.status === 'FAILED' ? "destructive" : "secondary"}>
                              {result.status}
                            </Badge>
                          </div>
                          {result.retryCount > 0 && (
                            <Badge variant="outline">Retries: {result.retryCount}</Badge>
                          )}
                        </div>
                        {result.result && (
                          <pre className="text-xs overflow-x-auto max-w-full bg-muted p-2 rounded whitespace-pre-wrap break-all">
                            {JSON.stringify(result.result, null, 2)}
                          </pre>
                        )}
                        {result.error && (
                          <p className="text-xs text-red-600 mt-1">{result.error}</p>
                        )}
                        {result.dependencies && result.dependencies.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Dependencies: {result.dependencies.join(', ')}
                          </p>
                        )}
                        <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                          {result.startedAt && <span>Started: {new Date(result.startedAt).toLocaleTimeString()}</span>}
                          {result.completedAt && <span>Completed: {new Date(result.completedAt).toLocaleTimeString()}</span>}
                        </div>
                      </div>
                    )) : (
                      <p className="text-sm text-muted-foreground">No execution results available</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analysis" className="p-4 h-full overflow-y-auto">
            {analysis && (
              <Card>
                <CardHeader>
                  <CardTitle>Analysis Results</CardTitle>
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
                        <div>Success Rate: {analysis.evaluation_metrics?.success_rate ? (analysis.evaluation_metrics.success_rate * 100).toFixed(1) : 0}%</div>
                        <div>Efficiency Score: {analysis.evaluation_metrics?.efficiency_score ? (analysis.evaluation_metrics.efficiency_score * 100).toFixed(1) : 0}%</div>
                        <div>Avg Step Time: {analysis.evaluation_metrics?.average_step_time_ms || 0}ms</div>
                        <div>Retry Frequency: {analysis.evaluation_metrics?.retry_frequency || 0}</div>
                      </div>
                      {analysis.evaluation_metrics?.error_patterns && analysis.evaluation_metrics.error_patterns.length > 0 && (
                        <div className="mt-2">
                          <h5 className="font-medium mb-1">Error Patterns:</h5>
                          <ul className="list-disc list-inside space-y-1 text-xs">
                            {analysis.evaluation_metrics.error_patterns.map((pattern, idx) => (
                              <li key={idx}>
                                {typeof pattern === 'string' ? pattern : JSON.stringify(pattern)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {analysis.evaluation_metrics?.step_success_rates && Object.keys(analysis.evaluation_metrics.step_success_rates).length > 0 && (
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
                      {analysis.success_indicators && analysis.success_indicators.length > 0 ? (
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {analysis.success_indicators.map((indicator, idx) => (
                            <li key={idx}>
                              {typeof indicator === 'string' ? indicator : JSON.stringify(indicator)}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">No success indicators available</p>
                      )}
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Failure Patterns</h4>
                      {analysis.failure_patterns && analysis.failure_patterns.length > 0 ? (
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {analysis.failure_patterns.map((pattern, idx) => (
                            <li key={idx}>
                              {typeof pattern === 'string' ? pattern : JSON.stringify(pattern)}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">No failure patterns identified</p>
                      )}
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Recommendations</h4>
                      {analysis.recommendations && analysis.recommendations.length > 0 ? (
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {analysis.recommendations.map((rec, idx) => (
                            <li key={idx}>
                              {typeof rec === 'string' ? rec : JSON.stringify(rec)}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">No recommendations available</p>
                      )}
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Improvement Notes</h4>
                      <p className="text-sm">{analysis.improvement_notes}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

export function RequestDetails({ message }: RequestDetailsProps) {
  try {
    return <RequestDetailsContent message={message} />;
  } catch (error) {
    console.error('Error rendering RequestDetails:', error);
    return (
      <div className="p-4 text-center text-muted-foreground">
        <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
        <p className="text-sm">Error loading request details</p>
        <p className="text-xs mt-1">Please try refreshing the page</p>
      </div>
    );
  }
}
