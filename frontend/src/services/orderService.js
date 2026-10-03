import api from "./api";

export const orderService = {
  create: async (formData) => {
    const { data } = await api.post("/orders", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
  getMine: async () => {
    const { data } = await api.get("/orders/mine");
    return data;
  },
  getByNumber: async (orderNumber) => {
    const { data } = await api.get(`/orders/${orderNumber}`);
    return data;
  },
  cancel: async (id, reason) => {
    const { data } = await api.put(`/orders/${id}/cancel`, { reason });
    return data;
  },
};

export default orderService;
