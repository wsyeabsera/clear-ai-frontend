'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Star, 
  AlertTriangle,
  CheckCircle,
  Target,
  Zap
} from 'lucide-react';
import { 
  GET_TRAINING_STATS, 
  LIST_AGENT_CONFIGS, 
  TRAIN_CONFIG 
} from '@/lib/graphql/queries';
import { TrainingStats, AgentConfig } from '@/types/agent-config';

interface TrainingDashboardProps {
  onFeedbackClick?: () => void;
}

export function TrainingDashboard({ onFeedbackClick }: TrainingDashboardProps) {
  const [selectedConfigId, setSelectedConfigId] = useState<string>('');

  const { data: configsData } = useQuery(LIST_AGENT_CONFIGS, {
    variables: { isActive: true }
  });

  const { data: statsData, loading: statsLoading, refetch: refetchStats } = useQuery(
    GET_TRAINING_STATS,
    {
      variables: { configId: selectedConfigId },
      skip: !selectedConfigId
    }
  );

  const [trainConfig, { loading: trainingLoading }] = useMutation(TRAIN_CONFIG, {
    onCompleted: () => {
      refetchStats();
    }
  });

  const configs = configsData && typeof configsData === 'object' && configsData !== null && 'listAgentConfigs' in configsData 
    ? (configsData as { listAgentConfigs: AgentConfig[] }).listAgentConfigs 
    : [];
  const stats = statsData && typeof statsData === 'object' && statsData !== null && 'getTrainingStats' in statsData 
    ? (statsData as { getTrainingStats: TrainingStats }).getTrainingStats 
    : null;

  const handleTrainConfig = async () => {
    if (selectedConfigId) {
      try {
        await trainConfig({
          variables: { 
            configId: selectedConfigId,
            options: {
              maxIterations: 10,
              learningRate: 0.1,
              targetImprovement: 0.1
            }
          }
        });
      } catch (error) {
        console.error('Failed to train config:', error);
      }
    }
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Training Dashboard</h2>
          <p className="text-muted-foreground">Monitor and improve agent performance</p>
        </div>
        {onFeedbackClick && (
          <Button onClick={onFeedbackClick}>
            <Star className="w-4 h-4 mr-2" />
            Submit Feedback
          </Button>
        )}
      </div>

      {/* Configuration Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Configuration</CardTitle>
          <CardDescription>Choose a configuration to view training statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedConfigId} onValueChange={setSelectedConfigId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a configuration" />
            </SelectTrigger>
            <SelectContent>
              {configs.map((config: AgentConfig) => (
                <SelectItem key={config.id} value={config.id}>
                  <div className="flex items-center gap-2">
                    <span>{config.name}</span>
                    <Badge variant={config.type === 'analyzer' ? 'default' : 'secondary'}>
                      {config.type}
                    </Badge>
                    {config.isDefault && (
                      <Badge variant="outline" className="text-xs">Default</Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedConfigId && (
        <>
          {statsLoading ? (
            <div className="text-center py-8">Loading training statistics...</div>
          ) : stats ? (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="issues">Issues</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <OverviewTab stats={stats} />
              </TabsContent>

              <TabsContent value="performance" className="space-y-4">
                <PerformanceTab stats={stats} />
              </TabsContent>

              <TabsContent value="issues" className="space-y-4">
                <IssuesTab stats={stats} />
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-4">
                <RecommendationsTab 
                  stats={stats} 
                  onTrain={handleTrainConfig}
                  trainingLoading={trainingLoading}
                />
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Training Data</h3>
                <p className="text-muted-foreground mb-4">
                  This configuration hasn&apos;t received any feedback yet.
                </p>
                {onFeedbackClick && (
                  <Button onClick={onFeedbackClick}>
                    <Star className="w-4 h-4 mr-2" />
                    Submit First Feedback
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

interface OverviewTabProps {
  stats: TrainingStats;
}

function OverviewTab({ stats }: OverviewTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalFeedback}</div>
          <p className="text-xs text-muted-foreground">
            Feedback submissions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.avgRating.toFixed(1)}/5</div>
          <p className="text-xs text-muted-foreground">
            Overall performance
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Confidence</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.round(stats.performanceMetrics.avgConfidence * 100)}%
          </div>
          <p className="text-xs text-muted-foreground">
            Average confidence
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Usage</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.performanceMetrics.totalUsage}</div>
          <p className="text-xs text-muted-foreground">
            Total usage count
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

interface PerformanceTabProps {
  stats: TrainingStats;
}

function PerformanceTab({ stats }: PerformanceTabProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Average Confidence</span>
              <span>{Math.round(stats.performanceMetrics.avgConfidence * 100)}%</span>
            </div>
            <Progress value={stats.performanceMetrics.avgConfidence * 100} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Quality Score</span>
              <span>{Math.round(stats.performanceMetrics.avgQualityScore * 100)}%</span>
            </div>
            <Progress value={stats.performanceMetrics.avgQualityScore * 100} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Average Rating</span>
              <span>{stats.avgRating.toFixed(1)}/5</span>
            </div>
            <Progress value={(stats.avgRating / 5) * 100} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {getTrendIcon(stats.recentTrend)}
            <span className={`font-medium ${getTrendColor(stats.recentTrend)}`}>
              {stats.recentTrend.charAt(0).toUpperCase() + stats.recentTrend.slice(1)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface IssuesTabProps {
  stats: TrainingStats;
}

function IssuesTab({ stats }: IssuesTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Common Issues</CardTitle>
        <CardDescription>Most frequently reported problems</CardDescription>
      </CardHeader>
      <CardContent>
        {stats.commonIssues.length > 0 ? (
          <div className="space-y-3">
            {stats.commonIssues.map((issue, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{issue.type}</Badge>
                  <span className="text-sm">{issue.count} reports</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {issue.percentage.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="w-12 h-12 mx-auto mb-4" />
            <p>No common issues reported</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface RecommendationsTabProps {
  stats: TrainingStats;
  onTrain: () => void;
  trainingLoading: boolean;
}

function RecommendationsTab({ stats, onTrain, trainingLoading }: RecommendationsTabProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>AI Recommendations</CardTitle>
          <CardDescription>Suggested improvements based on training data</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recommendations.length > 0 ? (
            <div className="space-y-3">
              {stats.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                  <p className="text-sm">{recommendation}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
              <p>No recommendations available</p>
              <p className="text-sm">Submit more feedback to get AI recommendations</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Auto-Tune Configuration</CardTitle>
          <CardDescription>
            Let AI automatically optimize this configuration based on feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={onTrain} 
            disabled={trainingLoading || stats.totalFeedback < 5}
            className="w-full"
          >
            <Zap className="w-4 h-4 mr-2" />
            {trainingLoading ? 'Training...' : 'Start Auto-Tune'}
          </Button>
          {stats.totalFeedback < 5 && (
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Need at least 5 feedback submissions to enable auto-tune
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function getTrendIcon(trend: string) {
  switch (trend) {
    case 'improving':
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    case 'declining':
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    default:
      return <Minus className="w-4 h-4 text-gray-500" />;
  }
}

function getTrendColor(trend: string) {
  switch (trend) {
    case 'improving':
      return 'text-green-600';
    case 'declining':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}
