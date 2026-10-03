import api from "./api";

export const customOrderService = {
  create: async (formData, onProgress) => {
    const { data } = await api.post("/custom-orders", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: onProgress
        ? (evt) => onProgress(evt.total ? Math.round((evt.loaded / evt.total) * 100) : 0)
        : undefined,
    });
    return data;
  },
  getMine: async () => {
    const { data } = await api.get("/custom-orders/mine");
    return data;
  },
  respond: async (id, accept) => {
    const { data } = await api.put(`/custom-orders/${id}/respond`, { accept });
    return data;
  },
};

export default customOrderService;
