'use client';

import { useQuery } from '@apollo/client/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Clock, ChevronDown, ChevronRight, Loader2, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { GET_EXECUTION } from '@/lib/graphql/queries';
import { cn } from '@/lib/utils';

interface ToolInspectorProps {
  requestId?: string;
}

export function ToolInspector({ requestId }: ToolInspectorProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([1]));

  // Fetch real execution data from GraphQL
  const { data, loading, error } = useQuery(GET_EXECUTION, {
    variables: { requestId },
    skip: !requestId,
    pollInterval: requestId ? 1000 : 0, // Poll every second during execution
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const execution = (data as any)?.getExecution;
  const toolExecution = execution?.results || [];

  const toggleStep = (step: number) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(step)) {
      newExpanded.delete(step);
    } else {
      newExpanded.add(step);
    }
    setExpandedSteps(newExpanded);
  };

  const getStatusIcon = (status: string, success: boolean | null) => {
    if (status === 'running') return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />;
    if (success === true) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (success === false) return <XCircle className="h-4 w-4 text-red-500" />;
    return <Clock className="h-4 w-4 text-gray-400" />;
  };

  const getStatusColor = (status: string, success: boolean | null) => {
    if (status === 'running') return 'border-blue-200 bg-blue-50';
    if (success === true) return 'border-green-200 bg-green-50';
    if (success === false) return 'border-red-200 bg-red-50';
    return 'border-gray-200 bg-gray-50';
  };

  const totalSteps = toolExecution.length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const completedSteps = toolExecution.filter((t: any) => t.success === true).length;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  if (loading) {
    return (
      <div className="flex flex-col h-full p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tool Execution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading execution data...
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tool Execution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="text-center text-red-600">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                <p>Error loading execution data</p>
                <p className="text-sm text-muted-foreground">{error.message}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!execution || toolExecution.length === 0) {
    return (
      <div className="flex flex-col h-full p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tool Execution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="text-center text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2" />
                <p>No execution data available</p>
                <p className="text-sm">Execute a query to see tool results here</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4 space-y-4">
      {/* Execution Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tool Execution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                {completedSteps}/{totalSteps} steps
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Current Step</p>
                <p className="font-medium">Step {completedSteps}/{totalSteps}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Time</p>
                <p className="font-medium">{execution.totalDuration || 0}ms</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Tool Steps */}
      <Card className="flex-1 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg">Execution Steps</CardTitle>
        </CardHeader>
        <CardContent className="overflow-y-auto h-full">
          <div className="space-y-3">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {toolExecution.map((tool: any, index: number) => (
              <div
                key={index}
                className={cn(
                  "border rounded-lg transition-all",
                  getStatusColor(tool.status, tool.success),
                  expandedSteps.has(index) && "shadow-sm"
                )}
              >
                <div
                  className="p-3 cursor-pointer"
                  onClick={() => toggleStep(index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {expandedSteps.has(index) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      {getStatusIcon(tool.status, tool.success)}
                      <div>
                        <p className="font-medium text-sm">
                          Step {index + 1}: {tool.tool}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {tool.duration}ms {tool.cached && '(cached)'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {tool.cached && (
                        <Badge variant="outline" className="text-xs">
                          Cache Hit
                        </Badge>
                      )}
                      <Badge 
                        variant={
                          tool.success === true ? "default" :
                          tool.success === false ? "destructive" :
                          tool.status === 'running' ? "secondary" :
                          "outline"
                        }
                        className="text-xs"
                      >
                        {tool.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {expandedSteps.has(index) && (
                  <div className="border-t p-3 bg-white">
                    <div className="space-y-3">
                      {/* Parameters */}
                      <div>
                        <h4 className="text-sm font-medium mb-2">Parameters</h4>
                        <div className="bg-muted p-2 rounded text-xs">
                          <pre className="overflow-x-auto">
                            {JSON.stringify(tool.params, null, 2)}
                          </pre>
                        </div>
                      </div>

                      {/* Result */}
                      {tool.result && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Result</h4>
                          <div className="bg-muted p-2 rounded text-xs">
                            <pre className="overflow-x-auto">
                              {JSON.stringify(tool.result, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}

                      {/* Performance */}
                      <div>
                        <h4 className="text-sm font-medium mb-2">Performance</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-muted-foreground">Duration</p>
                            <p className="font-medium">{tool.duration}ms</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Cache</p>
                            <p className="font-medium">
                              {tool.cached ? 'Hit' : 'Miss'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
