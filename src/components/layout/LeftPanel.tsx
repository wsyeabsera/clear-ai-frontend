'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, MessageSquare, History, X } from 'lucide-react';
import { useSessionStore } from '@/lib/stores/sessionStore';
import { useQuery } from '@apollo/client/react';
import { GET_RECENT_PLANS, GET_RECENT_EXECUTIONS } from '@/lib/graphql/queries';
import { cn } from '@/lib/utils';

export function LeftPanel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isClient, setIsClient] = useState(false);
  const {
    sessions,
    activeSessionId,
    createSession,
    switchSession,
    closeSession,
  } = useSessionStore();

  // Query backend history
  const { data: plansData, loading: plansLoading } = useQuery(GET_RECENT_PLANS, {
    variables: { limit: 20 },
    pollInterval: 30000, // Refresh every 30 seconds
  });

  const { data: executionsData, loading: executionsLoading } = useQuery(GET_RECENT_EXECUTIONS, {
    variables: { limit: 20 },
    pollInterval: 30000,
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleCreateSession = () => {
    createSession();
  };

  const handleCloseSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    closeSession(sessionId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const recentPlans = (plansData as any)?.getRecentPlans || [];
  const recentExecutions = (executionsData as any)?.getRecentExecutions || [];

  return (
    <div className="flex flex-col h-full bg-background border-r">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-lg">Clear AI v3</h2>
          <Button
            size="sm"
            onClick={handleCreateSession}
            className="h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="sessions" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3 m-2">
            <TabsTrigger value="sessions" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Sessions
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Plans
            </TabsTrigger>
            <TabsTrigger value="executions" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Executions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sessions" className="flex-1 overflow-hidden">
            <div className="flex flex-col h-full">
              <div className="p-2 border-b">
                <p className="text-sm text-muted-foreground">
                  {sessions.length} active session{sessions.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-2">
                {sessions.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No active sessions</p>
                    <p className="text-xs">Create your first session to get started</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className={cn(
                          "group relative p-3 rounded-lg cursor-pointer transition-colors",
                          "hover:bg-accent",
                          activeSessionId === session.id && "bg-accent border border-primary"
                        )}
                        onClick={() => switchSession(session.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className={cn("w-2 h-2 rounded-full", getStatusColor(session.status))} />
                              <p className="text-sm font-medium truncate">
                                {session.name}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {session.messages.length} message{session.messages.length !== 1 ? 's' : ''}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {isClient ? new Date(session.updatedAt).toLocaleTimeString() : ''}
                            </p>
                          </div>

                          <Button
                            size="sm"
                            variant="ghost"
                            className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                            onClick={(e) => handleCloseSession(e, session.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="plans" className="flex-1 overflow-hidden">
            <div className="flex flex-col h-full">
              <div className="p-2 border-b">
                <p className="text-sm text-muted-foreground">
                  Recent plans from backend
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-2">
                {plansLoading ? (
                  <div className="text-center text-muted-foreground py-8">
                    <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Loading plans...</p>
                  </div>
                ) : recentPlans.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No plans found</p>
                    <p className="text-xs">Create a plan through the chat interface</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {recentPlans.map((plan: any) => (
                      <div
                        key={plan.requestId}
                        className="p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className={cn("w-2 h-2 rounded-full",
                            plan.status === 'COMPLETED' ? 'bg-green-500' :
                            plan.status === 'FAILED' ? 'bg-red-500' : 'bg-yellow-500'
                          )} />
                          <p className="text-sm font-medium truncate">
                            {plan.query}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {plan.plan.steps.length} steps • {isClient ? new Date(plan.createdAt).toLocaleString() : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="executions" className="flex-1 overflow-hidden">
            <div className="flex flex-col h-full">
              <div className="p-2 border-b">
                <p className="text-sm text-muted-foreground">
                  Recent executions from backend
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-2">
                {executionsLoading ? (
                  <div className="text-center text-muted-foreground py-8">
                    <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Loading executions...</p>
                  </div>
                ) : recentExecutions.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No executions found</p>
                    <p className="text-xs">Execute plans to see results here</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {recentExecutions.map((execution: any) => (
                      <div
                        key={execution.executionId}
                        className="p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className={cn("w-2 h-2 rounded-full",
                            execution.status === 'COMPLETED' ? 'bg-green-500' :
                            execution.status === 'FAILED' ? 'bg-red-500' :
                            execution.status === 'RUNNING' ? 'bg-blue-500' : 'bg-yellow-500'
                          )} />
                          <p className="text-sm font-medium truncate">
                            Execution {execution.executionId.slice(0, 8)}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {execution.completedSteps}/{execution.totalSteps} steps •
                          {execution.startedAt ? new Date(execution.startedAt).toLocaleString() : 'Not started'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
