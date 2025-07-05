import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { ToastContainer } from "react-toastify";
import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import Programs from "./pages/Programs";
import Services from "./pages/Services";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Lectures from "./pages/Lectures";
import Quran from "./pages/Quran";
import Events from "./pages/Events";
import Support from "./pages/Support";
import LodgeSponsorship from "./pages/LodgeSponsorship";
import Resources from "./pages/Resources";
import Community from "./pages/Community";
import ProductDetails from "./pages/ProductDetails";
import Login from "./pages/Login";
import UserDashboard from "./pages/User/UserDashboard";
import DashBoard from "./pages/Admin/DashBoard";
import CreatePost from "./pages/Admin/CreatePost";
import CreateEvent from "./pages/Admin/CreateEvent";
import AllEvents from "./pages/Admin/AllEvents";
import EditEvent from "./pages/Admin/EditEvent";
import Register from "./pages/Register";
import Details from "./pages/Admin/Details";
import PrivateRoute from "./components/Routes/Admin";
import UserRoutes from "./components/Routes/Private";
import CreateCategory from "./pages/Admin/CreateCategory";
import AllPost from "./pages/Admin/AllPost";
import UpdatePost from "./pages/Admin/UpdatePost";
import CartPage from "./pages/CartPage";
import ThankYou from "./components/ThankYou";
import SelectedCategory from "./pages/SelectedCategory";
import ContributePost from "./pages/User/ContributePost";

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Navigation */}
      <ToastContainer position="bottom-left" />
      <Navbar />

      {/* Prayer Times Banner - Shows local prayer times */}
      <div className="bg-gradient-to-r from-mcan-primary to-mcan-secondary text-white text-sm py-2">
        <div className="container mx-auto px-4 flex justify-center items-center space-x-6">
          <span>Fajr 5:30</span>
          <span>Dhuhr 13:00</span>
          <span>Asr 16:15</span>
          <span>Maghrib 18:45</span>
          <span>Isha 20:00</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/lectures" element={<Lectures />} />
          <Route path="/quran" element={<Quran />} />
          <Route path="/events" element={<Events />} />
          <Route path="/donate" element={<Support />} />
          <Route path="/lodge-sponsorship" element={<LodgeSponsorship />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/community" element={<Community />} />
          <Route path="/product/:slug" element={<ProductDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/saved-accommodations" element={<CartPage />} />
          <Route path="/category/:slug" element={<SelectedCategory />} />

          {/* User Routes */}
          <Route path="/user" element={<UserRoutes />}>
            <Route path="" element={<UserDashboard />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<PrivateRoute />}>
            <Route path="" element={<DashBoard />} />
            <Route path="add-accommodation" element={<CreatePost />} />
            <Route path="create-event" element={<CreateEvent />} />
            <Route path="events" element={<AllEvents />} />
            <Route path="edit-event/:id" element={<EditEvent />} />
            <Route path="add-category" element={<CreateCategory />} />
            <Route path="accommodations" element={<AllPost />} />
            <Route path="details" element={<Details />} />
            <Route path="edit/:slug" element={<UpdatePost />} />
          </Route>
        </Routes>
      </main>

      {/* Footer */}
      <Footer />

      {/* Islamic Quote of the Day - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 text-center text-sm text-gray-600 shadow-lg">
        <div className="container mx-auto px-4">
          <span className="italic">
            "The best among you are those who bring greatest benefits to many others" - Prophet Muhammad ﷺ
          </span>
        </div>
      </div>
    </div>
  );
}

export default App;
