import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff, Lock, Mail, User, GraduationCap, Target } from "lucide-react";
import "./index.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:7777";

const getApiErrorMessage = (err, fallback = "Something went wrong. Please try again.") =>
  err?.response?.data?.message || err?.message || fallback;

const BRANCH_CAREER_GOALS = {
  "Computer Science Engineering": [
    "MERN Stack Developer",
    "Full-Stack Developer",
    "AI Engineer",
    "Data Scientist",
    "Cybersecurity Engineer",
    "Cloud / DevOps Engineer",
  ],
  "Information Technology": [
    "Full-Stack Developer",
    "Data Scientist",
    "Cybersecurity Engineer",
    "Cloud / DevOps Engineer",
    "QA Automation Engineer",
  ],
  "Electronics & Communication Engineering": [
    "Embedded Systems Engineer",
    "VLSI Design Engineer",
    "IoT Engineer",
    "Signal Processing Engineer",
  ],
  "Electrical & Electronics Engineering": [
    "Power Systems Engineer",
    "Control Systems Engineer",
    "Embedded Systems Engineer",
  ],
  "Mechanical Engineering": [
    "Design Engineer (CAD/CAM)",
    "Automotive Engineer",
    "Robotics Engineer",
    "Manufacturing / Production Engineer",
  ],
  "Civil Engineering": [
    "Structural Engineer",
    "Construction Manager",
    "Urban Planner",
    "Environmental Engineer",
  ],
};

const BRANCHES = Object.keys(BRANCH_CAREER_GOALS);
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function Signup({ onSignupSuccess }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    emailId: "",
    password: "",
    branch: "",
    careerGoal: "",
    currentSemester: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Reset career goal whenever branch changes, since options depend on branch
      ...(name === "branch" ? { careerGoal: "" } : {}),
    }));
    setErrorMsg("");
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      // Branch, career goal and semester are optional at signup — a student
      // who's only here to explore branches may not know any of these yet.
      // They stay unset (null) until picked from Branches Explorer / Dashboard.
      const payload = {
        firstName: formData.firstName,
        emailId: formData.emailId,
        password: formData.password,
        branch: formData.branch || null,
        careerGoal: formData.careerGoal || null,
        currentSemester: formData.currentSemester ? Number(formData.currentSemester) : null,
      };

      const response = await axios.post(`${API_BASE_URL}/api/signup`, payload, {
        withCredentials: true,
      });

      if (response.data?.user) {
        await onSignupSuccess?.();
        navigate("/dashboard", { replace: true });
        return;
      }

      navigate("/login", {
        replace: true,
        state: { message: "Account created successfully. Please sign in." },
      });
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err, "Signup failed. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const careerGoalOptions = formData.branch ? BRANCH_CAREER_GOALS[formData.branch] : [];

  return (
    <div className="signup-page">
      <aside className="signup-left">
        <div className="signup-left-content">
          <span className="signup-tag">NextStep</span>
          <h1>A semester-wise roadmap built around your goal.</h1>
          <p>
            Don't know your branch or career goal yet? Create an account and
            explore first — you can add them any time from your dashboard.
          </p>
        </div>
        <div className="signup-left-bg-glow" />
      </aside>

      <main className="signup-right">
        <div className="signup-card-container">
          <form onSubmit={handleSignup} className="signup-card">
            <div className="signup-header">
              <div className="logo-circle">N</div>
              <div className="signup-header-content">
                <h2>Create Account</h2>
                <p>Just a name, email, and password to get started.</p>
              </div>
            </div>

            {errorMsg && <div className="auth-alert error-box">{errorMsg}</div>}

            <div className="form-fields">
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
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-divider">
                <span>Optional — you can set these later</span>
              </div>

              {/* BRANCH SELECT (optional) */}
              <div className="form-group">
                <label htmlFor="branch">
                  Branch <span className="optional-tag">Optional</span>
                </label>
                <div className="input-box custom-select-box">
                  <GraduationCap size={18} className="input-icon" />
                  <select
                    id="branch"
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    disabled={isLoading}
                  >
                    <option value="">Not sure yet — I'll explore branches first</option>
                    {BRANCHES.map((branch) => (
                      <option key={branch} value={branch}>
                        {branch}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* CAREER GOAL SELECT (optional, depends on branch) */}
              <div className="form-group">
                <label htmlFor="careerGoal">
                  Career Goal <span className="optional-tag">Optional</span>
                </label>
                <div className="input-box custom-select-box">
                  <Target size={18} className="input-icon" />
                  <select
                    id="careerGoal"
                    name="careerGoal"
                    value={formData.careerGoal}
                    onChange={handleChange}
                    disabled={isLoading || !formData.branch}
                  >
                    <option value="">
                      {formData.branch ? "Not sure yet" : "Pick a branch first"}
                    </option>
                    {careerGoalOptions.map((goal) => (
                      <option key={goal} value={goal}>
                        {goal}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* CURRENT SEMESTER SELECT (optional) */}
              <div className="form-group">
                <label htmlFor="currentSemester">
                  Current Semester <span className="optional-tag">Optional</span>
                </label>
                <div className="input-box custom-select-box">
                  <select
                    id="currentSemester"
                    name="currentSemester"
                    value={formData.currentSemester}
                    onChange={handleChange}
                    disabled={isLoading}
                  >
                    <option value="">Not sure yet</option>
                    {SEMESTERS.map((sem) => (
                      <option key={sem} value={sem}>
                        Semester {sem}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button type="submit" className="signup-btn" disabled={isLoading}>
              {isLoading ? (
                <span className="btn-spinner-content">
                  <span className="spinner-dot" /> Creating Account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>

            <p className="signin-text">
              Already have an account? <Link to="/login">Sign In</Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}

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