'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Copy, 
  Star, 
  StarOff,
  Settings,
  BarChart3
} from 'lucide-react';
import { LIST_AGENT_CONFIGS, DELETE_AGENT_CONFIG, SET_DEFAULT_CONFIG, CLONE_AGENT_CONFIG } from '@/lib/graphql/queries';
import { AgentConfig, AgentType } from '@/types/agent-config';
import { useConfigStore } from '@/lib/stores/configStore';

interface ConfigListProps {
  onEdit: (config: AgentConfig) => void;
  onCreate: () => void;
}

export function ConfigList({ onEdit, onCreate }: ConfigListProps) {
  const [filter, setFilter] = useState<AgentType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { setConfigs, removeConfig, updateConfig } = useConfigStore();

  const { data, loading, error, refetch } = useQuery(LIST_AGENT_CONFIGS, {
    variables: { isActive: true }
  });

  useEffect(() => {
    if (data && typeof data === 'object' && data !== null && 'listAgentConfigs' in data) {
      const result = data as { listAgentConfigs: AgentConfig[] };
      setConfigs(result.listAgentConfigs);
    }
  }, [data, setConfigs]);

  const [deleteConfig] = useMutation(DELETE_AGENT_CONFIG, {
    onCompleted: () => {
      refetch();
    }
  });

  const [setDefault] = useMutation(SET_DEFAULT_CONFIG, {
    onCompleted: (data: unknown) => {
      // Update the config in the store
      const result = data as { setDefaultConfig: AgentConfig };
      const updatedConfig = result.setDefaultConfig;
      updateConfig(updatedConfig.id, { isDefault: true });
      refetch();
    }
  });

  const [cloneConfig] = useMutation(CLONE_AGENT_CONFIG, {
    onCompleted: () => {
      refetch();
    }
  });

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteConfig({ variables: { id } });
        removeConfig(id);
      } catch (error) {
        console.error('Failed to delete config:', error);
      }
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefault({ variables: { id } });
    } catch (error) {
      console.error('Failed to set default config:', error);
    }
  };

  const handleClone = async (id: string, name: string) => {
    const newName = prompt(`Enter a name for the cloned configuration:`, `${name} (Copy)`);
    if (newName) {
      try {
        await cloneConfig({ variables: { id, name: newName } });
      } catch (error) {
        console.error('Failed to clone config:', error);
      }
    }
  };

  const configs = data && typeof data === 'object' && data !== null && 'listAgentConfigs' in data 
    ? (data as { listAgentConfigs: AgentConfig[] }).listAgentConfigs 
    : [];
    
  const filteredConfigs = configs.filter((config: AgentConfig) => {
    const matchesFilter = filter === 'all' || config.type === filter;
    const matchesSearch = config.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         config.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const analyzerConfigs = filteredConfigs.filter((config: AgentConfig) => config.type === 'analyzer');
  const summarizerConfigs = filteredConfigs.filter((config: AgentConfig) => config.type === 'summarizer');

  if (loading) return <div className="p-4">Loading configurations...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Agent Configurations</h2>
          <p className="text-muted-foreground">Manage analyzer and summarizer configurations</p>
        </div>
        <Button onClick={onCreate}>
          <Settings className="w-4 h-4 mr-2" />
          Create Configuration
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Search configurations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={filter} onValueChange={(value) => setFilter(value as AgentType | 'all')}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="analyzer">Analyzer</SelectItem>
            <SelectItem value="summarizer">Summarizer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Configuration Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All ({filteredConfigs.length})</TabsTrigger>
          <TabsTrigger value="analyzer">Analyzer ({analyzerConfigs.length})</TabsTrigger>
          <TabsTrigger value="summarizer">Summarizer ({summarizerConfigs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <ConfigGrid configs={filteredConfigs} onEdit={onEdit} onDelete={handleDelete} onSetDefault={handleSetDefault} onClone={handleClone} />
        </TabsContent>

        <TabsContent value="analyzer" className="space-y-4">
          <ConfigGrid configs={analyzerConfigs} onEdit={onEdit} onDelete={handleDelete} onSetDefault={handleSetDefault} onClone={handleClone} />
        </TabsContent>

        <TabsContent value="summarizer" className="space-y-4">
          <ConfigGrid configs={summarizerConfigs} onEdit={onEdit} onDelete={handleDelete} onSetDefault={handleSetDefault} onClone={handleClone} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface ConfigGridProps {
  configs: AgentConfig[];
  onEdit: (config: AgentConfig) => void;
  onDelete: (id: string, name: string) => void;
  onSetDefault: (id: string) => void;
  onClone: (id: string, name: string) => void;
}

function ConfigGrid({ configs, onEdit, onDelete, onSetDefault, onClone }: ConfigGridProps) {
  if (configs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No configurations found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {configs.map((config) => (
        <ConfigCard
          key={config.id}
          config={config}
          onEdit={onEdit}
          onDelete={onDelete}
          onSetDefault={onSetDefault}
          onClone={onClone}
        />
      ))}
    </div>
  );
}

interface ConfigCardProps {
  config: AgentConfig;
  onEdit: (config: AgentConfig) => void;
  onDelete: (id: string, name: string) => void;
  onSetDefault: (id: string) => void;
  onClone: (id: string, name: string) => void;
}

function ConfigCard({ config, onEdit, onDelete, onSetDefault, onClone }: ConfigCardProps) {
  const metrics = config.metadata?.performanceMetrics;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {config.name}
              {config.isDefault && (
                <Badge variant="default" className="text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  Default
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {config.description || `Version ${config.version}`}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(config)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onClone(config.id, config.name)}>
                <Copy className="w-4 h-4 mr-2" />
                Clone
              </DropdownMenuItem>
              {!config.isDefault && (
                <DropdownMenuItem onClick={() => onSetDefault(config.id)}>
                  <StarOff className="w-4 h-4 mr-2" />
                  Set as Default
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={() => onDelete(config.id, config.name)}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant={config.type === 'analyzer' ? 'default' : 'secondary'}>
              {config.type}
            </Badge>
            <Badge variant={config.isActive ? 'default' : 'outline'}>
              {config.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {metrics && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BarChart3 className="w-4 h-4" />
                Performance Metrics
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Confidence:</span>
                  <span className="ml-1 font-medium">
                    {Math.round(metrics.avgConfidence * 100)}%
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Usage:</span>
                  <span className="ml-1 font-medium">{metrics.totalUsage}</span>
                </div>
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            Created {new Date(config.createdAt).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
