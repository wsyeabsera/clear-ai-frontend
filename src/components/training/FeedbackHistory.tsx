'use client';

import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Star, 
  Calendar, 
  Filter, 
  Search,
  MessageSquare
} from 'lucide-react';
import { LIST_TRAINING_FEEDBACK, LIST_AGENT_CONFIGS } from '@/lib/graphql/queries';
import { TrainingFeedback, AgentType, AgentConfig } from '@/types/agent-config';

interface FeedbackHistoryProps {
  onFeedbackClick?: (feedback: TrainingFeedback) => void;
}

export function FeedbackHistory({ onFeedbackClick }: FeedbackHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [agentTypeFilter, setAgentTypeFilter] = useState<AgentType | 'all'>('all');
  const [configFilter, setConfigFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');

  const { data: feedbackData, loading, refetch } = useQuery(LIST_TRAINING_FEEDBACK, {
    variables: {
      limit: 50,
      offset: 0
    }
  });

  const { data: configsData } = useQuery(LIST_AGENT_CONFIGS, {
    variables: { isActive: true }
  });

  const feedback = feedbackData && typeof feedbackData === 'object' && feedbackData !== null && 'listTrainingFeedback' in feedbackData 
    ? (feedbackData as { listTrainingFeedback: TrainingFeedback[] }).listTrainingFeedback 
    : [];
  const configs = configsData && typeof configsData === 'object' && configsData !== null && 'listAgentConfigs' in configsData 
    ? (configsData as { listAgentConfigs: AgentConfig[] }).listAgentConfigs 
    : [];

  const filteredFeedback = feedback.filter((item: TrainingFeedback) => {
    const matchesSearch = item.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.suggestions.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesAgentType = agentTypeFilter === 'all' || item.agentType === agentTypeFilter;
    const matchesConfig = configFilter === 'all' || item.configId === configFilter;
    const matchesRating = ratingFilter === 'all' || 
                         (ratingFilter === 'high' && item.rating.overall >= 4) ||
                         (ratingFilter === 'medium' && item.rating.overall >= 2 && item.rating.overall < 4) ||
                         (ratingFilter === 'low' && item.rating.overall < 2);
    
    return matchesSearch && matchesAgentType && matchesConfig && matchesRating;
  });

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading feedback history...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Feedback History</h2>
          <p className="text-muted-foreground">View and manage all submitted feedback</p>
        </div>
        <Button onClick={() => refetch()}>
          <Search className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search feedback..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Agent Type</label>
              <Select value={agentTypeFilter} onValueChange={(value: string) => setAgentTypeFilter(value as AgentType | 'all')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="analyzer">Analyzer</SelectItem>
                  <SelectItem value="summarizer">Summarizer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Configuration</label>
              <Select value={configFilter} onValueChange={setConfigFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Configs</SelectItem>
                  {configs.map((config: { id: string; name: string }) => (
                    <SelectItem key={config.id} value={config.id}>
                      {config.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Rating</label>
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="high">High (4-5 stars)</SelectItem>
                  <SelectItem value="medium">Medium (2-3 stars)</SelectItem>
                  <SelectItem value="low">Low (1-2 stars)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback List */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All ({filteredFeedback.length})</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="issues">With Issues</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <FeedbackList 
            feedback={filteredFeedback} 
            onFeedbackClick={onFeedbackClick}
            getRatingStars={getRatingStars}
            getSeverityColor={getSeverityColor}
          />
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <FeedbackList 
            feedback={filteredFeedback
              .sort((a: TrainingFeedback, b: TrainingFeedback) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 10)
            } 
            onFeedbackClick={onFeedbackClick}
            getRatingStars={getRatingStars}
            getSeverityColor={getSeverityColor}
          />
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          <FeedbackList 
            feedback={filteredFeedback.filter((f: TrainingFeedback) => f.issues.length > 0)} 
            onFeedbackClick={onFeedbackClick}
            getRatingStars={getRatingStars}
            getSeverityColor={getSeverityColor}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface FeedbackListProps {
  feedback: TrainingFeedback[];
  onFeedbackClick?: (feedback: TrainingFeedback) => void;
  getRatingStars: (rating: number) => React.ReactNode;
  getSeverityColor: (severity: string) => string;
}

function FeedbackList({ feedback, onFeedbackClick, getRatingStars, getSeverityColor }: FeedbackListProps) {
  if (feedback.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Feedback Found</h3>
          <p className="text-muted-foreground">
            No feedback matches the current filters.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {feedback.map((item) => (
        <FeedbackCard
          key={item.id}
          feedback={item}
          onFeedbackClick={onFeedbackClick}
          getRatingStars={getRatingStars}
          getSeverityColor={getSeverityColor}
        />
      ))}
    </div>
  );
}

interface FeedbackCardProps {
  feedback: TrainingFeedback;
  onFeedbackClick?: (feedback: TrainingFeedback) => void;
  getRatingStars: (rating: number) => React.ReactNode;
  getSeverityColor: (severity: string) => string;
}

function FeedbackCard({ feedback, onFeedbackClick, getRatingStars, getSeverityColor }: FeedbackCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">Request {feedback.requestId}</h3>
              <Badge variant={feedback.agentType === 'analyzer' ? 'default' : 'secondary'}>
                {feedback.agentType}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(feedback.createdAt).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4" />
                {feedback.rating.overall}/5
              </div>
            </div>
          </div>
          {onFeedbackClick && (
            <Button variant="outline" size="sm" onClick={() => onFeedbackClick(feedback)}>
              View Details
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Rating Breakdown */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Overall:</span>
              <div className="flex gap-1">
                {getRatingStars(feedback.rating.overall)}
              </div>
            </div>
            {Object.entries(feedback.rating)
              .filter(([key, value]) => key !== 'overall' && value !== undefined)
              .map(([key, value]) => (
                <div key={key} className="flex items-center gap-2 text-sm">
                  <span className="capitalize w-20">{key}:</span>
                  <div className="flex gap-1">
                    {getRatingStars(value as number)}
                  </div>
                </div>
              ))}
          </div>

          {/* Issues */}
          {feedback.issues.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Issues Reported:</h4>
              <div className="space-y-1">
                {feedback.issues.slice(0, 2).map((issue, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getSeverityColor(issue.severity)}`}
                    >
                      {issue.severity}
                    </Badge>
                    <span className="text-sm">{issue.type}</span>
                    <span className="text-sm text-muted-foreground">
                      {issue.description.substring(0, 50)}...
                    </span>
                  </div>
                ))}
                {feedback.issues.length > 2 && (
                  <p className="text-xs text-muted-foreground">
                    +{feedback.issues.length - 2} more issues
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {feedback.suggestions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Suggestions:</h4>
              <div className="space-y-1">
                {feedback.suggestions.slice(0, 2).map((suggestion, index) => (
                  <p key={index} className="text-sm text-muted-foreground">
                    • {suggestion}
                  </p>
                ))}
                {feedback.suggestions.length > 2 && (
                  <p className="text-xs text-muted-foreground">
                    +{feedback.suggestions.length - 2} more suggestions
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Metadata */}
          {feedback.metadata && (
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {feedback.metadata.responseTime && (
                <span>Response: {feedback.metadata.responseTime}ms</span>
              )}
              {feedback.metadata.confidence && (
                <span>Confidence: {Math.round(feedback.metadata.confidence * 100)}%</span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
