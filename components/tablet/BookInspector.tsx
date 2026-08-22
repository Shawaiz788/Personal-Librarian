import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BookItem, Category } from '../../types/book';
import { Palette } from '../../constants/theme';
import { Badge } from '../common/Badge';
import { formatBytes } from '../../services/fileScanner';

interface BookInspectorProps {
  book: BookItem | null;
  categories: Category[];
  onClose: () => void;
  onUpdateBook: (book: BookItem) => void;
  onDeleteBook: (bookId: string) => void;
  onOpenBook: (book: BookItem) => void;
  isTablet?: boolean;
}

export const BookInspector: React.FC<BookInspectorProps> = ({
  book,
  categories,
  onClose,
  onUpdateBook,
  onDeleteBook,
  onOpenBook,
  isTablet = false,
}) => {
  const [notes, setNotes] = useState(book?.notes || '');
  const [newTag, setNewTag] = useState('');

  // Update notes if book changes
  React.useEffect(() => {
    setNotes(book?.notes || '');
  }, [book?.id, book?.notes]);

  if (!book) {
    return (
      <SafeAreaView style={[styles.emptyContainer, isTablet && styles.tabletEmpty]} edges={['top', 'bottom', 'right']}>
        <Ionicons name="book-outline" size={48} color={Palette.textDim} />
        <Text style={styles.emptyTitle}>No Book Selected</Text>
        <Text style={styles.emptySubtitle}>
          Select a book from your library to inspect metadata, update reading progress, and read.
        </Text>
      </SafeAreaView>
    );
  }

  const gradient = book.coverGradient || [book.coverColor || '#4F46E5', '#3730A3'];

  const handleProgressChange = (progress: number) => {
    const updated: BookItem = {
      ...book,
      readingProgress: progress,
      lastReadDate: Date.now(),
    };
    onUpdateBook(updated);
  };

  const handleRatingChange = (rating: number) => {
    const updated: BookItem = {
      ...book,
      rating: book.rating === rating ? 0 : rating,
    };
    onUpdateBook(updated);
  };

  const handleCategoryChange = (categoryId: string) => {
    const updated: BookItem = {
      ...book,
      categoryId: book.categoryId === categoryId ? undefined : categoryId,
    };
    onUpdateBook(updated);
  };

  const handleSaveNotes = () => {
    const updated: BookItem = {
      ...book,
      notes,
    };
    onUpdateBook(updated);
  };

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    const tag = newTag.trim().toLowerCase();
    if (!book.tags.includes(tag)) {
      const updated: BookItem = {
        ...book,
        tags: [...book.tags, tag],
      };
      onUpdateBook(updated);
    }
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updated: BookItem = {
      ...book,
      tags: book.tags.filter((t) => t !== tagToRemove),
    };
    onUpdateBook(updated);
  };

  const confirmDelete = () => {
    Alert.alert(
      'Remove from Library',
      `Are you sure you want to remove "${book.title}" from your library index?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => onDeleteBook(book.id) },
      ]
    );
  };

  const formattedDate = new Date(book.dateAdded).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <SafeAreaView style={[styles.container, isTablet && styles.tabletContainer]} edges={['top', 'bottom', 'right']}>
      {/* Header Bar */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inspector</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Ionicons name="close" size={20} color={Palette.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Book Cover Hero Banner */}
        <View style={[styles.heroCover, { backgroundColor: gradient[0] }]}>
          <Ionicons name="book-outline" size={40} color="rgba(255, 255, 255, 0.4)" style={styles.heroWatermark} />
          <View style={styles.heroBadges}>
            <Badge label={book.format.toUpperCase()} bgColor="#EF4444" color="#FFF" size="small" />
            <Text style={styles.heroFileSize}>{formatBytes(book.fileSize)}</Text>
          </View>
          <Text style={styles.heroTitle} numberOfLines={2}>{book.title}</Text>
          <Text style={styles.heroAuthor}>{book.author}</Text>
        </View>

        {/* Primary Action Button: Open Document */}
        <TouchableOpacity
          style={styles.primaryReadBtn}
          onPress={() => onOpenBook(book)}
          activeOpacity={0.85}
        >
          <Ionicons name="open-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.primaryReadText}>Open & Read Document</Text>
        </TouchableOpacity>

        {/* Reading Progress Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Reading Progress</Text>
            <Text style={styles.progressPercentText}>{Math.round(book.readingProgress)}%</Text>
          </View>

          {/* Quick Progress Buttons */}
          <View style={styles.progressBtnRow}>
            {[0, 25, 50, 75, 100].map((val) => (
              <TouchableOpacity
                key={val}
                style={[
                  styles.progressPill,
                  book.readingProgress === val && styles.progressPillActive,
                ]}
                onPress={() => handleProgressChange(val)}
              >
                <Text
                  style={[
                    styles.progressPillText,
                    book.readingProgress === val && styles.progressPillTextActive,
                  ]}
                >
                  {val === 0 ? 'Unread' : val === 100 ? 'Done' : `${val}%`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Star Rating */}
          <View style={styles.ratingRow}>
            <Text style={styles.metaLabel}>Rating:</Text>
            <View style={styles.starsGroup}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => handleRatingChange(star)}>
                  <Ionicons
                    name={book.rating && book.rating >= star ? 'star' : 'star-outline'}
                    size={22}
                    color={Palette.accent}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Category Picker */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Category & Shelf</Text>
          <View style={styles.categoryWrap}>
            {categories.map((cat) => {
              const isSelected = book.categoryId === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    isSelected && { backgroundColor: cat.color, borderColor: cat.color },
                  ]}
                  onPress={() => handleCategoryChange(cat.id)}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={14}
                    color={isSelected ? '#FFF' : Palette.textMuted}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.categoryChipText,
                      isSelected && styles.categoryChipTextActive,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Tags Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Tags</Text>
          <View style={styles.tagsContainer}>
            {book.tags.map((tag) => (
              <View key={tag} style={styles.tagBadge}>
                <Text style={styles.tagText}>#{tag}</Text>
                <TouchableOpacity onPress={() => handleRemoveTag(tag)} style={styles.tagRemoveBtn}>
                  <Ionicons name="close" size={12} color={Palette.textMuted} />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Add Tag Input */}
          <View style={styles.addTagRow}>
            <TextInput
              style={styles.addTagInput}
              placeholder="Add tag..."
              placeholderTextColor={Palette.textDim}
              value={newTag}
              onChangeText={setNewTag}
              onSubmitEditing={handleAddTag}
            />
            <TouchableOpacity style={styles.addTagBtn} onPress={handleAddTag}>
              <Ionicons name="add" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Personal Notes */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Personal Notes & Summary</Text>
          <TextInput
            style={styles.notesInput}
            multiline
            numberOfLines={4}
            placeholder="Add personal notes, thoughts, or key takeaways..."
            placeholderTextColor={Palette.textDim}
            value={notes}
            onChangeText={setNotes}
            onBlur={handleSaveNotes}
          />
        </View>

        {/* Technical File Metadata */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>File Details</Text>
          <View style={styles.metaDetailRow}>
            <Text style={styles.metaLabel}>Filename:</Text>
            <Text style={styles.metaValue} numberOfLines={1}>{book.filename}</Text>
          </View>
          <View style={styles.metaDetailRow}>
            <Text style={styles.metaLabel}>Format:</Text>
            <Text style={styles.metaValue}>{book.format.toUpperCase()}</Text>
          </View>
          <View style={styles.metaDetailRow}>
            <Text style={styles.metaLabel}>Size:</Text>
            <Text style={styles.metaValue}>{formatBytes(book.fileSize)}</Text>
          </View>
          <View style={styles.metaDetailRow}>
            <Text style={styles.metaLabel}>Date Added:</Text>
            <Text style={styles.metaValue}>{formattedDate}</Text>
          </View>
        </View>

        {/* Delete Book Action */}
        <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete} activeOpacity={0.8}>
          <Ionicons name="trash-outline" size={18} color={Palette.danger} style={{ marginRight: 8 }} />
          <Text style={styles.deleteBtnText}>Remove from Library</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.surface,
    borderLeftWidth: 1,
    borderColor: Palette.border,
  },
  tabletContainer: {
    height: '100%',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: Palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    borderLeftWidth: 1,
    borderColor: Palette.border,
  },
  tabletEmpty: {
    height: '100%',
  },
  emptyTitle: {
    color: Palette.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
  },
  emptySubtitle: {
    color: Palette.textDim,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.text,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: Palette.bg,
  },
  heroCover: {
    borderRadius: 14,
    padding: 18,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  heroWatermark: {
    position: 'absolute',
    right: 12,
    bottom: 12,
  },
  heroBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  heroFileSize: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 11,
    fontWeight: '600',
  },
  heroTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 22,
  },
  heroAuthor: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
  },
  primaryReadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: Palette.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryReadText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
  sectionCard: {
    backgroundColor: Palette.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.border,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.text,
    marginBottom: 10,
  },
  progressPercentText: {
    fontSize: 14,
    fontWeight: '800',
    color: Palette.accent,
  },
  progressBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  progressPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Palette.bg,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  progressPillActive: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  progressPillText: {
    color: Palette.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  progressPillTextActive: {
    color: '#FFF',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: Palette.border,
  },
  starsGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  categoryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: Palette.bg,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  categoryChipText: {
    color: Palette.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(79, 70, 229, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  tagText: {
    color: Palette.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  tagRemoveBtn: {
    padding: 2,
  },
  addTagRow: {
    flexDirection: 'row',
    gap: 8,
  },
  addTagInput: {
    flex: 1,
    backgroundColor: Palette.bg,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: Palette.text,
    fontSize: 12,
  },
  addTagBtn: {
    backgroundColor: Palette.primary,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notesInput: {
    backgroundColor: Palette.bg,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: 8,
    padding: 12,
    color: Palette.text,
    fontSize: 13,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  metaDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  metaLabel: {
    color: Palette.textDim,
    fontSize: 12,
  },
  metaValue: {
    color: Palette.text,
    fontSize: 12,
    fontWeight: '600',
    maxWidth: '65%',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.2)',
    marginTop: 8,
  },
  deleteBtnText: {
    color: Palette.danger,
    fontWeight: '700',
    fontSize: 14,
  },
});
