import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
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

  return (
    <TabletSplitLayout>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" />

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
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
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

            {/* Results Grid / List */}
            {filteredBooks.length === 0 ? (
              <View style={styles.emptySearch}>
                <Ionicons name="search-outline" size={40} color={Palette.textDim} />
                <Text style={styles.emptySearchTitle}>No matching documents</Text>
                <Text style={styles.emptySearchSub}>
                  Try adjusting your query or resetting category/format filters.
                </Text>
              </View>
            ) : viewMode === 'list' ? (
              filteredBooks.map((item) => (
                <BookListItem
                  key={item.id}
                  book={item}
                  onPress={setSelectedBook}
                  onOpen={openBookFile}
                  isSelected={selectedBook?.id === item.id}
                />
              ))
            ) : (
              <View style={styles.gridWrap}>
                {filteredBooks.map((item) => (
                  <View key={item.id} style={{ width: `${100 / numColumns}%` }}>
                    <BookCard
                      book={item}
                      onPress={setSelectedBook}
                      isSelected={selectedBook?.id === item.id}
                    />
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
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
    fontSize: 26,
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.border,
    paddingHorizontal: 14,
    height: 48,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: Palette.text,
    fontSize: 15,
    height: '100%',
  },
  filterSection: {
    flex: 1,
  },
  filterScroll: {
    padding: 16,
    paddingBottom: 50,
  },
  sectionBlock: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
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
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Palette.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  pillActive: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  pillText: {
    color: Palette.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  tagPill: {
    backgroundColor: 'rgba(79, 70, 229, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 229, 0.2)',
  },
  tagPillActive: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  tagPillText: {
    color: Palette.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  tagPillTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderColor: Palette.border,
  },
  resultsCountText: {
    fontSize: 16,
    fontWeight: '800',
    color: Palette.text,
  },
  clearFiltersBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearFiltersText: {
    color: Palette.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  emptySearch: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 20,
  },
  emptySearchTitle: {
    color: Palette.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySearchSub: {
    color: Palette.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 320,
  },
  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
