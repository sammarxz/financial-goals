import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@InvestmentTracker:userData";

export interface UserData {
  name: string;
  goal: number;
  startDate: Date;
  endDate: Date;
  investmentType: "fixed" | "growing";
  monthlyValues: { [key: string]: number };
  completedMonths: string[];
  notificationsEnabled: boolean;
}

export const storage = {
  async saveUserData(data: UserData): Promise<void> {
    try {
      const jsonData = JSON.stringify({
        ...data,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
      });
      await AsyncStorage.setItem(STORAGE_KEY, jsonData);
    } catch (error) {
      console.error("Error saving user data:", error);
      throw new Error("Failed to save user data");
    }
  },

  async getUserData(): Promise<UserData | null> {
    try {
      const jsonData = await AsyncStorage.getItem(STORAGE_KEY);
      if (!jsonData) return null;

      const data = JSON.parse(jsonData);
      return {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      };
    } catch (error) {
      console.error("Error getting user data:", error);
      throw new Error("Failed to get user data");
    }
  },

  async updateCompletedMonths(month: string): Promise<void> {
    try {
      const userData = await this.getUserData();
      if (!userData) throw new Error("No user data found");

      const updatedUserData = {
        ...userData,
        completedMonths: [...userData.completedMonths, month],
      };

      await this.saveUserData(updatedUserData);
    } catch (error) {
      console.error("Error updating completed months:", error);
      throw new Error("Failed to update completed months");
    }
  },

  async toggleNotifications(): Promise<boolean> {
    try {
      const userData = await this.getUserData();
      if (!userData) throw new Error("No user data found");

      const updatedUserData = {
        ...userData,
        notificationsEnabled: !userData.notificationsEnabled,
      };

      await this.saveUserData(updatedUserData);
      return updatedUserData.notificationsEnabled;
    } catch (error) {
      console.error("Error toggling notifications:", error);
      throw new Error("Failed to toggle notifications");
    }
  },

  async clearUserData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing user data:", error);
      throw new Error("Failed to clear user data");
    }
  },
};
