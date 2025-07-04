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
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { BookingProvider } from "./context/Booking.jsx";

// Load your Stripe public key from environment variables
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BookingProvider>
        <Elements stripe={stripePromise}>
          <CartProvider>
            <SearchProvider>
              <BrowserRouter>
                <App />
                <ToastContainer />
              </BrowserRouter>
            </SearchProvider>
          </CartProvider>
        </Elements>
      </BookingProvider>
    </AuthProvider>
  </StrictMode>
);
