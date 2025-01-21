import React from "react";
import { View, Dimensions, StyleSheet } from "react-native";
import { LineChart } from "react-native-chart-kit";

interface ChartProps {
  data: {
    labels: string[];
    values: number[];
  };
}

export function Chart({ data }: ChartProps) {
  const screenWidth = Dimensions.get("window").width;

  return (
    <View style={styles.container}>
      <LineChart
        data={{
          labels: data.labels,
          datasets: [
            {
              data: data.values,
            },
          ],
        }}
        width={screenWidth - 32}
        height={220}
        chartConfig={{
          backgroundColor: "#FFF",
          backgroundGradientFrom: "#FFF",
          backgroundGradientTo: "#FFF",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        bezier
        style={styles.chart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  chart: {
    borderRadius: 16,
  },
});
