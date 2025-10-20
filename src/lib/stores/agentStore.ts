import { create } from 'zustand';
import { AgentProgress, ProgressUpdate } from '@/types';

interface AgentStore {
  progress: Map<string, AgentProgress>;
  updateProgress: (requestId: string, agent: keyof AgentProgress, update: ProgressUpdate) => void;
  clearProgress: (requestId: string) => void;
  getProgress: (requestId: string) => AgentProgress | null;
  getCurrentPhase: (requestId: string) => string | null;
  isComplete: (requestId: string) => boolean;
}

export const useAgentStore = create<AgentStore>((set, get) => ({
  progress: new Map(),

  updateProgress: (requestId: string, agent: keyof AgentProgress, update: ProgressUpdate) => {
    set((state) => {
      const newProgress = new Map(state.progress);
      const current = newProgress.get(requestId) || {};

      newProgress.set(requestId, {
        ...current,
        [agent]: update,
      });

      return { progress: newProgress };
    });
  },

  clearProgress: (requestId: string) => {
    set((state) => {
      const newProgress = new Map(state.progress);
      newProgress.delete(requestId);
      return { progress: newProgress };
    });
  },

  getProgress: (requestId: string) => {
    return get().progress.get(requestId) || null;
  },

  getCurrentPhase: (requestId: string) => {
    const progress = get().progress.get(requestId);
    if (!progress) return null;

    // Determine current phase based on agent progress
    if (progress.summarizer?.progress === 100) return 'complete';
    if (progress.analyzer?.progress === 100) return 'summarizing';
    if (progress.executor?.progress === 100) return 'analyzing';
    if (progress.planner?.progress === 100) return 'executing';
    if (progress.planner) return 'planning';

    return 'starting';
  },

  isComplete: (requestId: string) => {
    const progress = get().progress.get(requestId);
    return progress?.summarizer?.progress === 100;
  },
}));
