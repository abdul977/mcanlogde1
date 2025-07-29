/**
 * Accessibility Service
 * 
 * This service provides comprehensive accessibility functionality including
 * screen reader support, focus management, and high contrast mode.
 */

import { AccessibilityInfo, Platform } from 'react-native';

// Accessibility announcement types
export enum AnnouncementType {
  POLITE = 'polite',
  ASSERTIVE = 'assertive',
}

// Focus management interface
export interface FocusTarget {
  ref: React.RefObject<any>;
  delay?: number;
}

// Accessibility preferences interface
export interface AccessibilityPreferences {
  isScreenReaderEnabled: boolean;
  isReduceMotionEnabled: boolean;
  isHighContrastEnabled: boolean;
  preferredFontScale: number;
  isVoiceOverEnabled: boolean; // iOS
  isTalkBackEnabled: boolean; // Android
}

class AccessibilityService {
  private static instance: AccessibilityService;
  private preferences: AccessibilityPreferences | null = null;
  private listeners: Array<() => void> = [];

  private constructor() {}

  public static getInstance(): AccessibilityService {
    if (!AccessibilityService.instance) {
      AccessibilityService.instance = new AccessibilityService();
    }
    return AccessibilityService.instance;
  }

  /**
   * Initialize accessibility service
   */
  public async initialize(): Promise<void> {
    try {
      await this.updatePreferences();
      this.setupListeners();
    } catch (error) {
      console.error('Failed to initialize accessibility service:', error);
    }
  }

  /**
   * Update accessibility preferences
   */
  private async updatePreferences(): Promise<void> {
    try {
      const [
        isScreenReaderEnabled,
        isReduceMotionEnabled,
        isHighContrastEnabled,
        preferredFontScale,
      ] = await Promise.all([
        AccessibilityInfo.isScreenReaderEnabled(),
        AccessibilityInfo.isReduceMotionEnabled(),
        Platform.OS === 'ios' 
          ? AccessibilityInfo.isHighContrastEnabled?.() || Promise.resolve(false)
          : Promise.resolve(false),
        AccessibilityInfo.getRecommendedTimeoutAdjustment?.() || Promise.resolve(1),
      ]);

      this.preferences = {
        isScreenReaderEnabled,
        isReduceMotionEnabled,
        isHighContrastEnabled,
        preferredFontScale,
        isVoiceOverEnabled: Platform.OS === 'ios' && isScreenReaderEnabled,
        isTalkBackEnabled: Platform.OS === 'android' && isScreenReaderEnabled,
      };
    } catch (error) {
      console.error('Error updating accessibility preferences:', error);
      // Fallback to default preferences
      this.preferences = {
        isScreenReaderEnabled: false,
        isReduceMotionEnabled: false,
        isHighContrastEnabled: false,
        preferredFontScale: 1,
        isVoiceOverEnabled: false,
        isTalkBackEnabled: false,
      };
    }
  }

  /**
   * Setup accessibility listeners
   */
  private setupListeners(): void {
    // Screen reader change listener
    const screenReaderListener = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      (isEnabled: boolean) => {
        if (this.preferences) {
          this.preferences.isScreenReaderEnabled = isEnabled;
          this.preferences.isVoiceOverEnabled = Platform.OS === 'ios' && isEnabled;
          this.preferences.isTalkBackEnabled = Platform.OS === 'android' && isEnabled;
        }
        this.notifyListeners();
      }
    );

    // Reduce motion change listener
    const reduceMotionListener = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (isEnabled: boolean) => {
        if (this.preferences) {
          this.preferences.isReduceMotionEnabled = isEnabled;
        }
        this.notifyListeners();
      }
    );

    // High contrast change listener (iOS only)
    let highContrastListener: any;
    if (Platform.OS === 'ios' && AccessibilityInfo.addEventListener) {
      highContrastListener = AccessibilityInfo.addEventListener(
        'highContrastChanged' as any,
        (isEnabled: boolean) => {
          if (this.preferences) {
            this.preferences.isHighContrastEnabled = isEnabled;
          }
          this.notifyListeners();
        }
      );
    }

    // Store listeners for cleanup
    this.listeners.push(() => {
      screenReaderListener?.remove();
      reduceMotionListener?.remove();
      highContrastListener?.remove();
    });
  }

  /**
   * Notify all listeners of preference changes
   */
  private notifyListeners(): void {
    // This would notify any components listening for accessibility changes
    // In a real implementation, you might use a state management solution
  }

  /**
   * Get current accessibility preferences
   */
  public getPreferences(): AccessibilityPreferences | null {
    return this.preferences;
  }

  /**
   * Check if screen reader is enabled
   */
  public isScreenReaderEnabled(): boolean {
    return this.preferences?.isScreenReaderEnabled || false;
  }

  /**
   * Check if reduce motion is enabled
   */
  public isReduceMotionEnabled(): boolean {
    return this.preferences?.isReduceMotionEnabled || false;
  }

  /**
   * Check if high contrast is enabled
   */
  public isHighContrastEnabled(): boolean {
    return this.preferences?.isHighContrastEnabled || false;
  }

  /**
   * Get preferred font scale
   */
  public getPreferredFontScale(): number {
    return this.preferences?.preferredFontScale || 1;
  }

  /**
   * Announce message to screen reader
   */
  public announce(message: string, type: AnnouncementType = AnnouncementType.POLITE): void {
    if (!this.isScreenReaderEnabled()) return;

    try {
      if (Platform.OS === 'ios') {
        AccessibilityInfo.announceForAccessibility(message);
      } else {
        // Android TalkBack
        AccessibilityInfo.announceForAccessibility(message);
      }
    } catch (error) {
      console.error('Error announcing message:', error);
    }
  }

  /**
   * Set focus to a specific element
   */
  public setFocus(target: FocusTarget): void {
    if (!target.ref.current) return;

    try {
      const delay = target.delay || 100;
      
      setTimeout(() => {
        if (target.ref.current) {
          if (Platform.OS === 'ios') {
            AccessibilityInfo.setAccessibilityFocus(target.ref.current);
          } else {
            // Android focus
            target.ref.current.focus?.();
          }
        }
      }, delay);
    } catch (error) {
      console.error('Error setting focus:', error);
    }
  }

  /**
   * Get accessibility props for a component
   */
  public getAccessibilityProps(config: {
    label?: string;
    hint?: string;
    role?: string;
    state?: any;
    value?: string;
    actions?: Array<{ name: string; label: string }>;
  }) {
    const props: any = {};

    if (config.label) {
      props.accessibilityLabel = config.label;
    }

    if (config.hint) {
      props.accessibilityHint = config.hint;
    }

    if (config.role) {
      props.accessibilityRole = config.role;
    }

    if (config.state) {
      props.accessibilityState = config.state;
    }

    if (config.value) {
      props.accessibilityValue = config.value;
    }

    if (config.actions && config.actions.length > 0) {
      props.accessibilityActions = config.actions;
    }

    return props;
  }

  /**
   * Get high contrast colors
   */
  public getHighContrastColors() {
    if (!this.isHighContrastEnabled()) {
      return null;
    }

    return {
      background: '#000000',
      surface: '#1a1a1a',
      primary: '#ffffff',
      text: '#ffffff',
      textSecondary: '#cccccc',
      border: '#ffffff',
      error: '#ff6b6b',
      success: '#51cf66',
      warning: '#ffd43b',
    };
  }

  /**
   * Get adjusted animation duration based on reduce motion preference
   */
  public getAnimationDuration(baseDuration: number): number {
    if (this.isReduceMotionEnabled()) {
      return 0; // Disable animations
    }
    return baseDuration;
  }

  /**
   * Get adjusted font size based on accessibility preferences
   */
  public getAdjustedFontSize(baseFontSize: number): number {
    const scale = this.getPreferredFontScale();
    return Math.round(baseFontSize * scale);
  }

  /**
   * Check if element should be focusable
   */
  public shouldBeFocusable(element: {
    disabled?: boolean;
    interactive?: boolean;
  }): boolean {
    if (element.disabled) return false;
    if (!this.isScreenReaderEnabled()) return element.interactive || false;
    return true;
  }

  /**
   * Get semantic role for element
   */
  public getSemanticRole(elementType: string): string {
    const roleMap: Record<string, string> = {
      button: 'button',
      link: 'link',
      text: 'text',
      heading: 'header',
      input: 'textbox',
      checkbox: 'checkbox',
      radio: 'radio',
      switch: 'switch',
      slider: 'slider',
      image: 'image',
      list: 'list',
      listItem: 'listitem',
      tab: 'tab',
      tabList: 'tablist',
      menu: 'menu',
      menuItem: 'menuitem',
      alert: 'alert',
      dialog: 'dialog',
    };

    return roleMap[elementType] || 'none';
  }

  /**
   * Cleanup accessibility service
   */
  public cleanup(): void {
    this.listeners.forEach(cleanup => cleanup());
    this.listeners = [];
    this.preferences = null;
  }
}

// Export singleton instance
export const accessibilityService = AccessibilityService.getInstance();
