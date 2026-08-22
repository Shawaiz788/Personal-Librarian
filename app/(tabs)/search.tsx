import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLibrary } from '../../context/LibraryContext';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { TabletSplitLayout } from '../../components/tablet/TabletSplitLayout';
import { BookCard } from '../../components/library/BookCard';
import { BookListItem } from '../../components/library/BookListItem';
import { SearchEngineService } from '../../services/searchEngine';
import { Palette } from '../../constants/theme';
import { BookItem } from '../../types/book';

const PAGE_SIZE = 24;

export default function SearchScreen() {
  const {
    books,
    filteredBooks,
    categories,
    filter,
    setFilter,
    selectedBook,
    setSelectedBook,
    openBookFile,
    viewMode,
  } = useLibrary();

  const { numColumns } = useResponsiveLayout();
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setDisplayCount(PAGE_SIZE);
  }, [filter.query, filter.categoryId, filter.format, filter.tag]);

  const formatCounts = useMemo(() => {
    return SearchEngineService.getFormatCounts(books);
  }, [books]);

  const uniqueTags = useMemo(() => {
    return SearchEngineService.getUniqueTags(books);
  }, [books]);

  const formats = [
    { label: 'All Formats', value: 'all' },
    { label: 'PDF', value: 'pdf' },
    { label: 'EPUB', value: 'epub' },
    { label: 'TXT', value: 'txt' },
    { label: 'DOCX', value: 'docx' },
  ];

  const handleClear = () => {
    setFilter({
      query: '',
      categoryId: 'all',
      format: 'all',
      readingStatus: 'all',
      sortBy: 'date-desc',
    });
  };

  const paginatedBooks = useMemo(() => {
    return filteredBooks.slice(0, displayCount);
  }, [filteredBooks, displayCount]);

  const handleLoadMore = useCallback(() => {
    if (displayCount < filteredBooks.length) {
      setDisplayCount((prev) => Math.min(prev + PAGE_SIZE, filteredBooks.length));
    }
  }, [displayCount, filteredBooks.length]);

  const renderFooter = useCallback(() => {
    if (displayCount < filteredBooks.length) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={Palette.primary} style={{ marginRight: 8 }} />
          <Text style={styles.footerLoaderText}>
            Loading more books ({displayCount} of {filteredBooks.length})...
          </Text>
        </View>
      );
    }
    if (filteredBooks.length > PAGE_SIZE) {
      return (
        <View style={styles.footerLoader}>
          <Ionicons name="checkmark-circle" size={16} color={Palette.success} style={{ marginRight: 6 }} />
          <Text style={styles.footerEndText}>
            All {filteredBooks.length} books loaded
          </Text>
        </View>
      );
    }
    return null;
  }, [displayCount, filteredBooks.length]);

  const renderGridItem = useCallback(
    ({ item }: { item: BookItem }) => (
      <View style={{ flex: 1 / numColumns }}>
        <BookCard
          book={item}
          onPress={setSelectedBook}
          isSelected={selectedBook?.id === item.id}
        />
      </View>
    ),
    [numColumns, selectedBook?.id, setSelectedBook]
  );

  const renderListItem = useCallback(
    ({ item }: { item: BookItem }) => (
      <BookListItem
        book={item}
        onPress={setSelectedBook}
        onOpen={openBookFile}
        isSelected={selectedBook?.id === item.id}
      />
    ),
    [selectedBook?.id, setSelectedBook, openBookFile]
  );

  const keyExtractor = useCallback((item: BookItem) => item.id, []);

  const renderHeader = () => (
    <View>
      {/* Search Screen Hero Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search & Explore</Text>
        <Text style={styles.headerSubtitle}>
          Search across {books.length} documents by title, author, category, format, or tags.
        </Text>

        {/* Search Input Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Palette.primary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search anything (e.g. Clean Code, Machine Learning, .pdf)..."
            placeholderTextColor={Palette.textDim}
            value={filter.query}
            onChangeText={(q) => setFilter((prev) => ({ ...prev, query: q }))}
            autoFocus={false}
            clearButtonMode="while-editing"
          />
          {filter.query.length > 0 && (
            <TouchableOpacity onPress={() => setFilter((prev) => ({ ...prev, query: '' }))}>
              <Ionicons name="close-circle" size={20} color={Palette.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Badges & Categories */}
      <View style={styles.filterSection}>
        {/* Format Row */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>File Formats</Text>
          <View style={styles.pillsWrap}>
            {formats.map((fmt) => {
              const isSelected = filter.format === fmt.value;
              const count = formatCounts[fmt.value] || 0;
              return (
                <TouchableOpacity
                  key={fmt.value}
                  style={[styles.pill, isSelected && styles.pillActive]}
                  onPress={() =>
                    setFilter((prev) => ({
                      ...prev,
                      format: isSelected && fmt.value !== 'all' ? 'all' : fmt.value,
                    }))
                  }
                >
                  <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                    {fmt.label} {count > 0 ? `(${count})` : ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Category Row */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>Categories</Text>
          <View style={styles.pillsWrap}>
            <TouchableOpacity
              style={[styles.pill, filter.categoryId === 'all' && styles.pillActive]}
              onPress={() => setFilter((prev) => ({ ...prev, categoryId: 'all' }))}
            >
              <Text
                style={[
                  styles.pillText,
                  filter.categoryId === 'all' && styles.pillTextActive,
                ]}
              >
                All Categories
              </Text>
            </TouchableOpacity>
            {categories.map((cat) => {
              const isSelected = filter.categoryId === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.pill,
                    isSelected && { backgroundColor: cat.color, borderColor: cat.color },
                  ]}
                  onPress={() =>
                    setFilter((prev) => ({
                      ...prev,
                      categoryId: isSelected ? 'all' : cat.id,
                    }))
                  }
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={14}
                    color={isSelected ? '#FFF' : Palette.textMuted}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Tag Cloud */}
        {uniqueTags.length > 0 && (
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>Tags</Text>
            <View style={styles.pillsWrap}>
              {uniqueTags.map((tag) => {
                const isSelected = filter.tag === tag;
                return (
                  <TouchableOpacity
                    key={tag}
                    style={[
                      styles.tagPill,
                      isSelected && styles.tagPillActive,
                    ]}
                    onPress={() =>
                      setFilter((prev) => ({
                        ...prev,
                        tag: isSelected ? undefined : tag,
                      }))
                    }
                  >
                    <Text style={[styles.tagPillText, isSelected && styles.tagPillTextActive]}>
                      #{tag}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Results Count Header */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCountText}>
            Matching Documents ({filteredBooks.length})
          </Text>
          {(filter.query || filter.categoryId !== 'all' || filter.format !== 'all' || filter.tag) && (
            <TouchableOpacity onPress={handleClear} style={styles.clearFiltersBtn}>
              <Text style={styles.clearFiltersText}>Clear Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <TabletSplitLayout>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" />

        {viewMode === 'list' ? (
          <FlatList
            data={paginatedBooks}
            keyExtractor={keyExtractor}
            ListHeaderComponent={renderHeader}
            ListFooterComponent={renderFooter}
            renderItem={renderListItem}
            initialNumToRender={16}
            maxToRenderPerBatch={16}
            windowSize={5}
            removeClippedSubviews={true}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={
              <View style={styles.emptySearch}>
                <Ionicons name="search-outline" size={40} color={Palette.textDim} />
                <Text style={styles.emptySearchTitle}>No matching documents</Text>
                <Text style={styles.emptySearchSub}>
                  Try adjusting your query or resetting category/format filters.
                </Text>
              </View>
            }
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <FlatList
            key={`search_grid_${numColumns}`}
            data={paginatedBooks}
            numColumns={numColumns}
            keyExtractor={keyExtractor}
            ListHeaderComponent={renderHeader}
            ListFooterComponent={renderFooter}
            renderItem={renderGridItem}
            initialNumToRender={16}
            maxToRenderPerBatch={16}
            windowSize={5}
            removeClippedSubviews={true}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={
              <View style={styles.emptySearch}>
                <Ionicons name="search-outline" size={40} color={Palette.textDim} />
                <Text style={styles.emptySearchTitle}>No matching documents</Text>
                <Text style={styles.emptySearchSub}>
                  Try adjusting your query or resetting category/format filters.
                </Text>
              </View>
            }
            contentContainerStyle={styles.listContent}
          />
        )}
      </SafeAreaView>
    </TabletSplitLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.bg,
  },
  header: {
    padding: 20,
    backgroundColor: Palette.surface,
    borderBottomWidth: 1,
    borderColor: Palette.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: Palette.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Palette.textMuted,
    marginTop: 4,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.bg,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Palette.text,
    height: '100%',
  },
  filterSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  sectionBlock: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Palette.textDim,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  pillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  pillActive: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.textMuted,
  },
  pillTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  tagPill: {
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  tagPillActive: {
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    borderColor: Palette.primary,
  },
  tagPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.textMuted,
  },
  tagPillTextActive: {
    color: Palette.primary,
    fontWeight: '700',
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: Palette.border,
    marginBottom: 8,
  },
  resultsCountText: {
    fontSize: 14,
    fontWeight: '800',
    color: Palette.text,
  },
  clearFiltersBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearFiltersText: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.primary,
  },
  footerLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 6,
  },
  footerLoaderText: {
    fontSize: 13,
    color: Palette.textMuted,
    fontWeight: '600',
  },
  footerEndText: {
    fontSize: 12,
    color: Palette.textDim,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 50,
  },
  emptySearch: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptySearchTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.text,
    marginTop: 10,
  },
  emptySearchSub: {
    fontSize: 12,
    color: Palette.textMuted,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280,
  },
});
