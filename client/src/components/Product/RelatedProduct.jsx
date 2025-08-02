import React from "react";
import {
  FaBed,
  FaUser,
  FaMapMarkerAlt,
  FaMosque,
  FaUsers,
  FaPrayingHands
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import BookingStatsDisplay from "../BookingStatsDisplay";

const RelatedProduct = ({ product }) => {
  const navigate = useNavigate();

  if (!product) {
    return null;
  }

  console.log('Rendering related product:', {
    id: product._id,
    title: product.title,
    categoryId: product.category?._id || product.category
  });

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105">
      <div className="relative">
        <img
          src={product.images[0]}
          alt={`Image of ${product.title}`}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 right-4">
          {/* Admin status takes priority */}
          {product.adminStatus === 'coming_soon' ? (
            <div className="px-3 py-1 rounded-full text-xs font-medium text-white bg-blue-500">
              Coming Soon
            </div>
          ) : product.adminStatus === 'maintenance' ? (
            <div className="px-3 py-1 rounded-full text-xs font-medium text-white bg-yellow-500">
              Maintenance
            </div>
          ) : product.adminStatus === 'not_available' ? (
            <div className="px-3 py-1 rounded-full text-xs font-medium text-white bg-red-500">
              Not Available
            </div>
          ) : (
            /* Show booking statistics for active accommodations */
            <BookingStatsDisplay
              accommodation={product}
              showDetails={false}
              size="sm"
              className="bg-white/90 backdrop-blur-sm rounded-full shadow-sm"
            />
          )}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{product.title}</h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600 text-sm">
            <FaMapMarkerAlt className="mr-2 text-mcan-primary" />
            {product.location}
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <FaUsers className="mr-2 text-mcan-primary" />
            {product.genderRestriction}
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <FaBed className="mr-2 text-mcan-primary" />
            {product.guest} person(s)
          </div>
          {product.mosqueProximity && (
            <div className="flex items-center text-gray-600 text-sm">
              <FaMosque className="mr-2 text-mcan-primary" />
              {product.mosqueProximity}m to mosque
            </div>
          )}
          <div className="flex items-center text-gray-600 text-sm">
            <FaPrayingHands className="mr-2 text-mcan-primary" />
            {product.prayerFacilities ? 'Prayer facilities available' : 'No prayer facilities'}
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <span className="text-lg font-bold text-mcan-primary">
            ₦{product.price.toLocaleString()}/month
          </span>
          <button
            onClick={() => navigate(`/accommodation/${product.slug}`)}
            className="bg-mcan-primary text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default RelatedProduct;
