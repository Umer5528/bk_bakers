import api from "./api";

// Groups every admin-only API call the panel needs. Each function maps
// 1:1 to a backend route already built in Modules 1-4 + the new ones
// added in Module 5.
export const adminService = {
  // Dashboard
  getStats: async () => (await api.get("/dashboard/stats")).data,

  // Orders
  getOrders: async (params = {}) => (await api.get("/orders", { params })).data,
  getOrder: async (orderNumber) => (await api.get(`/orders/${orderNumber}`)).data,
  verifyPayment: async (id, action) =>
    (await api.put(`/orders/${id}/verify-payment`, { action })).data,
  updateOrderStatus: async (id, status, expectedFulfillmentTime) =>
    (await api.put(`/orders/${id}/status`, { status, expectedFulfillmentTime })).data,
  cancelOrder: async (id, reason) => (await api.put(`/orders/${id}/cancel`, { reason })).data,

  // Categories
  getCategories: async () => (await api.get("/categories", { params: { all: true } })).data,
  createCategory: async (formData) =>
    (await api.post("/categories", formData, { headers: { "Content-Type": "multipart/form-data" } })).data,
  updateCategory: async (id, formData) =>
    (await api.put(`/categories/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } })).data,
  deleteCategory: async (id) => (await api.delete(`/categories/${id}`)).data,

  // Products
  getProducts: async (params = {}) => (await api.get("/products", { params: { ...params, limit: 100 } })).data,
  getProduct: async (slug) => (await api.get(`/products/${slug}`)).data,
  createProduct: async (formData) =>
    (await api.post("/products", formData, { headers: { "Content-Type": "multipart/form-data" } })).data,
  updateProduct: async (id, formData) =>
    (await api.put(`/products/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } })).data,
  deleteProduct: async (id) => (await api.delete(`/products/${id}`)).data,
  deleteProductImage: async (productId, imageId) =>
    (await api.delete(`/products/${productId}/images/${imageId}`)).data,

  // Settings
  getSettings: async () => (await api.get("/settings")).data,
  updateSettings: async (payload) => (await api.put("/settings", payload)).data,

  // Time slots
  getTimeSlots: async () => (await api.get("/time-slots")).data,
  createTimeSlot: async (payload) => (await api.post("/time-slots", payload)).data,
  updateTimeSlot: async (id, payload) => (await api.put(`/time-slots/${id}`, payload)).data,
  deleteTimeSlot: async (id) => (await api.delete(`/time-slots/${id}`)).data,

  // Blocked dates
  getBlockedDates: async () => (await api.get("/blocked-dates")).data,
  blockDate: async (payload) => (await api.post("/blocked-dates", payload)).data,
  unblockDate: async (id) => (await api.delete(`/blocked-dates/${id}`)).data,

  // Payment accounts
  getPaymentAccounts: async () => (await api.get("/payment-accounts")).data,
  createPaymentAccount: async (payload) => (await api.post("/payment-accounts", payload)).data,
  updatePaymentAccount: async (id, payload) => (await api.put(`/payment-accounts/${id}`, payload)).data,
  deletePaymentAccount: async (id) => (await api.delete(`/payment-accounts/${id}`)).data,

  // Custom orders
  getCustomOrders: async (params = {}) => (await api.get("/custom-orders", { params })).data,
  quoteCustomOrder: async (id, quotedPrice, adminNotes) =>
    (await api.put(`/custom-orders/${id}/quote`, { quotedPrice, adminNotes })).data,
  rejectCustomOrder: async (id, adminNotes) =>
    (await api.put(`/custom-orders/${id}/reject`, { adminNotes })).data,

  // Customers
  getCustomers: async (params = {}) => (await api.get("/customers", { params })).data,
  getCustomer: async (id) => (await api.get(`/customers/${id}`)).data,

  // Reviews
  getAllReviews: async (params = {}) => (await api.get("/reviews/admin", { params })).data,
  moderateReview: async (id, status) => (await api.put(`/reviews/${id}/moderate`, { status })).data,

  // Gallery
  getGallery: async () => (await api.get("/gallery")).data,
  createGalleryItem: async (formData) =>
    (await api.post("/gallery", formData, { headers: { "Content-Type": "multipart/form-data" } })).data,
  deleteGalleryItem: async (id) => (await api.delete(`/gallery/${id}`)).data,

  // Audit log
  getAuditLogs: async () => (await api.get("/audit-logs")).data,
};

export default adminService;
