import React, { useCallback, memo, useState, useEffect } from "react";
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
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { OnboardingScreenNavigationProp } from "../../@types/navigation";
import {
  MemoizedInput,
  MemoizedButton,
} from "../../components/MemoizedComponents";
import { useOptimizedAnimations } from "../../hooks/useOptimizedAnimations";

const { height } = Dimensions.get("window");

// Memoized Progress Steps Component
const ProgressSteps = memo(() => (
  <View style={styles.stepIndicator}>
    <View style={styles.stepDot}>
      <Feather name="user" size={20} color="#FFF" />
    </View>
    <View style={styles.stepLine} />
    <View style={[styles.stepDot, styles.stepInactive]} />
    <View style={styles.stepLine} />
    <View style={[styles.stepDot, styles.stepInactive]} />
  </View>
));

// Memoized Welcome Title Component
const WelcomeTitle = memo(() => (
  <View>
    <Text style={styles.title}>Bem-vindo!</Text>
    <Text style={styles.subtitle}>Vamos começar conhecendo você melhor.</Text>
  </View>
));

interface StepOneProps {
  navigation: OnboardingScreenNavigationProp;
}

export function StepOne({ navigation }: StepOneProps) {
  // State
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Animations
  const { startEntryAnimation, opacity, translateY, scale } =
    useOptimizedAnimations();

  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShow = Keyboard.addListener("keyboardDidShow", () => {
      setIsKeyboardVisible(true);
    });

    const keyboardDidHide = Keyboard.addListener("keyboardDidHide", () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      keyboardDidShow.remove();
      keyboardDidHide.remove();
    };
  }, []);

  // Start animations when component mounts
  useEffect(() => {
    startEntryAnimation();
  }, [startEntryAnimation]);

  // Animated styles
  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const inputAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  // Handlers
  const handleNameChange = useCallback(
    (text: string) => {
      setName(text);
      if (error) setError("");
    },
    [error]
  );

  const validateName = useCallback((name: string) => {
    if (!name.trim()) {
      return "Por favor, digite seu nome";
    }
    if (name.trim().length < 2) {
      return "O nome deve ter pelo menos 2 caracteres";
    }
    return "";
  }, []);

  const handleNext = useCallback(() => {
    const validationError = validateName(name);
    if (validationError) {
      setError(validationError);
      return;
    }
    navigation.navigate("StepTwo", { name: name.trim() });
  }, [name, navigation, validateName]);

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
          <View style={styles.header}>
            <ProgressSteps />
          </View>

          {/* Título animado */}
          <Animated.View
            style={[
              styles.titleContainer,
              titleAnimatedStyle,
              isKeyboardVisible && styles.titleContainerKeyboard,
            ]}
          >
            <WelcomeTitle />
          </Animated.View>

          {/* Input animado */}
          <Animated.View style={[styles.inputContainer, inputAnimatedStyle]}>
            <MemoizedInput
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
          <Animated.View style={[styles.buttonContainer, buttonAnimatedStyle]}>
            <MemoizedButton
              title="Continuar"
              onPress={handleNext}
              disabled={!name.trim()}
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
  titleContainerKeyboard: {
    marginTop: height * 0.05,
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
