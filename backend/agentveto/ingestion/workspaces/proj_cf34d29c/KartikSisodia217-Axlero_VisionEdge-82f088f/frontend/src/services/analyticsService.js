import api from "./api";

export const analyticsService = {
  getAnalytics: async () => {
    const response = await api.get("/analytics");
    return response.data;
  },

  getSummary: async () => {
    const response = await api.get("/analytics/summary");
    return response.data;
  },

  getMonthly: async () => {
    const response = await api.get("/analytics/monthly");
    return response.data;
  },

  getWeekly: async () => {
    const response = await api.get("/analytics/weekly");
    return response.data;
  },

  getHeatmap: async () => {
    const response = await api.get("/analytics/heatmap");
    return response.data;
  },

  getTopObjects: async () => {
    const response = await api.get("/analytics/top-objects");
    return response.data;
  },

  getModels: async () => {
    const response = await api.get("/analytics/models");
    return response.data;
  },
};