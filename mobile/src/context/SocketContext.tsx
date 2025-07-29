import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Define the socket context type
interface SocketContextType {
  socket: any | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

// Create the context
const SocketContext = createContext<SocketContextType | undefined>(undefined);

// Provider props
interface SocketProviderProps {
  children: ReactNode;
}

// Socket Provider component
export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<any | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = () => {
    // TODO: Implement actual socket connection
    // For now, just simulate a connection
    console.log('Socket connecting...');
    setIsConnected(true);
  };

  const disconnect = () => {
    // TODO: Implement actual socket disconnection
    console.log('Socket disconnecting...');
    setIsConnected(false);
    setSocket(null);
  };

  useEffect(() => {
    // Auto-connect when provider mounts
    // TODO: Replace with actual socket.io implementation
    connect();

    return () => {
      disconnect();
    };
  }, []);

  const value: SocketContextType = {
    socket,
    isConnected,
    connect,
    disconnect,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use the socket context
export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  
  return context;
};

export default SocketContext;
