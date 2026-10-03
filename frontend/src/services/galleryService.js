import api from "./api";

export const galleryService = {
  getAll: async () => (await api.get("/gallery")).data,
};

export default galleryService;
