'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Play, RotateCcw, Edit3, Loader2 } from 'lucide-react';
import { usePlanStore } from '@/lib/stores/planStore';
import { usePlanFlow } from '@/hooks/usePlanFlow';

interface BottomPanelProps {
  onClose: () => void;
}

export function BottomPanel({ onClose }: BottomPanelProps) {
  const { 
    currentPlan, 
    editedSteps, 
    hasChanges,
    currentRequestId 
  } = usePlanStore();
  
  const { generatePlan, executePlan, planLoading, executeLoading } = usePlanFlow();

  const handleExecute = async () => {
    if (!currentRequestId) return;
    
    try {
      await executePlan(currentRequestId);
    } catch (error) {
      console.error('Failed to execute plan:', error);
    }
  };

  const handleRegenerate = async () => {
    if (!currentPlan) return;
    
    try {
      // Extract the original query from the plan context or use a default
            const originalQuery = 'Please regenerate the plan';
      await generatePlan(originalQuery);
    } catch (error) {
      console.error('Failed to regenerate plan:', error);
    }
  };

  if (!currentPlan) {
    return (
      <div className="flex flex-col h-full bg-background border-t">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-lg">Plan Editor</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center text-center">
          <div>
            <h3 className="text-lg font-semibold mb-2">No Plan Available</h3>
            <p className="text-muted-foreground">
              Generate a plan by asking a question to see it here
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background border-t">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="font-semibold text-lg">Plan Editor</h2>
          {hasChanges() && (
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              Modified
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRegenerate}
            disabled={planLoading}
          >
            {planLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4 mr-2" />
            )}
            Regenerate
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExecute}
            disabled={executeLoading || !currentRequestId}
          >
            {executeLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Execute
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {editedSteps.map((step, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Step {index + 1}</Badge>
                    <Badge variant="secondary">{step.tool}</Badge>
                    {step.parallel && (
                      <Badge variant="outline" className="text-blue-600">
                        Parallel
                      </Badge>
                    )}
                  </div>
                  <Button variant="ghost" size="sm">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="bg-muted p-3 rounded-lg">
                  <pre className="text-xs overflow-x-auto">
                    {JSON.stringify(step.params, null, 2)}
                  </pre>
                </div>

                {step.dependsOn && step.dependsOn.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground">
                      Depends on: {step.dependsOn.join(', ')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
