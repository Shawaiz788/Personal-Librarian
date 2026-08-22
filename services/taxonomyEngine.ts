import { BookItem, Category } from '../types/book';

interface DynamicCategoryRule {
  id: string;
  name: string;
  icon: string;
  color: string;
  keywords: string[];
}

const CATEGORY_RULES: DynamicCategoryRule[] = [
  {
    id: 'programming',
    name: 'Programming & Tech',
    icon: 'code-slash',
    color: '#6366F1',
    keywords: [
      'javascript', 'python', 'react', 'code', 'algorithm', 'programming', 'web', 'software',
      'git', 'dev', 'css', 'html', 'sql', 'api', 'node', 'typescript', 'rust', 'java',
      'c++', 'linux', 'data structure', 'backend', 'frontend', 'database', 'docker', 'cloud', 'aws', 'kubernetes'
    ],
  },
  {
    id: 'science_math',
    name: 'Science & Mathematics',
    icon: 'planet-outline',
    color: '#06B6D4',
    keywords: [
      'physics', 'math', 'calculus', 'linear algebra', 'quantum', 'biology', 'chemistry',
      'astronomy', 'science', 'statistics', 'geometry', 'algebra', 'neural', 'machine learning', 'ai', 'deep learning'
    ],
  },
  {
    id: 'fiction',
    name: 'Fiction & Literature',
    icon: 'book-outline',
    color: '#EC4899',
    keywords: [
      'novel', 'story', 'chronicles', 'tales', 'fiction', 'potter', 'ring', 'game', 'dune',
      'fantasy', 'mystery', 'thriller', 'adventures', 'dracula', 'sherlock', 'pride', 'prejudice'
    ],
  },
  {
    id: 'business',
    name: 'Business & Finance',
    icon: 'trending-up',
    color: '#F59E0B',
    keywords: [
      'business', 'finance', 'invest', 'startup', 'money', 'economics', 'marketing',
      'management', 'wealth', 'crypto', 'leadership', 'entrepreneur', 'sales', 'strategy'
    ],
  },
  {
    id: 'comics',
    name: 'Comics & Graphic Novels',
    icon: 'color-palette-outline',
    color: '#8B5CF6',
    keywords: ['manga', 'comic', 'cbr', 'cbz', 'marvel', 'dc', 'batman', 'superman', 'anime', 'artbook'],
  },
  {
    id: 'guides',
    name: 'Guides & Manuals',
    icon: 'construct-outline',
    color: '#10B981',
    keywords: ['cheat', 'guide', 'handbook', 'manual', 'tutorial', 'cookbook', 'cheatsheet', 'reference', 'documentation'],
  },
  {
    id: 'academic',
    name: 'Research & Papers',
    icon: 'document-text-outline',
    color: '#3B82F6',
    keywords: ['paper', 'thesis', 'journal', 'report', 'research', 'ieee', 'springer', 'arxiv', 'study', 'whitepaper'],
  },
];

export const TaxonomyEngine = {
  /**
   * Intelligently classifies a book into a category based on its title, filename, format, and path
   */
  classifyBook(title: string, filename: string, format: string): string {
    const textToMatch = `${title} ${filename}`.toLowerCase();

    // Check comics format
    if (format === 'cbr' || format === 'cbz') {
      return 'comics';
    }

    for (const rule of CATEGORY_RULES) {
      for (const keyword of rule.keywords) {
        if (textToMatch.includes(keyword)) {
          return rule.id;
        }
      }
    }

    return 'general';
  },

  /**
   * Computes dynamic categories strictly from the books currently loaded in the library.
   * If a category has 0 books, it is NOT shown.
   */
  computeDynamicCategories(books: BookItem[]): Category[] {
    const categoryBookCountMap = new Map<string, number>();

    books.forEach((book) => {
      const catId = book.categoryId || this.classifyBook(book.title, book.filename, book.format);
      categoryBookCountMap.set(catId, (categoryBookCountMap.get(catId) || 0) + 1);
    });

    const dynamicCategories: Category[] = [];

    CATEGORY_RULES.forEach((rule) => {
      const count = categoryBookCountMap.get(rule.id) || 0;
      if (count > 0) {
        dynamicCategories.push({
          id: rule.id,
          name: rule.name,
          icon: rule.icon,
          color: rule.color,
          description: `${count} ${count === 1 ? 'document' : 'documents'} found`,
          isSystem: true,
        });
      }
    });

    const generalCount = categoryBookCountMap.get('general') || 0;
    if (generalCount > 0) {
      dynamicCategories.push({
        id: 'general',
        name: 'General & Miscellaneous',
        icon: 'folder-open-outline',
        color: '#64748B',
        description: `${generalCount} ${generalCount === 1 ? 'document' : 'documents'} found`,
        isSystem: true,
      });
    }

    return dynamicCategories;
  },

  /**
   * Groups books into dynamic shelves for the Library Hub
   */
  groupBooksByDynamicShelves(books: BookItem[]): { id: string; title: string; color: string; icon: string; books: BookItem[] }[] {
    const groups: { [key: string]: BookItem[] } = {};

    books.forEach((book) => {
      const catId = book.categoryId || this.classifyBook(book.title, book.filename, book.format);
      if (!groups[catId]) {
        groups[catId] = [];
      }
      groups[catId].push(book);
    });

    const shelves: { id: string; title: string; color: string; icon: string; books: BookItem[] }[] = [];

    CATEGORY_RULES.forEach((rule) => {
      if (groups[rule.id] && groups[rule.id].length > 0) {
        shelves.push({
          id: rule.id,
          title: rule.name,
          color: rule.color,
          icon: rule.icon,
          books: groups[rule.id],
        });
      }
    });

    if (groups['general'] && groups['general'].length > 0) {
      shelves.push({
        id: 'general',
        title: 'General & Miscellaneous',
        color: '#64748B',
        icon: 'folder-open-outline',
        books: groups['general'],
      });
    }

    return shelves;
  },
};
