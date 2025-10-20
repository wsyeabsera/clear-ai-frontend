'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@apollo/client/react';
import { GET_RECENT_EXECUTIONS, GET_EXECUTION_STATISTICS } from '@/lib/graphql/queries';
import { ExecutionResponse, ExecutionStatus } from '@/types';
import { Play, Search, Calendar, Clock, Filter, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function ExecutionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ExecutionStatus | 'ALL'>('ALL');
  const [limit, setLimit] = useState(20);

  const { data: executionsData, loading: executionsLoading, error: executionsError } = useQuery(GET_RECENT_EXECUTIONS, {
    variables: { limit },
    pollInterval: 10000, // Refresh every 10 seconds for real-time updates
  });

  const { data: statsData } = useQuery(GET_EXECUTION_STATISTICS, {
    pollInterval: 60000,
  });

  const executions = (executionsData as any)?.getRecentExecutions || [];
  const stats = (statsData as any)?.getExecutionStatistics;

  const filteredExecutions = executions.filter((execution: ExecutionResponse) => {
    const matchesSearch = execution.executionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          execution.planRequestId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || execution.status === statusFilter;
    return matchesSearch && matchesStatus;
  });


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
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Executions</h1>
          <p className="text-muted-foreground">
            Monitor plan execution progress and results
          </p>
        </div>
        <Button asChild>
          <Link href="/plans">
            <Play className="w-4 h-4 mr-2" />
            Create New Plan
          </Link>
        </Button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <div className="w-2 h-2 rounded-full bg-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(stats.successRate * 100).toFixed(1)}%</div>
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

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Steps</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageStepsPerExecution.toFixed(1)}</div>
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
                  placeholder="Search executions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ExecutionStatus | 'ALL')}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="RUNNING">Running</SelectItem>
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

      {/* Executions List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Executions</CardTitle>
        </CardHeader>
        <CardContent>
          {executionsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading executions...</p>
            </div>
          ) : executionsError ? (
            <div className="text-center py-8 text-red-600">
              <p>Error loading executions: {executionsError.message}</p>
            </div>
          ) : filteredExecutions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No executions found</p>
              <p className="text-xs">Execute a plan to see results here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredExecutions.map((execution: ExecutionResponse) => (
                <div key={execution.executionId} className="p-4 border rounded-lg hover:bg-accent transition-colors">
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
                          <p className="text-xs text-red-600">{execution.error}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/executions/${execution.executionId}`}>
                          View Details
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/plans/${execution.planRequestId}`}>
                          View Plan
                        </Link>
                      </Button>
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
