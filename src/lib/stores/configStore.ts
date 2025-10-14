import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { AgentConfig, AgentType } from '@/types/agent-config';

interface ConfigStore {
  // State
  configs: AgentConfig[];
  selectedAnalyzerConfig: string | null;
  selectedSummarizerConfig: string | null;
  loading: boolean;
  error: string | null;

  // Actions
  setConfigs: (configs: AgentConfig[]) => void;
  addConfig: (config: AgentConfig) => void;
  updateConfig: (id: string, config: Partial<AgentConfig>) => void;
  removeConfig: (id: string) => void;
  setSelectedAnalyzerConfig: (id: string | null) => void;
  setSelectedSummarizerConfig: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed values
  getConfigsByType: (type: AgentType) => AgentConfig[];
  getDefaultConfig: (type: AgentType) => AgentConfig | null;
  getConfig: (id: string) => AgentConfig | null;
}

export const useConfigStore = create<ConfigStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        configs: [],
        selectedAnalyzerConfig: null,
        selectedSummarizerConfig: null,
        loading: false,
        error: null,

        // Actions
        setConfigs: (configs) => set({ configs, error: null }),
        
        addConfig: (config) => set((state) => ({
          configs: [...state.configs, config]
        })),
        
        updateConfig: (id, updates) => set((state) => ({
          configs: state.configs.map(config => 
            config.id === id ? { ...config, ...updates } : config
          )
        })),
        
        removeConfig: (id) => set((state) => ({
          configs: state.configs.filter(config => config.id !== id),
          selectedAnalyzerConfig: state.selectedAnalyzerConfig === id ? null : state.selectedAnalyzerConfig,
          selectedSummarizerConfig: state.selectedSummarizerConfig === id ? null : state.selectedSummarizerConfig,
        })),
        
        setSelectedAnalyzerConfig: (id) => set({ selectedAnalyzerConfig: id }),
        setSelectedSummarizerConfig: (id) => set({ selectedSummarizerConfig: id }),
        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),

        // Computed values
        getConfigsByType: (type) => {
          const { configs } = get();
          return configs.filter(config => config.type === type && config.isActive);
        },
        
        getDefaultConfig: (type) => {
          const { configs } = get();
          return configs.find(config => config.type === type && config.isDefault) || null;
        },
        
        getConfig: (id) => {
          const { configs } = get();
          return configs.find(config => config.id === id) || null;
        },
      }),
      {
        name: 'config-store',
        partialize: (state) => ({
          selectedAnalyzerConfig: state.selectedAnalyzerConfig,
          selectedSummarizerConfig: state.selectedSummarizerConfig,
        }),
      }
    ),
    {
      name: 'config-store',
    }
  )
);
