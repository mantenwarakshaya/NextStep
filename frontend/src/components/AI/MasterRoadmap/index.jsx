import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../AuthProvider";
import { ErrorView, LoaderView } from "../../Common";
import {
  Code2,
  Cpu,
  Wrench,
  HardHat,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Map as MapIcon,
  Target,
  Search,
  X,
} from "lucide-react";
import "./index.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:7777";

const CATEGORY_ICONS = {
  "Computer Science & Engineering": Code2,
  Electronics: Cpu,
  Mechanical: Wrench,
  Civil: HardHat,
  "Other Specialized Branches": Sparkles,
};

const SEMESTER_KEYS = [
  "sem_1",
  "sem_2",
  "sem_3",
  "sem_4",
  "sem_5",
  "sem_6",
  "sem_7",
  "sem_8",
];

export default function Roadmap() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const effectiveBranch = user?.branch || null;

  if (!effectiveBranch) {
    return (
      <BranchSelection
        user={user}
        refreshUser={refreshUser}
        navigate={navigate}
      />
    );
  }

  if (!user?.careerGoal) {
    return (
      <CareerGoalSelection
        branchCode={effectiveBranch}
        refreshUser={refreshUser}
        navigate={navigate}
      />
    );
  }

  return (
    <YearRoadmapDisplay
      branchCode={effectiveBranch}
      careerGoal={user.careerGoal}
      specializations={user.specialization}
    />
  );
}

/* ============================================================
   STEP 3
   AI GENERATED 4-YEAR ROADMAP
   ============================================================ */

function YearRoadmapDisplay({ branchCode, careerGoal, specializations }) {
  const [branch, setBranch] = useState(null);
  const [roadmap, setRoadmap] = useState(null);

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadRoadmap = async () => {
      try {
        setLoading(true);
        setGenerating(false);
        setErrorMsg("");

        const specialization = Array.isArray(specializations)
          ? specializations[0] || ""
          : specializations || "";

        /*
         * First get branch information.
         */
        const branchRes = await axios.get(
          `${API_BASE_URL}/api/branches/code/${encodeURIComponent(branchCode)}`,
          {
            withCredentials: true,
          },
        );

        if (cancelled) return;

        setBranch(branchRes.data);

        /*
         * IMPORTANT:
         *
         * We first check whether this student already has
         * a generated roadmap.
         *
         * This prevents Gemini from being called every time
         * the page is opened/refreshed.
         */
        try {
          const latestRes = await axios.get(`${API_BASE_URL}/api/roadmap/`, {
            params: {
              branch: branchCode,
              careerGoal,
              specialization,
            },
            withCredentials: true,
          });

          if (latestRes.data?.success && latestRes.data?.data) {
            if (!cancelled) {
              setRoadmap(latestRes.data.data);
              setLoading(false);
            }

            return;
          }
        } catch (latestError) {
          if (latestError.response?.status !== 404) {
            throw latestError;
          }
        }

        /*
         * No existing roadmap.
         *
         * Now ask Gemini to generate one.
         */
        if (cancelled) return;

        setLoading(false);
        setGenerating(true);

        const generateRes = await axios.post(
          `${API_BASE_URL}/api/roadmap/generate`,
          {
            branch: branchCode,
            careerGoal,
            specialization,
          },
          {
            withCredentials: true,
          },
        );

        if (cancelled) return;

        if (generateRes.data?.success && generateRes.data?.data) {
          setRoadmap(generateRes.data.data);
        } else {
          throw new Error("Invalid roadmap response from server.");
        }
      } catch (err) {
        if (cancelled) return;

        console.error("❌ Roadmap loading/generation error:", err);

        setErrorMsg(
          err.response?.data?.message ||
            err.response?.data?.error ||
            err.message ||
            "Could not generate your roadmap. Please try again.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
          setGenerating(false);
        }
      }
    };

    loadRoadmap();

    return () => {
      cancelled = true;
    };
  }, [branchCode, careerGoal, specializations]);

  /*
   * Initial branch/roadmap loading.
   */
  if (loading) {
    return <LoaderView message="Preparing your roadmap..." />;
  }

  /*
   * Gemini is generating.
   */
  if (generating) {
    return <LoaderView message="AI is building your 4-year career roadmap..." />;
  }

  /*
   * Error state.
   */
  if (errorMsg || !branch || !roadmap) {
    return (
      <ErrorView
        message={errorMsg || "Roadmap could not be generated."}
        onRetry={() => window.location.reload()}
      />
    );
  }

  /*
   * Generated roadmap.
   *
   * Your backend response is:
   *
   * {
   *   data: {
   *      branch,
   *      careerGoal,
   *      specialization,
   *      roadmap: {
   *         sem_1: "...",
   *         ...
   *      }
   *   }
   * }
   */

  const roadmapData = Array.isArray(roadmap?.semesters)
    ? roadmap.semesters
    : Array.isArray(roadmap?.roadmap)
      ? roadmap.roadmap
      : [];

  const specializationText = Array.isArray(roadmap?.specialization)
    ? roadmap.specialization.join(", ")
    : roadmap?.specialization || "";

  return (
    <div className="sr-root">
      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="sr-header">
        <span className="sr-eyebrow">
          <MapIcon size={13} />
          {branch.category}
        </span>

        <h1>{roadmap.careerGoal || careerGoal}</h1>

        <p>Your 4-year career roadmap from beginner to placement.</p>

        {specializationText && (
          <div className="sr-specialization">
            <Sparkles size={14} />
            Specialization: <strong>{specializationText}</strong>
          </div>
        )}
      </header>

      {/* ==================================================
          SEMESTER ROADMAP
      ================================================== */}

      <div className="sr-track">
        <div className="sr-rail" />

        {roadmapData.map((semesterItem, i) => {
          const semesterNumber = semesterItem?.semester || i + 1;
          const skills = Array.isArray(semesterItem?.skills)
            ? semesterItem.skills
            : [];
          const topics = Array.isArray(semesterItem?.topics)
            ? semesterItem.topics
            : [];
          const objective = semesterItem?.objective || "";

          return (
            <div className="sr-stop" key={`semester-${semesterNumber}`}>
              <div className="sr-node" />

              <div className="sr-card">
                <span className="sr-card-ghost-num" aria-hidden="true">
                  {String(semesterNumber).padStart(2, "0")}
                </span>

                <h3>Semester {semesterNumber}</h3>

                {objective && (
                  <p className="sr-semester-objective">{objective}</p>
                )}

                {skills.length === 0 && topics.length === 0 ? (
                  <p className="sr-tags-empty">Roadmap details coming soon.</p>
                ) : (
                  <>
                    {skills.length > 0 && (
                      <div className="sr-tags-group">
                        <span className="sr-tags-label">Skills</span>
                        <div className="sr-tags-row">
                          {skills.map((skill) => (
                            <span key={skill} className="sr-tag sr-tag-skill">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {topics.length > 0 && (
                      <div className="sr-tags-group">
                        <span className="sr-tags-label">Topics</span>
                        <div className="sr-tags-row">
                          {topics.map((topic) => (
                            <span key={topic} className="sr-tag sr-tag-topic">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   STEP 2
   CAREER GOAL SELECTION
   ============================================================ */

function CareerGoalSelection({ branchCode, refreshUser, navigate }) {
  const [branch, setBranch] = useState(null);
  const [allBranches, setAllBranches] = useState([]);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [picked, setPicked] = useState(null);
  const [otherQuery, setOtherQuery] = useState("");

  const [specializations, setSpecializations] = useState([]);

  const [specQuery, setSpecQuery] = useState("");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [branchRes, allRes] = await Promise.all([
          axios.get(
            `${API_BASE_URL}/api/branches/code/${encodeURIComponent(
              branchCode,
            )}`,
            {
              withCredentials: true,
            },
          ),

          axios.get(`${API_BASE_URL}/api/branches`),
        ]);

        setBranch(branchRes.data);

        setAllBranches(Array.isArray(allRes.data) ? allRes.data : []);
      } catch (err) {
        setErrorMsg(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Could not load career options. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [branchCode]);

  const careerPaths = branch?.career_paths?.length
    ? branch.career_paths
    : (branch?.career_opportunities || []).map((c) => ({
        career: c,
        why_it_fits: "",
      }));

  /*
   * All career options from all branches.
   */
  const allCareerOptions = useMemo(() => {
    const opts = [];

    allBranches.forEach((b) => {
      const paths = b.career_paths?.length
        ? b.career_paths.map((cp) => cp.career)
        : b.career_opportunities || [];

      paths.forEach((career) => {
        if (career) {
          opts.push({
            career,
            branch_name: b.branch_name,
            branch_code: b.branch_code,
          });
        }
      });
    });

    return opts;
  }, [allBranches]);

  /*
   * Search careers from other branches.
   */
  const otherMatches = useMemo(() => {
    if (!otherQuery.trim()) return [];

    const q = otherQuery.trim().toLowerCase();

    const seen = new Set();
    const out = [];

    for (const o of allCareerOptions) {
      if (o.branch_code === branch?.branch_code) {
        continue;
      }

      const key = o.career.toLowerCase();

      if (seen.has(key) || !key.includes(q)) {
        continue;
      }

      seen.add(key);
      out.push(o);

      if (out.length >= 8) break;
    }

    return out;
  }, [otherQuery, allCareerOptions, branch]);

  /*
   * Specialization search.
   */
  const specMatches = useMemo(() => {
    if (!specQuery.trim()) return [];

    const q = specQuery.trim().toLowerCase();

    const seen = new Set();

    return allCareerOptions
      .filter((option) => {
        const key = option.career.toLowerCase();

        if (
          seen.has(key) ||
          !key.includes(q) ||
          specializations.includes(option.career)
        ) {
          return false;
        }

        seen.add(key);

        return true;
      })
      .slice(0, 8);
  }, [specQuery, allCareerOptions, specializations]);

  const addSpecialization = (career) => {
    if (specializations.length >= 3 || specializations.includes(career)) {
      return;
    }

    setSpecializations((prev) => [...prev, career]);

    setSpecQuery("");
  };

  const removeSpecialization = (career) => {
    setSpecializations((prev) => prev.filter((s) => s !== career));
  };

  /*
   * Save career goal.
   *
   * IMPORTANT:
   * We do NOT generate Gemini here.
   *
   * After saving, Roadmap.jsx moves to
   * YearRoadmapDisplay.
   *
   * YearRoadmapDisplay checks for an existing
   * roadmap and generates one if necessary.
   */
  const handleConfirm = async () => {
    if (!picked) return;

    try {
      setSaving(true);
      setErrorMsg("");

      await axios.patch(
        `${API_BASE_URL}/api/profile/career-goal`,
        {
          careerGoal: picked,
          specialization: specializations,
        },
        {
          withCredentials: true,
        },
      );

      if (typeof refreshUser === "function") {
        await refreshUser();
      }

      navigate(`/roadmap/${encodeURIComponent(branchCode)}`, {
        replace: true,
      });
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
          "Could not save your career goal. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoaderView message="Loading career options..." />;
  }

  if (errorMsg && !branch) {
    return <ErrorView message={errorMsg} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="bs-root">
      <header className="bs-header">
        <span className="bs-eyebrow">Step 2 of 2 · career goal</span>

        <h1>What's your goal in {branch?.branch_name}?</h1>

        <p>
          Pick the career path you're aiming for — or search for something
          outside {branch?.branch_name} entirely.
        </p>
      </header>

      {errorMsg && <div className="bs-error">{errorMsg}</div>}

      <div className="bs-groups">
        {/* ==================================================
            CAREER PATHS
        ================================================== */}

        <section className="bs-group">
          <div className="bs-group-header">
            <span className="bs-group-icon">
              <Target size={14} />
            </span>

            <h2>Career paths in {branch?.branch_name}</h2>
          </div>

          <div className="bs-grid">
            {careerPaths.map((cp, index) => {
              const isPicked = picked === cp.career;

              return (
                <button
                  type="button"
                  key={`${cp.career}-${index}`}
                  className={`bs-card ${isPicked ? "picked" : ""}`}
                  onClick={() => setPicked(cp.career)}
                >
                  {isPicked && (
                    <CheckCircle2 size={16} className="bs-card-check" />
                  )}

                  <h3>{cp.career}</h3>

                  {cp.why_it_fits && <p>{cp.why_it_fits}</p>}
                </button>
              );
            })}
          </div>
        </section>

        {/* ==================================================
            OTHER CAREERS
        ================================================== */}

        <section className="bs-group">
          <div className="bs-group-header">
            <span className="bs-group-icon">
              <Search size={14} />
            </span>

            <h2>Looking for something else?</h2>
          </div>

          <input
            type="text"
            className="bs-search-input"
            placeholder="e.g. MERN Stack Developer, UI/UX Designer…"
            value={
              picked && !careerPaths.some((cp) => cp.career === picked)
                ? picked
                : otherQuery
            }
            onChange={(e) => {
              setOtherQuery(e.target.value);

              if (picked && !careerPaths.some((cp) => cp.career === picked)) {
                setPicked(null);
              }
            }}
          />

          {otherQuery.trim() && (
            <div className="bs-search-results">
              {otherMatches.length === 0 && (
                <p className="bs-search-empty">No matching career found.</p>
              )}

              {otherMatches.map((o, index) => (
                <button
                  type="button"
                  key={`${o.branch_code}-${o.career}-${index}`}
                  className={`bs-search-item ${
                    picked === o.career ? "picked" : ""
                  }`}
                  onClick={() => {
                    setPicked(o.career);

                    setOtherQuery(o.career);
                  }}
                >
                  <span>{o.career}</span>

                  <span className="bs-search-badge">{o.branch_name}</span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ==================================================
            SPECIALIZATION
        ================================================== */}

        <section className="bs-group">
          <div className="bs-group-header">
            <span className="bs-group-icon">
              <Sparkles size={14} />
            </span>

            <h2>Add a specialization (optional)</h2>
          </div>

          {specializations.length > 0 && (
            <div className="bs-chip-row">
              {specializations.map((s) => (
                <span className="bs-chip" key={s}>
                  {s}

                  <button
                    type="button"
                    onClick={() => removeSpecialization(s)}
                    aria-label={`Remove ${s}`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {specializations.length < 3 && (
            <>
              <input
                type="text"
                className="bs-search-input"
                placeholder="e.g. AI, Cybersecurity, Cloud…"
                value={specQuery}
                onChange={(e) => setSpecQuery(e.target.value)}
              />

              {specQuery.trim() && (
                <div className="bs-search-results">
                  {specMatches.length === 0 && (
                    <p className="bs-search-empty">No matching option found.</p>
                  )}

                  {specMatches.map((o, index) => (
                    <button
                      type="button"
                      key={`${o.branch_code}-${o.career}-${index}`}
                      className="bs-search-item"
                      onClick={() => addSpecialization(o.career)}
                    >
                      <span>{o.career}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* ==================================================
          CONFIRM
      ================================================== */}

      <div className={`bs-confirm-bar ${picked ? "visible" : ""}`}>
        <span>
          Selected: <strong>{picked || "—"}</strong>
          {specializations.length > 0 && <> + {specializations.join(", ")}</>}
        </span>

        <button
          type="button"
          className="bs-confirm-btn"
          onClick={handleConfirm}
          disabled={!picked || saving}
        >
          {saving ? "Saving…" : "Continue"}
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   STEP 1
   BRANCH SELECTION
   ============================================================ */

function BranchSelection({ user, refreshUser, navigate }) {
  const [branches, setBranches] = useState([]);

  const [loading, setLoading] = useState(true);

  const [errorMsg, setErrorMsg] = useState("");

  const [picked, setPicked] = useState(null);

  const [confirming, setConfirming] = useState(false);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoading(true);

        const res = await axios.get(`${API_BASE_URL}/api/branches`);

        setBranches(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setErrorMsg(
          err.response?.data?.error ||
            "Could not load branches. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);

  const grouped = useMemo(() => {
    const buckets = {};

    branches.forEach((b) => {
      const cat = b.category || "Other";

      (buckets[cat] ||= []).push(b);
    });

    return Object.entries(buckets);
  }, [branches]);

  const pickedBranch = branches.find((b) => b.branch_code === picked);

  const handleConfirm = async () => {
    if (!picked) return;

    try {
      setSaving(true);
      setErrorMsg("");

      await axios.patch(
        `${API_BASE_URL}/api/profile/branch`,
        {
          branch: picked,
        },
        {
          withCredentials: true,
        },
      );

      if (typeof refreshUser === "function") {
        await refreshUser();
      }

      navigate(`/roadmap/${encodeURIComponent(picked)}`, {
        replace: true,
      });
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
          "Could not save your branch. Please try again.",
      );

      setConfirming(false);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoaderView message="Loading branches..." />;
  }

  return (
    <div className="bs-root">
      <header className="bs-header">
        <span className="bs-eyebrow">Step 1 of 2 · one-time choice</span>

        <h1>Pick your branch</h1>

        <p>
          Choose the branch you're actually studying. Once confirmed, this can't
          be changed — next you'll pick a career goal, and we'll build your AI
          roadmap around both.
        </p>
      </header>

      {errorMsg && <div className="bs-error">{errorMsg}</div>}

      <div className="bs-groups">
        {grouped.map(([category, items]) => {
          const Icon = CATEGORY_ICONS[category] || Sparkles;

          return (
            <section className="bs-group" key={category}>
              <div className="bs-group-header">
                <span className="bs-group-icon">
                  <Icon size={14} />
                </span>

                <h2>{category}</h2>
              </div>

              <div className="bs-grid">
                {items.map((b) => {
                  const isPicked = picked === b.branch_code;

                  return (
                    <button
                      type="button"
                      key={b.branch_code}
                      className={`bs-card ${isPicked ? "picked" : ""}`}
                      onClick={() => setPicked(b.branch_code)}
                    >
                      {isPicked && (
                        <CheckCircle2 size={16} className="bs-card-check" />
                      )}

                      <h3>{b.branch_name}</h3>

                      <p>{b.simple_explanation || b.about}</p>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <div className={`bs-confirm-bar ${picked ? "visible" : ""}`}>
        <span>
          Selected: <strong>{pickedBranch?.branch_name || "—"}</strong>
        </span>

        <button
          type="button"
          className="bs-confirm-btn"
          onClick={() => setConfirming(true)}
          disabled={!picked}
        >
          Confirm branch
        </button>
      </div>

      {confirming && (
        <div
          className="bs-modal-overlay"
          onClick={() => !saving && setConfirming(false)}
        >
          <div
            className="bs-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <AlertTriangle size={22} className="bs-modal-icon" />

            <h2>This can't be undone</h2>

            <p>
              You're about to lock in{" "}
              <strong>{pickedBranch?.branch_name}</strong> as your branch. You
              won't be able to change it later.
            </p>

            <div className="bs-modal-actions">
              <button
                type="button"
                className="bs-modal-cancel"
                onClick={() => setConfirming(false)}
                disabled={saving}
              >
                Go back
              </button>

              <button
                type="button"
                className="bs-modal-confirm"
                onClick={handleConfirm}
                disabled={saving}
              >
                {saving ? "Saving…" : "Yes, lock it in"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
