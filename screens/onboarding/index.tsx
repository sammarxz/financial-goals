import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { StepOne } from "./StepOne";
import { StepTwo } from "./StepTwo";
import { StepThree } from "./StepThree";

export type OnboardingStackParamList = {
  StepOne: undefined;
  StepTwo: {
    name: string;
  };
  StepThree: {
    name: string;
    goal: number;
    startDate: Date;
    endDate: Date;
  };
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="StepOne" component={StepOne} />
      <Stack.Screen name="StepTwo" component={StepTwo} />
      <Stack.Screen name="StepThree" component={StepThree} />
    </Stack.Navigator>
  );
}
