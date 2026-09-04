import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const VisionEdgeContext = createContext(null);

const STORAGE_KEY = "visionedge-dashboard-data";

const defaultData = {
  streams: [],
  cameras: [],
  securityAlerts: [],
  activityLogs: [],
  users: [],
};

function loadStoredData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return defaultData;
    }

    const parsed = JSON.parse(stored);

    return {
      ...defaultData,
      ...parsed,
      streams: Array.isArray(parsed.streams)
        ? parsed.streams
        : [],
      cameras: Array.isArray(parsed.cameras)
        ? parsed.cameras
        : [],
      securityAlerts: Array.isArray(
        parsed.securityAlerts
      )
        ? parsed.securityAlerts
        : [],
      activityLogs: Array.isArray(
        parsed.activityLogs
      )
        ? parsed.activityLogs
        : [],
      users: Array.isArray(parsed.users)
        ? parsed.users
        : [],
    };
  } catch (error) {
    console.error(
      "Failed to load VisionEdge dashboard data:",
      error
    );

    return defaultData;
  }
}

export function VisionEdgeProvider({ children }) {
  const [data, setData] = useState(loadStoredData);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(data)
    );
  }, [data]);

  // Listen for updates from another component/page
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key !== STORAGE_KEY) {
        return;
      }

      try {
        const updatedData = event.newValue
          ? JSON.parse(event.newValue)
          : defaultData;

        setData({
          ...defaultData,
          ...updatedData,
        });
      } catch (error) {
        console.error(
          "Failed to sync VisionEdge dashboard data:",
          error
        );
      }
    };

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, []);

  const updateStreams = (streams) => {
    setData((prev) => ({
      ...prev,
      streams: Array.isArray(streams)
        ? streams
        : [],
    }));
  };

  const updateCameras = (cameras) => {
    setData((prev) => ({
      ...prev,
      cameras: Array.isArray(cameras)
        ? cameras
        : [],
    }));
  };

  const updateSecurityAlerts = (alerts) => {
    setData((prev) => ({
      ...prev,
      securityAlerts: Array.isArray(alerts)
        ? alerts
        : [],
    }));
  };

  const updateActivityLogs = (logs) => {
    setData((prev) => ({
      ...prev,
      activityLogs: Array.isArray(logs)
        ? logs
        : [],
    }));
  };

  const updateUsers = (users) => {
    setData((prev) => ({
      ...prev,
      users: Array.isArray(users)
        ? users
        : [],
    }));
  };

  const addActivityLog = (log) => {
    setData((prev) => ({
      ...prev,
      activityLogs: [
        log,
        ...prev.activityLogs,
      ],
    }));
  };

  const addSecurityAlert = (alert) => {
    setData((prev) => ({
      ...prev,
      securityAlerts: [
        alert,
        ...prev.securityAlerts,
      ],
    }));
  };

  const clearDashboardData = () => {
    setData(defaultData);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      data,

      streams: data.streams,
      cameras: data.cameras,
      securityAlerts:
        data.securityAlerts,
      activityLogs:
        data.activityLogs,
      users: data.users,

      updateStreams,
      updateCameras,
      updateSecurityAlerts,
      updateActivityLogs,
      updateUsers,

      addActivityLog,
      addSecurityAlert,

      clearDashboardData,
    }),
    [data]
  );

  return (
    <VisionEdgeContext.Provider value={value}>
      {children}
    </VisionEdgeContext.Provider>
  );
}

export function useVisionEdge() {
  const context =
    useContext(VisionEdgeContext);

  if (!context) {
    throw new Error(
      "useVisionEdge must be used inside VisionEdgeProvider"
    );
  }

  return context;
}

export default VisionEdgeContext;