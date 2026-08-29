const { getModel, callWithRetry } = require("../../config/gemini");

const generateSemesterRoadmap = async ({
  branch,
  careerGoal,
  specialization,
  semester,
  masterSemesterPlan,
  collegeCalendar,
}) => {
  const model = getModel(process.env.GEMINI_MODEL || "gemini-2.5-flash");

  const prompt = `
You are an expert B.Tech semester planning assistant.

Your job is to convert a MASTER CAREER ROADMAP into a
REALISTIC SEMESTER ROADMAP.

The student has college classes, internal exams, practical exams,
semester exams and holidays.

You MUST respect the student's college schedule.


STUDENT

Branch:
${branch}

Career Goal:
${careerGoal}

Specialization:
${JSON.stringify(specialization || [])}

Current Semester:
Semester ${semester}


MASTER ROADMAP FOR THIS SEMESTER

${JSON.stringify(masterSemesterPlan, null, 2)}


COLLEGE ACADEMIC CALENDAR

${JSON.stringify(collegeCalendar, null, 2)}


CRITICAL PLANNING RULES

RULE 1 — COLLEGE COMES FIRST

Never schedule career-study tasks during the student's:

- Internal exams
- Mid examinations
- Practical examinations
- Semester/theory examinations


RULE 2 — THREE DAY EXAM BUFFER

For EVERY college examination:

Do not schedule career roadmap work starting
3 FULL DAYS BEFORE the examination begins.

Example:

Exam starts:
20 November

No roadmap work:
17 November
18 November
19 November
20 November onward during exam period


RULE 3 — EXAM PERIOD

During examination dates:

career roadmap activities = []

Do not schedule:

- DSA
- coding
- projects
- new technologies
- assignments related to career roadmap


RULE 4 — AFTER EXAM

After the examination period ends, the student can resume
the career roadmap gradually.

Do NOT immediately overload the first day after exams.


RULE 5 — COLLEGE WORKLOAD

The student already has college classes and academic work.

Therefore, career preparation should be realistic.

Do not create an unrealistic 8-10 hour daily career plan
during regular college days.


RULE 6 — ZERO KNOWLEDGE

If the master roadmap contains a topic that requires
previous knowledge, make the semester plan teach the
required prerequisite first.


RULE 7 — MASTER ROADMAP MUST BE FOLLOWED

Do not invent an entirely different career path.

Use the selected semester from the master roadmap as the
primary source.

You may change:

- order
- pace
- study intensity
- project timing

based on the college calendar.


RULE 8 — DSA

If DSA is present in the master roadmap:

schedule it progressively.

Do not force DSA into exam periods.


RULE 9 — PROJECTS

Projects should be divided into smaller stages:

- learning
- setup
- implementation
- testing
- improvement
- completion

Do not put an entire project into one day.


RULE 10 — HOLIDAYS

College holidays can be used for deeper learning or
project work if appropriate.

But do not assume the student wants to study all day.


RULE 11 — EXAM BUFFER HAS PRIORITY

If there is a conflict between:

career roadmap
and
college examination

college examination ALWAYS wins.


OUTPUT

Return ONLY valid JSON.

Use this structure:

{
  "semester": ${semester},

  "semesterObjective": "",

  "roadmapSummary": "",

  "weeklyPlan": [
    {
      "week": 1,
      "focus": "",
      "topics": [],
      "dsa": [],
      "projectWork": [],
      "expectedOutcome": ""
    }
  ],

  "dailyPlan": [
    {
      "date": "YYYY-MM-DD",
      "dayType": "normal",
      "availableHours": 2,
      "activities": [],
      "dsa": [],
      "collegeWork": [],
      "notes": ""
    }
  ],

  "milestones": [],

  "semesterOutcome": ""
}


VALID dayType VALUES:

normal
college_exam
pre_exam_break
college_holiday


IMPORTANT:

If a date is inside an examination:

"dayType": "college_exam"
"availableHours": 0
"activities": []
"dsa": []
"collegeWork": []
"notes": "College examination period"


If a date is within the 3-day pre-exam protection period:

"dayType": "pre_exam_break"
"availableHours": 0
"activities": []
"dsa": []
"collegeWork": []
"notes": "Career roadmap paused before college examination"


Do not schedule career roadmap work on those dates.

Generate a practical plan that a real engineering student can
actually follow.
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

module.exports = generateSemesterRoadmap;
