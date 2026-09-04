const STORAGE_KEY = "visionedge-dashboard-data";

const defaultData = {
  cameras: [],
  alerts: [],
  users: [],
  activities: [],
};

export function getDashboardData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return defaultData;
    }

    const parsed = JSON.parse(stored);

    return {
      ...defaultData,
      ...parsed,
      cameras: Array.isArray(parsed.cameras)
        ? parsed.cameras
        : [],
      alerts: Array.isArray(parsed.alerts)
        ? parsed.alerts
        : [],
      users: Array.isArray(parsed.users)
        ? parsed.users
        : [],
      activities: Array.isArray(parsed.activities)
        ? parsed.activities
        : [],
    };
  } catch (error) {
    console.error(
      "Failed to load dashboard data:",
      error
    );

    return defaultData;
  }
}

export function saveDashboardData(data) {
  const current = getDashboardData();

  const updated = {
    ...current,
    ...data,
  };

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updated)
  );

  window.dispatchEvent(
    new CustomEvent(
      "visionedge-dashboard-update"
    )
  );
}

export function updateDashboardData(updates) {
  const current = getDashboardData();

  saveDashboardData({
    ...current,
    ...updates,
  });
}

export function addDashboardActivity(activity) {
  const current = getDashboardData();

  const newActivity = {
    id: Date.now(),
    time: new Date().toISOString(),
    type: "success",
    ...activity,
  };

  const activities = [
    newActivity,
    ...current.activities,
  ].slice(0, 20);

  saveDashboardData({
    ...current,
    activities,
  });
}

export function updateDashboardCameras(
  cameras
) {
  saveDashboardData({
    cameras,
  });
}

export function updateDashboardUsers(
  users
) {
  saveDashboardData({
    users,
  });
}

export function updateDashboardAlerts(
  alerts
) {
  saveDashboardData({
    alerts,
  });
}

export function clearDashboardData() {
  localStorage.removeItem(STORAGE_KEY);

  window.dispatchEvent(
    new CustomEvent(
      "visionedge-dashboard-update"
    )
  );
}