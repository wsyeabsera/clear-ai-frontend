'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Info } from 'lucide-react';

interface BottomPanelProps {
  onClose: () => void;
}

export function BottomPanel({ onClose }: BottomPanelProps) {
  return (
    <div className="flex flex-col h-full bg-background border-t">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold text-lg">Plan Editor</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center text-center p-8">
        <Card className="max-w-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Info className="h-6 w-6 text-blue-500" />
              <h3 className="text-lg font-semibold">Plan Editing Unavailable</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              In Clear AI v3, plan generation and execution are fully automated by the backend.
              Plans are created, executed, analyzed, and summarized automatically.
            </p>
            <p className="text-sm text-muted-foreground">
              You can view plan details in the right panel after execution, or explore
              individual tools in the Tools page.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
