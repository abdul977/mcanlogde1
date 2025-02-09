import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaMosque, FaMapMarkerAlt, FaBed, FaUsers, FaPrayingHands } from "react-icons/fa";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

const Accommodations = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 1400 },
      items: 4
    },
    desktop: {
      breakpoint: { max: 1400, min: 1024 },
      items: 3
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1
    }
  };

  const getAllPosts = async () => {
    try {
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
    }
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
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-green-600 mb-4">
            Available MCAN Accommodations ({posts.length})
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Shariah-compliant housing options carefully selected for Muslim corps members
          </p>
        </div>

        {posts.length > 0 ? (
          <Carousel
            responsive={responsive}
            infinite={true}
            autoPlay={true}
            autoPlaySpeed={3000}
            keyBoardControl={true}
            customTransition="transform 500ms ease-in-out"
            transitionDuration={500}
            containerClass="carousel-container"
            removeArrowOnDeviceType={["tablet", "mobile"]}
            dotListClass="custom-dot-list-style"
            itemClass="carousel-item-padding-40-px px-4"
            showDots={true}
            arrows={true}
            className="mb-8"
          >
            {posts.map((post) => (
              <div
                key={post._id}
                className="bg-white rounded-lg shadow-lg overflow-hidden h-full transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className="relative">
                  <img
                    src={post.images?.[0]}
                    alt={post.title}
                    className="w-full h-64 object-cover"
                  />
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium text-white ${
                    post.isAvailable ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {post.isAvailable ? 'Available' : 'Booked'}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-4">{post.title}</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="text-green-600 mr-2" />
                      <span>{post.location}</span>
                    </div>
                    <div className="flex items-center">
                      <FaUsers className="text-green-600 mr-2" />
                      <span>{post.genderRestriction}</span>
                    </div>
                    <div className="flex items-center">
                      <FaBed className="text-green-600 mr-2" />
                      <span>{post.guest} person(s)</span>
                    </div>
                    <div className="flex items-center">
                      <FaMosque className="text-green-600 mr-2" />
                      <span>{post.mosqueProximity}m to mosque</span>
                    </div>
                    <div className="flex items-center">
                      <FaPrayingHands className="text-green-600 mr-2" />
                      <span>{post.prayerFacilities ? 'Prayer facilities available' : 'No prayer facilities'}</span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="text-xl font-bold text-green-600">
                      ₦{post.price.toLocaleString()}/month
                    </div>
                    <div className="flex justify-end">
                      <Link
                        to={`/product/${post.slug}`}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
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

      <style jsx>{`
        .custom-dot-list-style {
          bottom: -10px !important;
        }
        .custom-dot-list-style button {
          border: none;
          background: #e2e8f0;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin: 0 5px;
          transition: all 0.3s ease;
        }
        .custom-dot-list-style .react-multi-carousel-dot--active button {
          background: #16a34a;
          transform: scale(1.2);
        }
        .react-multi-carousel-item {
          display: flex;
          justify-content: center;
        }
        .carousel-item-padding-40-px {
          height: 100%;
          margin: 0 10px;
        }
        .react-multiple-carousel__arrow {
          background: rgba(22, 163, 74, 0.8) !important;
          min-width: 40px !important;
          min-height: 40px !important;
          border-radius: 50% !important;
        }
        .react-multiple-carousel__arrow:hover {
          background: rgba(22, 163, 74, 1) !important;
        }
      `}</style>
    </div>
  );
};

export default Accommodations;
