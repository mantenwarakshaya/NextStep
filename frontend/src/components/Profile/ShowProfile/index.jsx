import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaEdit,
  FaEnvelope,
  FaGraduationCap,
  FaMap,
  FaRocket,
} from "react-icons/fa";
import { LoaderView, ErrorView, EmptyView } from "../../Common";
import "./index.css";

const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:7777"
    : "";
    
const TOTAL_SEMESTERS = 8;

export default function ShowProfile() {
  const [user, setUser] = useState(null);
  const [roadmap, setRoadmap] = useState(null);

  const [loading, setLoading] = useState(true);
  const [roadmapLoading, setRoadmapLoading] = useState(true);

  const [errorMsg, setErrorMsg] = useState("");

  /* ==================================================
     GET PROFILE
     ================================================== */
  const getProfile = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const response = await axios.get(`${API_BASE_URL}/api/me`, {
        withCredentials: true,
      });

      setUser(response.data?.user || null);
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || "Could not retrieve your profile.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* ==================================================
     GET MASTER ROADMAP
     ================================================== */
  const getRoadmap = async () => {
    try {
      setRoadmapLoading(true);

      const response = await axios.get(`${API_BASE_URL}/api/roadmap/`, {
        withCredentials: true,
      });

      setRoadmap(response.data?.data || null);
    } catch (err) {
      /*
        A roadmap may not have been generated yet.
        This should NOT make the entire profile fail.
      */
      setRoadmap(null);
    } finally {
      setRoadmapLoading(false);
    }
  };

  /* ==================================================
     INITIAL LOAD
     ================================================== */
  useEffect(() => {
    getProfile();
    getRoadmap();
  }, []);

  /* ==================================================
     PROFILE DATA
     ================================================== */
  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Not available";

  const currentSemester = Number(user?.currentSemester) || 1;

  const semesterProgress = Math.min(
    Math.max((currentSemester / TOTAL_SEMESTERS) * 100, 0),
    100,
  );

  const remainingSemesters = Math.max(TOTAL_SEMESTERS - currentSemester, 0);

  /* ==================================================
     FIND CURRENT SEMESTER FROM AI ROADMAP
     ================================================== */
  const currentSemesterPlan = useMemo(() => {
    if (!roadmap?.semesters || !Array.isArray(roadmap.semesters)) {
      return null;
    }

    return (
      roadmap.semesters.find(
        (semester) => Number(semester?.semester) === Number(currentSemester),
      ) || null
    );
  }, [roadmap, currentSemester]);

  /* ==================================================
     CURRENT FOCUS
     ================================================== */
  const currentFocusItems = useMemo(() => {
    if (!currentSemesterPlan) {
      return [];
    }

    const items = [
      ...(Array.isArray(currentSemesterPlan.skills)
        ? currentSemesterPlan.skills
        : []),
      ...(Array.isArray(currentSemesterPlan.topics)
        ? currentSemesterPlan.topics
        : []),
      ...(Array.isArray(currentSemesterPlan.dsa)
        ? currentSemesterPlan.dsa
        : []),
      ...(Array.isArray(currentSemesterPlan.projects)
        ? currentSemesterPlan.projects
        : []),
      ...(Array.isArray(currentSemesterPlan.careerPreparation)
        ? currentSemesterPlan.careerPreparation
        : []),
    ];

    // Remove duplicates and empty values
    return [...new Set(items.map((item) => String(item).trim()))]
      .filter(Boolean)
      .slice(0, 6);
  }, [currentSemesterPlan]);

  /* ==================================================
     CURRENT FOCUS DESCRIPTION
     ================================================== */
  const currentFocusDescription =
    currentSemesterPlan?.objective ||
    "Your current semester focus will appear here once your roadmap is generated.";

  /* ==================================================
     LOADING / ERROR / EMPTY
     ================================================== */
  if (loading) {
    return <LoaderView message="Loading profile..." />;
  }

  if (errorMsg) {
    return <ErrorView message={errorMsg} onRetry={getProfile} />;
  }

  if (!user) {
    return (
      <EmptyView
        message="No profile data is available right now."
      />
    );
  }

  /* ==================================================
     RENDER
     ================================================== */
  return (
    <main className="p-profile-workspace">
      <div className="p-profile-shell">
        <section className="p-profile-card">
          {/* PROFILE HEADER */}
          <header className="p-profile-header">
            <div className="p-identity-group">
              <div className="p-avatar-initial">
                {user?.firstName?.charAt(0)?.toUpperCase() || "U"}
              </div>

              <div className="p-identity-copy">
                <h1>
                  {user?.firstName} {user?.lastName || ""}
                </h1>

                <p className="p-email-line">
                  <FaEnvelope />
                  <span>{user?.emailId}</span>
                </p>

                <span className="p-role-badge">
                  <FaGraduationCap />
                  {user?.careerGoal || "Career goal not set"}
                </span>
              </div>
            </div>

            <Link to="/profile/edit" className="p-primary-btn">
              <FaEdit />
              <span>Edit Profile</span>
            </Link>
          </header>

          {/* PROFILE OVERVIEW */}
          <section className="p-overview-section" aria-label="Profile overview">
            <div className="p-section-header">
              <div>
                <span className="p-section-kicker">YOUR PROFILE</span>
                <h2>Profile Overview</h2>
              </div>
            </div>

            <div className="p-metric-grid">
              <MetricCard
                label="Branch"
                value={user?.branch || "Not configured"}
              />
              <MetricCard
                label="Career Goal"
                value={user?.careerGoal || "Not configured"}
              />
              <MetricCard
                label="Current Semester"
                value={
                  user?.currentSemester
                    ? `Semester ${user.currentSemester}`
                    : "Not set"
                }
              />
              <MetricCard
                label="Joined On"
                value={
                  <span className="p-inline-value">
                    <FaCalendarAlt />
                    {joinedDate}
                  </span>
                }
              />
            </div>
          </section>

          {/* CAREER SNAPSHOT */}
          <section className="p-career-grid">
            {/* CAREER PROGRESS */}
            <article className="p-progress-card">
              <div className="p-card-heading">
                <div>
                  <span className="p-section-kicker">YOUR JOURNEY</span>
                  <h2>Career Progress</h2>
                </div>
                <div className="p-progress-icon">
                  <FaRocket />
                </div>
              </div>

              <div className="p-progress-main">
                <div className="p-progress-number">
                  <strong>{currentSemester}</strong>
                  <span>/ {TOTAL_SEMESTERS}</span>
                </div>

                <div className="p-progress-copy">
                  <strong>Semester {currentSemester}</strong>
                  <span>
                    {remainingSemesters > 0
                      ? `${remainingSemesters} semesters remaining`
                      : "Final semester"}
                  </span>
                </div>
              </div>

              <div className="p-progress-track">
                <div
                  className="p-progress-fill"
                  style={{ width: `${semesterProgress}%` }}
                />
              </div>

              <div className="p-progress-footer">
                <span>Semester 1</span>
                <span>{Math.round(semesterProgress)}% through college</span>
                <span>Semester 8</span>
              </div>
            </article>

            {/* CURRENT FOCUS */}
            <article className="p-focus-card">
              <div className="p-card-heading">
                <div>
                  <span className="p-section-kicker">
                    SEMESTER {currentSemester}
                  </span>
                  <h2>Current Focus</h2>
                </div>
                <div className="p-focus-icon">
                  <FaCheckCircle />
                </div>
              </div>

              <p className="p-focus-description">{currentFocusDescription}</p>

              {roadmapLoading ? (
                <LoaderView message="Loading your roadmap..." />
              ) : currentFocusItems.length > 0 ? (
                <div className="p-focus-list">
                  {currentFocusItems.map((item, index) => (
                    <div className="p-focus-item" key={`${item}-${index}`}>
                      <span className="p-focus-dot" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyView
                  message="Your AI-generated roadmap has not been created yet."
                  actionText="Generate roadmap"
                  onAction={() => (window.location.href = "/semester-roadmap")}
                />
              )}
            </article>
          </section>

          {/* AI ROADMAP DETAILS */}
          {currentSemesterPlan && (
            <section className="p-roadmap-summary">
              <div className="p-roadmap-summary-header">
                <div>
                  <span className="p-section-kicker">AI GENERATED ROADMAP</span>
                  <h2>Semester {currentSemester} Goal</h2>
                </div>
                <FaGraduationCap />
              </div>

              <div className="p-roadmap-summary-content">
                <div>
                  <span className="p-summary-label">Objective</span>
                  <p>
                    {currentSemesterPlan.objective || "No objective available."}
                  </p>
                </div>

                {currentSemesterPlan.expectedOutcome && (
                  <div>
                    <span className="p-summary-label">Expected Outcome</span>
                    <p>{currentSemesterPlan.expectedOutcome}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* NEXTSTEP */}
          <section className="p-nextstep-section">
            <div className="p-nextstep-header">
              <div>
                <span className="p-section-kicker">KEEP MOVING</span>
                <h2>Your NextStep</h2>
                <p>
                  Continue building your career with your personalized planning
                  tools.
                </p>
              </div>
            </div>

            <div className="p-action-grid">
              <ActionCard
                icon={<FaMap />}
                title="Goal Roadmap"
                description="Follow your personalized career path."
                action="View Roadmap"
                href="/semester-roadmap"
              />
              <ActionCard
                icon={<FaGraduationCap />}
                title="Semester Plan"
                description="See what to focus on this semester."
                action="View Plan"
                href="/semester-roadmap"
              />
              <ActionCard
                icon={<FaRocket />}
                title="Explore Branches"
                description="Discover careers and engineering paths."
                action="Explore"
                href="/branches"
              />
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

/* ============================================================
   METRIC CARD
   ============================================================ */
function MetricCard({ label, value }) {
  return (
    <article className="p-metric-card">
      <span className="p-metric-label">{label}</span>
      <div className="p-metric-value">{value}</div>
    </article>
  );
}

/* ============================================================
   ACTION CARD
   ============================================================ */
function ActionCard({ icon, title, description, action, href }) {
  return (
    <Link to={href} className="p-action-card">
      <div className="p-action-icon">{icon}</div>

      <div className="p-action-content">
        <h3>{title}</h3>
        <p>{description}</p>
        <span className="p-action-link">
          {action}
          <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
}
