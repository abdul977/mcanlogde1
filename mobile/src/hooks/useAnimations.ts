/**
 * Animation Hooks
 * 
 * This file provides React hooks for common animation patterns
 * with accessibility considerations and performance optimizations.
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import { Animated } from 'react-native';

import {
  animationService,
  AnimationType,
  AnimationDirection,
  AnimationConfig,
} from '../services/animation/AnimationService';

// Fade animation hook
export const useFadeAnimation = (
  initialValue: number = 0,
  config: Partial<AnimationConfig> = {}
) => {
  const fadeAnim = useRef(new Animated.Value(initialValue)).current;

  const fadeIn = useCallback((customConfig?: Partial<AnimationConfig>) => {
    const animation = animationService.createFadeAnimation(fadeAnim, {
      direction: AnimationDirection.IN,
      ...config,
      ...customConfig,
    });
    animation.start();
    return animation;
  }, [fadeAnim, config]);

  const fadeOut = useCallback((customConfig?: Partial<AnimationConfig>) => {
    const animation = animationService.createFadeAnimation(fadeAnim, {
      direction: AnimationDirection.OUT,
      ...config,
      ...customConfig,
    });
    animation.start();
    return animation;
  }, [fadeAnim, config]);

  const reset = useCallback(() => {
    fadeAnim.setValue(initialValue);
  }, [fadeAnim, initialValue]);

  return {
    fadeAnim,
    fadeIn,
    fadeOut,
    reset,
  };
};

// Slide animation hook
export const useSlideAnimation = (
  initialValue: number = 50,
  config: Partial<AnimationConfig> = {}
) => {
  const slideAnim = useRef(new Animated.Value(initialValue)).current;

  const slideIn = useCallback((direction: AnimationDirection, customConfig?: Partial<AnimationConfig>) => {
    const animation = animationService.createSlideAnimation(slideAnim, {
      direction,
      ...config,
      ...customConfig,
    });
    animation.start();
    return animation;
  }, [slideAnim, config]);

  const slideOut = useCallback((direction: AnimationDirection, customConfig?: Partial<AnimationConfig>) => {
    const animation = animationService.createSlideAnimation(slideAnim, {
      direction,
      ...config,
      ...customConfig,
    });
    animation.start();
    return animation;
  }, [slideAnim, config]);

  const reset = useCallback(() => {
    slideAnim.setValue(initialValue);
  }, [slideAnim, initialValue]);

  return {
    slideAnim,
    slideIn,
    slideOut,
    reset,
  };
};

// Scale animation hook
export const useScaleAnimation = (
  initialValue: number = 1,
  config: Partial<AnimationConfig> = {}
) => {
  const scaleAnim = useRef(new Animated.Value(initialValue)).current;

  const scaleIn = useCallback((customConfig?: Partial<AnimationConfig>) => {
    const animation = animationService.createScaleAnimation(scaleAnim, {
      direction: AnimationDirection.IN,
      ...config,
      ...customConfig,
    });
    animation.start();
    return animation;
  }, [scaleAnim, config]);

  const scaleOut = useCallback((customConfig?: Partial<AnimationConfig>) => {
    const animation = animationService.createScaleAnimation(scaleAnim, {
      direction: AnimationDirection.OUT,
      ...config,
      ...customConfig,
    });
    animation.start();
    return animation;
  }, [scaleAnim, config]);

  const reset = useCallback(() => {
    scaleAnim.setValue(initialValue);
  }, [scaleAnim, initialValue]);

  return {
    scaleAnim,
    scaleIn,
    scaleOut,
    reset,
  };
};

// Spring animation hook
export const useSpringAnimation = (
  initialValue: number = 0,
  config: { tension?: number; friction?: number } = {}
) => {
  const springAnim = useRef(new Animated.Value(initialValue)).current;

  const springTo = useCallback((toValue: number, customConfig?: any) => {
    const animation = animationService.createSpringAnimation(springAnim, {
      toValue,
      ...config,
      ...customConfig,
    });
    animation.start();
    return animation;
  }, [springAnim, config]);

  const reset = useCallback(() => {
    springAnim.setValue(initialValue);
  }, [springAnim, initialValue]);

  return {
    springAnim,
    springTo,
    reset,
  };
};

// Entrance animation hook (combines fade and slide)
export const useEntranceAnimation = (
  autoStart: boolean = true,
  config: Partial<AnimationConfig> = {}
) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const startEntrance = useCallback((customConfig?: Partial<AnimationConfig>) => {
    const animation = animationService.createEntranceAnimation(fadeAnim, slideAnim, {
      ...config,
      ...customConfig,
    });
    animation.start();
    return animation;
  }, [fadeAnim, slideAnim, config]);

  const startExit = useCallback((customConfig?: Partial<AnimationConfig>) => {
    const animation = animationService.createExitAnimation(fadeAnim, slideAnim, {
      ...config,
      ...customConfig,
    });
    animation.start();
    return animation;
  }, [fadeAnim, slideAnim, config]);

  const reset = useCallback(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    if (autoStart) {
      startEntrance();
    }
  }, [autoStart, startEntrance]);

  return {
    fadeAnim,
    slideAnim,
    startEntrance,
    startExit,
    reset,
  };
};

// Button press animation hook
export const useButtonPressAnimation = () => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const animatePress = useCallback(() => {
    const animation = animationService.createButtonPressAnimation(scaleAnim);
    animation.start();
    return animation;
  }, [scaleAnim]);

  return {
    scaleAnim,
    animatePress,
  };
};

// Loading pulse animation hook
export const useLoadingPulseAnimation = (autoStart: boolean = true) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  const startPulse = useCallback(() => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const animation = animationService.createLoadingPulseAnimation(scaleAnim);
    animationRef.current = animation;
    animation.start();
  }, [scaleAnim, isAnimating]);

  const stopPulse = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.stop();
      animationRef.current = null;
    }
    scaleAnim.setValue(1);
    setIsAnimating(false);
  }, [scaleAnim]);

  useEffect(() => {
    if (autoStart) {
      startPulse();
    }

    return () => {
      stopPulse();
    };
  }, [autoStart, startPulse, stopPulse]);

  return {
    scaleAnim,
    startPulse,
    stopPulse,
    isAnimating,
  };
};

// Shake animation hook for error feedback
export const useShakeAnimation = () => {
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = useCallback((config?: { intensity?: number; duration?: number }) => {
    const animation = animationService.createShakeAnimation(shakeAnim, config);
    animation.start(() => {
      shakeAnim.setValue(0);
    });
    return animation;
  }, [shakeAnim]);

  return {
    shakeAnim,
    shake,
  };
};

// Rotation animation hook
export const useRotationAnimation = () => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const rotate = useCallback((config?: Partial<AnimationConfig> & { rotations?: number }) => {
    const animation = animationService.createRotationAnimation(rotateAnim, config);
    animation.start();
    return animation;
  }, [rotateAnim]);

  const reset = useCallback(() => {
    rotateAnim.setValue(0);
  }, [rotateAnim]);

  // Convert animated value to rotation string
  const rotateInterpolation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return {
    rotateAnim,
    rotateInterpolation,
    rotate,
    reset,
  };
};

// Stagger animation hook for lists
export const useStaggerAnimation = (
  itemCount: number,
  staggerDelay: number = 100,
  config: Partial<AnimationConfig> = {}
) => {
  const animatedValues = useRef(
    Array.from({ length: itemCount }, () => new Animated.Value(0))
  ).current;

  const startStagger = useCallback((customConfig?: Partial<AnimationConfig>) => {
    const animations = animatedValues.map(value =>
      animationService.createFadeAnimation(value, {
        direction: AnimationDirection.IN,
        ...config,
        ...customConfig,
      })
    );

    const staggerAnimation = animationService.createStagger(staggerDelay, animations);
    staggerAnimation.start();
    return staggerAnimation;
  }, [animatedValues, staggerDelay, config]);

  const reset = useCallback(() => {
    animatedValues.forEach(value => value.setValue(0));
  }, [animatedValues]);

  return {
    animatedValues,
    startStagger,
    reset,
  };
};

// Combined animation hook for complex sequences
export const useSequenceAnimation = () => {
  const createSequence = useCallback((animations: Animated.CompositeAnimation[]) => {
    return animationService.createSequence(animations);
  }, []);

  const createParallel = useCallback((animations: Animated.CompositeAnimation[]) => {
    return animationService.createParallel(animations);
  }, []);

  return {
    createSequence,
    createParallel,
  };
};
