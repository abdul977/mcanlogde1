import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./context/UserContext.jsx";
import { SearchProvider } from "./context/Serach.jsx";
import { CartProvider } from "./context/Cart.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <SearchProvider>
          <BrowserRouter>
            <App />
            <ToastContainer />
          </BrowserRouter>
        </SearchProvider>
      </CartProvider>
    </AuthProvider>
  </StrictMode>
);
