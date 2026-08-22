import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Palette } from '../../constants/theme';
import { TodoStatus } from '../../types/todo';

interface TodoStatsBarProps {
  total: number;
  doneCount: number;
  inProgressCount: number;
  todoCount: number;
  currentFilter: 'all' | TodoStatus;
  onFilterChange: (status: 'all' | TodoStatus) => void;
}

export const TodoStatsBar: React.FC<TodoStatsBarProps> = ({
  total,
  doneCount,
  inProgressCount,
  todoCount,
  currentFilter,
  onFilterChange,
}) => {
  const percentComplete = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  return (
    <View style={styles.container}>
      {/* Progress Metric Hero */}
      <View style={styles.metricRow}>
        <View>
          <Text style={styles.metricTitle}>Project Implementation Progress</Text>
          <Text style={styles.metricSubtitle}>
            {doneCount} of {total} features completed & verified
          </Text>
        </View>
        <View style={styles.percentBadge}>
          <Text style={styles.percentText}>{percentComplete}%</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarTrack}>
        <View style={[styles.progressFill, { width: `${percentComplete}%` }]} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabsRow}>
        <TouchableOpacity
          style={[styles.filterTab, currentFilter === 'all' && styles.filterTabActive]}
          onPress={() => onFilterChange('all')}
        >
          <Text style={[styles.filterTabText, currentFilter === 'all' && styles.filterTabTextActive]}>
            All ({total})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, currentFilter === 'done' && styles.filterTabActive]}
          onPress={() => onFilterChange('done')}
        >
          <Text style={[styles.filterTabText, currentFilter === 'done' && styles.filterTabTextActive]}>
            Completed ({doneCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, currentFilter === 'in_progress' && styles.filterTabActive]}
          onPress={() => onFilterChange('in_progress')}
        >
          <Text
            style={[
              styles.filterTabText,
              currentFilter === 'in_progress' && styles.filterTabTextActive,
            ]}
          >
            In Progress ({inProgressCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, currentFilter === 'todo' && styles.filterTabActive]}
          onPress={() => onFilterChange('todo')}
        >
          <Text style={[styles.filterTabText, currentFilter === 'todo' && styles.filterTabTextActive]}>
            Todo ({todoCount})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Palette.darkCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Palette.darkBorder,
    padding: 18,
    marginBottom: 16,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metricTitle: {
    color: Palette.darkText,
    fontSize: 16,
    fontWeight: '800',
  },
  metricSubtitle: {
    color: Palette.darkTextMuted,
    fontSize: 12,
    marginTop: 2,
  },
  percentBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  percentText: {
    color: Palette.primaryLight,
    fontSize: 16,
    fontWeight: '900',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: Palette.darkSurface,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Palette.success,
    borderRadius: 4,
  },
  filterTabsRow: {
    flexDirection: 'row',
    backgroundColor: Palette.darkSurface,
    borderRadius: 10,
    padding: 4,
    gap: 4,
  },
  filterTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  filterTabActive: {
    backgroundColor: Palette.darkCard,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.darkTextMuted,
  },
  filterTabTextActive: {
    color: Palette.darkText,
    fontWeight: '700',
  },
});
