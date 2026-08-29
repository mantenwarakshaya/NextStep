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
import { ErrorView, LoaderView } from "../../Common";
import "./index.css";

const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:7777"
    : "";
    
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
     PASSWORD (Security tab) — FIX: backend already
     exposes PATCH /profile/password; this was previously
     stubbed out and disabled in the UI for no reason.
     ================================================== */

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  /* ==================================================
     DELETE ACCOUNT (Danger tab) — FIX: backend already
     exposes DELETE /profile/delete (soft delete); this was
     previously stubbed out and disabled in the UI as well.
     ================================================== */

  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

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

    // FIX: the backend treats lastName as optional
    // (`lastName ? lastName.trim() : ""`), so requiring it here
    // rejected valid submissions the API would have accepted.

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
     PASSWORD CHANGE
     ================================================== */

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setPasswordError("");
    setPasswordSuccess("");
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    setPasswordError("");
    setPasswordSuccess("");

    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill out all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    try {
      setPasswordSaving(true);

      const response = await axios.patch(
        `${API_BASE_URL}/api/profile/password`,
        { currentPassword, newPassword, confirmPassword },
        { withCredentials: true }
      );

      setPasswordSuccess(
        response.data?.message || "Password updated successfully."
      );
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setPasswordError(
        err.response?.data?.message ||
          "Could not update your password. Please try again."
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  /* ==================================================
     DELETE ACCOUNT
     ================================================== */

  const handleDeleteAccount = async () => {
    setDeleteError("");

    if (deleteConfirmText.trim().toUpperCase() !== "DELETE") {
      setDeleteError('Type "DELETE" to confirm.');
      return;
    }

    try {
      setDeleting(true);

      await axios.delete(`${API_BASE_URL}/api/profile/delete`, {
        withCredentials: true,
      });

      // The backend clears the jwt_token cookie as part of this
      // request, so the session is already gone — send the user
      // to login rather than leaving them on a page that requires auth.
      navigate("/login", {
        replace: true,
        state: {
          message: "Your account has been deactivated. You can restore it within 7 days by logging in.",
        },
      });
    } catch (err) {
      setDeleteError(
        err.response?.data?.message ||
          "Could not delete your account. Please try again."
      );
    } finally {
      setDeleting(false);
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
    return <LoaderView message="Loading account settings..." />;
  }

  /* ==================================================
     ERROR
     ================================================== */

  if (!user) {
    return (
      <ErrorView
        message={errorMsg || "Your profile could not be retrieved."}
        onRetry={getProfile}
      />
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
                  setPasswordError("");
                  setPasswordSuccess("");
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
                  setDeleteError("");
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
                        Last Name{" "}
                        <span className="ep-optional-tag">(optional)</span>
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

                {/* FIX: wired up to PATCH /profile/password, which
                    already existed on the backend but was never
                    called from the UI. */}

                <form onSubmit={handlePasswordSubmit} className="ep-password-form">

                  <div className="ep-field">
                    <label htmlFor="currentPassword">Current Password</label>
                    <div className="ep-input-wrapper">
                      <FaLock />
                      <input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter current password"
                        autoComplete="current-password"
                      />
                    </div>
                  </div>

                  <div className="ep-field">
                    <label htmlFor="newPassword">New Password</label>
                    <div className="ep-input-wrapper">
                      <FaLock />
                      <input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="At least 8 characters, mixed case, number, symbol"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>

                  <div className="ep-field">
                    <label htmlFor="confirmPassword">Confirm New Password</label>
                    <div className="ep-input-wrapper">
                      <FaLock />
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Re-enter new password"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>

                  <div aria-live="polite">
                    {passwordError && (
                      <div className="ep-message ep-message-error">
                        <FaExclamationTriangle />
                        <span>{passwordError}</span>
                      </div>
                    )}

                    {passwordSuccess && (
                      <div className="ep-message ep-message-success">
                        <FaCheck />
                        <span>{passwordSuccess}</span>
                      </div>
                    )}
                  </div>

                  <div className="ep-form-footer">
                    <button
                      type="submit"
                      className="ep-save-btn"
                      disabled={passwordSaving}
                    >
                      {passwordSaving ? "Updating..." : "Update Password"}
                    </button>
                  </div>

                </form>

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

                {/* FIX: wired up to DELETE /profile/delete, which
                    already existed on the backend (soft delete with
                    a 7-day restore window) but was never called from
                    the UI. */}

                <div className="ep-danger-row">
                  <div>
                    <strong>Deactivate Account</strong>

                    <span>
                      Your account will be deactivated immediately.
                      You can restore it within 7 days by logging back in
                      with the restore flow — after that it's gone for good.
                    </span>
                  </div>
                </div>

                <div className="ep-field">
                  <label htmlFor="deleteConfirm">
                    Type <strong>DELETE</strong> to confirm
                  </label>
                  <div className="ep-input-wrapper">
                    <input
                      id="deleteConfirm"
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => {
                        setDeleteConfirmText(e.target.value);
                        setDeleteError("");
                      }}
                      placeholder="DELETE"
                    />
                  </div>
                </div>

                <div aria-live="polite">
                  {deleteError && (
                    <div className="ep-message ep-message-error">
                      <FaExclamationTriangle />
                      <span>{deleteError}</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="ep-delete-btn"
                  disabled={deleting || deleteConfirmText.trim().toUpperCase() !== "DELETE"}
                  onClick={handleDeleteAccount}
                >
                  {deleting ? "Deactivating..." : "Deactivate Account"}
                </button>

              </section>
            )}

          </div>
        </div>
      </div>
    </main>
  );
}