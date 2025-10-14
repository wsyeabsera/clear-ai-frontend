'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Analysis, Insight, SummaryResult } from '@/types';
import { AlertTriangle, TrendingUp, Users, Activity, MessageSquare } from 'lucide-react';

interface ResultsDisplayProps {
  summaryResult?: SummaryResult;
  analysisResult?: Analysis;
}

export function ResultsDisplay({ summaryResult, analysisResult }: ResultsDisplayProps) {
  if (!summaryResult && !analysisResult) return null;

  const getInsights = () => {
    const mappedInsights: Insight[] = [];

    analysisResult?.analysis.insights.forEach((insight) => {
      mappedInsights.push({
        type: insight.type,
        description: insight.description,
        confidence: insight.confidence,
        supportingData: insight.supportingData,
      });
    });

    return mappedInsights;
  };

  return (
    <div className="space-y-4">
      {/* Final Summary - Prominent Display */}
      {summaryResult && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg mb-4">{summaryResult.message}</p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                Tools: {summaryResult.toolsUsed.join(', ')}
              </Badge>
              <Badge variant="outline">
                Duration: {summaryResult.metadata.totalDurationMs}ms
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Analysis */}
      {analysisResult && (
        <>
          {/* Analysis Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Analysis Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{analysisResult.analysis.summary}</p>
            </CardContent>
          </Card>

          {/* Insights */}
          {getInsights().length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getInsights().map((insight, index) => (
                <div key={index} className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{insight.type}</Badge>
                    <div className="flex items-center gap-2">
                      <Progress value={insight.confidence * 100} className="w-20 h-2" />
                      <span className="text-xs text-muted-foreground">
                        {Math.round(insight.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                  <p className="text-sm">{insight.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

          {/* Entities */}
          {analysisResult.analysis.entities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Entities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {analysisResult.analysis.entities.map((entity) => (
                <div key={entity.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{entity.name}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {entity.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ID: {entity.id}
                  </p>
                  {entity.relationships && entity.relationships.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium mb-1">Relationships:</p>
                      <div className="flex flex-wrap gap-1">
                        {entity.relationships.map((rel, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {rel.type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

          {/* Anomalies */}
          {analysisResult.analysis.anomalies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Anomalies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysisResult.analysis.anomalies.map((anomaly, index) => (
                <div 
                  key={index} 
                  className={cn(
                    "p-3 rounded-lg border-l-4",
                    anomaly.severity === 'critical' && "bg-red-50 border-red-500",
                    anomaly.severity === 'high' && "bg-orange-50 border-orange-500",
                    anomaly.severity === 'medium' && "bg-yellow-50 border-yellow-500",
                    anomaly.severity === 'low' && "bg-blue-50 border-blue-500"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge 
                        variant={anomaly.severity === 'critical' || anomaly.severity === 'high' ? "destructive" : "secondary"}
                    >
                      {anomaly.severity}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {anomaly.type}
                    </Badge>
                  </div>
                  <p className="text-sm">{anomaly.description}</p>
                  {anomaly.affectedEntities.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Affects: {anomaly.affectedEntities.join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Analysis Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Tool Results</p>
                  <p className="font-medium">{analysisResult.metadata.toolResultsCount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Successful</p>
                  <p className="font-medium text-green-600">
                    {analysisResult.metadata.successfulResults || 0}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Failed</p>
                  <p className="font-medium text-red-600">
                    {analysisResult.metadata.failedResults || 0}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Analysis Time</p>
                  <p className="font-medium">{analysisResult.metadata.analysisTimeMs}ms</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
