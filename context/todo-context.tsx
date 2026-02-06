import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Priority = 'low' | 'medium' | 'high';
export type Category = 'personal' | 'work' | 'health' | 'shopping' | 'other';

export interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: Priority;
  category: Category;
  createdAt: string;
  completedAt?: string;
  dueDate?: string;
}

interface TodoContextType {
  todos: Todo[];
  addTodo: (todo: Omit<Todo, 'id' | 'createdAt' | 'completed'>) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  getFilteredTodos: (filter: 'all' | 'active' | 'completed') => Todo[];
  getTodosByCategory: (category: Category) => Todo[];
  getTodosByPriority: (priority: Priority) => Todo[];
  stats: {
    total: number;
    completed: number;
    active: number;
    completionRate: number;
    byPriority: Record<Priority, number>;
    byCategory: Record<Category, number>;
    todayCompleted: number;
    overdue: number;
  };
}

const STORAGE_KEY = '@todos';

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export function TodoProvider({ children }: { children: React.ReactNode }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load todos from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setTodos(JSON.parse(stored));
        }
      } catch {
        // silently fail
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  // Persist todos whenever they change
  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todos)).catch(() => {});
    }
  }, [todos, loaded]);

  const addTodo = useCallback((todo: Omit<Todo, 'id' | 'createdAt' | 'completed'>) => {
    const newTodo: Todo = {
      ...todo,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      completed: false,
    };
    setTodos((prev) => [newTodo, ...prev]);
  }, []);

  const toggleTodo = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              completed: !todo.completed,
              completedAt: !todo.completed ? new Date().toISOString() : undefined,
            }
          : todo
      )
    );
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }, []);

  const updateTodo = useCallback((id: string, updates: Partial<Todo>) => {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, ...updates } : todo))
    );
  }, []);

  const getFilteredTodos = useCallback(
    (filter: 'all' | 'active' | 'completed') => {
      switch (filter) {
        case 'active':
          return todos.filter((t) => !t.completed);
        case 'completed':
          return todos.filter((t) => t.completed);
        default:
          return todos;
      }
    },
    [todos]
  );

  const getTodosByCategory = useCallback(
    (category: Category) => todos.filter((t) => t.category === category),
    [todos]
  );

  const getTodosByPriority = useCallback(
    (priority: Priority) => todos.filter((t) => t.priority === priority),
    [todos]
  );

  const stats = React.useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((t) => t.completed).length;
    const active = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const byPriority: Record<Priority, number> = {
      low: todos.filter((t) => t.priority === 'low' && !t.completed).length,
      medium: todos.filter((t) => t.priority === 'medium' && !t.completed).length,
      high: todos.filter((t) => t.priority === 'high' && !t.completed).length,
    };

    const byCategory: Record<Category, number> = {
      personal: todos.filter((t) => t.category === 'personal').length,
      work: todos.filter((t) => t.category === 'work').length,
      health: todos.filter((t) => t.category === 'health').length,
      shopping: todos.filter((t) => t.category === 'shopping').length,
      other: todos.filter((t) => t.category === 'other').length,
    };

    const today = new Date().toDateString();
    const todayCompleted = todos.filter(
      (t) => t.completed && t.completedAt && new Date(t.completedAt).toDateString() === today
    ).length;

    const now = new Date();
    const overdue = todos.filter(
      (t) => !t.completed && t.dueDate && new Date(t.dueDate) < now
    ).length;

    return { total, completed, active, completionRate, byPriority, byCategory, todayCompleted, overdue };
  }, [todos]);

  return (
    <TodoContext.Provider
      value={{
        todos,
        addTodo,
        toggleTodo,
        deleteTodo,
        updateTodo,
        getFilteredTodos,
        getTodosByCategory,
        getTodosByPriority,
        stats,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
}

export function useTodos() {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodos must be used within a TodoProvider');
  }
  return context;
}
