import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FeatureItem, TodoStatus } from '../../types/todo';
import { Palette } from '../../constants/theme';
import { Badge } from '../common/Badge';

interface TodoItemCardProps {
  item: FeatureItem;
  onStatusChange: (item: FeatureItem, newStatus: TodoStatus) => void;
}

export const TodoItemCard: React.FC<TodoItemCardProps> = ({
  item,
  onStatusChange,
}) => {
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'file_scanner':
        return '#06B6D4';
      case 'tablet_ui':
        return '#8B5CF6';
      case 'search_filter':
        return '#F59E0B';
      case 'categories':
        return '#EC4899';
      case 'reader_inspector':
        return '#3B82F6';
      case 'storage_sync':
        return '#10B981';
      default:
        return '#6366F1';
    }
  };

  const getPriorityBadge = (pri: string) => {
    switch (pri) {
      case 'high':
        return { label: 'High Priority', color: '#EF4444' };
      case 'medium':
        return { label: 'Medium', color: '#F59E0B' };
      default:
        return { label: 'Low', color: '#64748B' };
    }
  };

  const priInfo = getPriorityBadge(item.priority);

  return (
    <View style={styles.card}>
      {/* Top Meta Header */}
      <View style={styles.topRow}>
        <View style={styles.badgeGroup}>
          <Badge
            label={item.category.replace('_', ' ').toUpperCase()}
            bgColor={getCategoryColor(item.category)}
            color="#FFF"
            size="small"
          />
          <Badge
            label={priInfo.label}
            bgColor="rgba(255, 255, 255, 0.06)"
            color={priInfo.color}
            size="small"
          />
        </View>

        {item.status === 'done' && (
          <View style={styles.doneCheck}>
            <Ionicons name="checkmark-circle" size={20} color={Palette.success} />
          </View>
        )}
      </View>

      {/* Feature Title & Description */}
      <Text style={[styles.title, item.status === 'done' && styles.titleDone]}>
        {item.title}
      </Text>
      <Text style={styles.description}>{item.description}</Text>

      {/* Interactive Status Selector Switcher */}
      <View style={styles.statusFooter}>
        <Text style={styles.statusLabel}>Status:</Text>
        <View style={styles.statusButtonsGroup}>
          {(['todo', 'in_progress', 'done'] as TodoStatus[]).map((st) => {
            const isSelected = item.status === st;
            let btnLabel = 'Todo';
            let activeBg = '#64748B';
            if (st === 'in_progress') {
              btnLabel = 'In Progress';
              activeBg = Palette.warning;
            } else if (st === 'done') {
              btnLabel = 'Completed';
              activeBg = Palette.success;
            }

            return (
              <TouchableOpacity
                key={st}
                style={[
                  styles.statusBtn,
                  isSelected && { backgroundColor: activeBg, borderColor: activeBg },
                ]}
                onPress={() => onStatusChange(item, st)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.statusBtnText,
                    isSelected && styles.statusBtnTextActive,
                  ]}
                >
                  {btnLabel}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Palette.darkCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.darkBorder,
    padding: 16,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  doneCheck: {
    marginLeft: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.darkText,
    marginBottom: 6,
  },
  titleDone: {
    color: Palette.darkTextMuted,
  },
  description: {
    fontSize: 13,
    color: Palette.darkTextMuted,
    lineHeight: 18,
    marginBottom: 14,
  },
  statusFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: Palette.darkBorder,
  },
  statusLabel: {
    fontSize: 12,
    color: Palette.darkTextDim,
    fontWeight: '600',
  },
  statusButtonsGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  statusBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: Palette.darkSurface,
    borderWidth: 1,
    borderColor: Palette.darkBorder,
  },
  statusBtnText: {
    color: Palette.darkTextMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  statusBtnTextActive: {
    color: '#FFF',
  },
});
