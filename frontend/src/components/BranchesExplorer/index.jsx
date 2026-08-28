import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  X,
  Search,
  Code2,
  Cpu,
  Wrench,
  HardHat,
  Sparkles,
  CheckCircle2,
  XCircle,
  Briefcase,
  Users,
  HelpCircle,
  Map as MapIcon,
  LayoutGrid,
  ChevronDown,
} from "lucide-react";
import { EmptyView, ErrorView, LoaderView } from "../Common";
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

const LEVEL_SCALE = {
  Low: 1,
  "Low to Moderate": 2,
  Moderate: 3,
  "Moderate to High": 4,
  High: 5,
  "Very High": 6,
};
const LEVEL_MAX = 6;

const DETAIL_TABS = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "roadmap", label: "Year-wise Roadmap", icon: MapIcon },
  { id: "careers", label: "Careers", icon: Briefcase },
  { id: "guidance", label: "FAQ & Parents", icon: Users },
];

export default function BranchesExplorer() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selected, setSelected] = useState(null);
  const [activeDetailTab, setActiveDetailTab] = useState("overview");

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoading(true);
        setErrorMsg("");
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

  const categories = useMemo(() => {
    const unique = [
      ...new Set(branches.map((b) => b.category).filter(Boolean)),
    ];
    return ["All", ...unique];
  }, [branches]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return branches.filter((b) => {
      const matchesCategory =
        activeCategory === "All" || b.category === activeCategory;
      const matchesQuery =
        !q ||
        b.branch_name?.toLowerCase().includes(q) ||
        b.aliases?.some((a) => a.toLowerCase().includes(q));
      return matchesCategory && matchesQuery;
    });
  }, [branches, activeCategory, query]);

  // Group results by category so the page reads as a set of branching
  // trunks (one per category) rather than one undifferentiated grid.
  const trunks = useMemo(() => {
    const order = categories.filter((c) => c !== "All");
    const buckets = {};
    filtered.forEach((b) => {
      const cat = b.category || "Other";
      (buckets[cat] ||= []).push(b);
    });
    return order
      .filter((c) => buckets[c]?.length)
      .map((c) => ({ category: c, items: buckets[c] }));
  }, [filtered, categories]);

  const openBranch = (branch) => {
    setSelected(branch);
    setActiveDetailTab("overview");
  };

  if (loading) {
    return <LoaderView message="Loading branches..." />;
  }

  if (errorMsg) {
    return (
      <ErrorView message={errorMsg} onRetry={() => window.location.reload()} />
    );
  }

  return (
    <div className="be-root">
      <header className="be-header">
        <div className="be-header-frame">
          <span className="be-eyebrow">
            Field guide / {branches.length} branches
          </span>
          <h1>Explore engineering branches</h1>
          <p>
            Browse each branch's subjects, skills, and career paths before
            choosing one in your roadmap.
          </p>
        </div>
        <label className="be-search">
          <span className="be-search-icon">
            <Search size={14} />
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="search a branch or alias…"
            aria-label="Search branches"
          />
          {query && (
            <button
              type="button"
              className="be-search-clear"
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </label>
      </header>

      <div
        className="be-filters"
        role="tablist"
        aria-label="Filter by category"
      >
        {categories.map((cat) => {
          const Icon = CATEGORY_ICONS[cat];
          return (
            <button
              key={cat}
              type="button"
              className={`be-filter-chip ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {Icon && <Icon size={13} />}
              {cat}
            </button>
          );
        })}
      </div>

      {trunks.length === 0 ? (
        <EmptyView message={`No branches match "${query}".`} />
      ) : (
        <div className="be-orchard">
          {trunks.map((trunk) => (
            <CategoryTrunk
              key={trunk.category}
              trunk={trunk}
              onOpenBranch={openBranch}
            />
          ))}
        </div>
      )}

      {selected && (
        <BranchDetailModal
          branch={selected}
          onClose={() => setSelected(null)}
          activeTab={activeDetailTab}
          setActiveTab={setActiveDetailTab}
        />
      )}
    </div>
  );
}

/* ═══════════════ TRUNK (one per category) ═══════════════ */
function CategoryTrunk({ trunk, onOpenBranch }) {
  const { category, items } = trunk;
  const Icon = CATEGORY_ICONS[category] || Sparkles;
  return (
    <section className="be-trunk">
      <div className="be-trunk-header">
        <div className="be-trunk-label">
          <span className="be-trunk-icon">
            <Icon size={15} />
          </span>
          <h2 className="be-trunk-title">{category}</h2>
          <span className="be-trunk-count">
            {items.length} {items.length === 1 ? "branch" : "branches"}
          </span>
        </div>
      </div>

      <div className="be-leaves">
        {items.map((b) => (
          <div className="be-leaf" key={b._id}>
            <BranchCard branch={b} onClick={() => onOpenBranch(b)} />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════ CARD (a leaf on the trunk) ═══════════════ */
function BranchCard({ branch, onClick }) {
  const Icon = CATEGORY_ICONS[branch.category] || Sparkles;
  return (
    <article
      className="be-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick()}
    >
      <div className="be-card-icon">
        <Icon size={15} />
      </div>

      <h3 className="be-card-title">{branch.branch_name}</h3>
      <p className="be-card-about">
        {branch.simple_explanation || branch.about}
      </p>

      {branch.decision_factors?.overall_difficulty && (
        <div className="be-card-difficulty">
          <span>Difficulty</span>
          <LevelBar
            level={branch.decision_factors.overall_difficulty}
            compact
          />
        </div>
      )}

      <div className="be-card-footer">
        <span className="be-card-count">
          {branch.career_count ?? branch.career_opportunities?.length ?? 0}{" "}
          career paths
        </span>
        <span className="be-card-cta">Open →</span>
      </div>
    </article>
  );
}

/* ═══════════════ LEVEL BAR ═══════════════ */
function LevelBar({ label, level, compact = false }) {
  const value = LEVEL_SCALE[level] || 0;
  return (
    <div className={`be-level ${compact ? "be-level-compact" : ""}`}>
      {label && <span className="be-level-label">{label}</span>}
      <div className="be-level-track">
        {Array.from({ length: LEVEL_MAX }).map((_, i) => (
          <span
            key={i}
            className={`be-level-seg ${i < value ? "filled" : ""}`}
          />
        ))}
      </div>
      {!compact && <span className="be-level-text">{level}</span>}
    </div>
  );
}

/* ═══════════════ DETAIL MODAL — datasheet layout ═══════════════ */
function BranchDetailModal({ branch, onClose, activeTab, setActiveTab }) {
  return (
    <div className="be-modal-overlay" onClick={onClose}>
      <div
        className="be-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          className="be-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <header className="be-modal-header">
          <span className="be-modal-category">{branch.category}</span>
          <h2>{branch.branch_name}</h2>
          {branch.aliases?.length > 0 && (
            <div className="be-alias-row">
              {branch.aliases.slice(0, 5).map((a) => (
                <span key={a} className="be-alias-chip">
                  {a}
                </span>
              ))}
            </div>
          )}
        </header>

        <div className="be-modal-shell">
          <nav className="be-modal-sidebar" role="tablist">
            {DETAIL_TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={activeTab === id}
                className={`be-modal-tab ${activeTab === id ? "active" : ""}`}
                onClick={() => setActiveTab(id)}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </nav>

          <div className="be-modal-panel">
            {activeTab === "overview" && <OverviewTab branch={branch} />}
            {activeTab === "roadmap" && <RoadmapTab branch={branch} />}
            {activeTab === "careers" && <CareersTab branch={branch} />}
            {activeTab === "guidance" && <GuidanceTab branch={branch} />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Overview ── */
function OverviewTab({ branch }) {
  const df = branch.decision_factors || {};
  return (
    <div className="be-tab-content">
      <p className="be-about-text">{branch.about}</p>

      <Section title="How it stacks up">
        <div className="be-factor-grid">
          <LevelBar label="Coding" level={df.coding_level} />
          <LevelBar label="Mathematics" level={df.mathematics_level} />
          <LevelBar label="Physics" level={df.physics_level} />
          <LevelBar label="Hardware" level={df.hardware_level} />
          <LevelBar label="Overall difficulty" level={df.overall_difficulty} />
        </div>
      </Section>

      <div className="be-two-col">
        <Section title="Core subjects">
          <ChipList items={branch.core_subjects} />
        </Section>
        <Section title="Key skills">
          <ChipList items={branch.key_skills} />
        </Section>
      </div>

      <div className="be-two-col">
        <Section title="Recommended languages">
          <ChipList items={branch.recommended_languages} tone="accent" />
        </Section>
        <Section title="Common tools">
          <ChipList items={branch.common_tools} />
        </Section>
      </div>

      <Section title="Practical work you'll do">
        <ChipList items={branch.practical_work} />
      </Section>

      <div className="be-two-col">
        <Section title="Best for">
          <FitList items={branch.best_for} good />
        </Section>
        <Section title="May not suit">
          <FitList items={branch.may_not_suit} good={false} />
        </Section>
      </div>

      {branch.first_year_preparation?.length > 0 && (
        <Section title="Before you join — first-year prep">
          <ul className="be-checklist">
            {branch.first_year_preparation.map((item) => (
              <li key={item}>
                <CheckCircle2 size={14} />
                {item}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

/* ── Roadmap ── */
function RoadmapTab({ branch }) {
  const roadmap = branch.year_wise_roadmap || {};
  const years = ["year_1", "year_2", "year_3", "year_4"].filter(
    (y) => roadmap[y]?.length,
  );

  if (years.length === 0) {
    return (
      <div className="be-tab-content">
        <p className="be-empty-note">
          No year-wise roadmap available for this branch yet.
        </p>
      </div>
    );
  }

  return (
    <div className="be-tab-content">
      <div className="be-year-track">
        <div className="be-year-rail" />
        {years.map((y, i) => (
          <div className="be-year-stop" key={y}>
            <div className="be-year-node">{i + 1}</div>
            <div className="be-year-card">
              <h4>Year {i + 1}</h4>
              <ul>
                {roadmap[y].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Careers ── */
function CareersTab({ branch }) {
  return (
    <div className="be-tab-content">
      <Section
        title={`Career opportunities (${branch.career_paths?.length ?? branch.career_opportunities?.length ?? 0})`}
      >
        <div className="be-career-grid">
          {(branch.career_paths?.length
            ? branch.career_paths
            : (branch.career_opportunities || []).map((c) => ({ career: c }))
          ).map((cp) => (
            <div className="be-career-card" key={cp.career}>
              <h4>{cp.career}</h4>
              {cp.why_it_fits && <p>{cp.why_it_fits}</p>}
            </div>
          ))}
        </div>
      </Section>

      {branch.project_areas?.length > 0 && (
        <Section title="Project areas">
          <ChipList items={branch.project_areas} />
        </Section>
      )}

      {branch.internship_areas?.length > 0 && (
        <Section title="Internship areas">
          <ChipList items={branch.internship_areas} tone="accent" />
        </Section>
      )}

      {branch.higher_studies?.length > 0 && (
        <Section title="Higher-study options">
          <ChipList items={branch.higher_studies} />
        </Section>
      )}

      {branch.career_notes && (
        <div className="be-notice">
          <p>{branch.career_notes.reason}</p>
          {branch.career_notes.recommendation && (
            <p className="be-notice-strong">
              {branch.career_notes.recommendation}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Guidance (FAQ + parents) ── */
function GuidanceTab({ branch }) {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="be-tab-content">
      {branch.parent_guidance && (
        <Section title="For parents">
          <p className="be-about-text">
            {branch.parent_guidance.what_parents_should_know}
          </p>
          {branch.parent_guidance.important_parent_questions?.length > 0 && (
            <ul className="be-checklist">
              {branch.parent_guidance.important_parent_questions.map((q) => (
                <li key={q}>
                  <HelpCircle size={14} />
                  {q}
                </li>
              ))}
            </ul>
          )}
        </Section>
      )}

      {branch.student_faq?.length > 0 && (
        <Section title="Student FAQ">
          <div className="be-faq-list">
            {branch.student_faq.map((item, i) => (
              <div
                className={`be-faq-item ${openFaq === i ? "open" : ""}`}
                key={item.question}
              >
                <button
                  type="button"
                  className="be-faq-question"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {item.question}
                  <ChevronDown size={15} className="be-faq-chevron" />
                </button>
                {openFaq === i && (
                  <p className="be-faq-answer">{item.answer}</p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

/* ═══════════════ SHARED BITS ═══════════════ */
function Section({ title, children }) {
  return (
    <section className="be-section">
      <h3 className="be-section-title">{title}</h3>
      {children}
    </section>
  );
}

function ChipList({ items, tone }) {
  if (!items?.length) return <p className="be-empty-note">Not specified.</p>;
  return (
    <div className="be-chip-row">
      {items.map((item) => (
        <span
          key={item}
          className={`be-chip ${tone === "accent" ? "be-chip-accent" : ""}`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function FitList({ items, good }) {
  if (!items?.length) return <p className="be-empty-note">Not specified.</p>;
  return (
    <ul className="be-fit-list">
      {items.map((item) => (
        <li key={item} className={good ? "good" : "bad"}>
          {good ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
          {item}
        </li>
      ))}
    </ul>
  );
}
