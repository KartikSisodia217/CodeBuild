import api from "./api";

const userService = {
  getUsers: async () => {
    try {
      const response = await api.get("/users/");

      console.log("USERS API RESPONSE:", response.data);

      return response.data;
    } catch (error) {
      console.error(
        "GET USERS ERROR:",
        error.response?.data || error.message
      );

      throw error;
    }
  },

  getUser: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);

      console.log("USER API RESPONSE:", response.data);

      return response.data;
    } catch (error) {
      console.error(
        `GET USER ${userId} ERROR:`,
        error.response?.data || error.message
      );

      throw error;
    }
  },

  createUser: async (user) => {
    try {
      const response = await api.post("/users/", user);

      console.log("CREATE USER RESPONSE:", response.data);

      return response.data;
    } catch (error) {
      console.error(
        "CREATE USER ERROR:",
        error.response?.data || error.message
      );

      throw error;
    }
  },

  updateUser: async (userId, user) => {
    try {
      const response = await api.put(
        `/users/${userId}`,
        user
      );

      console.log("UPDATE USER RESPONSE:", response.data);

      return response.data;
    } catch (error) {
      console.error(
        `UPDATE USER ${userId} ERROR:`,
        error.response?.data || error.message
      );

      throw error;
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await api.delete(
        `/users/${userId}`
      );

      console.log("DELETE USER RESPONSE:", response.data);

      return response.data;
    } catch (error) {
      console.error(
        `DELETE USER ${userId} ERROR:`,
        error.response?.data || error.message
      );

      throw error;
    }
  },
};

export default userService;
export { userService };