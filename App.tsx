import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SplashScreen from "expo-splash-screen";

import { OnboardingNavigator } from "./screens/onboarding";
import { Home } from "./screens/Home";
import { Settings } from "./screens/Settings";

import { UserProvider } from "./contexts/UserContext";

import { RootStackParamList } from "./@types/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  async function checkOnboardingStatus() {
    try {
      const userData = await AsyncStorage.getItem(
        "@InvestmentTracker:userData"
      );
      setHasCompletedOnboarding(!!userData);
    } catch (error) {
      console.log("Error checking onboarding status:", error);
    } finally {
      setIsLoading(false);
      await SplashScreen.hideAsync();
    }
  }

  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      <UserProvider>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            gestureEnabled: false,
          }}
          initialRouteName={hasCompletedOnboarding ? "Home" : "Onboarding"}
        >
          <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Settings" component={Settings} />
        </Stack.Navigator>
      </UserProvider>
    </NavigationContainer>
  );
}
