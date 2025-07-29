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

  // Interactive features - Real API implementations

  // Like/Unlike blog post
  toggleLike: async (blogId: string): Promise<{ liked: boolean; likesCount: number }> => {
    const response = await apiHelpers.post<{ liked: boolean; likesCount: number }>(
      `${ENDPOINTS.BLOG_POSTS}/${blogId}/like`
    );
    return response;
  },

  // Check like status for a blog
  checkLikeStatus: async (blogId: string): Promise<{ liked: boolean; likesCount: number }> => {
    const response = await apiHelpers.get<{ liked: boolean; likesCount: number }>(
      `${ENDPOINTS.BLOG_POSTS}/${blogId}/like/status`
    );
    return response;
  },

  // Bookmark/Unbookmark blog post
  toggleBookmark: async (blogId: string, options?: {
    collection?: string;
    notes?: string;
    tags?: string[];
    priority?: 'low' | 'medium' | 'high';
  }): Promise<{ bookmarked: boolean; bookmark?: any }> => {
    const response = await apiHelpers.post<{ bookmarked: boolean; bookmark?: any }>(
      `${ENDPOINTS.BLOG_POSTS}/${blogId}/bookmark`,
      options || {}
    );
    return response;
  },

  // Check bookmark status for a blog
  checkBookmarkStatus: async (blogId: string): Promise<{ bookmarked: boolean }> => {
    const response = await apiHelpers.get<{ bookmarked: boolean }>(
      `${ENDPOINTS.BLOG_POSTS}/${blogId}/bookmark/status`
    );
    return response;
  },

  // Get user's liked blogs
  getLikedBlogs: async (options?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: number;
  }): Promise<{ likedBlogs: any[]; pagination: any }> => {
    const params = new URLSearchParams();
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const url = `${ENDPOINTS.BLOG_POSTS}/user/liked-blogs${params.toString() ? `?${params.toString()}` : ''}`;
    return apiHelpers.get<{ likedBlogs: any[]; pagination: any }>(url);
  },

  // Get user's bookmarked blogs
  getBookmarkedBlogs: async (options?: {
    page?: number;
    limit?: number;
    collection?: string;
    readingStatus?: string;
    priority?: string;
    tags?: string;
    search?: string;
  }): Promise<{ bookmarks: any[]; pagination: any }> => {
    const params = new URLSearchParams();
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const url = `${ENDPOINTS.BLOG_POSTS}/user/bookmarks${params.toString() ? `?${params.toString()}` : ''}`;
    return apiHelpers.get<{ bookmarks: any[]; pagination: any }>(url);
  },

  // Get bookmark collections
  getBookmarkCollections: async (): Promise<{ collections: any[] }> => {
    return apiHelpers.get<{ collections: any[] }>(
      `${ENDPOINTS.BLOG_POSTS}/user/bookmark-collections`
    );
  },

  // Get bookmark statistics
  getBookmarkStats: async (): Promise<{ stats: any }> => {
    return apiHelpers.get<{ stats: any }>(
      `${ENDPOINTS.BLOG_POSTS}/user/bookmark-stats`
    );
  },

  // Comments functionality

  // Get comments for blog post
  getComments: async (blogId: string, options?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: number;
    includeReplies?: boolean;
  }): Promise<{ comments: any[]; pagination: any }> => {
    const params = new URLSearchParams();
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const url = `${ENDPOINTS.BLOG_POSTS}/${blogId}/comments${params.toString() ? `?${params.toString()}` : ''}`;
    return apiHelpers.get<{ comments: any[]; pagination: any }>(url);
  },

  // Add comment to blog post
  addComment: async (blogId: string, content: string, parentCommentId?: string): Promise<{ comment: any }> => {
    const response = await apiHelpers.post<{ comment: any }>(
      `${ENDPOINTS.BLOG_POSTS}/${blogId}/comments`,
      { content, parentCommentId }
    );
    return response;
  },

  // Update comment
  updateComment: async (commentId: string, content: string): Promise<{ comment: any }> => {
    const response = await apiHelpers.put<{ comment: any }>(
      `${ENDPOINTS.BLOG_POSTS}/comments/${commentId}`,
      { content }
    );
    return response;
  },

  // Delete comment
  deleteComment: async (commentId: string): Promise<{ success: boolean }> => {
    return apiHelpers.delete<{ success: boolean }>(
      `${ENDPOINTS.BLOG_POSTS}/comments/${commentId}`
    );
  },

  // Like/Unlike comment
  toggleCommentLike: async (commentId: string): Promise<{ liked: boolean; likesCount: number }> => {
    const response = await apiHelpers.post<{ liked: boolean; likesCount: number }>(
      `${ENDPOINTS.BLOG_POSTS}/comments/${commentId}/like`
    );
    return response;
  },

  // Report comment
  reportComment: async (commentId: string, reason: string, description?: string): Promise<{ success: boolean }> => {
    const response = await apiHelpers.post<{ success: boolean }>(
      `${ENDPOINTS.BLOG_POSTS}/comments/${commentId}/report`,
      { reason, description }
    );
    return response;
  },

  // Get comment thread
  getCommentThread: async (commentId: string): Promise<{ comment: any; replies: any[] }> => {
    return apiHelpers.get<{ comment: any; replies: any[] }>(
      `${ENDPOINTS.BLOG_POSTS}/comments/${commentId}/thread`
    );
  },

  // Share functionality

  // Record blog share
  recordShare: async (blogId: string, platform: string, options?: {
    shareMethod?: string;
    shareContext?: any;
    shareSuccess?: boolean;
    errorInfo?: any;
  }): Promise<{ shareId: string; shareCount: number }> => {
    const response = await apiHelpers.post<{ shareId: string; shareCount: number }>(
      `${ENDPOINTS.BLOG_POSTS}/${blogId}/share`,
      { platform, ...options }
    );
    return response;
  },

  // Get share count for blog
  getShareCount: async (blogId: string): Promise<{ shareCount: number }> => {
    return apiHelpers.get<{ shareCount: number }>(
      `${ENDPOINTS.BLOG_POSTS}/${blogId}/shares/count`
    );
  },

  // Get user's share history
  getShareHistory: async (options?: {
    page?: number;
    limit?: number;
    platform?: string;
    successOnly?: boolean;
  }): Promise<{ shareHistory: any[]; pagination: any }> => {
    const params = new URLSearchParams();
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const url = `${ENDPOINTS.BLOG_POSTS}/user/share-history${params.toString() ? `?${params.toString()}` : ''}`;
    return apiHelpers.get<{ shareHistory: any[]; pagination: any }>(url);
  },

  // Get multiple blogs interaction status
  getMultipleBlogsInteractionStatus: async (blogIds: string[]): Promise<{
    blogLikeStatus: any[];
    blogShareSummary: any[];
  }> => {
    const [likeStatus, shareSummary] = await Promise.all([
      apiHelpers.post<{ blogLikeStatus: any[] }>(
        `${ENDPOINTS.BLOG_POSTS}/multiple/like-status`,
        { blogIds }
      ),
      apiHelpers.post<{ blogShareSummary: any[] }>(
        `${ENDPOINTS.BLOG_POSTS}/multiple/share-summary`,
        { blogIds }
      )
    ]);

    return {
      blogLikeStatus: likeStatus.blogLikeStatus,
      blogShareSummary: shareSummary.blogShareSummary
    };
  },
};
