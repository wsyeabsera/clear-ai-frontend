import { create } from 'zustand';
import { PlanResponse, ExecutionResponse } from '@/types';

interface PlanStore {
  currentPlan: PlanResponse | null;
  currentExecution: ExecutionResponse | null;
  isExecuting: boolean;
  setPlan: (plan: PlanResponse) => void;
  setExecution: (execution: ExecutionResponse) => void;
  setExecuting: (executing: boolean) => void;
  clearPlan: () => void;
  clearExecution: () => void;
  clearAll: () => void;
}

export const usePlanStore = create<PlanStore>((set) => ({
  currentPlan: null,
  currentExecution: null,
  isExecuting: false,

  setPlan: (plan: PlanResponse) => {
    set({ currentPlan: plan });
  },

  setExecution: (execution: ExecutionResponse) => {
    set({ currentExecution: execution });
  },

  setExecuting: (executing: boolean) => {
    set({ isExecuting: executing });
  },

  clearPlan: () => {
    set({ currentPlan: null });
  },

  clearExecution: () => {
    set({ currentExecution: null });
  },

  clearAll: () => {
    set({
      currentPlan: null,
      currentExecution: null,
      isExecuting: false,
    });
  },
}));
