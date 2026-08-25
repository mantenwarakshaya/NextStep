import {useState, useEffect} from 'react'
import {
  BsSearch,
  BsChevronDown,
  BsChevronUp,
  BsArrowRight,
} from 'react-icons/bs'
import {FiCpu} from 'react-icons/fi'
import {
  MdOutlineElectricBolt,
  MdOutlineEngineering,
  MdOutlineApartment,
  MdScience,
} from 'react-icons/md'
import './index.css'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

// Point this to your Express server.
// Add REACT_APP_API_BASE_URL to your frontend .env when deploying.
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:7777'

const BRANCHES_API_URL = `${API_BASE_URL}/api/branches`

// ---------------------------------------------------------------------------
// API Status
// ---------------------------------------------------------------------------

const apiStatusConstants = {
  initial: 'INITIAL',
  inProgress: 'IN_PROGRESS',
  success: 'SUCCESS',
  failure: 'FAILURE',
}

// ---------------------------------------------------------------------------
// Category Taxonomy
// ---------------------------------------------------------------------------

const categoriesList = [
  {
    id: 'ALL',
    label: 'All Branches',
    icon: null,
  },
  {
    id: 'CSE',
    label: 'Computer Science & Engineering',
    icon: FiCpu,
  },
  {
    id: 'ECE',
    label: 'Electronics',
    icon: MdOutlineElectricBolt,
  },
  {
    id: 'MECH',
    label: 'Mechanical',
    icon: MdOutlineEngineering,
  },
  {
    id: 'CIVIL',
    label: 'Civil',
    icon: MdOutlineApartment,
  },
  {
    id: 'OTHER',
    label: 'Other Specialized',
    icon: MdScience,
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Converts MongoDB category names into the IDs used by the frontend.
const getCategoryId = category => {
  if (!category) {
    return 'OTHER'
  }

  const normalizedCategory = category.toLowerCase()

  if (
    normalizedCategory.includes('computer science') ||
    normalizedCategory.includes('cse')
  ) {
    return 'CSE'
  }

  if (
    normalizedCategory.includes('electronics') ||
    normalizedCategory.includes('ece')
  ) {
    return 'ECE'
  }

  if (normalizedCategory.includes('mechanical') ||
    normalizedCategory.includes('mech')) {
    return 'MECH'
  }

  if (normalizedCategory.includes('civil')) {
    return 'CIVIL'
  }

  return 'OTHER'
}

// ---------------------------------------------------------------------------
// MongoDB -> Frontend Data Formatter
// ---------------------------------------------------------------------------

// MongoDB document:
//
// {
//   _id,
//   branch_code,
//   branch_name,
//   category,
//   aliases,
//   about,
//   core_subjects,
//   key_skills,
//   career_opportunities
// }
//
// Frontend expects:
//
// {
//   id,
//   categoryId,
//   categoryLabel,
//   name,
//   aliases,
//   about,
//   coreSubjects,
//   keySkills,
//   careers
// }

const formatBranchItem = branch => ({
  id: branch._id || branch.id,

  categoryId: getCategoryId(branch.category),

  categoryLabel: branch.category || 'Other Specialized',

  name: branch.branch_name || branch.name || '',

  aliases: Array.isArray(branch.aliases) ? branch.aliases : [],

  about: branch.about || '',

  coreSubjects: Array.isArray(branch.core_subjects)
    ? branch.core_subjects
    : Array.isArray(branch.coreSubjects)
      ? branch.coreSubjects
      : [],

  keySkills: Array.isArray(branch.key_skills)
    ? branch.key_skills
    : Array.isArray(branch.keySkills)
      ? branch.keySkills
      : [],

  careers: Array.isArray(branch.career_opportunities)
    ? branch.career_opportunities
    : Array.isArray(branch.careers)
      ? branch.careers
      : [],

  decisionFactors: branch.decision_factors || {},

  simpleExplanation: branch.simple_explanation || '',

  recommendedLanguages: Array.isArray(branch.recommended_languages)
    ? branch.recommended_languages
    : [],

  commonTools: Array.isArray(branch.common_tools)
    ? branch.common_tools
    : [],

  practicalWork: Array.isArray(branch.practical_work)
    ? branch.practical_work
    : [],

  projectAreas: Array.isArray(branch.project_areas)
    ? branch.project_areas
    : [],

  internshipAreas: Array.isArray(branch.internship_areas)
    ? branch.internship_areas
    : [],

  higherStudies: Array.isArray(branch.higher_studies)
    ? branch.higher_studies
    : [],

  bestFor: Array.isArray(branch.best_for) ? branch.best_for : [],

  mayNotSuit: Array.isArray(branch.may_not_suit)
    ? branch.may_not_suit
    : [],

  firstYearPreparation: Array.isArray(branch.first_year_preparation)
    ? branch.first_year_preparation
    : [],

  careerPaths: Array.isArray(branch.career_paths)
    ? branch.career_paths
    : [],

  yearWiseRoadmap: branch.year_wise_roadmap || {},

  parentGuidance: branch.parent_guidance || {},

  studentFaq: Array.isArray(branch.student_faq)
    ? branch.student_faq
    : [],

  careerNotes: branch.career_notes || {},
})

// ---------------------------------------------------------------------------
// Branch Card
// ---------------------------------------------------------------------------

const BranchCard = ({
  branchDetails,
  isExpanded,
  onToggleExpand,
  onSelectBranch,
}) => {
  const {
    name,
    aliases,
    about,
    coreSubjects,
    keySkills,
    careers,
    categoryId,
    simpleExplanation,
    decisionFactors,
    recommendedLanguages,
    commonTools,
    practicalWork,
    projectAreas,
    internshipAreas,
    higherStudies,
    bestFor,
    mayNotSuit,
    firstYearPreparation,
    yearWiseRoadmap,
    studentFaq,
  } = branchDetails

  const hasDeepDive =
    coreSubjects.length > 0 ||
    keySkills.length > 0 ||
    careers.length > 0 ||
    recommendedLanguages.length > 0 ||
    commonTools.length > 0 ||
    firstYearPreparation.length > 0 ||
    Object.keys(decisionFactors).length > 0

  return (
    <li className={`branch-card branch-card-${categoryId.toLowerCase()}`}>
      {/* Branch Header */}
      <div className="branch-card-head">
        <h3 className="branch-name">{name}</h3>

        {aliases.length > 0 && (
          <div className="branch-alias-row">
            {aliases.slice(0, 3).map(alias => (
              <span className="branch-alias-chip" key={alias}>
                {alias}
              </span>
            ))}

            {aliases.length > 3 && (
              <span className="branch-alias-chip branch-alias-more">
                +{aliases.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* About */}
      <p className="branch-about">{about}</p>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="branch-details">

          {/* Core Subjects */}
          {coreSubjects.length > 0 && (
            <div className="branch-detail-block">
              <h4 className="branch-detail-label">
                Core Subjects
              </h4>

              <div className="branch-tag-row">
                {coreSubjects.map(subject => (
                  <span className="branch-tag" key={subject}>
                    {subject}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Key Skills */}
          {keySkills.length > 0 && (
            <div className="branch-detail-block">
              <h4 className="branch-detail-label">
                Key Skills
              </h4>

              <div className="branch-tag-row">
                {keySkills.map(skill => (
                  <span
                    className="branch-tag branch-tag-skill"
                    key={skill}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Career Opportunities */}
          {careers.length > 0 && (
            <div className="branch-detail-block">
              <h4 className="branch-detail-label">
                Career Opportunities
              </h4>

              <ul className="branch-career-list">
                {careers.map(career => (
                  <li
                    className="branch-career-item"
                    key={career}
                  >
                    {career}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Expanded Profile */}
          {simpleExplanation && (
            <div className="branch-detail-block">
              <h4 className="branch-detail-label">In Simple Terms</h4>
              <p className="branch-about">{simpleExplanation}</p>
            </div>
          )}

          {Object.keys(decisionFactors).length > 0 && (
            <div className="branch-detail-block">
              <h4 className="branch-detail-label">What To Expect</h4>
              <ul className="branch-career-list">
                {Object.entries(decisionFactors).map(([factor, value]) => (
                  <li className="branch-career-item" key={factor}>
                    {factor.replace(/_/g, ' ')}: {value}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {[
            ['Recommended Languages', recommendedLanguages],
            ['Common Tools', commonTools],
            ['Practical Work', practicalWork],
            ['Project Areas', projectAreas],
            ['Internship Areas', internshipAreas],
            ['Higher Studies', higherStudies],
            ['Good Fit For', bestFor],
            ['May Not Suit', mayNotSuit],
            ['First-Year Preparation', firstYearPreparation],
          ].map(([label, items]) => (
            items.length > 0 && (
              <div className="branch-detail-block" key={label}>
                <h4 className="branch-detail-label">{label}</h4>
                <div className="branch-tag-row">
                  {items.map(item => (
                    <span className="branch-tag" key={item}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )
          ))}

          {Object.values(yearWiseRoadmap).some(
            yearItems => Array.isArray(yearItems) && yearItems.length > 0
          ) && (
            <div className="branch-detail-block">
              <h4 className="branch-detail-label">Year-Wise Roadmap</h4>
              <ul className="branch-career-list">
                {Object.entries(yearWiseRoadmap).map(([year, items]) => (
                  Array.isArray(items) && items.length > 0 && (
                    <li className="branch-career-item" key={year}>
                      <strong>{year.replace('_', ' ')}:</strong>{' '}
                      {items.join(', ')}
                    </li>
                  )
                ))}
              </ul>
            </div>
          )}

          {studentFaq.length > 0 && (
            <div className="branch-detail-block">
              <h4 className="branch-detail-label">Student FAQ</h4>
              <ul className="branch-career-list">
                {studentFaq.map(faq => (
                  <li className="branch-career-item" key={faq.question}>
                    <strong>{faq.question}</strong> {faq.answer}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="branch-card-footer">

        {/* View More */}
        {hasDeepDive ? (
          <button
            type="button"
            className="branch-view-more-btn"
            onClick={() => onToggleExpand(branchDetails.id)}
          >
            {isExpanded ? 'View Less' : 'View More'}

            {isExpanded ? (
              <BsChevronUp className="branch-view-more-icon" />
            ) : (
              <BsChevronDown className="branch-view-more-icon" />
            )}
          </button>
        ) : (
          <span />
        )}

        {/* Select Branch */}
        <button
          type="button"
          className="branch-select-btn"
          onClick={() => onSelectBranch(branchDetails)}
        >
          Select Branch

          <BsArrowRight className="branch-select-icon" />
        </button>
      </div>
    </li>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

const BranchesExplorer = ({onSelectBranch = () => {}}) => {
  const [branchesList, setBranchesList] = useState([])

  const [apiStatus, setApiStatus] = useState(
    apiStatusConstants.initial,
  )

  const [activeCategoryId, setActiveCategoryId] =
    useState('ALL')

  const [searchInput, setSearchInput] = useState('')

  const [expandedBranchId, setExpandedBranchId] =
    useState(null)

  // -------------------------------------------------------------------------
  // Fetch Branches
  // -------------------------------------------------------------------------

  useEffect(() => {
    getBranches()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getBranches = async () => {
    setApiStatus(apiStatusConstants.inProgress)

    try {
      const response = await fetch(BRANCHES_API_URL)

      if (!response.ok) {
        throw new Error('Request failed')
      }

      const data = await response.json()

      // API can return:
      //
      // [
      //   {...},
      //   {...}
      // ]
      //
      // OR:
      //
      // {
      //   branches: [...]
      // }

      const branchesArray = Array.isArray(data)
        ? data
        : data.branches

      if (!Array.isArray(branchesArray)) {
        throw new Error('Invalid branches response')
      }

      // Convert MongoDB fields to frontend fields
      const formattedData =
        branchesArray.map(formatBranchItem)

      setBranchesList(formattedData)

      setApiStatus(apiStatusConstants.success)
    } catch (error) {
      console.error('Error fetching branches:', error)

      setBranchesList([])

      setApiStatus(apiStatusConstants.failure)
    }
  }

  // -------------------------------------------------------------------------
  // Expand / Collapse Branch
  // -------------------------------------------------------------------------

  const onToggleExpand = branchId => {
    setExpandedBranchId(prevId =>
      prevId === branchId ? null : branchId,
    )
  }

  // -------------------------------------------------------------------------
  // Search
  // -------------------------------------------------------------------------

  const onChangeSearchInput = event => {
    setSearchInput(event.target.value)
  }

  // -------------------------------------------------------------------------
  // Category
  // -------------------------------------------------------------------------

  const onChangeCategory = categoryId => {
    setActiveCategoryId(categoryId)
    setExpandedBranchId(null)
  }

  // -------------------------------------------------------------------------
  // Filter Branches
  // -------------------------------------------------------------------------

  const getVisibleBranches = () => {
    const trimmedSearch =
      searchInput.trim().toLowerCase()

    return branchesList.filter(branch => {

      // Category filter
      const matchesCategory =
        activeCategoryId === 'ALL' ||
        branch.categoryId === activeCategoryId

      if (!matchesCategory) {
        return false
      }

      // If search is empty, show all branches
      if (trimmedSearch === '') {
        return true
      }

      // Search branch name
      const nameMatches =
        branch.name
          .toLowerCase()
          .includes(trimmedSearch)

      // Search aliases
      const aliasMatches =
        branch.aliases.some(alias =>
          alias.toLowerCase().includes(trimmedSearch),
        )

      return nameMatches || aliasMatches
    })
  }

  // -------------------------------------------------------------------------
  // Loading View
  // -------------------------------------------------------------------------

  const renderLoadingView = () => (
    <div className="branches-status-view">
      <div className="branches-loader" />

      <p className="branches-status-text">
        Loading branch profiles...
      </p>
    </div>
  )

  // -------------------------------------------------------------------------
  // Failure View
  // -------------------------------------------------------------------------

  const renderFailureView = () => (
    <div className="branches-status-view">

      <p className="branches-status-heading">
        Something went wrong
      </p>

      <p className="branches-status-text">
        We could not load the branch data.
        Please check your backend connection and try again.
      </p>

      <button
        type="button"
        className="branches-retry-btn"
        onClick={getBranches}
      >
        Retry
      </button>
    </div>
  )

  // -------------------------------------------------------------------------
  // No Results View
  // -------------------------------------------------------------------------

  const renderNoResultsView = () => (
    <div className="branches-status-view">

      <p className="branches-status-heading">
        No branches match your search
      </p>

      <p className="branches-status-text">
        Try a different keyword, or clear the filter
        to browse all branches.
      </p>
    </div>
  )

  // -------------------------------------------------------------------------
  // Branch Grid
  // -------------------------------------------------------------------------

  const renderBranchesGrid = visibleBranches => (
    <ul className="branches-grid">
      {visibleBranches.map(branch => (
        <BranchCard
          key={branch.id}
          branchDetails={branch}
          isExpanded={
            expandedBranchId === branch.id
          }
          onToggleExpand={onToggleExpand}
          onSelectBranch={onSelectBranch}
        />
      ))}
    </ul>
  )

  // -------------------------------------------------------------------------
  // Success View
  // -------------------------------------------------------------------------

  const renderSuccessView = () => {
    const visibleBranches = getVisibleBranches()

    if (visibleBranches.length === 0) {
      return renderNoResultsView()
    }

    return renderBranchesGrid(visibleBranches)
  }

  // -------------------------------------------------------------------------
  // Content
  // -------------------------------------------------------------------------

  const renderContent = () => {
    switch (apiStatus) {
      case apiStatusConstants.inProgress:
        return renderLoadingView()

      case apiStatusConstants.failure:
        return renderFailureView()

      case apiStatusConstants.success:
        return renderSuccessView()

      default:
        return null
    }
  }

  // -------------------------------------------------------------------------
  // JSX
  // -------------------------------------------------------------------------

  return (
    <div className="branches-explorer-bg">

      {/* Hero Section */}
      <section className="branches-hero">

        <p className="branches-hero-eyebrow">
          Career Guidance Platform
        </p>

        <h1 className="branches-hero-heading">
          Explore Every B.Tech Branch Before You Choose
        </h1>

        <p className="branches-hero-subtext">
          44+ branch name variants grouped into clear
          profiles - subjects, skills, and career paths,
          so you pick with clarity, not confusion.
        </p>

        {/* Search */}
        <div className="branches-search-bar">

          <BsSearch className="branches-search-icon" />

          <input
            type="search"
            className="branches-search-input"
            placeholder="Search by branch name, e.g. AI, VLSI, Civil..."
            value={searchInput}
            onChange={onChangeSearchInput}
          />

        </div>
      </section>

      {/* Content */}
      <section className="branches-content">

        {/* Category Tabs */}
        <div className="branches-category-tabs">

          {categoriesList.map(category => {
            const Icon = category.icon

            const isActive =
              category.id === activeCategoryId

            return (
              <button
                type="button"
                key={category.id}
                className={`branches-category-tab ${
                  isActive
                    ? 'branches-category-tab-active'
                    : ''
                }`}
                onClick={() =>
                  onChangeCategory(category.id)
                }
              >
                {Icon && (
                  <Icon className="branches-category-tab-icon" />
                )}

                {category.label}
              </button>
            )
          })}

        </div>

        {/* API URL Information */}
        <p className="branches-source-note">
          Branch data is loaded from{' '}
          <code>{BRANCHES_API_URL}</code>
        </p>

        {/* Content */}
        {renderContent()}

      </section>
    </div>
  )
}

export default BranchesExplorer