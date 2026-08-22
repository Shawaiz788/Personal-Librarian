import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category, FilterState, ReadingStatus } from '../../types/book';
import { Palette } from '../../constants/theme';

interface FilterChipGroupProps {
  filter: FilterState;
  onFilterChange: (update: Partial<FilterState>) => void;
  categories: Category[];
  formatCounts: Record<string, number>;
  onResetFilters: () => void;
}

export const FilterChipGroup: React.FC<FilterChipGroupProps> = ({
  filter,
  onFilterChange,
  categories,
  formatCounts,
  onResetFilters,
}) => {
  const formats = [
    { label: 'All Formats', value: 'all' },
    { label: 'PDF', value: 'pdf' },
    { label: 'EPUB', value: 'epub' },
    { label: 'TXT / MD', value: 'txt' },
    { label: 'DOCX', value: 'docx' },
    { label: 'MOBI', value: 'mobi' },
  ];

  const statuses: { label: string; value: ReadingStatus }[] = [
    { label: 'All Status', value: 'all' },
    { label: 'Unread', value: 'unread' },
    { label: 'Reading', value: 'reading' },
    { label: 'Completed', value: 'completed' },
  ];

  const hasActiveFilters =
    filter.query !== '' ||
    filter.categoryId !== 'all' ||
    filter.format !== 'all' ||
    filter.readingStatus !== 'all' ||
    Boolean(filter.tag);

  return (
    <View style={styles.container}>
      {/* Category Pills Scroll */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Categories</Text>
        {hasActiveFilters && (
          <TouchableOpacity onPress={onResetFilters} style={styles.resetBtn}>
            <Ionicons name="refresh" size={12} color={Palette.primary} style={{ marginRight: 4 }} />
            <Text style={styles.resetText}>Reset All</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
        <TouchableOpacity
          style={[
            styles.chip,
            filter.categoryId === 'all' && styles.chipActive,
          ]}
          onPress={() => onFilterChange({ categoryId: 'all' })}
        >
          <Text style={[styles.chipText, filter.categoryId === 'all' && styles.chipTextActive]}>
            All Categories
          </Text>
        </TouchableOpacity>

        {categories.map((cat) => {
          const isSelected = filter.categoryId === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.chip,
                isSelected && { backgroundColor: cat.color, borderColor: cat.color },
              ]}
              onPress={() => onFilterChange({ categoryId: isSelected ? 'all' : cat.id })}
            >
              <Ionicons
                name={cat.icon as any}
                size={14}
                color={isSelected ? '#FFF' : Palette.textMuted}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Format & Status Horizontal Pills */}
      <View style={styles.subFilterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
          {/* Formats */}
          {formats.map((fmt) => {
            const isSelected = filter.format === fmt.value;
            const count = formatCounts[fmt.value];
            return (
              <TouchableOpacity
                key={fmt.value}
                style={[styles.smallChip, isSelected && styles.smallChipActive]}
                onPress={() => onFilterChange({ format: fmt.value })}
              >
                <Text style={[styles.smallChipText, isSelected && styles.smallChipTextActive]}>
                  {fmt.label} {count !== undefined && count > 0 ? `(${count})` : ''}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* Reading Status Divider */}
          <View style={styles.divider} />

          {/* Reading Statuses */}
          {statuses.map((st) => {
            const isSelected = filter.readingStatus === st.value;
            return (
              <TouchableOpacity
                key={st.value}
                style={[styles.smallChip, isSelected && styles.smallChipActive]}
                onPress={() => onFilterChange({ readingStatus: st.value })}
              >
                <Text style={[styles.smallChipText, isSelected && styles.smallChipTextActive]}>
                  {st.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    backgroundColor: Palette.bg,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.textDim,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetText: {
    color: Palette.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  chipsScroll: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  chipActive: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.textMuted,
  },
  chipTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  subFilterRow: {
    marginTop: 8,
  },
  smallChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  smallChipActive: {
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    borderColor: Palette.primary,
  },
  smallChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.textMuted,
  },
  smallChipTextActive: {
    color: Palette.primary,
    fontWeight: '700',
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: Palette.border,
    marginHorizontal: 4,
  },
});
