import api from "./api";

const streamService = {
  // Get all streams
  getStreams: async () => {
    const response = await api.get("/streams/");
    return response.data;
  },

  // Get a single stream
  getStream: async (streamId) => {
    const response = await api.get(`/streams/${streamId}`);
    return response.data;
  },

  // Create a new stream
  createStream: async (streamData) => {
    const response = await api.post("/streams/", streamData);
    return response.data;
  },

  // Update an existing stream
  updateStream: async (streamId, streamData) => {
    const response = await api.put(
      `/streams/${streamId}`,
      streamData
    );
    return response.data;
  },

  // Start stream
  startStream: async (streamId) => {
    const response = await api.post(
      `/streams/${streamId}/start`
    );
    return response.data;
  },

  // Stop stream
  stopStream: async (streamId) => {
    const response = await api.post(
      `/streams/${streamId}/stop`
    );
    return response.data;
  },

  // Delete stream
  deleteStream: async (streamId) => {
    const response = await api.delete(
      `/streams/${streamId}`
    );
    return response.data;
  },
};

export default streamService;