// Colored icon-square swatches for habit accents, matching the Strata identity
// (sage teal, gold, plum, rust, slate blue, moss, mauve, sand). Shared verbatim
// between light and dark -- carried over unchanged per the Strata brand rule.
export const habitColors = [
  '#54AB8F',
  '#D7A758',
  '#8B5A7C',
  '#C1694F',
  '#5C7AA0',
  '#6B8F5C',
  '#B97E8A',
  '#C9B38A',
];

// Screen-reader labels for habitColors, same order/index -- the names already
// used in the comment above (sage teal, gold, plum, rust, slate blue, moss,
// mauve, sand).
export const habitColorNames = [
  'Teal',
  'Gold',
  'Plum',
  'Rust',
  'Slate blue',
  'Moss',
  'Mauve',
  'Sand',
];

// Strata identity palette: cool ink background, layered slate-blue surfaces,
// and a muted sage-teal accent (flameGold -> flameEmber, still a two-stop
// gradient for ProgressRing/MonthHeatmap) replacing the earlier warm Ember
// identity. primary/flameGold/flameEmber are kept as three visibly distinct
// hues on purpose -- an earlier revision let primary===flameEmber and the
// MonthHeatmap "today" ring (drawn in primary) vanished against a fully-lit
// heat cell (drawn in flameEmber). Don't collapse them again.
export const darkColors = {
  background: '#12141A',
  surface: '#1B1E27',
  surfaceElevated: '#242837', // unused today; kept one step lighter than surface in the same cool hue family
  text: '#EEEAE2',
  textSecondary: '#9A9FAE',
  textTertiary: '#5C6274',
  border: '#2F3444',
  primary: '#54AB8F',
  primaryText: '#12141A',
  // Shifted further from the old mint (#3ECF8E) toward yellow-green so it stays
  // visibly distinct from the new sage-teal `primary` (#54AB8F) instead of
  // reading as the same color -- the two used to be far apart (orange vs mint).
  success: '#7CB668',
  danger: '#E2645C',
  overlay: 'rgba(0, 0, 0, 0.6)',
  shadow: '#000000',
  flameGold: '#D7A758',
  flameEmber: '#C1694F',
};

export type ThemeColors = typeof darkColors;

// Light counterpart: warm parchment surfaces, near-black text, the same
// primary/flameGold/flameEmber/habitColors brand accents carried over
// unchanged (including primaryText, since it's a fixed contrast pairing with
// the also-unchanged `primary`) so the two themes stay visually related.
export const lightColors: ThemeColors = {
  background: '#F5F1E8',
  surface: '#FBF9F4',
  surfaceElevated: '#F0EADC', // unused today; kept between background and surface in the same warm hue family
  text: '#1B1B1E',
  textSecondary: '#6B6F7A',
  textTertiary: '#9A9FAE',
  border: '#E4DFD3',
  primary: '#54AB8F',
  primaryText: '#12141A',
  // Same distinct-from-primary reasoning as darkColors.success, darkened for
  // contrast against this palette's light surface.
  success: '#4F7A3A',
  danger: '#C6483F', // darkened from darkColors' danger for contrast against a light surface
  overlay: 'rgba(15, 14, 12, 0.4)',
  shadow: '#000000',
  flameGold: '#D7A758',
  flameEmber: '#C1694F',
};
