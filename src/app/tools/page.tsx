'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation } from '@apollo/client/react';
import { LIST_TOOLS, EXECUTE_TOOL } from '@/lib/graphql/queries';
import { Tool, ToolResult } from '@/types';
import { Wrench, Search, Play, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function ToolsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [toolParams, setToolParams] = useState('');
  const [executionResult, setExecutionResult] = useState<ToolResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const { data: toolsData, loading: toolsLoading, error: toolsError } = useQuery(LIST_TOOLS, {
    pollInterval: 60000, // Refresh every minute
  });

  const [executeToolMutation] = useMutation(EXECUTE_TOOL);

  const tools = (toolsData as any)?.listTools || [];

  const filteredTools = tools.filter((tool: Tool) =>
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExecuteTool = async () => {
    if (!selectedTool || !toolParams.trim()) return;

    setIsExecuting(true);
    setExecutionResult(null);

    try {
      const params = JSON.parse(toolParams);
      const { data } = await executeToolMutation({
        variables: {
          name: selectedTool.name,
          params: params,
        },
      });

      setExecutionResult((data as any)?.executeTool as ToolResult);
    } catch (error) {
      console.error('Tool execution failed:', error);
      setExecutionResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleToolSelect = (tool: Tool) => {
    setSelectedTool(tool);
    setToolParams('');
    setExecutionResult(null);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tools</h1>
          <p className="text-muted-foreground">
            Explore and execute MCP tools manually
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tools List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              Available Tools ({tools.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Tools List */}
            {toolsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Loading tools...</p>
              </div>
            ) : toolsError ? (
              <div className="text-center py-8 text-red-600">
                <p>Error loading tools: {toolsError.message}</p>
              </div>
            ) : filteredTools.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No tools found</p>
                <p className="text-xs">Try adjusting your search</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredTools.map((tool: Tool) => (
                  <div
                    key={tool.name}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedTool?.name === tool.name ? 'bg-accent border-primary' : 'hover:bg-accent'
                    }`}
                    onClick={() => handleToolSelect(tool)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{tool.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {tool.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tool Execution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              Tool Execution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedTool ? (
              <div className="text-center py-8 text-muted-foreground">
                <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Select a tool to execute</p>
                <p className="text-xs">Choose a tool from the list to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Selected Tool Info */}
                <div>
                  <h3 className="font-medium">{selectedTool.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedTool.description}</p>
                </div>

                {/* Input Schema */}
                <div>
                  <h4 className="font-medium mb-2">Input Schema</h4>
                  <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                    {JSON.stringify(selectedTool.inputSchema, null, 2)}
                  </pre>
                </div>

                {/* Parameters Input */}
                <div>
                  <h4 className="font-medium mb-2">Parameters (JSON)</h4>
                  <Textarea
                    placeholder="Enter tool parameters as JSON..."
                    value={toolParams}
                    onChange={(e) => setToolParams(e.target.value)}
                    className="min-h-[120px] font-mono text-sm"
                  />
                </div>

                {/* Execute Button */}
                <Button
                  onClick={handleExecuteTool}
                  disabled={!toolParams.trim() || isExecuting}
                  className="w-full"
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Execute Tool
                    </>
                  )}
                </Button>

                {/* Execution Result */}
                {executionResult && (
                  <div>
                    <h4 className="font-medium mb-2">Execution Result</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {executionResult.success ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <Badge variant={executionResult.success ? "default" : "destructive"}>
                          {executionResult.success ? "Success" : "Failed"}
                        </Badge>
                      </div>

                      {executionResult.message && (
                        <p className="text-sm">{executionResult.message}</p>
                      )}

                      {executionResult.error && (
                        <div>
                          <p className="text-sm text-red-600">Error:</p>
                          <p className="text-sm text-red-600">{executionResult.error}</p>
                        </div>
                      )}

                      {executionResult.data && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Data:</p>
                          <pre className="text-xs bg-muted p-3 rounded overflow-x-auto whitespace-pre-wrap break-all">
                            {JSON.stringify(executionResult.data, null, 2)}
                          </pre>
                        </div>
                      )}

                      {executionResult.meta && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Metadata:</p>
                          <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                            {JSON.stringify(executionResult.meta, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
