import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NotificationConfig, NotificationSchema } from "../@types/schemas";

interface NotificationStore extends NotificationConfig {
  toggleNotifications: () => Promise<void>;
  setLastNotificationDate: (date: Date) => Promise<void>;
  validateNotificationConfig: (data: unknown) => data is NotificationConfig;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      enabled: true,
      lastNotificationDate: null,

      validateNotificationConfig: (
        data: unknown
      ): data is NotificationConfig => {
        try {
          NotificationSchema.parse(data);
          return true;
        } catch (error) {
          console.error("NotificationConfig validation error:", error);
          return false;
        }
      },

      toggleNotifications: async () => {
        try {
          const newState = { ...get(), enabled: !get().enabled };
          NotificationSchema.parse(newState);
          set(newState);
        } catch (error) {
          console.error("Error toggling notifications:", error);
          throw new Error("Invalid notification state");
        }
      },

      setLastNotificationDate: async (date: Date) => {
        try {
          const newState = { ...get(), lastNotificationDate: date };
          NotificationSchema.parse(newState);
          set(newState);
        } catch (error) {
          console.error("Error setting notification date:", error);
          throw new Error("Invalid notification date");
        }
      },
    }),
    {
      name: "investment-tracker-notifications",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        enabled: state.enabled,
        lastNotificationDate: state.lastNotificationDate,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.lastNotificationDate) {
          const config = {
            ...state,
            lastNotificationDate: new Date(state.lastNotificationDate),
          };

          if (!state.validateNotificationConfig(config)) {
            state.lastNotificationDate = null;
            state.enabled = true;
          }
        }
      },
    }
  )
);
