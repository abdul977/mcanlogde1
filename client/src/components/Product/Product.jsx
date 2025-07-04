import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  FaWifi,
  FaBriefcase,
  FaSwimmingPool,
  FaCar,
  FaStar,
  FaMosque,
  FaUsers,
  FaBed,
  FaPrayingHands,
  FaHome,
  FaRegMoneyBillAlt,
  FaPhone,
  FaClock,
  FaBuilding,
  FaList,
  FaUtensils,
  FaBook,
  FaUser
} from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";
import axios from "axios";
import RelatedProduct from "./RelatedProduct";
import Spinner from "../Spinner";
import { useCart } from "../../context/Cart";
import { toast } from "react-toastify";
import { useAuth } from "../../context/UserContext";
import { useBook } from "../../context/Booking";

const Product = () => {
  const params = useParams();
  const [postDetails, setPostDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [cart, setCart] = useCart();
  const navigate = useNavigate();
  const [auth] = useAuth();
  const [booking, setBooking] = useBook();
  const [selectedImage, setSelectedImage] = useState(null);
  const [error, setError] = useState(null);

  const handleCheckIn = () => {
    if (!auth?.token) {
      toast.error("Authentication required to proceed!");
      return navigate("/login");
    }
    navigate("/payment", {
      state: {
        price: postDetails?.price,
        product: postDetails?.title,
        postId: postDetails?._id,
      },
    });
  };

  useEffect(() => {
    if (params?.slug) {
      getPostBySlug();
    }
  }, [params?.slug]);

  const getPostBySlug = async () => {
    try {
      setLoading(true);
      setError(null);
      setRelatedProducts([]); // Reset related products

      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/post/get-post/${params.slug}?_=${timestamp}`
      );
      
      if (res.data?.success && res.data?.post) {
        const product = res.data.post;
        setPostDetails(product);
        if (product.images && product.images.length > 0) {
          setSelectedImage(product.images[0]);
        }
        // Only fetch related posts after we have product details
        if (product.category && product.genderRestriction) {
          await getRelatedPost(product.category, product.genderRestriction);
        }
      } else {
        setError("Failed to load accommodation details");
      }
    } catch (error) {
      console.error("Error fetching post details:", error.message);
      setError("Failed to load accommodation details");
      toast.error("Failed to load accommodation details");
    } finally {
      setLoading(false);
    }
  };

  const getRelatedPost = async (category, gender) => {
    if (!category || !gender) {
      console.error('Missing required parameters:', { category, gender });
      return;
    }

    let isCurrent = true; // To handle race conditions
    setLoadingRelated(true);
    setRelatedProducts([]); // Clear existing related products

    try {
      const categoryId = category._id || category;
      const currentPostId = postDetails?._id;
      
      console.log('Fetching related posts for:', {
        categoryId: categoryId.toString(),
        gender,
        currentPostId
      });
      
      // Add cache control headers and timestamp
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/post/get-all-post?gender=${gender}&_=${Date.now()}`,
        {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        }
      );
      
      // Check if this is still the current request
      if (!isCurrent) {
        console.log('Ignoring stale response');
        return;
      }

      if (res.data?.success && res.data?.posts) {
        // Filter posts by category and exclude current post
        const related = res.data.posts.filter(post => {
          // Convert category IDs to strings for comparison
          const postCatId = (post.category._id || post.category).toString();
          const currentCatId = categoryId.toString();
          const postId = post._id.toString();
          const currentPostId = postDetails._id.toString();

          console.log('Comparing:', {
            postCatId,
            currentCatId,
            isMatch: postCatId === currentCatId
          });
          
          const match = postCatId === currentCatId && 
                       postId !== currentPostId &&
                       post.isAvailable === true &&
                       post.genderRestriction === postDetails.genderRestriction;

          if (match) {
            console.log('Found match:', {
              title: post.title,
              gender: post.genderRestriction,
              category: postCatId
            });
          }
          
          return match;
        }).slice(0, 4); // Limit to 4 related posts

        console.log('Found related posts:', {
          categoryId,
          currentPostId: postDetails._id,
          relatedCount: related.length
        });
        
        setRelatedProducts(related);
      }
    } catch (error) {
      console.error("Error loading related posts:", error);
      toast.error("Failed to load related accommodations");
    } finally {
      setLoadingRelated(false);
    }
  };

  const handleAddToCart = () => {
    if (postDetails?.isAvailable) {
      setCart([...cart, postDetails]);
      localStorage.setItem("cart", JSON.stringify([...cart, postDetails]));
      toast.success("Item Added to wishlist");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mcan-primary"></div>
      </div>
    );
  }

  if (error || !postDetails) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl text-gray-600">{error || "Accommodation not found"}</h2>
        <Link to="/" className="text-mcan-primary hover:underline mt-4 inline-block">
          Return to Homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 min-h-screen max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-gray-600 mb-6">
        <Link to="/" className="hover:text-mcan-primary flex items-center">
          <FaHome className="mr-1" />
          Home
        </Link>
        <span>/</span>
        <span className="text-mcan-primary">{postDetails.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Images and Description */}
        <div className="lg:col-span-2 space-y-8">
          {/* Images Section */}
          <div className="space-y-4">
            <div className="relative">
              <img
                src={selectedImage}
                alt="Main Image"
                className="w-full h-[400px] object-cover rounded-lg shadow-md"
              />
              <div className={`absolute top-4 right-4 px-4 py-2 rounded-full text-sm font-medium text-white ${
                postDetails.isAvailable ? 'bg-green-500' : 'bg-red-500'
              }`}>
                {postDetails.isAvailable ? 'Available' : 'Booked'}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {postDetails.images?.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className={`h-20 w-full object-cover rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedImage === img ? 'ring-2 ring-mcan-primary' : 'opacity-70 hover:opacity-100'
                  }`}
                  onClick={() => setSelectedImage(img)}
                />
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Overview</h2>
            <p className="text-gray-600 leading-relaxed">{postDetails.description}</p>
          </div>

          {/* House Rules */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">House Rules</h2>
            <ul className="space-y-3">
              {postDetails.rules?.map((rule, idx) => (
                <li key={idx} className="flex items-start space-x-3 text-gray-600">
                  <FaList className="mt-1 flex-shrink-0 text-mcan-primary" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Facilities */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Facilities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {postDetails.facilities?.map((facility, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-gray-600">
                  <FaWifi className="text-mcan-primary" />
                  <span>{facility}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Details and Contact */}
        <div className="space-y-8">
          {/* Main Details Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{postDetails.title}</h1>
            <p className="flex items-center text-gray-600 mb-6">
              <FaBuilding className="mr-2 text-mcan-primary" />
              {postDetails.accommodationType}
            </p>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Price per month</span>
                <span className="text-2xl font-bold text-mcan-primary">₦{postDetails.price.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Location</span>
                <span>{postDetails.location}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Gender</span>
                <span>{postDetails.genderRestriction}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Capacity</span>
                <span>{postDetails.guest} person(s)</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Distance to Mosque</span>
                <span>{postDetails.mosqueProximity}m</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Prayer Facilities</span>
                <span>{postDetails.prayerFacilities ? 'Available' : 'Not Available'}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 mt-6">
              <button
                onClick={handleCheckIn}
                disabled={!postDetails.isAvailable}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  postDetails.isAvailable
                    ? 'bg-mcan-primary text-white hover:opacity-90'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Book Now
              </button>
              <button
                onClick={handleAddToCart}
                disabled={!postDetails.isAvailable}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  postDetails.isAvailable
                    ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Add to Wishlist
              </button>
            </div>
          </div>

          {/* Landlord Contact */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Landlord Contact</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-gray-600">
                <FaUser className="text-mcan-primary" />
                <span>{postDetails.landlordContact?.name}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <FaPhone className="text-mcan-primary" />
                <span>{postDetails.landlordContact?.phone}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <FaClock className="text-mcan-primary" />
                <span>Best time to call: {postDetails.landlordContact?.preferredContactTime}</span>
              </div>
            </div>
          </div>

          {/* Nearby Facilities */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Nearby Facilities</h2>
            
            {/* Mosques */}
            {postDetails.nearbyFacilities?.mosques?.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                  <FaMosque className="mr-2 text-mcan-primary" />
                  Mosques
                </h3>
                <ul className="space-y-2 pl-8">
                  {postDetails.nearbyFacilities.mosques.map((mosque, idx) => (
                    <li key={idx} className="text-gray-600 flex justify-between">
                      <span>{mosque.name}</span>
                      <span>{mosque.distance}m</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Islamic Centers */}
            {postDetails.nearbyFacilities?.islamicCenters?.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                  <FaBook className="mr-2 text-mcan-primary" />
                  Islamic Centers
                </h3>
                <ul className="space-y-2 pl-8">
                  {postDetails.nearbyFacilities.islamicCenters.map((center, idx) => (
                    <li key={idx} className="text-gray-600 flex justify-between">
                      <span>{center.name}</span>
                      <span>{center.distance}m</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Halal Restaurants */}
            {postDetails.nearbyFacilities?.halalRestaurants?.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                  <FaUtensils className="mr-2 text-mcan-primary" />
                  Halal Restaurants
                </h3>
                <ul className="space-y-2 pl-8">
                  {postDetails.nearbyFacilities.halalRestaurants.map((restaurant, idx) => (
                    <li key={idx} className="text-gray-600 flex justify-between">
                      <span>{restaurant.name}</span>
                      <span>{restaurant.distance}m</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Related Products */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Related Accommodations</h2>
            {loadingRelated ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-mcan-primary"></div>
              </div>
            ) : relatedProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {relatedProducts.map((product) => (
                  <RelatedProduct key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">
                  No other {postDetails.genderRestriction}'s accommodations available in this category
                </p>
                <button
                  onClick={() => getRelatedPost(postDetails.category, postDetails.genderRestriction)}
                  className="px-4 py-2 bg-mcan-primary text-white rounded-lg hover:opacity-90 flex items-center mx-auto"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Retry Loading
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;
