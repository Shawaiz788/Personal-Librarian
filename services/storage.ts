import AsyncStorage from '@react-native-async-storage/async-storage';
import { BookItem, Category, Collection } from '../types/book';
import { FeatureItem } from '../types/todo';

const STORAGE_KEYS = {
  BOOKS: '@book_search_engine_books_v1',
  CATEGORIES: '@book_search_engine_categories_v1',
  COLLECTIONS: '@book_search_engine_collections_v1',
  TODOS: '@book_search_engine_todos_v1',
};

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'tech', name: 'Science & Tech', icon: 'code-slash', color: '#6366F1', description: 'Programming, Engineering & Tech manuals', isSystem: true },
  { id: 'literature', name: 'Literature & Fiction', icon: 'book', color: '#EC4899', description: 'Novels, Classics & Short stories', isSystem: true },
  { id: 'business', name: 'Business & Economics', icon: 'trending-up', color: '#F59E0B', description: 'Finance, Startups & Leadership', isSystem: true },
  { id: 'philosophy', name: 'Philosophy & Mind', icon: 'bulb', color: '#8B5CF6', description: 'Thought, Psychology & Essays', isSystem: true },
  { id: 'research', name: 'Research & Papers', icon: 'document-text', color: '#06B6D4', description: 'Academic papers & Whitepapers', isSystem: true },
  { id: 'manuals', name: 'Guides & Manuals', icon: 'cog', color: '#10B981', description: 'Documentation & Reference books', isSystem: true },
];

export const INITIAL_TODOS: FeatureItem[] = [
  {
    id: 'fs-1',
    title: 'Real Document & PDF File Picker',
    description: 'Direct multi-file selection from device storage using expo-document-picker (PDF, EPUB, TXT, DOCX).',
    category: 'file_scanner',
    status: 'done',
    priority: 'high',
  },
  {
    id: 'fs-2',
    title: 'Automatic Metadata Extraction',
    description: 'Parse filename patterns, format determination, file size calculations, and title/author sanitization.',
    category: 'file_scanner',
    status: 'done',
    priority: 'high',
  },
  {
    id: 'fs-3',
    title: 'Persistent Library Indexing',
    description: 'Save, update, and persist all imported books, reading progress, and tags in local device storage.',
    category: 'storage_sync',
    status: 'done',
    priority: 'high',
  },
  {
    id: 'ui-1',
    title: 'Tablet-First Master-Detail Split Layout',
    description: 'Adaptive layout with vertical NavRail on tablets (>=768px) and fluid bottom navigation tabs on mobile.',
    category: 'tablet_ui',
    status: 'done',
    priority: 'high',
  },
  {
    id: 'ui-2',
    title: 'Dynamic Multi-Column Bookshelf & Card Grid',
    description: 'Responsive 2 to 5 column grid with cover gradient generator, reading progress ring, and format badges.',
    category: 'tablet_ui',
    status: 'done',
    priority: 'high',
  },
  {
    id: 'ui-3',
    title: 'Multi-View Modes (Grid, Shelf, Dense List)',
    description: 'Switch seamlessly between visual card grid, realistic book spine shelf, and sortable dense table.',
    category: 'tablet_ui',
    status: 'done',
    priority: 'medium',
  },
  {
    id: 'search-1',
    title: 'Real-Time Multi-Attribute Search Engine',
    description: 'Instant search across title, author, format, tags, and file path with query highlighting and debouncing.',
    category: 'search_filter',
    status: 'done',
    priority: 'high',
  },
  {
    id: 'search-2',
    title: 'Category, Format & Status Filter Pills',
    description: 'Filter instantly by format (PDF, EPUB, TXT), category, and reading state (Unread, Reading, Completed).',
    category: 'search_filter',
    status: 'done',
    priority: 'high',
  },
  {
    id: 'cat-1',
    title: 'Category & Collection Manager',
    description: 'Create custom shelves/collections, organize books into topics, and tag books with custom color pills.',
    category: 'categories',
    status: 'done',
    priority: 'medium',
  },
  {
    id: 'read-1',
    title: 'Book Details Inspector & Reading Tracker',
    description: 'Slide-in tablet inspector with reading progress slider, star rating, notes editor, and file metadata viewer.',
    category: 'reader_inspector',
    status: 'done',
    priority: 'high',
  },
  {
    id: 'read-2',
    title: 'Direct Document Open & External Sharing',
    description: 'Open files in native system reader and share documents directly from the app.',
    category: 'reader_inspector',
    status: 'done',
    priority: 'medium',
  },
  {
    id: 'todo-1',
    title: 'Interactive Feature & TODO Tracker Dashboard',
    description: 'In-app checklist where users can mark features as Todo, In Progress, or Done, persisted to storage.',
    category: 'storage_sync',
    status: 'done',
    priority: 'high',
  },
];

export const StorageService = {
  // Books
  async loadBooks(): Promise<BookItem[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.BOOKS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load books from storage:', e);
      return [];
    }
  },

  async saveBooks(books: BookItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
    } catch (e) {
      console.error('Failed to save books to storage:', e);
    }
  },

  async addBooks(newBooks: BookItem[]): Promise<BookItem[]> {
    const existing = await this.loadBooks();
    // avoid duplicates by uri or id
    const existingIds = new Set(existing.map((b) => b.id));
    const toAdd = newBooks.filter((b) => !existingIds.has(b.id));
    const updated = [...toAdd, ...existing];
    await this.saveBooks(updated);
    return updated;
  },

  async updateBook(book: BookItem): Promise<BookItem[]> {
    const existing = await this.loadBooks();
    const index = existing.findIndex((b) => b.id === book.id);
    if (index >= 0) {
      existing[index] = book;
      await this.saveBooks(existing);
    }
    return existing;
  },

  async deleteBook(bookId: string): Promise<BookItem[]> {
    const existing = await this.loadBooks();
    const filtered = existing.filter((b) => b.id !== bookId);
    await this.saveBooks(filtered);
    return filtered;
  },

  // Categories
  async loadCategories(): Promise<Category[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (!data) {
        await this.saveCategories(DEFAULT_CATEGORIES);
        return DEFAULT_CATEGORIES;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load categories:', e);
      return DEFAULT_CATEGORIES;
    }
  },

  async saveCategories(categories: Category[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error('Failed to save categories:', e);
    }
  },

  // Collections
  async loadCollections(): Promise<Collection[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.COLLECTIONS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load collections:', e);
      return [];
    }
  },

  async saveCollections(collections: Collection[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(collections));
    } catch (e) {
      console.error('Failed to save collections:', e);
    }
  },

  // TODOs
  async loadTodos(): Promise<FeatureItem[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.TODOS);
      if (!data) {
        await this.saveTodos(INITIAL_TODOS);
        return INITIAL_TODOS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load todos:', e);
      return INITIAL_TODOS;
    }
  },

  async saveTodos(todos: FeatureItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(todos));
    } catch (e) {
      console.error('Failed to save todos:', e);
    }
  },

  async updateTodo(todo: FeatureItem): Promise<FeatureItem[]> {
    const current = await this.loadTodos();
    const index = current.findIndex((t) => t.id === todo.id);
    if (index >= 0) {
      current[index] = todo;
    } else {
      current.push(todo);
    }
    await this.saveTodos(current);
    return current;
  },
};
