'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Clock, Star } from 'lucide-react';

export function PerformanceCharts() {
  // Mock data - in real app this would come from API
  const performanceData = {
    dailyRequests: [
      { date: '2024-01-01', requests: 45, success: 42, errors: 3 },
      { date: '2024-01-02', requests: 52, success: 49, errors: 3 },
      { date: '2024-01-03', requests: 38, success: 36, errors: 2 },
      { date: '2024-01-04', requests: 61, success: 58, errors: 3 },
      { date: '2024-01-05', requests: 47, success: 45, errors: 2 },
      { date: '2024-01-06', requests: 55, success: 52, errors: 3 },
      { date: '2024-01-07', requests: 43, success: 41, errors: 2 }
    ],
    configPerformance: [
      { name: 'Rule-based Analyzer', usage: 45, accuracy: 92, avgTime: 1.2, rating: 4.1 },
      { name: 'LLM Analyzer', usage: 55, accuracy: 96, avgTime: 2.8, rating: 4.5 },
      { name: 'Template Summarizer', usage: 30, accuracy: 88, avgTime: 0.8, rating: 3.8 },
      { name: 'LLM Summarizer', usage: 70, accuracy: 94, avgTime: 1.5, rating: 4.3 }
    ],
    responseTimeTrends: [
      { time: '00:00', avgTime: 2.1 },
      { time: '04:00', avgTime: 1.8 },
      { time: '08:00', avgTime: 3.2 },
      { time: '12:00', avgTime: 2.9 },
      { time: '16:00', avgTime: 2.5 },
      { time: '20:00', avgTime: 2.0 }
    ]
  };

  const totalRequests = performanceData.dailyRequests.reduce((sum, day) => sum + day.requests, 0);
  const totalSuccess = performanceData.dailyRequests.reduce((sum, day) => sum + day.success, 0);
  const successRate = ((totalSuccess / totalRequests) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests (7d)</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests}</div>
            <p className="text-xs text-muted-foreground">
              {successRate}% success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3s</div>
            <p className="text-xs text-muted-foreground">
              -0.2s from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2</div>
            <p className="text-xs text-muted-foreground">
              +0.1 from last week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Requests Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Request Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceData.dailyRequests.map((day) => {
              const successRate = ((day.success / day.requests) * 100).toFixed(1);
              return (
                <div key={day.date} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{new Date(day.date).toLocaleDateString()}</span>
                    <span className="font-medium">{day.requests} requests</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(day.requests / 70) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{day.success} successful</span>
                    <span>{day.errors} errors</span>
                    <span>{successRate}% success rate</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceData.configPerformance.map((config) => (
              <div key={config.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{config.name}</span>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>{config.usage}% usage</span>
                    <span>{config.accuracy}% accuracy</span>
                    <span>{config.avgTime}s avg</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span>{config.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${config.usage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Response Time Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Response Time Trends (24h)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceData.responseTimeTrends.map((point) => (
              <div key={point.time} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{point.time}</span>
                  <span className="font-medium">{point.avgTime}s</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(point.avgTime / 4) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
