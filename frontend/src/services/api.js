import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Create axios instance
const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('admin_refresh_token');
      if (refreshToken) {
        try {
          // Try to refresh the token
          const response = await axios.post(`${BACKEND_URL}/api/admin/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('admin_access_token', access);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, logout user
          localStorage.removeItem('admin_access_token');
          localStorage.removeItem('admin_refresh_token');
          localStorage.removeItem('admin_user');
          window.location.href = '/admin';
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

// ==================== PUBLIC API ====================

/**
 * Get paginated list of flowers with optional filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.page_size - Items per page (default: 12)
 * @param {string} params.category - Filter by category
 * @param {string} params.color - Filter by color
 * @param {number} params.min_price - Minimum price
 * @param {number} params.max_price - Maximum price
 * @param {string} params.search - Search query
 */
export const getFlowersFeatured = async (params = {}) => {
  const response = await api.get('/api/flowers/featured/', { params });
  return response.data;
};

export const getFlowers = async (params = {}) => {
  const response = await api.get('/api/flowers/', { params });
  return response.data;
};


/**
 * Get single flower by ID
 * @param {string} id - Flower UUID
 */
export const getFlower = async (id) => {
  const response = await api.get(`/api/flowers/${id}/`);
  return response.data;
};

// ==================== ADMIN API ====================

/**
 * Admin login
 * @param {string} username - Admin username
 * @param {string} password - Admin password
 */
export const adminLogin = async (username, password) => {
  const response = await api.post('/api/admin/login/', {
    username,
    password,
  });
  return response.data;
};

/**
 * Get all flowers (admin)
 * @param {Object} params - Query parameters
 */
export const getAdminFlowers = async (params = {}) => {
  const response = await api.get('/api/admin/flowers/', { params });
  return response.data;
};

/**
 * Get single flower (admin)
 * @param {string} id - Flower UUID
 */
export const getAdminFlower = async (id) => {
  const response = await api.get(`/api/admin/flowers/${id}/`);
  return response.data;
};

/**
 * Create new flower (admin)
 * @param {Object} flowerData - Flower data
 */
export const createFlower = async (flowerData) => {
  const response = await api.post('/api/admin/flowers/', flowerData);
  return response.data;
};

/**
 * Update flower (admin)
 * @param {string} id - Flower UUID
 * @param {Object} flowerData - Updated flower data
 */
export const updateFlower = async (id, flowerData) => {
  const response = await api.put(`/api/admin/flowers/${id}/`, flowerData);
  return response.data;
};

/**
 * Partially update flower (admin)
 * @param {string} id - Flower UUID
 * @param {Object} flowerData - Partial flower data
 */
export const patchFlower = async (id, flowerData) => {
  const response = await api.patch(`/api/admin/flowers/${id}/`, flowerData);
  return response.data;
};

/**
 * Delete flower (admin)
 * @param {string} id - Flower UUID
 */
export const deleteFlower = async (id) => {
  const response = await api.delete(`/api/admin/flowers/${id}/`);
  return response.data;
};

/**
 * Toggle flower active status (admin)
 * @param {string} id - Flower UUID
 */
export const toggleFlowerActive = async (id) => {
  const response = await api.patch(`/api/admin/flowers/${id}/toggle-active/`);
  return response.data;
};

/**
 * Upload image to Cloudinary (admin)
 * @param {File} imageFile - Image file to upload
 */
export const uploadImage = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await api.post('/api/admin/flowers/upload-image/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export default api;
