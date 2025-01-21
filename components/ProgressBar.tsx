import React from "react";
import { View, StyleSheet, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

interface ProgressBarProps {
  progress: number;
  showPercentage?: boolean;
  height?: number;
}

export function ProgressBar({
  progress,
  showPercentage = true,
  height = 8,
}: ProgressBarProps) {
  const width = Math.min(Math.max(progress, 0), 100);

  const animatedStyle = useAnimatedStyle(() => ({
    width: withSpring(`${width}%`, {
      damping: 20,
      stiffness: 90,
    }),
  }));

  return (
    <View style={[styles.container, { height }]}>
      <Animated.View style={[styles.progress, animatedStyle]} />
      {showPercentage && (
        <Text style={styles.percentage}>{width.toFixed(1)}%</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
    position: "relative",
  },
  progress: {
    height: "100%",
    backgroundColor: "#4CAF50",
  },
  percentage: {
    position: "absolute",
    top: -2,
    right: 8,
    color: "#333",
    fontSize: 12,
    fontWeight: "600",
  },
});
