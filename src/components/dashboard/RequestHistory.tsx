'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Star, ExternalLink, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export function RequestHistory() {
  // Mock data - in real app this would come from API
  const recentRequests = [
    {
      id: 'req-001',
      query: 'Show me contamination rates for facility A',
      status: 'completed',
      duration: 1.8,
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      configs: { analyzer: 'rule-based-v1', summarizer: 'llm-based-v1' },
      rating: 5
    },
    {
      id: 'req-002', 
      query: 'Analyze waste distribution patterns',
      status: 'completed',
      duration: 3.2,
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      configs: { analyzer: 'llm-based-v1', summarizer: 'template-based-v1' },
      rating: 4
    },
    {
      id: 'req-003',
      query: 'Generate compliance report for Q3',
      status: 'error',
      duration: 0,
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      configs: { analyzer: 'rule-based-v1', summarizer: 'llm-based-v1' },
      rating: null
    },
    {
      id: 'req-004',
      query: 'What are the risk trends for this month?',
      status: 'processing',
      duration: 0,
      timestamp: new Date(Date.now() - 1000 * 60 * 2),
      configs: { analyzer: 'llm-based-v1', summarizer: 'llm-based-v1' },
      rating: null
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-500 animate-pulse" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
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

  const formatDuration = (duration: number) => {
    if (duration === 0) return 'N/A';
    return `${duration}s`;
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Requests</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard?tab=requests">
              View All
              <ExternalLink className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentRequests.map((request) => (
            <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                {getStatusIcon(request.status)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{request.query}</p>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                    <span>{formatTimestamp(request.timestamp)}</span>
                    <span>•</span>
                    <span>{formatDuration(request.duration)}</span>
                    <span>•</span>
                    <span className="truncate">{request.configs.analyzer}</span>
                    <span>•</span>
                    <span className="truncate">{request.configs.summarizer}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-2">
                {request.rating && (
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span className="text-xs font-medium">{request.rating}</span>
                  </div>
                )}
                {getStatusBadge(request.status)}
                {request.status === 'completed' && (
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                    <Star className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {recentRequests.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No recent requests</p>
            <p className="text-sm">Start a conversation to see requests here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
