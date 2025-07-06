import { useEffect } from "react";
import { initToolbar } from '@stagewise/toolbar';

// Stagewise Toolbar Setup for Development
const StagewiseToolbar = () => {
  useEffect(() => {
    // Only initialize in development mode
    if (import.meta.env.DEV) {
      try {
        // Define toolbar configuration
        const stagewiseConfig = {
          plugins: [],
        };

        // Initialize the toolbar
        initToolbar(stagewiseConfig);

        console.log("Stagewise toolbar initialized successfully");
      } catch (error) {
        console.warn("Failed to initialize Stagewise toolbar:", error);
      }
    }
  }, []);

  // This component doesn't render anything visible
  // The toolbar is injected by Stagewise itself
  return null;
};

export default StagewiseToolbar;
