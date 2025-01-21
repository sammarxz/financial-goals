import { useCallback } from "react";
import { useUserStore } from "../stores/userStore";
import { useNotificationStore } from "../stores/notificationStore";
import { UserData } from "../@types/schemas";

interface InvestmentData {
  userData: UserData | null;
  notificationsEnabled: boolean;
  totalInvested: number;
  progress: number;
  remainingValue: number;
  toggleMonth: (month: string) => Promise<void>;
}

export const useInvestmentData = (): InvestmentData => {
  // Pegando os dados do store corretamente usando seletores
  const userData = useUserStore((state) => state.userData);
  const toggleCompletedMonth = useUserStore(
    (state) => state.toggleCompletedMonth
  );
  const notificationsEnabled = useNotificationStore((state) => state.enabled);

  const totalInvested = userData
    ? userData.completedMonths.reduce(
        (total, month) => total + (userData.monthlyValues[month] || 0),
        0
      )
    : 0;

  const progress = userData
    ? Math.min((totalInvested / userData.goal) * 100, 100)
    : 0;

  const remainingValue = userData ? userData.goal - totalInvested : 0;

  const toggleMonth = useCallback(
    async (month: string) => {
      try {
        if (!toggleCompletedMonth) {
          throw new Error("Toggle function not available");
        }
        await toggleCompletedMonth(month);
      } catch (error) {
        console.error("Error toggling month:", error);
        throw error;
      }
    },
    [toggleCompletedMonth]
  );

  return {
    userData,
    notificationsEnabled,
    totalInvested,
    progress,
    remainingValue,
    toggleMonth,
  };
};
