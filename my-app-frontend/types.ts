
export type AppTheme = 'blue' | 'pink' | 'green' | 'red' | 'black' | 'night';
export type AppLanguage = 'pt' | 'en';

export type SubscriptionPlan = 'monthly' | 'semestral' | 'annual';

export interface User {
  nickname: string;
  email: string;
  avatarUrl?: string;
  isMaster?: boolean;
  createdAt: string; // ISO String
  subscriptionPlan?: SubscriptionPlan;
}

export type Priority = 'high' | 'medium' | 'low';
export type GoalStatus = 'concluída' | 'pendente' | 'inconclusa' | 'parcialmente concluída';

export interface Task {
  id: string;
  categoryId: string;
  title: string;
  priority: Priority;
  dueDate: string;
  completed: boolean;
  deletedAt?: Date;
}

export interface Note {
  id: string;
  categoryId: string;
  content: string;
  timestamp: Date;
  deletedAt?: Date;
}

export interface QuickNote {
  id: string;
  content: string;
  color: string;
}

export interface ImportantDate {
  id: string;
  title: string;
  date: string;
  isRecurring?: boolean;
}

export interface Goal {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  dueDate: string;
  status: GoalStatus;
  deletedAt?: Date;
}

export interface Notebook {
  id: string;
  categoryId: string;
  title: string;
  content: string; // HTML for rich text
  imageUrl?: string;
  link?: string;
  deletedAt?: Date;
}

export interface Habit {
  id: string;
  title: string;
  history: Record<string, boolean>; // 'YYYY-MM-DD' -> completed
  createdAt: Date;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  author: string;
  date: Date;
}

export interface CategoryItem {
  id: string;
  isPinned: boolean;
  order: number;
}

export interface Expense {
  id: string;
  categoryId: string;
  description: string;
  amount: number;
  dueDate: string;
  isRecurring: boolean;
  installments: number;
  currentInstallment: number;
  paid: boolean;
  groupId?: string;
  deletedAt?: Date;
}
