import React from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { TabletNavRail } from './TabletNavRail';
import { BookInspector } from './BookInspector';
import { useLibrary } from '../../context/LibraryContext';
import { Palette } from '../../constants/theme';

interface TabletSplitLayoutProps {
  children: React.ReactNode;
}

export const TabletSplitLayout: React.FC<TabletSplitLayoutProps> = ({ children }) => {
  const { isTablet, inspectorWidth } = useResponsiveLayout();
  const {
    books,
    selectedBook,
    categories,
    setSelectedBook,
    updateBook,
    deleteBook,
    openBookFile,
    scanDevice,
  } = useLibrary();

  return (
    <View style={styles.rootContainer}>
      {/* 1. Left Tablet Navigation Rail (Only on Tablets) */}
      {isTablet && (
        <TabletNavRail
          onScanDevice={() => scanDevice(false)}
          totalBooks={books.length}
        />
      )}

      {/* 2. Main Content Area */}
      <View style={styles.mainContent}>{children}</View>

      {/* 3. Right Book Details Inspector */}
      {isTablet ? (
        selectedBook && (
          <View style={[styles.tabletInspectorWrapper, { width: inspectorWidth }]}>
            <BookInspector
              book={selectedBook}
              categories={categories}
              onClose={() => setSelectedBook(null)}
              onUpdateBook={updateBook}
              onDeleteBook={deleteBook}
              onOpenBook={openBookFile}
              isTablet={true}
            />
          </View>
        )
      ) : (
        /* Mobile Inspector Bottom Sheet Modal */
        <Modal
          visible={Boolean(selectedBook)}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setSelectedBook(null)}
        >
          <View style={styles.mobileModalContainer}>
            <BookInspector
              book={selectedBook}
              categories={categories}
              onClose={() => setSelectedBook(null)}
              onUpdateBook={updateBook}
              onDeleteBook={deleteBook}
              onOpenBook={openBookFile}
              isTablet={false}
            />
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Palette.bg,
  },
  mainContent: {
    flex: 1,
    height: '100%',
    overflow: 'hidden',
  },
  tabletInspectorWrapper: {
    height: '100%',
    borderLeftWidth: 1,
    borderColor: Palette.border,
  },
  mobileModalContainer: {
    flex: 1,
    backgroundColor: Palette.surface,
  },
});
