import { useState, useEffect } from "react";
import {
  useSharedValue,
  withSpring,
  withSequence,
  withDelay,
  useAnimatedStyle,
} from "react-native-reanimated";
import { OnboardingNavigationProp } from "../@types/navigation";

interface UseStepOneFormProps {
  navigation: OnboardingNavigationProp;
}

export function useStepOneForm({ navigation }: UseStepOneFormProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  // Animações
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(50);
  const inputOpacity = useSharedValue(0);
  const inputTranslateY = useSharedValue(50);
  const buttonOpacity = useSharedValue(0);

  useEffect(() => {
    const animationSequence = () => {
      titleOpacity.value = withSequence(withDelay(300, withSpring(1)));
      titleTranslateY.value = withSequence(withDelay(300, withSpring(0)));
      inputOpacity.value = withSequence(withDelay(600, withSpring(1)));
      inputTranslateY.value = withSequence(withDelay(600, withSpring(0)));
      buttonOpacity.value = withSequence(withDelay(900, withSpring(1)));
    };

    animationSequence();
  }, []);

  const animations = {
    titleStyle: useAnimatedStyle(() => ({
      opacity: titleOpacity.value,
      transform: [{ translateY: titleTranslateY.value }],
    })),
    inputStyle: useAnimatedStyle(() => ({
      opacity: inputOpacity.value,
      transform: [{ translateY: inputTranslateY.value }],
    })),
    buttonStyle: useAnimatedStyle(() => ({
      opacity: buttonOpacity.value,
    })),
  };

  const handleNameChange = (text: string) => {
    setName(text);
    setError("");
  };

  const validateName = (name: string) => {
    if (!name.trim()) {
      return "Por favor, digite seu nome";
    }
    if (name.trim().length < 2) {
      return "O nome deve ter pelo menos 2 caracteres";
    }
    return "";
  };

  const handleNext = () => {
    const validationError = validateName(name);
    if (validationError) {
      setError(validationError);
      return;
    }
    navigation.navigate("StepTwo", { name });
  };

  return {
    name,
    error,
    animations,
    handleNameChange,
    handleNext,
    isValid: !!name.trim(),
  };
}
