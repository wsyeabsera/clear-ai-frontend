'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Send, Loader2, AlertCircle, Settings, Star } from 'lucide-react';
import { useSessionStore } from '@/lib/stores/sessionStore';
import { useAgentSubscriptions } from '@/hooks/useAgentSubscriptions';
import { usePlanFlow } from '@/hooks/usePlanFlow';
import { useConfigStore } from '@/lib/stores/configStore';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface CenterPanelProps {
  onSelectRequest: (requestId: string | null) => void;
  selectedRequestId: string | null;
}

export function CenterPanel({ onSelectRequest, selectedRequestId }: CenterPanelProps) {
  const [query, setQuery] = useState('');
  const [isClient, setIsClient] = useState(false);
  const { activeSessionId, addMessage, getActiveSession, updateSession } = useSessionStore();
  const { 
    selectedAnalyzerConfig, 
    selectedSummarizerConfig, 
    setSelectedAnalyzerConfig, 
    setSelectedSummarizerConfig,
    getConfigsByType,
    loading: configsLoading,
    error: configsError
  } = useConfigStore();

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const { executeComplete, summarizeLoading, planLoading, executeLoading, analyzeLoading, planError, executeError, analyzeError, summarizeError } = usePlanFlow();
  
  const isLoading = planLoading || executeLoading || analyzeLoading || summarizeLoading;
  const error = planError || executeError || analyzeError || summarizeError;

  const activeSession = getActiveSession();
  const currentRequestId = activeSession?.messages.find(m => m.requestId)?.requestId || null;
  
  // Subscribe to real-time agent progress
  useAgentSubscriptions(currentRequestId);

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
      const result = await executeComplete(query, selectedAnalyzerConfig || undefined, selectedSummarizerConfig || undefined);
      
      // Store complete data in message
      const summaryMessage = {
        id: crypto.randomUUID(),
        role: 'assistant' as const,
        content: result.summaryResult.message,
        timestamp: new Date(),
        requestId: result.planResult.requestId,
        requestData: {
          plan: result.planResult,
          execution: result.executionResult,
          analysis: result.analysisResult,
          summary: result.summaryResult,
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
    // Navigate to training page with pre-filled request ID
    window.open(`/training?requestId=${requestId}`, '_blank');
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!activeSession ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <h3 className="text-lg font-semibold mb-2">Welcome to Clear AI v2</h3>
              <p className="text-muted-foreground mb-4">
                Create a new session to start chatting with the AI agents
              </p>
              <Button onClick={() => useSessionStore.getState().createSession()}>
                Create Session
              </Button>
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
                      <p className="text-sm">{message.content}</p>
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
          {/* Configuration Selectors */}
          <div className="mb-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Settings className="w-4 h-4" />
              Agent Configurations
            </div>
            
            {configsError && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                <AlertCircle className="h-4 w-4" />
                Config Error: {configsError}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Analyzer</label>
                {configsLoading ? (
                  <div className="h-8 bg-muted animate-pulse rounded" />
                ) : getConfigsByType('analyzer').length === 0 ? (
                  <div className="text-sm text-muted-foreground p-2 border rounded">
                    No analyzer configs available.{' '}
                    <Link href="/configs" className="text-primary hover:underline">
                      Create one
                    </Link>
                  </div>
                ) : (
                  <Select
                    value={selectedAnalyzerConfig || ''}
                    onValueChange={(value) => setSelectedAnalyzerConfig(value || null)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select analyzer config" />
                    </SelectTrigger>
                    <SelectContent className="z-50">
                      {getConfigsByType('analyzer').map((config) => (
                        <SelectItem key={config.id} value={config.id}>
                          <div className="flex items-center justify-between w-full">
                            <span className="truncate">{config.name}</span>
                            {config.isDefault && (
                              <span className="text-xs text-muted-foreground ml-2">(default)</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Summarizer</label>
                {configsLoading ? (
                  <div className="h-8 bg-muted animate-pulse rounded" />
                ) : getConfigsByType('summarizer').length === 0 ? (
                  <div className="text-sm text-muted-foreground p-2 border rounded">
                    No summarizer configs available.{' '}
                    <Link href="/configs" className="text-primary hover:underline">
                      Create one
                    </Link>
                  </div>
                ) : (
                  <Select
                    value={selectedSummarizerConfig || ''}
                    onValueChange={(value) => setSelectedSummarizerConfig(value || null)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select summarizer config" />
                    </SelectTrigger>
                    <SelectContent className="z-50">
                      {getConfigsByType('summarizer').map((config) => (
                        <SelectItem key={config.id} value={config.id}>
                          <div className="flex items-center justify-between w-full">
                            <span className="truncate">{config.name}</span>
                            {config.isDefault && (
                              <span className="text-xs text-muted-foreground ml-2">(default)</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>

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
