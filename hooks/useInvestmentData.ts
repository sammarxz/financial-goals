import { useNotificationStore } from "../stores/notificationStore";
import { useUserStore } from "../stores/userStore";

export const useInvestmentData = () => {
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
