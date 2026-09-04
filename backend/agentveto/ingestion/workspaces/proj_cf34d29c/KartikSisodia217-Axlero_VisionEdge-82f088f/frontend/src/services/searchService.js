import api from "./api";

const searchService = {
  async search(query) {
    const value = query.trim().toLowerCase();

    if (!value) {
      return [];
    }

    const results = [];

    try {
      const response = await api.get("/streams/");
      const streams = Array.isArray(response.data)
        ? response.data
        : [];

      streams.forEach((stream) => {
        const cameraName =
          stream.camera_name || "";

        const rtspUrl =
          stream.rtsp_url || "";

        const resolution =
          stream.resolution || "";

        const searchableText =
          `${cameraName} ${rtspUrl} ${resolution} ${stream.id}`
            .toLowerCase();

        if (searchableText.includes(value)) {
          results.push({
            type: "stream",
            id: stream.id,
            title:
              cameraName ||
              `Stream #${stream.id}`,
            description: stream.status
              ? "Online stream"
              : "Offline stream",
            page: "streams",
            data: stream,
          });
        }
      });
    } catch (error) {
      console.error(
        "Stream search failed:",
        error
      );
    }

    try {
      const response =
        await api.get("/activity-logs/");

      const logs = Array.isArray(response.data)
        ? response.data
        : [];

      logs.forEach((log) => {
        const message =
          log.message || "";

        const level =
          log.level || "";

        const searchableText =
          `${message} ${level}`
            .toLowerCase();

        if (searchableText.includes(value)) {
          results.push({
            type: "activity",
            id: log.id,
            title: message,
            description:
              `${level} activity log`,
            page: "activity-logs",
            data: log,
          });
        }
      });
    } catch (error) {
      console.error(
        "Activity search failed:",
        error
      );
    }

    try {
      const response =
        await api.get("/users/");

      const users = Array.isArray(response.data)
        ? response.data
        : [];

      users.forEach((user) => {
        const name =
          user.full_name || "";

        const email =
          user.email || "";

        const searchableText =
          `${name} ${email} ${user.id}`
            .toLowerCase();

        if (searchableText.includes(value)) {
          results.push({
            type: "user",
            id: user.id,
            title:
              name ||
              `User #${user.id}`,
            description:
              email || "VisionEdge user",
            page: "user",
            data: user,
          });
        }
      });
    } catch (error) {
      console.error(
        "User search failed:",
        error
      );
    }

    return results;
  },
};

export default searchService;