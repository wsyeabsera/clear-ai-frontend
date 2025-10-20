'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlanResponse, PlanStatus } from '@/types';
import { FileText, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';

interface PlanCardProps {
  plan: PlanResponse;
  showActions?: boolean;
}

export function PlanCard({ plan, showActions = true }: PlanCardProps) {
  const getStatusColor = (status: PlanStatus) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-500';
      case 'FAILED': return 'bg-red-500';
      case 'PENDING': return 'bg-yellow-500';
      case 'CANCELLED': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: PlanStatus) => {
    switch (status) {
      case 'COMPLETED': return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'FAILED': return <Badge variant="destructive">Failed</Badge>;
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
              <div className={`w-2 h-2 rounded-full ${getStatusColor(plan.status)}`} />
              <h3 className="font-medium truncate">{plan.query}</h3>
              {getStatusBadge(plan.status)}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {plan.plan.steps.length} steps
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(plan.createdAt).toLocaleString()}
              </span>
              {plan.executionTimeMs && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {plan.executionTimeMs}ms
                </span>
              )}
            </div>
            {plan.validationErrors.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-red-600">Validation Errors:</p>
                <ul className="text-xs text-red-600 list-disc list-inside">
                  {plan.validationErrors.slice(0, 2).map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {showActions && (
            <div className="flex items-center gap-2 ml-4">
              <Link
                href={`/plans/${plan.requestId}`}
                className="text-sm text-primary hover:underline"
              >
                View Details
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
