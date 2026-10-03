import api from "./api";

export const authService = {
  register: async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    return data;
  },
  login: async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    return data;
  },
  logout: async () => {
    const { data } = await api.post("/auth/logout");
    return data;
  },
  getMe: async () => {
    const { data } = await api.get("/auth/me");
    return data;
  },
  updateProfile: async (payload) => {
    const { data } = await api.put("/auth/me", payload);
    return data;
  },
  changePassword: async (payload) => {
    const { data } = await api.put("/auth/change-password", payload);
    return data;
  },
  forgotPassword: async (email) => {
    const { data } = await api.post("/auth/forgot-password", { email });
    return data;
  },
  resetPassword: async (token, password) => {
    const { data } = await api.put(`/auth/reset-password/${token}`, {
      password,
    });
    return data;
  },
};

export default authService;
