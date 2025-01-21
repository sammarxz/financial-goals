import React from "react";
import { View, Text, StyleSheet, ScrollView, Platform } from "react-native";
import { RouteProp } from "@react-navigation/native";
import Animated from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import {
  OnboardingNavigationProp,
  OnboardingStackParamList,
} from "../../@types/navigation";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { useStepThreeForm } from "../../hooks/useStepThreeForm";

interface StepThreeProps {
  navigation: OnboardingNavigationProp;
  route: RouteProp<OnboardingStackParamList, "StepThree">;
}

export function StepThree({ navigation, route }: StepThreeProps) {
  const {
    investmentType,
    loading,
    animations,
    totalMonths,
    monthlyEstimate,
    previewValues,
    setInvestmentType,
    handleComplete,
    isDisabled,
  } = useStepThreeForm({
    navigation,
    initialData: route.params,
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, styles.stepCompleted]}>
            <Feather name="check" size={20} color="#FFF" />
          </View>
          <View style={[styles.stepLine, styles.stepCompleted]} />
          <View style={[styles.stepDot, styles.stepCompleted]}>
            <Feather name="check" size={20} color="#FFF" />
          </View>
          <View style={[styles.stepLine, styles.stepCompleted]} />
          <View style={styles.stepDot}>
            <Feather name="dollar-sign" size={20} color="#FFF" />
          </View>
        </View>
      </View>

      <Animated.View style={[styles.content, animations.contentStyle]}>
        <Text style={styles.title}>Método de Investimento</Text>
        <Text style={styles.subtitle}>
          Como você prefere distribuir seus aportes ao longo do tempo?
        </Text>

        <View style={styles.methodContainer}>
          <Button
            title="Aportes Fixos"
            variant={investmentType === "fixed" ? "primary" : "outline"}
            onPress={() => setInvestmentType("fixed")}
            style={styles.methodButton}
          />
          <Button
            title="Aportes Crescentes"
            variant={investmentType === "growing" ? "primary" : "outline"}
            onPress={() => setInvestmentType("growing")}
            style={styles.methodButton}
          />
        </View>

        <View style={styles.valuesContainer}>
          {investmentType === "fixed" ? (
            <Text style={styles.calculatedValue}>
              Valor mensal fixo:{"\n"}
              R$ {monthlyEstimate}
            </Text>
          ) : (
            <>
              <Text style={styles.tableTitle}>
                Progressão dos Aportes Mensais:
              </Text>
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, styles.monthColumn]}>
                    Mês
                  </Text>
                  <Text style={[styles.tableHeaderText, styles.valueColumn]}>
                    Aporte
                  </Text>
                  <Text style={[styles.tableHeaderText, styles.valueColumn]}>
                    Acumulado
                  </Text>
                </View>
                {previewValues.map((item, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.monthColumn]}>
                      {item.month}
                    </Text>
                    <Text style={[styles.tableCell, styles.valueColumn]}>
                      R${" "}
                      {item.value.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </Text>
                    <Text style={[styles.tableCell, styles.valueColumn]}>
                      R${" "}
                      {item.accumulated.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>

        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Resumo:</Text>
          <Text style={styles.summaryText}>
            • Meta: R$ {route.params.goal.toLocaleString("pt-BR")}
          </Text>
          <Text style={styles.summaryText}>• Período: {totalMonths} meses</Text>
          <Text style={styles.summaryText}>
            • Método:{" "}
            {investmentType === "fixed"
              ? "Aportes Fixos"
              : "Aportes Crescentes"}
          </Text>
        </View>
      </Animated.View>

      <View style={styles.buttonContainer}>
        <Button
          title="Concluir"
          onPress={handleComplete}
          loading={loading}
          disabled={isDisabled}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    paddingVertical: 24,
  },
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  stepDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
  },
  stepCompleted: {
    backgroundColor: "#4CAF50",
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#E9ECEF",
    marginHorizontal: 8,
  },
  content: {
    flex: 1,
    marginTop: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
  },
  methodContainer: {
    flexDirection: "row",
    marginBottom: 24,
  },
  methodButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  inputsContainer: {
    marginBottom: 24,
  },
  calculatedValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginVertical: 16,
    lineHeight: 24,
  },
  summaryContainer: {
    padding: 16,
    backgroundColor: "#FFF",
    borderRadius: 8,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  buttonContainer: {
    marginTop: "auto",
    marginBottom: Platform.OS === "ios" ? 16 : 24,
  },
  valuesContainer: {
    marginVertical: 24,
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  table: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F8F9FA",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  tableCell: {
    fontSize: 14,
    color: "#666",
  },
  monthColumn: {
    flex: 1,
  },
  valueColumn: {
    flex: 1.5,
    textAlign: "right",
  },
});
