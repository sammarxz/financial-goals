import { useUserStore } from "../stores/userStore";
import { useNotificationStore } from "../stores/notificationStore";

import { UserData } from "../@types/schemas";

interface InvestmentData {
  userData: UserData | null;
  notificationsEnabled: boolean;
  totalInvested: number;
  progress: number;
  remainingValue: number;
  updateCompletedMonths: (month: string) => Promise<void>;
}

export const useInvestmentData = (): InvestmentData => {
  const { userData, updateCompletedMonths } = useUserStore();
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

  return {
    userData,
    notificationsEnabled,
    totalInvested,
    progress,
    remainingValue,
    updateCompletedMonths,
  };
};
