import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaMosque, FaMapMarkerAlt, FaBed, FaUsers, FaPrayingHands, FaSync } from "react-icons/fa";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { useMobileResponsive } from "../hooks/useMobileResponsive";
import { MobileButton } from "./Mobile/MobileLayout";
import BookingStatsDisplay from "./BookingStatsDisplay";

const Accommodations = () => {
  const { isMobile, isTablet } = useMobileResponsive();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 1400 },
      items: 4,
      slidesToSlide: 2
    },
    desktop: {
      breakpoint: { max: 1400, min: 1024 },
      items: 3,
      slidesToSlide: 1
    },
    tablet: {
      breakpoint: { max: 1024, min: 768 },
      items: 2,
      slidesToSlide: 1
    },
    mobile: {
      breakpoint: { max: 768, min: 0 },
      items: 1,
      slidesToSlide: 1
    }
  };

  const getAllPosts = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      console.log('Starting to fetch posts from:', import.meta.env.VITE_BASE_URL);
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/post/get-all-post`);
      console.log('Response:', response);

      if (response.data?.success) {
        setPosts(response.data.posts);
        setError(null);
      } else {
        setError('Failed to load data');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    getAllPosts(true);
  };

  useEffect(() => {
    getAllPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        <p className="mb-4">Error: {error}</p>
        <button 
          onClick={getAllPosts}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 ${isMobile ? 'py-8' : 'py-16'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center ${isMobile ? 'mb-8' : 'mb-12'}`}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
            <h2 className={`font-bold text-green-600 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
              Available MCAN Accommodations ({posts.length})
            </h2>
            <MobileButton
              onClick={handleRefresh}
              variant="secondary"
              size="sm"
              icon={FaSync}
              disabled={refreshing}
              className={refreshing ? 'animate-spin' : ''}
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </MobileButton>
          </div>
          <p className={`text-gray-600 max-w-2xl mx-auto ${isMobile ? 'text-sm' : 'text-base'}`}>
            Shariah-compliant housing options carefully selected for Muslim corps members
          </p>
        </div>

        {posts.length > 0 ? (
          <Carousel
            responsive={responsive}
            infinite={posts.length > 3}
            autoPlay={!isMobile && posts.length > 3}
            autoPlaySpeed={4000}
            keyBoardControl={true}
            customTransition="transform 300ms ease-in-out"
            transitionDuration={300}
            containerClass="carousel-container"
            removeArrowOnDeviceType={isMobile ? ["mobile"] : []}
            dotListClass="custom-dot-list-style"
            itemClass={`carousel-item-padding ${isMobile ? 'px-2' : 'px-4'}`}
            showDots={!isMobile}
            arrows={!isMobile}
            swipeable={true}
            draggable={true}
            className={isMobile ? 'mb-6' : 'mb-8'}
          >
            {posts.map((post) => (
              <div
                key={post._id}
                className={`bg-white rounded-lg shadow-lg overflow-hidden h-full transition-all duration-300 ${
                  isMobile ? 'hover:shadow-xl' : 'hover:scale-105 hover:shadow-xl'
                }`}
              >
                <div className="relative">
                  <img
                    src={post.images?.[0]}
                    alt={post.title}
                    className={`w-full object-cover ${isMobile ? 'h-48' : 'h-64'}`}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x200?text=Accommodation';
                    }}
                  />
                  <div className="absolute top-3 right-3">
                    {/* Admin status takes priority */}
                    {post.adminStatus === 'coming_soon' ? (
                      <div className="px-2 py-1 rounded-full text-xs font-medium text-white bg-blue-500">
                        Coming Soon
                      </div>
                    ) : post.adminStatus === 'maintenance' ? (
                      <div className="px-2 py-1 rounded-full text-xs font-medium text-white bg-yellow-500">
                        Maintenance
                      </div>
                    ) : post.adminStatus === 'not_available' ? (
                      <div className="px-2 py-1 rounded-full text-xs font-medium text-white bg-red-500">
                        Not Available
                      </div>
                    ) : (
                      /* Show booking statistics for active accommodations */
                      <BookingStatsDisplay
                        accommodation={post}
                        showDetails={false}
                        size={isMobile ? 'sm' : 'md'}
                        className="bg-white/90 backdrop-blur-sm rounded-full shadow-sm"
                      />
                    )}
                  </div>
                </div>

                <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
                  <h3 className={`font-semibold mb-3 line-clamp-2 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                    {post.title}
                  </h3>

                  <div className={`space-y-2 ${isMobile ? 'text-sm' : 'text-base'}`}>
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="text-green-600 mr-2 flex-shrink-0" />
                      <span className="truncate">{post.location}</span>
                    </div>
                    <div className="flex items-center">
                      <FaUsers className="text-green-600 mr-2 flex-shrink-0" />
                      <span className="truncate">{post.genderRestriction}</span>
                    </div>
                    <div className="flex items-center">
                      <FaBed className="text-green-600 mr-2 flex-shrink-0" />
                      <span>{post.guest} person(s)</span>
                    </div>
                    <div className="flex items-center">
                      <FaMosque className="text-green-600 mr-2 flex-shrink-0" />
                      <span>{post.mosqueProximity}m to mosque</span>
                    </div>
                    {!isMobile && (
                      <div className="flex items-center">
                        <FaPrayingHands className="text-green-600 mr-2 flex-shrink-0" />
                        <span className="text-xs">{post.prayerFacilities ? 'Prayer facilities available' : 'No prayer facilities'}</span>
                      </div>
                    )}
                  </div>

                  <div className={`space-y-3 ${isMobile ? 'mt-4' : 'mt-6'}`}>
                    <div className={`font-bold text-green-600 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                      ₦{post.price.toLocaleString()}/month
                    </div>
                    <div className={`flex ${isMobile ? 'justify-center' : 'justify-end'}`}>
                      <Link
                        to={`/accommodation/${post.slug}`}
                        className={`bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors ${
                          isMobile
                            ? 'px-6 py-3 text-sm font-medium w-full text-center'
                            : 'px-4 py-2 text-sm'
                        }`}
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
        ) : (
          <div className="text-center text-gray-600">No accommodations available at the moment</div>
        )}
      </div>

      <style>{`
        .custom-dot-list-style {
          bottom: -15px !important;
        }
        .custom-dot-list-style button {
          border: none;
          background: #e2e8f0;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          margin: 0 6px;
          transition: all 0.3s ease;
        }
        .custom-dot-list-style .react-multi-carousel-dot--active button {
          background: #16a34a;
          transform: scale(1.3);
        }
        .react-multi-carousel-item {
          display: flex;
          justify-content: center;
        }
        .carousel-item-padding {
          height: 100%;
          margin: 0 8px;
        }
        .react-multiple-carousel__arrow {
          background: rgba(22, 163, 74, 0.9) !important;
          min-width: 44px !important;
          min-height: 44px !important;
          border-radius: 50% !important;
          z-index: 10 !important;
        }
        .react-multiple-carousel__arrow:hover {
          background: rgba(22, 163, 74, 1) !important;
          transform: scale(1.1);
        }
        .react-multiple-carousel__arrow--left {
          left: 10px !important;
        }
        .react-multiple-carousel__arrow--right {
          right: 10px !important;
        }
        @media (max-width: 768px) {
          .carousel-item-padding {
            margin: 0 4px;
          }
        }
      `}</style>
    </div>
  );
};

export default Accommodations;
