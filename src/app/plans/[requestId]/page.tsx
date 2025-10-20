'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@apollo/client/react';
import { GET_PLAN, GET_EXECUTIONS_BY_PLAN_ID } from '@/lib/graphql/queries';
import { PlanResponse, ExecutionResponse } from '@/types';
import { FileText, Play, Calendar, Clock, ArrowLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function PlanDetailsPage() {
  const params = useParams();
  const requestId = params.requestId as string;

  const { data: planData, loading: planLoading, error: planError } = useQuery(GET_PLAN, {
    variables: { requestId },
  });

  const { data: executionsData, loading: executionsLoading } = useQuery(GET_EXECUTIONS_BY_PLAN_ID, {
    variables: { planRequestId: requestId },
  });

  const plan = (planData as any)?.getPlan as PlanResponse;
  const executions = (executionsData as any)?.getExecutionsByPlanId as ExecutionResponse[] || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-500';
      case 'FAILED': return 'bg-red-500';
      case 'RUNNING': return 'bg-blue-500';
      case 'PENDING': return 'bg-yellow-500';
      case 'CANCELLED': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

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

  if (planLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-2">Loading plan...</p>
        </div>
      </div>
    );
  }

  if (planError || !plan) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8 text-red-600">
          <p>Error loading plan: {planError?.message || 'Plan not found'}</p>
          <Button asChild className="mt-4">
            <Link href="/plans">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Plans
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
            <Link href="/plans">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Plans
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Plan Details</h1>
            <p className="text-muted-foreground">
              Request ID: {plan.requestId}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/executions?plan=${plan.requestId}`}>
              <Play className="w-4 h-4 mr-2" />
              View Executions
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/executions/new?plan=${plan.requestId}`}>
              <Play className="w-4 h-4 mr-2" />
              Execute Plan
            </Link>
          </Button>
        </div>
      </div>

      {/* Plan Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Plan Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Query</h3>
              <p className="text-sm bg-muted p-3 rounded">{plan.query}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(plan.status)}`} />
                  <Badge variant={plan.status === 'COMPLETED' ? 'default' : plan.status === 'FAILED' ? 'destructive' : 'secondary'}>
                    {plan.status}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="text-sm font-medium">{new Date(plan.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Execution Time</p>
                <p className="text-sm font-medium">
                  {plan.executionTimeMs ? `${plan.executionTimeMs}ms` : 'N/A'}
                </p>
              </div>
            </div>

            {plan.validationErrors.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 text-red-600">Validation Errors</h4>
                <ul className="text-sm text-red-600 list-disc list-inside space-y-1">
                  {plan.validationErrors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plan Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Execution Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {plan.plan.steps.map((step, idx) => (
              <div key={idx} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Step {idx + 1}</span>
                    <Badge>{step.tool}</Badge>
                    {step.parallel && <Badge variant="outline">Parallel</Badge>}
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Parameters:</p>
                    <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                      {JSON.stringify(step.params, null, 2)}
                    </pre>
                  </div>
                  {step.dependsOn && step.dependsOn.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground">Depends on:</p>
                      <p className="text-sm">{step.dependsOn.join(', ')}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Executions */}
      <Card>
        <CardHeader>
          <CardTitle>Executions ({executions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {executionsLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading executions...</p>
            </div>
          ) : executions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No executions yet</p>
              <p className="text-xs">Execute this plan to see results</p>
            </div>
          ) : (
            <div className="space-y-3">
              {executions.map((execution) => (
                <div key={execution.executionId} className="p-4 border rounded-lg hover:bg-accent transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(execution.status)}
                        <span className="font-medium">Execution {execution.executionId.slice(0, 8)}</span>
                        <Badge variant={execution.status === 'COMPLETED' ? 'default' : execution.status === 'FAILED' ? 'destructive' : 'secondary'}>
                          {execution.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{execution.completedSteps}/{execution.totalSteps} steps</span>
                        {execution.startedAt && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(execution.startedAt).toLocaleString()}
                          </span>
                        )}
                        {execution.completedAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(execution.completedAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                      {execution.error && (
                        <p className="text-sm text-red-600 mt-1">{execution.error}</p>
                      )}
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/executions/${execution.executionId}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}