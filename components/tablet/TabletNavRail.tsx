import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { Palette } from '../../constants/theme';

interface TabletNavRailProps {
  onScanDevice: () => void;
  totalBooks: number;
}

export const TabletNavRail: React.FC<TabletNavRailProps> = ({
  onScanDevice,
  totalBooks,
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { label: 'Library', icon: 'library-outline', activeIcon: 'library', path: '/' },
    { label: 'Search', icon: 'search-outline', activeIcon: 'search', path: '/search' },
    { label: 'Categories', icon: 'folder-open-outline', activeIcon: 'folder-open', path: '/categories' },
  ];

  return (
    <SafeAreaView style={styles.navRail} edges={['top', 'bottom', 'left']}>
      {/* Brand Header */}
      <View style={styles.brandContainer}>
        <View style={styles.logoCircle}>
          <Ionicons name="book" size={22} color="#FFF" />
        </View>
        <Text style={styles.brandText}>Librarian</Text>
      </View>

      {/* Navigation Links */}
      <View style={styles.navLinks}>
        {navItems.map((item) => {
          const isActive =
            item.path === '/'
              ? pathname === '/' || pathname === '/(tabs)' || pathname === '/(tabs)/index'
              : pathname.includes(item.path);

          return (
            <TouchableOpacity
              key={item.path}
              style={[styles.navItem, isActive && styles.navItemActive]}
              onPress={() => router.push(item.path as any)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={(isActive ? item.activeIcon : item.icon) as any}
                size={22}
                color={isActive ? Palette.primary : Palette.textMuted}
              />
              <Text style={[styles.navItemText, isActive && styles.navItemTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Footer Info & Quick Auto-Scan */}
      <View style={styles.footerContainer}>
        <TouchableOpacity style={styles.quickImportBtn} onPress={onScanDevice} activeOpacity={0.8}>
          <Ionicons name="scan" size={18} color="#FFF" />
          <Text style={styles.quickImportText}>Scan Device</Text>
        </TouchableOpacity>

        <View style={styles.statsCard}>
          <Text style={styles.statsCount}>{totalBooks}</Text>
          <Text style={styles.statsLabel}>Total Documents</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  navRail: {
    width: 220,
    height: '100%',
    backgroundColor: Palette.surface,
    borderRightWidth: 1,
    borderColor: Palette.border,
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginTop: 8,
    marginBottom: 20,
    gap: 10,
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Palette.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  brandText: {
    fontSize: 18,
    fontWeight: '900',
    color: Palette.text,
    letterSpacing: -0.3,
  },
  navLinks: {
    flex: 1,
    gap: 6,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    gap: 12,
  },
  navItemActive: {
    backgroundColor: 'rgba(79, 70, 229, 0.08)',
  },
  navItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.textMuted,
  },
  navItemTextActive: {
    color: Palette.primary,
    fontWeight: '700',
  },
  footerContainer: {
    gap: 10,
    marginBottom: 8,
  },
  quickImportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.primary,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
    shadowColor: Palette.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  quickImportText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  statsCard: {
    backgroundColor: Palette.bg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Palette.border,
    padding: 10,
    alignItems: 'center',
  },
  statsCount: {
    color: Palette.text,
    fontSize: 16,
    fontWeight: '800',
  },
  statsLabel: {
    color: Palette.textDim,
    fontSize: 11,
    marginTop: 2,
  },
});
