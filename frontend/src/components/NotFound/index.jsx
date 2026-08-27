import { useLocation, useNavigate } from "react-router-dom";
import "./index.css";

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <main className="not-found-page">
      <div className="not-found-card">
        <p className="not-found-eyebrow">Route · 404</p>

        <svg
          className="not-found-route"
          viewBox="0 0 320 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <line
            x1="8"
            y1="32"
            x2="140"
            y2="32"
            className="not-found-route__solid"
          />
          <circle cx="8" cy="32" r="6" className="not-found-route__here" />

          <line
            x1="140"
            y1="32"
            x2="300"
            y2="32"
            className="not-found-route__dashed"
          />
          <circle cx="300" cy="32" r="11" className="not-found-route__end" />
          <text
            x="300"
            y="37"
            textAnchor="middle"
            className="not-found-route__mark"
          >
            ?
          </text>
        </svg>

        <div className="not-found-labels">
          <span className="not-found-label">You are here</span>
          <span className="not-found-label not-found-label--faint">
            Destination unknown
          </span>
        </div>

        <h1 className="not-found-title">This route doesn&apos;t exist</h1>
        <p className="not-found-copy">
          The page you're looking for isn't on the map. It may have moved, or
          the address might be off.
        </p>

        {location?.pathname && (
          <code className="not-found-path">{location.pathname}</code>
        )}

        <button
          type="button"
          className="not-found-btn"
          onClick={() => navigate("/")}
        >
          Go back home
        </button>
      </div>
    </main>
  );
};

export default NotFound;
