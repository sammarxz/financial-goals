import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

interface InvestmentCardProps {
  month: string;
  value: number;
  completed: boolean;
  onComplete: () => void;
}

export function InvestmentCard({
  month,
  value,
  completed,
  onComplete,
}: InvestmentCardProps) {
  return (
    <View style={[styles.container, completed && styles.completedContainer]}>
      <View>
        <Text style={styles.month}>{month}</Text>
        <Text style={styles.value}>
          R$ {value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.checkbox, completed && styles.completed]}
        onPress={onComplete}
        disabled={completed}
      >
        {completed && <Feather name="check" size={20} color="#FFF" />}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  completedContainer: {
    opacity: 0.7,
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
