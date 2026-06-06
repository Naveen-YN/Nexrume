export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  profilePhoto: string;
  experience: string;
  skills: string[];
  education: string;
  certifications: string[];
  github: string;
  leetcode?: string;
  googleSheetsLink?: string;
  linkedin: string;
  portfolio: string;
  theme: 'dark' | 'light' | 'cyberpunk';
  notifications: {
    inApp: boolean;
    email: boolean;
    push: boolean;
  };
  timeZone: string;
  language?: string;
  defaultWorkMode?: 'Remote' | 'Hybrid' | 'Onsite';
  defaultResumeVersion?: string;
  defaultEmailAccount?: string;
  defaultApplicationMethod?: string;
  defaultLocationPreference?: string;
  githubContributions: number;
  githubStreak: number;
  githubGrid?: number[] | null;
  leetcodeRating: number;
  leetcodeSolved: number;
  leetcodeStreak: number;
  leetcodeEasy?: number;
  leetcodeMedium?: number;
  leetcodeHard?: number;
  leetcodeRank?: number;
  leetcodeSubmissions?: number;
  leetcodeActiveDays?: number;
  leetcodeGrid?: number[] | null;
  leetcodeConnected?: boolean;
  leetcodeLastSync?: string;
  leetcodeProfileUrl?: string;
  leetcodeSolvedThisWeek?: number;
  leetcodeSolvedThisMonth?: number;
  leetcodeLastSubmissionDate?: string;
  leetcodeRecentActivity?: { date: string; title: string; status: string }[];
  leetcodeAcceptanceRate?: number;
  leetcodeLastSubmission?: { title: string; difficulty: string; timestamp: number; status?: string } | null;
  leetcodeContestsAttended?: number;
  jobSearchStreakCurrent?: number;
  jobSearchStreakBest?: number;
  applicationsThisWeek?: number;
  applicationsThisMonth?: number;
}

export interface InterviewRound {
  id: string;
  type: 'Technical Assessment' | 'Communication Assessment' | 'Coding Round' | 'Behavioral Round' | 'HR Round' | 'Managerial Round' | 'Final Interview' | 'Custom Round';
  name?: string;
  status: 'Pending' | 'Scheduled' | 'Passed' | 'Failed' | 'Skipped';
  date?: string;
  time?: string;
  meetingLink?: string;
  notes?: string;
}

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  jobUrl: string;
  jd: string;
  location: string;
  salary?: number;
  experienceRequired: string;
  workMode: 'Remote' | 'Hybrid' | 'Onsite';
  status: 'Wishlist' | 'Applied' | 'OA' | 'Interview' | 'Offer' | 'Rejected' | 'Ghosted' | 'Saved' | 'Shortlisted' | 'Assessment' | 'Withdrawn';
  appliedDate: string;
  appliedFromEmail: string;
  resumeUsed: string;
  coverLetterUsed: string;
  referralUsed: boolean;
  recruiterAssigned: string;
  timeline: { stage: string; timestamp: string }[];
  source: string;
  notes: string;
  priority: 'High' | 'Medium' | 'Low' | 'Critical';
  deadline?: string;
  workspaceId: string;
  currency?: 'USD' | 'INR';
  totalRounds?: number;
  currentRound?: number;
  resumeFile?: string;

  // New ATS-Style Form properties
  applicationType?: 'Full Time' | 'Internship' | 'Contract' | 'Part Time' | 'Freelance' | 'Apprenticeship';
  referrerName?: string;
  referrerLinkedin?: string;
  referralNotes?: string;
  shortlisted?: boolean;
  customMethod?: string;
  interviewRounds?: InterviewRound[];
  recruiterName?: string;
  recruiterContact?: string;
  recruiterFollowUp?: string;
  followUpNotes?: string;
  attachments?: { name: string; url: string; uploadDate: string; size?: string; }[];
  resumeTags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ResumeVersion {
  id: string;
  version: string;
  name: string;
  template: 'classic' | 'modern' | 'tech';
  summary: string;
  education: string;
  experience: string;
  projects: string;
  skills: string;
  certifications: string;
  achievements: string;
  isPublic: boolean;
  atsScore: number;
  accentColor?: string;
  fontSize?: 'sm' | 'base' | 'lg';
  fontFamily?: 'serif' | 'sans' | 'mono';
  spacing?: 'compact' | 'normal' | 'loose';
  personalName?: string;
  personalTitle?: string;
  personalEmail?: string;
  personalPhone?: string;
  personalLocation?: string;
  personalLinkedin?: string;
  personalGithub?: string;
  personalPortfolio?: string;
  personalPhoto?: string;
  // Advanced FlowCV customize options
  customFont?: string;
  customFontFamily?: 'serif' | 'sans' | 'mono';
  customColorHex?: string;
  applyColorName?: boolean;
  applyColorJobTitle?: boolean;
  applyColorHeadings?: boolean;
  applyColorHeadingsLine?: boolean;
  applyColorHeaderIcons?: boolean;
  applyColorDates?: boolean;
  applyColorSubtitle?: boolean;
  applyColorLinkIcons?: boolean;
  headingStyle?: 'simple' | 'underline' | 'left-block' | 'background-fill' | 'wavy' | 'double-line';
  headingCapitalization?: 'capitalize' | 'uppercase';
  headingSize?: 'S' | 'M' | 'L' | 'XL';
  headingIcons?: 'none' | 'outline' | 'filled';
  linkUnderline?: boolean;
  linkBlueColor?: boolean;
  linkIconEnabled?: boolean;
  linkIconStyle?: 'arrow' | 'external' | 'chain';
  linkApplyHeaderEmail?: boolean;
  linkApplyHeaderPhone?: boolean;
  linkApplyHeaderLinkedin?: boolean;
  linkApplyHeaderGithub?: boolean;
  headerAlignment?: 'left' | 'center';
  headerDetailsArrangement?: 'stacked' | 'grid' | 'inline';
  headerDetailsSeparator?: 'icon' | 'bullet' | 'bar';
  headerIconStyle?: string;
  nameSize?: 'XS' | 'S' | 'M' | 'L' | 'XL';
  nameBold?: boolean;
  certificatesLayout?: 'grid' | 'rows' | 'compact' | 'bubble';
  certificatesColumns?: number;
  educationTitleOrder?: 'degree-school' | 'school-degree';
  language?: string;
  dateFormat?: string;
  pageFormat?: 'A4' | 'Letter';
  layoutColumns?: 'one' | 'two' | 'mix';
  sectionOrder?: string[];
  fontSizePt?: number;
  lineHeight?: number;
  marginHorizontal?: number;
  marginVertical?: number;
  entrySpacing?: number;
  entryLayout?: 'standard' | 'dates-left' | 'dates-right' | 'minimal';
  titleSubtitleSize?: 'S' | 'M' | 'L';
  subtitleStyle?: 'normal' | 'bold' | 'italic';
  subtitlePlacement?: 'same-line' | 'next-line';
  indentBody?: boolean;
  listStyle?: 'bullet' | 'hyphen';
  footerPageNumbers?: boolean;
  footerEmail?: boolean;
  footerName?: boolean;
  footerCustomText?: string;
}

export interface RecruiterContact {
  id: string;
  name: string;
  company: string;
  email: string;
  linkedin: string;
  notes: string;
  relationshipScore: number; // 0 to 100
  history: { date: string; type: string; summary: string }[];
}

export interface EmailMessage {
  id: string;
  account: 'gmail' | 'outlook';
  sender: string;
  subject: string;
  date: string;
  body: string;
  classification: 'Application' | 'Interview' | 'OA' | 'Rejection' | 'Offer' | 'Recruiter Outreach';
  isRead: boolean;
  isSynced: boolean;
}

export interface OfferLetter {
  id: string;
  company: string;
  role: string;
  baseSalary: number;
  bonus: number;
  rsus: number;
  benefits: string[];
  noticePeriod: string;
  probation: string;
  scorecard: number;
  status: 'Pending' | 'Accepted' | 'Declined' | 'Negotiating';
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  isActive: boolean;
}

export interface OKRGoal {
  id: string;
  title: string;
  category: 'Short-Term' | 'Mid-Term' | 'Long-Term';
  targetDate: string;
  progress: number; // 0 to 100
  keyResults: { id: string; text: string; completed: boolean }[];
  workspaceId: string;
}

export interface LearningTopic {
  id: string;
  category: 'DSA' | 'DBMS' | 'OS' | 'CN' | 'System Design' | 'Frontend' | 'Backend' | 'Cloud' | 'DevOps' | 'AI/ML';
  name: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  streak: number;
  checklist: { id: string; text: string; completed: boolean }[];
}

export interface CommunityPost {
  id: string;
  author: string;
  avatar: string;
  title: string;
  content: string;
  category: 'Referrals' | 'Interviews' | 'Discussions' | 'Study Groups';
  upvotes: number;
  replies: number;
  date: string;
}

export interface CareerJournalEntry {
  id: string;
  date: string;
  entry: string;
  burnoutRisk: number; // 0 to 100
  mood: 'Excellent' | 'Good' | 'Neutral' | 'Tired' | 'Stressed';
}

export const initialUserProfile: UserProfile = {
  name: "Alex Dev",
  email: "alex.dev@gmail.com",
  phone: "+1 (555) 019-2834",
  location: "San Francisco, CA",
  profilePhoto: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120",
  experience: "4 Years",
  skills: ["React", "Next.js", "TypeScript", "Node.js", "MongoDB", "PostgreSQL", "Docker", "Python", "Kubernetes"],
  education: "",
  certifications: [],
  github: "",
  leetcode: "",
  googleSheetsLink: "",
  linkedin: "",
  portfolio: "",
  theme: "dark",
  notifications: {
    inApp: true,
    email: true,
    push: false
  },
  timeZone: "UTC",
  defaultWorkMode: "Hybrid",
  defaultResumeVersion: "",
  defaultEmailAccount: "alex.dev@gmail.com",
  defaultApplicationMethod: "Referral",
  defaultLocationPreference: "Remote",
  githubContributions: 482,
  githubStreak: 18,
  leetcodeRating: 1845,
  leetcodeSolved: 312,
  leetcodeStreak: 5,
  leetcodeEasy: 120,
  leetcodeMedium: 150,
  leetcodeHard: 42,
  leetcodeRank: 124500,
  leetcodeSubmissions: 480,
  leetcodeActiveDays: 85,
  leetcodeConnected: true,
  leetcodeLastSync: new Date().toISOString(),
  leetcodeProfileUrl: "https://leetcode.com/alexdev-codes",
  leetcodeSolvedThisWeek: 4,
  leetcodeSolvedThisMonth: 18,
  leetcodeLastSubmissionDate: new Date().toISOString().split('T')[0],
  leetcodeRecentActivity: [
    { date: "2 hrs ago", title: "Two Sum", status: "Accepted" },
    { date: "Yesterday", title: "Longest Palindromic Substring", status: "Accepted" },
    { date: "2 days ago", title: "LRU Cache", status: "Accepted" }
  ],
  leetcodeAcceptanceRate: 78.4,
  leetcodeLastSubmission: {
    title: "Two Sum",
    difficulty: "Easy",
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    status: "Accepted"
  },
  leetcodeContestsAttended: 15,
  jobSearchStreakCurrent: 0,
  jobSearchStreakBest: 0,
  applicationsThisWeek: 0,
  applicationsThisMonth: 0
};

export const initialWorkspaces = [
  { id: "swe", name: "Software Engineering" },
  { id: "aiml", name: "AI / ML Engineering" },
  { id: "pm", name: "Product Management" }
];

export const initialJobApplications: JobApplication[] = [
  {
    id: "app-1",
    company: "Google",
    role: "Senior Software Engineer",
    jobUrl: "https://careers.google.com/jobs/results/12345",
    jd: "Looking for an expert Full Stack Engineer with 5+ years of experience in distributed systems, TypeScript, Node.js, and Kubernetes.",
    location: "Mountain View, CA",
    salary: 210000,
    experienceRequired: "5+ years",
    workMode: "Hybrid",
    status: "Interview",
    appliedDate: "2026-05-15",
    appliedFromEmail: "alex.dev@gmail.com",
    resumeUsed: "Resume V2 - SDE Full Stack",
    coverLetterUsed: "Google AI Cover Letter",
    referralUsed: true,
    recruiterAssigned: "Sarah Jenkins",
    timeline: [
      { stage: "Wishlist", timestamp: "2026-05-10T10:00:00Z" },
      { stage: "Applied", timestamp: "2026-05-15T14:30:00Z" },
      { stage: "OA", timestamp: "2026-05-18T09:00:00Z" },
      { stage: "Interview", timestamp: "2026-05-25T11:00:00Z" }
    ],
    source: "Referral",
    notes: "Followed up with Stanford alumnus who referred me. Preparing for coding round.",
    priority: "High",
    deadline: "2026-06-02",
    workspaceId: "swe"
  },
  {
    id: "app-2",
    company: "Meta",
    role: "AI Developer",
    jobUrl: "https://meta.com/careers/123",
    jd: "Join the Llama integration team. Experience with PyTorch, model optimization, LLM fine-tuning, and React integrations.",
    location: "Menlo Park, CA",
    salary: 225000,
    experienceRequired: "3+ years",
    workMode: "Onsite",
    status: "Offer",
    appliedDate: "2026-04-20",
    appliedFromEmail: "alex.dev@gmail.com",
    resumeUsed: "Resume V3 - AI Engineer Modern",
    coverLetterUsed: "Meta Modern Cover Letter",
    referralUsed: false,
    recruiterAssigned: "Marcus Vance",
    timeline: [
      { stage: "Applied", timestamp: "2026-04-20T08:15:00Z" },
      { stage: "OA", timestamp: "2026-04-25T15:00:00Z" },
      { stage: "HR", timestamp: "2026-05-02T10:00:00Z" },
      { stage: "Technical", timestamp: "2026-05-10T14:00:00Z" },
      { stage: "System Design", timestamp: "2026-05-16T11:00:00Z" },
      { stage: "Final", timestamp: "2026-05-22T16:00:00Z" },
      { stage: "Offer", timestamp: "2026-05-28T09:30:00Z" }
    ],
    source: "LinkedIn",
    notes: "Offer received! Need to negotiate stock grant and compare with Google progress.",
    priority: "High",
    deadline: "2026-06-05",
    workspaceId: "aiml"
  },
  {
    id: "app-3",
    company: "Stripe",
    role: "Staff Backend Engineer",
    jobUrl: "https://stripe.com/jobs/456",
    jd: "Scale international payment structures. Heavy emphasis on Ruby/Go APIs, reliability engineering, and system architectures.",
    location: "San Francisco, CA",
    salary: 240000,
    experienceRequired: "6+ years",
    workMode: "Remote",
    status: "OA",
    appliedDate: "2026-05-24",
    appliedFromEmail: "alex.dev@gmail.com",
    resumeUsed: "Resume V2 - SDE Full Stack",
    coverLetterUsed: "Stripe Tech Cover Letter",
    referralUsed: false,
    recruiterAssigned: "Elena Rostova",
    timeline: [
      { stage: "Wishlist", timestamp: "2026-05-22T18:00:00Z" },
      { stage: "Applied", timestamp: "2026-05-24T12:00:00Z" },
      { stage: "OA", timestamp: "2026-05-28T10:00:00Z" }
    ],
    source: "Company Careers",
    notes: "OA deadline approaching. Focus on database concurrency and API rate-limiting designs.",
    priority: "Medium",
    deadline: "2026-05-31",
    workspaceId: "swe"
  },
  {
    id: "app-4",
    company: "Netflix",
    role: "Senior UI Architect",
    jobUrl: "https://netflix.com/careers/99",
    jd: "Build high performance streaming interfaces. Solid state-management experience, CSS performance, and core web vitals.",
    location: "Los Gatos, CA",
    salary: 280000,
    experienceRequired: "5+ years",
    workMode: "Hybrid",
    status: "Rejected",
    appliedDate: "2026-05-01",
    appliedFromEmail: "alex.dev@gmail.com",
    resumeUsed: "Resume V1 - Harvard Classic",
    coverLetterUsed: "Netflix Classic Cover Letter",
    referralUsed: true,
    recruiterAssigned: "Dave Miller",
    timeline: [
      { stage: "Applied", timestamp: "2026-05-01T09:00:00Z" },
      { stage: "OA", timestamp: "2026-05-05T14:00:00Z" },
      { stage: "Rejected", timestamp: "2026-05-12T17:00:00Z" }
    ],
    source: "Referral",
    notes: "Rejected after initial coding challenge. AI Analyzer flagged missing knowledge in WebAssembly and browser render threads.",
    priority: "High",
    workspaceId: "swe"
  },
  {
    id: "app-5",
    company: "Nvidia",
    role: "ML Platform Engineer",
    jobUrl: "https://nvidia.com/careers/55",
    jd: "Build AI deployment pipelines. High familiarity with CUDA, TensorRT, Triton Server, Kubernetes, and Go.",
    location: "Santa Clara, CA",
    salary: 215000,
    experienceRequired: "4+ years",
    workMode: "Onsite",
    status: "Applied",
    appliedDate: "2026-05-27",
    appliedFromEmail: "alex.dev@gmail.com",
    resumeUsed: "Resume V3 - AI Engineer Modern",
    coverLetterUsed: "",
    referralUsed: false,
    recruiterAssigned: "",
    timeline: [
      { stage: "Applied", timestamp: "2026-05-27T16:45:00Z" }
    ],
    source: "Indeed",
    notes: "Applied. Nvidia careers site was slow. Auto job monitor active.",
    priority: "Medium",
    workspaceId: "aiml"
  }
];

export const initialResumeVersions: ResumeVersion[] = [
  {
    id: "res-1",
    version: "V1",
    name: "Resume V1 - Harvard Classic",
    template: "classic",
    summary: "Senior Software Engineer with 4 years of experience building reliable web systems. Strong foundational knowledge in database engines and distributed system architectures.",
    education: "Stanford University - B.S. in Computer Science (GPA 3.85)",
    experience: "Software Engineer at TechCorp (2023 - Present): Managed deployment migrations saving $40k/yr. Developed high-throughput microservices in Go.\nFrontend Engineer at WebSoft (2022 - 2023): Designed React UI component sets utilized by 40 internal developers.",
    projects: "Distributed Cache: Built custom consensus-based KV store in Go.\nSearch Engine Indexer: Designed fast text indexing logic supporting regex parsing.",
    skills: "Go, Java, Python, SQL, PostgreSQL, Redis, Kubernetes, React, JavaScript, AWS",
    certifications: "AWS Certified Solutions Architect",
    achievements: "Winner of Stanford Hackathon 2021 (Best Scalable Project)",
    isPublic: true,
    atsScore: 78
  },
  {
    id: "res-2",
    version: "V2",
    name: "Resume V2 - SDE Full Stack",
    template: "tech",
    summary: "Staff Full-Stack Specialist with deep expertise in Next.js, Node.js, and high scale system pipelines. Focused on visual animations, modular React architectures, and high performant APIs.",
    education: "Stanford University - B.S. in Computer Science",
    experience: "Software Engineer at TechCorp (2023 - Present): Engineered core dashboards using Next.js/TypeScript. Re-architected express server to serverless layouts.\nFull Stack Intern at PaymentPro (2022): Developed automated invoice modules.",
    projects: "SaaS Dashboard Engine: Visual editor for dragging widgets with web-socket sync.\nAuth Suite: Custom security authentication handler incorporating JWT and MFA.",
    skills: "Next.js, React, TypeScript, Node.js, Express, MongoDB, Tailwind CSS, Zustand, Recharts",
    certifications: "AWS Certified Solutions Architect",
    achievements: "Top 5% GitHub contributor in regional dev circles",
    isPublic: true,
    atsScore: 89
  },
  {
    id: "res-3",
    version: "V3",
    name: "Resume V3 - AI Engineer Modern",
    template: "modern",
    summary: "AI Integration engineer specialize in Model Pipelines, Fine-Tuning Open Source LLMs, and building dynamic context-aware agents. Proficient in CUDA deployments and vector databases.",
    education: "Stanford University - B.S. in Computer Science",
    experience: "ML Integration Lead at InnovateAI (2024 - Present): Deployed microservices processing 1M+ daily LLM token completions. Fine-tuned Llama-3 models.\nAI Analyst at ResearchCorp (2023): Designed search indexing via Pinecone vectors.",
    projects: "VectorSearch PDF: Automated OCR text extractor and embedding compiler.\nAgentChat: Persistent conversational interface with dynamic tools binding.",
    skills: "Python, PyTorch, LlamaIndex, LangChain, Pinecone, CUDA, Triton, Docker, Next.js, FastAPI",
    certifications: "CKA: Certified Kubernetes Administrator",
    achievements: "Published paper on light-weight model fine-tuning architectures",
    isPublic: false,
    atsScore: 94
  }
];

export const initialRecruiterContacts: RecruiterContact[] = [
  {
    id: "rec-1",
    name: "Sarah Jenkins",
    company: "Google",
    email: "sarahjenkins@google.com",
    linkedin: "linkedin.com/in/sarah-jenkins-recruiting",
    notes: "Main point of contact for Senior Software Engineer roles. Very responsive.",
    relationshipScore: 85,
    history: [
      { date: "2026-05-16", type: "Email", summary: "Confirmed receipt of application and setup coding round." },
      { date: "2026-05-24", type: "Call", summary: "Scheduled first technical interview for June 2nd. Sent prep guides." }
    ]
  },
  {
    id: "rec-2",
    name: "Marcus Vance",
    company: "Meta",
    email: "mvance@meta.com",
    linkedin: "linkedin.com/in/marcus-vance-meta",
    notes: "Hiring coordinator for AI divisions. Negotiating base compensation with him.",
    relationshipScore: 95,
    history: [
      { date: "2026-04-22", type: "Email", summary: "Invited to complete online assessment." },
      { date: "2026-05-12", type: "Interview Feedback", summary: "Informed me that technical feedback was strong. Scheduling system design." },
      { date: "2026-05-28", type: "Offer Call", summary: "Presented initial offer of $225k base + $150k RSUs." }
    ]
  },
  {
    id: "rec-3",
    name: "Elena Rostova",
    company: "Stripe",
    email: "elena.r@stripe.com",
    linkedin: "linkedin.com/in/elena-rostova-payments",
    notes: "Sent OA. Hasn't replied to my follow-up regarding the timeline.",
    relationshipScore: 40,
    history: [
      { date: "2026-05-25", type: "Email", summary: "Sent HackerRank test link." }
    ]
  }
];

export const initialEmailMessages: EmailMessage[] = [
  {
    id: "msg-1",
    account: "gmail",
    sender: "mvance@meta.com",
    subject: "Meta AI Developer Role - Offer Package Details",
    date: "2026-05-28",
    body: "Hi Alex, we are thrilled to extend an offer for the AI Developer position at Meta. Below are the compensation details:\nBase Salary: $225,000\nSigning Bonus: $25,000\nRSUs: $150,000 over 4 years\nPlease review and let us know by next week.",
    classification: "Offer",
    isRead: false,
    isSynced: true
  },
  {
    id: "msg-2",
    account: "gmail",
    sender: "sarahjenkins@google.com",
    subject: "Google Interview Schedule - Senior Software Engineer",
    date: "2026-05-25",
    body: "Hi Alex, I hope you are doing well. We would like to schedule your first 45-minute technical coding round. Please use this Calendar link to select a slot: google-meet.com/sarah-jenkins/slot12",
    classification: "Interview",
    isRead: true,
    isSynced: true
  },
  {
    id: "msg-3",
    account: "outlook",
    sender: "no-reply@stripe.com",
    subject: "Stripe Assessment Invitation",
    date: "2026-05-24",
    body: "Dear Candidate, thank you for applying to Stripe. You are invited to complete the Staff Backend Assessment on HackerRank within 7 days. Click here to start: hackerrank.com/stripe-staff-sde-2026",
    classification: "OA",
    isRead: true,
    isSynced: true
  },
  {
    id: "msg-4",
    account: "gmail",
    sender: "dave.miller@netflix.com",
    subject: "Your application to Netflix",
    date: "2026-05-12",
    body: "Hi Alex, thank you for taking the time to complete our assessment. Unfortunately, we will not be moving forward with your candidacy at this time. We will keep your resume on file for future opportunities.",
    classification: "Rejection",
    isRead: true,
    isSynced: true
  },
  {
    id: "msg-5",
    account: "gmail",
    sender: "recruit@instahyre.com",
    subject: "New Job Match: Principal Frontend Engineer at Vercel",
    date: "2026-05-29",
    body: "Hey Alex, Vercel is looking for a Principal Engineer with expertise in Next.js app routes, server components, and Tailwind styling. Fits your profile perfectly.",
    classification: "Recruiter Outreach",
    isRead: false,
    isSynced: false
  }
];

export const initialOfferLetters: OfferLetter[] = [
  {
    id: "off-1",
    company: "Meta",
    role: "AI Developer",
    baseSalary: 225000,
    bonus: 25000,
    rsus: 150000,
    benefits: ["Medical, Dental, Vision (100% paid)", "401k Match (50% up to 6%)", "Free meals & transit subsidies", "Generous parental leave"],
    noticePeriod: "2 Weeks",
    probation: "None",
    scorecard: 92,
    status: "Negotiating"
  }
];

export const initialAutomationRules: AutomationRule[] = [
  {
    id: "aut-1",
    name: "Auto Offer Response Setup",
    trigger: "If Offer Received",
    action: "Notify User & Generate Comparison & Draft Counter-Offer Script",
    isActive: true
  },
  {
    id: "aut-2",
    name: "Study Rejection Feedback Loop",
    trigger: "If Rejected",
    action: "Analyze Rejection Email & Generate Skill Gap Improvement Study Plan",
    isActive: true
  },
  {
    id: "aut-3",
    name: "HackerRank OA Deadline Alerts",
    trigger: "If OA Invitation Detected",
    action: "Add to Calendar & Set Alarm 24 hours prior to expiration",
    isActive: true
  }
];

export const initialOKRs: OKRGoal[] = [
  {
    id: "okr-1",
    title: "Secure a Staff/Senior Role by Summer",
    category: "Short-Term",
    targetDate: "2026-06-30",
    progress: 75,
    keyResults: [
      { id: "kr-1-1", text: "Complete 10 high-tier interviews", completed: false },
      { id: "kr-1-2", text: "Secure 2 competing offers above $200k base", completed: true },
      { id: "kr-1-3", text: "Optimize ATS score for Resume V3 above 90", completed: true }
    ],
    workspaceId: "swe"
  },
  {
    id: "okr-2",
    title: "Complete Advanced Systems Design Course",
    category: "Mid-Term",
    targetDate: "2026-08-15",
    progress: 40,
    keyResults: [
      { id: "kr-2-1", text: "Read 'Designing Data-Intensive Applications'", completed: false },
      { id: "kr-2-2", text: "Build a multi-replica partition simulation module", completed: true },
      { id: "kr-2-3", text: "Solve 20 System Design mock cases", completed: false }
    ],
    workspaceId: "swe"
  }
];

export const initialLearningTopics: LearningTopic[] = [
  {
    id: "learn-1",
    category: "System Design",
    name: "Distributed Caching Schemes",
    status: "In Progress",
    streak: 6,
    checklist: [
      { id: "ch-1-1", text: "Write-through vs Write-back write operations", completed: true },
      { id: "ch-1-2", text: "Consistent hashing ring design logic", completed: true },
      { id: "ch-1-3", text: "Eviction policies (LRU, LFU, ARC) details", completed: false }
    ]
  },
  {
    id: "learn-2",
    category: "DSA",
    name: "Graphs & Dynamic Programming",
    status: "Completed",
    streak: 12,
    checklist: [
      { id: "ch-2-1", text: "Dijkstra's & A* path algorithms", completed: true },
      { id: "ch-2-2", text: "Knapsack variations & memoization matrices", completed: true },
      { id: "ch-2-3", text: "Tarjan's algorithm for strongly connected components", completed: true }
    ]
  },
  {
    id: "learn-3",
    category: "AI/ML",
    name: "Model Fine-Tuning & Quantization",
    status: "Not Started",
    streak: 0,
    checklist: [
      { id: "ch-3-1", text: "LoRA & QLoRA adapters calibration", completed: false },
      { id: "ch-3-2", text: "GGUF vs AWQ quantization weights", completed: false }
    ]
  }
];

export const initialCommunityPosts: CommunityPost[] = [
  {
    id: "post-1",
    author: "CodeWizard",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=80",
    title: "Meta System Design Interview Experience (L5 AI)",
    content: "Just finished my Meta system design round. They focused heavily on scaling feed generation with low latency and real-time updates using WebSockets vs Polling. Be sure to understand your caching layers and database sharding keys!",
    category: "Interviews",
    upvotes: 42,
    replies: 15,
    date: "2026-05-28"
  },
  {
    id: "post-2",
    author: "StanfordAlumSDE",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=80",
    title: "Google Referrals available for Staff SDE (L6) role in Cloud",
    content: "If you have 6+ years of experience and solid credentials in distributed Kubernetes orchestration, PM me with your CV and a brief intro. Happy to refer matching candidates.",
    category: "Referrals",
    upvotes: 89,
    replies: 34,
    date: "2026-05-26"
  }
];

export const initialJournalEntries: CareerJournalEntry[] = [
  {
    id: "jr-1",
    date: "2026-05-29",
    entry: "Completed coding checklist items. Received Meta offer but feeling anxious about negotiating. Need to prioritize Google prep today to secure another offer. Streaks are active.",
    burnoutRisk: 45,
    mood: "Good"
  },
  {
    id: "jr-2",
    date: "2026-05-28",
    entry: "Spent 6 hours on systems prep. Feeling a bit tired but overall optimistic as Meta offer was delivered. Had a good run of solved graph problems on Leetcode.",
    burnoutRisk: 50,
    mood: "Tired"
  },
  {
    id: "jr-3",
    date: "2026-05-27",
    entry: "Productive day. Automated job parsing using the Chrome extension script. Sent two follow-up emails.",
    burnoutRisk: 30,
    mood: "Excellent"
  }
];
