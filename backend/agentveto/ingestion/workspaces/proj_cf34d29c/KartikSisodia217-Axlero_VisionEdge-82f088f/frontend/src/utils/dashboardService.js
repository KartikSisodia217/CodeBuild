import api from "./api";

/* =========================================================
   HELPERS
========================================================= */

const normalizeArray = (value) => {
  return Array.isArray(value) ? value : [];
};

const normalizeBoolean = (value) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  if (typeof value === "string") {
    const normalized = value.toLowerCase().trim();

    return (
      normalized === "true" ||
      normalized === "1" ||
      normalized === "active" ||
      normalized === "online" ||
      normalized === "enabled"
    );
  }

  return false;
};

/* =========================================================
   CAMERA
========================================================= */

const normalizeCamera = (camera, index) => {
  const online =
    normalizeBoolean(camera?.status) ||
    normalizeBoolean(camera?.is_online) ||
    normalizeBoolean(camera?.isOnline);

  return {
    id:
      camera?.id ??
      camera?.camera_id ??
      camera?.stream_id ??
      `camera-${index + 1}`,

    location:
      camera?.location ??
      camera?.camera_name ??
      camera?.cameraName ??
      camera?.name ??
      `Camera ${index + 1}`,

    status: online
      ? "Online"
      : "Offline",

    fps:
      Number(
        camera?.fps ??
        camera?.frame_rate ??
        camera?.frameRate ??
        0
      ) || 0,

    resolution:
      camera?.resolution ??
      camera?.video_resolution ??
      "--",

    ai_enabled:
      normalizeBoolean(
        camera?.ai_enabled ??
        camera?.aiEnabled ??
        camera?.ai_detection ??
        camera?.aiDetection
      ),

    ai_detections:
      Number(
        camera?.ai_detections ??
        camera?.detections ??
        camera?.detection_count ??
        0
      ) || 0,

    rtsp_url:
      camera?.rtsp_url ??
      camera?.rtspUrl ??
      "",

    last_seen:
      camera?.last_seen ??
      camera?.lastSeen ??
      "--",
  };
};

/* =========================================================
   USER
========================================================= */

const normalizeUser = (user, index) => {
  const status =
    user?.status ??
    (
      normalizeBoolean(
        user?.is_online ??
        user?.isOnline ??
        user?.is_active ??
        user?.isActive
      )
        ? "Online"
        : "Offline"
    );

  return {
    id:
      user?.id ??
      user?.user_id ??
      `user-${index + 1}`,

    name:
      user?.name ??
      user?.username ??
      user?.full_name ??
      user?.email ??
      "Unknown User",

    email:
      user?.email ??
      "",

    role:
      user?.role ??
      "User",

    status,

    last_seen:
      user?.last_seen ??
      user?.lastSeen ??
      "Recently",

    detections:
      Number(
        user?.detections ??
        user?.detection_count ??
        user?.ai_detections ??
        0
      ) || 0,
  };
};

/* =========================================================
   ACTIVITY
========================================================= */

const normalizeActivity = (activity, index) => {
  return {
    id:
      activity?.id ??
      activity?.activity_id ??
      `activity-${index + 1}`,

    title:
      activity?.title ??
      activity?.event ??
      activity?.action ??
      activity?.message ??
      "System Activity",

    description:
      activity?.description ??
      activity?.message ??
      "",

    type:
      activity?.type ??
      activity?.severity ??
      "info",

    camera:
      activity?.camera ??
      activity?.camera_name ??
      "",

    user:
      activity?.user ??
      activity?.username ??
      "",

    time:
      activity?.time ??
      activity?.timestamp ??
      activity?.created_at ??
      "--",
  };
};

/* =========================================================
   ALERT
========================================================= */

const normalizeAlert = (alert, index) => {
  return {
    id:
      alert?.id ??
      alert?.alert_id ??
      `alert-${index + 1}`,

    title:
      alert?.title ??
      alert?.event ??
      alert?.name ??
      "Security Alert",

    camera:
      alert?.camera ??
      alert?.camera_name ??
      "",

    description:
      alert?.description ??
      alert?.message ??
      "",

    severity:
      alert?.severity ??
      "Low",

    time:
      alert?.time ??
      alert?.timestamp ??
      alert?.created_at ??
      "--",

    acknowledged:
      normalizeBoolean(
        alert?.acknowledged
      ),

    resolved:
      normalizeBoolean(
        alert?.resolved
      ),
  };
};

/* =========================================================
   NORMALIZE DASHBOARD
========================================================= */

const normalizeDashboard = (raw) => {
  const source =
    raw?.data ??
    raw ??
    {};

  /* -------------------------------------------------------
     CAMERAS
  ------------------------------------------------------- */

  const cameras = normalizeArray(
    source.cameras
  ).map(normalizeCamera);

  /* -------------------------------------------------------
     USERS
  ------------------------------------------------------- */

  const users = normalizeArray(
    source.users
  ).map(normalizeUser);

  /* -------------------------------------------------------
     ACTIVITY
  ------------------------------------------------------- */

  const activities = normalizeArray(
    source.activities ??
    source.recent_activity ??
    source.recentActivity
  ).map(normalizeActivity);

  /* -------------------------------------------------------
     ALERTS
  ------------------------------------------------------- */

  const alerts = normalizeArray(
    source.alerts ??
    source.security_alerts ??
    source.securityAlerts
  ).map(normalizeAlert);

  /* -------------------------------------------------------
     SYSTEM
  ------------------------------------------------------- */

  const system =
    source.system ??
    {};

  /* -------------------------------------------------------
     AI MONITORING
  ------------------------------------------------------- */

  const aiMonitoringSource =
    source.ai_monitoring ??
    source.aiMonitoring ??
    {};

  const totalDetections =
    Number(
      aiMonitoringSource.total_detections ??
      aiMonitoringSource.detections ??
      source.total_detections ??
      0
    ) || 0;

  const aiMonitoring = {
    total_detections:
      totalDetections,

    active_cameras:
      Number(
        aiMonitoringSource.active_cameras ??
        cameras.filter(
          (camera) =>
            camera.ai_enabled
        ).length
      ) || 0,

    people:
      Number(
        aiMonitoringSource.people ??
        source.people_detected ??
        0
      ) || 0,

    vehicles:
      Number(
        aiMonitoringSource.vehicles ??
        source.vehicles_detected ??
        0
      ) || 0,

    objects:
      Number(
        aiMonitoringSource.objects ??
        source.objects_detected ??
        0
      ) || 0,
  };

  /* -------------------------------------------------------
     CALCULATED STATS
  ------------------------------------------------------- */

  const totalCameras =
    cameras.length;

  const onlineCameras =
    cameras.filter(
      (camera) =>
        camera.status === "Online"
    ).length;

  const offlineCameras =
    totalCameras -
    onlineCameras;

  const activeAlerts =
    alerts.filter(
      (alert) =>
        !alert.acknowledged &&
        !alert.resolved
    ).length;

  const criticalAlerts =
    alerts.filter(
      (alert) =>
        String(
          alert.severity
        ).toLowerCase() ===
        "critical"
    ).length;

  const totalUsers =
    users.length;

  const onlineUsers =
    users.filter(
      (user) =>
        String(
          user.status
        ).toLowerCase() ===
        "online"
    ).length;

  const cameraAvailability =
    totalCameras > 0
      ? Math.round(
          (
            onlineCameras /
            totalCameras
          ) * 100
        )
      : 0;

  /* -------------------------------------------------------
     RETURN
  ------------------------------------------------------- */

  return {
    ...source,

    cameras,

    users,

    activities,

    alerts,

    system,

    ai_monitoring:
      aiMonitoring,

    stats: {
      ...(source.stats ?? {}),

      total_cameras:
        totalCameras,

      online_cameras:
        onlineCameras,

      offline_cameras:
        offlineCameras,

      ai_enabled_cameras:
        cameras.filter(
          (camera) =>
            camera.ai_enabled
        ).length,

      total_users:
        totalUsers,

      online_users:
        onlineUsers,

      total_detections:
        totalDetections,

      active_alerts:
        activeAlerts,

      critical_alerts:
        criticalAlerts,

      camera_availability:
        cameraAvailability,
    },
  };
};

/* =========================================================
   SERVICE
========================================================= */

const dashboardService = {

  async getDashboard() {
    try {
      const response =
        await api.get(
          "/dashboard"
        );

      console.log(
        "VISIONEDGE DASHBOARD RAW:",
        response.data
      );

      const normalized =
        normalizeDashboard(
          response.data
        );

      console.log(
        "VISIONEDGE DASHBOARD NORMALIZED:",
        normalized
      );

      return normalized;

    } catch (error) {

      console.error(
        "VISIONEDGE DASHBOARD ERROR:",
        error
      );

      throw error;
    }
  },
};

export {
  normalizeDashboard,
};

export default dashboardService;