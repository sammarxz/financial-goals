import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserData, UserDataSchema } from "../@types/schemas";

interface UserStore {
  userData: UserData | null;
  setUserData: (data: UserData) => Promise<void>;
  toggleCompletedMonth: (month: string) => Promise<void>;
  clearUserData: () => Promise<void>;
  validateUserData: (data: unknown) => data is UserData;
}

type PersistedUserData = Omit<UserData, "startDate" | "endDate"> & {
  startDate: string;
  endDate: string;
};

const parseStoredData = (data: PersistedUserData): UserData => ({
  ...data,
  startDate: new Date(data.startDate),
  endDate: new Date(data.endDate),
});

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
          UserDataSchema.parse(data);
          set({ userData: data });
        } catch (error) {
          console.error("Error setting user data:", error);
          throw new Error("Invalid user data");
        }
      },

      toggleCompletedMonth: async (month: string) => {
        const { userData } = get();
        if (!userData) throw new Error("No user data available");

        try {
          const completedMonths = userData.completedMonths.includes(month)
            ? userData.completedMonths.filter((m) => m !== month)
            : [...userData.completedMonths, month];

          const newUserData = {
            ...userData,
            completedMonths,
          };

          UserDataSchema.parse(newUserData);
          set({ userData: newUserData });
        } catch (error) {
          console.error("Error toggling completed month:", error);
          throw error;
        }
      },

      clearUserData: async () => {
        set({ userData: null });
      },
    }),
    {
      name: "investment-tracker-user",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => {
        if (!state.userData) return { userData: null };

        return {
          userData: {
            ...state.userData,
            startDate: state.userData.startDate.toISOString(),
            endDate: state.userData.endDate.toISOString(),
          },
        };
      },
      onRehydrateStorage: () => (state) => {
        if (state?.userData) {
          // Converte as datas de string para Date ao recarregar
          const parsed = {
            ...state.userData,
            startDate: new Date(state.userData.startDate),
            endDate: new Date(state.userData.endDate),
          };

          if (!UserDataSchema.safeParse(parsed).success) {
            console.error("Invalid stored user data");
            state.userData = null;
          } else {
            state.userData = parsed;
          }
        }
      },
    }
  )
);
