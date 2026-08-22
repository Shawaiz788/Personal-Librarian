import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BookItem } from '../../types/book';
import { FileScannerService } from '../../services/fileScanner';
import { Palette } from '../../constants/theme';

// Safely resolve WebView component without crashing if native module is not registered yet
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
  const [loading, setLoading] = useState(true);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [themeMode, setThemeMode] = useState<'light' | 'sepia' | 'dark'>('light');
  const [fontSize, setFontSize] = useState(16);
  const [currentProgress, setCurrentProgress] = useState(book?.readingProgress || 0);

  useEffect(() => {
    if (!book || !visible) return;

    setCurrentProgress(book.readingProgress || 0);
    setLoading(true);
    setPdfBase64(null);
    setTextContent(null);

    const loadBookContent = async () => {
      try {
        if (book.format === 'txt' || book.format === 'docx') {
          try {
            const content = await FileScannerService.readFileContent(book, 'utf8');
            setTextContent(content);
          } catch {
            setTextContent(`Document: ${book.title}\nFilename: ${book.filename}\nAuthor: ${book.author}\n\nReading progress saved.`);
          }
        } else {
          try {
            const b64 = await FileScannerService.readFileContent(book, 'base64');
            setPdfBase64(b64);
          } catch (e) {
            console.warn('Could not read base64, will use file preview:', e);
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

  const handleProgressTap = (val: number) => {
    setCurrentProgress(val);
    onUpdateProgress(book, val);
  };

  const handleClose = () => {
    onUpdateProgress(book, currentProgress);
    onClose();
  };

  const getReaderColors = () => {
    switch (themeMode) {
      case 'sepia':
        return { bg: '#F8F1E5', text: '#5F4B32', border: '#EBDDC7', headerBg: '#EFE5D3' };
      case 'dark':
        return { bg: '#121824', text: '#E2E8F0', border: '#1E293B', headerBg: '#0F172A' };
      default:
        return { bg: '#FFFFFF', text: '#1E293B', border: '#E2E8F0', headerBg: '#FFFFFF' };
    }
  };

  const currentTheme = getReaderColors();

  // Embedded PDF Viewer with PDF.js
  const pdfViewerHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=3.0, user-scalable=yes">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            background-color: ${themeMode === 'dark' ? '#0F172A' : '#F1F5F9'};
            color: ${themeMode === 'dark' ? '#F8FAFC' : '#0F172A'};
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 12px 6px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          #pdf-container {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 14px;
          }
          .pdf-page-canvas {
            max-width: 100%;
            height: auto;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.12);
            background: #FFFFFF;
          }
          #loading-status {
            padding: 24px;
            font-size: 14px;
            font-weight: 600;
            color: #6366F1;
          }
        </style>
      </head>
      <body>
        <div id="loading-status">Loading PDF Pages...</div>
        <div id="pdf-container"></div>

        <script>
          const pdfData = "${pdfBase64 || ''}";
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

          if (pdfData) {
            const rawData = atob(pdfData);
            const uint8Array = new Uint8Array(rawData.length);
            for (let i = 0; i < rawData.length; i++) {
              uint8Array[i] = rawData.charCodeAt(i);
            }

            pdfjsLib.getDocument({ data: uint8Array }).promise.then(async (pdf) => {
              document.getElementById('loading-status').style.display = 'none';
              const container = document.getElementById('pdf-container');
              
              for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const viewport = page.getViewport({ scale: 1.5 });
                
                const canvas = document.createElement('canvas');
                canvas.className = 'pdf-page-canvas';
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                
                container.appendChild(canvas);
                
                await page.render({
                  canvasContext: context,
                  viewport: viewport
                }).promise;
              }
            }).catch(err => {
              document.getElementById('loading-status').innerText = 'Rendering PDF... Tap share to open externally if needed.';
            });
          } else {
            document.getElementById('loading-status').innerText = 'Document ready for reading.';
          }
        </script>
      </body>
    </html>
  `;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={handleClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.bg }]} edges={['top', 'bottom']}>
        {/* Top Reader Navigation Bar */}
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
              originWhitelist={['*']}
              source={{ html: pdfViewerHtml }}
              style={[styles.webView, { backgroundColor: currentTheme.bg }]}
              allowFileAccess={true}
              scalesPageToFit={true}
              javaScriptEnabled={true}
              domStorageEnabled={true}
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

        {/* Bottom Reading Progress Bar */}
        <View style={[styles.footer, { backgroundColor: currentTheme.headerBg, borderColor: currentTheme.border }]}>
          <Text style={[styles.progressLabel, { color: currentTheme.text }]}>
            Reading Progress: {Math.round(currentProgress)}%
          </Text>
          <View style={styles.progressBtnRow}>
            {[0, 25, 50, 75, 100].map((val) => (
              <TouchableOpacity
                key={val}
                style={[
                  styles.progressPill,
                  currentProgress === val && styles.progressPillActive,
                ]}
                onPress={() => handleProgressTap(val)}
              >
                <Text
                  style={[
                    styles.progressPillText,
                    currentProgress === val && styles.progressPillTextActive,
                  ]}
                >
                  {val === 0 ? 'Start' : val === 100 ? 'Finish' : `${val}%`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
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
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressBtnRow: {
    flexDirection: 'row',
    gap: 6,
  },
  progressPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  progressPillActive: {
    backgroundColor: Palette.primary,
  },
  progressPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.textMuted,
  },
  progressPillTextActive: {
    color: '#FFF',
  },
});
