import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BookItem } from '../../types/book';
import { Palette } from '../../constants/theme';
import { Badge } from '../common/Badge';
import { formatBytes } from '../../services/fileScanner';

interface BookListItemProps {
  book: BookItem;
  onPress: (book: BookItem) => void;
  onOpen: (book: BookItem) => void;
  isSelected?: boolean;
}

export const BookListItem: React.FC<BookListItemProps> = memo(
  ({ book, onPress, onOpen, isSelected = false }) => {
    const gradient = book.coverGradient || [book.coverColor || '#4F46E5', '#3730A3'];
    const formattedDate = new Date(book.dateAdded).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return (
      <TouchableOpacity
        style={[
          styles.container,
          isSelected && styles.selectedContainer,
        ]}
        onPress={() => onPress(book)}
        activeOpacity={0.7}
      >
        {/* Mini Cover Thumbnail */}
        <View style={[styles.thumbnail, { backgroundColor: gradient[0] }]}>
          <Ionicons name="book" size={16} color="#FFF" />
        </View>

        {/* Book Main Info */}
        <View style={styles.mainInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {book.title}
            </Text>
            <Badge
              label={book.format.toUpperCase()}
              bgColor={book.format === 'pdf' ? '#EF4444' : '#4F46E5'}
              color="#FFF"
              size="small"
            />
          </View>
          <Text style={styles.author} numberOfLines={1}>
            {book.author}
          </Text>
        </View>

        {/* Meta Specs */}
        <View style={styles.metaColumn}>
          <Text style={styles.metaText}>{formatBytes(book.fileSize)}</Text>
          <Text style={styles.metaDimText}>{formattedDate}</Text>
        </View>

        {/* Reading Progress */}
        <View style={styles.progressColumn}>
          <Text style={styles.progressText}>
            {(book.readingProgress || 0) >= 100 ? 'Done' : `${Math.round(book.readingProgress || 0)}%`}
          </Text>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(book.readingProgress || 0, 100)}%`,
                  backgroundColor: (book.readingProgress || 0) >= 100 ? Palette.success : Palette.accent,
                },
              ]}
            />
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={styles.openBtn}
          onPress={() => onOpen(book)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="eye-outline" size={18} color={Palette.primary} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  },
  (prev, next) =>
    prev.book.id === next.book.id &&
    prev.book.readingProgress === next.book.readingProgress &&
    prev.isSelected === next.isSelected
);

BookListItem.displayName = 'BookListItem';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.surface,
    borderRadius: 10,
    padding: 12,
    marginVertical: 4,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: Palette.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  selectedContainer: {
    borderColor: Palette.accent,
    backgroundColor: Palette.cardHover,
  },
  thumbnail: {
    width: 36,
    height: 48,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  mainInfo: {
    flex: 1,
    marginRight: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.text,
    flexShrink: 1,
  },
  author: {
    fontSize: 12,
    color: Palette.textMuted,
    marginTop: 2,
  },
  metaColumn: {
    alignItems: 'flex-end',
    marginRight: 16,
  },
  metaText: {
    fontSize: 12,
    color: Palette.text,
    fontWeight: '600',
  },
  metaDimText: {
    fontSize: 11,
    color: Palette.textDim,
    marginTop: 2,
  },
  progressColumn: {
    width: 70,
    marginRight: 12,
  },
  progressText: {
    fontSize: 11,
    color: Palette.textMuted,
    fontWeight: '600',
    textAlign: 'right',
    marginBottom: 4,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  openBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(79, 70, 229, 0.08)',
  },
});
