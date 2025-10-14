import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { TrainingFeedback, TrainingStats, AgentType } from '@/types/agent-config';

interface TrainingStore {
  // State
  feedback: TrainingFeedback[];
  stats: Record<string, TrainingStats>;
  loading: boolean;
  error: string | null;

  // Actions
  setFeedback: (feedback: TrainingFeedback[]) => void;
  addFeedback: (feedback: TrainingFeedback) => void;
  updateFeedback: (id: string, updates: Partial<TrainingFeedback>) => void;
  removeFeedback: (id: string) => void;
  setStats: (configId: string, stats: TrainingStats) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed values
  getFeedbackByConfig: (configId: string) => TrainingFeedback[];
  getFeedbackByAgentType: (agentType: AgentType) => TrainingFeedback[];
  getRecentFeedback: (limit?: number) => TrainingFeedback[];
  getFeedbackStats: (configId: string) => TrainingStats | null;
}

export const useTrainingStore = create<TrainingStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      feedback: [],
      stats: {},
      loading: false,
      error: null,

      // Actions
      setFeedback: (feedback) => set({ feedback, error: null }),
      
      addFeedback: (feedback) => set((state) => ({
        feedback: [feedback, ...state.feedback]
      })),
      
      updateFeedback: (id, updates) => set((state) => ({
        feedback: state.feedback.map(feedback => 
          feedback.id === id ? { ...feedback, ...updates } : feedback
        )
      })),
      
      removeFeedback: (id) => set((state) => ({
        feedback: state.feedback.filter(feedback => feedback.id !== id)
      })),
      
      setStats: (configId, stats) => set((state) => ({
        stats: { ...state.stats, [configId]: stats }
      })),
      
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // Computed values
      getFeedbackByConfig: (configId) => {
        const { feedback } = get();
        return feedback.filter(f => f.configId === configId);
      },
      
      getFeedbackByAgentType: (agentType) => {
        const { feedback } = get();
        return feedback.filter(f => f.agentType === agentType);
      },
      
      getRecentFeedback: (limit = 10) => {
        const { feedback } = get();
        return feedback
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, limit);
      },
      
      getFeedbackStats: (configId) => {
        const { stats } = get();
        return stats[configId] || null;
      },
    }),
    {
      name: 'training-store',
    }
  )
);
