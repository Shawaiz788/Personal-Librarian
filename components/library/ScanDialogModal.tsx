import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Palette } from '../../constants/theme';

interface ScanDialogModalProps {
  visible: boolean;
  onClose: () => void;
  onScanFolder: () => void;
  onPickFiles: () => void;
}

export const ScanDialogModal: React.FC<ScanDialogModalProps> = ({
  visible,
  onClose,
  onScanFolder,
  onPickFiles,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="scan" size={28} color={Palette.primary} />
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={Palette.textDim} />
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>Scan Books & PDFs</Text>
          <Text style={styles.subtitle}>
            Choose how you would like to search and index your documents:
          </Text>

          {/* Option 1: Pick / Select All from Downloads (Bypasses Android Privacy restriction) */}
          <TouchableOpacity
            style={styles.optionCardPrimary}
            onPress={() => {
              onClose();
              onPickFiles();
            }}
            activeOpacity={0.85}
          >
            <View style={styles.optionIconCircle}>
              <Ionicons name="download-outline" size={24} color="#FFF" />
            </View>
            <View style={styles.optionTextWrap}>
              <View style={styles.optionTitleRow}>
                <Text style={styles.optionTitlePrimary}>Select from Downloads / Any Folder</Text>
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>Works in Downloads</Text>
                </View>
              </View>
              <Text style={styles.optionDescPrimary}>
                Bypasses Android privacy restriction. Open Downloads and tap &quot;Select All&quot; to import all books at once.
              </Text>
            </View>
          </TouchableOpacity>

          {/* Option 2: Recursive Folder Auto-Scanner */}
          <TouchableOpacity
            style={styles.optionCardSecondary}
            onPress={() => {
              onClose();
              onScanFolder();
            }}
            activeOpacity={0.85}
          >
            <View style={styles.optionIconCircleSecondary}>
              <Ionicons name="folder-open-outline" size={24} color={Palette.primary} />
            </View>
            <View style={styles.optionTextWrap}>
              <Text style={styles.optionTitleSecondary}>Auto-Scan Entire Folder Tree</Text>
              <Text style={styles.optionDescSecondary}>
                Select Documents or any subfolder (e.g. Download/Books) to automatically scan all subdirectories.
              </Text>
            </View>
          </TouchableOpacity>

          {/* Android Privacy Info Note */}
          <View style={styles.privacyNoteBox}>
            <Ionicons name="information-circle-outline" size={18} color={Palette.textDim} style={{ marginRight: 8 }} />
            <Text style={styles.privacyNoteText}>
              Android restricts selecting the root &quot;Download&quot; folder for privacy, but allows selecting all files inside it or scanning subfolders.
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
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: Palette.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Palette.border,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(79, 70, 229, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    padding: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Palette.text,
  },
  subtitle: {
    fontSize: 13,
    color: Palette.textMuted,
    marginTop: 4,
    marginBottom: 20,
    lineHeight: 18,
  },
  optionCardPrimary: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Palette.primary,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: Palette.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  optionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionTextWrap: {
    flex: 1,
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
  },
  optionTitlePrimary: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFF',
  },
  recommendedBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  recommendedText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  optionDescPrimary: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 4,
    lineHeight: 16,
  },
  optionCardSecondary: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  optionIconCircleSecondary: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(79, 70, 229, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionTitleSecondary: {
    fontSize: 15,
    fontWeight: '800',
    color: Palette.text,
  },
  optionDescSecondary: {
    fontSize: 12,
    color: Palette.textMuted,
    marginTop: 4,
    lineHeight: 16,
  },
  privacyNoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.bg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Palette.border,
    padding: 12,
  },
  privacyNoteText: {
    flex: 1,
    fontSize: 11,
    color: Palette.textMuted,
    lineHeight: 15,
  },
});
