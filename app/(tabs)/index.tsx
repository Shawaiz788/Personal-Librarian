import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
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
import { ScanDialogModal } from '../../components/library/ScanDialogModal';
import { SearchEngineService } from '../../services/searchEngine';
import { TaxonomyEngine } from '../../services/taxonomyEngine';
import { Palette } from '../../constants/theme';

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
  const [showScanDialog, setShowScanDialog] = useState(false);

  const formatCounts = useMemo(() => {
    return SearchEngineService.getFormatCounts(books);
  }, [books]);

  // Last read active book for Hero card
  const lastReadBook = useMemo(() => {
    const reading = books.filter((b) => (b.readingProgress && b.readingProgress > 0) || b.lastReadDate);
    if (reading.length > 0) {
      return [...reading].sort((a, b) => (b.lastReadDate || 0) - (a.lastReadDate || 0))[0];
    }
    return books.length > 0 ? books[0] : null;
  }, [books]);

  // Dynamic shelves strictly based on the categories of books we got
  const dynamicShelves = useMemo(() => {
    return TaxonomyEngine.groupBooksByDynamicShelves(filteredBooks);
  }, [filteredBooks]);

  const handleResetFilters = () => {
    setFilter({
      query: '',
      categoryId: 'all',
      format: 'all',
      readingStatus: 'all',
      sortBy: 'date-desc',
    });
  };

  const renderHeroBanner = () => {
    if (!lastReadBook || filter.query || filter.categoryId !== 'all') return null;

    return (
      <View style={styles.heroContainer}>
        <View style={[styles.heroCard, { borderColor: Palette.border }]}>
          <View
            style={[
              styles.heroCover,
              { backgroundColor: lastReadBook.coverGradient?.[0] || Palette.primary },
            ]}
          >
            <Ionicons name="book" size={28} color="#FFF" />
          </View>

          <View style={styles.heroDetails}>
            <Text style={styles.heroBadge}>CURRENTLY READING</Text>
            <Text style={styles.heroTitle} numberOfLines={1}>
              {lastReadBook.title}
            </Text>
            <Text style={styles.heroAuthor} numberOfLines={1}>
              {lastReadBook.author} • {lastReadBook.format.toUpperCase()}
            </Text>

            {/* Progress indicator */}
            <View style={styles.heroProgressRow}>
              <View style={styles.heroProgressBar}>
                <View
                  style={[
                    styles.heroProgressFill,
                    { width: `${Math.max(lastReadBook.readingProgress || 0, 5)}%` },
                  ]}
                />
              </View>
              <Text style={styles.heroProgressText}>
                {Math.round(lastReadBook.readingProgress || 0)}%
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.heroResumeBtn}
            onPress={() => openBookFile(lastReadBook)}
            activeOpacity={0.85}
          >
            <Ionicons name="play" size={16} color="#FFF" />
            <Text style={styles.heroResumeText}>Resume</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
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
          onScanDevice={() => setShowScanDialog(true)}
          onImport={importDocuments}
          isScanning={isScanning}
          totalBooks={books.length}
          filteredCount={filteredBooks.length}
          currentSort={filter.sortBy}
          onSelectSort={(sort) => setFilter((prev) => ({ ...prev, sortBy: sort }))}
          isTablet={isTablet}
        />

        {/* Dynamic Category Chips Bar (Based only on books you got) */}
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
            description="Search your device storage or Downloads folder to find all PDFs, EPUBs, documents, and eBooks."
            actionLabel="Scan Books & PDFs"
            onAction={() => setShowScanDialog(true)}
            secondaryActionLabel="Select Files"
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
            onSecondaryAction={() => setShowScanDialog(true)}
            iconName="search"
          />
        ) : viewMode === 'shelf' ? (
          /* Dynamic Category Shelf Mode */
          <ScrollView
            contentContainerStyle={styles.shelfScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {renderHeroBanner()}
            {dynamicShelves.map((shelf) => (
              <BookshelfRow
                key={shelf.id}
                shelfTitle={`${shelf.title} (${shelf.books.length})`}
                books={shelf.books}
                onSelectBook={setSelectedBook}
                selectedBookId={selectedBook?.id}
              />
            ))}
          </ScrollView>
        ) : viewMode === 'grid' ? (
          /* Grid View Mode with Hero Banner */
          <FlatList
            key={`grid_${numColumns}`}
            data={filteredBooks}
            numColumns={numColumns}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={renderHeroBanner}
            renderItem={({ item }) => (
              <View style={{ flex: 1 / numColumns }}>
                <BookCard
                  book={item}
                  onPress={setSelectedBook}
                  isSelected={selectedBook?.id === item.id}
                />
              </View>
            )}
            initialNumToRender={12}
            maxToRenderPerBatch={12}
            windowSize={5}
            removeClippedSubviews={true}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          /* List View Mode */
          <FlatList
            data={filteredBooks}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={renderHeroBanner}
            renderItem={({ item }) => (
              <BookListItem
                book={item}
                onPress={setSelectedBook}
                onOpen={openBookFile}
                isSelected={selectedBook?.id === item.id}
              />
            )}
            initialNumToRender={16}
            maxToRenderPerBatch={16}
            windowSize={5}
            removeClippedSubviews={true}
            contentContainerStyle={styles.denseListContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Scan Options Dialog */}
        <ScanDialogModal
          visible={showScanDialog}
          onClose={() => setShowScanDialog(false)}
          onScanFolder={() => scanDevice(true)}
          onPickFiles={importDocuments}
        />

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
  heroContainer: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 4,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.surface,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    gap: 12,
  },
  heroCover: {
    width: 48,
    height: 64,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  heroDetails: {
    flex: 1,
  },
  heroBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: Palette.primary,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  heroTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Palette.text,
  },
  heroAuthor: {
    fontSize: 12,
    color: Palette.textMuted,
    marginTop: 2,
  },
  heroProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  heroProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  heroProgressFill: {
    height: '100%',
    backgroundColor: Palette.primary,
    borderRadius: 2,
  },
  heroProgressText: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.textMuted,
  },
  heroResumeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  heroResumeText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
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
