import { useState } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import "./index.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://nextstep-bflm.onrender.com";

const getApiErrorMessage = (
  err,
  fallback = "Something went wrong. Please try again.",
) => err?.response?.data?.message || err?.message || fallback;

const isAccountDeactivated = (err) =>
  err?.response?.data?.code === "ACCOUNT_DEACTIVATED" ||
  err?.response?.data?.message?.toLowerCase().includes("deactivated");

export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ emailId: "", password: "" });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState(location.state?.message || "");
  const [isLoading, setIsLoading] = useState(false);
  const [showRestore, setShowRestore] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    setShowRestore(false);

    try {
      await axios.post(`${API_BASE_URL}/api/login`, formData, {
        withCredentials: true,
      });

      if (typeof onLoginSuccess === "function") {
        await onLoginSuccess();
      }

      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg = getApiErrorMessage(
        err,
        "Sign in failed. Please check your credentials.",
      );
      setErrorMsg(msg);
      setShowRestore(isAccountDeactivated(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreAccount = async () => {
    if (!formData.emailId || !formData.password) {
      setErrorMsg("Enter your email and password to restore the account.");
      return;
    }

    setIsRestoring(true);
    setErrorMsg("");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/restore-account`,
        formData,
      );
      setShowRestore(false);
      setSuccessMsg(
        response.data?.message || "Account restored. You can sign in now.",
      );
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
          "Account restoration failed. Please try again.",
      );
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="login-page">
      <aside className="login-left">
        <div className="login-left-content">
          <span className="login-tag">NextStep</span>
          <h1>Pick up your roadmap where you left off.</h1>
          <p>
            Track your semester-wise plan, follow your specialization line, and
            stay aligned with the career goal you set.
          </p>
        </div>
        <div className="login-left-bg-glow" />
      </aside>

      <main className="login-right">
        <div className="login-card-container">
          <form onSubmit={handleLogin} className="login-card">
            <div className="login-header">
              <div className="logo-circle">N</div>
              <div>
                <h2>Welcome Back</h2>
                <p>Sign in to continue your NextStep roadmap.</p>
              </div>
            </div>

            {errorMsg && <div className="auth-alert error-box">{errorMsg}</div>}
            {successMsg && (
              <div className="auth-alert success-box">{successMsg}</div>
            )}

            {showRestore && (
              <div className="restore-box">
                <div className="restore-header">
                  <span className="restore-dot" />
                  <strong>Account Deactivated</strong>
                </div>
                <p>You can restore it within the 7-day recovery window.</p>
                <button
                  type="button"
                  className="restore-btn"
                  onClick={handleRestoreAccount}
                  disabled={isRestoring}
                >
                  {isRestoring ? "Restoring Account..." : "Restore Account"}
                </button>
              </div>
            )}

            <div className="form-fields">
              <div className="form-group">
                <label htmlFor="emailId">Email Address</label>
                <div className="input-box">
                  <Mail size={18} className="input-icon" />
                  <input
                    id="emailId"
                    type="email"
                    name="emailId"
                    placeholder="name@college.edu"
                    value={formData.emailId}
                    onChange={handleChange}
                    disabled={isLoading || isRestoring}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-box">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading || isRestoring}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="login-btn"
              disabled={isLoading || isRestoring}
            >
              {isLoading ? (
                <span className="btn-spinner-content">
                  <span className="spinner-dot" /> Authenticating...
                </span>
              ) : (
                "Sign In"
              )}
            </button>

            <p className="signup-text">
              New to NextStep? <Link to="/signup">Create account</Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
