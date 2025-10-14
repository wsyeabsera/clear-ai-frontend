import { create } from 'zustand';
import { Plan, PlanStep } from '@/types';

interface PlanStore {
  currentPlan: Plan | null;
  currentRequestId: string | null;
  isEditing: boolean;
  editedSteps: PlanStep[];
  setPlan: (requestId: string, plan: Plan) => void;
  startEditing: () => void;
  stopEditing: () => void;
  updateStep: (index: number, step: PlanStep) => void;
  addStep: (step: PlanStep) => void;
  removeStep: (index: number) => void;
  reorderSteps: (fromIndex: number, toIndex: number) => void;
  getEditedPlan: () => Plan;
  hasChanges: () => boolean;
  clearPlan: () => void;
}

export const usePlanStore = create<PlanStore>((set, get) => ({
  currentPlan: null,
  currentRequestId: null,
  isEditing: false,
  editedSteps: [],

  setPlan: (requestId: string, plan: Plan) => {
    set({
      currentPlan: plan,
      currentRequestId: requestId,
      editedSteps: [...plan.steps],
      isEditing: false,
    });
  },

  startEditing: () => {
    set({ isEditing: true });
  },

  stopEditing: () => {
    set({ isEditing: false });
  },

  updateStep: (index: number, step: PlanStep) => {
    set((state) => ({
      editedSteps: state.editedSteps.map((s, i) => (i === index ? step : s)),
    }));
  },

  addStep: (step: PlanStep) => {
    set((state) => ({
      editedSteps: [...state.editedSteps, step],
    }));
  },

  removeStep: (index: number) => {
    set((state) => ({
      editedSteps: state.editedSteps.filter((_, i) => i !== index),
    }));
  },

  reorderSteps: (fromIndex: number, toIndex: number) => {
    set((state) => {
      const newSteps = [...state.editedSteps];
      const [movedStep] = newSteps.splice(fromIndex, 1);
      newSteps.splice(toIndex, 0, movedStep);
      
      return { editedSteps: newSteps };
    });
  },

  getEditedPlan: () => {
    const { editedSteps } = get();
    return { steps: editedSteps };
  },

  hasChanges: () => {
    const { currentPlan, editedSteps } = get();
    if (!currentPlan) return false;
    
    return JSON.stringify(currentPlan.steps) !== JSON.stringify(editedSteps);
  },

  clearPlan: () => {
    set({
      currentPlan: null,
      currentRequestId: null,
      editedSteps: [],
      isEditing: false,
    });
  },
}));
