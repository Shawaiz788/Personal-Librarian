import React, { useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLibrary } from '../../context/LibraryContext';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { TabletSplitLayout } from '../../components/tablet/TabletSplitLayout';
import { LibraryHeader } from '../../components/library/LibraryHeader';
import { FilterChipGroup } from '../../components/search/FilterChipGroup';
import { BookCard } from '../../components/library/BookCard';
import { BookshelfRow } from '../../components/library/BookshelfRow';
import { BookListItem } from '../../components/library/BookListItem';
import { EmptyState } from '../../components/common/EmptyState';
import { ScanProgressModal } from '../../components/library/ScanProgressModal';
import { SearchEngineService } from '../../services/searchEngine';
import { Palette } from '../../constants/theme';
import { BookItem } from '../../types/book';

export default function LibraryScreen() {
  const {
    books,
    filteredBooks,
    categories,
    filter,
    setFilter,
    viewMode,
    setViewMode,
    selectedBook,
    setSelectedBook,
    scanDevice,
    importDocuments,
    openBookFile,
    isScanning,
    scanProgress,
  } = useLibrary();

  const { isTablet, numColumns } = useResponsiveLayout();

  const formatCounts = useMemo(() => {
    return SearchEngineService.getFormatCounts(books);
  }, [books]);

  // Group books by category for the Shelf View mode
  const shelfCategories = useMemo(() => {
    const groups: { title: string; books: BookItem[] }[] = [];

    // Recently added shelf
    const recent = [...filteredBooks].sort((a, b) => b.dateAdded - a.dateAdded).slice(0, 10);
    if (recent.length > 0) {
      groups.push({ title: 'Recently Added & Opened', books: recent });
    }

    // By format/category
    for (const cat of categories) {
      const inCat = filteredBooks.filter((b) => b.categoryId === cat.id);
      if (inCat.length > 0) {
        groups.push({ title: cat.name, books: inCat });
      }
    }

    // Uncategorized
    const uncategorized = filteredBooks.filter((b) => !b.categoryId);
    if (uncategorized.length > 0 && groups.length > 1) {
      groups.push({ title: 'Uncategorized Documents', books: uncategorized });
    }

    return groups;
  }, [filteredBooks, categories]);

  const handleResetFilters = () => {
    setFilter({
      query: '',
      categoryId: 'all',
      format: 'all',
      readingStatus: 'all',
      sortBy: 'date-desc',
    });
  };

  return (
    <TabletSplitLayout>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" />

        {/* Library Header */}
        <LibraryHeader
          searchQuery={filter.query}
          onSearchChange={(q) => setFilter((prev) => ({ ...prev, query: q }))}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onScanDevice={() => scanDevice(false)}
          onImport={importDocuments}
          isScanning={isScanning}
          totalBooks={books.length}
          filteredCount={filteredBooks.length}
          currentSort={filter.sortBy}
          onSelectSort={(sort) => setFilter((prev) => ({ ...prev, sortBy: sort }))}
          isTablet={isTablet}
        />

        {/* Horizontal Filters Bar */}
        {books.length > 0 && (
          <FilterChipGroup
            filter={filter}
            onFilterChange={(upd) => setFilter((prev) => ({ ...prev, ...upd }))}
            categories={categories}
            formatCounts={formatCounts}
            onResetFilters={handleResetFilters}
          />
        )}

        {/* Main Content Area */}
        {books.length === 0 ? (
          <EmptyState
            title="Scan Your Device for Books & PDFs"
            description="Automatically search your device folders to find all PDFs, EPUBs, documents, and eBooks without picking files manually."
            actionLabel="Scan My Device"
            onAction={() => scanDevice(false)}
            secondaryActionLabel="Pick Specific Files"
            onSecondaryAction={importDocuments}
            isLoading={isScanning}
            iconName="scan-circle-outline"
          />
        ) : filteredBooks.length === 0 ? (
          <EmptyState
            title="No Matching Books Found"
            description={`No books matched your query "${filter.query}" with the active filters.`}
            actionLabel="Reset Search & Filters"
            onAction={handleResetFilters}
            secondaryActionLabel="Scan More Folders"
            onSecondaryAction={() => scanDevice(true)}
            iconName="search"
          />
        ) : viewMode === 'grid' ? (
          /* Responsive Multi-Column Grid View */
          <FlatList
            key={`grid_${numColumns}`}
            data={filteredBooks}
            numColumns={numColumns}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={{ flex: 1 / numColumns }}>
                <BookCard
                  book={item}
                  onPress={setSelectedBook}
                  isSelected={selectedBook?.id === item.id}
                />
              </View>
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : viewMode === 'shelf' ? (
          /* Realistic Bookshelf Row View */
          <ScrollView
            contentContainerStyle={styles.shelfScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {shelfCategories.map((group, index) => (
              <BookshelfRow
                key={`${group.title}_${index}`}
                shelfTitle={group.title}
                books={group.books}
                onSelectBook={setSelectedBook}
                selectedBookId={selectedBook?.id}
              />
            ))}
          </ScrollView>
        ) : (
          /* Compact Dense List View */
          <FlatList
            data={filteredBooks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <BookListItem
                book={item}
                onPress={setSelectedBook}
                onOpen={openBookFile}
                isSelected={selectedBook?.id === item.id}
              />
            )}
            contentContainerStyle={styles.denseListContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Live Auto-Scan Progress Modal */}
        <ScanProgressModal
          visible={isScanning}
          scannedDirs={scanProgress.scannedDirs}
          foundCount={scanProgress.foundCount}
          currentName={scanProgress.currentName}
        />
      </SafeAreaView>
    </TabletSplitLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.bg,
  },
  listContent: {
    padding: 8,
    paddingBottom: 40,
  },
  shelfScrollContent: {
    paddingVertical: 12,
    paddingBottom: 50,
  },
  denseListContent: {
    paddingVertical: 8,
    paddingBottom: 40,
  },
});
