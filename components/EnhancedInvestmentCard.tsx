import React, { useCallback } from "react";
import { View, Text, StyleSheet, Vibration, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Audio } from "expo-av";

interface InvestmentCardProps {
  month: string;
  value: number;
  completed: boolean;
  onToggle: () => void;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export function EnhancedInvestmentCard({
  month,
  value,
  completed,
  onToggle,
}: InvestmentCardProps) {
  const playSuccessSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../assets/sounds/success.mp3")
      );
      await sound.playAsync();
    } catch (error) {
      console.log("Error playing sound:", error);
    }
  };

  const handleToggle = useCallback(async () => {
    Vibration.vibrate(50);

    if (!completed) {
      await playSuccessSound();
    }

    onToggle();
  }, [completed, onToggle]);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(completed ? 1 : 1, {
          damping: 15,
          stiffness: 200,
        }),
      },
    ],
  }));

  return (
    <View style={styles.wrapper}>
      <AnimatedView
        style={[
          styles.container,
          completed && styles.completedContainer,
          cardAnimatedStyle,
        ]}
      >
        <Pressable
          style={styles.pressableContent}
          onPress={handleToggle}
          android_ripple={{ color: "rgba(0, 0, 0, 0.1)" }}
        >
          <View style={styles.contentContainer}>
            <View>
              <Text style={styles.month}>{month}</Text>
              <Text style={styles.value}>
                R$ {value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </Text>
            </View>

            <View style={[styles.checkbox, completed && styles.completed]}>
              {completed && <Feather name="check" size={20} color="#FFF" />}
            </View>
          </View>
        </Pressable>
      </AnimatedView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 8,
  },
  container: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    overflow: "hidden", // Important for ripple effect
  },
  pressableContent: {
    width: "100%",
  },
  contentContainer: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  completedContainer: {
    backgroundColor: "#F8FFF8",
    borderColor: "#4CAF50",
  },
  month: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  value: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
  },
  completed: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
});
