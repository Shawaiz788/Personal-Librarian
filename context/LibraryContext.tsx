import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { BookItem, Category, Collection, FilterState, ViewMode } from '../types/book';
import { StorageService } from '../services/storage';
import { FileScannerService } from '../services/fileScanner';
import { SearchEngineService } from '../services/searchEngine';
import { TaxonomyEngine } from '../services/taxonomyEngine';

interface ScanProgressInfo {
  scannedDirs: number;
  foundCount: number;
  currentName: string;
}

interface LibraryContextType {
  books: BookItem[];
  filteredBooks: BookItem[];
  categories: Category[];
  customCategories: Category[];
  collections: Collection[];
  filter: FilterState;
  viewMode: ViewMode;
  selectedBook: BookItem | null;
  readingBook: BookItem | null;
  isLoading: boolean;
  isScanning: boolean;
  scanProgress: ScanProgressInfo;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
  setViewMode: (mode: ViewMode) => void;
  setSelectedBook: (book: BookItem | null) => void;
  openBookInReader: (book: BookItem) => void;
  closeReader: () => void;
  updateReadingProgress: (book: BookItem, progress: number) => Promise<void>;
  scanDevice: (forceNewLocation?: boolean) => Promise<number>;
  importDocuments: () => Promise<number>;
  updateBook: (book: BookItem) => Promise<void>;
  deleteBook: (bookId: string) => Promise<void>;
  createCategory: (name: string, color: string, icon: string) => Promise<void>;
  createCollection: (name: string, description: string, color: string) => Promise<void>;
  toggleBookInCollection: (collectionId: string, bookId: string) => Promise<void>;
  openBookFile: (book: BookItem) => Promise<void>;
  reloadLibrary: () => Promise<void>;
}

const defaultFilter: FilterState = {
  query: '',
  categoryId: 'all',
  format: 'all',
  readingStatus: 'all',
  sortBy: 'date-desc',
};

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<BookItem[]>([]);
  const [customCategories, setCustomCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [filter, setFilter] = useState<FilterState>(defaultFilter);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);
  const [readingBook, setReadingBook] = useState<BookItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<ScanProgressInfo>({
    scannedDirs: 0,
    foundCount: 0,
    currentName: '',
  });

  const reloadLibrary = async () => {
    setIsLoading(true);
    try {
      const [savedBooks, savedCategories, savedCollections] = await Promise.all([
        StorageService.loadBooks(),
        StorageService.loadCategories(),
        StorageService.loadCollections(),
      ]);
      setBooks(savedBooks);
      setCustomCategories(savedCategories.filter((c) => !c.isSystem));
      setCollections(savedCollections);
    } catch (e) {
      console.error('Failed to load library:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    reloadLibrary();
  }, []);

  // Compute dynamic categories strictly from the books currently loaded in the library
  const categories = useMemo(() => {
    const dynamicCats = TaxonomyEngine.computeDynamicCategories(books);
    // Combine dynamic categories with user-created custom categories
    return [...dynamicCats, ...customCategories];
  }, [books, customCategories]);

  const filteredBooks = useMemo(() => {
    return SearchEngineService.filterAndSortBooks(books, filter);
  }, [books, filter]);

  const scanDevice = async (forceNewLocation = false): Promise<number> => {
    setIsScanning(true);
    setScanProgress({ scannedDirs: 0, foundCount: 0, currentName: 'Initializing scanner...' });
    try {
      const newDocs = await FileScannerService.autoScanDevice(
        (scannedDirs, foundCount, currentName) => {
          setScanProgress({ scannedDirs, foundCount, currentName });
        },
        forceNewLocation
      );

      if (newDocs.length > 0) {
        const updated = await StorageService.addBooks(newDocs);
        setBooks(updated);
        return newDocs.length;
      }
      return 0;
    } finally {
      setIsScanning(false);
    }
  };

  const importDocuments = async (): Promise<number> => {
    setIsScanning(true);
    try {
      const newDocs = await FileScannerService.pickAndImportDocuments();
      if (newDocs.length > 0) {
        const updated = await StorageService.addBooks(newDocs);
        setBooks(updated);
        return newDocs.length;
      }
      return 0;
    } finally {
      setIsScanning(false);
    }
  };

  const updateBook = async (book: BookItem) => {
    const updated = await StorageService.updateBook(book);
    setBooks(updated);
    if (selectedBook?.id === book.id) {
      setSelectedBook(book);
    }
    if (readingBook?.id === book.id) {
      setReadingBook(book);
    }
  };

  const deleteBook = async (bookId: string) => {
    const updated = await StorageService.deleteBook(bookId);
    setBooks(updated);
    if (selectedBook?.id === bookId) {
      setSelectedBook(null);
    }
    if (readingBook?.id === bookId) {
      setReadingBook(null);
    }
  };

  const openBookInReader = (book: BookItem) => {
    const updated: BookItem = { ...book, lastReadDate: Date.now() };
    updateBook(updated);
    setReadingBook(updated);
  };

  const closeReader = () => {
    setReadingBook(null);
  };

  const updateReadingProgress = async (book: BookItem, progress: number) => {
    const updated: BookItem = {
      ...book,
      readingProgress: progress,
      lastReadDate: Date.now(),
    };
    await updateBook(updated);
  };

  const createCategory = async (name: string, color: string, icon: string) => {
    const newCategory: Category = {
      id: `cat_${Date.now()}`,
      name,
      color,
      icon,
      isSystem: false,
    };
    const updated = [...customCategories, newCategory];
    await StorageService.saveCategories(updated);
    setCustomCategories(updated);
  };

  const createCollection = async (name: string, description: string, color: string) => {
    const newCol: Collection = {
      id: `col_${Date.now()}`,
      name,
      description,
      color,
      bookIds: [],
      createdAt: Date.now(),
    };
    const updated = [...collections, newCol];
    await StorageService.saveCollections(updated);
    setCollections(updated);
  };

  const toggleBookInCollection = async (collectionId: string, bookId: string) => {
    const updated = collections.map((col) => {
      if (col.id === collectionId) {
        const hasBook = col.bookIds.includes(bookId);
        const bookIds = hasBook
          ? col.bookIds.filter((id) => id !== bookId)
          : [...col.bookIds, bookId];
        return { ...col, bookIds };
      }
      return col;
    });
    await StorageService.saveCollections(updated);
    setCollections(updated);
  };

  const openBookFile = async (book: BookItem) => {
    openBookInReader(book);
  };

  return (
    <LibraryContext.Provider
      value={{
        books,
        filteredBooks,
        categories,
        customCategories,
        collections,
        filter,
        viewMode,
        selectedBook,
        readingBook,
        isLoading,
        isScanning,
        scanProgress,
        setFilter,
        setViewMode,
        setSelectedBook,
        openBookInReader,
        closeReader,
        updateReadingProgress,
        scanDevice,
        importDocuments,
        updateBook,
        deleteBook,
        createCategory,
        createCollection,
        toggleBookInCollection,
        openBookFile,
        reloadLibrary,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};
