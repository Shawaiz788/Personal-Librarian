import React from 'react';
import { View, Text, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Palette } from '../../constants/theme';

interface ScanProgressModalProps {
  visible: boolean;
  scannedDirs: number;
  foundCount: number;
  currentName: string;
}

export const ScanProgressModal: React.FC<ScanProgressModalProps> = ({
  visible,
  scannedDirs,
  foundCount,
  currentName,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Top Animated Icon */}
          <View style={styles.radarCircle}>
            <Ionicons name="scan-circle" size={48} color={Palette.primary} />
          </View>

          <Text style={styles.title}>Auto-Scanning Device</Text>
          <Text style={styles.subtitle}>
            Searching internal storage & folders for books, PDFs, and eBooks...
          </Text>

          {/* Stats Badges */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{scannedDirs}</Text>
              <Text style={styles.statLabel}>Folders Checked</Text>
            </View>

            <View style={[styles.statBox, { borderColor: 'rgba(5, 150, 105, 0.25)', backgroundColor: 'rgba(5, 150, 105, 0.06)' }]}>
              <Text style={[styles.statNum, { color: Palette.success }]}>{foundCount}</Text>
              <Text style={styles.statLabel}>Books Found</Text>
            </View>
          </View>

          {/* Current Path Indicator */}
          <View style={styles.currentFileBox}>
            <ActivityIndicator size="small" color={Palette.primary} style={{ marginRight: 8 }} />
            <Text style={styles.currentFileText} numberOfLines={1}>
              {currentName || 'Scanning...'}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: Palette.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Palette.border,
    padding: 26,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  radarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(79, 70, 229, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Palette.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: Palette.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: Palette.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.border,
    padding: 12,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 22,
    fontWeight: '900',
    color: Palette.text,
  },
  statLabel: {
    fontSize: 11,
    color: Palette.textDim,
    fontWeight: '600',
    marginTop: 2,
  },
  currentFileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.bg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Palette.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: '100%',
  },
  currentFileText: {
    flex: 1,
    fontSize: 12,
    color: Palette.textMuted,
    fontWeight: '500',
  },
});
