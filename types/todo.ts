export type TodoStatus = 'todo' | 'in_progress' | 'done';
export type TodoPriority = 'high' | 'medium' | 'low';
export type TodoCategory =
  | 'file_scanner'
  | 'tablet_ui'
  | 'search_filter'
  | 'categories'
  | 'reader_inspector'
  | 'storage_sync';

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  category: TodoCategory;
  status: TodoStatus;
  priority: TodoPriority;
  updatedAt?: number;
  completedAt?: number;
}

export interface TodoCategoryMeta {
  id: TodoCategory;
  name: string;
  icon: string;
  color: string;
}
