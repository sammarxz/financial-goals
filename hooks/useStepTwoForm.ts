import { useState, useEffect } from "react";
import {
  useSharedValue,
  withSpring,
  withDelay,
  useAnimatedStyle,
} from "react-native-reanimated";
import { addMonths, differenceInMonths } from "date-fns";
import { OnboardingNavigationProp } from "../@types/navigation";

interface UseStepTwoFormProps {
  navigation: OnboardingNavigationProp;
  initialName: string;
}

interface FormErrors {
  goal: string;
  date: string;
}

export function useStepTwoForm({
  navigation,
  initialName,
}: UseStepTwoFormProps) {
  const [goal, setGoal] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(addMonths(new Date(), 12));
  const [errors, setErrors] = useState<FormErrors>({
    goal: "",
    date: "",
  });

  // Animações apenas para container e form
  const containerOpacity = useSharedValue(0);
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(50);

  useEffect(() => {
    const timeout = setTimeout(() => {
      containerOpacity.value = withSpring(1, { damping: 15 });
      formOpacity.value = withDelay(200, withSpring(1, { damping: 15 }));
      formTranslateY.value = withDelay(200, withSpring(0, { damping: 15 }));
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  const animations = {
    containerStyle: useAnimatedStyle(() => ({
      opacity: containerOpacity.value,
    })),
    formStyle: useAnimatedStyle(() => ({
      opacity: formOpacity.value,
      transform: [{ translateY: formTranslateY.value }],
    })),
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
    setGoal(formattedValue);
    setErrors((prev) => ({ ...prev, goal: "" }));
  };

  const validateInputs = () => {
    const newErrors = {
      goal: "",
      date: "",
    };

    const goalValue = Number(goal.replace(/\D/g, "")) / 100;
    if (goalValue < 100) {
      newErrors.goal = "A meta deve ser de pelo menos R$ 100,00";
    }

    const monthDiff = differenceInMonths(endDate, startDate);
    if (monthDiff < 1) {
      newErrors.date = "O período deve ser de pelo menos 1 mês";
    }

    setErrors(newErrors);
    return !newErrors.goal && !newErrors.date;
  };

  const handleNext = () => {
    if (!validateInputs()) return;

    const goalValue = Number(goal.replace(/\D/g, "")) / 100;
    navigation.navigate("StepThree", {
      name: initialName,
      goal: goalValue,
      startDate,
      endDate,
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const isFormValid = () => {
    const goalValue = Number(goal.replace(/\D/g, "")) / 100;
    const monthDiff = differenceInMonths(endDate, startDate);
    return goalValue >= 100 && monthDiff >= 1;
  };

  return {
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
    isFormValid: isFormValid(),
  };
}
