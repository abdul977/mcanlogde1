import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import StagewiseToolbar from "./components/StagewiseToolbar";
import { ToastContainer } from "react-toastify";
import { Route, Routes, useLocation } from "react-router-dom";
import React from "react";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import Programs from "./pages/Programs";
import Services from "./pages/Services";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Lectures from "./pages/Lectures";
import Quran from "./pages/Quran";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import Blog from "./pages/Blog";
import BlogDetails from "./pages/BlogDetails";
import Support from "./pages/Support";
import LodgeSponsorship from "./pages/LodgeSponsorship";
import Resources from "./pages/Resources";
import Community from "./pages/Community";
import Communities from "./pages/Communities";
import CreateCommunity from "./pages/CreateCommunity";
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
import CreateBlog from "./pages/Admin/CreateBlog";
import AllBlogs from "./pages/Admin/AllBlogs";
import EditBlog from "./pages/Admin/EditBlog";
import CreateService from "./pages/Admin/CreateService";
import AllServices from "./pages/Admin/AllServices";
import CreateLecture from "./pages/Admin/CreateLecture";
import AllLectures from "./pages/Admin/AllLectures";
import EditLecture from "./pages/Admin/EditLecture";
import CreateQuranClass from "./pages/Admin/CreateQuranClass";
import AllQuranClasses from "./pages/Admin/AllQuranClasses";
import EditQuranClass from "./pages/Admin/EditQuranClass";
import CreateResource from "./pages/Admin/CreateResource";
import AllResources from "./pages/Admin/AllResources";
import EditResource from "./pages/Admin/EditResource";
import AdminCreateCommunity from "./pages/Admin/CreateCommunity";
import AllCommunity from "./pages/Admin/AllCommunity";
import EditCommunity from "./pages/Admin/EditCommunity";
import AllChatCommunities from "./pages/Admin/AllChatCommunities";
import CreateDonation from "./pages/Admin/CreateDonation";
import AllDonations from "./pages/Admin/AllDonations";
import EditDonation from "./pages/Admin/EditDonation";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AllBookings from "./pages/Admin/AllBookings";
import CreateProduct from "./pages/Admin/CreateProduct";
import EditProduct from "./pages/Admin/EditProduct";
import AllProducts from "./pages/Admin/AllProducts";
import CreateProductCategory from "./pages/Admin/CreateProductCategory";
import EditProductCategory from "./pages/Admin/EditProductCategory";
import AllProductCategories from "./pages/Admin/AllProductCategories";
import AllOrders from "./pages/Admin/AllOrders";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import CartPage from "./pages/CartPage";
import ThankYou from "./components/ThankYou";
import SelectedCategory from "./pages/SelectedCategory";
import ContributePost from "./pages/User/ContributePost";
import MyBookings from "./pages/User/MyBookings";
import UserMessages from "./pages/User/UserMessages";
import PaymentDashboard from "./pages/User/PaymentDashboard";
import PaymentSettings from "./pages/Admin/PaymentSettings";
import PaymentVerification from "./pages/Admin/PaymentVerification";
import PaymentOverview from "./pages/Admin/PaymentOverview";
import AdminMessages from "./pages/Admin/AdminMessages";
import { SocketProvider } from "./context/SocketContext";
import PrayerTimesBanner from "./components/PrayerTimesBanner";
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const location = useLocation();

  // Check if current route is a messaging interface
  const isMessagingRoute = location.pathname.includes('/messages');

  return (
    <SocketProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Stagewise Toolbar - Development Only */}
        <StagewiseToolbar />

        {/* Main Navigation */}
        <Navbar />

      {/* Prayer Times Banner - Shows local prayer times */}
      <PrayerTimesBanner />

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
          <Route path="/events/:slug" element={<EventDetails />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogDetails />} />
          <Route path="/donate" element={<Support />} />
          <Route path="/lodge-sponsorship" element={<LodgeSponsorship />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/community" element={<Community />} />
          <Route path="/communities" element={<Communities />} />
          <Route path="/create-community" element={<CreateCommunity />} />
          <Route path="/product/:slug" element={<ProductDetails />} />
          <Route path="/accommodation/:slug" element={<ProductDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/saved-accommodations" element={<CartPage />} />
          <Route path="/category/:slug" element={<SelectedCategory />} />
          {/* Shop routes */}
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/product/:slug" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmation />} />

          {/* User Routes */}
          <Route path="/user" element={<UserRoutes />}>
            <Route path="" element={<UserDashboard />} />
            <Route path="bookings" element={<MyBookings />} />
            <Route path="payments" element={<PaymentDashboard />} />
            <Route path="messages" element={<UserMessages />} />
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
            <Route path="details" element={<AdminDashboard />} />
            <Route path="edit/:slug" element={<UpdatePost />} />
            <Route path="create-blog" element={<CreateBlog />} />
            <Route path="blogs" element={<AllBlogs />} />
            <Route path="edit-blog/:id" element={<EditBlog />} />
            <Route path="create-service" element={<CreateService />} />
            <Route path="services" element={<AllServices />} />
            <Route path="create-lecture" element={<CreateLecture />} />
            <Route path="lectures" element={<AllLectures />} />
            <Route path="edit-lecture/:id" element={<EditLecture />} />
            <Route path="create-quran-class" element={<CreateQuranClass />} />
            <Route path="quran-classes" element={<AllQuranClasses />} />
            <Route path="edit-quran-class/:id" element={<EditQuranClass />} />
            <Route path="create-resource" element={<CreateResource />} />
            <Route path="resources" element={<AllResources />} />
            <Route path="edit-resource/:id" element={<EditResource />} />
            <Route path="create-community" element={<AdminCreateCommunity />} />
            <Route path="community" element={<AllCommunity />} />
            <Route path="edit-community/:id" element={<EditCommunity />} />
            <Route path="chat-communities" element={<AllChatCommunities />} />
            <Route path="create-donation" element={<CreateDonation />} />
            <Route path="donations" element={<AllDonations />} />
            <Route path="edit-donation/:id" element={<EditDonation />} />
            <Route path="bookings" element={<AllBookings />} />
            <Route path="messages" element={<AdminMessages />} />
            {/* E-commerce routes */}
            <Route path="create-product" element={<CreateProduct />} />
            <Route path="edit-product/:id" element={<EditProduct />} />
            <Route path="products" element={<AllProducts />} />
            <Route path="create-product-category" element={<CreateProductCategory />} />
            <Route path="edit-product-category/:id" element={<EditProductCategory />} />
            <Route path="product-categories" element={<AllProductCategories />} />
            <Route path="orders" element={<AllOrders />} />
            <Route path="payment-settings" element={<PaymentSettings />} />
            <Route path="payment-verification" element={<PaymentVerification />} />
            <Route path="payment-overview" element={<PaymentOverview />} />
          </Route>
        </Routes>
      </main>

      {/* Footer - Hidden in messaging interfaces */}
      {!isMessagingRoute && <Footer />}

      {/* Islamic Quote of the Day - Fixed at bottom, hidden in messaging interfaces */}
      {!isMessagingRoute && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 text-center text-sm text-gray-600 shadow-lg">
          <div className="container mx-auto px-4">
            <span className="italic">
              "The best among you are those who bring greatest benefits to many others" - Prophet Muhammad ﷺ
            </span>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      </div>
    </SocketProvider>
  );
}

export default App;
