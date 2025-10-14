'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AgentFlowProgress } from '@/components/agents/AgentFlowProgress';
import { ResultsDisplay } from '@/components/results/ResultsDisplay';
import { Message } from '@/types';
import { FileText, Play, BarChart, MessageSquare } from 'lucide-react';

interface RequestDetailsProps {
  message: Message;
}

export function RequestDetails({ message }: RequestDetailsProps) {
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

  console.log("here is the analysis", message.requestData.analysis);  

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
                  <p className="mb-4">{summary.message}</p>
                  <div className="flex gap-2">
                    <Badge>Tools: {summary.toolsUsed.join(', ')}</Badge>
                    <Badge variant="outline">
                      {summary.metadata.totalDurationMs}ms
                    </Badge>
                  </div>
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
                  <div className="space-y-2">
                    {plan.plan.steps.map((step, idx) => (
                      <div key={idx} className="p-3 border rounded">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Step {idx + 1}</span>
                          <Badge>{step.tool}</Badge>
                        </div>
                        <pre className="text-xs mt-2 overflow-x-auto max-w-full bg-muted p-2 rounded">
                          {JSON.stringify(step.params, null, 2)}
                        </pre>
                      </div>
                    ))}
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
                        {execution.results.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Successful</p>
                      <p className="text-2xl font-bold text-green-600">
                        {execution.metadata.successfulSteps}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Failed</p>
                      <p className="text-2xl font-bold text-red-600">
                        {execution.metadata.failedSteps}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {execution.results.map((result, idx) => (
                      <div key={idx} className="p-3 border rounded">
                        <div className="flex items-center justify-between mb-2">
                          <Badge>{result.tool}</Badge>
                          <Badge variant={result.success ? "default" : "destructive"}>
                            {result.success ? "Success" : "Failed"}
                          </Badge>
                        </div>
                        {result.data && (
                          <pre className="text-xs overflow-x-auto max-w-full bg-muted p-2 rounded whitespace-pre-wrap break-all">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analysis" className="p-4 h-full overflow-y-auto">
            {analysis && (
              <ResultsDisplay analysisResult={analysis} />
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
