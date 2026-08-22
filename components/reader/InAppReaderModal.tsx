import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BookItem } from '../../types/book';
import { FileScannerService } from '../../services/fileScanner';
import { Palette } from '../../constants/theme';

let SafeWebView: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const webviewModule = require('react-native-webview');
  SafeWebView = webviewModule.WebView || webviewModule.default;
} catch (e) {
  console.warn('react-native-webview not loaded:', e);
}

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
  const webViewRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [themeMode, setThemeMode] = useState<'light' | 'sepia' | 'dark'>('light');
  const [fontSize, setFontSize] = useState(16);

  // PDF Paging State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isJumpModalVisible, setIsJumpModalVisible] = useState(false);
  const [jumpPageInput, setJumpPageInput] = useState('1');

  useEffect(() => {
    if (!book || !visible) return;

    setLoading(true);
    setPdfBase64(null);
    setTextContent(null);
    setCurrentPage(1);
    setTotalPages(1);

    const loadBookContent = async () => {
      try {
        if (book.format === 'txt' || book.format === 'docx') {
          try {
            const content = await FileScannerService.readFileContent(book, 'utf8');
            setTextContent(content);
          } catch {
            setTextContent(
              `Document: ${book.title}\nFilename: ${book.filename}\nAuthor: ${book.author}\n\nReading progress saved.`
            );
          }
        } else {
          try {
            const b64 = await FileScannerService.readFileContent(book, 'base64');
            setPdfBase64(b64);
          } catch (e) {
            console.warn('Could not read base64:', e);
          }
        }
      } catch (err) {
        console.error('Error opening document:', err);
      } finally {
        setLoading(false);
      }
    };

    loadBookContent();
  }, [book, visible]);

  if (!book) return null;

  const handleShare = () => {
    FileScannerService.shareDocumentSafely(book);
  };

  const handleClose = () => {
    const progress = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : (book.readingProgress || 0);
    onClose();
    onUpdateProgress(book, progress);
  };

  // Paging actions
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      const next = currentPage + 1;
      setCurrentPage(next);
      webViewRef.current?.injectJavaScript(`window.goToPage(${next}); true;`);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      const prev = currentPage - 1;
      setCurrentPage(prev);
      webViewRef.current?.injectJavaScript(`window.goToPage(${prev}); true;`);
    }
  };

  const handleJumpToPage = () => {
    const target = parseInt(jumpPageInput, 10);
    if (!isNaN(target) && target >= 1 && target <= totalPages) {
      setCurrentPage(target);
      webViewRef.current?.injectJavaScript(`window.goToPage(${target}); true;`);
      setIsJumpModalVisible(false);
    }
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'TOTAL_PAGES') {
        setTotalPages(data.count);
        if (book.readingProgress && book.readingProgress > 0) {
          const startPage = Math.max(1, Math.min(data.count, Math.round((book.readingProgress / 100) * data.count)));
          setCurrentPage(startPage);
          webViewRef.current?.injectJavaScript(`window.goToPage(${startPage}); true;`);
        }
      } else if (data.type === 'PAGE_CHANGED') {
        setCurrentPage(data.page);
        onUpdateProgress(book, Math.round((data.page / totalPages) * 100));
      }
    } catch {
      // ignore
    }
  };

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

  // High-performance centered PDF reader with swipe gesture support
  const pdfViewerHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=3.0, user-scalable=yes">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          html, body {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            background-color: ${themeMode === 'dark' ? '#0F172A' : '#F1F5F9'};
            color: ${themeMode === 'dark' ? '#F8FAFC' : '#0F172A'};
            display: flex;
            flex-direction: column;
            align-items: center;
            justifyContent: center;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            touch-action: pan-y pinch-zoom;
          }
          #pdf-wrapper {
            flex: 1;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justifyContent: center;
            padding: 8px;
            box-sizing: border-box;
            position: relative;
          }
          #pdf-canvas {
            display: block;
            margin: auto;
            max-width: 98vw;
            max-height: 96vh;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.18);
            background: #FFFFFF;
          }
          #status-msg {
            position: absolute;
            font-size: 14px;
            font-weight: 700;
            color: #6366F1;
            padding: 12px;
            text-align: center;
            z-index: 10;
          }
        </style>
      </head>
      <body>
        <div id="status-msg">Loading Document...</div>
        <div id="pdf-wrapper">
          <canvas id="pdf-canvas"></canvas>
        </div>

        <script>
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

          var pdfDoc = null;
          var currentPageNum = 1;
          var currentRenderTask = null;
          var isRendering = false;

          function sendMsg(data) {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify(data));
            }
          }

          function decodeBase64ToUint8(base64) {
            var raw = atob(base64);
            var rawLen = raw.length;
            var array = new Uint8Array(new ArrayBuffer(rawLen));
            for (var i = 0; i < rawLen; i++) {
              array[i] = raw.charCodeAt(i);
            }
            return array;
          }

          function renderPage(num) {
            if (!pdfDoc) return;
            if (currentRenderTask) {
              try {
                currentRenderTask.cancel();
              } catch (e) {}
            }
            isRendering = true;
            currentPageNum = num;

            pdfDoc.getPage(num).then(function(page) {
              var canvas = document.getElementById('pdf-canvas');
              var ctx = canvas.getContext('2d');

              var unscaledViewport = page.getViewport({ scale: 1.0 });
              var availWidth = window.innerWidth - 16;
              var availHeight = window.innerHeight - 16;
              var scaleX = availWidth / unscaledViewport.width;
              var scaleY = availHeight / unscaledViewport.height;
              var fitScale = Math.min(scaleX, scaleY);
              var viewport = page.getViewport({ scale: Math.max(fitScale, 1.2) });

              canvas.height = viewport.height;
              canvas.width = viewport.width;

              var renderContext = {
                canvasContext: ctx,
                viewport: viewport
              };

              currentRenderTask = page.render(renderContext);
              currentRenderTask.promise.then(function() {
                isRendering = false;
                document.getElementById('status-msg').style.display = 'none';
                page.cleanup();
                sendMsg({ type: 'PAGE_CHANGED', page: num });
              }).catch(function(err) {
                if (err && err.name !== 'RenderingCancelledException') {
                  console.error('Render error:', err);
                }
                isRendering = false;
              });
            }).catch(function(err) {
              isRendering = false;
              console.error('GetPage error:', err);
            });
          }

          window.goToPage = function(num) {
            if (pdfDoc && num >= 1 && num <= pdfDoc.numPages) {
              renderPage(num);
            }
          };

          // Swipe gestures for seamless page turns
          var startX = 0;
          var startY = 0;
          var endX = 0;
          var endY = 0;

          document.addEventListener('touchstart', function(e) {
            if (e.touches && e.touches.length === 1) {
              startX = e.touches[0].screenX;
              startY = e.touches[0].screenY;
            }
          }, { passive: true });

          document.addEventListener('touchend', function(e) {
            if (e.changedTouches && e.changedTouches.length === 1) {
              endX = e.changedTouches[0].screenX;
              endY = e.changedTouches[0].screenY;
              var deltaX = endX - startX;
              var deltaY = endY - startY;

              if (Math.abs(deltaX) > Math.abs(deltaY) * 1.3 && Math.abs(deltaX) > 40) {
                if (deltaX < 0) {
                  // Swipe Left -> Next Page
                  if (pdfDoc && currentPageNum < pdfDoc.numPages) {
                    renderPage(currentPageNum + 1);
                  }
                } else {
                  // Swipe Right -> Prev Page
                  if (pdfDoc && currentPageNum > 1) {
                    renderPage(currentPageNum - 1);
                  }
                }
              }
            }
          }, { passive: true });

          try {
            var b64Data = "${pdfBase64 || ''}";
            if (b64Data && b64Data.length > 0) {
              var typedArray = decodeBase64ToUint8(b64Data);
              pdfjsLib.getDocument({ data: typedArray, cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/', cMapPacked: true }).promise.then(function(pdf) {
                pdfDoc = pdf;
                sendMsg({ type: 'TOTAL_PAGES', count: pdf.numPages });
                renderPage(1);
              }).catch(function(err) {
                document.getElementById('status-msg').innerText = 'Failed to load PDF: ' + err.message;
              });
            } else {
              document.getElementById('status-msg').innerText = 'Ready for reading.';
            }
          } catch (e) {
            document.getElementById('status-msg').innerText = 'Error initializing reader: ' + e.message;
          }
        </script>
      </body>
    </html>
  `;

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

        {/* Reader Body */}
        <View style={styles.readerBody}>
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
          ) : SafeWebView ? (
            <SafeWebView
              ref={webViewRef}
              originWhitelist={['*']}
              source={{ html: pdfViewerHtml }}
              style={[styles.webView, { backgroundColor: currentTheme.bg }]}
              allowFileAccess={true}
              scalesPageToFit={true}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              onMessage={handleWebViewMessage}
            />
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

        {/* Recycler-Style Bottom Navigation Bar */}
        {pdfBase64 && totalPages > 1 && (
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
  webView: {
    flex: 1,
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
