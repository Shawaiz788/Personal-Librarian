import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { BookItem } from '../../types/book';
import { Palette } from '../../constants/theme';
import { Badge } from '../common/Badge';

interface BookshelfRowProps {
  shelfTitle: string;
  books: BookItem[];
  onSelectBook: (book: BookItem) => void;
  selectedBookId?: string;
}

export const BookshelfRow: React.FC<BookshelfRowProps> = ({
  shelfTitle,
  books,
  onSelectBook,
  selectedBookId,
}) => {
  if (books.length === 0) return null;

  return (
    <View style={styles.shelfContainer}>
      <View style={styles.shelfHeader}>
        <Text style={styles.shelfTitleText}>{shelfTitle}</Text>
        <Badge label={`${books.length} Books`} bgColor="rgba(0, 0, 0, 0.05)" color={Palette.textMuted} />
      </View>

      {/* Row of Books sitting on the Shelf */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.booksRow}
      >
        {books.map((book) => {
          const isSelected = selectedBookId === book.id;
          const gradient = book.coverGradient || [book.coverColor || '#4F46E5', '#3730A3'];
          
          return (
            <TouchableOpacity
              key={book.id}
              style={[
                styles.spineItem,
                isSelected && styles.selectedSpine,
              ]}
              onPress={() => onSelectBook(book)}
              activeOpacity={0.85}
            >
              <View
                style={[
                  styles.spineBody,
                  {
                    backgroundColor: gradient[0],
                    borderColor: isSelected ? Palette.accent : 'rgba(255, 255, 255, 0.2)',
                  },
                ]}
              >
                {/* Gold Spine Ribs/Accents */}
                <View style={styles.goldRibTop} />
                
                {/* Vertical Book Title on Spine */}
                <View style={styles.spineTextContainer}>
                  <Text style={styles.spineTitle} numberOfLines={2}>
                    {book.title}
                  </Text>
                  <Text style={styles.spineAuthor} numberOfLines={1}>
                    {book.author}
                  </Text>
                </View>

                {/* Bottom Format Badge on Spine */}
                <View style={styles.spineFooter}>
                  <Text style={styles.spineFormat}>{book.format.toUpperCase()}</Text>
                </View>

                <View style={styles.goldRibBottom} />
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Physical 3D Shelf Ledge Bar */}
      <View style={styles.shelfPlank}>
        <View style={styles.shelfTopEdge} />
        <View style={styles.shelfFrontBevel} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  shelfContainer: {
    marginVertical: 14,
  },
  shelfHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  shelfTitleText: {
    fontSize: 16,
    fontWeight: '800',
    color: Palette.text,
    letterSpacing: 0.3,
  },
  booksRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 12,
  },
  spineItem: {
    width: 68,
    height: 190,
    borderRadius: 6,
    overflow: 'hidden',
  },
  selectedSpine: {
    transform: [{ translateY: -10 }],
    shadowColor: Palette.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  spineBody: {
    flex: 1,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  goldRibTop: {
    width: '90%',
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 2,
  },
  goldRibBottom: {
    width: '90%',
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 2,
  },
  spineTextContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
  },
  spineTitle: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 14,
  },
  spineAuthor: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 9,
    marginTop: 4,
    textAlign: 'center',
  },
  spineFooter: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
  },
  spineFormat: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: '800',
  },
  shelfPlank: {
    marginTop: -2,
    paddingHorizontal: 8,
  },
  shelfTopEdge: {
    height: 8,
    backgroundColor: '#CBD5E1',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    borderBottomWidth: 1,
    borderColor: '#94A3B8',
  },
  shelfFrontBevel: {
    height: 12,
    backgroundColor: '#94A3B8',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
});
