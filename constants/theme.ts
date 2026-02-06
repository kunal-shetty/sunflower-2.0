/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#1B6B4A';
const tintColorDark = '#4ADE80';

export const Colors = {
  light: {
    text: '#1A1A2E',
    secondaryText: '#6B7280',
    background: '#F8FAFB',
    surface: '#FFFFFF',
    tint: tintColorLight,
    accent: '#1B6B4A',
    accentLight: '#E8F5EE',
    icon: '#6B7280',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: tintColorLight,
    border: '#E5E7EB',
    destructive: '#DC2626',
    warning: '#F59E0B',
    priorityHigh: '#DC2626',
    priorityMedium: '#F59E0B',
    priorityLow: '#1B6B4A',
    cardShadow: 'rgba(0, 0, 0, 0.06)',
  },
  dark: {
    text: '#F3F4F6',
    secondaryText: '#9CA3AF',
    background: '#0F1117',
    surface: '#1A1D27',
    tint: tintColorDark,
    accent: '#4ADE80',
    accentLight: '#1A2E23',
    icon: '#9CA3AF',
    tabIconDefault: '#6B7280',
    tabIconSelected: tintColorDark,
    border: '#2A2D37',
    destructive: '#EF4444',
    warning: '#FBBF24',
    priorityHigh: '#EF4444',
    priorityMedium: '#FBBF24',
    priorityLow: '#4ADE80',
    cardShadow: 'rgba(0, 0, 0, 0.3)',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
