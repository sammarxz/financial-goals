import React from "react";
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
import Animated from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { OnboardingNavigationProp } from "../../@types/navigation";
import { useStepOneForm } from "../../hooks/useStepOneForm";

const { height } = Dimensions.get("window");

interface StepOneProps {
  navigation: OnboardingNavigationProp;
}

export function StepOne({ navigation }: StepOneProps) {
  const { name, error, animations, handleNameChange, handleNext, isValid } =
    useStepOneForm({ navigation });

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.content}>
          {/* Header com indicador de progresso */}
          <View style={styles.header}>
            <View style={styles.stepIndicator}>
              <View style={styles.stepDot}>
                <Feather name="user" size={20} color="#FFF" />
              </View>
              <View style={styles.stepLine} />
              <View style={[styles.stepDot, styles.stepInactive]} />
              <View style={styles.stepLine} />
              <View style={[styles.stepDot, styles.stepInactive]} />
            </View>
          </View>

          {/* Título animado */}
          <Animated.View style={[styles.titleContainer, animations.titleStyle]}>
            <Text style={styles.title}>Bem-vindo!</Text>
            <Text style={styles.subtitle}>
              Vamos começar conhecendo você melhor.
            </Text>
          </Animated.View>

          {/* Input animado */}
          <Animated.View style={[styles.inputContainer, animations.inputStyle]}>
            <Input
              label="Como podemos te chamar?"
              placeholder="Digite seu nome"
              value={name}
              onChangeText={handleNameChange}
              error={error}
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={handleNext}
              maxLength={50}
            />
          </Animated.View>

          {/* Botão animado */}
          <Animated.View
            style={[styles.buttonContainer, animations.buttonStyle]}
          >
            <Button
              title="Continuar"
              onPress={handleNext}
              disabled={!isValid}
            />
          </Animated.View>
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
  stepInactive: {
    backgroundColor: "#E9ECEF",
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#E9ECEF",
    marginHorizontal: 8,
  },
  titleContainer: {
    marginTop: height * 0.1,
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
  inputContainer: {
    marginBottom: 24,
  },
  buttonContainer: {
    marginTop: "auto",
    marginBottom: Platform.OS === "ios" ? 16 : 24,
  },
});
