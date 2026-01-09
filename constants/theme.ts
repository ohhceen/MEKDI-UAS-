/**
 * Color system for light & dark mode.
 * Designed to work with ThemedText, ThemedView, and useThemeColor.
 */

import { Platform } from 'react-native';

/* Brand Colors */
const mekdiRed = '#a40a0a';
const mekdiYellow = '#ffc72c';

export const Colors = {
  light: {
    // Base
    text: '#11181C',
    background: '#ffffff',

    // Existing (tetap dipertahankan)
    tint: mekdiRed,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: mekdiRed,

    // ➕ Semantic UI Colors
    card: '#ffffff',
    border: '#e5e5e5',
    price: mekdiRed,
    button: mekdiRed,
    buttonText: '#ffffff',
  },

  dark: {
    // Base
    text: '#ECEDEE',
    background: '#151718',

    // Existing (tetap dipertahankan)
    tint: '#ffffff',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#ffffff',

    // ➕ Semantic UI Colors
    card: '#1e1e1e',
    border: '#2c2c2c',
    price: mekdiYellow,
    button: mekdiYellow,
    buttonText: '#000000',
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
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono:
      "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
