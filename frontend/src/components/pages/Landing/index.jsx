import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './index.css';

const LINES = {
  mern:  { color: '#2c9e93', dim: '#dff0ee', role: 'MERN Stack Developer', s5: 'MERN Specialization' },
  ai:    { color: '#7c6fd6', dim: '#e9e6fa', role: 'AI Engineer',           s5: 'AI Specialization' },
  ds:    { color: '#d9a441', dim: '#f8ecd6', role: 'Data Scientist',        s5: 'Data Science Track' },
  cyber: { color: '#e0665f', dim: '#fbe4e2', role: 'Cybersecurity Engineer',s5: 'Security Specialization' }
};

const SEMESTERS = [
  { label: 'Sem 1', focus: 'Programming fundamentals, communication, maths, computer basics' },
  { label: 'Sem 2', focus: 'HTML, CSS, JavaScript, problem-solving, mini projects' },
  { label: 'Sem 3', focus: 'Data structures, databases, OOP, Git' },
  { label: 'Sem 4', focus: 'React, Node.js, backend basics, advanced DSA' },
  { label: 'Sem 5', focus: '__SPECIALIZATION__' },
  { label: 'Sem 6', focus: 'Industry projects, internship prep, aptitude, coding practice' },
  { label: 'Sem 7', focus: 'Internships, mock interviews, resume building, placement prep' },
  { label: 'Sem 8', focus: 'Final-year project, job applications, career guidance' }
];

export default function NextStepApp() {
  const [activeLine, setActiveLine] = useState('mern');
  const line = LINES[activeLine];

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--active', line.color);
    root.style.setProperty('--active-dim', line.dim);
  }, [activeLine, line.color, line.dim]);

  // Smooth-scroll to the section matching the URL hash, and re-run on hash changes
  useEffect(() => {
    const scrollToHash = () => {
      const id = window.location.hash.replace('#', '');
      if (!id) return;
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    scrollToHash(); // handle case where page loads directly on a hash URL
    window.addEventListener('hashchange', scrollToHash);
    return () => window.removeEventListener('hashchange', scrollToHash);
  }, []);

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <div className="nav-brand"><span className="dot" id="navDot"></span>NextStep</div>
          <div className="nav-links">
            <a href="#problem">Why it exists</a>
            <a href="#roadmap">Roadmap</a>
            <a href="#board">Features</a>
            <a href="#how">How it works</a>
          </div>
          <Link to="/signup" className="nav-cta">Start free</Link>
        </div>
      </nav>

      <header className="hero">
        <div className="wrap hero-grid">
          <div>
            <div className="eyebrow-tag">Built for post-intermediate students</div>
            <h1>Pick a branch with your eyes open. Then follow <em>{line.role.toLowerCase()}</em> to the end.</h1>
            <p className="lede">NextStep turns "which branch should I take?" into a semester-by-semester road map — matched to your curriculum, not a generic checklist.</p>
            <div className="hero-actions">
              <Link to="/signup" className="btn btn-solid">Plan my road map →</Link>
              <a href="#roadmap" className="btn btn-outline">See the map</a>
            </div>
            <div className="hero-stats">
              <div><b>6+</b><span>Branches covered</span></div>
              <div><b>8</b><span>Semesters mapped</span></div>
              <div><b>4</b><span>Specialization lines</span></div>
            </div>
          </div>

          <div className="mini-map">
            <div className="mini-map-head">
              <span className="mono">Road map preview</span>
              <span className="mini-map-role">{line.role}</span>
            </div>
            <svg className="mini-svg" viewBox="0 0 400 90">
              <line x1="20" y1="45" x2="380" y2="45" className="track"/>
              <line x1="20" y1="45" x2="200" y2="45" className="track-active"/>
              {[20, 71.4, 122.8, 174.2, 225.6, 277, 328.4, 380].map((x, i) => (
                <g key={i}>
                  <circle
                    cx={x}
                    cy={45}
                    r={6}
                    className={`stop ${i < 4 ? 'done' : i === 4 ? 'now' : ''}`}
                  />
                  <text x={x} y={68} textAnchor="middle">S{i + 1}</text>
                </g>
              ))}
            </svg>
            <div className="mini-map-foot">
              <span>Semester 4 — React &amp; Node.js in progress</span>
              <span className="pct">50%</span>
            </div>
          </div>
        </div>
      </header>

      <div className="vh-screen">
        <section className="block problem" id="problem">
          <div className="wrap problem-inner">
            <div className="problem-mark">?</div>
            <div>
              <div className="section-tag">The problem</div>
              <p>Right after intermediate education, students and parents pick a branch with almost no structured guidance — no clear picture of the subjects, the skills, or where the branch actually leads.</p>
              <p>That mismatch shows up two years later: disengaged coursework, a widening gap between what's taught and what the industry expects, and a career that never quite lines up with the choice that was made at eighteen.</p>
            </div>
          </div>
        </section>

        <section className="block branches" id="branches">
          <div className="wrap">
            <div className="section-head">
              <div className="section-tag">Start here</div>
              <h2>Explore every branch before you commit to one.</h2>
              <p>Each branch has a plain-language overview, plus a "View more" for core subjects, required skills, higher-study paths, and job outcomes.</p>
            </div>
            <div className="branch-row">
              <div className="branch-chip"><span className="num">01</span>Computer Science &amp; Engineering</div>
              <div className="branch-chip"><span className="num">02</span>Electronics &amp; Communication</div>
              <div className="branch-chip"><span className="num">03</span>Mechanical Engineering</div>
              <div className="branch-chip"><span className="num">04</span>Electrical Engineering</div>
              <div className="branch-chip"><span className="num">05</span>Civil Engineering</div>
              <div className="branch-chip"><span className="num">06</span>Information Technology</div>
            </div>
          </div>
        </section>
      </div>

      <section className="block roadmap" id="roadmap">
        <div className="wrap">
          <div className="section-head">
            <div className="section-tag">The route</div>
            <h2>One branch, four possible lines. Pick where CSE takes you.</h2>
            <p>Choose a career goal and the same eight semesters re-route around it — semester 5 is where your line branches off.</p>
          </div>

          <div className="line-select" id="lineSelect">
            {Object.entries(LINES).map(([key, val]) => (
              <div
                key={key}
                className={`line-pill ${activeLine === key ? 'active' : ''}`}
                onClick={() => setActiveLine(key)}
              >
                <span className="swatch" style={{ background: val.color }}></span>
                {val.role}
              </div>
            ))}
          </div>

          <div className="trackmap">
            <div className="trackmap-rail"><div className="trackmap-rail-fill"></div></div>
            <div className="stations" id="stations">
              {SEMESTERS.map((s, i) => {
                const focus = s.focus === '__SPECIALIZATION__' ? line.s5 : null;
                return (
                  <div className="station" key={i}>
                    <div className="node">{i + 1}</div>
                    <div className="s-label">{s.label}</div>
                    <div className="s-focus">
                      {focus ? <b>{focus}</b> : s.focus}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="block board" id="board">
        <div className="wrap">
          <div className="section-head">
            <div className="section-tag">On every semester</div>
            <h2>What shows up on your board each term.</h2>
            <p>Not a static PDF — the board updates as your curriculum and career goal do.</p>
          </div>
          <div className="board-list">
            <div className="board-row"><span className="code">SUBJ</span><span className="desc">Subject recommendations<small>Pulled from your uploaded curriculum, not a generic syllabus</small></span><span className="status">Active</span></div>
            <div className="board-row"><span className="code">SKIL</span><span className="desc">Supplementary skills<small>Matched to the specific role you're aiming for</small></span><span className="status">Active</span></div>
            <div className="board-row"><span className="code">TRGT</span><span className="desc">Weekly &amp; monthly targets<small>Broken down so no semester feels like a guess</small></span><span className="status">Active</span></div>
            <div className="board-row"><span className="code">PROJ</span><span className="desc">Projects &amp; certifications<small>Chosen to build a portfolio, not just a transcript</small></span><span className="status">Active</span></div>
            <div className="board-row"><span className="code">PREP</span><span className="desc">Coding practice &amp; interview prep<small>Ramps up automatically from semester 6 onward</small></span><span className="status">Active</span></div>
            <div className="board-row"><span className="code">PLCE</span><span className="desc">Internship &amp; placement guidance<small>Resume, mock interviews, and applications</small></span><span className="status">Active</span></div>
          </div>
        </div>
      </section>

      <div className="vh-screen">
        <section className="block steps" id="how">
          <div className="wrap">
            <div className="section-head">
              <div className="section-tag">How it works</div>
              <h2>Three stops between "confused" and "on track."</h2>
            </div>
          </div>
          <div className="wrap" style={{ padding: 0 }}>
            <div className="steps-row">
              <div className="step">
                <span className="snum mono">01 / BOARD</span>
                <h3>Pick your branch &amp; goal</h3>
                <p>Tell us your branch and the role you're aiming for — MERN developer, AI engineer, data scientist, or cybersecurity engineer.</p>
              </div>
              <div className="step">
                <span className="snum mono">02 / UPLOAD</span>
                <h3>Upload your curriculum</h3>
                <p>Add your college syllabus so the road map reflects what you're actually being taught, semester by semester.</p>
              </div>
              <div className="step">
                <span className="snum mono">03 / TRAVEL</span>
                <h3>Follow your line</h3>
                <p>Work through subject focus areas, projects, and prep milestones as each semester station unlocks.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="cta">
          <div className="wrap cta-inner">
            <h2>Your road map starts with one branch.</h2>
            <p>Stop guessing which subjects matter. Pick a branch, name a goal, and get the semester-wise line that gets you there.</p>
            <div className="cta-actions">
              <Link to="/signup" className="btn btn-solid">Plan my road map →</Link>
              <a href="#branches" className="btn btn-outline">Browse branches</a>
            </div>
          </div>
        </section>

        <footer>
          <div className="wrap footer-inner">
            <span>NextStep — Career Guidance &amp; Personalized Semester-Wise Road Map Platform</span>
            <span className="mono">Final Year Project</span>
          </div>
        </footer>
      </div>
    </>
  );
}