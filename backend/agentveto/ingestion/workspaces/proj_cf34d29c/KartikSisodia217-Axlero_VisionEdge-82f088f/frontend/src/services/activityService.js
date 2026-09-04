import api from "./api";

const activityService = {
  getActivityLogs: async () => {
    const response = await api.get("/activity-logs/");

    console.log("ACTIVITY LOGS API RESPONSE:", response.data);

    return response.data;
  },
};

export default activityService;
export { activityService };