import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Image,
  Dimensions,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BookItem } from '../../types/book';
import { FileScannerService } from '../../services/fileScanner';
import { NativePdfRendererService, PdfDocumentInfo } from '../../services/nativePdfRenderer';
import { Palette } from '../../constants/theme';

interface InAppReaderModalProps {
  book: BookItem | null;
  visible: boolean;
  onClose: () => void;
  onUpdateProgress: (book: BookItem, progress: number) => void;
}

export const InAppReaderModal: React.FC<InAppReaderModalProps> = ({
  book,
  visible,
  onClose,
  onUpdateProgress,
}) => {
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [pdfInfo, setPdfInfo] = useState<PdfDocumentInfo | null>(null);
  const [currentPageUri, setCurrentPageUri] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [themeMode, setThemeMode] = useState<'light' | 'sepia' | 'dark'>('light');
  const [fontSize, setFontSize] = useState(16);

  // PDF Paging State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isJumpModalVisible, setIsJumpModalVisible] = useState(false);
  const [jumpPageInput, setJumpPageInput] = useState('1');

  const layoutRef = useRef({
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  });

  const activeDocIdRef = useRef<string | null>(null);
  const isNavigatingRef = useRef(false);

  // Render a specific page via native Android PdfRenderer
  const renderNativePage = useCallback(
    async (docId: string, pageNum: number) => {
      try {
        setPageLoading(true);
        const pageIndex = Math.max(0, pageNum - 1);
        const { width, height } = layoutRef.current;
        const rendered = await NativePdfRendererService.renderPage(
          docId,
          pageIndex,
          Math.round(width * 1.5),
          Math.round(height * 1.5)
        );
        setCurrentPageUri(rendered.uri);

        // Preload next page into native LRU cache in background
        if (pageNum < totalPages && NativePdfRendererService.isAvailable()) {
          NativePdfRendererService.renderPage(
            docId,
            pageNum,
            Math.round(width * 1.5),
            Math.round(height * 1.5)
          ).catch(() => {});
        }
      } catch (err) {
        console.warn('Native renderPage error:', err);
      } finally {
        setPageLoading(false);
      }
    },
    [totalPages]
  );

  // Load document lifecycle - strictly triggered ONLY when book or visible changes
  useEffect(() => {
    if (!book || !visible) return;

    let isMounted = true;
    setLoading(true);
    setPdfInfo(null);
    setCurrentPageUri(null);
    setTextContent(null);
    setCurrentPage(1);
    setTotalPages(1);

    const loadDocument = async () => {
      try {
        if (!book) return;

        if (book.format === 'txt' || book.format === 'docx') {
          try {
            const content = await FileScannerService.readFileContent(book, 'utf8');
            if (isMounted) setTextContent(content);
          } catch {
            if (isMounted) {
              setTextContent(
                `Document: ${book.title}\nFilename: ${book.filename}\nAuthor: ${book.author}\n\nReading progress saved.`
              );
            }
          }
        } else if (NativePdfRendererService.isAvailable()) {
          // Native Android PdfRenderer API
          const localUri = await FileScannerService.ensureLocalFileUri(book);
          const info = await NativePdfRendererService.openDocument(localUri);

          if (!isMounted) {
            NativePdfRendererService.closeDocument(info.documentId).catch(() => {});
            return;
          }

          setPdfInfo(info);
          setTotalPages(info.pageCount);
          activeDocIdRef.current = info.documentId;

          // Initial start page based on reading progress
          let startPage = 1;
          if (book.readingProgress && book.readingProgress > 0 && info.pageCount > 0) {
            startPage = Math.max(1, Math.min(info.pageCount, Math.round((book.readingProgress / 100) * info.pageCount)));
          }
          setCurrentPage(startPage);

          await renderNativePage(info.documentId, startPage);
        } else {
          console.warn('Native PDF Renderer not available on this platform.');
        }
      } catch (err) {
        console.error('Error opening document:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDocument();

    return () => {
      isMounted = false;
      if (activeDocIdRef.current) {
        const idToClose = activeDocIdRef.current;
        activeDocIdRef.current = null;
        NativePdfRendererService.closeDocument(idToClose).catch(() => {});
      }
    };
  }, [book, visible, renderNativePage]);

  const handleShare = () => {
    if (book) FileScannerService.shareDocumentSafely(book);
  };

  const handleClose = () => {
    const progress = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : (book?.readingProgress || 0);
    onClose();
    if (activeDocIdRef.current) {
      const idToClose = activeDocIdRef.current;
      activeDocIdRef.current = null;
      NativePdfRendererService.closeDocument(idToClose).catch(() => {});
    }
    if (book) onUpdateProgress(book, progress);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages && pdfInfo && !isNavigatingRef.current) {
      isNavigatingRef.current = true;
      const next = currentPage + 1;
      setCurrentPage(next);
      renderNativePage(pdfInfo.documentId, next).finally(() => {
        isNavigatingRef.current = false;
      });
      if (book) onUpdateProgress(book, Math.round((next / totalPages) * 100));
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1 && pdfInfo && !isNavigatingRef.current) {
      isNavigatingRef.current = true;
      const prev = currentPage - 1;
      setCurrentPage(prev);
      renderNativePage(pdfInfo.documentId, prev).finally(() => {
        isNavigatingRef.current = false;
      });
      if (book) onUpdateProgress(book, Math.round((prev / totalPages) * 100));
    }
  };

  const handleJumpToPage = () => {
    const target = parseInt(jumpPageInput, 10);
    if (!isNaN(target) && target >= 1 && target <= totalPages && pdfInfo) {
      setCurrentPage(target);
      renderNativePage(pdfInfo.documentId, target);
      if (book) onUpdateProgress(book, Math.round((target / totalPages) * 100));
      setIsJumpModalVisible(false);
    }
  };

  // Swipe gesture detector for smooth hardware page flipping
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 30 && Math.abs(gestureState.dy) < 60;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -50) {
          goToNextPage();
        } else if (gestureState.dx > 50) {
          goToPrevPage();
        }
      },
    })
  ).current;

  const getReaderColors = () => {
    switch (themeMode) {
      case 'sepia':
        return { bg: '#F8F1E5', text: '#5F4B32', border: '#EBDDC7', headerBg: '#EFE5D3' };
      case 'dark':
        return { bg: '#0F172A', text: '#E2E8F0', border: '#1E293B', headerBg: '#0F172A' };
      default:
        return { bg: '#F8FAFC', text: '#1E293B', border: '#E2E8F0', headerBg: '#FFFFFF' };
    }
  };

  const currentTheme = getReaderColors();

  if (!book || !visible) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={handleClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.bg }]} edges={['top', 'bottom']}>
        {/* Top Navigation Bar */}
        <View style={[styles.header, { backgroundColor: currentTheme.headerBg, borderColor: currentTheme.border }]}>
          <TouchableOpacity onPress={handleClose} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={24} color={currentTheme.text} />
            <Text style={[styles.backText, { color: currentTheme.text }]}>Library</Text>
          </TouchableOpacity>

          <View style={styles.titleWrapper}>
            <Text style={[styles.headerTitle, { color: currentTheme.text }]} numberOfLines={1}>
              {book.title}
            </Text>
            <Text style={[styles.headerAuthor, { color: Palette.textMuted }]} numberOfLines={1}>
              {book.author} • {book.format.toUpperCase()}
            </Text>
          </View>

          <View style={styles.headerControls}>
            <TouchableOpacity
              style={styles.controlIconBtn}
              onPress={() =>
                setThemeMode((prev) => (prev === 'light' ? 'sepia' : prev === 'sepia' ? 'dark' : 'light'))
              }
            >
              <Ionicons
                name={themeMode === 'dark' ? 'moon' : themeMode === 'sepia' ? 'sunny' : 'partly-sunny-outline'}
                size={20}
                color={Palette.primary}
              />
            </TouchableOpacity>

            {textContent && (
              <View style={styles.fontControls}>
                <TouchableOpacity
                  onPress={() => setFontSize((s) => Math.max(12, s - 2))}
                  style={styles.fontBtn}
                >
                  <Text style={[styles.fontBtnText, { color: currentTheme.text }]}>A-</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setFontSize((s) => Math.min(32, s + 2))}
                  style={styles.fontBtn}
                >
                  <Text style={[styles.fontBtnText, { color: currentTheme.text }]}>A+</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity style={styles.controlIconBtn} onPress={handleShare}>
              <Ionicons name="share-outline" size={20} color={Palette.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Reader Document Body */}
        <View
          style={styles.readerBody}
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            if (width > 0 && height > 0) {
              layoutRef.current = { width, height };
            }
          }}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Palette.primary} />
              <Text style={[styles.loadingText, { color: currentTheme.text }]}>
                Opening {book.title}...
              </Text>
            </View>
          ) : textContent ? (
            <ScrollView
              contentContainerStyle={styles.textScrollContent}
              showsVerticalScrollIndicator={true}
            >
              <Text
                style={[
                  styles.textContent,
                  {
                    color: currentTheme.text,
                    fontSize,
                    lineHeight: fontSize * 1.6,
                  },
                ]}
              >
                {textContent}
              </Text>
            </ScrollView>
          ) : currentPageUri ? (
            /* Native Hardware-Accelerated Pager */
            <View style={styles.pageContainer} {...panResponder.panHandlers}>
              <Image
                key={currentPageUri}
                source={{ uri: currentPageUri }}
                style={styles.nativePageImage}
                resizeMode="contain"
              />
              {pageLoading && (
                <View style={styles.pageLoaderOverlay}>
                  <ActivityIndicator size="small" color={Palette.primary} />
                </View>
              )}
            </View>
          ) : (
            <View style={styles.fallbackContainer}>
              <Ionicons name="document-text-outline" size={64} color={Palette.primary} />
              <Text style={[styles.fallbackTitle, { color: currentTheme.text }]}>{book.title}</Text>
              <Text style={styles.fallbackSub}>{book.author} • {book.format.toUpperCase()}</Text>
              <TouchableOpacity style={styles.openExternalBtn} onPress={handleShare}>
                <Ionicons name="open-outline" size={18} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.openExternalText}>Open in System Reader</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Bottom Paging Bar */}
        {totalPages > 1 && (
          <View style={[styles.pagingBar, { backgroundColor: currentTheme.headerBg, borderColor: currentTheme.border }]}>
            {/* Previous Page Button */}
            <TouchableOpacity
              style={[styles.pageBtn, currentPage <= 1 && styles.pageBtnDisabled]}
              onPress={goToPrevPage}
              disabled={currentPage <= 1}
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-back" size={18} color={currentPage <= 1 ? Palette.textDim : '#FFF'} />
              <Text style={[styles.pageBtnText, currentPage <= 1 && { color: Palette.textDim }]}>Previous</Text>
            </TouchableOpacity>

            {/* Page Jump Badge */}
            <TouchableOpacity
              style={styles.pageJumpBadge}
              onPress={() => {
                setJumpPageInput(String(currentPage));
                setIsJumpModalVisible(true);
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.pageCounterText, { color: currentTheme.text }]}>
                Page <Text style={styles.pageHighlight}>{currentPage}</Text> of {totalPages}
              </Text>
              <Ionicons name="search" size={12} color={Palette.primary} style={{ marginLeft: 4 }} />
            </TouchableOpacity>

            {/* Next Page Button */}
            <TouchableOpacity
              style={[styles.pageBtn, currentPage >= totalPages && styles.pageBtnDisabled]}
              onPress={goToNextPage}
              disabled={currentPage >= totalPages}
              activeOpacity={0.8}
            >
              <Text style={[styles.pageBtnText, currentPage >= totalPages && { color: Palette.textDim }]}>Next</Text>
              <Ionicons name="chevron-forward" size={18} color={currentPage >= totalPages ? Palette.textDim : '#FFF'} />
            </TouchableOpacity>
          </View>
        )}

        {/* Page Jump Modal */}
        <Modal
          visible={isJumpModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setIsJumpModalVisible(false)}
        >
          <View style={styles.jumpModalOverlay}>
            <View style={styles.jumpModalCard}>
              <Text style={styles.jumpModalTitle}>Jump to Page</Text>
              <Text style={styles.jumpModalSub}>Enter page number between 1 and {totalPages}:</Text>

              <TextInput
                style={styles.jumpInput}
                keyboardType="numeric"
                value={jumpPageInput}
                onChangeText={setJumpPageInput}
                autoFocus
              />

              <View style={styles.jumpActions}>
                <TouchableOpacity
                  style={styles.jumpCancelBtn}
                  onPress={() => setIsJumpModalVisible(false)}
                >
                  <Text style={styles.jumpCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.jumpConfirmBtn} onPress={handleJumpToPage}>
                  <Text style={styles.jumpConfirmText}>Go to Page</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 2,
  },
  titleWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  headerAuthor: {
    fontSize: 12,
    marginTop: 2,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  controlIconBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  fontControls: {
    flexDirection: 'row',
    gap: 4,
  },
  fontBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  fontBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  readerBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    padding: 8,
  },
  nativePageImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  pageLoaderOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    padding: 8,
    borderRadius: 20,
    elevation: 3,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 16,
  },
  textScrollContent: {
    padding: 24,
    paddingBottom: 60,
  },
  textContent: {
    fontFamily: 'serif',
  },
  fallbackContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  fallbackTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 16,
    textAlign: 'center',
  },
  fallbackSub: {
    fontSize: 13,
    color: Palette.textMuted,
    marginTop: 4,
    marginBottom: 24,
  },
  openExternalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  openExternalText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  pagingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  pageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  pageBtnDisabled: {
    backgroundColor: Palette.bg,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  pageBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  pageJumpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  pageCounterText: {
    fontSize: 13,
    fontWeight: '600',
  },
  pageHighlight: {
    color: Palette.primary,
    fontWeight: '800',
  },
  jumpModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  jumpModalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: Palette.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  jumpModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.text,
  },
  jumpModalSub: {
    fontSize: 12,
    color: Palette.textMuted,
    marginTop: 4,
    marginBottom: 16,
  },
  jumpInput: {
    backgroundColor: Palette.bg,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 18,
    fontWeight: '800',
    color: Palette.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  jumpActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  jumpCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  jumpCancelText: {
    color: Palette.textMuted,
    fontWeight: '600',
  },
  jumpConfirmBtn: {
    backgroundColor: Palette.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  jumpConfirmText: {
    color: '#FFF',
    fontWeight: '700',
  },
});
