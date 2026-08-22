import { BookItem, FilterState } from '../types/book';
import { TaxonomyEngine } from './taxonomyEngine';

export const SearchEngineService = {
  /**
   * Filter and sort books according to full filter state
   */
  filterAndSortBooks(books: BookItem[], filter: FilterState): BookItem[] {
    let result = [...books];

    // 1. Text Query Search
    if (filter.query && filter.query.trim().length > 0) {
      const q = filter.query.toLowerCase().trim();
      result = result.filter((book) => {
        const titleMatch = book.title.toLowerCase().includes(q);
        const authorMatch = book.author.toLowerCase().includes(q);
        const filenameMatch = book.filename.toLowerCase().includes(q);
        const notesMatch = book.notes?.toLowerCase().includes(q);
        const tagMatch = book.tags.some((t) => t.toLowerCase().includes(q));
        return titleMatch || authorMatch || filenameMatch || notesMatch || tagMatch;
      });
    }

    // 2. Dynamic Category Filter
    if (filter.categoryId && filter.categoryId !== 'all') {
      result = result.filter((book) => {
        const bookCat = book.categoryId || TaxonomyEngine.classifyBook(book.title, book.filename, book.format);
        return bookCat === filter.categoryId;
      });
    }

    // 3. Format Filter
    if (filter.format && filter.format !== 'all') {
      result = result.filter((book) => book.format.toLowerCase() === filter.format.toLowerCase());
    }

    // 4. Reading Status Filter
    if (filter.readingStatus && filter.readingStatus !== 'all') {
      switch (filter.readingStatus) {
        case 'unread':
          result = result.filter((book) => (book.readingProgress || 0) === 0);
          break;
        case 'reading':
          result = result.filter((book) => (book.readingProgress || 0) > 0 && (book.readingProgress || 0) < 100);
          break;
        case 'completed':
          result = result.filter((book) => (book.readingProgress || 0) >= 100);
          break;
      }
    }

    // 5. Specific Tag Filter
    if (filter.tag && filter.tag !== 'all') {
      result = result.filter((book) => book.tags.includes(filter.tag!));
    }

    // 6. Sorting
    result.sort((a, b) => {
      switch (filter.sortBy) {
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'date-desc':
          return b.dateAdded - a.dateAdded;
        case 'date-asc':
          return a.dateAdded - b.dateAdded;
        case 'size-desc':
          return b.fileSize - a.fileSize;
        case 'progress-desc':
          return (b.readingProgress || 0) - (a.readingProgress || 0);
        case 'rating-desc':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return b.dateAdded - a.dateAdded;
      }
    });

    return result;
  },

  /**
   * Get format counts for badge display
   */
  getFormatCounts(books: BookItem[]): Record<string, number> {
    const counts: Record<string, number> = { all: books.length };
    for (const b of books) {
      const fmt = b.format.toLowerCase();
      counts[fmt] = (counts[fmt] || 0) + 1;
    }
    return counts;
  },

  /**
   * Get dynamic category counts
   */
  getCategoryCounts(books: BookItem[]): Record<string, number> {
    const counts: Record<string, number> = { all: books.length };
    for (const b of books) {
      const cat = b.categoryId || TaxonomyEngine.classifyBook(b.title, b.filename, b.format);
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return counts;
  },

  /**
   * Extract all unique tags across library
   */
  getUniqueTags(books: BookItem[]): string[] {
    const tagSet = new Set<string>();
    for (const b of books) {
      for (const t of b.tags) {
        tagSet.add(t);
      }
    }
    return Array.from(tagSet);
  },
};
