'use client';

import { useQuery } from '@apollo/client/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Activity, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { GET_METRICS } from '@/lib/graphql/queries';
// import { SystemMetrics } from '@/types';

// Mock data for demonstration
const mockMetrics = {
  totalRequests: 95,
  successfulRequests: 95,
  failedRequests: 0,
  avgDuration: 11722,
  uptime: 13721,
};

const mockToolUsage = [
  { name: 'shipments_list', count: 45, avgTime: 250 },
  { name: 'contaminants_list', count: 32, avgTime: 180 },
  { name: 'facilities_list', count: 28, avgTime: 220 },
  { name: 'inspections_list', count: 18, avgTime: 300 },
  { name: 'analytics_*', count: 12, avgTime: 450 },
];

const mockPerformanceOverTime = [
  { time: '10:00', latency: 8500, success: 100 },
  { time: '10:05', latency: 9200, success: 100 },
  { time: '10:10', latency: 7800, success: 100 },
  { time: '10:15', latency: 11200, success: 95 },
  { time: '10:20', latency: 9800, success: 100 },
  { time: '10:25', latency: 10500, success: 100 },
];

export function PerformanceDashboard() {
        // Fetch real metrics from GraphQL
        const { data, loading } = useQuery(GET_METRICS, {
    pollInterval: 5000, // Refresh every 5 seconds
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const metrics = (data as any)?.getMetrics;
  
  // Use real metrics or fallback to mock data
  const displayMetrics = metrics || mockMetrics;
  const successRate = displayMetrics.totalRequests > 0 
    ? (displayMetrics.successfulRequests / displayMetrics.totalRequests) * 100 
    : 0;

  if (loading) {
    return (
      <div className="flex flex-col h-full p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading metrics...
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4 space-y-4">
      {/* Key Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-2xl font-bold text-green-600">
                  {displayMetrics.successfulRequests}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Successful</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <XCircle className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-2xl font-bold text-red-600">
                  {displayMetrics.failedRequests}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Failed</p>
            </div>
                   <div className="text-center">
                     <div className="flex items-center justify-center mb-2">
                       <Clock className="h-4 w-4 text-blue-500 mr-1" />
                       <span className="text-2xl font-bold">
                         {(displayMetrics.avgDuration / 1000).toFixed(1)}s
                       </span>
                     </div>
                     <p className="text-xs text-muted-foreground">Avg Duration</p>
                   </div>
                   <div className="text-center">
                     <div className="flex items-center justify-center mb-2">
                       <Activity className="h-4 w-4 text-purple-500 mr-1" />
                       <span className="text-2xl font-bold">
                         {(displayMetrics.uptime / 3600).toFixed(1)}h
                       </span>
                     </div>
                     <p className="text-xs text-muted-foreground">Uptime</p>
                   </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Rate */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Success Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {successRate.toFixed(1)}% Success Rate
              </span>
              <Badge variant={successRate >= 95 ? "default" : "destructive"}>
                {successRate >= 95 ? "Excellent" : "Needs Attention"}
              </Badge>
            </div>
            <Progress value={successRate} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Tool Usage */}
      <Card className="flex-1 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg">Tool Usage</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockToolUsage}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'count' ? value : `${value}ms`,
                  name === 'count' ? 'Usage Count' : 'Avg Time'
                ]}
              />
              <Bar dataKey="count" fill="#3b82f6" name="count" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance Over Time */}
      <Card className="flex-1 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg">Performance Over Time</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockPerformanceOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} />
              <YAxis 
                yAxisId="left"
                tick={{ fontSize: 10 }}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right"
                tick={{ fontSize: 10 }}
              />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'latency' ? `${value}ms` : `${value}%`,
                  name === 'latency' ? 'Latency' : 'Success Rate'
                ]}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="latency" 
                stroke="#ef4444" 
                strokeWidth={2}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="success" 
                stroke="#22c55e" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
