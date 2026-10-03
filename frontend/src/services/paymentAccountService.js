import api from "./api";

export const paymentAccountService = {
  getAll: async () => {
    const { data } = await api.get("/payment-accounts");
    return data;
  },
};

export default paymentAccountService;
