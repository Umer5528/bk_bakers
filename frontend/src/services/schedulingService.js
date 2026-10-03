import api from "./api";

export const schedulingService = {
  getAvailability: async (productSlug, fulfillmentType) => {
    const { data } = await api.get("/scheduling/availability", {
      params: { product: productSlug, fulfillmentType },
    });
    return data;
  },
};

export default schedulingService;
