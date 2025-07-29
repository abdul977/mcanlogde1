import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Product, CartItem } from '../types';
import { STORAGE_KEYS } from '../constants';

// Cart actions
type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CART'; payload: CartItem[] }
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity: number } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_CART' };

// Cart state
interface CartState {
  items: CartItem[];
  isLoading: boolean;
  totalItems: number;
  totalAmount: number;
}

// Cart context type
interface CartContextType extends CartState {
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string) => number;
  isInCart: (productId: string) => boolean;
}

// Initial state
const initialState: CartState = {
  items: [],
  isLoading: true,
  totalItems: 0,
  totalAmount: 0,
};

// Calculate totals helper
const calculateTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  return { totalItems, totalAmount };
};

// Cart reducer
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_CART': {
      const { totalItems, totalAmount } = calculateTotals(action.payload);
      return {
        ...state,
        items: action.payload,
        totalItems,
        totalAmount,
        isLoading: false,
      };
    }
    
    case 'ADD_ITEM': {
      const { product, quantity } = action.payload;
      const existingItemIndex = state.items.findIndex(item => item.product._id === product._id);
      
      let newItems: CartItem[];
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        newItems = [...state.items, { product, quantity }];
      }
      
      const { totalItems, totalAmount } = calculateTotals(newItems);
      return {
        ...state,
        items: newItems,
        totalItems,
        totalAmount,
      };
    }
    
    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload;
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        const newItems = state.items.filter(item => item.product._id !== productId);
        const { totalItems, totalAmount } = calculateTotals(newItems);
        return {
          ...state,
          items: newItems,
          totalItems,
          totalAmount,
        };
      }
      
      const newItems = state.items.map(item =>
        item.product._id === productId
          ? { ...item, quantity }
          : item
      );
      
      const { totalItems, totalAmount } = calculateTotals(newItems);
      return {
        ...state,
        items: newItems,
        totalItems,
        totalAmount,
      };
    }
    
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.product._id !== action.payload);
      const { totalItems, totalAmount } = calculateTotals(newItems);
      return {
        ...state,
        items: newItems,
        totalItems,
        totalAmount,
      };
    }
    
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalAmount: 0,
      };
    
    default:
      return state;
  }
};

// Create context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Cart provider component
interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from storage on app start
  useEffect(() => {
    loadCart();
  }, []);

  // Save cart to storage whenever it changes
  useEffect(() => {
    if (!state.isLoading) {
      saveCart();
    }
  }, [state.items, state.isLoading]);

  const loadCart = async () => {
    try {
      const cartData = await AsyncStorage.getItem(STORAGE_KEYS.CART_ITEMS);
      if (cartData) {
        const items = JSON.parse(cartData);
        dispatch({ type: 'SET_CART', payload: items });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const saveCart = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CART_ITEMS, JSON.stringify(state.items));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  const addItem = (product: Product, quantity: number = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, quantity } });
  };

  const removeItem = (productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getItemQuantity = (productId: string): number => {
    const item = state.items.find(item => item.product._id === productId);
    return item ? item.quantity : 0;
  };

  const isInCart = (productId: string): boolean => {
    return state.items.some(item => item.product._id === productId);
  };

  const value: CartContextType = {
    ...state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemQuantity,
    isInCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook to use cart context
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
