import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import "./index.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:7777";

const getApiErrorMessage = (
  err,
  fallback = "Something went wrong. Please try again.",
) => err?.response?.data?.message || err?.message || fallback;

export default function Signup({ onSignupSuccess }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    emailId: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrorMsg("");
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setErrorMsg("");

    try {
      const payload = {
        firstName: formData.firstName.trim(),
        emailId: formData.emailId.trim(),
        password: formData.password,
      };

      const response = await axios.post(`${API_BASE_URL}/api/signup`, payload, {
        withCredentials: true,
      });

      if (response.data?.user) {
        await onSignupSuccess?.();

        navigate("/dashboard", {
          replace: true,
        });

        return;
      }

      navigate("/login", {
        replace: true,
        state: {
          message: "Account created successfully. Please sign in.",
        },
      });
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err, "Signup failed. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-page">
      {/* ================= LEFT SIDE ================= */}

      <aside className="signup-left">
        <div className="signup-left-content">
          <span className="signup-tag">NextStep</span>

          <h1>A 4-year roadmap built around your goal.</h1>

          <p>
            Create your account first. After you sign in, we'll help you choose
            your branch and career goal, then generate a personalized roadmap
            for your journey.
          </p>
        </div>

        <div className="signup-left-bg-glow" />
      </aside>

      {/* ================= RIGHT SIDE ================= */}

      <main className="signup-right">
        <div className="signup-card-container">
          <form onSubmit={handleSignup} className="signup-card">
            {/* HEADER */}

            <div className="signup-header">
              <div className="logo-circle">N</div>

              <div className="signup-header-content">
                <h2>Create Account</h2>

                <p>Just a name, email, and password to get started.</p>
              </div>
            </div>

            {/* ERROR */}

            {errorMsg && <div className="auth-alert error-box">{errorMsg}</div>}

            {/* FORM */}

            <div className="form-fields">
              {/* FIRST NAME */}

              <Field
                id="firstName"
                icon={<User size={18} className="input-icon" />}
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Akshaya"
                disabled={isLoading}
                autoComplete="given-name"
                required
              />

              {/* EMAIL */}

              <Field
                id="emailId"
                icon={<Mail size={18} className="input-icon" />}
                label="Email Address"
                name="emailId"
                type="email"
                value={formData.emailId}
                onChange={handleChange}
                placeholder="name@college.edu"
                disabled={isLoading}
                autoComplete="email"
                required
              />

              {/* PASSWORD */}

              <div className="form-group">
                <label htmlFor="password">Password</label>

                <div className="input-box">
                  <Lock size={18} className="input-icon" />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 8 characters"
                    disabled={isLoading}
                    autoComplete="new-password"
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

            {/* CREATE ACCOUNT */}

            <button type="submit" className="signup-btn" disabled={isLoading}>
              {isLoading ? (
                <span className="btn-spinner-content">
                  <span className="spinner-dot" />
                  Creating Account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>

            {/* LOGIN */}

            <p className="signin-text">
              Already have an account? <Link to="/login">Sign In</Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}

/* =====================================================
   REUSABLE INPUT FIELD
===================================================== */

function Field({ icon, label, id, name, ...props }) {
  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>

      <div className="input-box">
        {icon}

        <input id={id} name={name} {...props} />
      </div>
    </div>
  );
}
