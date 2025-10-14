'use client';

import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Star, AlertCircle, CheckCircle } from 'lucide-react';
import { 
  SUBMIT_FEEDBACK, 
  GET_REQUEST_HISTORY, 
  LIST_AGENT_CONFIGS 
} from '@/lib/graphql/queries';
import { 
  SubmitFeedbackInput, 
  FeedbackIssue, 
  AgentType,
  TrainingFeedback
} from '@/types/agent-config';
import { useTrainingStore } from '@/lib/stores/trainingStore';

interface FeedbackFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialRequestId?: string;
  initialConfigId?: string;
  initialAgentType?: AgentType;
}

export function FeedbackForm({ 
  onSuccess, 
  onCancel, 
  initialRequestId, 
  initialConfigId, 
  initialAgentType 
}: FeedbackFormProps) {
  const [formData, setFormData] = useState<SubmitFeedbackInput>({
    requestId: initialRequestId || '',
    configId: initialConfigId || '',
    agentType: initialAgentType || 'analyzer',
    rating: {
      overall: 0,
      accuracy: 0,
      relevance: 0,
      clarity: 0,
      actionability: 0,
    },
    issues: [],
    suggestions: [],
    metadata: {}
  });

  const [suggestionText, setSuggestionText] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [issueType, setIssueType] = useState<FeedbackIssue['type']>('accuracy');
  const [issueSeverity, setIssueSeverity] = useState<FeedbackIssue['severity']>('medium');

  const { addFeedback } = useTrainingStore();

  const { data: requestsData } = useQuery(GET_REQUEST_HISTORY, {
    variables: { limit: 50 }
  });

  const { data: configsData } = useQuery(LIST_AGENT_CONFIGS, {
    variables: { isActive: true }
  });

  const [submitFeedback, { loading }] = useMutation(SUBMIT_FEEDBACK, {
    onCompleted: (data: unknown) => {
      const result = data as { submitFeedback: TrainingFeedback };
      addFeedback(result.submitFeedback);
      onSuccess?.();
      // Reset form
      setFormData({
        requestId: '',
        configId: '',
        agentType: 'analyzer',
        rating: { overall: 0 },
        issues: [],
        suggestions: [],
        metadata: {}
      });
    }
  });

  const requests = (requestsData as { getRequestHistory?: Array<{ requestId: string; query: string; timestamp: string; response?: { analysis?: { summary?: string } } }> })?.getRequestHistory || [];
  const configs = (configsData as { listAgentConfigs?: Array<{ id: string; name: string; type: string; isDefault?: boolean; description?: string; version?: string }> })?.listAgentConfigs || [];

  const selectedRequest = requests.find(r => r.requestId === formData.requestId);
  const selectedConfig = configs.find(c => c.id === formData.configId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.rating.overall === 0) {
      alert('Please provide an overall rating');
      return;
    }

    try {
      await submitFeedback({
        variables: { input: formData }
      });
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  const updateRating = (aspect: keyof typeof formData.rating, value: number) => {
    setFormData(prev => ({
      ...prev,
      rating: {
        ...prev.rating,
        [aspect]: value
      }
    }));
  };

  const addIssue = () => {
    if (issueDescription.trim()) {
      const newIssue: FeedbackIssue = {
        type: issueType,
        severity: issueSeverity,
        description: issueDescription.trim(),
        suggestion: undefined
      };
      setFormData(prev => ({
        ...prev,
        issues: [...(prev.issues || []), newIssue]
      }));
      setIssueDescription('');
    }
  };

  const removeIssue = (index: number) => {
    setFormData(prev => ({
      ...prev,
      issues: (prev.issues || []).filter((_, i) => i !== index)
    }));
  };

  const addSuggestion = () => {
    if (suggestionText.trim()) {
      setFormData(prev => ({
        ...prev,
        suggestions: [...(prev.suggestions || []), suggestionText.trim()]
      }));
      setSuggestionText('');
    }
  };

  const removeSuggestion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      suggestions: (prev.suggestions || []).filter((_, i) => i !== index)
    }));
  };

  const StarRating = ({ 
    value, 
    onChange, 
    label 
  }: { 
    value: number; 
    onChange: (value: number) => void; 
    label: string;
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 hover:scale-110 transition-transform"
          >
            <Star
              className={`w-6 h-6 ${
                star <= value ? 'text-yellow-400 fill-current' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-muted-foreground">
          {value > 0 ? `${value}/5` : 'Not rated'}
        </span>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Submit Feedback</CardTitle>
          <CardDescription>
            Help improve the AI agents by providing feedback on their performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Request Selection */}
          <div className="space-y-2">
            <Label htmlFor="requestId">Request</Label>
            <Select
              value={formData.requestId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, requestId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a request to provide feedback on" />
              </SelectTrigger>
              <SelectContent>
                {requests.map((request) => (
                  <SelectItem key={request.requestId} value={request.requestId}>
                    <div className="flex flex-col">
                      <span className="font-medium">{request.query}</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(request.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedRequest && (
              <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm">
                  <strong>Query:</strong> {selectedRequest.query}
                </p>
                {selectedRequest.response?.analysis?.summary && (
                  <p className="text-sm mt-1">
                    <strong>Response:</strong> {selectedRequest.response.analysis.summary.substring(0, 200)}...
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Configuration Selection */}
          <div className="space-y-2">
            <Label htmlFor="configId">Configuration</Label>
            <Select
              value={formData.configId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, configId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select the configuration used" />
              </SelectTrigger>
              <SelectContent>
                {configs
                  .filter(c => c.type === formData.agentType)
                  .map((config) => (
                    <SelectItem key={config.id} value={config.id}>
                      <div className="flex items-center gap-2">
                        <span>{config.name}</span>
                        {config.isDefault && (
                          <Badge variant="outline" className="text-xs">Default</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {selectedConfig && (
              <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm">
                  <strong>Config:</strong> {selectedConfig.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedConfig.description || `Version ${selectedConfig.version}`}
                </p>
              </div>
            )}
          </div>

          {/* Agent Type */}
          <div className="space-y-2">
            <Label>Agent Type</Label>
            <RadioGroup
              value={formData.agentType}
              onValueChange={(value) => setFormData(prev => ({ 
                ...prev, 
                agentType: value as AgentType,
                configId: '' // Reset config when changing agent type
              }))}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="analyzer" id="analyzer" />
                <Label htmlFor="analyzer">Analyzer</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="summarizer" id="summarizer" />
                <Label htmlFor="summarizer">Summarizer</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Ratings */}
          <div className="space-y-4">
            <h4 className="font-medium">Rate the Performance</h4>
            
            <StarRating
              value={formData.rating.overall}
              onChange={(value) => updateRating('overall', value)}
              label="Overall Quality *"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StarRating
                value={formData.rating.accuracy || 0}
                onChange={(value) => updateRating('accuracy', value)}
                label="Accuracy"
              />
              <StarRating
                value={formData.rating.relevance || 0}
                onChange={(value) => updateRating('relevance', value)}
                label="Relevance"
              />
              <StarRating
                value={formData.rating.clarity || 0}
                onChange={(value) => updateRating('clarity', value)}
                label="Clarity"
              />
              <StarRating
                value={formData.rating.actionability || 0}
                onChange={(value) => updateRating('actionability', value)}
                label="Actionability"
              />
            </div>
          </div>

          {/* Issues */}
          <div className="space-y-4">
            <h4 className="font-medium">Report Issues (Optional)</h4>
            
            <div className="space-y-3">
              {(formData.issues || []).map((issue, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="destructive" className="text-xs">
                        {issue.severity}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {issue.type}
                      </Badge>
                    </div>
                    <p className="text-sm">{issue.description}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeIssue(index)}
                  >
                    ×
                  </Button>
                </div>
              ))}

              <div className="space-y-2">
                <div className="flex gap-2">
                  <Select value={issueType} onValueChange={(value) => setIssueType(value as 'accuracy' | 'relevance' | 'clarity' | 'completeness' | 'actionability' | 'tone')}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="accuracy">Accuracy</SelectItem>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="clarity">Clarity</SelectItem>
                      <SelectItem value="completeness">Completeness</SelectItem>
                      <SelectItem value="actionability">Actionability</SelectItem>
                      <SelectItem value="tone">Tone</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={issueSeverity} onValueChange={(value) => setIssueSeverity(value as 'low' | 'medium' | 'high')}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                    placeholder="Describe the issue..."
                    className="flex-1"
                  />
                  <Button type="button" onClick={addIssue} disabled={!issueDescription.trim()}>
                    Add Issue
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Suggestions */}
          <div className="space-y-4">
            <h4 className="font-medium">Suggestions (Optional)</h4>
            
            <div className="space-y-2">
              {(formData.suggestions || []).map((suggestion, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-blue-500 mt-1" />
                  <p className="text-sm flex-1">{suggestion}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSuggestion(index)}
                  >
                    ×
                  </Button>
                </div>
              ))}

              <div className="flex gap-2">
                <Input
                  value={suggestionText}
                  onChange={(e) => setSuggestionText(e.target.value)}
                  placeholder="Enter a suggestion for improvement..."
                  className="flex-1"
                />
                <Button type="button" onClick={addSuggestion} disabled={!suggestionText.trim()}>
                  Add Suggestion
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading || formData.rating.overall === 0}>
          {loading ? 'Submitting...' : 'Submit Feedback'}
        </Button>
      </div>
    </form>
  );
}
