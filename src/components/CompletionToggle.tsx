import React, { useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  interpolateColor,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface CompletionToggleProps {
  completed: boolean;
  color: string;
  onPress: () => void;
  size?: number;
}

const CHECK_PATH = 'M6 13L10.5 17.5L18 7';
// Approximate length of CHECK_PATH, rounded up -- only needs to be >= the
// actual path length for the standard dashoffset draw-in technique to work.
const CHECK_LENGTH = 20;

export function CompletionToggle({
  completed,
  color,
  onPress,
  size = 32,
}: CompletionToggleProps) {
  const theme = useTheme();
  const fill = useSharedValue(completed ? 1 : 0);
  const scale = useSharedValue(1);
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    if (completed) {
      fill.value = withTiming(1, { duration: 180 });
      scale.value = withSequence(
        withTiming(1.15, { duration: 90 }),
        withSpring(1, { damping: 10, stiffness: 200 })
      );
    } else {
      fill.value = withTiming(0, { duration: 150 });
      scale.value = withTiming(1, { duration: 150 });
    }
  }, [completed, fill, scale]);

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderColor: interpolateColor(fill.value, [0, 1], [theme.colors.border, color]),
    backgroundColor: interpolateColor(fill.value, [0, 1], ['transparent', color]),
  }));

  const checkAnimatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CHECK_LENGTH * (1 - fill.value),
  }));

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={{ width: size, height: size }}
    >
      <Animated.View
        style={[
          styles.base,
          circleStyle,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      >
        <Svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24">
          <AnimatedPath
            d={CHECK_PATH}
            stroke="#FFFFFF"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            strokeDasharray={CHECK_LENGTH}
            animatedProps={checkAnimatedProps}
          />
        </Svg>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
