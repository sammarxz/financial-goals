import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { format, differenceInMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { z } from "zod";

import { useNotificationStore } from "../stores/notificationStore";
import { useUserStore } from "../stores/userStore";
import { useAppConfigStore } from "../stores/configStore";

import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { DateRangePicker } from "../components/DateRangePicker";
import { Layout } from "../components/Layout";

import { RootStackNavigation } from "../@types/navigation";
import { AppConfig, UserData } from "../@types/schemas";

import { calculateMonthlyValues } from "../utils/calculateMonthlyValues";

const themeOptions: Record<AppConfig["theme"], string> = {
  light: "Claro",
  dark: "Escuro",
  system: "Sistema",
};

type CurrencyOption = {
  label: string;
  symbol: string;
};

const currencyOptions: Record<AppConfig["currency"], CurrencyOption> = {
  BRL: { label: "Real (R$)", symbol: "R$" },
  USD: { label: "Dólar (US$)", symbol: "US$" },
  EUR: { label: "Euro (€)", symbol: "€" },
};

export function Settings() {
  const navigation = useNavigation<RootStackNavigation>();
  const userData = useUserStore((state) => state.userData);
  const setUserData = useUserStore((state) => state.setUserData);
  const clearUserData = useUserStore((state) => state.clearUserData);
  const notificationsEnabled = useNotificationStore((state) => state.enabled);
  const toggleNotifications = useNotificationStore(
    (state) => state.toggleNotifications
  );
  const { theme, currency, setTheme, setCurrency } = useAppConfigStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(userData?.name || "");
  const [editedGoal, setEditedGoal] = useState(
    userData?.goal.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    }) || ""
  );
  const [editedStartDate, setEditedStartDate] = useState(
    userData?.startDate || new Date()
  );
  const [editedEndDate, setEditedEndDate] = useState(
    userData?.endDate || new Date()
  );
  const [editedInvestmentType, setEditedInvestmentType] = useState<
    UserData["investmentType"]
  >(userData?.investmentType || "fixed");

  if (!userData) return null;

  const handleToggleNotifications = async () => {
    try {
      await toggleNotifications();
    } catch (error) {
      Alert.alert(
        "Erro",
        "Não foi possível alterar as configurações de notificação"
      );
    }
  };

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    const numberFormat = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });

    return numberFormat.format(Number(numbers) / 100);
  };

  const handleGoalChange = (text: string) => {
    const formattedValue = formatCurrency(text);
    setEditedGoal(formattedValue);
  };

  const handleSaveChanges = async () => {
    try {
      // Construir os dados para validação
      const goalValue = Number(editedGoal.replace(/\D/g, "")) / 100;
      const newUserData: UserData = {
        ...userData,
        name: editedName,
        goal: goalValue,
        startDate: editedStartDate,
        endDate: editedEndDate,
        investmentType: editedInvestmentType,
        monthlyValues: calculateMonthlyValues(
          goalValue,
          editedStartDate,
          editedEndDate,
          editedInvestmentType
        ),
        completedMonths: [],
      };

      // Validar com Zod antes de salvar
      await setUserData(newUserData);
      setIsEditing(false);
      Alert.alert("Sucesso", "Dados atualizados com sucesso!");
    } catch (error) {
      if (error instanceof z.ZodError) {
        if (error instanceof z.ZodError) {
          Alert.alert("Erro de Validação", error.errors[0].message);
        } else {
          Alert.alert("Erro", "Não foi possível salvar as alterações");
        }
      } else {
        Alert.alert("Erro", "Não foi possível salvar as alterações");
      }
    }
  };

  const handleClearData = () => {
    Alert.alert(
      "Limpar Dados",
      "Tem certeza que deseja apagar todos os dados? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          style: "destructive",
          onPress: async () => {
            try {
              await clearUserData();
              navigation.reset({
                index: 0,
                routes: [{ name: "Onboarding", params: { screen: "StepOne" } }],
              });
            } catch (error) {
              Alert.alert("Erro", "Não foi possível limpar os dados");
            }
          },
        },
      ]
    );
  };

  return (
    <Layout>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              if (isEditing) {
                Alert.alert("Atenção", "Deseja descartar as alterações?", [
                  {
                    text: "Não",
                    style: "cancel",
                  },
                  {
                    text: "Sim",
                    onPress: () => {
                      setIsEditing(false);
                      navigation.goBack();
                    },
                  },
                ]);
              } else {
                navigation.goBack();
              }
            }}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Configurações</Text>
          <TouchableOpacity
            onPress={() => setIsEditing(!isEditing)}
            style={styles.editButton}
          >
            <Feather name={isEditing ? "x" : "edit-2"} size={20} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informações Pessoais</Text>
            {isEditing ? (
              <>
                <Input
                  label="Nome"
                  value={editedName}
                  onChangeText={setEditedName}
                  autoCapitalize="words"
                />
                <Input
                  label="Meta"
                  value={editedGoal}
                  onChangeText={handleGoalChange}
                  keyboardType="numeric"
                />
                <View style={styles.dateContainer}>
                  <Text style={styles.dateLabel}>Período</Text>
                  <DateRangePicker
                    startDate={editedStartDate}
                    endDate={editedEndDate}
                    onChangeStart={setEditedStartDate}
                    onChangeEnd={setEditedEndDate}
                  />
                </View>
                <View style={styles.investmentTypeContainer}>
                  <Text style={styles.dateLabel}>Tipo de Investimento</Text>
                  <View style={styles.buttonGroup}>
                    <Button
                      title="Aportes Fixos"
                      variant={
                        editedInvestmentType === "fixed" ? "primary" : "outline"
                      }
                      onPress={() => setEditedInvestmentType("fixed")}
                      style={styles.typeButton}
                    />
                    <Button
                      title="Aportes Crescentes"
                      variant={
                        editedInvestmentType === "growing"
                          ? "primary"
                          : "outline"
                      }
                      onPress={() => setEditedInvestmentType("growing")}
                      style={styles.typeButton}
                    />
                  </View>
                </View>
              </>
            ) : (
              <>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Nome</Text>
                  <Text style={styles.infoValue}>{userData.name}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Meta</Text>
                  <Text style={styles.infoValue}>
                    R$ {userData.goal.toLocaleString("pt-BR")}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Período</Text>
                  <Text style={styles.infoValue}>
                    {format(userData.startDate, "dd/MM/yyyy", { locale: ptBR })}{" "}
                    até{" "}
                    {format(userData.endDate, "dd/MM/yyyy", { locale: ptBR })}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Tipo de Investimento</Text>
                  <Text style={styles.infoValue}>
                    {userData.investmentType === "fixed"
                      ? "Aportes Fixos"
                      : "Aportes Crescentes"}
                  </Text>
                </View>
              </>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notificações</Text>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleToggleNotifications}
            >
              <View style={styles.optionContent}>
                <Text style={styles.optionText}>Notificações de Aporte</Text>
                <View
                  style={[
                    styles.toggle,
                    notificationsEnabled && styles.toggleActive,
                  ]}
                >
                  <View
                    style={[
                      styles.toggleCircle,
                      notificationsEnabled && styles.toggleCircleActive,
                    ]}
                  />
                </View>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>Tema</Text>
            <View style={styles.buttonGroup}>
              {(
                Object.entries(themeOptions) as [AppConfig["theme"], string][]
              ).map(([key, label]) => (
                <Button
                  key={key}
                  title={label}
                  variant={theme === key ? "primary" : "outline"}
                  onPress={() => setTheme(key)}
                  style={styles.themeButton}
                />
              ))}
            </View>
          </View>

          {/* Botões de moeda */}
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>Moeda</Text>
            <View style={styles.buttonGroup}>
              {(
                Object.entries(currencyOptions) as [
                  AppConfig["currency"],
                  CurrencyOption
                ][]
              ).map(([key, { label }]) => (
                <Button
                  key={key}
                  title={label}
                  variant={currency === key ? "primary" : "outline"}
                  onPress={() => setCurrency(key)}
                  style={styles.currencyButton}
                />
              ))}
            </View>
          </View>

          {isEditing ? (
            <View style={styles.section}>
              <Button title="Salvar Alterações" onPress={handleSaveChanges} />
            </View>
          ) : (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Dados</Text>
              <Button
                title="Limpar Todos os Dados"
                variant="outline"
                onPress={handleClearData}
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  backButton: {
    padding: 8,
  },
  editButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  infoItem: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  optionButton: {
    paddingVertical: 8,
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#E9ECEF",
    padding: 2,
  },
  toggleActive: {
    backgroundColor: "#4CAF50",
  },
  toggleCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FFF",
  },
  toggleCircleActive: {
    transform: [{ translateX: 20 }],
  },
  dateContainer: {
    marginVertical: 16,
  },
  dateLabel: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
  },
  investmentTypeContainer: {
    marginBottom: 16,
  },
  buttonGroup: {
    flexDirection: "row",
    marginTop: 8,
  },
  typeButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  preferenceItem: {
    marginBottom: 16,
  },
  preferenceLabel: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
  },
  themeButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  currencyButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});
