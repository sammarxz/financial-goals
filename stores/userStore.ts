import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface UserData {
  name: string;
  goal: number;
  startDate: Date;
  endDate: Date;
  investmentType: "fixed" | "growing";
  monthlyValues: { [key: string]: number };
  completedMonths: string[];
}

interface UserStore {
  userData: UserData | null;
  setUserData: (data: UserData) => void;
  updateCompletedMonths: (month: string) => void;
  clearUserData: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      userData: null,
      setUserData: (data) => set({ userData: data }),
      updateCompletedMonths: (month) =>
        set((state) => ({
          userData: state.userData
            ? {
                ...state.userData,
                completedMonths: [...state.userData.completedMonths, month],
              }
            : null,
        })),
      clearUserData: () => set({ userData: null }),
    }),
    {
      name: "investment-tracker-user",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ userData: state.userData }),
      onRehydrateStorage: () => (state) => {
        // Convert string dates back to Date objects
        if (state?.userData) {
          state.userData.startDate = new Date(state.userData.startDate);
          state.userData.endDate = new Date(state.userData.endDate);
        }
      },
    }
  )
);
