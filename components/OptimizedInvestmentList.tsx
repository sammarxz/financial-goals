import React, { useCallback, memo } from "react";
import { View, VirtualizedList, StyleSheet, Text } from "react-native";
import { InvestmentCard } from "./InvestmentCard";
import type { MonthlyValue } from "../@types/schemas";

// Componente InvestmentCard otimizado com memo
const MemoizedInvestmentCard = memo(InvestmentCard);

interface InvestmentListProps {
  data: MonthlyValue[];
  onComplete: (month: string) => void;
  refreshControl?: React.ReactElement;
}

// Helper functions for VirtualizedList
const getItem = (data: MonthlyValue[], index: number) => data[index];
const getItemCount = (data: MonthlyValue[]) => data.length;
const keyExtractor = (item: MonthlyValue) => item.month;

export function OptimizedInvestmentList({
  data,
  onComplete,
}: InvestmentListProps) {
  // Memoize renderItem function
  const renderItem = useCallback(
    ({ item }: { item: MonthlyValue }) => (
      <MemoizedInvestmentCard
        month={item.formattedMonth}
        value={item.value}
        completed={item.completed}
        onComplete={() => onComplete(item.month)}
      />
    ),
    [onComplete]
  );

  // Memoize ListHeaderComponent
  const ListHeader = useCallback(
    () => (
      <View style={styles.header}>
        <Text style={styles.title}>
          Aportes Mensais
          <Text style={styles.remainingMonths}>
            {" "}
            ({data.filter((item) => !item.completed).length} restantes)
          </Text>
        </Text>
      </View>
    ),
    [data]
  );

  // Memoize ListEmptyComponent
  const ListEmpty = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Nenhum aporte encontrado</Text>
      </View>
    ),
    []
  );

  return (
    <VirtualizedList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItem={getItem}
      getItemCount={getItemCount}
      ListHeaderComponent={ListHeader}
      ListEmptyComponent={ListEmpty}
      windowSize={5}
      maxToRenderPerBatch={10}
      initialNumToRender={8}
      removeClippedSubviews={true}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  remainingMonths: {
    fontSize: 14,
    color: "#666",
    fontWeight: "normal",
  },
  emptyContainer: {
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
});
