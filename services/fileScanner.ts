import { Platform, Linking } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BookItem } from '../types/book';
import { TaxonomyEngine } from './taxonomyEngine';

const SAVED_SCAN_URI_KEY = '@book_search_engine_last_scanned_uri';

const SUPPORTED_EXTENSIONS = new Set([
  'pdf',
  'epub',
  'txt',
  'docx',
  'doc',
  'cbr',
  'cbz',
  'fb2',
  'mobi',
]);

export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function parseBookTitleAndAuthor(filename: string): { title: string; author: string } {
  let cleaned = filename.replace(/\.[^/.]+$/, '');
  cleaned = cleaned.replace(/[_]/g, ' ').replace(/\s+/g, ' ').trim();

  const authorDelimiters = [' - ', ' by ', ' BY ', ' _ ', '—'];
  for (const delim of authorDelimiters) {
    if (cleaned.includes(delim)) {
      const parts = cleaned.split(delim);
      if (parts.length >= 2) {
        const potentialAuthor = parts[0].trim();
        const potentialTitle = parts.slice(1).join(' ').trim();
        if (potentialAuthor.length < 35 && potentialTitle.length > 0) {
          return { title: potentialTitle, author: potentialAuthor };
        }
        return { title: potentialAuthor, author: potentialTitle };
      }
    }
  }

  return {
    title: cleaned || 'Untitled Document',
    author: 'Unknown Author',
  };
}

export function getFormatFromExtension(filename: string): import('../types/book').BookFormat {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (!ext) return 'pdf';
  if (['pdf', 'epub', 'txt', 'mobi', 'docx', 'cbr', 'cbz'].includes(ext)) {
    return ext as import('../types/book').BookFormat;
  }
  return 'other';
}

export function getCoverGradientForTitle(title: string): [string, string] {
  const gradients: [string, string][] = [
    ['#4F46E5', '#3730A3'],
    ['#0284C7', '#0369A1'],
    ['#059669', '#047857'],
    ['#7C3AED', '#6D28D9'],
    ['#DC2626', '#B91C1C'],
    ['#EA580C', '#C2410C'],
    ['#DB2777', '#BE185D'],
    ['#0D9488', '#0F766E'],
  ];

  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = (hash << 5) - hash + title.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
}

function getFilenameFromUri(uri: string): string {
  const decoded = decodeURIComponent(uri);
  const parts = decoded.split('/');
  return parts[parts.length - 1] || 'Document';
}

export const FileScannerService = {
  /**
   * Copies SAF/content URI to app's cache directory so it can be streamed by WebView or Sharing.
   */
  async ensureLocalFileUri(book: BookItem): Promise<string> {
    try {
      if (book.uri.startsWith('file://')) {
        return book.uri;
      }

      const cacheDir = FileSystem.cacheDirectory || FileSystem.documentDirectory;
      const booksDir = `${cacheDir}books/`;

      const dirInfo = await FileSystem.getInfoAsync(booksDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(booksDir, { intermediates: true });
      }

      const ext = book.filename.split('.').pop() || book.format || 'pdf';
      const safeFilename = `doc_${book.id.replace(/[^a-zA-Z0-9]/g, '_')}.${ext}`;
      const destinationUri = `${booksDir}${safeFilename}`;

      const fileInfo = await FileSystem.getInfoAsync(destinationUri);
      if (fileInfo.exists && (fileInfo.size || 0) > 0) {
        return destinationUri;
      }

      await FileSystem.copyAsync({
        from: book.uri,
        to: destinationUri,
      });

      return destinationUri;
    } catch (e) {
      console.warn('Failed to cache local file URI:', e);
      return book.uri;
    }
  },

  /**
   * Reads raw base64 or text content of a file on demand
   */
  async readFileContent(book: BookItem, encoding: 'utf8' | 'base64' = 'utf8'): Promise<string> {
    const localUri = await this.ensureLocalFileUri(book);
    try {
      const content = await FileSystem.readAsStringAsync(localUri, {
        encoding: encoding === 'base64' ? FileSystem.EncodingType.Base64 : FileSystem.EncodingType.UTF8,
      });
      return content;
    } catch (e: any) {
      console.warn(`Safe readFileContent for ${book.title}:`, e?.message || e);
      throw e;
    }
  },

  /**
   * High performance document ingestion:
   * Uses copyToCacheDirectory: false to prevent memory exhaustion and disk freeze when selecting 1,000+ books.
   */
  async pickAndImportDocuments(
    onChunkProcessed?: (processedCount: number, totalCount: number) => void
  ): Promise<BookItem[]> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/epub+zip',
          'text/plain',
          'text/markdown',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/msword',
          'application/x-cbr',
          'application/x-cbz',
          '*/*',
        ],
        multiple: true,
        copyToCacheDirectory: false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return [];
      }

      const total = result.assets.length;
      const importedBooks: BookItem[] = [];

      const chunkSize = 50;
      for (let i = 0; i < total; i += chunkSize) {
        const chunk = result.assets.slice(i, i + chunkSize);

        for (const asset of chunk) {
          const filename = asset.name || 'Untitled Document';
          const { title, author } = parseBookTitleAndAuthor(filename);
          const format = getFormatFromExtension(filename);
          const gradient = getCoverGradientForTitle(title);

          const hashId = Math.abs(
            (asset.uri || filename).split('').reduce((a: number, b: string) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0)
          );

          const categoryId = TaxonomyEngine.classifyBook(title, filename, format);

          const book: BookItem = {
            id: `book_${hashId}_${Date.now() % 100000}`,
            title,
            author,
            format,
            categoryId,
            uri: asset.uri,
            filename,
            fileSize: asset.size || 0,
            dateAdded: Date.now(),
            readingProgress: 0,
            coverColor: gradient[0],
            coverGradient: gradient,
            tags: [format.toUpperCase()],
          };

          importedBooks.push(book);
        }

        if (onChunkProcessed) {
          onChunkProcessed(Math.min(i + chunkSize, total), total);
        }

        await new Promise((resolve) => setTimeout(resolve, 0));
      }

      return importedBooks;
    } catch (error) {
      console.error('Error picking documents:', error);
      throw error;
    }
  },

  /**
   * Fast device crawler
   */
  async autoScanDevice(
    onProgress?: (scannedDirs: number, foundCount: number, currentName: string) => void,
    forceNewDirectory = false
  ): Promise<BookItem[]> {
    const foundBooks: BookItem[] = [];
    let scannedDirCount = 0;

    if (Platform.OS === 'android') {
      try {
        let directoryUri: string | null = null;

        if (!forceNewDirectory) {
          directoryUri = await AsyncStorage.getItem(SAVED_SCAN_URI_KEY);
        }

        if (!directoryUri) {
          const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
          if (!permissions.granted) {
            return [];
          }
          directoryUri = permissions.directoryUri;
          await AsyncStorage.setItem(SAVED_SCAN_URI_KEY, directoryUri);
        }

        const queue: string[] = [directoryUri];
        const visited = new Set<string>();

        while (queue.length > 0) {
          const currentDirUri = queue.shift()!;
          if (visited.has(currentDirUri)) continue;
          visited.add(currentDirUri);
          scannedDirCount++;

          const currentDirName = getFilenameFromUri(currentDirUri);
          if (onProgress) {
            onProgress(scannedDirCount, foundBooks.length, currentDirName);
          }

          try {
            const contents = await FileSystem.StorageAccessFramework.readDirectoryAsync(currentDirUri);

            for (const itemUri of contents) {
              const filename = getFilenameFromUri(itemUri);
              const ext = filename.split('.').pop()?.toLowerCase() || '';

              if (itemUri.includes('%2F') && !ext) {
                queue.push(itemUri);
                continue;
              }

              if (SUPPORTED_EXTENSIONS.has(ext)) {
                const { title, author } = parseBookTitleAndAuthor(filename);
                const format = getFormatFromExtension(filename);
                const gradient = getCoverGradientForTitle(title);

                const hashId = Math.abs(
                  itemUri.split('').reduce((a: number, b: string) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0)
                );

                const categoryId = TaxonomyEngine.classifyBook(title, filename, format);

                const book: BookItem = {
                  id: `book_${hashId}`,
                  title,
                  author,
                  format,
                  categoryId,
                  uri: itemUri,
                  filename,
                  fileSize: 0,
                  dateAdded: Date.now(),
                  readingProgress: 0,
                  coverColor: gradient[0],
                  coverGradient: gradient,
                  tags: [format.toUpperCase(), 'AUTO-SCANNED'],
                };

                foundBooks.push(book);

                if (onProgress && foundBooks.length % 20 === 0) {
                  onProgress(scannedDirCount, foundBooks.length, filename);
                }
              }
            }
          } catch (dirErr) {
            console.warn(`Error reading dir ${currentDirUri}:`, dirErr);
          }
        }
      } catch (err) {
        console.error('Auto scan error on Android:', err);
        return await this.pickAndImportDocuments();
      }
    } else {
      if (FileSystem.documentDirectory) {
        try {
          const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
          for (const file of files) {
            const ext = file.split('.').pop()?.toLowerCase() || '';
            if (SUPPORTED_EXTENSIONS.has(ext)) {
              const { title, author } = parseBookTitleAndAuthor(file);
              const format = getFormatFromExtension(file);
              const gradient = getCoverGradientForTitle(title);

              foundBooks.push({
                id: `book_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                title,
                author,
                format,
                uri: `${FileSystem.documentDirectory}${file}`,
                filename: file,
                fileSize: 0,
                dateAdded: Date.now(),
                readingProgress: 0,
                coverColor: gradient[0],
                coverGradient: gradient,
                tags: [format.toUpperCase()],
              });
            }
          }
        } catch (e) {
          console.warn('Document dir scan error:', e);
        }
      }

      if (foundBooks.length === 0) {
        return await this.pickAndImportDocuments();
      }
    }

    return foundBooks;
  },

  /**
   * Share / Open file externally safely
   */
  async shareDocumentSafely(book: BookItem): Promise<void> {
    try {
      const localUri = await this.ensureLocalFileUri(book);
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable && localUri) {
        await Sharing.shareAsync(localUri, {
          dialogTitle: `Open ${book.title}`,
          mimeType: book.format === 'pdf' ? 'application/pdf' : undefined,
        });
      } else if (localUri) {
        await Linking.openURL(localUri);
      }
    } catch (e) {
      console.warn('Share document failed:', e);
    }
  },
};
