import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, AppState } from 'react-native';

// ─── Types matching user's schema ────────────────────────────
export type Priority = 'urgent' | 'high' | 'medium' | 'low' | 'none';
export type Category = 'Personal' | 'Work' | 'Health' | 'Shopping' | 'Finance' | 'Education' | 'Other';
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'archived';
export type Recurrence = 'None' | 'Daily' | 'Weekly' | 'Monthly';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Todo {
  id: string;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  dueDate?: string;        // "YYYY-MM-DD"
  dueTime?: string;        // "HH:mm"
  duration?: string;        // "30m", "1h", "2h"
  tags: string[];
  reminder?: string;        // ISO date string
  recurrence: Recurrence;
  subtasks: SubTask[];
  notes: string;
  status: TaskStatus;
  favorite: boolean;
  createdAt: string;        // ISO date string
  updatedAt: string;        // ISO date string
  completedAt?: string;     // ISO date string
  archivedAt?: string;      // ISO date string
}

export interface TodoStats {
  total: number;
  completed: number;
  active: number;
  archived: number;
  favorites: number;
  completionRate: number;
  byPriority: Record<Priority, number>;
  byCategory: Record<Category, number>;
  todayCompleted: number;
  overdue: number;
  dueToday: number;
  inProgress: number;
}

interface TodoContextType {
  todos: Todo[];
  isLoaded: boolean;
  // CRUD
  addTodo: (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  deleteTodo: (id: string) => void;
  // Status
  toggleComplete: (id: string) => void;
  setStatus: (id: string, status: TaskStatus) => void;
  // Archive
  archiveTodo: (id: string) => void;
  unarchiveTodo: (id: string) => void;
  // Favorites
  toggleFavorite: (id: string) => void;
  // Subtasks
  addSubtask: (todoId: string, title: string) => void;
  toggleSubtask: (todoId: string, subtaskId: string) => void;
  deleteSubtask: (todoId: string, subtaskId: string) => void;
  // Filters
  getFilteredTodos: (filter: 'all' | 'active' | 'completed' | 'archived' | 'favorites') => Todo[];
  getTodosByCategory: (category: Category) => Todo[];
  getTodosByPriority: (priority: Priority) => Todo[];
  searchTodos: (query: string) => Todo[];
  // Bulk
  clearCompleted: () => void;
  clearAll: () => void;
  // Stats
  stats: TodoStats;
  // Reminders
  pendingReminders: Todo[];
  dismissReminder: (id: string) => void;
}

const STORAGE_KEY = '@todos_v2';
const DISMISSED_REMINDERS_KEY = '@dismissed_reminders';

const TodoContext = createContext<TodoContextType | undefined>(undefined);

const CATEGORIES: Category[] = ['Personal', 'Work', 'Health', 'Shopping', 'Finance', 'Education', 'Other'];
const PRIORITIES: Priority[] = ['urgent', 'high', 'medium', 'low', 'none'];

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

export function TodoProvider({ children }: { children: React.ReactNode }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [dismissedReminders, setDismissedReminders] = useState<Set<string>>(new Set());
  const appState = useRef(AppState.currentState);

  // Load from storage
  useEffect(() => {
    (async () => {
      try {
        const [storedTodos, storedDismissed] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(DISMISSED_REMINDERS_KEY),
        ]);
        if (storedTodos) setTodos(JSON.parse(storedTodos));
        if (storedDismissed) setDismissedReminders(new Set(JSON.parse(storedDismissed)));
      } catch {
        // silently fail
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  // Persist on change
  useEffect(() => {
    if (isLoaded) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todos)).catch(() => {});
    }
  }, [todos, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      AsyncStorage.setItem(DISMISSED_REMINDERS_KEY, JSON.stringify([...dismissedReminders])).catch(() => {});
    }
  }, [dismissedReminders, isLoaded]);

  // Check reminders when app comes to foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        // Trigger re-render to check reminders
        setTodos((prev) => [...prev]);
      }
      appState.current = nextState;
    });
    return () => sub.remove();
  }, []);

  const now = () => new Date().toISOString();

  // ─── CRUD ────────────────────────────────────
  const addTodo = useCallback((todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    const timestamp = now();
    const newTodo: Todo = {
      ...todo,
      id: generateId(),
      status: 'pending',
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    setTodos((prev) => [newTodo, ...prev]);
  }, []);

  const updateTodo = useCallback((id: string, updates: Partial<Todo>) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: now() } : t))
    );
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ─── Status ──────────────────────────────────
  const toggleComplete = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const isNowComplete = t.status !== 'completed';
        return {
          ...t,
          status: isNowComplete ? 'completed' : 'pending',
          completedAt: isNowComplete ? now() : undefined,
          updatedAt: now(),
        };
      })
    );
  }, []);

  const setStatus = useCallback((id: string, status: TaskStatus) => {
    setTodos((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        return {
          ...t,
          status,
          completedAt: status === 'completed' ? now() : t.completedAt,
          archivedAt: status === 'archived' ? now() : t.archivedAt,
          updatedAt: now(),
        };
      })
    );
  }, []);

  // ─── Archive ─────────────────────────────────
  const archiveTodo = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: 'archived' as TaskStatus, archivedAt: now(), updatedAt: now() }
          : t
      )
    );
  }, []);

  const unarchiveTodo = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: 'pending' as TaskStatus, archivedAt: undefined, updatedAt: now() }
          : t
      )
    );
  }, []);

  // ─── Favorites ───────────────────────────────
  const toggleFavorite = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, favorite: !t.favorite, updatedAt: now() } : t
      )
    );
  }, []);

  // ─── Subtasks ────────────────────────────────
  const addSubtask = useCallback((todoId: string, title: string) => {
    setTodos((prev) =>
      prev.map((t) => {
        if (t.id !== todoId) return t;
        return {
          ...t,
          subtasks: [...t.subtasks, { id: generateId(), title, completed: false }],
          updatedAt: now(),
        };
      })
    );
  }, []);

  const toggleSubtask = useCallback((todoId: string, subtaskId: string) => {
    setTodos((prev) =>
      prev.map((t) => {
        if (t.id !== todoId) return t;
        return {
          ...t,
          subtasks: t.subtasks.map((s) =>
            s.id === subtaskId ? { ...s, completed: !s.completed } : s
          ),
          updatedAt: now(),
        };
      })
    );
  }, []);

  const deleteSubtask = useCallback((todoId: string, subtaskId: string) => {
    setTodos((prev) =>
      prev.map((t) => {
        if (t.id !== todoId) return t;
        return {
          ...t,
          subtasks: t.subtasks.filter((s) => s.id !== subtaskId),
          updatedAt: now(),
        };
      })
    );
  }, []);

  // ─── Filters ─────────────────────────────────
  const getFilteredTodos = useCallback(
    (filter: 'all' | 'active' | 'completed' | 'archived' | 'favorites') => {
      switch (filter) {
        case 'active':
          return todos.filter((t) => t.status === 'pending' || t.status === 'in-progress');
        case 'completed':
          return todos.filter((t) => t.status === 'completed');
        case 'archived':
          return todos.filter((t) => t.status === 'archived');
        case 'favorites':
          return todos.filter((t) => t.favorite && t.status !== 'archived');
        default:
          return todos.filter((t) => t.status !== 'archived');
      }
    },
    [todos]
  );

  const getTodosByCategory = useCallback(
    (category: Category) => todos.filter((t) => t.category === category && t.status !== 'archived'),
    [todos]
  );

  const getTodosByPriority = useCallback(
    (priority: Priority) => todos.filter((t) => t.priority === priority && t.status !== 'archived'),
    [todos]
  );

  const searchTodos = useCallback(
    (query: string) => {
      const q = query.toLowerCase();
      return todos.filter(
        (t) =>
          t.status !== 'archived' &&
          (t.title.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            t.category.toLowerCase().includes(q) ||
            t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
            t.notes.toLowerCase().includes(q))
      );
    },
    [todos]
  );

  // ─── Bulk ────────────────────────────────────
  const clearCompleted = useCallback(() => {
    setTodos((prev) => prev.filter((t) => t.status !== 'completed'));
  }, []);

  const clearAll = useCallback(() => {
    setTodos([]);
  }, []);

  // ─── Reminders ───────────────────────────────
  const pendingReminders = React.useMemo(() => {
    const currentTime = new Date();
    return todos.filter((t) => {
      if (!t.reminder || t.status === 'completed' || t.status === 'archived') return false;
      if (dismissedReminders.has(t.id)) return false;
      return new Date(t.reminder) <= currentTime;
    });
  }, [todos, dismissedReminders]);

  const dismissReminder = useCallback((id: string) => {
    setDismissedReminders((prev) => new Set([...prev, id]));
  }, []);

  // ─── Stats ───────────────────────────────────
  const stats = React.useMemo<TodoStats>(() => {
    const nonArchived = todos.filter((t) => t.status !== 'archived');
    const total = nonArchived.length;
    const completed = nonArchived.filter((t) => t.status === 'completed').length;
    const active = nonArchived.filter((t) => t.status === 'pending' || t.status === 'in-progress').length;
    const archived = todos.filter((t) => t.status === 'archived').length;
    const favorites = nonArchived.filter((t) => t.favorite).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const inProgress = nonArchived.filter((t) => t.status === 'in-progress').length;

    const byPriority = {} as Record<Priority, number>;
    for (const p of PRIORITIES) {
      byPriority[p] = nonArchived.filter((t) => t.priority === p && t.status !== 'completed').length;
    }

    const byCategory = {} as Record<Category, number>;
    for (const c of CATEGORIES) {
      byCategory[c] = nonArchived.filter((t) => t.category === c).length;
    }

    const today = new Date().toDateString();
    const todayCompleted = nonArchived.filter(
      (t) => t.status === 'completed' && t.completedAt && new Date(t.completedAt).toDateString() === today
    ).length;

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const todayStr = currentDate.toISOString().split('T')[0];

    const overdue = nonArchived.filter((t) => {
      if (t.status === 'completed' || !t.dueDate) return false;
      return t.dueDate < todayStr;
    }).length;

    const dueToday = nonArchived.filter((t) => {
      if (t.status === 'completed' || !t.dueDate) return false;
      return t.dueDate === todayStr;
    }).length;

    return {
      total,
      completed,
      active,
      archived,
      favorites,
      completionRate,
      byPriority,
      byCategory,
      todayCompleted,
      overdue,
      dueToday,
      inProgress,
    };
  }, [todos]);

  return (
    <TodoContext.Provider
      value={{
        todos,
        isLoaded,
        addTodo,
        updateTodo,
        deleteTodo,
        toggleComplete,
        setStatus,
        archiveTodo,
        unarchiveTodo,
        toggleFavorite,
        addSubtask,
        toggleSubtask,
        deleteSubtask,
        getFilteredTodos,
        getTodosByCategory,
        getTodosByPriority,
        searchTodos,
        clearCompleted,
        clearAll,
        stats,
        pendingReminders,
        dismissReminder,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
}

export function useTodos() {
  const context = useContext(TodoContext);
  if (!context) throw new Error('useTodos must be used within a TodoProvider');
  return context;
}

export { CATEGORIES, PRIORITIES };
