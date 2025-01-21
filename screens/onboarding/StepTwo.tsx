import React, { memo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
} from "react-native";
import { RouteProp } from "@react-navigation/native";
import Animated from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import {
  OnboardingScreenNavigationProp,
  OnboardingStackParamList,
} from "../../@types/navigation";
import { useStepTwoForm } from "../../hooks/useStepTwoForm";
import {
  MemoizedInput,
  MemoizedButton,
  MemoizedDateRangePicker,
} from "../../components/MemoizedComponents";

const { height } = Dimensions.get("window");

// Memoized Progress Steps Component
const ProgressSteps = memo(({ onBack }: { onBack: () => void }) => (
  <View style={styles.stepIndicator}>
    <TouchableWithoutFeedback onPress={onBack}>
      <View style={[styles.stepDot, styles.stepCompleted]}>
        <Feather name="check" size={20} color="#FFF" />
      </View>
    </TouchableWithoutFeedback>
    <View style={[styles.stepLine, styles.stepLineActive]} />
    <View style={styles.stepDot}>
      <Feather name="target" size={20} color="#FFF" />
    </View>
    <View style={styles.stepLine} />
    <View style={[styles.stepDot, styles.stepInactive]} />
  </View>
));

// Memoized Title Component
const Title = memo(() => (
  <View>
    <Text style={styles.title}>Defina sua meta</Text>
    <Text style={styles.subtitle}>
      Quanto você pretende investir e em quanto tempo?
    </Text>
  </View>
));

// Memoized Form Component
const Form = memo(
  ({
    goal,
    startDate,
    endDate,
    errors,
    handleGoalChange,
    setStartDate,
    setEndDate,
  }: {
    goal: string;
    startDate: Date;
    endDate: Date;
    errors: { goal?: string; date?: string };
    handleGoalChange: (text: string) => void;
    setStartDate: (date: Date) => void;
    setEndDate: (date: Date) => void;
  }) => (
    <View>
      <MemoizedInput
        label="Qual sua meta de investimento?"
        placeholder="R$ 0,00"
        value={goal}
        onChangeText={handleGoalChange}
        keyboardType="numeric"
        error={errors.goal}
      />

      <View style={styles.dateContainer}>
        <Text style={styles.dateLabel}>Em qual período?</Text>
        <MemoizedDateRangePicker
          startDate={startDate}
          endDate={endDate}
          onChangeStart={setStartDate}
          onChangeEnd={setEndDate}
        />
        {errors.date ? (
          <Text style={styles.errorText}>{errors.date}</Text>
        ) : null}
      </View>
    </View>
  )
);

interface StepTwoProps {
  navigation: OnboardingScreenNavigationProp;
  route: RouteProp<OnboardingStackParamList, "StepTwo">;
}

export function StepTwo({ navigation, route }: StepTwoProps) {
  const {
    goal,
    startDate,
    endDate,
    errors,
    animations,
    handleGoalChange,
    setStartDate,
    setEndDate,
    handleNext,
    handleBack,
    isFormValid,
  } = useStepTwoForm({
    navigation,
    initialName: route.params.name,
  });

  const handleDismissKeyboard = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  return (
    <TouchableWithoutFeedback onPress={handleDismissKeyboard}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.content}>
          {/* Header com indicador de progresso */}
          <Animated.View style={[styles.header, animations.containerStyle]}>
            <ProgressSteps onBack={handleBack} />
          </Animated.View>

          {/* Título */}
          <Animated.View
            style={[styles.titleContainer, animations.containerStyle]}
          >
            <Title />
          </Animated.View>

          {/* Formulário */}
          <Animated.View style={[styles.form, animations.formStyle]}>
            <Form
              goal={goal}
              startDate={startDate}
              endDate={endDate}
              errors={errors}
              handleGoalChange={handleGoalChange}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
            />
          </Animated.View>

          {/* Botão */}
          <View style={styles.buttonContainer}>
            <MemoizedButton
              title="Continuar"
              onPress={handleNext}
              disabled={!isFormValid}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  content: {
    flex: 1,
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
  stepInactive: {
    backgroundColor: "#E9ECEF",
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#E9ECEF",
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: "#4CAF50",
  },
  titleContainer: {
    marginTop: height * 0.05,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    lineHeight: 24,
  },
  form: {
    marginBottom: 24,
  },
  dateContainer: {
    marginTop: 24,
  },
  dateLabel: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 14,
    marginTop: 4,
  },
  buttonContainer: {
    marginTop: "auto",
    marginBottom: Platform.OS === "ios" ? 16 : 24,
  },
});
