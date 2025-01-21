import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { RootStackNavigation } from "../@types/navigation";
import { MonthlyValue } from "../@types/schemas";

import { useInvestmentData } from "../hooks/useInvestmentData";
import { useOptimizedAnimations } from "../hooks/useOptimizedAnimations";

import { OptimizedInvestmentList } from "../components/OptimizedInvestmentList";
import { MemoizedProgressBar } from "../components/MemoizedComponents";
import { Layout } from "../components/Layout";

// Memoized header component
const Header = React.memo(
  ({
    name,
    onSettingsPress,
  }: {
    name: string;
    onSettingsPress: () => void;
  }) => (
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>Olá, {name}!</Text>
        <Text style={styles.date}>
          {format(new Date(), "EEEE',' dd 'de' MMMM", { locale: ptBR })}
        </Text>
      </View>
      <TouchableOpacity onPress={onSettingsPress} style={styles.settingsButton}>
        <Feather name="settings" size={24} color="#333" />
      </TouchableOpacity>
    </View>
  )
);

// Memoized goal card component
const GoalCard = React.memo(
  ({
    goal,
    progress,
    totalInvested,
    remainingValue,
  }: {
    goal: number;
    progress: number;
    totalInvested: number;
    remainingValue: number;
  }) => (
    <View style={styles.goalCard}>
      <View style={styles.goalHeader}>
        <Text style={styles.goalTitle}>Meta de Investimento</Text>
        <Text style={styles.goalValue}>R$ {goal.toLocaleString("pt-BR")}</Text>
      </View>

      <MemoizedProgressBar progress={progress} showPercentage height={12} />

      <View style={styles.goalInfo}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Investido</Text>
          <Text style={styles.infoValue}>
            R$ {totalInvested.toLocaleString("pt-BR")}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Restante</Text>
          <Text style={styles.infoValue}>
            R$ {remainingValue.toLocaleString("pt-BR")}
          </Text>
        </View>
      </View>
    </View>
  )
);

export function Home() {
  const navigation = useNavigation<RootStackNavigation>();
  const [refreshing, setRefreshing] = useState(false);
  const { userData, totalInvested, progress, remainingValue, toggleMonth } =
    useInvestmentData();
  const { startEntryAnimation } = useOptimizedAnimations();

  // Memoize callbacks
  const handleSettingsPress = useCallback(() => {
    navigation.navigate("Settings");
  }, [navigation]);

  const handleToggleMonth = useCallback(
    async (month: string) => {
      try {
        await toggleMonth(month);
      } catch (error) {
        console.error("Error toggling month:", error);
      }
    },
    [toggleMonth]
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  // Start entry animation when component mounts
  React.useEffect(() => {
    startEntryAnimation();
  }, [startEntryAnimation]);

  if (!userData) return null;

  // Memoize monthly data calculation
  const monthlyData: MonthlyValue[] = useMemo(
    () =>
      Object.entries(userData.monthlyValues)
        .sort(
          ([dateA], [dateB]) =>
            new Date(dateA).getTime() - new Date(dateB).getTime()
        )
        .map(([month, value]) => ({
          month,
          formattedMonth: format(new Date(month), "MMMM/yyyy", {
            locale: ptBR,
          }),
          value,
          completed: userData.completedMonths.includes(month),
        })),
    [userData.monthlyValues, userData.completedMonths]
  );

  return (
    <Layout>
      <Header name={userData.name} onSettingsPress={handleSettingsPress} />

      <GoalCard
        goal={userData.goal}
        progress={progress}
        totalInvested={totalInvested}
        remainingValue={remainingValue}
      />

      <OptimizedInvestmentList
        data={monthlyData}
        onToggle={handleToggleMonth}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </Layout>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  greeting: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
  },
  date: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  settingsButton: {
    padding: 8,
  },
  goalCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    margin: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  goalHeader: {
    marginBottom: 16,
  },
  goalTitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
  },
  goalValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
  },
  goalInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E9ECEF",
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
});
