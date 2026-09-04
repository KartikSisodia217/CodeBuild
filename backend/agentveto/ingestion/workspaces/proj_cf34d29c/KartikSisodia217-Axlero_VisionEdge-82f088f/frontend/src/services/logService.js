const logs = [
  {
    id: "LOG-1001",
    event: "Person Detected",
    camera: "Main Entrance",
    severity: "Low",
    time: "10:21 AM",
    date: "Today",
  },
  {
    id: "LOG-1002",
    event: "Vehicle Detected",
    camera: "Parking Area",
    severity: "Medium",
    time: "10:24 AM",
    date: "Today",
  },
  {
    id: "LOG-1003",
    event: "Unauthorized Access",
    camera: "Warehouse",
    severity: "High",
    time: "10:31 AM",
    date: "Today",
  },
  {
    id: "LOG-1004",
    event: "Camera Offline",
    camera: "Lobby",
    severity: "Critical",
    time: "10:38 AM",
    date: "Today",
  },
];

export const logService = {
  getLogs: async () => {
    return logs;
  },

  getLogById: async (id) => {
    return logs.find((log) => log.id === id);
  },

  getLogsBySeverity: async (severity) => {
    if (severity === "all") {
      return logs;
    }

    return logs.filter(
      (log) =>
        log.severity.toLowerCase() ===
        severity.toLowerCase()
    );
  },
};

export default logService;