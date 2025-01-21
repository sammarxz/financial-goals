import React, { useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { RootStackParamList } from "../@types/navigation";
import { useUser } from "../contexts/UserContext";
import { useInvestment } from "../hooks/useInvestment";
import { ProgressBar } from "../components/ProgressBar";
import { InvestmentCard } from "../components/InvestmentCard";
import { Layout } from "../components/Layout";

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function Home() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { userData } = useUser();
  const {
    totalInvested,
    progress,
    remainingValue,
    monthlyData,
    handleCompleteMonth,
  } = useInvestment();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  if (!userData) return null;

  const remainingMonths = monthlyData.filter((item) => !item.completed).length;

  return (
    <Layout>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, {userData.name}!</Text>
          <Text style={styles.date}>
            {format(new Date(), "EEEE',' dd 'de' MMMM", { locale: ptBR })}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate("Settings")}
          style={styles.settingsButton}
        >
          <Feather name="settings" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalTitle}>Meta de Investimento</Text>
            <Text style={styles.goalValue}>
              R$ {userData.goal.toLocaleString("pt-BR")}
            </Text>
          </View>

          <ProgressBar progress={progress} showPercentage height={12} />

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

        <View style={styles.investmentsSection}>
          <Text style={styles.sectionTitle}>
            Aportes Mensais
            <Text style={styles.remainingMonths}>
              {" "}
              ({remainingMonths} restantes)
            </Text>
          </Text>

          {monthlyData.map((item) => (
            <InvestmentCard
              key={item.month}
              month={item.formattedMonth}
              value={item.value}
              completed={item.completed}
              onComplete={() => handleCompleteMonth(item.month)}
            />
          ))}
        </View>
      </ScrollView>
    </Layout>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
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
  container: {
    flex: 1,
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
  chartSection: {
    padding: 16,
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  investmentsSection: {
    padding: 16,
    paddingBottom: 32,
  },
  remainingMonths: {
    fontSize: 14,
    color: "#666",
    fontWeight: "normal",
  },
});
