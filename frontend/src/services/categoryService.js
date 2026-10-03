import api from "./api";

export const categoryService = {
  getAll: async (params = {}) => {
    const { data } = await api.get("/categories", { params });
    return data;
  },
  getBySlug: async (slug) => {
    const { data } = await api.get(`/categories/${slug}`);
    return data;
  },
};

export default categoryService;
