'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  CREATE_AGENT_CONFIG, 
  UPDATE_AGENT_CONFIG, 
  LIST_STRATEGIES 
} from '@/lib/graphql/queries';
import { 
  AgentConfig, 
  AgentType, 
  AnalyzerConfig, 
  SummarizerConfig, 
  LLMConfig,
  CreateAgentConfigInput,
  UpdateAgentConfigInput
} from '@/types/agent-config';
import { useConfigStore } from '@/lib/stores/configStore';

interface ConfigEditorProps {
  config?: AgentConfig;
  onSave: (config: AgentConfig) => void;
  onCancel: () => void;
}

export function ConfigEditor({ config, onSave, onCancel }: ConfigEditorProps) {
  const isEditing = !!config;
  const [formData, setFormData] = useState<CreateAgentConfigInput>({
    name: '',
    type: 'analyzer',
    description: '',
    config: getDefaultAnalyzerConfig(),
    isActive: true,
  });

  const { addConfig, updateConfig } = useConfigStore();

  const { data: strategiesData } = useQuery(LIST_STRATEGIES);

  const [createConfig, { loading: creating }] = useMutation(CREATE_AGENT_CONFIG, {
    onCompleted: (data: unknown) => {
      const result = data as { createAgentConfig: AgentConfig };
      addConfig(result.createAgentConfig);
      onSave(result.createAgentConfig);
    }
  });

  const [updateConfigMutation, { loading: updating }] = useMutation(UPDATE_AGENT_CONFIG, {
    onCompleted: (data: unknown) => {
      const result = data as { updateAgentConfig: AgentConfig };
      updateConfig(result.updateAgentConfig.id, result.updateAgentConfig);
      onSave(result.updateAgentConfig);
    }
  });

  useEffect(() => {
    if (config) {
      setFormData({
        name: config.name,
        type: config.type,
        description: config.description || '',
        config: config.config,
        isActive: config.isActive,
      });
    }
  }, [config]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing) {
        const updateInput: UpdateAgentConfigInput = {
          name: formData.name,
          description: formData.description,
          config: formData.config,
          isActive: formData.isActive,
        };
        await updateConfigMutation({
          variables: { id: config!.id, input: updateInput }
        });
      } else {
        await createConfig({
          variables: { input: formData }
        });
      }
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  };

  const updateConfigField = (field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateNestedConfig = (path: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        [path]: value
      }
    }));
  };

  const updateLLMConfig = (field: keyof LLMConfig, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        llmConfig: {
          ...(prev.config as { llmConfig?: LLMConfig }).llmConfig,
          [field]: value
        } as LLMConfig
      }
    }));
  };

  const analysisStrategies = (strategiesData as { listAnalysisStrategies?: Array<{ name: string; description: string; version: string }> })?.listAnalysisStrategies || [];
  const summarizationStrategies = (strategiesData as { listSummarizationStrategies?: Array<{ name: string; description: string; version: string }> })?.listSummarizationStrategies || [];

  const loading = creating || updating;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? 'Edit Configuration' : 'Create Configuration'}
          </CardTitle>
          <CardDescription>
            {isEditing ? 'Update the configuration settings' : 'Set up a new agent configuration'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateConfigField('name', e.target.value)}
                placeholder="Configuration name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => updateConfigField('type', value)}
                disabled={isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="analyzer">Analyzer</SelectItem>
                  <SelectItem value="summarizer">Summarizer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateConfigField('description', e.target.value)}
              placeholder="Optional description"
              rows={2}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => updateConfigField('isActive', checked)}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="llm" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="llm">LLM Settings</TabsTrigger>
              <TabsTrigger value="agent">Agent Settings</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="llm" className="space-y-4">
              <LLMConfigEditor 
                config={formData.config} 
                onUpdate={updateLLMConfig} 
              />
            </TabsContent>

            <TabsContent value="agent" className="space-y-4">
              {formData.type === 'analyzer' ? (
                <AnalyzerConfigEditor 
                  config={formData.config as AnalyzerConfig} 
                  onUpdate={updateNestedConfig}
                  strategies={analysisStrategies}
                />
              ) : (
                <SummarizerConfigEditor 
                  config={formData.config as SummarizerConfig} 
                  onUpdate={updateNestedConfig}
                  strategies={summarizationStrategies}
                />
              )}
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <AdvancedConfigEditor 
                config={formData.config} 
                onUpdate={updateNestedConfig}
                type={formData.type}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
        </Button>
      </div>
    </form>
  );
}

interface LLMConfigEditorProps {
  config: AnalyzerConfig | SummarizerConfig;
  onUpdate: (field: keyof LLMConfig, value: unknown) => void;
}

function LLMConfigEditor({ config, onUpdate }: LLMConfigEditorProps) {
  const llmConfig = config.llmConfig;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="model">Model</Label>
        <Select
          value={llmConfig.model}
          onValueChange={(value) => onUpdate('model', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
            <SelectItem value="gpt-4">GPT-4</SelectItem>
            <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="provider">Provider</Label>
        <Select
          value={llmConfig.provider}
          onValueChange={(value) => onUpdate('provider', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="anthropic">Anthropic</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="temperature">Temperature</Label>
        <Input
          id="temperature"
          type="number"
          min="0"
          max="2"
          step="0.1"
          value={llmConfig.temperature}
          onChange={(e) => onUpdate('temperature', parseFloat(e.target.value))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxTokens">Max Tokens</Label>
        <Input
          id="maxTokens"
          type="number"
          min="100"
          max="4000"
          value={llmConfig.maxTokens}
          onChange={(e) => onUpdate('maxTokens', parseInt(e.target.value))}
        />
      </div>
    </div>
  );
}

interface AnalyzerConfigEditorProps {
  config: AnalyzerConfig;
  onUpdate: (path: string, value: unknown) => void;
  strategies: Array<{ name: string; description: string; version: string }>;
}

function AnalyzerConfigEditor({ config, onUpdate, strategies }: AnalyzerConfigEditorProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="minConfidence">Min Confidence</Label>
          <Input
            id="minConfidence"
            type="number"
            min="0"
            max="1"
            step="0.1"
            value={config.minConfidence}
            onChange={(e) => onUpdate('minConfidence', parseFloat(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="anomalyThreshold">Anomaly Threshold</Label>
          <Input
            id="anomalyThreshold"
            type="number"
            min="0"
            value={config.anomalyThreshold}
            onChange={(e) => onUpdate('anomalyThreshold', parseInt(e.target.value))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Analysis Strategies</Label>
        <div className="space-y-2">
          {strategies.map((strategy) => (
            <div key={strategy.name} className="flex items-center space-x-2">
              <Checkbox
                id={strategy.name}
                checked={config.analysisStrategies.includes(strategy.name)}
                onCheckedChange={(checked) => {
                  const newStrategies = checked
                    ? [...config.analysisStrategies, strategy.name]
                    : config.analysisStrategies.filter(s => s !== strategy.name);
                  onUpdate('analysisStrategies', newStrategies);
                }}
              />
              <Label htmlFor={strategy.name} className="flex-1">
                <div className="flex items-center gap-2">
                  <span>{strategy.name}</span>
                  <Badge variant="outline" className="text-xs">
                    v{strategy.version}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{strategy.description}</p>
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Features</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="enableStatisticalAnalysis"
              checked={config.enableStatisticalAnalysis}
              onCheckedChange={(checked) => onUpdate('enableStatisticalAnalysis', checked)}
            />
            <Label htmlFor="enableStatisticalAnalysis">Enable Statistical Analysis</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="enableChainOfThought"
              checked={config.enableChainOfThought}
              onCheckedChange={(checked) => onUpdate('enableChainOfThought', checked)}
            />
            <Label htmlFor="enableChainOfThought">Enable Chain of Thought</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="enableSelfCritique"
              checked={config.enableSelfCritique}
              onCheckedChange={(checked) => onUpdate('enableSelfCritique', checked)}
            />
            <Label htmlFor="enableSelfCritique">Enable Self Critique</Label>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SummarizerConfigEditorProps {
  config: SummarizerConfig;
  onUpdate: (path: string, value: unknown) => void;
  strategies: Array<{ name: string; description: string; version: string }>;
}

function SummarizerConfigEditor({ config, onUpdate, strategies }: SummarizerConfigEditorProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="maxLength">Max Length</Label>
          <Input
            id="maxLength"
            type="number"
            min="100"
            max="2000"
            value={config.maxLength}
            onChange={(e) => onUpdate('maxLength', parseInt(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="format">Format</Label>
          <Select
            value={config.format}
            onValueChange={(value) => onUpdate('format', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="plain">Plain Text</SelectItem>
              <SelectItem value="markdown">Markdown</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tone">Tone</Label>
        <Select
          value={config.tone}
          onValueChange={(value) => onUpdate('tone', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="professional">Professional</SelectItem>
            <SelectItem value="casual">Casual</SelectItem>
            <SelectItem value="technical">Technical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Summarization Strategies</Label>
        <div className="space-y-2">
          {strategies.map((strategy) => (
            <div key={strategy.name} className="flex items-center space-x-2">
              <Checkbox
                id={strategy.name}
                checked={config.summarizationStrategies.includes(strategy.name)}
                onCheckedChange={(checked) => {
                  const newStrategies = checked
                    ? [...config.summarizationStrategies, strategy.name]
                    : config.summarizationStrategies.filter(s => s !== strategy.name);
                  onUpdate('summarizationStrategies', newStrategies);
                }}
              />
              <Label htmlFor={strategy.name} className="flex-1">
                <div className="flex items-center gap-2">
                  <span>{strategy.name}</span>
                  <Badge variant="outline" className="text-xs">
                    v{strategy.version}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{strategy.description}</p>
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface AdvancedConfigEditorProps {
  config: AnalyzerConfig | SummarizerConfig;
  onUpdate: (path: string, value: unknown) => void;
  type: AgentType;
}

function AdvancedConfigEditor({ config, onUpdate, type }: AdvancedConfigEditorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="systemPrompt">System Prompt</Label>
        <Textarea
          id="systemPrompt"
          value={config.promptTemplates?.systemPrompt || ''}
          onChange={(e) => onUpdate('promptTemplates.systemPrompt', e.target.value)}
          placeholder="Enter custom system prompt..."
          rows={6}
        />
      </div>

      {type === 'analyzer' && (
        <div className="space-y-2">
          <Label htmlFor="chainOfThoughtPrompt">Chain of Thought Prompt</Label>
          <Textarea
            id="chainOfThoughtPrompt"
            value={(config as AnalyzerConfig).promptTemplates?.chainOfThoughtPrompt || ''}
            onChange={(e) => onUpdate('promptTemplates.chainOfThoughtPrompt', e.target.value)}
            placeholder="Enter chain of thought prompt..."
            rows={4}
          />
        </div>
      )}
    </div>
  );
}

function getDefaultAnalyzerConfig(): AnalyzerConfig {
  return {
    llmConfig: {
      temperature: 0.7,
      maxTokens: 1500,
      model: 'gpt-3.5-turbo',
      provider: 'openai'
    },
    anomalyThreshold: 2,
    minConfidence: 0.7,
    enableStatisticalAnalysis: true,
    enableChainOfThought: true,
    enableSelfCritique: true,
    analysisStrategies: ['rule-based', 'llm-based'],
    promptTemplates: {
      systemPrompt: '',
      chainOfThoughtPrompt: '',
      validationPrompt: ''
    }
  };
}
