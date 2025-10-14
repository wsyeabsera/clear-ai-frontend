'use client';

import { useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import { LIST_AGENT_CONFIGS } from '@/lib/graphql/queries';
import { useConfigStore } from '@/lib/stores/configStore';
import { AgentConfig } from '@/types/agent-config';

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const { setConfigs, setLoading, setError, setSelectedAnalyzerConfig, setSelectedSummarizerConfig } = useConfigStore();
  
  const { data, loading, error } = useQuery(LIST_AGENT_CONFIGS, {
    variables: { isActive: true }
  });

  useEffect(() => {
    if (loading) {
      setLoading(true);
    } else if (error) {
      setError(error.message);
      setLoading(false);
    } else if (data && typeof data === 'object' && data !== null && 'listAgentConfigs' in data) {
      const result = data as { listAgentConfigs: AgentConfig[] };
      const configs = result.listAgentConfigs;
      setConfigs(configs);
      
      // Auto-select default configs
      const defaultAnalyzer = configs.find((c: { type: string; isDefault: boolean }) => c.type === 'analyzer' && c.isDefault);
      const defaultSummarizer = configs.find((c: { type: string; isDefault: boolean }) => c.type === 'summarizer' && c.isDefault);
      
      if (defaultAnalyzer) setSelectedAnalyzerConfig(defaultAnalyzer.id);
      if (defaultSummarizer) setSelectedSummarizerConfig(defaultSummarizer.id);
      
      setLoading(false);
    }
  }, [data, loading, error, setConfigs, setLoading, setError, setSelectedAnalyzerConfig, setSelectedSummarizerConfig]);

  return <>{children}</>;
}
