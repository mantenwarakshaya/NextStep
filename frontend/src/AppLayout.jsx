import { Outlet } from "react-router-dom";
import Sidebar from "./components/Home/Sidebar";

export default function AppLayout({ user, onLogout }) {
  return (
    <div className="app-shell">
      <Sidebar user={user} onLogout={onLogout} />

      <div className="app-main">
        <main className="app-content">
          <Outlet context={{ user }} />
        </main>
      </div>
    </div>
  );
}
