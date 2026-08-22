import { Platform } from 'react-native';

export const Palette = {
  // Brand accents
  primary: '#4F46E5', // Indigo
  primaryLight: '#6366F1',
  primaryDark: '#3730A3',
  accent: '#D97706', // Warm Amber
  accentGlow: 'rgba(217, 119, 6, 0.15)',

  // Semantic
  success: '#059669',
  warning: '#D97706',
  danger: '#DC2626',
  info: '#2563EB',

  // Clean White / Light Palette (Primary App Theme)
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  cardHover: '#F1F5F9',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  text: '#0F172A',
  textMuted: '#475569',
  textDim: '#94A3B8',

  // Mapped for seamless component consistency (Clean White Design)
  darkBg: '#F8FAFC',
  darkSurface: '#FFFFFF',
  darkCard: '#FFFFFF',
  darkCardHover: '#F8FAFC',
  darkBorder: '#E2E8F0',
  darkText: '#0F172A',
  darkTextMuted: '#475569',
  darkTextDim: '#94A3B8',

  // Light palette explicit
  lightBg: '#F8FAFC',
  lightSurface: '#FFFFFF',
  lightCard: '#FFFFFF',
  lightBorder: '#E2E8F0',
  lightText: '#0F172A',
  lightTextMuted: '#475569',
  lightTextDim: '#94A3B8',

  // Book cover vibrant gradients
  coverGradients: [
    ['#3B82F6', '#1E40AF'], // Ocean Blue
    ['#8B5CF6', '#5B21B6'], // Royal Purple
    ['#EC4899', '#9D174D'], // Crimson Rose
    ['#F59E0B', '#B45309'], // Warm Amber
    ['#10B981', '#047857'], // Emerald Forest
    ['#06B6D4', '#0E7490'], // Cyan Depths
    ['#6366F1', '#3730A3'], // Deep Indigo
    ['#F97316', '#C2410C'], // Tangerine Sunset
  ] as [string, string][],
};

export const Colors = {
  light: {
    text: Palette.lightText,
    textMuted: Palette.lightTextMuted,
    textDim: Palette.lightTextDim,
    background: Palette.lightBg,
    surface: Palette.lightSurface,
    card: Palette.lightCard,
    border: Palette.lightBorder,
    tint: Palette.primary,
    icon: '#64748B',
    tabIconDefault: '#94A3B8',
    tabIconSelected: Palette.primary,
    accent: Palette.accent,
  },
  dark: {
    text: Palette.lightText,
    textMuted: Palette.lightTextMuted,
    textDim: Palette.lightTextDim,
    background: Palette.lightBg,
    surface: Palette.lightSurface,
    card: Palette.lightCard,
    border: Palette.lightBorder,
    tint: Palette.primary,
    icon: '#64748B',
    tabIconDefault: '#94A3B8',
    tabIconSelected: Palette.primary,
    accent: Palette.accent,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "'Outfit', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
