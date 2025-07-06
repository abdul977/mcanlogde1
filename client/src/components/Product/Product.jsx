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
  FaUser,
  FaArrowLeft,
  FaHeart,
  FaShare,
  FaSync
} from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";
import axios from "axios";
import RelatedProduct from "./RelatedProduct";
import Spinner from "../Spinner";
import { useCart } from "../../context/Cart";
import { toast } from "react-toastify";
import { useAuth } from "../../context/UserContext";
import BookingConfirmation from "../BookingConfirmation";
import MobileLayout, { MobilePageHeader, MobileButton } from "../Mobile/MobileLayout";
import { FormSection, FormField } from "../Mobile/ResponsiveForm";

const Product = () => {
  const params = useParams();
  const [postDetails, setPostDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [cart, setCart] = useCart();
  const navigate = useNavigate();
  const [auth] = useAuth();
  const [selectedImage, setSelectedImage] = useState(null);
  const [error, setError] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const handleCheckIn = () => {
    if (!auth?.token) {
      toast.error("Authentication required to proceed!");
      return navigate("/login");
    }
    setShowBookingModal(true);
  };

  const handleBookingSuccess = (booking) => {
    toast.success("Booking request submitted successfully!");
    // Optionally navigate to user dashboard or booking details
    navigate("/user");
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
      <MobileLayout
        title="Loading..."
        subtitle="Accommodation details"
        icon={FaHome}
      >
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mcan-primary"></div>
        </div>
      </MobileLayout>
    );
  }

  if (error || !postDetails) {
    return (
      <MobileLayout
        title="Not Found"
        subtitle="Accommodation details"
        icon={FaHome}
      >
        <div className="text-center py-16">
          <h2 className="text-2xl text-gray-600">{error || "Accommodation not found"}</h2>
          <Link to="/" className="text-mcan-primary hover:underline mt-4 inline-block">
            Return to Homepage
          </Link>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout
      title={postDetails.title}
      subtitle="Accommodation details"
      icon={FaHome}
      headerActions={
        <div className="flex items-center space-x-2">
          <MobileButton
            onClick={() => navigate(-1)}
            variant="ghost"
            size="sm"
            icon={FaArrowLeft}
            title="Go back"
          />
          <MobileButton
            onClick={() => {/* Add to favorites */}}
            variant="ghost"
            size="sm"
            icon={FaHeart}
            title="Add to favorites"
          />
          <MobileButton
            onClick={() => {/* Share */}}
            variant="ghost"
            size="sm"
            icon={FaShare}
            title="Share"
          />
        </div>
      }
    >
      <div className="p-4 lg:p-8">
        {/* Breadcrumb for Desktop */}
        <div className="hidden lg:flex items-center space-x-2 text-gray-600 mb-6">
          <Link to="/" className="hover:text-mcan-primary flex items-center">
            <FaHome className="mr-1" />
          Home
          </Link>
          <span>/</span>
          <span className="text-mcan-primary">{postDetails.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Images and Description */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images Section */}
            <FormSection title="Photos" icon={FaHome} columns={1}>
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={selectedImage}
                    alt="Main Image"
                    className="w-full h-[250px] lg:h-[400px] object-cover rounded-lg shadow-md"
                  />
                  <div className={`absolute top-4 right-4 px-3 py-1 lg:px-4 lg:py-2 rounded-full text-xs lg:text-sm font-medium text-white ${
                    postDetails.adminStatus === 'coming_soon' ? 'bg-blue-500' :
                    postDetails.adminStatus === 'maintenance' ? 'bg-yellow-500' :
                    postDetails.adminStatus === 'not_available' ? 'bg-red-500' :
                    postDetails.isAvailable ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {postDetails.adminStatus === 'coming_soon' ? 'Coming Soon' :
                     postDetails.adminStatus === 'maintenance' ? 'Maintenance' :
                     postDetails.adminStatus === 'not_available' ? 'Not Available' :
                     postDetails.isAvailable ? 'Available' : 'Booked'}
                  </div>
                </div>
                <div className="grid grid-cols-3 lg:grid-cols-4 gap-2">
                  {postDetails.images?.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className={`h-16 lg:h-20 w-full object-cover rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedImage === img ? 'ring-2 ring-mcan-primary' : 'opacity-70 hover:opacity-100'
                      }`}
                      onClick={() => setSelectedImage(img)}
                    />
                  ))}
                </div>
              </div>
            </FormSection>

            {/* Description */}
            <FormSection title="Overview" icon={FaBook} columns={1}>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 leading-relaxed">{postDetails.description}</p>
              </div>
            </FormSection>

            {/* House Rules */}
            <FormSection title="House Rules" icon={FaList} columns={1}>
              <ul className="space-y-3">
                {postDetails.rules?.map((rule, idx) => (
                  <li key={idx} className="flex items-start space-x-3 text-gray-600">
                    <FaList className="mt-1 flex-shrink-0 text-mcan-primary" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </FormSection>

            {/* Facilities */}
            <FormSection title="Facilities" icon={FaWifi} columns={1}>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {postDetails.facilities?.map((facility, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-gray-600 p-2 bg-gray-50 rounded-lg">
                    <FaWifi className="text-mcan-primary flex-shrink-0" />
                    <span className="text-sm">{facility}</span>
                  </div>
                ))}
              </div>
            </FormSection>
          </div>

          {/* Right Column - Details and Contact */}
          <div className="space-y-6">
            {/* Main Details Card */}
            <FormSection title="Details" icon={FaHome} columns={1}>
              <div className="space-y-4">
                <div className="text-center lg:text-left">
                  <h1 className="text-xl lg:text-2xl font-bold text-gray-800 mb-2">{postDetails.title}</h1>
                  <p className="flex items-center justify-center lg:justify-start text-gray-600 mb-4">
                    <FaBuilding className="mr-2 text-mcan-primary" />
                    {postDetails.accommodationType}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600 flex items-center">
                      <FaRegMoneyBillAlt className="mr-2 text-mcan-primary" />
                      Price per month
                    </span>
                    <span className="text-lg lg:text-2xl font-bold text-mcan-primary">₦{postDetails.price.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600 flex items-center">
                      <MdLocationOn className="mr-2 text-mcan-primary" />
                      Location
                    </span>
                    <span className="text-right">{postDetails.location}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600 flex items-center">
                      <FaUsers className="mr-2 text-mcan-primary" />
                      Gender
                    </span>
                    <span>{postDetails.genderRestriction}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600 flex items-center">
                      <FaBed className="mr-2 text-mcan-primary" />
                      Capacity
                    </span>
                    <span>{postDetails.guest} person(s)</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600 flex items-center">
                      <FaMosque className="mr-2 text-mcan-primary" />
                      Distance to Mosque
                    </span>
                    <span>{postDetails.mosqueProximity}m</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600 flex items-center">
                      <FaPrayingHands className="mr-2 text-mcan-primary" />
                      Prayer Facilities
                    </span>
                    <span className={postDetails.prayerFacilities ? 'text-green-600' : 'text-red-600'}>
                      {postDetails.prayerFacilities ? 'Available' : 'Not Available'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 mt-6">
                  <MobileButton
                    onClick={handleCheckIn}
                    disabled={!postDetails.isAvailable}
                    variant="primary"
                    size="lg"
                    fullWidth
                    className={!postDetails.isAvailable ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    {postDetails.isAvailable ? 'Book Now' : 'Not Available'}
                  </MobileButton>

                  <MobileButton
                    onClick={handleAddToCart}
                    disabled={!postDetails.isAvailable}
                    variant="secondary"
                    size="lg"
                    fullWidth
                    icon={FaHeart}
                    className={!postDetails.isAvailable ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    Add to Wishlist
                  </MobileButton>
                </div>
              </div>
            </FormSection>

            {/* Landlord Contact */}
            <FormSection title="Contact Information" icon={FaPhone} columns={1}>
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
            </FormSection>

            {/* Nearby Facilities */}
            <FormSection title="Nearby Facilities" icon={FaMosque} columns={1}>
              {/* Mosques */}
              {postDetails.nearbyFacilities?.mosques?.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                    <FaMosque className="mr-2 text-mcan-primary" />
                    Mosques
                  </h3>
                  <div className="space-y-2">
                    {postDetails.nearbyFacilities.mosques.map((mosque, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-gray-700">{mosque.name}</span>
                        <span className="text-mcan-primary font-medium">{mosque.distance}m</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Islamic Centers */}
              {postDetails.nearbyFacilities?.islamicCenters?.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                    <FaBook className="mr-2 text-mcan-primary" />
                    Islamic Centers
                  </h3>
                  <div className="space-y-2">
                    {postDetails.nearbyFacilities.islamicCenters.map((center, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-gray-700">{center.name}</span>
                        <span className="text-mcan-primary font-medium">{center.distance}m</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Halal Restaurants */}
              {postDetails.nearbyFacilities?.halalRestaurants?.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                    <FaUtensils className="mr-2 text-mcan-primary" />
                    Halal Restaurants
                  </h3>
                  <div className="space-y-2">
                    {postDetails.nearbyFacilities.halalRestaurants.map((restaurant, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-gray-700">{restaurant.name}</span>
                        <span className="text-mcan-primary font-medium">{restaurant.distance}m</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </FormSection>
          </div>
        </div>

        {/* Related Products Section */}
        <FormSection title="Related Accommodations" icon={FaHome} columns={1} className="mt-8">
          {loadingRelated ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-mcan-primary"></div>
            </div>
          ) : relatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedProducts.map((product) => (
                <RelatedProduct key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                No other {postDetails.genderRestriction}'s accommodations available in this category
              </p>
              <MobileButton
                onClick={() => getRelatedPost(postDetails.category, postDetails.genderRestriction)}
                variant="primary"
                icon={FaSync}
              >
                Retry Loading
              </MobileButton>
            </div>
          )}
        </FormSection>

        {/* Booking Confirmation Modal */}
        <BookingConfirmation
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          accommodation={postDetails}
          bookingType="accommodation"
          onBookingSuccess={handleBookingSuccess}
        />
      </div>
    </MobileLayout>
  );
};

export default Product;
