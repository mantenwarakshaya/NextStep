import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "./AuthProvider";
import AppLayout from "./AppLayout";

import Landing from "./components/pages/Landing";
import Login from "./components/pages/Login";
import Signup from "./components/pages/Signup";

import Dashboard from "./components/Home/Dashboard";
import BranchesExplorer from "./components/BranchesExplorer";

import MasterRoadmap from "./components/AI/MasterRoadmap";
import SemesterRoadmap from "./components/AI/SemesterRoadmap";

import ShowProfile from "./components/Profile/ShowProfile";
import EditProfile from "./components/Profile/EditProfile";

import NotFound from "./components/NotFound";

function App() {
  const { user, loading, logout, refreshUser } = useAuth();

  if (loading) {
    return <div className="app-loading">Loading NextStep...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* ==================================================
            PUBLIC ROUTES
        ================================================== */}

        <Route path="/" element={<Landing />} />

        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login onLoginSuccess={refreshUser} />
            )
          }
        />

        <Route
          path="/signup"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Signup onSignupSuccess={refreshUser} />
            )
          }
        />

        {/* ==================================================
            AUTHENTICATED APPLICATION
        ================================================== */}

        <Route
          element={
            user ? (
              <AppLayout user={user} onLogout={logout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard user={user} />} />

          {/* Branch Explorer */}
          <Route path="/branches" element={<BranchesExplorer />} />

          {/* ==================================================
              CAREER ROADMAP
          ================================================== */}

          <Route path="/roadmap" element={<MasterRoadmap />} />

          {/* ==================================================
              SEMESTER ROADMAP
          ================================================== */}

          <Route path="/semester-roadmap" element={<SemesterRoadmap />} />

          {/* ==================================================
              PROFILE
          ================================================== */}

          <Route path="/profile" element={<ShowProfile />} />

          <Route path="/profile/edit" element={<EditProfile />} />
        </Route>

        {/* ==================================================
            404
        ================================================== */}

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
