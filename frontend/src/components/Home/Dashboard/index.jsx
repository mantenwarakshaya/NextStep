import React, { useEffect, useState, useCallback } from "react";
import { useOutletContext, Link } from "react-router-dom";
import {
  Compass,
  Map,
  ArrowRight,
  BarChart2,
  Target,
  BookOpen,
} from "lucide-react";
import { EmptyView, LoaderView } from "../../Common";
import "./index.css";

const workspaces = [
  {
    path: "/branches",
    step: "01",
    title: "Branches Explorer",
    desc: "Browse core subjects, required skills, and career scope for each branch.",
    accent: "blue",
    Icon: Compass,
  },
  {
    path: "/roadmap",
    step: "02",
    title: "Goal Roadmap",
    desc: "Choose your career goal and build a personalized roadmap to reach it.",
    accent: "green",
    Icon: Target,
  },
  {
    path: "/semester-roadmap",
    step: "03",
    title: "Semester Roadmap",
    desc: "Follow your personalized semester-wise plan for your chosen career goal.",
    accent: "violet",
    Icon: Map,
  },
];

function formatActivity(items) {
  return items.slice(0, 5).map((item) => ({
    id: item._id,
    label: item.title || `Semester ${item.semester} update`,
    date: new Date(item.createdAt).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    }),
  }));
}

export default function Dashboard() {
  const { user } = useOutletContext();

  const [activity, setActivity] = useState([]);
  const [actLoading, setActLoading] = useState(true);
  const [hasCurriculum, setHasCurriculum] = useState(false);

  // FIX: `user.roadmap` was never a field returned by the backend's
  // publicUser() response (see auth router: _id, firstName, lastName,
  // emailId, branch, careerGoal, specialization, currentSemester,
  // curriculum, createdAt). Reading `user?.roadmap` was always
  // undefined, so the two checklist items below could never be marked
  // done. Until the backend actually stores a roadmap field, treat a
  // populated curriculum as the signal that a roadmap has been
  // generated for the user.
  const hasRoadmap = Array.isArray(user?.curriculum)
    ? user.curriculum.length > 0
    : false;

  const currentSemester = user?.currentSemester || 1;
  const totalSemesters = 8;

  const semesterPct = Math.min((currentSemester / totalSemesters) * 100, 100);

  const fetchActivity = useCallback(async () => {
    const curriculumItems = Array.isArray(user?.curriculum)
      ? user.curriculum
      : [];

    setHasCurriculum(curriculumItems.length > 0);
    setActivity(formatActivity(curriculumItems));
    setActLoading(false);
  }, [user]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  return (
    <div className="d-root">
      <div className="d-container">
        {/* ═══════════════════════════════════════════════
            HERO
        ═══════════════════════════════════════════════ */}

        <header className="d-hero">
          <div className="d-hero-left">
            <h1 className="d-hero-title">
              Welcome back,{" "}
              <span className="d-hero-name">
                {user?.firstName || "Student"}
              </span>
            </h1>

            <p className="d-hero-sub">
              Build your academic path, choose your career goal, and follow your
              personalized roadmap.
            </p>
          </div>

          <div className="d-hero-right">
            <div className="d-target-pill">
              <span className="d-pulse" aria-hidden="true" />

              <Target size={13} />

              <span>
                Goal: <strong>{user?.careerGoal || "Not set"}</strong>
              </span>
            </div>

            <div className="d-target-pill">
              <BookOpen size={13} />

              <span>{user?.branch || "Branch not set"}</span>
            </div>
          </div>
        </header>

        {/* ═══════════════════════════════════════════════
            MAIN GRID
        ═══════════════════════════════════════════════ */}

        <div className="d-main-grid">
          {/* ─────────────────────────────────────────────
              SEMESTER PROGRESS
          ───────────────────────────────────────────── */}

          <section className="d-card d-checklist-card">
            <div className="d-card-header">
              <h2 className="d-card-title">Semester Progress</h2>

              <span className="d-badge">
                Semester {currentSemester}/{totalSemesters}
              </span>
            </div>

            {/* Progress Bar */}

            <div className="d-progress-bar">
              <div
                className="d-progress-fill"
                style={{
                  width: `${semesterPct}%`,
                }}
              />

              <div className="d-progress-ticks" aria-hidden="true">
                {Array.from({
                  length: totalSemesters,
                }).map((_, i) => (
                  <span
                    key={i}
                    className={`d-progress-tick ${
                      i < currentSemester ? "d-progress-tick--done" : ""
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Checklist */}

            <div className="d-checklist">
              {[
                {
                  to: "/branches",
                  done: !!user?.branch,
                  title: "Choose your branch",
                  sub: "Select your B.Tech branch to explore relevant career paths.",
                },
                {
                  to: "/roadmap",
                  done: !!user?.careerGoal,
                  title: "Choose your career goal",
                  sub: "Select the career you want to prepare for.",
                },
                {
                  to: "/roadmap",
                  done: hasRoadmap,
                  title: "Your Goal Destination Roadmap",
                  sub: "Align your roadmap with the subjects you actually study.",
                },
                {
                  to: "/semester-roadmap",
                  done: hasRoadmap,
                  title: "Follow your roadmap",
                  sub: "Get your personalized semester-wise learning plan.",
                },
              ].map(({ to, done, title, sub }, i) => (
                <Link
                  key={title}
                  to={to}
                  className={`d-checklist-item ${
                    done ? "d-checklist-item--done" : ""
                  }`}
                >
                  <span className="d-checklist-node">{done ? "✓" : i + 1}</span>

                  <div className="d-checklist-text">
                    <h4>{title}</h4>

                    <p>{sub}</p>
                  </div>

                  <ArrowRight size={13} className="d-checklist-arrow" />
                </Link>
              ))}
            </div>
          </section>

          {/* ─────────────────────────────────────────────
              RECENT ACTIVITY
          ───────────────────────────────────────────── */}

          <section className="d-card d-activity-card">
            <div className="d-card-header">
              <h2 className="d-card-title">Recent Activity</h2>

              {activity.length > 0 && (
                <span className="d-badge">
                  {activity.length} record
                  {activity.length > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* Loading */}

            {actLoading ? (
              <LoaderView message="Loading recent activity..." />
            ) : activity.length === 0 ? (
              /* Empty State */

              <EmptyView
                message="No recent activity yet."
                actionText="Go to Semester Plan"
                className="d-activity-empty-view"
                onAction={() => (window.location.href = "/semester-roadmap")}
              />
            ) : (
              /* Activity List */

              <ul className="d-activity-list">
                {activity.map((item) => (
                  <li key={item.id} className="d-activity-item">
                    <span className="d-activity-dot">
                      <BarChart2 size={11} />
                    </span>

                    <div className="d-activity-body">
                      <span className="d-activity-label">{item.label}</span>
                    </div>

                    <span className="d-activity-date">{item.date}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* ═══════════════════════════════════════════════
            QUICK WORKSPACES
        ═══════════════════════════════════════════════ */}

        <section className="d-workspaces">
          <div className="d-section-header">
            <h2 className="d-section-title">Quick Workspaces</h2>

            <p className="d-section-sub">Jump directly into any tool</p>
          </div>

          <div className="d-workspace-grid">
            {workspaces.map(({ path, step, title, desc, accent, Icon }) => (
              <Link
                key={path}
                to={path}
                className={`d-workspace-card d-workspace-card--${accent}`}
              >
                {/* Top */}

                <div className="d-workspace-top">
                  <span className="d-workspace-step">Step {step}</span>

                  <div className="d-workspace-icon">
                    <Icon size={17} />
                  </div>
                </div>

                {/* Body */}

                <div className="d-workspace-body">
                  <h3 className="d-workspace-title">{title}</h3>

                  <p className="d-workspace-desc">{desc}</p>
                </div>

                {/* Footer */}

                <div className="d-workspace-footer">
                  <span className="d-workspace-cta">Launch</span>

                  <ArrowRight size={13} className="d-workspace-arrow" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}