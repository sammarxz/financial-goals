import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Input } from "./Input";

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onChangeStart: (date: Date) => void;
  onChangeEnd: (date: Date) => void;
}

export function DateRangePicker({
  startDate,
  endDate,
  onChangeStart,
  onChangeEnd,
}: DateRangePickerProps) {
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const onChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowStartPicker(false);
      setShowEndPicker(false);
    }

    if (selectedDate) {
      if (showStartPicker) {
        onChangeStart(selectedDate);
        // Se a data final for menor que a inicial, ajusta automaticamente
        if (endDate < selectedDate) {
          onChangeEnd(selectedDate);
        }
      } else {
        onChangeEnd(selectedDate);
      }
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.inputContainer}
        onPress={() => setShowStartPicker(true)}
        activeOpacity={0.7}
      >
        <Input
          label="Data Inicial"
          value={format(startDate, "dd/MM/yyyy", { locale: ptBR })}
          editable={false}
          pointerEvents="none"
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.inputContainer}
        onPress={() => setShowEndPicker(true)}
        activeOpacity={0.7}
      >
        <Input
          label="Data Final"
          value={format(endDate, "dd/MM/yyyy", { locale: ptBR })}
          editable={false}
          pointerEvents="none"
        />
      </TouchableOpacity>

      {(showStartPicker || showEndPicker) && (
        <DateTimePicker
          testID="dateTimePicker"
          value={showStartPicker ? startDate : endDate}
          mode="date"
          is24Hour={true}
          onChange={onChange}
          minimumDate={showStartPicker ? new Date() : startDate}
          display={Platform.OS === "ios" ? "spinner" : "default"}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 8,
  },
});
