// Warm, Ember-consistent swatches -- deliberately no cool blue/violet, so any
// habit's accent color (icon background, checkbox fill) sits comfortably
// alongside the app's own warm palette instead of clashing with it.
export const habitColors = [
  '#E8432B', // ember red -- default, matches flameEmber
  '#F2994A', // warm amber
  '#FFB020', // flame gold
  '#2FAE66', // forest green
  '#1B8F82', // deep warm teal
  '#B5541A', // terracotta
  '#D6455D', // berry rose
  '#8C5A2B', // mustard brown
];

// "Ember" -- warm streak-fire identity. The flame pair (flameGold/flameEmber)
// is the signature gradient used by the progress ring and the completion glow;
// its warmth is meant to visually "heat up" the longer a streak runs.
export const lightColors = {
  background: '#FBF3EA',
  surface: '#FFFCF7',
  surfaceElevated: '#FFFFFF',
  text: '#2B211B',
  textSecondary: '#7A6C61',
  textTertiary: '#A79688',
  border: '#EFE1D2',
  primary: '#F4511E',
  primaryText: '#FFFFFF',
  success: '#2FAE66',
  danger: '#E5484D',
  overlay: 'rgba(43, 33, 27, 0.45)',
  shadow: '#2B211B',
  flameGold: '#FFB020',
  flameEmber: '#E8432B',
};

export const darkColors = {
  background: '#1A1310',
  surface: '#241B17',
  surfaceElevated: '#2E221D',
  text: '#F5EDE6',
  textSecondary: '#B8A99C',
  textTertiary: '#8A7A6C',
  border: '#3A2C25',
  primary: '#FF6B35',
  primaryText: '#FFFFFF',
  success: '#3ECF8E',
  danger: '#FF6161',
  overlay: 'rgba(0, 0, 0, 0.6)',
  shadow: '#000000',
  flameGold: '#FFC93C',
  flameEmber: '#FF7A45',
};

export type ThemeColors = typeof lightColors;
