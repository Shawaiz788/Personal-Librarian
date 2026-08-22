import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BookItem } from '../../types/book';
import { Palette } from '../../constants/theme';
import { Badge } from '../common/Badge';
import { formatBytes } from '../../services/fileScanner';

interface BookCardProps {
  book: BookItem;
  onPress: (book: BookItem) => void;
  isSelected?: boolean;
  style?: ViewStyle;
}

export const BookCard: React.FC<BookCardProps> = memo(
  ({ book, onPress, isSelected = false, style }) => {
    const gradient = book.coverGradient || [book.coverColor || '#4F46E5', '#3730A3'];
    const hasProgress = (book.readingProgress || 0) > 0;
    const isCompleted = (book.readingProgress || 0) >= 100;

    const getFormatColor = (fmt: string) => {
      switch (fmt) {
        case 'pdf':
          return '#EF4444';
        case 'epub':
          return '#10B981';
        case 'txt':
          return '#64748B';
        case 'docx':
          return '#3B82F6';
        default:
          return '#8B5CF6';
      }
    };

    return (
      <TouchableOpacity
        style={[
          styles.cardContainer,
          isSelected && styles.selectedContainer,
          style,
        ]}
        onPress={() => onPress(book)}
        activeOpacity={0.88}
      >
        {/* 3D Book Cover View */}
        <View
          style={[
            styles.cover,
            {
              backgroundColor: gradient[0],
              borderColor: isSelected ? Palette.accent : 'rgba(255, 255, 255, 0.1)',
            },
          ]}
        >
          {/* Book Spine Shadow Accent */}
          <View style={styles.spineShadow} />

          {/* Top Badges */}
          <View style={styles.coverHeader}>
            <Badge
              label={book.format.toUpperCase()}
              bgColor={getFormatColor(book.format)}
              color="#FFF"
              size="small"
            />
            {book.rating && book.rating > 0 ? (
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={11} color={Palette.accent} />
                <Text style={styles.ratingText}>{book.rating}</Text>
              </View>
            ) : null}
          </View>

          {/* Center Title Art */}
          <View style={styles.coverBody}>
            <Ionicons name="book-outline" size={26} color="rgba(255, 255, 255, 0.4)" style={styles.watermarkIcon} />
            <Text style={styles.coverTitle} numberOfLines={2}>
              {book.title}
            </Text>
            <Text style={styles.coverAuthor} numberOfLines={1}>
              {book.author}
            </Text>
          </View>

          {/* Bottom Progress Bar / Completion */}
          <View style={styles.coverFooter}>
            {hasProgress ? (
              <View style={styles.progressContainer}>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min(book.readingProgress, 100)}%`,
                        backgroundColor: isCompleted ? Palette.success : Palette.accent,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {isCompleted ? 'Done' : `${Math.round(book.readingProgress)}%`}
                </Text>
              </View>
            ) : (
              <Text style={styles.fileSizeText}>{formatBytes(book.fileSize)}</Text>
            )}
          </View>
        </View>

        {/* Under-Card Metadata */}
        <View style={styles.metaContainer}>
          <Text style={styles.bookTitle} numberOfLines={1}>
            {book.title}
          </Text>
          <Text style={styles.bookAuthor} numberOfLines={1}>
            {book.author}
          </Text>
        </View>
      </TouchableOpacity>
    );
  },
  (prev, next) =>
    prev.book.id === next.book.id &&
    prev.book.readingProgress === next.book.readingProgress &&
    prev.isSelected === next.isSelected
);

BookCard.displayName = 'BookCard';

const styles = StyleSheet.create({
  cardContainer: {
    margin: 6,
    borderRadius: 14,
    backgroundColor: Palette.surface,
    padding: 10,
    borderWidth: 1,
    borderColor: Palette.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  selectedContainer: {
    borderColor: Palette.accent,
    backgroundColor: Palette.cardHover,
    shadowColor: Palette.accent,
    shadowOpacity: 0.2,
  },
  cover: {
    aspectRatio: 0.72,
    borderRadius: 10,
    padding: 12,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
  },
  spineShadow: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  coverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
    paddingLeft: 6,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  ratingText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  coverBody: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    zIndex: 2,
  },
  watermarkIcon: {
    marginBottom: 6,
  },
  coverTitle: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 17,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  coverAuthor: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
    textAlign: 'center',
  },
  coverFooter: {
    zIndex: 2,
    paddingLeft: 6,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressTrack: {
    flex: 1,
    height: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  fileSizeText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    fontWeight: '600',
  },
  metaContainer: {
    marginTop: 8,
    paddingHorizontal: 2,
  },
  bookTitle: {
    color: Palette.text,
    fontSize: 12,
    fontWeight: '700',
  },
  bookAuthor: {
    color: Palette.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
});
