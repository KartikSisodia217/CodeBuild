import axios from "axios";

/* =========================================================
   API CONFIGURATION
========================================================= */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api/v1";

/* =========================================================
   API CLIENT
========================================================= */

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* =========================================================
   HELPERS
========================================================= */

const normalizeArray = (value) => {
  return Array.isArray(value) ? value : [];
};

/* =========================================================
   NUMBER NORMALIZER
========================================================= */

const normalizeNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

/* =========================================================
   BOOLEAN NORMALIZER
========================================================= */

const normalizeBoolean = (value) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value > 0;
  }

  if (typeof value === "string") {
    const normalized =
      value.toLowerCase().trim();

    return (
      normalized === "true" ||
      normalized === "enabled" ||
      normalized === "active" ||
      normalized === "online" ||
      normalized === "running" ||
      normalized === "connected" ||
      normalized === "1" ||
      normalized === "yes"
    );
  }

  return false;
};

/* =========================================================
   STATUS NORMALIZER
========================================================= */

const normalizeOnlineStatus = (value) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value > 0;
  }

  if (typeof value === "string") {
    const normalized =
      value.toLowerCase().trim();

    return (
      normalized === "true" ||
      normalized === "online" ||
      normalized === "active" ||
      normalized === "running" ||
      normalized === "connected" ||
      normalized === "live" ||
      normalized === "1" ||
      normalized === "yes"
    );
  }

  return false;
};

/* =========================================================
   CAMERA NORMALIZER
========================================================= */

const normalizeCamera = (
  camera,
  index
) => {
  const rawStatus =
    camera?.status ??
    camera?.is_online ??
    camera?.isOnline ??
    camera?.online ??
    false;

  const isOnline =
    normalizeOnlineStatus(rawStatus);

  const id =
    camera?.id ??
    camera?.camera_id ??
    camera?.cameraId ??
    camera?.stream_id ??
    camera?.streamId ??
    `camera-${index + 1}`;

  const location =
    camera?.location ??
    camera?.camera_name ??
    camera?.cameraName ??
    camera?.name ??
    `Camera ${index + 1}`;

  const name =
    camera?.name ??
    camera?.camera_name ??
    camera?.cameraName ??
    camera?.location ??
    `Camera ${index + 1}`;

  const fps =
    normalizeNumber(
      camera?.fps ??
        camera?.frame_rate ??
        camera?.frameRate ??
        0
    );

  const resolution =
    camera?.resolution ??
    camera?.video_resolution ??
    camera?.videoResolution ??
    "--";

  const aiEnabled =
    normalizeBoolean(
      camera?.ai_enabled ??
        camera?.aiEnabled ??
        camera?.ai_detection ??
        camera?.aiDetection ??
        camera?.ai_enabled_status
    );

  const aiDetections =
    normalizeNumber(
      camera?.ai_detections ??
        camera?.aiDetections ??
        camera?.detections ??
        camera?.detection_count ??
        camera?.detectionCount ??
        0
    );

  return {
    id,
    location,
    name,

    status: isOnline
      ? "Online"
      : "Offline",

    isOnline,

    fps,

    resolution,

    ai_enabled: aiEnabled,

    ai_detections: aiDetections,

    rtsp_url:
      camera?.rtsp_url ??
      camera?.rtspUrl ??
      "",

    last_seen:
      camera?.last_seen ??
      camera?.lastSeen ??
      "--",

    created_at:
      camera?.created_at ??
      camera?.createdAt ??
      null,

    updated_at:
      camera?.updated_at ??
      camera?.updatedAt ??
      null,
  };
};

/* =========================================================
   STREAM NORMALIZER
========================================================= */

const normalizeStream = (
  stream,
  index
) => {
  const rawStatus =
    stream?.status ??
    stream?.is_online ??
    stream?.isOnline ??
    stream?.online ??
    false;

  const isOnline =
    normalizeOnlineStatus(rawStatus);

  return {
    id:
      stream?.id ??
      stream?.stream_id ??
      stream?.streamId ??
      `stream-${index + 1}`,

    camera_name:
      stream?.camera_name ??
      stream?.cameraName ??
      stream?.name ??
      `Camera ${index + 1}`,

    name:
      stream?.name ??
      stream?.camera_name ??
      stream?.cameraName ??
      `Camera ${index + 1}`,

    rtsp_url:
      stream?.rtsp_url ??
      stream?.rtspUrl ??
      "",

    resolution:
      stream?.resolution ??
      stream?.video_resolution ??
      stream?.videoResolution ??
      "--",

    fps:
      normalizeNumber(
        stream?.fps ??
          stream?.frame_rate ??
          stream?.frameRate ??
          0
      ),

    status: isOnline
      ? "Online"
      : "Offline",

    isOnline,

    created_at:
      stream?.created_at ??
      stream?.createdAt ??
      null,

    updated_at:
      stream?.updated_at ??
      stream?.updatedAt ??
      null,
  };
};

/* =========================================================
   USER NORMALIZER
========================================================= */

const normalizeUser = (
  user,
  index
) => {
  const rawStatus =
    user?.status ??
    user?.is_online ??
    user?.isOnline ??
    user?.online ??
    false;

  const isOnline =
    normalizeOnlineStatus(rawStatus);

  const isActive =
    user?.is_active === true ||
    user?.isActive === true ||
    String(user?.status || "")
      .toLowerCase() === "active" ||
    isOnline;

  return {
    id:
      user?.id ??
      user?.user_id ??
      user?.userId ??
      `user-${index + 1}`,

    name:
      user?.name ??
      user?.username ??
      user?.full_name ??
      user?.fullName ??
      user?.email ??
      "Unknown User",

    email:
      user?.email ??
      "",

    role:
      user?.role ??
      "User",

    status: isActive
      ? "Active"
      : "Inactive",

    online_status: isOnline
      ? "Online"
      : "Offline",

    isActive,

    isOnline,

    last_seen:
      user?.last_seen ??
      user?.lastSeen ??
      "--",

    detections:
      normalizeNumber(
        user?.detections ??
          user?.detection_count ??
          user?.detectionCount ??
          user?.ai_detections ??
          user?.aiDetections ??
          0
      ),

    created_at:
      user?.created_at ??
      user?.createdAt ??
      null,

    updated_at:
      user?.updated_at ??
      user?.updatedAt ??
      null,
  };
};

/* =========================================================
   ACTIVITY NORMALIZER
========================================================= */

const normalizeActivity = (
  activity,
  index
) => {
  return {
    id:
      activity?.id ??
      activity?.activity_id ??
      activity?.activityId ??
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
      activity?.level ??
      "info",

    camera:
      activity?.camera ??
      activity?.camera_name ??
      activity?.cameraName ??
      "",

    user:
      activity?.user ??
      activity?.username ??
      "",

    time:
      activity?.time ??
      activity?.timestamp ??
      activity?.created_at ??
      activity?.createdAt ??
      "--",
  };
};

/* =========================================================
   ALERT NORMALIZER
========================================================= */

const normalizeAlert = (
  alert,
  index
) => {
  const severity =
    alert?.severity ??
    alert?.level ??
    "Low";

  const acknowledged =
    alert?.acknowledged === true ||
    alert?.resolved === true ||
    String(alert?.status || "")
      .toLowerCase() === "resolved";

  return {
    id:
      alert?.id ??
      alert?.alert_id ??
      alert?.alertId ??
      `alert-${index + 1}`,

    title:
      alert?.title ??
      alert?.event ??
      alert?.name ??
      "Security Alert",

    camera:
      alert?.camera ??
      alert?.camera_name ??
      alert?.cameraName ??
      "",

    description:
      alert?.description ??
      alert?.message ??
      "",

    severity,

    time:
      alert?.time ??
      alert?.timestamp ??
      alert?.created_at ??
      alert?.createdAt ??
      "--",

    acknowledged,

    resolved: acknowledged,
  };
};

/* =========================================================
   AI MONITORING NORMALIZER
========================================================= */

const normalizeAiMonitoring = (
  source,
  cameras
) => {
  const aiSource =
    source?.ai_monitoring ??
    source?.aiMonitoring ??
    {};

  const totalDetections =
    normalizeNumber(
      aiSource?.total_detections ??
        aiSource?.totalDetections ??
        aiSource?.detections ??
        source?.total_detections ??
        source?.totalDetections ??
        source?.ai_detections ??
        source?.aiDetections ??
        0
    );

  const activeCameras =
    normalizeNumber(
      aiSource?.active_cameras ??
        aiSource?.activeCameras ??
        cameras.filter(
          (camera) =>
            camera.ai_enabled === true &&
            camera.isOnline === true
        ).length
    );

  const people =
    normalizeNumber(
      aiSource?.people ??
        aiSource?.people_detected ??
        aiSource?.peopleDetected ??
        source?.people_detected ??
        source?.peopleDetected ??
        0
    );

  const vehicles =
    normalizeNumber(
      aiSource?.vehicles ??
        aiSource?.vehicles_detected ??
        aiSource?.vehiclesDetected ??
        source?.vehicles_detected ??
        source?.vehiclesDetected ??
        0
    );

  const objects =
    normalizeNumber(
      aiSource?.objects ??
        aiSource?.objects_detected ??
        aiSource?.objectsDetected ??
        source?.objects_detected ??
        source?.objectsDetected ??
        totalDetections
    );

  return {
    total_detections:
      totalDetections,

    active_cameras:
      activeCameras,

    people,

    vehicles,

    objects,
  };
};

/* =========================================================
   DASHBOARD NORMALIZER
========================================================= */

const normalizeDashboard = (
  raw
) => {
  /*
   * Backend may return:
   *
   * {
   *   cameras: []
   * }
   *
   * OR:
   *
   * {
   *   data: {
   *     cameras: []
   *   }
   * }
   */

  const source =
    raw?.data &&
    typeof raw.data === "object" &&
    !Array.isArray(raw.data)
      ? raw.data
      : raw ?? {};

  /* =========================
     CAMERAS
  ========================= */

  const cameras =
    normalizeArray(
      source?.cameras
    ).map(normalizeCamera);

  /* =========================
     STREAMS
  ========================= */

  const streams =
    normalizeArray(
      source?.streams
    ).map(normalizeStream);

  /*
   * If backend gives streams
   * but no cameras, use streams
   * as camera data.
   */

  const finalCameras =
    cameras.length > 0
      ? cameras
      : streams.map(
          (stream, index) =>
            normalizeCamera(
              stream,
              index
            )
        );

  /* =========================
     USERS
  ========================= */

  const users =
    normalizeArray(
      source?.users
    ).map(normalizeUser);

  /* =========================
     ACTIVITIES
  ========================= */

  const activities =
    normalizeArray(
      source?.activities ??
        source?.recent_activity ??
        source?.recentActivity ??
        source?.recent_activities ??
        source?.recentActivities
    ).map(normalizeActivity);

  /* =========================
     ALERTS
  ========================= */

  const alerts =
    normalizeArray(
      source?.alerts ??
        source?.security_alerts ??
        source?.securityAlerts
    ).map(normalizeAlert);

  /* =========================
     CAMERA CALCULATIONS
  ========================= */

  const totalCameras =
    finalCameras.length;

  const onlineCameras =
    finalCameras.filter(
      (camera) =>
        camera.isOnline === true
    ).length;

  const offlineCameras =
    Math.max(
      totalCameras -
        onlineCameras,
      0
    );

  const aiEnabledCameras =
    finalCameras.filter(
      (camera) =>
        camera.ai_enabled === true
    ).length;

  /* =========================
     STREAM CALCULATIONS
  ========================= */

  const totalStreams =
    streams.length;

  const activeStreams =
    streams.filter(
      (stream) =>
        stream.isOnline === true
    ).length;

  const inactiveStreams =
    Math.max(
      totalStreams -
        activeStreams,
      0
    );

  /* =========================
     USER CALCULATIONS
  ========================= */

  const totalUsers =
    users.length;

  const activeUsers =
    users.filter(
      (user) =>
        user.isActive === true
    ).length;

  const onlineUsers =
    users.filter(
      (user) =>
        user.isOnline === true
    ).length;

  const totalUserDetections =
    users.reduce(
      (total, user) =>
        total +
        Number(
          user.detections || 0
        ),
      0
    );

  /* =========================
     ALERT CALCULATIONS
  ========================= */

  const activeAlerts =
    alerts.filter(
      (alert) =>
        alert.acknowledged !== true
    );

  const criticalAlerts =
    activeAlerts.filter(
      (alert) =>
        String(
          alert.severity || ""
        ).toLowerCase() ===
        "critical"
    );

  const highAlerts =
    activeAlerts.filter(
      (alert) =>
        String(
          alert.severity || ""
        ).toLowerCase() ===
        "high"
    );

  /* =========================
     CAMERA AVAILABILITY
  ========================= */

  const cameraAvailability =
    totalCameras > 0
      ? Math.round(
          (onlineCameras /
            totalCameras) *
            100
        )
      : 0;

  /* =========================
     AI MONITORING
  ========================= */

  const aiMonitoring =
    normalizeAiMonitoring(
      source,
      finalCameras
    );

  /* =========================
     RETURN
  ========================= */

  return {
    ...source,

    cameras:
      finalCameras,

    streams,

    users,

    activities,

    alerts,

    ai_monitoring:
      aiMonitoring,

    stats: {
      ...(source?.stats || {}),

      total_cameras:
        totalCameras,

      online_cameras:
        onlineCameras,

      offline_cameras:
        offlineCameras,

      active_cameras:
        onlineCameras,

      inactive_cameras:
        offlineCameras,

      camera_availability:
        cameraAvailability,

      ai_enabled_cameras:
        aiEnabledCameras,

      total_streams:
        totalStreams,

      active_streams:
        activeStreams,

      inactive_streams:
        inactiveStreams,

      total_users:
        totalUsers,

      active_users:
        activeUsers,

      online_users:
        onlineUsers,

      total_user_detections:
        totalUserDetections,

      active_alerts:
        activeAlerts.length,

      critical_alerts:
        criticalAlerts.length,

      high_alerts:
        highAlerts.length,

      total_detections:
        aiMonitoring.total_detections,

      people_detected:
        aiMonitoring.people,

      vehicles_detected:
        aiMonitoring.vehicles,

      objects_detected:
        aiMonitoring.objects,
    },
  };
};

/* =========================================================
   DASHBOARD SERVICE
========================================================= */

const dashboardService = {
  async getDashboard() {
    try {
      console.log(
        "======================================"
      );

      console.log(
        "VISIONEDGE DASHBOARD REQUEST"
      );

      console.log(
        "API BASE URL:",
        API_BASE_URL
      );

      console.log(
        "DASHBOARD URL:",
        `${API_BASE_URL}/dashboard/`
      );

      const response =
        await api.get(
          "/dashboard/"
        );

      console.log(
        "DASHBOARD STATUS:",
        response.status
      );

      console.log(
        "DASHBOARD RAW RESPONSE:",
        response.data
      );

      const normalized =
        normalizeDashboard(
          response.data
        );

      console.log(
        "DASHBOARD NORMALIZED:",
        normalized
      );

      return normalized;
    } catch (error) {
      console.error(
        "======================================"
      );

      console.error(
        "DASHBOARD API ERROR"
      );

      console.error(
        "Message:",
        error?.message
      );

      console.error(
        "Status:",
        error?.response?.status
      );

      console.error(
        "Response:",
        error?.response?.data
      );

      console.error(
        "Request URL:",
        `${error?.config?.baseURL || ""}${
          error?.config?.url || ""
        }`
      );

      console.error(
        "======================================"
      );

      /*
       * Return empty structure
       * so UI does not crash.
       */

      return {
        cameras: [],

        streams: [],

        users: [],

        activities: [],

        alerts: [],

        ai_monitoring: {
          total_detections: 0,
          active_cameras: 0,
          people: 0,
          vehicles: 0,
          objects: 0,
        },

        stats: {
          total_cameras: 0,
          online_cameras: 0,
          offline_cameras: 0,

          active_cameras: 0,
          inactive_cameras: 0,

          camera_availability: 0,

          ai_enabled_cameras: 0,

          total_streams: 0,
          active_streams: 0,
          inactive_streams: 0,

          total_users: 0,
          active_users: 0,
          online_users: 0,

          total_user_detections: 0,

          active_alerts: 0,
          critical_alerts: 0,
          high_alerts: 0,

          total_detections: 0,
          people_detected: 0,
          vehicles_detected: 0,
          objects_detected: 0,
        },
      };
    }
  },
};

/* =========================================================
   EXPORTS
========================================================= */

export {
  dashboardService,
  normalizeDashboard,
  normalizeCamera,
  normalizeStream,
  normalizeUser,
  normalizeActivity,
  normalizeAlert,
  API_BASE_URL,
};

export default dashboardService;