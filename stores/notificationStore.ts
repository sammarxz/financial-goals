import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface NotificationStore {
  enabled: boolean;
  lastNotificationDate: Date | null;
  toggleNotifications: () => void;
  setLastNotificationDate: (date: Date) => void;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      enabled: true,
      lastNotificationDate: null,
      toggleNotifications: () => set((state) => ({ enabled: !state.enabled })),
      setLastNotificationDate: (date) => set({ lastNotificationDate: date }),
    }),
    {
      name: "investment-tracker-notifications",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        enabled: state.enabled,
        lastNotificationDate: state.lastNotificationDate,
      }),
      onRehydrateStorage: () => (state) => {
        // Convert string date back to Date object
        if (state?.lastNotificationDate) {
          state.lastNotificationDate = new Date(state.lastNotificationDate);
        }
      },
    }
  )
);
