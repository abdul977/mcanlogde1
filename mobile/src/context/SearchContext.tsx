import React, { createContext, useContext, useState, ReactNode } from 'react';

// Search state
interface SearchState {
  query: string;
  results: any[];
  isSearching: boolean;
  recentSearches: string[];
}

// Search context type
interface SearchContextType extends SearchState {
  setQuery: (query: string) => void;
  setResults: (results: any[]) => void;
  setIsSearching: (isSearching: boolean) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  clearResults: () => void;
}

// Initial state
const initialState: SearchState = {
  query: '',
  results: [],
  isSearching: false,
  recentSearches: [],
};

// Create context
const SearchContext = createContext<SearchContextType | undefined>(undefined);

// Search provider component
interface SearchProviderProps {
  children: ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [query, setQuery] = useState(initialState.query);
  const [results, setResults] = useState(initialState.results);
  const [isSearching, setIsSearching] = useState(initialState.isSearching);
  const [recentSearches, setRecentSearches] = useState(initialState.recentSearches);

  const addRecentSearch = (searchQuery: string) => {
    if (searchQuery.trim() && !recentSearches.includes(searchQuery)) {
      setRecentSearches(prev => [searchQuery, ...prev.slice(0, 9)]); // Keep last 10 searches
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  const clearResults = () => {
    setResults([]);
    setQuery('');
  };

  const value: SearchContextType = {
    query,
    results,
    isSearching,
    recentSearches,
    setQuery,
    setResults,
    setIsSearching,
    addRecentSearch,
    clearRecentSearches,
    clearResults,
  };

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
};

// Custom hook to use search context
export const useSearch = (): SearchContextType => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
