import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./context/UserContext.jsx";
import { SearchProvider } from "./context/Serach.jsx";
import { CartProvider } from "./context/Cart.jsx";
import { MobileProvider } from "./hooks/useMobileResponsive.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <SearchProvider>
          <MobileProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </MobileProvider>
        </SearchProvider>
      </CartProvider>
    </AuthProvider>
  </StrictMode>
);
