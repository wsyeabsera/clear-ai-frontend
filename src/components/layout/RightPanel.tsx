'use client';

import { RequestDetails } from '@/components/request/RequestDetails';
import { useSessionStore } from '@/lib/stores/sessionStore';
import { FileQuestion } from 'lucide-react';

interface RightPanelProps {
  selectedRequestId?: string | null;
}

export function RightPanel({ selectedRequestId }: RightPanelProps) {
  const { getActiveSession } = useSessionStore();
  const activeSession = getActiveSession();

  const selectedMessage = activeSession?.messages.find(
    m => m.requestId === selectedRequestId
  );

  if (!selectedRequestId || !selectedMessage) {
    return (
      <div className="flex flex-col h-full bg-background border-l overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg">Request Details</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center text-muted-foreground">
            <FileQuestion className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">Select a request to view details</p>
            <p className="text-xs mt-2">
              Click on any AI response to see the complete pipeline
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background border-l overflow-hidden">
      <RequestDetails message={selectedMessage} />
    </div>
  );
}
