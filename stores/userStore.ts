import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserData, UserDataSchema } from "../@types/schemas";

interface UserStore {
  userData: UserData | null;
  setUserData: (data: UserData) => Promise<void>;
  updateCompletedMonths: (month: string) => Promise<void>;
  clearUserData: () => Promise<void>;
  validateUserData: (data: unknown) => data is UserData;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      userData: null,

      validateUserData: (data: unknown): data is UserData => {
        try {
          UserDataSchema.parse(data);
          return true;
        } catch (error) {
          console.error("UserData validation error:", error);
          return false;
        }
      },

      setUserData: async (data: UserData) => {
        try {
          // Valida os dados antes de salvar
          UserDataSchema.parse(data);
          set({ userData: data });
        } catch (error) {
          console.error("Error setting user data:", error);
          throw new Error("Invalid user data");
        }
      },

      updateCompletedMonths: async (month: string) => {
        const { userData } = get();
        if (!userData) throw new Error("No user data available");

        try {
          const newUserData = {
            ...userData,
            completedMonths: [...userData.completedMonths, month],
          };

          // Valida os dados antes de atualizar
          UserDataSchema.parse(newUserData);
          set({ userData: newUserData });
        } catch (error) {
          console.error("Error updating completed months:", error);
          throw new Error("Invalid user data after update");
        }
      },

      clearUserData: async () => {
        set({ userData: null });
      },
    }),
    {
      name: "investment-tracker-user",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ userData: state.userData }),
      onRehydrateStorage: () => (state) => {
        // Valida e converte os dados durante a hidratação
        if (state?.userData) {
          const userData = {
            ...state.userData,
            startDate: new Date(state.userData.startDate),
            endDate: new Date(state.userData.endDate),
          };

          if (!state.validateUserData(userData)) {
            console.error("Invalid data during rehydration");
            state.userData = null;
          }
        }
      },
    }
  )
);
