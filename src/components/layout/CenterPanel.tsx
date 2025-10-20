'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Loader2, AlertCircle, Star } from 'lucide-react';
import { useSessionStore } from '@/lib/stores/sessionStore';
import { usePlanFlow } from '@/hooks/usePlanFlow';
import { cn } from '@/lib/utils';
import { MarkdownMessage } from '@/components/ui/markdown-message';

interface CenterPanelProps {
  onSelectRequest: (requestId: string | null) => void;
  selectedRequestId: string | null;
}

export function CenterPanel({ onSelectRequest, selectedRequestId }: CenterPanelProps) {
  const [query, setQuery] = useState('');
  const [isClient, setIsClient] = useState(false);
  const { activeSessionId, addMessage, getActiveSession, updateSession } = useSessionStore();
  const {
    executeCompleteFlow,
    planLoading,
    executeLoading,
    analyzeLoading,
    summarizeLoading,
    planError,
    executeError,
    analyzeError,
    summarizeError
  } = usePlanFlow();

  const isLoading = planLoading || executeLoading || analyzeLoading || summarizeLoading;
  const error = planError || executeError || analyzeError || summarizeError;

  const activeSession = getActiveSession();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading || !activeSessionId) return;

    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user' as const,
      content: query,
      timestamp: new Date(),
      requestId: undefined,
    };

    addMessage(activeSessionId, userMessage);
    setQuery('');

    try {
      // Execute complete flow: Plan → Execute → Analyze → Summarize
      const result = await executeCompleteFlow(query);

      // Store complete data in message
      const summaryMessage = {
        id: crypto.randomUUID(),
        role: 'assistant' as const,
        content: result.summary.content,
        timestamp: new Date(),
        requestId: result.plan.requestId,
        requestData: {
          plan: result.plan,
          execution: result.execution,
          analysis: result.analysis,
          summary: result.summary,
        },
      };
      addMessage(activeSessionId, summaryMessage);

      updateSession(activeSessionId, { status: 'completed' });
    } catch (error) {
      console.error('Query execution failed:', error);
      updateSession(activeSessionId, { status: 'error' });

      // Add error message
      const errorMessage = {
        id: crypto.randomUUID(),
        role: 'assistant' as const,
        content: 'Sorry, there was an error processing your request. Please try again.',
        timestamp: new Date(),
        requestId: undefined,
      };
      addMessage(activeSessionId, errorMessage);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFeedbackClick = (requestId: string) => {
    // Navigate to analytics page with feedback form
    window.open(`/analytics?feedback=${requestId}`, '_blank');
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!activeSession ? (
          <div className="flex items-center justify-center h-full text-center">
            <div className="max-w-[80%] space-y-2">
              <Card className="bg-primary text-primary-foreground">
                <div className="flex flex-col gap-6 rounded-xl border py-6 shadow-sm bg-primary text-primary-foreground">
                  <h3 className="text-lg font-semibold mb-2">Welcome to Clear AI v3</h3>
                  <p className="text-muted-foreground mb-4">
                    Create a new session to start chatting with the AI agents
                  </p>
                  <Button onClick={() => useSessionStore.getState().createSession()}>
                    Create Session
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        ) : (
          <>
            {/* Messages */}
            {activeSession.messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex cursor-pointer",
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
                onClick={() => message.requestId && onSelectRequest(message.requestId)}
              >
                <div className="max-w-[80%] space-y-2">
                  <Card className={cn(
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted',
                    message.requestId === selectedRequestId && 'ring-2 ring-primary'
                  )}>
                    <CardContent className="p-3">
                      {message.role === 'assistant' ? (
                        <MarkdownMessage content={message.content} />
                      ) : (
                        <p className="text-sm">{message.content}</p>
                      )}
                      <p className={cn(
                        "text-xs mt-1 opacity-70",
                        message.role === 'user' ? 'text-primary-foreground' : 'text-muted-foreground'
                      )}>
                        {isClient ? new Date(message.timestamp).toLocaleTimeString() : ''}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Feedback button for assistant messages */}
                  {message.role === 'assistant' && message.requestId && (
                    <div className="flex justify-start">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFeedbackClick(message.requestId!);
                        }}
                        className="text-xs h-6 px-2"
                      >
                        <Star className="w-3 h-3 mr-1" />
                        Feedback
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-center">
                <Card className="bg-muted">
                  <CardContent className="p-4 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">AI agents are working...</span>
                    <div className="flex gap-1 ml-2">
                      {planLoading && <Badge variant="outline" className="text-xs">Planning</Badge>}
                      {executeLoading && <Badge variant="outline" className="text-xs">Executing</Badge>}
                      {analyzeLoading && <Badge variant="outline" className="text-xs">Analyzing</Badge>}
                      {summarizeLoading && <Badge variant="outline" className="text-xs">Summarizing</Badge>}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>

      {/* Input Area */}
      {activeSession && (
        <div className="border-t p-4">
          {error && (
            <div className="mb-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
              <AlertCircle className="h-4 w-4" />
              Error: {error.message}
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask the AI agents anything..."
              className="flex-1 min-h-[60px] max-h-[120px] resize-none"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={!query.trim() || isLoading}
              size="sm"
              className="self-end"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}