import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  VirtualizedList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { z } from "zod";

import { useNotificationStore } from "../stores/notificationStore";
import { useUserStore } from "../stores/userStore";
import { useAppConfigStore } from "../stores/configStore";

import { Layout } from "../components/Layout";
import {
  MemoizedButton,
  MemoizedInput,
  MemoizedDateRangePicker,
} from "../components/MemoizedComponents";

import { RootStackNavigation } from "../@types/navigation";
import { AppConfig, UserData } from "../@types/schemas";

// Memoized Components
const Header = React.memo(
  ({
    isEditing,
    onBack,
    onToggleEdit,
  }: {
    isEditing: boolean;
    onBack: () => void;
    onToggleEdit: () => void;
  }) => (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Feather name="arrow-left" size={24} color="#333" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Configurações</Text>
      <TouchableOpacity onPress={onToggleEdit} style={styles.editButton}>
        <Feather name={isEditing ? "x" : "edit-2"} size={20} color="#333" />
      </TouchableOpacity>
    </View>
  )
);

const NotificationToggle = React.memo(
  ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
    <TouchableOpacity style={styles.optionButton} onPress={onToggle}>
      <View style={styles.optionContent}>
        <Text style={styles.optionText}>Notificações de Aporte</Text>
        <View style={[styles.toggle, enabled && styles.toggleActive]}>
          <View
            style={[styles.toggleCircle, enabled && styles.toggleCircleActive]}
          />
        </View>
      </View>
    </TouchableOpacity>
  )
);

// Types for settings items
interface SettingSection {
  id: string;
  title: string;
  data: SettingItem[];
}

interface SettingItem {
  id: string;
  type: "input" | "date" | "toggle" | "button" | "theme" | "currency";
  label: string;
  value?: string | boolean;
  onPress?: () => void;
  component?: React.ReactNode;
}

export function Settings() {
  const navigation = useNavigation<RootStackNavigation>();
  const [isEditing, setIsEditing] = useState(false);

  // Store hooks
  const userData = useUserStore((state) => state.userData);
  const setUserData = useUserStore((state) => state.setUserData);
  const clearUserData = useUserStore((state) => state.clearUserData);
  const notificationsEnabled = useNotificationStore((state) => state.enabled);
  const toggleNotifications = useNotificationStore(
    (state) => state.toggleNotifications
  );
  const { theme, currency, setTheme, setCurrency } = useAppConfigStore();

  // Form state
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

  // Callbacks
  const handleBack = useCallback(() => {
    if (isEditing) {
      Alert.alert("Atenção", "Deseja descartar as alterações?", [
        { text: "Não", style: "cancel" },
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
  }, [isEditing, navigation]);

  const handleToggleEdit = useCallback(() => {
    setIsEditing(!isEditing);
  }, [isEditing]);

  const handleToggleNotifications = useCallback(async () => {
    try {
      await toggleNotifications();
    } catch (error) {
      Alert.alert(
        "Erro",
        "Não foi possível alterar as configurações de notificação"
      );
    }
  }, [toggleNotifications]);

  const formatCurrency = useCallback((value: string) => {
    const numbers = value.replace(/\D/g, "");
    const numberFormat = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });
    return numberFormat.format(Number(numbers) / 100);
  }, []);

  const handleGoalChange = useCallback(
    (text: string) => {
      const formattedValue = formatCurrency(text);
      setEditedGoal(formattedValue);
    },
    [formatCurrency]
  );

  const handleSaveChanges = useCallback(async () => {
    try {
      const goalValue = Number(editedGoal.replace(/\D/g, "")) / 100;
      const newUserData: UserData = {
        ...userData!,
        name: editedName,
        goal: goalValue,
        startDate: editedStartDate,
        endDate: editedEndDate,
        investmentType: editedInvestmentType,
      };

      await setUserData(newUserData);
      setIsEditing(false);
      Alert.alert("Sucesso", "Dados atualizados com sucesso!");
    } catch (error) {
      if (error instanceof z.ZodError) {
        Alert.alert("Erro de Validação", error.errors[0].message);
      } else {
        Alert.alert("Erro", "Não foi possível salvar as alterações");
      }
    }
  }, [
    editedName,
    editedGoal,
    editedStartDate,
    editedEndDate,
    editedInvestmentType,
    userData,
    setUserData,
  ]);

  const handleClearData = useCallback(() => {
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
  }, [clearUserData, navigation]);

  // Settings sections with memoization
  const sections = useMemo<SettingSection[]>(() => {
    if (!userData) return [];

    return [
      {
        id: "personal",
        title: "Informações Pessoais",
        data: [
          {
            id: "name",
            type: "input",
            label: "Nome",
            value: editedName,
            component: isEditing ? (
              <MemoizedInput
                label="Nome"
                value={editedName}
                onChangeText={setEditedName}
                autoCapitalize="words"
              />
            ) : (
              <Text style={styles.infoValue}>{userData.name}</Text>
            ),
          },
          {
            id: "goal",
            type: "input",
            label: "Meta",
            value: editedGoal,
            component: isEditing ? (
              <MemoizedInput
                label="Meta"
                value={editedGoal}
                onChangeText={handleGoalChange}
                keyboardType="numeric"
              />
            ) : (
              <Text style={styles.infoValue}>
                R$ {userData.goal.toLocaleString("pt-BR")}
              </Text>
            ),
          },
          {
            id: "dates",
            type: "date",
            label: "Período",
            component: isEditing ? (
              <MemoizedDateRangePicker
                startDate={editedStartDate}
                endDate={editedEndDate}
                onChangeStart={setEditedStartDate}
                onChangeEnd={setEditedEndDate}
              />
            ) : (
              <Text style={styles.infoValue}>
                {format(userData.startDate, "dd/MM/yyyy", { locale: ptBR })} até{" "}
                {format(userData.endDate, "dd/MM/yyyy", { locale: ptBR })}
              </Text>
            ),
          },
        ],
      },
      {
        id: "preferences",
        title: "Preferências",
        data: [
          {
            id: "notifications",
            type: "toggle",
            label: "Notificações",
            value: notificationsEnabled,
            component: (
              <NotificationToggle
                enabled={notificationsEnabled}
                onToggle={handleToggleNotifications}
              />
            ),
          },
          {
            id: "theme",
            type: "theme",
            label: "Tema",
            component: (
              <View style={styles.buttonGroup}>
                {Object.entries({
                  light: "Claro",
                  dark: "Escuro",
                  system: "Sistema",
                }).map(([key, label]) => (
                  <MemoizedButton
                    key={key}
                    title={label}
                    variant={theme === key ? "primary" : "outline"}
                    onPress={() => setTheme(key as AppConfig["theme"])}
                    style={styles.themeButton}
                  />
                ))}
              </View>
            ),
          },
        ],
      },
      {
        id: "actions",
        title: "Ações",
        data: [
          {
            id: "clear",
            type: "button",
            label: "Limpar Dados",
            component: (
              <MemoizedButton
                title="Limpar Todos os Dados"
                variant="outline"
                onPress={handleClearData}
              />
            ),
          },
        ],
      },
    ];
  }, [
    userData,
    isEditing,
    editedName,
    editedGoal,
    editedStartDate,
    editedEndDate,
    notificationsEnabled,
    theme,
    handleToggleNotifications,
    handleGoalChange,
    handleClearData,
  ]);

  // VirtualizedList helper functions
  const getItem = useCallback(
    (data: SettingSection[], index: number) => data[index],
    []
  );
  const getItemCount = useCallback((data: SettingSection[]) => data.length, []);
  const keyExtractor = useCallback((item: SettingSection) => item.id, []);

  // Render functions
  const renderSectionHeader = useCallback(
    ({ section }: { section: SettingSection }) => (
      <Text style={styles.sectionTitle}>{section.title}</Text>
    ),
    []
  );

  const renderItem = useCallback(
    ({ item }: { item: SettingSection }) => (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{item.title}</Text>
        {item.data.map((setting) => (
          <View key={setting.id} style={styles.settingItem}>
            <Text style={styles.settingLabel}>{setting.label}</Text>
            {setting.component}
          </View>
        ))}
      </View>
    ),
    []
  );

  return (
    <Layout>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <Header
          isEditing={isEditing}
          onBack={handleBack}
          onToggleEdit={handleToggleEdit}
        />

        <VirtualizedList
          data={sections}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          getItem={getItem}
          getItemCount={getItemCount}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          windowSize={3}
          initialNumToRender={3}
          maxToRenderPerBatch={3}
        />

        {isEditing && (
          <View style={styles.footer}>
            <MemoizedButton
              title="Salvar Alterações"
              onPress={handleSaveChanges}
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  container: {
    padding: 16,
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
  section: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  settingItem: {
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  buttonGroup: {
    flexDirection: "column",
    marginTop: 8,
    gap: 8,
  },
  themeButton: {
    flex: 1,
  },
  currencyButton: {
    flex: 1,
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
    transform: [{ translateX: 0 }],
  },
  toggleCircleActive: {
    transform: [{ translateX: 20 }],
  },
  footer: {
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 32 : 16,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#E9ECEF",
  },
});
