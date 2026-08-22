import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLibrary } from '../../context/LibraryContext';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { TabletSplitLayout } from '../../components/tablet/TabletSplitLayout';
import { Palette } from '../../constants/theme';
import { Badge } from '../../components/common/Badge';

export default function CategoriesScreen() {
  const router = useRouter();
  const {
    categories,
    collections,
    books,
    createCategory,
    createCollection,
    setFilter,
  } = useLibrary();

  const { isTablet, isLandscape } = useResponsiveLayout();

  // Compute clean number of columns:
  // Tablet landscape: 3 cols, Tablet portrait / Phone landscape: 2 cols, Phone portrait: 1 col
  const catColumns = isTablet && isLandscape ? 3 : isTablet || isLandscape ? 2 : 1;

  const [modalType, setModalType] = useState<'category' | 'collection' | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState('#4F46E5');
  const [selectedIcon, setSelectedIcon] = useState('folder');

  const colorOptions = ['#4F46E5', '#EC4899', '#F59E0B', '#10B981', '#06B6D4', '#8B5CF6', '#EF4444'];
  const iconOptions = ['folder', 'book', 'code-slash', 'bulb', 'document-text', 'star', 'bookmark'];

  const handleCreate = async () => {
    if (!name.trim()) return;
    if (modalType === 'category') {
      await createCategory(name.trim(), selectedColor, selectedIcon);
    } else if (modalType === 'collection') {
      await createCollection(name.trim(), description.trim(), selectedColor);
    }
    setName('');
    setDescription('');
    setModalType(null);
  };

  const handleSelectCategory = (categoryId: string) => {
    setFilter((prev) => ({ ...prev, categoryId, query: '', format: 'all' }));
    router.push('/');
  };

  return (
    <TabletSplitLayout>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>Categories & Collections</Text>
            <Text style={styles.headerSubtitle}>
              Organize your documents into topic categories and custom shelves.
            </Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => setModalType('category')}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={18} color="#FFF" style={{ marginRight: 4 }} />
              <Text style={styles.addBtnText}>New Category</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.addBtn, styles.secondaryAddBtn]}
              onPress={() => setModalType('collection')}
              activeOpacity={0.8}
            >
              <Ionicons name="albums-outline" size={18} color={Palette.primary} style={{ marginRight: 4 }} />
              <Text style={[styles.addBtnText, { color: Palette.primary }]}>New Shelf</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Categories Section Heading */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>Categories</Text>
            <Text style={styles.sectionCountBadge}>{categories.length} total</Text>
          </View>

          {/* Clean Grid Layout */}
          <View style={styles.categoryGrid}>
            {categories.map((cat) => {
              const bookCount = books.filter((b) => b.categoryId === cat.id).length;
              const cardWidth = catColumns === 3 ? '31.5%' : catColumns === 2 ? '48%' : '100%';

              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryCard, { width: cardWidth }]}
                  onPress={() => handleSelectCategory(cat.id)}
                  activeOpacity={0.85}
                >
                  <View style={styles.cardTopRow}>
                    <View style={[styles.iconWrapper, { backgroundColor: `${cat.color}15` }]}>
                      <Ionicons name={cat.icon as any} size={22} color={cat.color} />
                    </View>
                    <Badge
                      label={`${bookCount} ${bookCount === 1 ? 'Book' : 'Books'}`}
                      bgColor="rgba(0, 0, 0, 0.05)"
                      color={Palette.textMuted}
                    />
                  </View>

                  <View style={styles.cardDetails}>
                    <Text style={styles.catTitle}>{cat.name}</Text>
                    {cat.description ? (
                      <Text style={styles.catDesc} numberOfLines={2}>
                        {cat.description}
                      </Text>
                    ) : null}
                  </View>

                  <View style={styles.cardBottomRow}>
                    <Text style={styles.viewBooksLink}>View in Library</Text>
                    <Ionicons name="chevron-forward" size={16} color={Palette.primary} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Custom Collections Section */}
          <View style={[styles.sectionHeaderRow, { marginTop: 28 }]}>
            <Text style={styles.sectionHeading}>Custom Shelves & Collections</Text>
            <Text style={styles.sectionCountBadge}>{collections.length} shelves</Text>
          </View>

          {collections.length === 0 ? (
            <View style={styles.emptyCollections}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="albums-outline" size={32} color={Palette.primary} />
              </View>
              <Text style={styles.emptyColTitle}>No Custom Shelves Yet</Text>
              <Text style={styles.emptyColDesc}>
                Create custom shelves to bundle specific study materials, reading lists, or work docs.
              </Text>
              <TouchableOpacity
                style={styles.emptyActionBtn}
                onPress={() => setModalType('collection')}
              >
                <Ionicons name="add" size={16} color="#FFF" style={{ marginRight: 4 }} />
                <Text style={styles.emptyActionText}>Create First Shelf</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.collectionList}>
              {collections.map((col) => (
                <View key={col.id} style={styles.colRow}>
                  <View style={[styles.colColorBar, { backgroundColor: col.color }]} />
                  <View style={styles.colInfo}>
                    <Text style={styles.colTitle}>{col.name}</Text>
                    {col.description ? <Text style={styles.colDesc}>{col.description}</Text> : null}
                  </View>
                  <Badge
                    label={`${col.bookIds.length} items`}
                    bgColor="rgba(79, 70, 229, 0.1)"
                    color={Palette.primary}
                  />
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Create Modal */}
        <Modal
          visible={modalType !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setModalType(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>
                {modalType === 'category' ? 'Create New Category' : 'Create Custom Shelf'}
              </Text>

              <TextInput
                style={styles.modalInput}
                placeholder="Name (e.g. Artificial Intelligence)"
                placeholderTextColor={Palette.textDim}
                value={name}
                onChangeText={setName}
                autoFocus
              />

              <TextInput
                style={styles.modalInput}
                placeholder="Short description..."
                placeholderTextColor={Palette.textDim}
                value={description}
                onChangeText={setDescription}
              />

              {/* Color Selector */}
              <Text style={styles.modalLabel}>Accent Color:</Text>
              <View style={styles.colorRow}>
                {colorOptions.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.colorCircle,
                      { backgroundColor: c },
                      selectedColor === c && styles.colorCircleActive,
                    ]}
                    onPress={() => setSelectedColor(c)}
                  />
                ))}
              </View>

              {/* Icon Selector for Category */}
              {modalType === 'category' && (
                <>
                  <Text style={styles.modalLabel}>Icon:</Text>
                  <View style={styles.iconRow}>
                    {iconOptions.map((ic) => (
                      <TouchableOpacity
                        key={ic}
                        style={[
                          styles.iconChoice,
                          selectedIcon === ic && styles.iconChoiceActive,
                        ]}
                        onPress={() => setSelectedIcon(ic)}
                      >
                        <Ionicons
                          name={ic as any}
                          size={18}
                          color={selectedIcon === ic ? Palette.primary : Palette.textMuted}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {/* Actions */}
              <View style={styles.modalActionRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setModalType(null)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalSubmitBtn}
                  onPress={handleCreate}
                >
                  <Text style={styles.modalSubmitText}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Palette.surface,
    borderBottomWidth: 1,
    borderColor: Palette.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  headerTitleWrap: {
    flex: 1,
    minWidth: 220,
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
    marginTop: 3,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  addBtn: {
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
  secondaryAddBtn: {
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  addBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 50,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: Palette.textDim,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionCountBadge: {
    fontSize: 12,
    color: Palette.textMuted,
    fontWeight: '600',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  categoryCard: {
    backgroundColor: Palette.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Palette.border,
    padding: 16,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardDetails: {
    marginBottom: 12,
  },
  catTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Palette.text,
  },
  catDesc: {
    fontSize: 12,
    color: Palette.textMuted,
    marginTop: 4,
    lineHeight: 16,
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: Palette.border,
  },
  viewBooksLink: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.primary,
  },
  emptyCollections: {
    backgroundColor: Palette.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Palette.border,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(79, 70, 229, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyColTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.text,
  },
  emptyColDesc: {
    fontSize: 13,
    color: Palette.textMuted,
    textAlign: 'center',
    maxWidth: 320,
    marginTop: 6,
    lineHeight: 18,
    marginBottom: 16,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyActionText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  collectionList: {
    gap: 10,
  },
  colRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.border,
    padding: 14,
  },
  colColorBar: {
    width: 6,
    height: 36,
    borderRadius: 3,
    marginRight: 12,
  },
  colInfo: {
    flex: 1,
  },
  colTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.text,
  },
  colDesc: {
    fontSize: 12,
    color: Palette.textMuted,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: Palette.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Palette.border,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.text,
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: Palette.bg,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: Palette.text,
    fontSize: 14,
    marginBottom: 12,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.textDim,
    textTransform: 'uppercase',
    marginTop: 6,
    marginBottom: 8,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  colorCircleActive: {
    borderWidth: 3,
    borderColor: Palette.text,
  },
  iconRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  iconChoice: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Palette.bg,
  },
  iconChoiceActive: {
    backgroundColor: 'rgba(79, 70, 229, 0.15)',
  },
  modalActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 10,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalCancelText: {
    color: Palette.textMuted,
    fontWeight: '600',
  },
  modalSubmitBtn: {
    backgroundColor: Palette.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalSubmitText: {
    color: '#FFF',
    fontWeight: '700',
  },
});
