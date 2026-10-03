import api from "./api";

export const productService = {
  getAll: async (params = {}) => {
    const { data } = await api.get("/products", { params });
    return data;
  },
  getBySlug: async (slug) => {
    const { data } = await api.get(`/products/${slug}`);
    return data;
  },
  calculatePrice: async (slug, selections) => {
    const { data } = await api.post(`/products/${slug}/calculate-price`, selections);
    return data;
  },
};

export default productService;
