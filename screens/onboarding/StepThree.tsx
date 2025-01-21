import React, { memo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  VirtualizedList,
  Platform,
} from "react-native";
import { RouteProp } from "@react-navigation/native";
import Animated from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { format, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  OnboardingScreenNavigationProp,
  OnboardingStackParamList,
} from "../../@types/navigation";
import { MemoizedButton } from "../../components/MemoizedComponents";
import { useStepThreeForm } from "../../hooks/useStepThreeForm";

// Tipos para items da lista
type SectionTypes =
  | { type: "header" }
  | { type: "title" }
  | { type: "buttons" }
  | { type: "values" }
  | { type: "summary" }
  | { type: "footer" };

interface StepThreeProps {
  navigation: OnboardingScreenNavigationProp;
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

  const handleTypeChange = useCallback(
    (type: "fixed" | "growing") => {
      setInvestmentType(type);
    },
    [setInvestmentType]
  );

  // Helpers para VirtualizedList
  const sections: SectionTypes[] = [
    { type: "header" },
    { type: "title" },
    { type: "buttons" },
    { type: "values" },
    { type: "summary" },
    { type: "footer" },
  ];

  const getItem = (data: SectionTypes[], index: number) => data[index];
  const getItemCount = () => sections.length;

  // Renderizadores de seção
  const renderHeader = () => (
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
  );

  const renderTitle = () => (
    <Animated.View style={[styles.content, animations.contentStyle]}>
      <Text style={styles.title}>Método de Investimento</Text>
      <Text style={styles.subtitle}>
        Como você prefere distribuir seus aportes ao longo do tempo?
      </Text>
    </Animated.View>
  );

  const renderButtons = () => (
    <View>
      <View style={styles.helpContainer}>
        <Text style={styles.helpTitle}>Como funciona cada método?</Text>
        <View style={styles.helpItem}>
          <View style={styles.helpItemTitle}>
            <Feather
              name="minus"
              size={18}
              color="#007AFF"
              style={styles.helpIcon}
            />
            <Text style={styles.helpBold}>Aportes Fixos: </Text>
          </View>
          <Text style={styles.helpText}>
            Você investirá o mesmo valor todo mês, tornando mais fácil seu
            planejamento financeiro.
          </Text>
        </View>
        <View style={styles.helpItem}>
          <View style={styles.helpItemTitle}>
            <Feather
              name="trending-up"
              size={18}
              color="#007AFF"
              style={styles.helpIcon}
            />
            <Text style={styles.helpBold}>Aportes Crescentes: </Text>
          </View>
          <Text style={styles.helpText}>
            Comece com um valor menor e aumente gradualmente, acompanhando
            possíveis aumentos de renda.
          </Text>
        </View>
      </View>

      <View style={styles.methodContainer}>
        <MemoizedButton
          title=" Fixos"
          variant={investmentType === "fixed" ? "primary" : "outline"}
          onPress={() => handleTypeChange("fixed")}
          style={styles.methodButton}
        />
        <MemoizedButton
          title=" Crescentes"
          variant={investmentType === "growing" ? "primary" : "outline"}
          onPress={() => handleTypeChange("growing")}
          style={styles.methodButton}
        />
      </View>
    </View>
  );

  const renderValues = () => (
    <View style={styles.valuesContainer}>
      {investmentType === "fixed" ? (
        <Text style={styles.calculatedValue}>
          Valor mensal fixo:{"\n"}
          R$ {monthlyEstimate}
        </Text>
      ) : (
        <>
          <Text style={styles.tableTitle}>Progressão dos Aportes Mensais:</Text>
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
            {previewValues.map((item, index) => {
              const currentDate = addMonths(route.params.startDate, index);
              return (
                <View
                  key={index}
                  style={[
                    styles.tableRow,
                    index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd,
                  ]}
                >
                  <View style={[styles.tableCell, styles.monthColumn]}>
                    <Text style={styles.monthText}>
                      {format(currentDate, "MMMM", { locale: ptBR })}
                    </Text>
                    <Text style={styles.yearText}>
                      {format(currentDate, "yyyy", { locale: ptBR })}
                    </Text>
                  </View>
                  <View style={[styles.tableCell, styles.valueColumn]}>
                    <Text style={styles.valueText}>
                      R${" "}
                      {item.value.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </Text>
                    <Text style={styles.variationText}>
                      {index > 0
                        ? (
                            (item.value / previewValues[index - 1].value - 1) *
                            100
                          ).toFixed(1) + "%"
                        : "-"}
                    </Text>
                  </View>
                  <View style={[styles.tableCell, styles.valueColumn]}>
                    <Text style={styles.accumulatedText}>
                      R${" "}
                      {item.accumulated.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </Text>
                    <Text style={styles.progressText}>
                      {((item.accumulated / route.params.goal) * 100).toFixed(
                        0
                      )}
                      % da meta
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </>
      )}
    </View>
  );

  const renderSummary = () => (
    <View style={styles.summaryContainer}>
      <Text style={styles.summaryTitle}>Resumo:</Text>
      <Text style={styles.summaryText}>
        • Meta: R$ {route.params.goal.toLocaleString("pt-BR")}
      </Text>
      <Text style={styles.summaryText}>• Período: {totalMonths} meses</Text>
      <Text style={styles.summaryText}>
        • Método:{" "}
        {investmentType === "fixed" ? "Aportes Fixos" : "Aportes Crescentes"}
      </Text>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.buttonContainer}>
      <MemoizedButton
        title="Concluir"
        onPress={handleComplete}
        loading={loading}
        disabled={isDisabled}
      />
    </View>
  );

  const renderItem = ({ item }: { item: SectionTypes }) => {
    switch (item.type) {
      case "header":
        return renderHeader();
      case "title":
        return renderTitle();
      case "buttons":
        return renderButtons();
      case "values":
        return renderValues();
      case "summary":
        return renderSummary();
      case "footer":
        return renderFooter();
      default:
        return null;
    }
  };

  return (
    <VirtualizedList
      data={sections}
      renderItem={renderItem}
      getItem={getItem}
      getItemCount={getItemCount}
      keyExtractor={(item) => item.type}
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  helpContainer: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    marginBottom: 42,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  helpItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    rowGap: 8,
  },
  helpItem: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginTop: 16,
  },
  helpIcon: {
    marginRight: 8,
  },
  helpText: {
    flex: 1,
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  helpBold: {
    fontWeight: "600",
    color: "#333",
  },
  tableRowEven: {
    backgroundColor: "#FFFFFF",
  },
  tableRowOdd: {
    backgroundColor: "#F8F9FA",
  },
  monthText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  yearText: {
    fontSize: 12,
    color: "#666",
  },
  valueText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  variationText: {
    fontSize: 12,
    color: "#666",
  },
  accumulatedText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
  tableCell: {
    padding: 12,
    justifyContent: "center",
  },
  monthColumn: {
    flex: 1.2,
    borderRightWidth: 1,
    borderRightColor: "#E9ECEF",
  },
  valueColumn: {
    flex: 1.5,
    alignItems: "flex-end",
    borderRightWidth: 1,
    borderRightColor: "#E9ECEF",
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
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  table: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E9ECEF",
    marginTop: 12,
  },
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
    borderWidth: 1,
    borderColor: "#E0E0E0",
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
  progressText: {
    fontSize: 12,
    color: "#4CAF50",
  },
});
