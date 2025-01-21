import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppConfig, AppConfigSchema } from "../@types/schemas";

interface AppConfigStore extends AppConfig {
  setTheme: (theme: AppConfig["theme"]) => Promise<void>;
  setCurrency: (currency: AppConfig["currency"]) => Promise<void>;
  setLocale: (locale: AppConfig["locale"]) => Promise<void>;
  validateConfig: (data: unknown) => data is AppConfig;
}

export const useAppConfigStore = create<AppConfigStore>()(
  persist(
    (set, get) => ({
      theme: "system",
      currency: "BRL",
      locale: "pt-BR",

      validateConfig: (data: unknown): data is AppConfig => {
        try {
          AppConfigSchema.parse(data);
          return true;
        } catch (error) {
          console.error("AppConfig validation error:", error);
          return false;
        }
      },

      setTheme: async (theme) => {
        try {
          const newState = { ...get(), theme };
          AppConfigSchema.parse(newState);
          set(newState);
        } catch (error) {
          console.error("Error setting theme:", error);
          throw new Error("Invalid theme");
        }
      },

      setCurrency: async (currency) => {
        try {
          const newState = { ...get(), currency };
          AppConfigSchema.parse(newState);
          set(newState);
        } catch (error) {
          console.error("Error setting currency:", error);
          throw new Error("Invalid currency");
        }
      },

      setLocale: async (locale) => {
        try {
          const newState = { ...get(), locale };
          AppConfigSchema.parse(newState);
          set(newState);
        } catch (error) {
          console.error("Error setting locale:", error);
          throw new Error("Invalid locale");
        }
      },
    }),
    {
      name: "investment-tracker-config",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        theme: state.theme,
        currency: state.currency,
        locale: state.locale,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && !state.validateConfig(state)) {
          // Reset to defaults if invalid
          state.theme = "system";
          state.currency = "BRL";
          state.locale = "pt-BR";
        }
      },
    }
  )
);
