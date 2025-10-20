import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Session, Message } from '@/types';

interface SessionStore {
  sessions: Session[];
  activeSessionId: string | null;
  createSession: () => string;
  switchSession: (id: string) => void;
  closeSession: (id: string) => void;
  addMessage: (sessionId: string, message: Message) => void;
  updateSession: (sessionId: string, updates: Partial<Session>) => void;
  renameSession: (sessionId: string, name: string) => void;
  getActiveSession: () => Session | null;
  getSession: (id: string) => Session | null;
  // New methods for querying local history
  getMessagesWithRequestData: () => Message[];
  getSessionsByStatus: (status: Session['status']) => Session[];
  searchMessages: (query: string) => Message[];
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      activeSessionId: null,

      createSession: () => {
        const newSession: Session = {
          id: crypto.randomUUID(),
          name: `Session ${new Date().toLocaleTimeString()}`,
          messages: [],
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          sessions: [...state.sessions, newSession],
          activeSessionId: newSession.id,
        }));

        return newSession.id;
      },

      switchSession: (id: string) => {
        set({ activeSessionId: id });
      },

      closeSession: (id: string) => {
        set((state) => {
          const newSessions = state.sessions.filter((session) => session.id !== id);
          const newActiveSessionId =
            state.activeSessionId === id
              ? (newSessions.length > 0 ? newSessions[0].id : null)
              : state.activeSessionId;

          return {
            sessions: newSessions,
            activeSessionId: newActiveSessionId,
          };
        });
      },

      addMessage: (sessionId: string, message: Message) => {
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === sessionId
              ? {
                  ...session,
                  messages: [...session.messages, message],
                  updatedAt: new Date(),
                }
              : session
          ),
        }));
      },

      updateSession: (sessionId: string, updates: Partial<Session>) => {
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === sessionId
              ? { ...session, ...updates, updatedAt: new Date() }
              : session
          ),
        }));
      },

      renameSession: (sessionId: string, name: string) => {
        get().updateSession(sessionId, { name });
      },

      getActiveSession: () => {
        const { sessions, activeSessionId } = get();
        return sessions.find((session) => session.id === activeSessionId) || null;
      },

      getSession: (id: string) => {
        const { sessions } = get();
        return sessions.find((session) => session.id === id) || null;
      },

      // New methods for querying local history
      getMessagesWithRequestData: () => {
        const { sessions } = get();
        return sessions.flatMap(session =>
          session.messages.filter(message => message.requestData)
        );
      },

      getSessionsByStatus: (status: Session['status']) => {
        const { sessions } = get();
        return sessions.filter(session => session.status === status);
      },

      searchMessages: (query: string) => {
        const { sessions } = get();
        const lowercaseQuery = query.toLowerCase();
        return sessions.flatMap(session =>
          session.messages.filter(message =>
            message.content.toLowerCase().includes(lowercaseQuery)
          )
        );
      },
    }),
    {
      name: 'session-store',
      partialize: (state) => ({
        sessions: state.sessions,
        activeSessionId: state.activeSessionId,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.sessions) {
          state.sessions = state.sessions.map(session => ({
            ...session,
            createdAt: new Date(session.createdAt),
            updatedAt: new Date(session.updatedAt),
            messages: session.messages.map(message => ({
              ...message,
              timestamp: new Date(message.timestamp),
            })),
          }));
        }
      },
    }
  )
);
