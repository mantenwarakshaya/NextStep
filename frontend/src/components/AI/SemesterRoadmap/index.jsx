import { useEffect, useState } from "react";
import { EmptyView, ErrorView, LoaderView } from "../../Common";
import "./index.css";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:7777";

export default function Roadmap() {
  const [masterRoadmap, setMasterRoadmap] = useState(null);

  const [loadingMaster, setLoadingMaster] = useState(true);
  const [generatingMaster, setGeneratingMaster] = useState(false);

  const [error, setError] = useState("");

  /*
   * ======================================================
   * SEQUENTIAL SEMESTER PROGRESS
   *
   * Semesters unlock one at a time. `completedSemesters`
   * holds the numbers that are already generated (fixed).
   * `currentSemester` is the single semester the user can
   * currently set up / view — the first one that hasn't
   * been generated yet. `null` once every semester is done.
   * ======================================================
   */

  const [checkingProgress, setCheckingProgress] = useState(false);
  const [completedSemesters, setCompletedSemesters] = useState([]);
  const [completedRoadmapCache, setCompletedRoadmapCache] = useState({});
  const [currentSemester, setCurrentSemester] = useState(null);

  const [currentSemesterRoadmap, setCurrentSemesterRoadmap] = useState(null);
  const [generatingSemester, setGeneratingSemester] = useState(false);

  const [expandedCompletedSemester, setExpandedCompletedSemester] =
    useState(null);
  const [loadingCompletedDetail, setLoadingCompletedDetail] = useState(false);

  const totalSemesters = masterRoadmap?.semesters?.length || 0;

  /*
   * ======================================================
   * LOAD MASTER ROADMAP
   * ======================================================
   */

  useEffect(() => {
    loadMasterRoadmap();
  }, []);

  const loadMasterRoadmap = async () => {
    try {
      setLoadingMaster(true);
      setError("");

      const response = await fetch(`${BASE_URL}/api/roadmap/`, {
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMasterRoadmap(data.data);
        await determineProgress(data.data.semesters?.length || 0);
      } else if (response.status !== 404) {
        throw new Error(data.message || "Failed to load roadmap.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoadingMaster(false);
    }
  };

  /*
   * ======================================================
   * GENERATE MASTER ROADMAP
   * ======================================================
   */

  const handleGenerateMaster = async () => {
    try {
      setGeneratingMaster(true);
      setError("");

      const response = await fetch(`${BASE_URL}/api/roadmap/generate`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to generate roadmap.");
      }

      setMasterRoadmap(data.data);

      // Brand new master roadmap: nothing generated yet,
      // so semester 1 is the current one straight away.
      setCompletedSemesters([]);
      setCompletedRoadmapCache({});
      setCurrentSemester(data.data.semesters?.length ? 1 : null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setGeneratingMaster(false);
    }
  };

  /*
   * ======================================================
   * DETERMINE PROGRESS
   *
   * Finds which semesters already have a generated roadmap
   * (fixed / completed) and which one is the current,
   * still-to-be-set-up semester.
   * ======================================================
   */

  const determineProgress = async (semesterCount) => {
    if (!semesterCount) {
      setCompletedSemesters([]);
      setCompletedRoadmapCache({});
      setCurrentSemester(null);
      return;
    }

    try {
      setCheckingProgress(true);
      setError("");

      const results = await Promise.all(
        Array.from({ length: semesterCount }, (_, i) => i + 1).map(
          async (semester) => {
            const response = await fetch(
              `${BASE_URL}/api/roadmap/semester/${semester}`,
              { credentials: "include" },
            );
            const data = await response.json();

            return {
              semester,
              done: response.ok && data.success,
              data: response.ok && data.success ? data.data : null,
            };
          },
        ),
      );

      let firstIncomplete = null;
      for (let semester = 1; semester <= semesterCount; semester++) {
        const found = results.find((r) => r.semester === semester);
        if (!found?.done) {
          firstIncomplete = semester;
          break;
        }
      }

      // Only treat a contiguous prefix as "completed" — this
      // keeps the journey strictly sequential even if the
      // backend somehow has a gap.
      const doneResults = results.filter(
        (r) =>
          r.done && (firstIncomplete === null || r.semester < firstIncomplete),
      );

      setCompletedSemesters(doneResults.map((r) => r.semester));
      setCompletedRoadmapCache(
        Object.fromEntries(doneResults.map((r) => [r.semester, r.data])),
      );
      setCurrentSemester(firstIncomplete);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setCheckingProgress(false);
    }
  };

  /*
   * ======================================================
   * GENERATE CURRENT SEMESTER ROADMAP
   *
   * IMPORTANT:
   * Your backend requires semesterStart and semesterEnd.
   * These are collected below from the user.
   * ======================================================
   */

  const [calendar, setCalendar] = useState({
    semesterStart: "",
    semesterEnd: "",
  });

  const [examText, setExamText] = useState("");
  const [holidayText, setHolidayText] = useState("");

  const parseEvents = (text) => {
    if (!text.trim()) return [];

    return text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split("|").map((item) => item.trim());

        return {
          name: parts[0] || "College Event",
          startDate: parts[1] || "",
          endDate: parts[2] || parts[1] || "",
        };
      });
  };

  const handleGenerateSemester = async () => {
    if (!currentSemester) return;

    if (!calendar.semesterStart || !calendar.semesterEnd) {
      setError("Please provide semester start and end dates.");
      return;
    }

    try {
      setGeneratingSemester(true);
      setError("");

      const exams = parseEvents(examText);
      const holidays = parseEvents(holidayText);

      const response = await fetch(
        `${BASE_URL}/api/roadmap/semester/${currentSemester}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            semesterStart: calendar.semesterStart,
            semesterEnd: calendar.semesterEnd,
            exams,
            holidays,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to generate semester roadmap.");
      }

      // Generated and fixed on the backend. Show it here so
      // the user can review before moving on to the next one.
      setCurrentSemesterRoadmap(data.data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setGeneratingSemester(false);
    }
  };

  /*
   * ======================================================
   * CONTINUE TO NEXT SEMESTER
   *
   * Locks the just-generated semester in as "completed" and
   * moves the active slot to the next semester.
   * ======================================================
   */

  const handleContinueToNext = () => {
    if (!currentSemester || !currentSemesterRoadmap) return;

    const justFinished = currentSemester;

    setCompletedRoadmapCache((prev) => ({
      ...prev,
      [justFinished]: currentSemesterRoadmap,
    }));
    setCompletedSemesters((prev) => [...prev, justFinished]);

    const next = justFinished + 1;

    setCurrentSemesterRoadmap(null);
    setCalendar({ semesterStart: "", semesterEnd: "" });
    setExamText("");
    setHolidayText("");
    setError("");

    setCurrentSemester(next <= totalSemesters ? next : null);
  };

  /*
   * ======================================================
   * VIEW A COMPLETED (FIXED) SEMESTER
   * ======================================================
   */

  const handleToggleCompleted = async (semester) => {
    if (expandedCompletedSemester === semester) {
      setExpandedCompletedSemester(null);
      return;
    }

    setExpandedCompletedSemester(semester);

    if (completedRoadmapCache[semester]) return;

    try {
      setLoadingCompletedDetail(true);
      setError("");

      const response = await fetch(
        `${BASE_URL}/api/roadmap/semester/${semester}`,
        { credentials: "include" },
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setCompletedRoadmapCache((prev) => ({
          ...prev,
          [semester]: data.data,
        }));
      } else {
        throw new Error(data.message || "Failed to load semester roadmap.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoadingCompletedDetail(false);
    }
  };

  /*
   * ======================================================
   * LOADING
   * ======================================================
   */

  if (loadingMaster) {
    return <LoaderView message="Loading your roadmap..." />;
  }

  /*
   * ======================================================
   * NO MASTER ROADMAP
   * ======================================================
   */

  if (!masterRoadmap) {
    return (
      <div className="roadmap-page">
        <div className="roadmap-empty">
          {error ? (
            <ErrorView message={error} onRetry={handleGenerateMaster} />
          ) : generatingMaster ? (
            <LoaderView message="Generating your roadmap..." />
          ) : (
            <EmptyView
              message="Your 4-year roadmap has not been generated yet."
              actionText="Generate My Roadmap"
              onAction={handleGenerateMaster}
            />
          )}
        </div>
      </div>
    );
  }

  /*
   * ======================================================
   * MAIN UI
   * ======================================================
   */

  return (
    <div className="roadmap-page">
      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="roadmap-header">
        <div>
          <div className="page-label">CAREER ROADMAP</div>

          <h1>Your 4-Year Career Roadmap</h1>

          <p>
            A structured journey from foundation to internship and placement
            readiness.
          </p>
        </div>

        <div className="header-meta">
          <div className="meta-item">
            <span>Branch</span>
            <strong>{masterRoadmap.branch}</strong>
          </div>

          <div className="meta-item">
            <span>Career Goal</span>
            <strong>{masterRoadmap.careerGoal}</strong>
          </div>
        </div>
      </header>

      {/* ==================================================
          ERROR
      ================================================== */}

      {error && <ErrorView message={error} />}

      {/* ==================================================
          SPECIALIZATION
      ================================================== */}

      {masterRoadmap.specialization?.length > 0 && (
        <section className="specialization-card">
          <div>
            <span className="section-label">SPECIALIZATION</span>

            <div className="specialization-list">
              {masterRoadmap.specialization.map((item, index) => (
                <span className="specialization-tag" key={index}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ==================================================
          SEQUENTIAL SEMESTER JOURNEY
      ================================================== */}

      <section className="roadmap-section">
        <div className="section-heading">
          <div>
            <span className="section-label">YOUR JOURNEY</span>

            <h2>Semester-by-Semester Roadmap</h2>
          </div>

          <span className="semester-count">
            {completedSemesters.length} of {totalSemesters} Completed
          </span>
        </div>

        {checkingProgress && (
          <LoaderView message="Checking your progress..." />
        )}

        {!checkingProgress && (
          <>
            {/* ----------------------------------------------
                COMPLETED (FIXED) SEMESTERS
            ---------------------------------------------- */}

            {completedSemesters.length > 0 && (
              <div className="completed-semesters">
                {completedSemesters.map((semester) => {
                  const summary = masterRoadmap.semesters?.find(
                    (s) => s.semester === semester,
                  );

                  return (
                    <CompletedSemesterCard
                      key={semester}
                      semester={semester}
                      objective={summary?.objective}
                      expanded={expandedCompletedSemester === semester}
                      onClick={() => handleToggleCompleted(semester)}
                    />
                  );
                })}
              </div>
            )}

            {expandedCompletedSemester && (
              <div className="semester-detail completed-detail">
                <div className="detail-header">
                  <div>
                    <span className="section-label">
                      SEMESTER {expandedCompletedSemester} · FIXED
                    </span>

                    <h2>Completed Semester Roadmap</h2>
                  </div>

                  <button
                    className="close-button"
                    onClick={() => setExpandedCompletedSemester(null)}
                  >
                    Close
                  </button>
                </div>

                {loadingCompletedDetail &&
                  !completedRoadmapCache[expandedCompletedSemester] && (
                    <LoaderView message="Loading semester roadmap..." />
                  )}

                {completedRoadmapCache[expandedCompletedSemester] && (
                  <SemesterDetails
                    roadmap={completedRoadmapCache[expandedCompletedSemester]}
                  />
                )}
              </div>
            )}

            {/* ----------------------------------------------
                CURRENT (ACTIVE) SEMESTER
            ---------------------------------------------- */}

            {currentSemester && (
              <section className="semester-detail current-semester-block">
                <div className="detail-header">
                  <div>
                    <span className="section-label">
                      SEMESTER {currentSemester}{" "}
                      <span className="current-badge">
                        {currentSemesterRoadmap ? "Just Generated" : "Up Next"}
                      </span>
                    </span>

                    <h2>
                      {currentSemesterRoadmap
                        ? "Review This Semester"
                        : "Set Up This Semester"}
                    </h2>
                  </div>
                </div>

                {/* CALENDAR SETUP */}

                {!currentSemesterRoadmap && !generatingSemester && (
                  <div className="calendar-card">
                    <div className="calendar-heading">
                      <h3>Set Your College Calendar</h3>

                      <p>
                        Your semester plan will respect exams, holidays and the
                        3-day pre-exam protection period.
                      </p>
                    </div>

                    <div className="date-grid">
                      <div className="input-group">
                        <label>Semester Start</label>

                        <input
                          type="date"
                          value={calendar.semesterStart}
                          onChange={(e) =>
                            setCalendar({
                              ...calendar,
                              semesterStart: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="input-group">
                        <label>Semester End</label>

                        <input
                          type="date"
                          value={calendar.semesterEnd}
                          onChange={(e) =>
                            setCalendar({
                              ...calendar,
                              semesterEnd: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="event-inputs">
                      <div className="input-group">
                        <label>Exams</label>

                        <textarea
                          placeholder={
                            "Example:\nMid 1 | 2026-09-10 | 2026-09-12\nEnd Semester | 2026-12-10 | 2026-12-20"
                          }
                          value={examText}
                          onChange={(e) => setExamText(e.target.value)}
                        />

                        <small>Format: Name | Start Date | End Date</small>
                      </div>

                      <div className="input-group">
                        <label>Holidays</label>

                        <textarea
                          placeholder={
                            "Example:\nDussehra | 2026-10-20 | 2026-10-22"
                          }
                          value={holidayText}
                          onChange={(e) => setHolidayText(e.target.value)}
                        />

                        <small>Format: Name | Start Date | End Date</small>
                      </div>
                    </div>

                    <button
                      className="primary-button"
                      onClick={handleGenerateSemester}
                      disabled={generatingSemester}
                    >
                      {generatingSemester
                        ? "Generating..."
                        : `Generate Semester ${currentSemester} Plan`}
                    </button>
                  </div>
                )}

                {/* GENERATING */}

                {generatingSemester && (
                  <LoaderView message="Generating semester roadmap..." />
                )}

                {/* JUST-GENERATED ROADMAP */}

                {currentSemesterRoadmap && (
                  <>
                    <SemesterDetails roadmap={currentSemesterRoadmap} />

                    <button
                      className="primary-button continue-button"
                      onClick={handleContinueToNext}
                    >
                      {currentSemester < totalSemesters
                        ? `Lock In & Continue to Semester ${
                            currentSemester + 1
                          } →`
                        : "Lock In Final Semester"}
                    </button>
                  </>
                )}
              </section>
            )}

            {/* ----------------------------------------------
                ALL SEMESTERS DONE
            ---------------------------------------------- */}

            {!currentSemester &&
              completedSemesters.length === totalSemesters &&
              totalSemesters > 0 && (
                <div className="roadmap-complete-banner">
                  🎉 You've completed every semester of your 4-year roadmap.
                  Your journey is fully mapped out!
                </div>
              )}
          </>
        )}
      </section>
    </div>
  );
}

/*
 * ========================================================
 * COMPLETED SEMESTER CARD (fixed / read-only)
 * ========================================================
 */

function CompletedSemesterCard({ semester, objective, expanded, onClick }) {
  return (
    <button
      className={`completed-semester-card ${expanded ? "expanded" : ""}`}
      onClick={onClick}
      title={objective || `Semester ${semester}`}
    >
      <span className="completed-check">✓</span>

      <strong>Semester {semester}</strong>

      <span className="chevron">{expanded ? "▲" : "▼"}</span>
    </button>
  );
}

/*
 * ========================================================
 * SEMESTER DETAILS
 * ========================================================
 */

function SemesterDetails({ roadmap }) {
  return (
    <div className="semester-content-wrapper">
      {/* ==================================================
          OBJECTIVE
      ================================================== */}

      <div className="objective-card">
        <span className="section-label">SEMESTER OBJECTIVE</span>

        <h2>{roadmap.semesterObjective}</h2>

        <p>{roadmap.roadmapSummary}</p>
      </div>

      {/* ==================================================
          WEEKLY PLAN
      ================================================== */}

      <section className="detail-section">
        <div className="section-heading">
          <div>
            <span className="section-label">WEEKLY PLAN</span>

            <h2>Build Progressively</h2>
          </div>
        </div>

        <div className="weekly-list">
          {roadmap.weeklyPlan?.map((week, index) => (
            <div className="week-card" key={index}>
              <div className="week-number">W{week.week}</div>

              <div className="week-main">
                <h3>{week.focus}</h3>

                <div className="week-columns">
                  <div>
                    <span>TOPICS</span>

                    <ul>
                      {week.topics?.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span>DSA</span>

                    <ul>
                      {week.dsa?.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span>PROJECT</span>

                    <ul>
                      {week.projectWork?.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="week-outcome">
                  <strong>Expected outcome:</strong> {week.expectedOutcome}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================================================
          DAILY PLAN
      ================================================== */}

      <section className="detail-section">
        <div className="section-heading">
          <div>
            <span className="section-label">DAILY PLAN</span>

            <h2>Your Day-by-Day Schedule</h2>
          </div>

          <span className="day-count">
            {roadmap.dailyPlan?.length || 0} Days
          </span>
        </div>

        <div className="daily-list">
          {roadmap.dailyPlan?.map((day, index) => (
            <div className={`day-card ${day.dayType}`} key={index}>
              <div className="day-date">
                <strong>{formatDate(day.date)}</strong>

                <span className={`day-badge ${day.dayType}`}>
                  {formatDayType(day.dayType)}
                </span>
              </div>

              <div className="day-hours">{day.availableHours}h</div>

              <div className="day-activities">
                {day.activities?.length > 0 && (
                  <div>
                    <span>CAREER WORK</span>

                    <ul>
                      {day.activities.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {day.dsa?.length > 0 && (
                  <div>
                    <span>DSA</span>

                    <ul>
                      {day.dsa.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {day.collegeWork?.length > 0 && (
                  <div>
                    <span>COLLEGE</span>

                    <ul>
                      {day.collegeWork.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {day.notes && <p className="day-note">{day.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================================================
          MILESTONES
      ================================================== */}

      {roadmap.milestones?.length > 0 && (
        <section className="detail-section">
          <div className="section-heading">
            <div>
              <span className="section-label">MILESTONES</span>

              <h2>What You Should Achieve</h2>
            </div>
          </div>

          <div className="milestones">
            {roadmap.milestones.map((milestone, index) => (
              <div className="milestone" key={index}>
                <div className="milestone-check">✓</div>

                <span>{milestone}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ==================================================
          FINAL OUTCOME
      ================================================== */}

      {roadmap.semesterOutcome && (
        <section className="outcome-card">
          <span className="section-label">SEMESTER OUTCOME</span>

          <h2>By the end of this semester...</h2>

          <p>{roadmap.semesterOutcome}</p>
        </section>
      )}
    </div>
  );
}

/*
 * ========================================================
 * HELPERS
 * ========================================================
 */

function formatDate(date) {
  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDayType(type) {
  const labels = {
    normal: "Normal",
    college_exam: "College Exam",
    pre_exam_break: "Pre-Exam Break",
    college_holiday: "College Holiday",
  };

  return labels[type] || type;
}
