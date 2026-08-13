// Colored icon-square swatches for habit accents, matching the dark mockup
// (teal, blue, purple, pink, orange, yellow, red, green). Unlike the earlier
// warm-only "Ember" swatch set, cool hues read fine here since they sit on
// near-black cards instead of a warm cream background.
export const habitColors = [
  '#14B8A6', // teal
  '#3B82F6', // blue
  '#A855F7', // purple
  '#EC4899', // pink
  '#F5A623', // orange -- matches flameGold
  '#FACC15', // yellow
  '#EF4444', // red
  '#22C55E', // green
];

// Dark-mockup palette: near-black background, layered dark surfaces, and a
// warm Ember orange accent (flameGold -> flameEmber) carried over from the
// earlier identity. This is now the fully-designed, source-of-truth palette.
export const darkColors = {
  background: '#0F0F0F',
  surface: '#1A1A1A',
  surfaceElevated: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
  textTertiary: '#6B6B6B',
  border: '#2C2C2C',
  primary: '#E8590C',
  primaryText: '#FFFFFF',
  success: '#3ECF8E',
  danger: '#FF6161',
  overlay: 'rgba(0, 0, 0, 0.6)',
  shadow: '#000000',
  flameGold: '#F5A623',
  flameEmber: '#E8590C',
};

export type ThemeColors = typeof darkColors;

// TODO(design): the light palette hasn't been designed for this new
// dark-mockup-driven direction yet -- this is a placeholder clone of
// darkColors so `colorScheme: 'light'` type-checks and renders something
// coherent instead of breaking, not real light-theme values. Replace this
// with an actual light palette in a follow-up pass.
export const lightColors: ThemeColors = {
  ...darkColors,
};
