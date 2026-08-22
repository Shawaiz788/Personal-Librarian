import { BookItem, Category } from '../types/book';

interface DynamicCategoryRule {
  id: string;
  name: string;
  icon: string;
  color: string;
  keywords: string[];
}

const CATEGORY_RULES: DynamicCategoryRule[] = [
  // --- MEDICAL & HEALTHCARE SPECIALTIES ---
  {
    id: 'medicine_clinical',
    name: 'Clinical Medicine & Diagnosis',
    icon: 'medkit-outline',
    color: '#0284C7',
    keywords: [
      'medicine', 'clinical', 'internal medicine', 'harrison', 'davidson', 'physician',
      'oxford handbook', 'diagnosis', 'step up to medicine', 'usmle', 'plab', 'first aid',
      'examination', 'symptom', 'treatment', 'patient', 'hospital', 'case files'
    ],
  },
  {
    id: 'anatomy_physio',
    name: 'Anatomy & Physiology',
    icon: 'body-outline',
    color: '#E11D48',
    keywords: [
      'anatomy', 'physiology', 'netter', "gray's", 'grays', 'guyton', 'hall', 'snell',
      'moore', 'embryology', 'histology', 'neuroanatomy', 'chaurasia', 'ganong', 'atlas',
      'human body', 'dissection', 'gross anatomy', 'organ'
    ],
  },
  {
    id: 'pharmacology',
    name: 'Pharmacology & Drugs',
    icon: 'flask-outline',
    color: '#059669',
    keywords: [
      'pharmacology', 'pharma', 'drug', 'katzung', 'rang', 'dale', 'goodman', 'gilman',
      'tripathi', 'lippincott pharmacology', 'dosage', 'therapeutics', 'toxicology', 'prescription',
      'antibiotic', 'medication', 'pharmacy'
    ],
  },
  {
    id: 'pathology_micro',
    name: 'Pathology & Microbiology',
    icon: 'git-network-outline',
    color: '#7C3AED',
    keywords: [
      'pathology', 'microbiology', 'robbins', 'cotran', 'pathoma', 'jawetz', 'levinson',
      'immunology', 'parasitology', 'virology', 'hematology', 'histopathology', 'bacteria',
      'infection', 'infectious', 'disease', 'cellular'
    ],
  },
  {
    id: 'surgery_emergency',
    name: 'Surgery & Emergency',
    icon: 'cut-outline',
    color: '#DC2626',
    keywords: [
      'surgery', 'surgical', 'orthopedic', 'orthopaedics', 'bailey', 'love', 'schwartz',
      'sabiston', 'trauma', 'operative', 'anesthesia', 'anesthesiology', 'suture', 'emergency',
      'critical care', 'icu', 'resuscitation', 'wound'
    ],
  },
  {
    id: 'pediatrics_obgyn',
    name: 'Pediatrics, OB/GYN',
    icon: 'heart-half-outline',
    color: '#DB2777',
    keywords: [
      'pediatric', 'pediatrics', 'paediatrics', 'nelson', 'gynecology', 'obstetrics',
      'gynaecology', 'williams', 'dutta', 'child health', 'neonatology', 'infant',
      'pregnancy', 'maternal', 'embryo'
    ],
  },
  {
    id: 'specialties_cardio_neuro',
    name: 'Specialties (Cardio, Neuro, Radio)',
    icon: 'pulse-outline',
    color: '#EA580C',
    keywords: [
      'cardiology', 'cardiovascular', 'ecg', 'ekg', 'heart', 'neurology', 'neurosurgery',
      'brain', 'dermatology', 'skin', 'radiology', 'ct scan', 'mri', 'x-ray', 'ultrasound',
      'ophthalmology', 'eye', 'ent', 'otolaryngology', 'psychiatry', 'nephrology', 'kidney',
      'pulmonology', 'lung', 'gastroenterology', 'endocrinology', 'oncology', 'cancer'
    ],
  },
  {
    id: 'nursing_public_health',
    name: 'Nursing & Public Health',
    icon: 'fitness-outline',
    color: '#0D9488',
    keywords: [
      'nursing', 'public health', 'epidemiology', 'park', 'community medicine',
      'forensic', 'medical ethics', 'patient care', 'nutrition', 'hygiene', 'health'
    ],
  },

  // --- COMPUTER SCIENCE & ENGINEERING ---
  {
    id: 'programming',
    name: 'Programming & Tech',
    icon: 'code-slash',
    color: '#4F46E5',
    keywords: [
      'javascript', 'python', 'react', 'code', 'algorithm', 'programming', 'web', 'software',
      'git', 'dev', 'css', 'html', 'sql', 'api', 'node', 'typescript', 'rust', 'java',
      'c++', 'linux', 'data structure', 'backend', 'frontend', 'database', 'docker', 'cloud',
      'aws', 'kubernetes', 'full stack', 'developer'
    ],
  },

  // --- SCIENCE & MATHEMATICS ---
  {
    id: 'science_math',
    name: 'Science & Mathematics',
    icon: 'planet-outline',
    color: '#06B6D4',
    keywords: [
      'physics', 'math', 'calculus', 'linear algebra', 'quantum', 'biology', 'chemistry',
      'astronomy', 'science', 'statistics', 'geometry', 'algebra', 'neural network',
      'machine learning', 'ai', 'deep learning', 'data science'
    ],
  },

  // --- FICTION & LITERATURE ---
  {
    id: 'fiction',
    name: 'Fiction & Literature',
    icon: 'book-outline',
    color: '#EC4899',
    keywords: [
      'novel', 'story', 'chronicles', 'tales', 'fiction', 'potter', 'ring', 'game of thrones',
      'dune', 'fantasy', 'mystery', 'thriller', 'adventures', 'dracula', 'sherlock', 'pride', 'prejudice'
    ],
  },

  // --- BUSINESS & FINANCE ---
  {
    id: 'business',
    name: 'Business & Finance',
    icon: 'trending-up',
    color: '#F59E0B',
    keywords: [
      'business', 'finance', 'invest', 'startup', 'money', 'economics', 'marketing',
      'management', 'wealth', 'crypto', 'leadership', 'entrepreneur', 'sales', 'strategy', 'accounting'
    ],
  },

  // --- COMICS & GRAPHIC NOVELS ---
  {
    id: 'comics',
    name: 'Comics & Graphic Novels',
    icon: 'color-palette-outline',
    color: '#8B5CF6',
    keywords: ['manga', 'comic', 'cbr', 'cbz', 'marvel', 'dc', 'batman', 'superman', 'anime', 'artbook'],
  },

  // --- GUIDES & MANUALS ---
  {
    id: 'guides',
    name: 'Guides & Manuals',
    icon: 'construct-outline',
    color: '#10B981',
    keywords: ['cheat', 'guide', 'handbook', 'manual', 'tutorial', 'cookbook', 'cheatsheet', 'reference', 'documentation'],
  },

  // --- RESEARCH PAPERS ---
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
   * Intelligently classifies a book into a category based on title, filename, format, and path
   */
  classifyBook(title: string, filename: string, format: string): string {
    const textToMatch = `${title} ${filename}`.toLowerCase();

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
   * If a category has 0 books, it is NOT returned!
   */
  computeDynamicCategories(books: BookItem[]): Category[] {
    const categoryBookCountMap = new Map<string, number>();

    books.forEach((book) => {
      const catId = this.classifyBook(book.title, book.filename, book.format);
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
          description: `${count} ${count === 1 ? 'book' : 'books'} found`,
          isSystem: true,
        });
      }
    });

    const generalCount = categoryBookCountMap.get('general') || 0;
    if (generalCount > 0) {
      dynamicCategories.push({
        id: 'general',
        name: 'General Medical & Other Books',
        icon: 'folder-open-outline',
        color: '#64748B',
        description: `${generalCount} ${generalCount === 1 ? 'book' : 'books'} found`,
        isSystem: true,
      });
    }

    return dynamicCategories;
  },

  /**
   * Groups books into dynamic shelves strictly for categories that contain actual books.
   */
  groupBooksByDynamicShelves(books: BookItem[]): { id: string; title: string; color: string; icon: string; books: BookItem[] }[] {
    const groups: { [key: string]: BookItem[] } = {};

    books.forEach((book) => {
      const catId = this.classifyBook(book.title, book.filename, book.format);
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
        title: 'General & Other Documents',
        color: '#64748B',
        icon: 'folder-open-outline',
        books: groups['general'],
      });
    }

    return shelves;
  },
};
