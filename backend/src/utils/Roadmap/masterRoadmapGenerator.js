const { getModel, callWithRetry } = require("../../config/gemini");

const generateMasterRoadmap = async (
  branch,
  careerGoal,
  specialization = [],
) => {
  const model = getModel(process.env.GEMINI_MODEL || "gemini-2.5-flash");

  const specializationText = Array.isArray(specialization)
    ? specialization.join(", ")
    : specialization || "None";

  const prompt = `
You are an expert engineering education architect.

You are creating a COMPLETE 4-YEAR ROADMAP for a B.Tech/B.E. student.

The student may have ZERO technical knowledge.

Therefore, NEVER assume that the student already knows programming,
web development, mathematics, DSA, Git, databases, or any technical skill.

STUDENT INFORMATION

Branch:
${branch}

Career Goal:
${careerGoal}

Specialization:
${specializationText}


MAIN OBJECTIVE

Create a realistic semester-by-semester roadmap from Semester 1
through Semester 8.

The roadmap must take the student from:

ZERO KNOWLEDGE
        ↓
FOUNDATION
        ↓
PROGRAMMING
        ↓
CORE TECHNICAL SKILLS
        ↓
ROLE-SPECIFIC DEVELOPMENT
        ↓
PROJECTS
        ↓
INTERNSHIP PREPARATION
        ↓
PLACEMENT / JOB READINESS


IMPORTANT RULES

1. Start from absolute fundamentals.

2. Do NOT assume previous programming knowledge.

3. Introduce programming before advanced development.

4. Include DSA progressively across the degree.

5. DSA must NOT suddenly appear only in final year.

6. Include projects progressively:
   - beginner projects
   - intermediate projects
   - major projects
   - final-year/capstone project

7. Include Git and GitHub.

8. Include problem solving.

9. Include role-specific technologies.

10. Include databases where relevant.

11. Include APIs where relevant.

12. Include testing and debugging.

13. Include deployment where relevant.

14. Include resume, GitHub, portfolio and interview preparation
    at the appropriate stage.

15. Do NOT overload Semester 1 with advanced technologies.

16. Do NOT put everything into one semester.

17. Every semester must have a clear purpose.

18. The roadmap is a MASTER PLAN.
    It is NOT a daily timetable.

19. A future semester should build on previous semesters.

20. For a MERN Stack Developer, for example, a logical progression
    can include:

    HTML
    CSS
    JavaScript
    Git/GitHub
    Programming fundamentals
    React
    Node.js
    Express.js
    MongoDB
    REST APIs
    Authentication
    Deployment
    DSA
    Projects
    System design basics
    Interview preparation

    But DO NOT blindly use this list for every career.
    Adapt it to the selected career goal.

21. If the student selects a specialization, integrate it gradually.
    Do not replace the core career foundation with the specialization.

22. By Semester 7/8 the student should be internship/placement ready.

RETURN ONLY VALID JSON.

FORMAT:

{
  "branch": "${branch}",
  "careerGoal": "${careerGoal}",
  "specialization": [],
  "roadmap": [
    {
      "semester": 1,
      "objective": "",
      "skills": [],
      "topics": [],
      "dsa": [],
      "projects": [],
      "careerPreparation": [],
      "expectedOutcome": ""
    },

    {
      "semester": 2,
      "objective": "",
      "skills": [],
      "topics": [],
      "dsa": [],
      "projects": [],
      "careerPreparation": [],
      "expectedOutcome": ""
    },

    {
      "semester": 3,
      "objective": "",
      "skills": [],
      "topics": [],
      "dsa": [],
      "projects": [],
      "careerPreparation": [],
      "expectedOutcome": ""
    },

    {
      "semester": 4,
      "objective": "",
      "skills": [],
      "topics": [],
      "dsa": [],
      "projects": [],
      "careerPreparation": [],
      "expectedOutcome": ""
    },

    {
      "semester": 5,
      "objective": "",
      "skills": [],
      "topics": [],
      "dsa": [],
      "projects": [],
      "careerPreparation": [],
      "expectedOutcome": ""
    },

    {
      "semester": 6,
      "objective": "",
      "skills": [],
      "topics": [],
      "dsa": [],
      "projects": [],
      "careerPreparation": [],
      "expectedOutcome": ""
    },

    {
      "semester": 7,
      "objective": "",
      "skills": [],
      "topics": [],
      "dsa": [],
      "projects": [],
      "careerPreparation": [],
      "expectedOutcome": ""
    },

    {
      "semester": 8,
      "objective": "",
      "skills": [],
      "topics": [],
      "dsa": [],
      "projects": [],
      "careerPreparation": [],
      "expectedOutcome": ""
    }
  ]
}
`;

  const responseText = await callWithRetry(async () => {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  });

  let clean = responseText
    .replace(/^```json/i, "")
    .replace(/^```/i, "")
    .replace(/```$/i, "")
    .trim();

  return JSON.parse(clean);
};

module.exports = generateMasterRoadmap;
