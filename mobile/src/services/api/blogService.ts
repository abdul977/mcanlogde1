import { apiHelpers } from './apiClient';
import { ENDPOINTS } from '../../constants';
import { BlogPost, PaginatedResponse } from '../../types';

export interface BlogFilters {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  search?: string;
}

export const blogService = {
  // Get all published blogs
  getBlogs: async (
    filters?: BlogFilters
  ): Promise<PaginatedResponse<BlogPost>> => {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const url = `${ENDPOINTS.BLOG_POSTS}${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiHelpers.get<{ blogs: BlogPost[]; pagination: any }>(url);

    return {
      success: true,
      message: "Blogs fetched successfully",
      data: response.blogs,
      pagination: {
        page: response.pagination?.currentPage || 1,
        limit: filters?.limit || 10,
        total: response.pagination?.totalBlogs || 0,
        pages: response.pagination?.totalPages || 1,
      }
    };
  },

  // Get featured blogs
  getFeaturedBlogs: async (limit: number = 5): Promise<BlogPost[]> => {
    const url = `${ENDPOINTS.FEATURED_BLOGS}?limit=${limit}`;
    const response = await apiHelpers.get<{ blogs: BlogPost[] }>(url);
    return response.blogs || [];
  },

  // Get single blog by slug
  getBlog: async (slug: string): Promise<BlogPost> => {
    const response = await apiHelpers.get<{ blog: BlogPost }>(`${ENDPOINTS.BLOG_POST_DETAILS}/${slug}`);
    return response.blog;
  },

  // Search blogs
  searchBlogs: async (
    query: string,
    filters?: Omit<BlogFilters, 'search'>
  ): Promise<PaginatedResponse<BlogPost>> => {
    return blogService.getBlogs({
      ...filters,
      search: query,
    });
  },

  // Get blogs by category
  getBlogsByCategory: async (
    category: string,
    filters?: Omit<BlogFilters, 'category'>
  ): Promise<PaginatedResponse<BlogPost>> => {
    return blogService.getBlogs({
      ...filters,
      category,
    });
  },

  // Get blogs by tag
  getBlogsByTag: async (
    tag: string,
    filters?: Omit<BlogFilters, 'tag'>
  ): Promise<PaginatedResponse<BlogPost>> => {
    return blogService.getBlogs({
      ...filters,
      tag,
    });
  },

  // Interactive features (placeholder implementations)
  // These would need corresponding backend endpoints

  // Like/Unlike blog post
  toggleLike: async (blogId: string): Promise<{ liked: boolean; likesCount: number }> => {
    // TODO: Implement actual API call
    console.log('Toggle like for blog:', blogId);
    return { liked: true, likesCount: 42 };
  },

  // Bookmark/Unbookmark blog post
  toggleBookmark: async (blogId: string): Promise<{ bookmarked: boolean }> => {
    // TODO: Implement actual API call
    console.log('Toggle bookmark for blog:', blogId);
    return { bookmarked: true };
  },

  // Get user's liked blogs
  getLikedBlogs: async (): Promise<BlogPost[]> => {
    // TODO: Implement actual API call
    console.log('Get liked blogs');
    return [];
  },

  // Get user's bookmarked blogs
  getBookmarkedBlogs: async (): Promise<BlogPost[]> => {
    // TODO: Implement actual API call
    console.log('Get bookmarked blogs');
    return [];
  },

  // Add comment to blog post
  addComment: async (blogId: string, comment: string): Promise<any> => {
    // TODO: Implement actual API call
    console.log('Add comment to blog:', blogId, comment);
    return { success: true };
  },

  // Get comments for blog post
  getComments: async (blogId: string): Promise<any[]> => {
    // TODO: Implement actual API call
    console.log('Get comments for blog:', blogId);
    return [];
  },
};
