import api from "./api";

const streamsService = {
  async getStreams() {
    const response =
      await api.get("/streams");

    console.log(
      "STREAMS API RESPONSE:",
      response.data
    );

    return Array.isArray(
      response.data
    )
      ? response.data
      : response.data?.streams || [];
  },

  async createStream(data) {
    const response =
      await api.post(
        "/streams",
        data
      );

    return response.data;
  },

  async startStream(id) {
    const response =
      await api.post(
        `/streams/${id}/start`
      );

    return response.data;
  },

  async stopStream(id) {
    const response =
      await api.post(
        `/streams/${id}/stop`
      );

    return response.data;
  },
};

export default streamsService;