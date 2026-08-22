import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TabletSplitLayout } from '../../components/tablet/TabletSplitLayout';
import { TodoStatsBar } from '../../components/todo/TodoStatsBar';
import { TodoItemCard } from '../../components/todo/TodoItemCard';
import { StorageService, INITIAL_TODOS } from '../../services/storage';
import { FeatureItem, TodoCategory, TodoPriority, TodoStatus } from '../../types/todo';
import { Palette } from '../../constants/theme';

export default function TodoScreen() {
  const [todos, setTodos] = useState<FeatureItem[]>([]);
  const [currentFilter, setCurrentFilter] = useState<'all' | TodoStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | TodoCategory>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Feature Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<TodoCategory>('file_scanner');
  const [newPriority, setNewPriority] = useState<TodoPriority>('high');

  const loadTodos = async () => {
    const loaded = await StorageService.loadTodos();
    setTodos(loaded);
  };

  useEffect(() => {
    loadTodos();
  }, []);

  const handleStatusChange = async (item: FeatureItem, newStatus: TodoStatus) => {
    const updatedItem: FeatureItem = {
      ...item,
      status: newStatus,
      updatedAt: Date.now(),
      completedAt: newStatus === 'done' ? Date.now() : undefined,
    };
    const updated = await StorageService.updateTodo(updatedItem);
    setTodos(updated);
  };

  const handleAddFeature = async () => {
    if (!newTitle.trim()) return;
    const newFeature: FeatureItem = {
      id: `custom_${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim(),
      category: newCategory,
      priority: newPriority,
      status: 'todo',
      updatedAt: Date.now(),
    };
    const updated = await StorageService.updateTodo(newFeature);
    setTodos(updated);
    setNewTitle('');
    setNewDesc('');
    setShowAddModal(false);
  };

  const handleResetDefaults = () => {
    Alert.alert(
      'Reset Feature Checklist',
      'This will reset all features to default initial roadmap statuses.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await StorageService.saveTodos(INITIAL_TODOS);
            setTodos(INITIAL_TODOS);
          },
        },
      ]
    );
  };

  const filteredTodos = useMemo(() => {
    return todos.filter((t) => {
      const matchStatus = currentFilter === 'all' || t.status === currentFilter;
      const matchCat = categoryFilter === 'all' || t.category === categoryFilter;
      return matchStatus && matchCat;
    });
  }, [todos, currentFilter, categoryFilter]);

  const stats = useMemo(() => {
    const total = todos.length;
    const doneCount = todos.filter((t) => t.status === 'done').length;
    const inProgressCount = todos.filter((t) => t.status === 'in_progress').length;
    const todoCount = todos.filter((t) => t.status === 'todo').length;
    return { total, doneCount, inProgressCount, todoCount };
  }, [todos]);

  const categories: { label: string; value: 'all' | TodoCategory }[] = [
    { label: 'All Modules', value: 'all' },
    { label: 'File Ingestion', value: 'file_scanner' },
    { label: 'Tablet UI', value: 'tablet_ui' },
    { label: 'Search & Filters', value: 'search_filter' },
    { label: 'Categories', value: 'categories' },
    { label: 'Reader & Inspector', value: 'reader_inspector' },
    { label: 'Storage & DB', value: 'storage_sync' },
  ];

  return (
    <TabletSplitLayout>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Feature & TODO Tracker</Text>
            <Text style={styles.headerSubtitle}>
              Live interactive milestone tracker. Mark features as Done, In Progress, or Todo.
            </Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => setShowAddModal(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={18} color="#FFF" style={{ marginRight: 4 }} />
              <Text style={styles.addBtnText}>Add Feature</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resetBtn}
              onPress={handleResetDefaults}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh-outline" size={18} color={Palette.darkTextMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Progress Overview Hero Card */}
          <TodoStatsBar
            total={stats.total}
            doneCount={stats.doneCount}
            inProgressCount={stats.inProgressCount}
            todoCount={stats.todoCount}
            currentFilter={currentFilter}
            onFilterChange={setCurrentFilter}
          />

          {/* Module Category Filter Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {categories.map((c) => {
              const isSelected = categoryFilter === c.value;
              return (
                <TouchableOpacity
                  key={c.value}
                  style={[styles.catPill, isSelected && styles.catPillActive]}
                  onPress={() => setCategoryFilter(c.value)}
                >
                  <Text style={[styles.catPillText, isSelected && styles.catPillTextActive]}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Feature Item Cards */}
          <View style={styles.todosList}>
            {filteredTodos.map((item) => (
              <TodoItemCard
                key={item.id}
                item={item}
                onStatusChange={handleStatusChange}
              />
            ))}
          </View>
        </ScrollView>

        {/* Add Feature Modal */}
        <Modal
          visible={showAddModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowAddModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Add Feature / Task</Text>

              <TextInput
                style={styles.modalInput}
                placeholder="Feature title..."
                placeholderTextColor={Palette.darkTextDim}
                value={newTitle}
                onChangeText={setNewTitle}
                autoFocus
              />

              <TextInput
                style={[styles.modalInput, { height: 80, textAlignVertical: 'top' }]}
                multiline
                placeholder="Feature description and acceptance criteria..."
                placeholderTextColor={Palette.darkTextDim}
                value={newDesc}
                onChangeText={setNewDesc}
              />

              {/* Category Selector */}
              <Text style={styles.modalLabel}>Module Category:</Text>
              <View style={styles.wrapRow}>
                {(
                  [
                    'file_scanner',
                    'tablet_ui',
                    'search_filter',
                    'categories',
                    'reader_inspector',
                    'storage_sync',
                  ] as TodoCategory[]
                ).map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.choicePill,
                      newCategory === cat && styles.choicePillActive,
                    ]}
                    onPress={() => setNewCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.choicePillText,
                        newCategory === cat && styles.choicePillTextActive,
                      ]}
                    >
                      {cat.replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Priority Selector */}
              <Text style={styles.modalLabel}>Priority:</Text>
              <View style={styles.wrapRow}>
                {(['high', 'medium', 'low'] as TodoPriority[]).map((pri) => (
                  <TouchableOpacity
                    key={pri}
                    style={[
                      styles.choicePill,
                      newPriority === pri && styles.choicePillActive,
                    ]}
                    onPress={() => setNewPriority(pri)}
                  >
                    <Text
                      style={[
                        styles.choicePillText,
                        newPriority === pri && styles.choicePillTextActive,
                      ]}
                    >
                      {pri.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Modal Actions */}
              <View style={styles.modalActionRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setShowAddModal(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalSubmitBtn}
                  onPress={handleAddFeature}
                >
                  <Text style={styles.modalSubmitText}>Add Feature</Text>
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
    backgroundColor: Palette.darkBg,
  },
  header: {
    padding: 20,
    backgroundColor: Palette.darkSurface,
    borderBottomWidth: 1,
    borderColor: Palette.darkBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: Palette.darkText,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Palette.darkTextMuted,
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.primary,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  addBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  resetBtn: {
    padding: 9,
    backgroundColor: Palette.darkCard,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Palette.darkBorder,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 50,
  },
  categoryScroll: {
    gap: 8,
    paddingBottom: 14,
  },
  catPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Palette.darkCard,
    borderWidth: 1,
    borderColor: Palette.darkBorder,
  },
  catPillActive: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  catPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.darkTextMuted,
  },
  catPillTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  todosList: {
    marginTop: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: Palette.darkSurface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Palette.darkBorder,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.darkText,
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: Palette.darkCard,
    borderWidth: 1,
    borderColor: Palette.darkBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: Palette.darkText,
    fontSize: 14,
    marginBottom: 12,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.darkTextDim,
    textTransform: 'uppercase',
    marginTop: 6,
    marginBottom: 8,
  },
  wrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  choicePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Palette.darkCard,
    borderWidth: 1,
    borderColor: Palette.darkBorder,
  },
  choicePillActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
    borderColor: Palette.primaryLight,
  },
  choicePillText: {
    color: Palette.darkTextMuted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  choicePillTextActive: {
    color: Palette.primaryLight,
    fontWeight: '700',
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
    color: Palette.darkTextMuted,
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
