'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExecutionResponse, ExecutionStatus } from '@/types';
import { Play, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface ExecutionCardProps {
  execution: ExecutionResponse;
  showActions?: boolean;
}

export function ExecutionCard({ execution, showActions = true }: ExecutionCardProps) {

  const getStatusIcon = (status: ExecutionStatus) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'FAILED': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'RUNNING': return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'PENDING': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4 text-gray-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: ExecutionStatus) => {
    switch (status) {
      case 'COMPLETED': return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'FAILED': return <Badge variant="destructive">Failed</Badge>;
      case 'RUNNING': return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Running</Badge>;
      case 'PENDING': return <Badge variant="secondary">Pending</Badge>;
      case 'CANCELLED': return <Badge variant="outline">Cancelled</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {getStatusIcon(execution.status)}
              <h3 className="font-medium truncate">Execution {execution.executionId.slice(0, 8)}</h3>
              {getStatusBadge(execution.status)}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Play className="w-3 h-3" />
                {execution.completedSteps}/{execution.totalSteps} steps
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Plan: {execution.planRequestId.slice(0, 8)}
              </span>
              {execution.startedAt && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(execution.startedAt).toLocaleString()}
                </span>
              )}
            </div>
            {execution.error && (
              <div className="mt-2">
                <p className="text-xs text-red-600">Error:</p>
                <p className="text-xs text-red-600 truncate">{execution.error}</p>
              </div>
            )}
          </div>
          {showActions && (
            <div className="flex items-center gap-2 ml-4">
              <Link
                href={`/executions/${execution.executionId}`}
                className="text-sm text-primary hover:underline"
              >
                View Details
              </Link>
              <Link
                href={`/plans/${execution.planRequestId}`}
                className="text-sm text-muted-foreground hover:underline"
              >
                View Plan
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
