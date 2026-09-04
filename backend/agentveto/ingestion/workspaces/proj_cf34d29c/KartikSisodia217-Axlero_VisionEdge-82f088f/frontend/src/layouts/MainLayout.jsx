import { useState } from "react";

import {
  Box,
} from "@mui/material";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import Dashboard from "../pages/Dashboard";
import Streams from "../pages/Streams";
import CameraMonitoring from "../pages/CameraMonitoring";
import SecurityAlerts from "../pages/SecurityAlerts";
import ActivityLogs from "../pages/ActivityLogs";
import RealTimeMonitoringPage from "../pages/RealTimeMonitoringPage";
import Settings from "../pages/Settings";
import UserProfile from "../pages/UserProfile";

function MainLayout() {
  const [activePage, setActivePage] =
    useState("dashboard");

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard />;

      case "streams":
        return <Streams />;

      case "camera-monitoring":
        return <CameraMonitoring />;

      case "security-alerts":
        return <SecurityAlerts />;

      case "activity-logs":
        return <ActivityLogs />;

      case "real-time-monitoring":
        return <RealTimeMonitoringPage />;

      case "settings":
        return <Settings />;

      case "user":
        return <UserProfile />;

      default:
        return <Dashboard />;
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        minHeight: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
        transition:
          "background-color 0.25s ease, color 0.25s ease",
      }}
    >
      {/* SIDEBAR */}

      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      {/* MAIN AREA */}

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.default",
          transition:
            "background-color 0.25s ease",
        }}
      >
        {/* TOPBAR */}

        <Topbar
          setActivePage={setActivePage}
        />

        {/* PAGE CONTENT */}

        <Box
          component="main"
          sx={{
            flex: 1,
            width: "100%",
            minWidth: 0,
            bgcolor: "background.default",
            overflow: "auto",
            transition:
              "background-color 0.25s ease",
          }}
        >
          {renderPage()}
        </Box>
      </Box>
    </Box>
  );
}

export default MainLayout;