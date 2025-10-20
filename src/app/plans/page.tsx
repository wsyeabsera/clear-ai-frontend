'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@apollo/client/react';
import { GET_RECENT_PLANS, GET_PLAN_STATISTICS } from '@/lib/graphql/queries';
import { PlanResponse, PlanStatus } from '@/types';
import { FileText, Search, Play, Calendar, Clock, Filter } from 'lucide-react';
import Link from 'next/link';

export default function PlansPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PlanStatus | 'ALL'>('ALL');
  const [limit, setLimit] = useState(20);

  const { data: plansData, loading: plansLoading, error: plansError } = useQuery(GET_RECENT_PLANS, {
    variables: { limit },
    pollInterval: 30000,
  });

  const { data: statsData } = useQuery(GET_PLAN_STATISTICS, {
    pollInterval: 60000,
  });

  const plans = (plansData as any)?.getRecentPlans || [];
  const stats = (statsData as any)?.getPlanStatistics;

  const filteredPlans = plans.filter((plan: PlanResponse) => {
    const matchesSearch = plan.query.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || plan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Plans</h1>
          <p className="text-muted-foreground">
            View and manage AI execution plans
          </p>
        </div>
        <Button asChild>
          <Link href="/">
            <FileText className="w-4 h-4 mr-2" />
            Create New Plan
          </Link>
        </Button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <div className="w-2 h-2 rounded-full bg-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.byStatus.completed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <div className="w-2 h-2 rounded-full bg-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.byStatus.failed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Execution Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageExecutionTime.toFixed(1)}ms</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search plans..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as PlanStatus | 'ALL')}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={limit.toString()} onValueChange={(value) => setLimit(parseInt(value))}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Limit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Plans List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Plans</CardTitle>
        </CardHeader>
        <CardContent>
          {plansLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading plans...</p>
            </div>
          ) : plansError ? (
            <div className="text-center py-8 text-red-600">
              <p>Error loading plans: {plansError.message}</p>
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No plans found</p>
              <p className="text-xs">Create a plan through the chat interface</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPlans.map((plan: PlanResponse) => (
                <div key={plan.requestId} className="p-4 border rounded-lg hover:bg-accent transition-colors">
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
                            {plan.validationErrors.map((error, idx) => (
                              <li key={idx}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/plans/${plan.requestId}`}>
                          View Details
                        </Link>
                      </Button>
                      {plan.status === 'COMPLETED' && (
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/executions?plan=${plan.requestId}`}>
                            <Play className="w-3 h-3 mr-1" />
                            Execute
                          </Link>
                        </Button>
                      )}
                    </div>
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
