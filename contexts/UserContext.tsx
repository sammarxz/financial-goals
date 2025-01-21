import React, { createContext, useState, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface UserData {
  name: string;
  goal: number;
  startDate: Date;
  endDate: Date;
  investmentType: "fixed" | "growing";
  monthlyValues: { [key: string]: number };
  completedMonths: string[];
  notificationsEnabled: boolean;
}

interface UserContextData {
  userData: UserData | null;
  setUserData: (data: UserData) => Promise<void>;
  updateCompletedMonths: (month: string) => Promise<void>;
  toggleNotifications: () => Promise<void>;
}

const UserContext = createContext<UserContextData>({} as UserContextData);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserDataState] = useState<UserData | null>(null);

  async function setUserData(data: UserData) {
    await AsyncStorage.setItem(
      "@InvestmentTracker:userData",
      JSON.stringify(data)
    );
    setUserDataState(data);
  }

  async function updateCompletedMonths(month: string) {
    if (!userData) return;

    const newCompletedMonths = [...userData.completedMonths, month];
    const newUserData = { ...userData, completedMonths: newCompletedMonths };
    await setUserData(newUserData);
  }

  async function toggleNotifications() {
    if (!userData) return;

    const newUserData = {
      ...userData,
      notificationsEnabled: !userData.notificationsEnabled,
    };
    await setUserData(newUserData);
  }

  return (
    <UserContext.Provider
      value={{
        userData,
        setUserData,
        updateCompletedMonths,
        toggleNotifications,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
