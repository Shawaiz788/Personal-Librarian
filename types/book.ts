export type BookFormat = 'pdf' | 'epub' | 'txt' | 'mobi' | 'docx' | 'cbr' | 'cbz' | 'other';

export type ReadingStatus = 'all' | 'unread' | 'reading' | 'completed';

export interface BookItem {
  id: string;
  title: string;
  author: string;
  format: BookFormat;
  uri: string;
  filename: string;
  fileSize: number; // in bytes
  dateAdded: number; // timestamp
  lastReadDate?: number; // timestamp
  readingProgress: number; // 0 to 100
  currentPage?: number;
  totalPages?: number;
  rating?: number; // 1 to 5
  categoryId?: string;
  tags: string[];
  notes?: string;
  coverColor: string;
  coverGradient?: [string, string];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
  isSystem?: boolean;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  bookIds: string[];
  createdAt: number;
  color: string;
  icon?: string;
}

export type SortOption =
  | 'title-asc'
  | 'title-desc'
  | 'date-desc'
  | 'date-asc'
  | 'size-desc'
  | 'progress-desc'
  | 'rating-desc';

export type ViewMode = 'grid' | 'shelf' | 'list';

export interface FilterState {
  query: string;
  categoryId: string; // 'all' or specific id
  format: string; // 'all' or specific BookFormat
  readingStatus: ReadingStatus;
  tag?: string;
  sortBy: SortOption;
}
