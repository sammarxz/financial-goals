import { create } from "zustand";
import { persist, createJSONStorage, PersistOptions } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppConfig, AppConfigSchema } from "../@types/schemas";

interface AppConfigState extends AppConfig {
  setTheme: (theme: AppConfig["theme"]) => Promise<void>;
  setCurrency: (currency: AppConfig["currency"]) => Promise<void>;
  setLocale: (locale: AppConfig["locale"]) => Promise<void>;
  validateConfig: (data: unknown) => data is AppConfig;
}

// Tipo apenas para os dados persistidos
type PersistedState = Pick<AppConfigState, "theme" | "currency" | "locale">;

const createConfigStore = (initStorage?: typeof AsyncStorage) => {
  const storage = initStorage ?? AsyncStorage;

  const persistConfig: PersistOptions<AppConfigState, PersistedState> = {
    name: "investment-tracker-config",
    storage: createJSONStorage(() => storage),
    partialize: (state): PersistedState => ({
      theme: state.theme,
      currency: state.currency,
      locale: state.locale,
    }),
    onRehydrateStorage: () => (state) => {
      // Nada precisa ser retornado aqui pois o Zustand irá fazer o merge automaticamente
      if (!state || !AppConfigSchema.safeParse(state).success) {
        console.warn("Invalid persisted state, using defaults");
      }
    },
  };

  return create<AppConfigState>()(
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
            const currentState = get();
            const newState = { ...currentState, theme };
            AppConfigSchema.parse(newState);
            set(newState);
          } catch (error) {
            console.error("Error setting theme:", error);
            throw new Error("Invalid theme");
          }
        },

        setCurrency: async (currency) => {
          try {
            const currentState = get();
            const newState = { ...currentState, currency };
            AppConfigSchema.parse(newState);
            set(newState);
          } catch (error) {
            console.error("Error setting currency:", error);
            throw new Error("Invalid currency");
          }
        },

        setLocale: async (locale) => {
          try {
            const currentState = get();
            const newState = { ...currentState, locale };
            AppConfigSchema.parse(newState);
            set(newState);
          } catch (error) {
            console.error("Error setting locale:", error);
            throw new Error("Invalid locale");
          }
        },
      }),
      persistConfig
    )
  );
};

export const useAppConfigStore = createConfigStore();
