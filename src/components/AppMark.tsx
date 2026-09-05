import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { useTheme } from '../theme';

interface AppMarkProps {
  size?: number;
  strokeWidth?: number;
  /** Overrides the checkmark stroke color (defaults to theme.colors.text).
   * Needed anywhere the mark must render on a fixed background that doesn't
   * track the current color scheme, e.g. App.tsx's always-ink loading screen. */
  checkColor?: string;
}

// The Strata app mark: a flameGold -> flameEmber ring (same gradient
// primitive ProgressRing uses) with an inscribed checkmark. Intentionally
// reuses react-native-svg rather than a second graphics approach.
export function AppMark({ size = 96, strokeWidth = 8, checkColor }: AppMarkProps) {
  const theme = useTheme();
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  const checkStart = { x: center - radius * 0.45, y: center + radius * 0.05 };
  const checkMid = { x: center - radius * 0.1, y: center + radius * 0.4 };
  const checkEnd = { x: center + radius * 0.5, y: center - radius * 0.3 };

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="appMarkFlame" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={theme.colors.flameGold} />
            <Stop offset="100%" stopColor={theme.colors.flameEmber} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="url(#appMarkFlame)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Path
          d={`M ${checkStart.x} ${checkStart.y} L ${checkMid.x} ${checkMid.y} L ${checkEnd.x} ${checkEnd.y}`}
          stroke={checkColor ?? theme.colors.text}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    </View>
  );
}
