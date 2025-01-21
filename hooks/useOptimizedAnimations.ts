import { useCallback } from "react";
import {
  useSharedValue,
  withSpring,
  withSequence,
  withDelay,
  WithSpringConfig,
  WithTimingConfig,
} from "react-native-reanimated";

// Configurações padrão das animações
const DEFAULT_SPRING_CONFIG: WithSpringConfig = {
  damping: 15,
  stiffness: 100,
};

const DEFAULT_DELAY = 300;

export function useOptimizedAnimations() {
  // Shared values para animações
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);
  const scale = useSharedValue(0.95);

  // Funções de animação otimizadas com useCallback
  const fadeIn = useCallback(
    (delay: number = DEFAULT_DELAY) => {
      opacity.value = withDelay(delay, withSpring(1, DEFAULT_SPRING_CONFIG));
    },
    [opacity]
  );

  const fadeOut = useCallback(() => {
    opacity.value = withSpring(0, DEFAULT_SPRING_CONFIG);
  }, [opacity]);

  const slideUp = useCallback(
    (delay: number = DEFAULT_DELAY) => {
      translateY.value = withDelay(delay, withSpring(0, DEFAULT_SPRING_CONFIG));
    },
    [translateY]
  );

  const scaleUp = useCallback(
    (delay: number = DEFAULT_DELAY) => {
      scale.value = withDelay(delay, withSpring(1, DEFAULT_SPRING_CONFIG));
    },
    [scale]
  );

  // Sequências de animação otimizadas
  const startEntryAnimation = useCallback(() => {
    const sequence = async () => {
      opacity.value = withSequence(withDelay(DEFAULT_DELAY, withSpring(1)));
      translateY.value = withSequence(withDelay(DEFAULT_DELAY, withSpring(0)));
      scale.value = withSequence(withDelay(DEFAULT_DELAY, withSpring(1)));
    };

    sequence();
  }, [opacity, translateY, scale]);

  const startExitAnimation = useCallback(() => {
    const sequence = async () => {
      scale.value = withSpring(0.95);
      opacity.value = withSpring(0);
      translateY.value = withSpring(50);
    };

    sequence();
  }, [opacity, translateY, scale]);

  return {
    // Shared values
    opacity,
    translateY,
    scale,

    // Funções de animação
    fadeIn,
    fadeOut,
    slideUp,
    scaleUp,
    startEntryAnimation,
    startExitAnimation,

    // Configurações
    DEFAULT_SPRING_CONFIG,
    DEFAULT_DELAY,
  };
}
