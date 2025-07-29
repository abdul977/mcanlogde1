/**
 * Navigation Service
 * 
 * This service provides programmatic navigation capabilities and deep linking support
 * with accessibility announcements and navigation tracking.
 */

import { NavigationContainerRef, CommonActions, StackActions } from '@react-navigation/native';
import { accessibilityService } from '../accessibility/AccessibilityService';
import { RootStackParamList } from '../../navigation/types';

// Navigation state interface
interface NavigationState {
  currentRoute: string | null;
  previousRoute: string | null;
  navigationHistory: string[];
}

// Deep link configuration
interface DeepLinkConfig {
  screens: Record<string, string | { path: string; exact?: boolean }>;
  initialRouteName?: string;
}

class NavigationService {
  private static instance: NavigationService;
  private navigationRef: React.RefObject<NavigationContainerRef<RootStackParamList>> | null = null;
  private state: NavigationState = {
    currentRoute: null,
    previousRoute: null,
    navigationHistory: [],
  };

  private constructor() {}

  public static getInstance(): NavigationService {
    if (!NavigationService.instance) {
      NavigationService.instance = new NavigationService();
    }
    return NavigationService.instance;
  }

  /**
   * Set navigation reference
   */
  public setNavigationRef(ref: React.RefObject<NavigationContainerRef<RootStackParamList>>): void {
    this.navigationRef = ref;
  }

  /**
   * Get current navigation reference
   */
  private getNavigationRef(): NavigationContainerRef<RootStackParamList> | null {
    return this.navigationRef?.current || null;
  }

  /**
   * Check if navigation is ready
   */
  public isReady(): boolean {
    const navRef = this.getNavigationRef();
    return navRef?.isReady() || false;
  }

  /**
   * Get current route name
   */
  public getCurrentRouteName(): string | null {
    const navRef = this.getNavigationRef();
    if (!navRef || !navRef.isReady()) return null;

    const route = navRef.getCurrentRoute();
    return route?.name || null;
  }

  /**
   * Navigate to a screen
   */
  public navigate(name: string, params?: any): void {
    const navRef = this.getNavigationRef();
    if (!navRef || !navRef.isReady()) {
      console.warn('Navigation not ready');
      return;
    }

    try {
      // Update navigation state
      this.updateNavigationState(name);

      // Perform navigation
      navRef.navigate(name as never, params);

      // Announce navigation for accessibility
      this.announceNavigation(name);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }

  /**
   * Go back to previous screen
   */
  public goBack(): void {
    const navRef = this.getNavigationRef();
    if (!navRef || !navRef.isReady()) {
      console.warn('Navigation not ready');
      return;
    }

    try {
      if (navRef.canGoBack()) {
        navRef.goBack();
        
        // Update state
        const previousRoute = this.state.previousRoute;
        if (previousRoute) {
          this.updateNavigationState(previousRoute);
          this.announceNavigation(previousRoute, 'back');
        }
      }
    } catch (error) {
      console.error('Go back error:', error);
    }
  }

  /**
   * Reset navigation stack
   */
  public reset(routeName: string, params?: any): void {
    const navRef = this.getNavigationRef();
    if (!navRef || !navRef.isReady()) {
      console.warn('Navigation not ready');
      return;
    }

    try {
      navRef.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: routeName, params }],
        })
      );

      // Reset navigation state
      this.state = {
        currentRoute: routeName,
        previousRoute: null,
        navigationHistory: [routeName],
      };

      this.announceNavigation(routeName, 'reset');
    } catch (error) {
      console.error('Reset navigation error:', error);
    }
  }

  /**
   * Push a new screen onto the stack
   */
  public push(name: string, params?: any): void {
    const navRef = this.getNavigationRef();
    if (!navRef || !navRef.isReady()) {
      console.warn('Navigation not ready');
      return;
    }

    try {
      navRef.dispatch(StackActions.push(name, params));
      this.updateNavigationState(name);
      this.announceNavigation(name, 'push');
    } catch (error) {
      console.error('Push navigation error:', error);
    }
  }

  /**
   * Pop screens from the stack
   */
  public pop(count: number = 1): void {
    const navRef = this.getNavigationRef();
    if (!navRef || !navRef.isReady()) {
      console.warn('Navigation not ready');
      return;
    }

    try {
      navRef.dispatch(StackActions.pop(count));
      
      // Update state based on history
      const newHistory = this.state.navigationHistory.slice(0, -count);
      const newCurrentRoute = newHistory[newHistory.length - 1] || null;
      
      this.state = {
        currentRoute: newCurrentRoute,
        previousRoute: this.state.currentRoute,
        navigationHistory: newHistory,
      };

      if (newCurrentRoute) {
        this.announceNavigation(newCurrentRoute, 'pop');
      }
    } catch (error) {
      console.error('Pop navigation error:', error);
    }
  }

  /**
   * Navigate to a specific tab
   */
  public navigateToTab(tabName: string, params?: any): void {
    const navRef = this.getNavigationRef();
    if (!navRef || !navRef.isReady()) {
      console.warn('Navigation not ready');
      return;
    }

    try {
      navRef.navigate('Main' as never, {
        screen: tabName,
        params,
      } as never);

      this.updateNavigationState(tabName);
      this.announceNavigation(tabName, 'tab');
    } catch (error) {
      console.error('Tab navigation error:', error);
    }
  }

  /**
   * Open modal
   */
  public openModal(modalName: string, params?: any): void {
    const navRef = this.getNavigationRef();
    if (!navRef || !navRef.isReady()) {
      console.warn('Navigation not ready');
      return;
    }

    try {
      navRef.navigate('Modal' as never, {
        screen: modalName,
        params,
      } as never);

      this.updateNavigationState(modalName);
      this.announceNavigation(modalName, 'modal');
    } catch (error) {
      console.error('Modal navigation error:', error);
    }
  }

  /**
   * Close modal
   */
  public closeModal(): void {
    this.goBack();
  }

  /**
   * Update navigation state
   */
  private updateNavigationState(newRoute: string): void {
    this.state = {
      previousRoute: this.state.currentRoute,
      currentRoute: newRoute,
      navigationHistory: [...this.state.navigationHistory, newRoute].slice(-10), // Keep last 10 routes
    };
  }

  /**
   * Announce navigation for accessibility
   */
  private announceNavigation(routeName: string, action: string = 'navigate'): void {
    const screenNames: Record<string, string> = {
      Login: 'Login Screen',
      Register: 'Registration Screen',
      ForgotPassword: 'Password Reset Screen',
      Home: 'Home Screen',
      Profile: 'Profile Screen',
      Settings: 'Settings Screen',
      // Add more screen name mappings as needed
    };

    const screenTitle = screenNames[routeName] || routeName;
    
    let message = '';
    switch (action) {
      case 'back':
        message = `Returned to ${screenTitle}`;
        break;
      case 'reset':
        message = `Navigated to ${screenTitle}`;
        break;
      case 'push':
        message = `Opened ${screenTitle}`;
        break;
      case 'pop':
        message = `Returned to ${screenTitle}`;
        break;
      case 'tab':
        message = `Switched to ${screenTitle}`;
        break;
      case 'modal':
        message = `Opened ${screenTitle} modal`;
        break;
      default:
        message = `Navigated to ${screenTitle}`;
    }

    accessibilityService.announce(message);
  }

  /**
   * Get navigation state
   */
  public getNavigationState(): NavigationState {
    return { ...this.state };
  }

  /**
   * Get deep link configuration
   */
  public getDeepLinkConfig(): DeepLinkConfig {
    return {
      screens: {
        Auth: {
          screens: {
            Login: 'login',
            Register: 'register',
            ForgotPassword: 'forgot-password',
          },
        },
        Main: {
          screens: {
            HomeTab: {
              screens: {
                Home: 'home',
                Search: 'search',
                PrayerTimes: 'prayer-times',
              },
            },
            AccommodationsTab: {
              screens: {
                Accommodations: 'accommodations',
                AccommodationDetails: 'accommodations/:id',
                Booking: 'booking/:accommodationId',
              },
            },
            ShopTab: {
              screens: {
                Shop: 'shop',
                ProductDetails: 'products/:id',
                Cart: 'cart',
                Checkout: 'checkout',
              },
            },
            CommunityTab: {
              screens: {
                Community: 'community',
                Events: 'events',
                EventDetails: 'events/:id',
                Blog: 'blog',
                BlogDetails: 'blog/:id',
              },
            },
            ProfileTab: {
              screens: {
                Profile: 'profile',
                Settings: 'settings',
                MyBookings: 'my-bookings',
                OrderHistory: 'order-history',
              },
            },
          },
        },
        Modal: {
          screens: {
            ImageViewer: 'image-viewer',
            DatePicker: 'date-picker',
            LocationPicker: 'location-picker',
            FilterModal: 'filters',
          },
        },
      },
      initialRouteName: 'Auth',
    };
  }

  /**
   * Handle deep link
   */
  public handleDeepLink(url: string): boolean {
    const navRef = this.getNavigationRef();
    if (!navRef || !navRef.isReady()) {
      console.warn('Navigation not ready for deep link');
      return false;
    }

    try {
      // Parse the URL and navigate accordingly
      // This is a simplified implementation
      const path = url.replace(/.*?:\/\//g, '');
      const segments = path.split('/');

      if (segments.length > 0) {
        const screen = segments[0];
        const params = segments.length > 1 ? { id: segments[1] } : undefined;
        
        this.navigate(screen, params);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Deep link handling error:', error);
      return false;
    }
  }
}

// Export singleton instance
export const navigationService = NavigationService.getInstance();
