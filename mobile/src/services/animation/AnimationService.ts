/**
 * Animation Service
 * 
 * This service provides comprehensive animation utilities with accessibility
 * considerations and performance optimizations.
 */

import { Animated, Easing, Platform } from 'react-native';
import { accessibilityService } from '../accessibility/AccessibilityService';

// Animation types
export enum AnimationType {
  FADE = 'fade',
  SLIDE = 'slide',
  SCALE = 'scale',
  ROTATE = 'rotate',
  SPRING = 'spring',
  BOUNCE = 'bounce',
}

// Animation direction
export enum AnimationDirection {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right',
  IN = 'in',
  OUT = 'out',
}

// Animation configuration
export interface AnimationConfig {
  type: AnimationType;
  direction?: AnimationDirection;
  duration?: number;
  delay?: number;
  easing?: any;
  useNativeDriver?: boolean;
  loop?: boolean;
  reverse?: boolean;
}

// Preset animations
export const ANIMATION_PRESETS = {
  // Fade animations
  FADE_IN: {
    type: AnimationType.FADE,
    direction: AnimationDirection.IN,
    duration: 300,
    easing: Easing.ease,
  },
  FADE_OUT: {
    type: AnimationType.FADE,
    direction: AnimationDirection.OUT,
    duration: 300,
    easing: Easing.ease,
  },
  
  // Slide animations
  SLIDE_IN_UP: {
    type: AnimationType.SLIDE,
    direction: AnimationDirection.UP,
    duration: 400,
    easing: Easing.out(Easing.cubic),
  },
  SLIDE_IN_DOWN: {
    type: AnimationType.SLIDE,
    direction: AnimationDirection.DOWN,
    duration: 400,
    easing: Easing.out(Easing.cubic),
  },
  SLIDE_IN_LEFT: {
    type: AnimationType.SLIDE,
    direction: AnimationDirection.LEFT,
    duration: 400,
    easing: Easing.out(Easing.cubic),
  },
  SLIDE_IN_RIGHT: {
    type: AnimationType.SLIDE,
    direction: AnimationDirection.RIGHT,
    duration: 400,
    easing: Easing.out(Easing.cubic),
  },
  
  // Scale animations
  SCALE_IN: {
    type: AnimationType.SCALE,
    direction: AnimationDirection.IN,
    duration: 300,
    easing: Easing.back(1.5),
  },
  SCALE_OUT: {
    type: AnimationType.SCALE,
    direction: AnimationDirection.OUT,
    duration: 200,
    easing: Easing.in(Easing.cubic),
  },
  
  // Spring animations
  SPRING_IN: {
    type: AnimationType.SPRING,
    direction: AnimationDirection.IN,
    duration: 500,
  },
  
  // Bounce animations
  BOUNCE: {
    type: AnimationType.BOUNCE,
    duration: 600,
    easing: Easing.bounce,
  },
  
  // Button press
  BUTTON_PRESS: {
    type: AnimationType.SCALE,
    duration: 100,
    easing: Easing.inOut(Easing.quad),
  },
  
  // Loading pulse
  LOADING_PULSE: {
    type: AnimationType.SCALE,
    duration: 1000,
    easing: Easing.inOut(Easing.sine),
    loop: true,
    reverse: true,
  },
} as const;

class AnimationService {
  private static instance: AnimationService;

  private constructor() {}

  public static getInstance(): AnimationService {
    if (!AnimationService.instance) {
      AnimationService.instance = new AnimationService();
    }
    return AnimationService.instance;
  }

  /**
   * Get animation duration considering accessibility preferences
   */
  public getDuration(baseDuration: number): number {
    const preferences = accessibilityService.getPreferences();
    
    if (preferences?.isReduceMotionEnabled) {
      return 0; // Disable animations for reduce motion
    }
    
    return baseDuration;
  }

  /**
   * Create fade animation
   */
  public createFadeAnimation(
    animatedValue: Animated.Value,
    config: Partial<AnimationConfig> = {}
  ): Animated.CompositeAnimation {
    const {
      direction = AnimationDirection.IN,
      duration = 300,
      delay = 0,
      easing = Easing.ease,
      useNativeDriver = true,
    } = config;

    const toValue = direction === AnimationDirection.IN ? 1 : 0;
    const adjustedDuration = this.getDuration(duration);

    return Animated.timing(animatedValue, {
      toValue,
      duration: adjustedDuration,
      delay,
      easing,
      useNativeDriver,
    });
  }

  /**
   * Create slide animation
   */
  public createSlideAnimation(
    animatedValue: Animated.Value,
    config: Partial<AnimationConfig> & { distance?: number } = {}
  ): Animated.CompositeAnimation {
    const {
      direction = AnimationDirection.UP,
      duration = 400,
      delay = 0,
      easing = Easing.out(Easing.cubic),
      useNativeDriver = true,
      distance = 50,
    } = config;

    let toValue = 0;
    
    switch (direction) {
      case AnimationDirection.UP:
        toValue = -distance;
        break;
      case AnimationDirection.DOWN:
        toValue = distance;
        break;
      case AnimationDirection.LEFT:
        toValue = -distance;
        break;
      case AnimationDirection.RIGHT:
        toValue = distance;
        break;
    }

    const adjustedDuration = this.getDuration(duration);

    return Animated.timing(animatedValue, {
      toValue,
      duration: adjustedDuration,
      delay,
      easing,
      useNativeDriver,
    });
  }

  /**
   * Create scale animation
   */
  public createScaleAnimation(
    animatedValue: Animated.Value,
    config: Partial<AnimationConfig> & { scale?: number } = {}
  ): Animated.CompositeAnimation {
    const {
      direction = AnimationDirection.IN,
      duration = 300,
      delay = 0,
      easing = Easing.back(1.5),
      useNativeDriver = true,
      scale = 1,
    } = config;

    const toValue = direction === AnimationDirection.IN ? scale : 0;
    const adjustedDuration = this.getDuration(duration);

    return Animated.timing(animatedValue, {
      toValue,
      duration: adjustedDuration,
      delay,
      easing,
      useNativeDriver,
    });
  }

  /**
   * Create spring animation
   */
  public createSpringAnimation(
    animatedValue: Animated.Value,
    config: Partial<AnimationConfig> & { 
      tension?: number; 
      friction?: number; 
      toValue?: number;
    } = {}
  ): Animated.CompositeAnimation {
    const {
      delay = 0,
      useNativeDriver = true,
      tension = 100,
      friction = 8,
      toValue = 1,
    } = config;

    // Check if animations should be disabled
    if (this.getDuration(1) === 0) {
      return Animated.timing(animatedValue, {
        toValue,
        duration: 0,
        useNativeDriver,
      });
    }

    return Animated.spring(animatedValue, {
      toValue,
      tension,
      friction,
      delay,
      useNativeDriver,
    });
  }

  /**
   * Create rotation animation
   */
  public createRotationAnimation(
    animatedValue: Animated.Value,
    config: Partial<AnimationConfig> & { rotations?: number } = {}
  ): Animated.CompositeAnimation {
    const {
      duration = 1000,
      delay = 0,
      easing = Easing.linear,
      useNativeDriver = true,
      loop = false,
      rotations = 1,
    } = config;

    const adjustedDuration = this.getDuration(duration);
    
    const animation = Animated.timing(animatedValue, {
      toValue: rotations,
      duration: adjustedDuration,
      delay,
      easing,
      useNativeDriver,
    });

    return loop && adjustedDuration > 0 ? Animated.loop(animation) : animation;
  }

  /**
   * Create sequence of animations
   */
  public createSequence(animations: Animated.CompositeAnimation[]): Animated.CompositeAnimation {
    return Animated.sequence(animations);
  }

  /**
   * Create parallel animations
   */
  public createParallel(animations: Animated.CompositeAnimation[]): Animated.CompositeAnimation {
    return Animated.parallel(animations);
  }

  /**
   * Create stagger animation
   */
  public createStagger(
    delay: number,
    animations: Animated.CompositeAnimation[]
  ): Animated.CompositeAnimation {
    const adjustedDelay = this.getDuration(delay);
    return Animated.stagger(adjustedDelay, animations);
  }

  /**
   * Create entrance animation for screen transitions
   */
  public createEntranceAnimation(
    fadeValue: Animated.Value,
    slideValue: Animated.Value,
    config: Partial<AnimationConfig> = {}
  ): Animated.CompositeAnimation {
    const {
      duration = 600,
      delay = 0,
    } = config;

    const fadeAnimation = this.createFadeAnimation(fadeValue, {
      direction: AnimationDirection.IN,
      duration: duration * 0.8,
      delay,
    });

    const slideAnimation = this.createSlideAnimation(slideValue, {
      direction: AnimationDirection.UP,
      duration,
      delay,
      distance: 30,
    });

    return this.createParallel([fadeAnimation, slideAnimation]);
  }

  /**
   * Create exit animation for screen transitions
   */
  public createExitAnimation(
    fadeValue: Animated.Value,
    slideValue: Animated.Value,
    config: Partial<AnimationConfig> = {}
  ): Animated.CompositeAnimation {
    const {
      duration = 400,
      delay = 0,
    } = config;

    const fadeAnimation = this.createFadeAnimation(fadeValue, {
      direction: AnimationDirection.OUT,
      duration: duration * 0.6,
      delay: delay + duration * 0.2,
    });

    const slideAnimation = this.createSlideAnimation(slideValue, {
      direction: AnimationDirection.DOWN,
      duration,
      delay,
      distance: 20,
    });

    return this.createParallel([fadeAnimation, slideAnimation]);
  }

  /**
   * Create button press animation
   */
  public createButtonPressAnimation(
    scaleValue: Animated.Value
  ): Animated.CompositeAnimation {
    const duration = this.getDuration(100);
    
    return this.createSequence([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]);
  }

  /**
   * Create loading pulse animation
   */
  public createLoadingPulseAnimation(
    scaleValue: Animated.Value
  ): Animated.CompositeAnimation {
    const duration = this.getDuration(1000);
    
    if (duration === 0) {
      return Animated.timing(scaleValue, {
        toValue: 1,
        duration: 0,
        useNativeDriver: true,
      });
    }

    const animation = Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 1.1,
        duration: duration / 2,
        easing: Easing.inOut(Easing.sine),
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: duration / 2,
        easing: Easing.inOut(Easing.sine),
        useNativeDriver: true,
      }),
    ]);

    return Animated.loop(animation);
  }

  /**
   * Create shake animation for error feedback
   */
  public createShakeAnimation(
    translateValue: Animated.Value,
    config: { intensity?: number; duration?: number } = {}
  ): Animated.CompositeAnimation {
    const { intensity = 10, duration = 400 } = config;
    const adjustedDuration = this.getDuration(duration);
    
    if (adjustedDuration === 0) {
      return Animated.timing(translateValue, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      });
    }

    const stepDuration = adjustedDuration / 8;

    return this.createSequence([
      Animated.timing(translateValue, {
        toValue: intensity,
        duration: stepDuration,
        useNativeDriver: true,
      }),
      Animated.timing(translateValue, {
        toValue: -intensity,
        duration: stepDuration,
        useNativeDriver: true,
      }),
      Animated.timing(translateValue, {
        toValue: intensity,
        duration: stepDuration,
        useNativeDriver: true,
      }),
      Animated.timing(translateValue, {
        toValue: -intensity,
        duration: stepDuration,
        useNativeDriver: true,
      }),
      Animated.timing(translateValue, {
        toValue: intensity / 2,
        duration: stepDuration,
        useNativeDriver: true,
      }),
      Animated.timing(translateValue, {
        toValue: -intensity / 2,
        duration: stepDuration,
        useNativeDriver: true,
      }),
      Animated.timing(translateValue, {
        toValue: intensity / 4,
        duration: stepDuration,
        useNativeDriver: true,
      }),
      Animated.timing(translateValue, {
        toValue: 0,
        duration: stepDuration,
        useNativeDriver: true,
      }),
    ]);
  }
}

// Export singleton instance
export const animationService = AnimationService.getInstance();
