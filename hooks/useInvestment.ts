import { useState, useCallback, useMemo } from "react";
import { useUser } from "../contexts/UserContext";
import { calculations } from "../utils/calculations";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function useInvestment() {
  const { userData, updateCompletedMonths } = useUser();
  const [isUpdating, setIsUpdating] = useState(false);

  const totalInvested = useMemo(() => {
    if (!userData) return 0;
    return calculations.calculateTotalInvested(
      userData.monthlyValues,
      userData.completedMonths
    );
  }, [userData?.monthlyValues, userData?.completedMonths]);

  const progress = useMemo(() => {
    if (!userData) return 0;
    return calculations.calculateProgress(totalInvested, userData.goal);
  }, [totalInvested, userData?.goal]);

  const remainingValue = useMemo(() => {
    if (!userData) return 0;
    return userData.goal - totalInvested;
  }, [userData?.goal, totalInvested]);

  const monthlyData = useMemo(() => {
    if (!userData) return [];

    return Object.entries(userData.monthlyValues)
      .sort(
        ([dateA], [dateB]) =>
          new Date(dateA).getTime() - new Date(dateB).getTime()
      )
      .map(([month, value]) => ({
        month,
        formattedMonth: format(new Date(month), "MMMM/yyyy", { locale: ptBR }),
        value,
        completed: userData.completedMonths.includes(month),
      }));
  }, [userData?.monthlyValues, userData?.completedMonths]);

  const chartData = useMemo(() => {
    if (!userData) return { labels: [], values: [] };

    const sortedEntries = Object.entries(userData.monthlyValues).sort(
      ([dateA], [dateB]) =>
        new Date(dateA).getTime() - new Date(dateB).getTime()
    );

    return {
      labels: sortedEntries.map(([month]) =>
        format(new Date(month), "MMM", { locale: ptBR })
      ),
      values: sortedEntries.map(([_, value]) => value),
    };
  }, [userData?.monthlyValues]);

  const handleCompleteMonth = useCallback(
    async (month: string) => {
      if (!userData || isUpdating) return;

      try {
        setIsUpdating(true);
        await updateCompletedMonths(month);
      } catch (error) {
        console.error("Error completing month:", error);
        throw new Error("Failed to complete month");
      } finally {
        setIsUpdating(false);
      }
    },
    [userData, isUpdating, updateCompletedMonths]
  );

  return {
    totalInvested,
    progress,
    remainingValue,
    monthlyData,
    chartData,
    isUpdating,
    handleCompleteMonth,
  };
}
