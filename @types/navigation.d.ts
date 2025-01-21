import {
  NavigatorScreenParams,
  CompositeNavigationProp,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

// Tipos para parâmetros do Onboarding
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

// Tipos para parâmetros da navegação principal
export type RootStackParamList = {
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
  Home: undefined;
  Settings: undefined;
};

// Tipos utilitários para navegação
export type RootStackNavigation = NativeStackNavigationProp<RootStackParamList>;
export type OnboardingNavigation =
  NativeStackNavigationProp<OnboardingStackParamList>;

// Tipo composto para navegação do Onboarding
export type OnboardingScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<OnboardingStackParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

// Helper types para parâmetros de rota
export type RouteParams<T extends keyof RootStackParamList> = {
  route: { params: RootStackParamList[T] };
};

export type OnboardingRouteParams<T extends keyof OnboardingStackParamList> = {
  route: { params: OnboardingStackParamList[T] };
};
