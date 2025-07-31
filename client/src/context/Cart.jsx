import { useState, useContext, createContext, useEffect, useReducer } from "react";

// Cart actions
const cartActions = {
  SET_LOADING: 'SET_LOADING',
  SET_CART: 'SET_CART',
  ADD_ITEM: 'ADD_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  REMOVE_ITEM: 'REMOVE_ITEM',
  CLEAR_CART: 'CLEAR_CART'
};

// Calculate totals helper
const calculateTotals = (items) => {
  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const totalAmount = items.reduce((sum, item) => {
    const price = item.price || 0;
    const quantity = item.quantity || 1;
    return sum + (price * quantity);
  }, 0);
  return { totalItems, totalAmount };
};

// Cart reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case cartActions.SET_LOADING:
      return { ...state, isLoading: action.payload };

    case cartActions.SET_CART:
      const { totalItems, totalAmount } = calculateTotals(action.payload);
      return {
        ...state,
        items: action.payload,
        totalItems,
        totalAmount,
        isLoading: false,
      };

    case cartActions.ADD_ITEM: {
      const { item, quantity = 1 } = action.payload;
      const existingItemIndex = state.items.findIndex(cartItem =>
        cartItem._id === item._id &&
        JSON.stringify(cartItem.selectedVariants) === JSON.stringify(item.selectedVariants)
      );

      let newItems;
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        newItems = state.items.map((cartItem, index) =>
          index === existingItemIndex
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      } else {
        // Add new item
        newItems = [...state.items, { ...item, quantity }];
      }

      const totals = calculateTotals(newItems);
      return {
        ...state,
        items: newItems,
        ...totals,
      };
    }

    case cartActions.UPDATE_QUANTITY: {
      const { itemId, quantity, selectedVariants } = action.payload;
      const newItems = state.items.map(item =>
        item._id === itemId &&
        JSON.stringify(item.selectedVariants) === JSON.stringify(selectedVariants)
          ? { ...item, quantity }
          : item
      );

      const totals = calculateTotals(newItems);
      return {
        ...state,
        items: newItems,
        ...totals,
      };
    }

    case cartActions.REMOVE_ITEM: {
      const { itemId, selectedVariants } = action.payload;
      const newItems = state.items.filter(item =>
        !(item._id === itemId &&
          JSON.stringify(item.selectedVariants) === JSON.stringify(selectedVariants))
      );

      const totals = calculateTotals(newItems);
      return {
        ...state,
        items: newItems,
        ...totals,
      };
    }

    case cartActions.CLEAR_CART:
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

// Initial state
const initialState = {
  items: [],
  isLoading: true,
  totalItems: 0,
  totalAmount: 0,
};

const CartContext = createContext();

const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const existingCartItem = localStorage.getItem("cart");
    if (existingCartItem) {
      try {
        const cartData = JSON.parse(existingCartItem);
        dispatch({ type: cartActions.SET_CART, payload: cartData });
      } catch (error) {
        console.error('Error parsing cart data:', error);
        dispatch({ type: cartActions.SET_LOADING, payload: false });
      }
    } else {
      dispatch({ type: cartActions.SET_LOADING, payload: false });
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!state.isLoading) {
      localStorage.setItem("cart", JSON.stringify(state.items));
    }
  }, [state.items, state.isLoading]);

  // Cart methods
  const addItem = (item, quantity = 1) => {
    dispatch({ type: cartActions.ADD_ITEM, payload: { item, quantity } });
  };

  const updateQuantity = (itemId, quantity, selectedVariants = null) => {
    if (quantity <= 0) {
      removeItem(itemId, selectedVariants);
      return;
    }
    dispatch({ type: cartActions.UPDATE_QUANTITY, payload: { itemId, quantity, selectedVariants } });
  };

  const removeItem = (itemId, selectedVariants = null) => {
    dispatch({ type: cartActions.REMOVE_ITEM, payload: { itemId, selectedVariants } });
  };

  const clearCart = () => {
    dispatch({ type: cartActions.CLEAR_CART });
  };

  const getItemQuantity = (itemId, selectedVariants = null) => {
    const item = state.items.find(item =>
      item._id === itemId &&
      JSON.stringify(item.selectedVariants) === JSON.stringify(selectedVariants)
    );
    return item ? item.quantity : 0;
  };

  const isInCart = (itemId, selectedVariants = null) => {
    return state.items.some(item =>
      item._id === itemId &&
      JSON.stringify(item.selectedVariants) === JSON.stringify(selectedVariants)
    );
  };

  // Legacy support - provide both new and old API
  const value = {
    // New API
    ...state,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getItemQuantity,
    isInCart,

    // Legacy API for backward compatibility
    cart: state.items,
    setCart: (items) => dispatch({ type: cartActions.SET_CART, payload: items }),
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// custom hook
const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export { useCart, CartProvider };
