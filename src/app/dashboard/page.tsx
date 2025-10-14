'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Settings,
  Star,
  MessageSquare,
  Download
} from 'lucide-react';
import { SystemMetrics } from '@/components/dashboard/SystemMetrics';
import { RequestHistory } from '@/components/dashboard/RequestHistory';
import { PerformanceCharts } from '@/components/dashboard/PerformanceCharts';
import Link from 'next/link';

export default function DashboardPage() {

  // Mock data - in real app this would come from API
  const systemStats = {
    totalRequests: 1247,
    successRate: 94.2,
    avgResponseTime: 2.3,
    activeConfigs: 8,
    totalFeedback: 156,
    avgRating: 4.2
  };

  const recentRequests = [
    {
      id: 'req-001',
      query: 'Show me contamination rates for facility A',
      status: 'completed',
      duration: 1.8,
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      configs: { analyzer: 'rule-based-v1', summarizer: 'llm-based-v1' }
    },
    {
      id: 'req-002', 
      query: 'Analyze waste distribution patterns',
      status: 'completed',
      duration: 3.2,
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      configs: { analyzer: 'llm-based-v1', summarizer: 'template-based-v1' }
    },
    {
      id: 'req-003',
      query: 'Generate compliance report for Q3',
      status: 'error',
      duration: 0,
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      configs: { analyzer: 'rule-based-v1', summarizer: 'llm-based-v1' }
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'processing':
        return <Badge variant="secondary">Processing</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor system performance and agent activity
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button asChild>
            <Link href="/configs">
              <Settings className="w-4 h-4 mr-2" />
              Manage Configs
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.successRate}%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.avgResponseTime}s</div>
            <p className="text-xs text-muted-foreground">
              -0.3s from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Configs</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.activeConfigs}</div>
            <p className="text-xs text-muted-foreground">
              {systemStats.totalFeedback} feedback items
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requests">Recent Requests</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SystemMetrics />
            <RequestHistory />
          </div>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(request.status)}
                      <div>
                        <p className="font-medium">{request.query}</p>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>{request.timestamp.toLocaleString()}</span>
                          <span>•</span>
                          <span>{request.duration}s</span>
                          <span>•</span>
                          <span>Analyzer: {request.configs.analyzer}</span>
                          <span>•</span>
                          <span>Summarizer: {request.configs.summarizer}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(request.status)}
                      <Button size="sm" variant="ghost">
                        <Star className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <PerformanceCharts />
        </TabsContent>
      </Tabs>
    </div>
  );
}
