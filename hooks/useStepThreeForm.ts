import { useState, useCallback, useMemo, useEffect } from "react";
import { Alert } from "react-native";
import {
  useSharedValue,
  withSpring,
  withDelay,
  useAnimatedStyle,
} from "react-native-reanimated";
import { differenceInMonths, addMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useUserStore } from "../stores/userStore";
import { OnboardingNavigationProp } from "../@types/navigation";

interface UseStepThreeFormProps {
  navigation: OnboardingNavigationProp;
  initialData: {
    name: string;
    goal: number;
    startDate: Date;
    endDate: Date;
  };
}

type InvestmentType = "fixed" | "growing";

export function useStepThreeForm({
  navigation,
  initialData,
}: UseStepThreeFormProps) {
  const setUserData = useUserStore((state) => state.setUserData);
  const { name, goal, startDate, endDate } = initialData;

  const [investmentType, setInvestmentType] = useState<InvestmentType>("fixed");
  const [loading, setLoading] = useState(false);

  // Animações
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(50);

  useEffect(() => {
    contentOpacity.value = withDelay(300, withSpring(1));
    contentTranslateY.value = withDelay(300, withSpring(0));
  }, []);

  const animations = {
    contentStyle: useAnimatedStyle(() => ({
      opacity: contentOpacity.value,
      transform: [{ translateY: contentTranslateY.value }],
    })),
  };

  const totalMonths = useMemo(() => {
    return differenceInMonths(endDate, startDate) + 1;
  }, [startDate, endDate]);

  // Função para arredondar para o múltiplo de 50 mais próximo
  const roundToNearestFifty = (value: number) => {
    return Math.round(value / 50) * 50;
  };

  const calculateProgressiveValues = useCallback(() => {
    const monthlyValues: { [key: string]: number } = {};
    const months = totalMonths;

    if (investmentType === "fixed") {
      const exactMonthlyValue = goal / months;
      const roundedMonthlyValue = roundToNearestFifty(exactMonthlyValue);
      let totalInvested = 0;

      for (let i = 0; i < months - 1; i++) {
        const currentDate = addMonths(startDate, i);
        const monthKey = format(currentDate, "yyyy-MM");
        monthlyValues[monthKey] = roundedMonthlyValue;
        totalInvested += roundedMonthlyValue;
      }

      const lastDate = addMonths(startDate, months - 1);
      const lastMonthKey = format(lastDate, "yyyy-MM");
      monthlyValues[lastMonthKey] = goal - totalInvested;
    } else {
      const avgMonthlyValue = goal / months;
      const lastMonthTarget = avgMonthlyValue * 1.5;
      const firstMonthValue = roundToNearestFifty(lastMonthTarget / 3);

      let totalInvested = 0;
      let currentValue = firstMonthValue;
      let increment = roundToNearestFifty(
        (lastMonthTarget - firstMonthValue) / (months - 1)
      );

      for (let i = 0; i < months - 1; i++) {
        const currentDate = addMonths(startDate, i);
        const monthKey = format(currentDate, "yyyy-MM");
        monthlyValues[monthKey] = currentValue;
        totalInvested += currentValue;
        currentValue += increment;
      }

      const lastDate = addMonths(startDate, months - 1);
      const lastMonthKey = format(lastDate, "yyyy-MM");
      monthlyValues[lastMonthKey] = goal - totalInvested;
    }

    return monthlyValues;
  }, [investmentType, goal, totalMonths, startDate]);

  const previewValues = useMemo(() => {
    const values = calculateProgressiveValues();
    let accumulated = 0;

    return Object.entries(values).map(([month, value]) => {
      accumulated += value;
      return {
        month: format(new Date(month), "MMMM", { locale: ptBR }),
        value,
        accumulated,
      };
    });
  }, [calculateProgressiveValues]);

  const handleComplete = async () => {
    try {
      setLoading(true);
      const monthlyValues = calculateProgressiveValues();

      // Criando os dados do usuário
      await setUserData({
        name,
        goal,
        startDate,
        endDate,
        investmentType,
        monthlyValues,
        completedMonths: [],
      });

      navigation.navigate("Home");
    } catch (error) {
      Alert.alert("Erro", "Houve um erro ao salvar os dados. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const monthlyEstimate = useMemo(() => {
    if (investmentType === "fixed") {
      const value = roundToNearestFifty(goal / totalMonths);
      return value.toLocaleString("pt-BR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    }
    return null;
  }, [investmentType, goal, totalMonths]);

  return {
    investmentType,
    loading,
    animations,
    totalMonths,
    monthlyEstimate,
    previewValues,
    setInvestmentType,
    handleComplete,
    isDisabled: false,
  };
}
