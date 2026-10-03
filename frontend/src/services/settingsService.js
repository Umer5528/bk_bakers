import api from "./api";

export const settingsService = {
  get: async () => {
    const { data } = await api.get("/settings");
    return data;
  },
};

export default settingsService;
