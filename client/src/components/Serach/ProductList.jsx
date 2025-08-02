import React from "react";
import { Link } from "react-router-dom";
import { FaMapMarkerAlt, FaBed, FaUsers, FaMosque, FaEye } from "react-icons/fa";
import BookingStatsDisplay from "../BookingStatsDisplay";

const ProductList = ({ products }) => {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          {products.length < 1
            ? "No Accommodations Found"
            : `Search Results: ${products.length} accommodation${products.length !== 1 ? 's' : ''} found`}
        </h1>
        <p className="text-gray-600">
          {products.length > 0
            ? "Browse through available halal-friendly accommodations for Muslim corps members"
            : "Try adjusting your filters or search terms to find accommodations"
          }
        </p>
      </div>

      {/* Results Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((post) => (
            <article
              key={post._id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={post.images?.[0] || "https://via.placeholder.com/400x300"}
                  alt={post.title || "Accommodation"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
                  {/* Admin status takes priority */}
                  {post.adminStatus === 'coming_soon' ? (
                    <span className="px-3 py-1 rounded-full text-xs font-medium text-white bg-blue-500">
                      Coming Soon
                    </span>
                  ) : post.adminStatus === 'maintenance' ? (
                    <span className="px-3 py-1 rounded-full text-xs font-medium text-white bg-yellow-500">
                      Maintenance
                    </span>
                  ) : post.adminStatus === 'not_available' ? (
                    <span className="px-3 py-1 rounded-full text-xs font-medium text-white bg-red-500">
                      Not Available
                    </span>
                  ) : (
                    /* Show booking statistics for active accommodations */
                    <BookingStatsDisplay
                      accommodation={post}
                      showDetails={false}
                      size="sm"
                      className="bg-white/90 backdrop-blur-sm rounded-full shadow-sm"
                    />
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {post.title || "Accommodation Title"}
                  </h3>
                  <div className="flex items-center text-gray-600 text-sm mb-2">
                    <FaMapMarkerAlt className="mr-1 text-mcan-primary" />
                    <span>{post.location || post.hotelLocation || "Location not specified"}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                  {post.guest && (
                    <div className="flex items-center">
                      <FaUsers className="mr-1 text-mcan-primary" />
                      <span>{post.guest} guest{post.guest !== '1' ? 's' : ''}</span>
                    </div>
                  )}
                  {post.accommodationType && (
                    <div className="flex items-center">
                      <FaBed className="mr-1 text-mcan-primary" />
                      <span className="capitalize">{post.accommodationType}</span>
                    </div>
                  )}
                  {post.mosqueProximity && (
                    <div className="flex items-center">
                      <FaMosque className="mr-1 text-mcan-primary" />
                      <span>{post.mosqueProximity}</span>
                    </div>
                  )}
                </div>

                {/* Price */}
                {post.price && (
                  <div className="mb-4">
                    <span className="text-2xl font-bold text-mcan-primary">
                      ₦{parseInt(post.price).toLocaleString()}
                    </span>
                    <span className="text-gray-600 text-sm">/month</span>
                  </div>
                )}

                {/* Action Button */}
                <Link
                  to={`/accommodation/${post.slug}`}
                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-mcan-primary to-mcan-secondary text-white rounded-lg hover:opacity-90 transition duration-300 font-medium"
                >
                  <FaEye className="mr-2" />
                  View Details
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <FaBed className="mx-auto h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No accommodations found</h3>
            <p className="text-gray-600 mb-6">
              We couldn't find any accommodations matching your search criteria.
              Try adjusting your filters or search terms.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>• Try different location keywords</p>
              <p>• Adjust your date range</p>
              <p>• Clear some filters to see more results</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
