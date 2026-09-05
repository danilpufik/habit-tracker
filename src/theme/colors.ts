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
  '#CA8A04', // yellow -- deepened from #FACC15, which nearly vanished as a `${color}22` wash on a light surface
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

// Light counterpart of the dark-mockup palette above: warm off-white surfaces,
// near-black text, same Ember (primary/flameGold/flameEmber) brand accent so
// the two themes stay visually related rather than reading as different apps.
export const lightColors: ThemeColors = {
  background: '#FAF9F7',
  surface: '#FFFFFF',
  surfaceElevated: '#F4F2EE',
  text: '#1A1A1A',
  textSecondary: '#6B6B6B',
  textTertiary: '#9B9B9B',
  border: '#E6E3DE',
  primary: '#E8590C',
  primaryText: '#FFFFFF',
  success: '#1F9D63', // darkened from darkColors' mint for contrast against a white surface
  danger: '#DC3A3A', // darkened from darkColors' red for the same reason
  overlay: 'rgba(15, 14, 12, 0.4)',
  shadow: '#000000',
  flameGold: '#F5A623',
  flameEmber: '#E8590C',
};
