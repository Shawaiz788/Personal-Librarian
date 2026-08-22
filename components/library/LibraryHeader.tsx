import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ViewMode, SortOption } from '../../types/book';
import { Palette } from '../../constants/theme';

interface LibraryHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onScanDevice: () => void;
  onImport: () => void;
  isScanning?: boolean;
  totalBooks: number;
  filteredCount: number;
  currentSort: SortOption;
  onSelectSort: (sort: SortOption) => void;
  isTablet?: boolean;
}

export const LibraryHeader: React.FC<LibraryHeaderProps> = ({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onScanDevice,
  onImport,
  isScanning = false,
  totalBooks,
  filteredCount,
  currentSort,
  onSelectSort,
}) => {
  const [showSortMenu, setShowSortMenu] = React.useState(false);

  const sortOptions: { label: string; value: SortOption }[] = [
    { label: 'Recently Added', value: 'date-desc' },
    { label: 'Oldest Added', value: 'date-asc' },
    { label: 'Title A - Z', value: 'title-asc' },
    { label: 'Title Z - A', value: 'title-desc' },
    { label: 'File Size (Largest)', value: 'size-desc' },
    { label: 'Reading Progress', value: 'progress-desc' },
    { label: 'Highest Rated', value: 'rating-desc' },
  ];

  return (
    <View style={styles.headerContainer}>
      {/* Top Title & Scan/Import Row */}
      <View style={styles.topRow}>
        <View style={styles.titleWithCount}>
          <Text style={styles.title}>Library</Text>
          <View style={styles.countPill}>
            <Text style={styles.countText}>
              {filteredCount} {filteredCount === totalBooks ? 'books' : `of ${totalBooks}`}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          {/* Primary Auto-Scan Device Button */}
          <TouchableOpacity
            style={styles.scanBtn}
            onPress={onScanDevice}
            disabled={isScanning}
            activeOpacity={0.8}
          >
            {isScanning ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Ionicons name="scan" size={16} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={styles.scanBtnText}>Scan Device</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Secondary File Pick Button */}
          <TouchableOpacity
            style={styles.importBtn}
            onPress={onImport}
            disabled={isScanning}
            activeOpacity={0.8}
          >
            <Ionicons name="folder-open-outline" size={16} color={Palette.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar and View Switchers Row */}
      <View style={styles.controlRow}>
        {/* Live Search Input */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={Palette.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by title, author, tag, format..."
            placeholderTextColor={Palette.textDim}
            value={searchQuery}
            onChangeText={onSearchChange}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => onSearchChange('')} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={18} color={Palette.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* View Mode Toggle Controls */}
        <View style={styles.rightControls}>
          <View style={styles.viewModeGroup}>
            <TouchableOpacity
              style={[styles.viewModeBtn, viewMode === 'grid' && styles.viewModeBtnActive]}
              onPress={() => onViewModeChange('grid')}
            >
              <Ionicons
                name="grid-outline"
                size={18}
                color={viewMode === 'grid' ? Palette.primary : Palette.textMuted}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.viewModeBtn, viewMode === 'shelf' && styles.viewModeBtnActive]}
              onPress={() => onViewModeChange('shelf')}
            >
              <Ionicons
                name="albums-outline"
                size={18}
                color={viewMode === 'shelf' ? Palette.primary : Palette.textMuted}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.viewModeBtn, viewMode === 'list' && styles.viewModeBtnActive]}
              onPress={() => onViewModeChange('list')}
            >
              <Ionicons
                name="list-outline"
                size={18}
                color={viewMode === 'list' ? Palette.primary : Palette.textMuted}
              />
            </TouchableOpacity>
          </View>

          {/* Sort Selector Button */}
          <TouchableOpacity
            style={styles.sortBtn}
            onPress={() => setShowSortMenu(!showSortMenu)}
          >
            <Ionicons name="swap-vertical" size={18} color={Palette.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sort Menu Dropdown */}
      {showSortMenu && (
        <View style={styles.sortDropdown}>
          <Text style={styles.sortHeader}>Sort Library By</Text>
          {sortOptions.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.sortItem, currentSort === opt.value && styles.sortItemActive]}
              onPress={() => {
                onSelectSort(opt.value);
                setShowSortMenu(false);
              }}
            >
              <Text
                style={[
                  styles.sortItemText,
                  currentSort === opt.value && styles.sortItemTextActive,
                ]}
              >
                {opt.label}
              </Text>
              {currentSort === opt.value && (
                <Ionicons name="checkmark" size={16} color={Palette.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: Palette.surface,
    borderBottomWidth: 1,
    borderColor: Palette.border,
    zIndex: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  titleWithCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: Palette.text,
    letterSpacing: -0.5,
  },
  countPill: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    color: Palette.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.primary,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    shadowColor: Palette.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  scanBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  importBtn: {
    backgroundColor: Palette.bg,
    borderWidth: 1,
    borderColor: Palette.border,
    padding: 9,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.bg,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: Palette.text,
    fontSize: 14,
    height: '100%',
  },
  clearBtn: {
    padding: 4,
  },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewModeGroup: {
    flexDirection: 'row',
    backgroundColor: Palette.bg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Palette.border,
    padding: 2,
  },
  viewModeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewModeBtnActive: {
    backgroundColor: Palette.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  sortBtn: {
    backgroundColor: Palette.bg,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: 10,
    padding: 10,
  },
  sortDropdown: {
    position: 'absolute',
    top: 110,
    right: 16,
    backgroundColor: Palette.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.border,
    padding: 8,
    width: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 100,
  },
  sortHeader: {
    color: Palette.textDim,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    paddingHorizontal: 10,
    paddingVertical: 6,
    letterSpacing: 0.5,
  },
  sortItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 8,
  },
  sortItemActive: {
    backgroundColor: 'rgba(79, 70, 229, 0.08)',
  },
  sortItemText: {
    color: Palette.text,
    fontSize: 13,
    fontWeight: '600',
  },
  sortItemTextActive: {
    color: Palette.primary,
    fontWeight: '700',
  },
});
