import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { NavigatorScreenParams } from "@react-navigation/native";
import { CompositeNavigationProp } from "@react-navigation/native";

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

export type RootStackParamList = {
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
  Home: undefined;
  Settings: undefined;
};

// Tipo de navegação composto que permite acesso tanto à navegação do onboarding quanto à navegação raiz
export type OnboardingNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<OnboardingStackParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;
