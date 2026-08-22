import { useWindowDimensions } from 'react-native';

export interface ResponsiveLayoutInfo {
  width: number;
  height: number;
  isTablet: boolean;
  isLandscape: boolean;
  isTabletLandscape: boolean;
  isPhoneLandscape: boolean;
  isMobile: boolean;
  numColumns: number;
  sidebarWidth: number;
  inspectorWidth: number;
  contentPadding: number;
}

export function useResponsiveLayout(): ResponsiveLayoutInfo {
  const { width, height } = useWindowDimensions();

  const shortestDim = Math.min(width, height);
  const longestDim = Math.max(width, height);
  const isLandscape = width > height;

  // Real tablets have the shortest screen dimension >= 600px
  const isTablet = shortestDim >= 600;
  const isTabletLandscape = isTablet && isLandscape;
  const isPhoneLandscape = !isTablet && isLandscape;
  const isMobile = !isTablet;

  let numColumns = 2;
  if (isTablet) {
    if (longestDim >= 1200 && isLandscape) {
      numColumns = 5;
    } else if (isLandscape) {
      numColumns = 4;
    } else {
      numColumns = 3;
    }
  } else if (isPhoneLandscape) {
    numColumns = 3;
  } else {
    numColumns = 2;
  }

  const sidebarWidth = isTabletLandscape ? 240 : isTablet ? 200 : 0;
  const inspectorWidth = isTabletLandscape ? 340 : isTablet ? 300 : width;
  const contentPadding = isTablet ? 20 : isPhoneLandscape ? 16 : 14;

  return {
    width,
    height,
    isTablet,
    isLandscape,
    isTabletLandscape,
    isPhoneLandscape,
    isMobile,
    numColumns,
    sidebarWidth,
    inspectorWidth,
    contentPadding,
  };
}
