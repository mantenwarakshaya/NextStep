import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCheck,
  FaExclamationTriangle,
  FaLock,
  FaUser,
} from "react-icons/fa";
import "./index.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:7777";

const SEMESTERS = Array.from({ length: 8 }, (_, index) => index + 1);

export default function EditProfile() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("general");

  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    currentSemester: "1",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

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

      const profile = response.data?.user;

      if (!profile) {
        throw new Error("Profile not found.");
      }

      setUser(profile);

      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        currentSemester: String(profile.currentSemester || 1),
      });
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
          err.message ||
          "Could not load your profile."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ==================================================
     INITIAL LOAD
     ================================================== */

  useEffect(() => {
    getProfile();
  }, []);

  /* ==================================================
     INPUT CHANGE
     ================================================== */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrorMsg("");
    setSuccessMsg("");
  };

  /* ==================================================
     SEMESTER SELECT
     ================================================== */

  const handleSemesterSelect = (semester) => {
    setFormData((previous) => ({
      ...previous,
      currentSemester: String(semester),
    }));

    setErrorMsg("");
    setSuccessMsg("");
  };

  /* ==================================================
     SAVE PROFILE
     ================================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMsg("");
    setSuccessMsg("");

    if (!formData.firstName.trim()) {
      setErrorMsg("First name is required.");
      return;
    }

    if (!formData.lastName.trim()) {
      setErrorMsg("Last name is required.");
      return;
    }

    try {
      setSaving(true);

      const response = await axios.patch(
        `${API_BASE_URL}/api/profile/edit`,
        {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          currentSemester: Number(formData.currentSemester),
        },
        {
          withCredentials: true,
        }
      );

      const updatedUser = response.data?.user;

      if (updatedUser) {
        setUser(updatedUser);

        setFormData({
          firstName: updatedUser.firstName || "",
          lastName: updatedUser.lastName || "",
          currentSemester: String(
            updatedUser.currentSemester || 1
          ),
        });
      }

      setSuccessMsg("Profile updated successfully.");

      setTimeout(() => {
        navigate("/profile");
      }, 900);
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
          "Could not update your profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ==================================================
     INITIALS (for the identity mark in the header)
     ================================================== */

  const initials = [formData.firstName, formData.lastName]
    .map((part) => part.trim().charAt(0))
    .join("")
    .toUpperCase();

  /* ==================================================
     LOADING
     ================================================== */

  if (loading) {
    return (
      <main className="ep-workspace">
        <div className="ep-shell">
          <div className="ep-loading">
            <span className="ep-loading-dot" />
            <span className="ep-loading-dot" />
            <span className="ep-loading-dot" />
            Loading account settings…
          </div>
        </div>
      </main>
    );
  }

  /* ==================================================
     ERROR
     ================================================== */

  if (!user) {
    return (
      <main className="ep-workspace">
        <div className="ep-shell">
          <div className="ep-error-page">
            <FaExclamationTriangle />

            <h2>Unable to load profile</h2>

            <p>
              {errorMsg ||
                "Your profile could not be retrieved."}
            </p>

            <button
              type="button"
              className="ep-dark-btn"
              onClick={getProfile}
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  /* ==================================================
     RENDER
     ================================================== */

  return (
    <main className="ep-workspace">
      <div className="ep-shell">

        {/* ==================================================
            PAGE HEADER
            ================================================== */}

        <header className="ep-page-header">
          <div className="ep-header-title">
            <Link
              to="/profile"
              className="ep-back-btn"
              aria-label="Back to profile"
            >
              <FaArrowLeft />
            </Link>

            <div className="ep-header-copy">
              <div className="ep-avatar" aria-hidden="true">
                {initials || <FaUser size={14} />}
              </div>

              <div>
                <span className="ep-header-eyebrow">
                  Account
                </span>

                <h1>Account Settings</h1>

                <p>
                  Configure profile details, security, and account
                  status.
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* ==================================================
            SETTINGS LAYOUT
            ================================================== */}

        <div className="ep-settings-layout">

          {/* ==================================================
              VERTICAL SETTINGS NAVIGATION
              ================================================== */}

          <aside className="ep-settings-nav">
            <div className="ep-settings-nav-title">
              Settings
            </div>

            <nav aria-label="Account settings">

              <button
                type="button"
                className={`ep-tab ${
                  activeTab === "general" ? "active" : ""
                }`}
                onClick={() => {
                  setActiveTab("general");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
              >
                <span className="ep-tab-title">
                  General
                </span>

                <span className="ep-tab-description">
                  Personal information
                </span>
              </button>

              <button
                type="button"
                className={`ep-tab ${
                  activeTab === "security" ? "active" : ""
                }`}
                onClick={() => {
                  setActiveTab("security");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
              >
                <span className="ep-tab-title">
                  Security
                </span>

                <span className="ep-tab-description">
                  Account security
                </span>
              </button>

              <button
                type="button"
                className={`ep-tab ${
                  activeTab === "danger" ? "active" : ""
                }`}
                onClick={() => {
                  setActiveTab("danger");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
              >
                <span className="ep-tab-title">
                  Danger
                </span>

                <span className="ep-tab-description">
                  Account deletion
                </span>
              </button>

            </nav>
          </aside>

          {/* ==================================================
              CONTENT AREA
              ================================================== */}

          <div className="ep-content">

            {/* ==================================================
                GENERAL
                ================================================== */}

            {activeTab === "general" && (
              <section className="ep-panel">

                <div className="ep-panel-header">
                  <span className="ep-kicker">
                    PROFILE
                  </span>

                  <h2>Personal Information</h2>

                  <p>
                    Keep your basic profile information up to
                    date.
                  </p>
                </div>

                <form onSubmit={handleSubmit}>

                  <div className="ep-form-grid">

                    {/* FIRST NAME */}

                    <div className="ep-field">
                      <label htmlFor="firstName">
                        First Name
                      </label>

                      <div className="ep-input-wrapper">
                        <FaUser />

                        <input
                          id="firstName"
                          name="firstName"
                          type="text"
                          value={formData.firstName}
                          onChange={handleChange}
                          placeholder="Enter first name"
                          autoComplete="given-name"
                        />
                      </div>
                    </div>

                    {/* LAST NAME */}

                    <div className="ep-field">
                      <label htmlFor="lastName">
                        Last Name
                      </label>

                      <div className="ep-input-wrapper">
                        <FaUser />

                        <input
                          id="lastName"
                          name="lastName"
                          type="text"
                          value={formData.lastName}
                          onChange={handleChange}
                          placeholder="Enter last name"
                          autoComplete="family-name"
                        />
                      </div>
                    </div>

                    {/* SEMESTER — a progress track through the
                        8-term arc, rather than an arbitrary list */}

                    <div className="ep-field ep-semester-field">
                      <label htmlFor="semester-picker">
                        Current Semester
                      </label>

                      <div
                        className="ep-semester-picker"
                        id="semester-picker"
                        role="group"
                        aria-label="Current semester"
                      >
                        <div className="ep-semester-track">
                          {SEMESTERS.map((semester, index) => {
                            const current = Number(formData.currentSemester);
                            const filled = semester <= current;
                            const isCurrent = semester === current;

                            return (
                              <div
                                className="ep-semester-node-wrap"
                                key={semester}
                              >
                                <button
                                  type="button"
                                  className={`ep-semester-node ${
                                    filled ? "filled" : ""
                                  } ${isCurrent ? "current" : ""}`}
                                  aria-pressed={isCurrent}
                                  aria-label={`Semester ${semester}`}
                                  onClick={() =>
                                    handleSemesterSelect(semester)
                                  }
                                >
                                  {semester}
                                </button>

                                {index < SEMESTERS.length - 1 && (
                                  <span
                                    className={`ep-semester-connector ${
                                      semester < current ? "filled" : ""
                                    }`}
                                    aria-hidden="true"
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <p className="ep-semester-caption">
                          Currently in{" "}
                          <strong>
                            Semester {formData.currentSemester}
                          </strong>{" "}
                          of 8.
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* STATUS MESSAGE */}

                  <div aria-live="polite">
                    {errorMsg && (
                      <div className="ep-message ep-message-error">
                        <FaExclamationTriangle />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    {successMsg && (
                      <div className="ep-message ep-message-success">
                        <FaCheck />
                        <span>{successMsg}</span>
                      </div>
                    )}
                  </div>

                  {/* FORM FOOTER */}

                  <div className="ep-form-footer">
                    <Link
                      to="/profile"
                      className="ep-cancel-btn"
                    >
                      Cancel
                    </Link>

                    <button
                      type="submit"
                      className="ep-save-btn"
                      disabled={saving}
                    >
                      {saving
                        ? "Saving..."
                        : "Save Changes"}
                    </button>
                  </div>

                </form>
              </section>
            )}

            {/* ==================================================
                SECURITY
                ================================================== */}

            {activeTab === "security" && (
              <section className="ep-panel ep-simple-panel">

                <div className="ep-panel-header">
                  <div className="ep-security-heading">

                    <div className="ep-large-icon">
                      <FaLock />
                    </div>

                    <div>
                      <span className="ep-kicker">
                        ACCOUNT SECURITY
                      </span>

                      <h2>Security</h2>

                      <p>
                        Manage security-related settings for
                        your account.
                      </p>
                    </div>

                  </div>
                </div>

                <div className="ep-info-row">
                  <div>
                    <strong>Email Address</strong>
                    <span>{user.emailId}</span>
                  </div>

                  <span className="ep-status-badge">
                    Active
                  </span>
                </div>

                <div className="ep-info-row">
                  <div>
                    <strong>Password</strong>
                    <span>
                      Change your password to keep your account
                      secure.
                    </span>
                  </div>

                  <button
                    type="button"
                    className="ep-outline-btn"
                    disabled
                  >
                    Change Password
                  </button>
                </div>

                <div className="ep-security-note">
                  <FaLock />

                  <p>
                    Password management will be available once
                    the authentication flow supports it.
                  </p>
                </div>

              </section>
            )}

            {/* ==================================================
                DANGER
                ================================================== */}

            {activeTab === "danger" && (
              <section className="ep-panel ep-danger-panel">

                <div className="ep-panel-header">
                  <div className="ep-danger-heading">

                    <div className="ep-danger-icon">
                      <FaExclamationTriangle />
                    </div>

                    <div>
                      <span className="ep-kicker">
                        ACCOUNT
                      </span>

                      <h2>Danger Zone</h2>

                      <p>
                        Actions in this section may
                        permanently affect your account.
                      </p>
                    </div>

                  </div>
                </div>

                <div className="ep-danger-row">
                  <div>
                    <strong>Delete Account</strong>

                    <span>
                      Permanently remove your account and
                      associated profile data.
                    </span>
                  </div>

                  <button
                    type="button"
                    className="ep-delete-btn"
                    disabled
                  >
                    Delete Account
                  </button>
                </div>

                <p className="ep-danger-disabled">
                  <FaLock size={10} />
                  Account deletion is currently unavailable.
                </p>

              </section>
            )}

          </div>
        </div>
      </div>
    </main>
  );
}