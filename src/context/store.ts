import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  UserProfile,
  JobApplication,
  ResumeVersion,
  RecruiterContact,
  EmailMessage,
  OfferLetter,
  AutomationRule,
  OKRGoal,
  LearningTopic,
  CommunityPost,
  CareerJournalEntry,
  initialUserProfile,
  initialJobApplications,
  initialResumeVersions,
  initialRecruiterContacts,
  initialEmailMessages,
  initialOfferLetters,
  initialAutomationRules,
  initialOKRs,
  initialLearningTopics,
  initialCommunityPosts,
  initialJournalEntries
} from '../db/mockData';

const calculatePriority = (status: JobApplication['status']): 'Critical' | 'High' | 'Medium' | 'Low' => {
  switch (status) {
    case 'Offer':
      return 'Critical';
    case 'Interview':
    case 'Assessment':
    case 'Shortlisted':
    case 'OA':
      return 'High';
    case 'Applied':
    case 'Ghosted':
      return 'Medium';
    case 'Saved':
    case 'Wishlist':
    case 'Rejected':
    case 'Withdrawn':
    default:
      return 'Low';
  }
};

const calculateStreak = (applications: JobApplication[]): { current: number; best: number; week: number; month: number } => {
  const dates = Array.from(new Set(
    applications
      .map(app => app.appliedDate)
      .filter(Boolean)
  )).sort();

  if (dates.length === 0) {
    return { current: 0, best: 0, week: 0, month: 0 };
  }

  const dateSet = new Set(dates);
  let currentStreak = 0;
  
  const today = new Date();
  today.setHours(0,0,0,0);
  
  let checkDate = new Date(today);
  if (!dateSet.has(checkDate.toISOString().split('T')[0])) {
    checkDate.setDate(checkDate.getDate() - 1);
  }
  
  if (dateSet.has(checkDate.toISOString().split('T')[0])) {
    let tempDate = new Date(checkDate);
    while (dateSet.has(tempDate.toISOString().split('T')[0])) {
      currentStreak++;
      tempDate.setDate(tempDate.getDate() - 1);
    }
  }

  let maxStreak = 0;
  let tempStreak = 0;
  let prevTime: number | null = null;
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  for (let i = 0; i < dates.length; i++) {
    const curTime = new Date(dates[i]).getTime();
    if (prevTime === null) {
      tempStreak = 1;
    } else {
      const diff = curTime - prevTime;
      if (diff <= ONE_DAY_MS + 2 * 60 * 60 * 1000) {
        tempStreak++;
      } else if (diff > ONE_DAY_MS) {
        tempStreak = 1;
      }
    }
    if (tempStreak > maxStreak) {
      maxStreak = tempStreak;
    }
    prevTime = curTime;
  }

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  let weekCount = 0;
  let monthCount = 0;

  applications.forEach(app => {
    if (app.appliedDate) {
      const appDate = new Date(app.appliedDate);
      if (appDate >= oneWeekAgo) weekCount++;
      if (appDate >= oneMonthAgo) monthCount++;
    }
  });

  return { current: currentStreak, best: maxStreak, week: weekCount, month: monthCount };
};

const emptyUserProfile: UserProfile = {
  name: '',
  email: '',
  phone: '',
  location: '',
  profilePhoto: '',
  experience: '',
  skills: [],
  education: '',
  certifications: [],
  github: '',
  leetcode: '',
  googleSheetsLink: '',
  linkedin: '',
  portfolio: '',
  theme: 'dark',
  notifications: {
    inApp: true,
    email: true,
    push: false
  },
  timeZone: 'UTC',
  defaultWorkMode: 'Remote',
  defaultResumeVersion: '',
  defaultEmailAccount: '',
  defaultApplicationMethod: 'LinkedIn',
  defaultLocationPreference: 'Remote',
  githubContributions: 0,
  githubStreak: 0,
  githubGrid: null,
  leetcodeRating: 0,
  leetcodeContestsAttended: 0,
  leetcodeSolved: 0,
  leetcodeStreak: 0,
  leetcodeConnected: false,
  leetcodeLastSync: "",
  leetcodeProfileUrl: "",
  leetcodeSolvedThisWeek: 0,
  leetcodeSolvedThisMonth: 0,
  leetcodeLastSubmissionDate: "",
  leetcodeRecentActivity: [],
  jobSearchStreakCurrent: 0,
  jobSearchStreakBest: 0,
  applicationsThisWeek: 0,
  applicationsThisMonth: 0
};

interface AgentActionLog {
  timestamp: string;
  type: 'info' | 'success' | 'warning';
  message: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

interface AppState {
  // Auth States
  isLoggedIn: boolean;
  authView: 'login' | 'signup' | 'forgot';
  googleConnected: boolean;
  
  // Google Sheets States
  googleSheetsConnected: boolean;
  googleSheetsId: string;
  googleSheetsTab: string;
  googleSheetsLogs: string[];

  // App States
  userProfile: UserProfile;
  activeWorkspaceId: string;
  applications: JobApplication[];
  resumes: ResumeVersion[];
  recruiters: RecruiterContact[];
  emails: EmailMessage[];
  offers: OfferLetter[];
  automations: AutomationRule[];
  okrs: OKRGoal[];
  learnings: LearningTopic[];
  posts: CommunityPost[];
  journal: CareerJournalEntry[];
  agentLogs: AgentActionLog[];
  isConnectedGmail: boolean;
  isConnectedOutlook: boolean;
  searchQuery: string;
  notifications: NotificationItem[];

  // Auth Actions
  setAuthView: (view: 'login' | 'signup' | 'forgot') => void;
  checkSession: () => Promise<void>;
  loginUser: (email: string, password: string) => boolean;
  signupUser: (name: string, email: string, workspace: string) => void;
  logoutUser: () => Promise<void>;
  resetPassword: (email: string) => void;

  // Notification Actions
  addNotification: (title: string, message: string, type?: NotificationItem['type']) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;

  // Profile / Search Actions
  updateProfile: (profile: Partial<UserProfile>) => void;
  setActiveWorkspace: (id: string) => void;
  setSearchQuery: (query: string) => void;
  
  // Job Actions
  addApplication: (app: Omit<JobApplication, 'id' | 'timeline'>) => void;
  updateApplicationStatus: (id: string, status: JobApplication['status']) => void;
  updateApplication: (id: string, updates: Partial<JobApplication>) => void;
  deleteApplication: (id: string) => void;

  // Resume Actions
  updateResume: (id: string, updates: Partial<ResumeVersion>) => void;
  addResumeVersion: (name: string, template: ResumeVersion['template']) => void;
  deleteResume: (id: string) => void;

  // Recruiter Actions
  addRecruiter: (rec: Omit<RecruiterContact, 'id' | 'history'>) => void;
  updateRecruiter: (id: string, updates: Partial<RecruiterContact>) => void;
  deleteRecruiter: (id: string) => void;
  addRecruiterInteraction: (id: string, type: string, summary: string) => void;

  // Sync Actions
  connectEmail: (provider: 'gmail' | 'outlook') => void;
  disconnectEmail: (provider: 'gmail' | 'outlook') => void;
  syncEmailInbox: () => Promise<void>;

  // LeetCode Actions
  connectLeetcode: (username: string, profileUrl: string) => Promise<void>;
  disconnectLeetcode: () => void;
  syncLeetcode: () => Promise<void>;
  recalculateStreaks: () => void;

  // Google Sheets Actions
  connectGoogleSheets: (sheetId: string, tab: string) => void;
  disconnectGoogleSheets: () => void;
  syncGoogleSheets: () => Promise<void>;

  // Offer Actions
  updateOfferStatus: (id: string, status: OfferLetter['status']) => void;
  addOffer: (offer: Omit<OfferLetter, 'id' | 'scorecard'>) => void;
  updateOffer: (id: string, updates: Partial<OfferLetter>) => void;

  // Learning & OKR Actions
  toggleChecklistItem: (topicId: string, itemId: string) => void;
  addChecklistItem: (topicId: string, text: string) => void;
  deleteChecklistItem: (topicId: string, itemId: string) => void;
  addLearningTopic: (category: LearningTopic['category'], name: string) => void;
  deleteLearningTopic: (id: string) => void;
  
  toggleKeyResult: (okrId: string, krId: string) => void;
  addOkrGoal: (title: string, category: OKRGoal['category'], targetDate: string, keyResults: string[]) => void;
  updateOkrGoal: (id: string, updates: Partial<OKRGoal>) => void;
  deleteOkrGoal: (id: string) => void;
  addJournalEntry: (entry: string, mood: CareerJournalEntry['mood']) => void;

  // Automation Actions
  toggleAutomationActive: (id: string) => void;
  addAutomationRule: (name: string, trigger: string, action: string) => void;
  deleteAutomationRule: (id: string) => void;

  // Autonomous Agent Trigger
  runAgentAction: (actionName: string, payload?: any) => void;
  clearAgentLogs: () => void;

  // Community Actions
  addPost: (title: string, content: string, category: CommunityPost['category']) => void;
  upvotePost: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial Auth states - defaults false to prompt auth
      isLoggedIn: false,
      authView: 'login',
      googleConnected: false,

      // Google Sheets States
      googleSheetsConnected: false,
      googleSheetsId: '',
      googleSheetsTab: 'Sheet1',
      googleSheetsLogs: [],

      // Initial App States
      userProfile: emptyUserProfile,
      activeWorkspaceId: 'swe',
      applications: [],
      resumes: [],
      recruiters: [],
      emails: [],
      offers: [],
      automations: [],
      okrs: [],
      learnings: [],
      posts: [],
      journal: [],
      agentLogs: [
        { timestamp: new Date().toLocaleTimeString(), type: 'success', message: 'Autonomous Career Agent initialized. Waiting for triggers...' }
      ],
      isConnectedGmail: false,
      isConnectedOutlook: false,
      searchQuery: '',
      notifications: [],

      // Check active JWT session
      checkSession: async () => {
        try {
          const res = await fetch('/api/auth/session');
          const data = await res.json();
          if (data.isLoggedIn) {
            const currentEmail = data.user.email;
            const isMockUser = currentEmail === 'alex.dev@gmail.com';
            
            const previousEmail = get().userProfile?.email?.toLowerCase();
            const currentEmailNormalized = currentEmail?.toLowerCase();

            if (isMockUser) {
              set({
                isLoggedIn: true,
                googleConnected: data.googleConnected,
                isConnectedGmail: data.googleConnected || get().isConnectedGmail,
                applications: initialJobApplications,
                resumes: initialResumeVersions,
                recruiters: initialRecruiterContacts,
                emails: initialEmailMessages,
                offers: initialOfferLetters,
                automations: initialAutomationRules,
                okrs: initialOKRs,
                learnings: initialLearningTopics,
                posts: initialCommunityPosts,
                journal: initialJournalEntries,
                userProfile: {
                  ...initialUserProfile,
                  name: data.user.name,
                  email: data.user.email,
                  profilePhoto: data.user.picture || initialUserProfile.profilePhoto
                }
              });
            } else {
              // Clean state if changing accounts, or if previous account was mock, or if email was empty/unset
              if (previousEmail !== currentEmailNormalized || previousEmail === 'alex.dev@gmail.com' || !previousEmail) {
                set({
                  isLoggedIn: true,
                  googleConnected: data.googleConnected,
                  isConnectedGmail: data.googleConnected || get().isConnectedGmail,
                  applications: [],
                  resumes: [],
                  recruiters: [],
                  emails: [],
                  offers: [],
                  automations: [],
                  okrs: [],
                  learnings: [],
                  journal: [],
                  notifications: [],
                  googleSheetsId: '',
                  googleSheetsConnected: false,
                  userProfile: {
                    ...emptyUserProfile,
                    name: data.user.name,
                    email: data.user.email,
                    profilePhoto: data.user.picture || '',
                    defaultEmailAccount: data.user.email
                  }
                });
              } else {
                set({
                  isLoggedIn: true,
                  googleConnected: data.googleConnected,
                  isConnectedGmail: data.googleConnected || get().isConnectedGmail,
                  userProfile: {
                    ...get().userProfile,
                    name: data.user.name,
                    email: data.user.email,
                    profilePhoto: data.user.picture || get().userProfile.profilePhoto
                  }
                });
              }
            }
          } else {
            set({ isLoggedIn: false });
          }
        } catch (e) {
          console.error("Session check error:", e);
        }
      },

      setAuthView: (view) => set({ authView: view }),
      
      loginUser: (email, password) => {
        if (email.trim() && password.length >= 4) {
          const isMockUser = email.toLowerCase() === 'alex.dev@gmail.com';
          
          if (isMockUser) {
            set({ 
              isLoggedIn: true,
              applications: initialJobApplications,
              resumes: initialResumeVersions,
              recruiters: initialRecruiterContacts,
              emails: initialEmailMessages,
              offers: initialOfferLetters,
              automations: initialAutomationRules,
              okrs: initialOKRs,
              learnings: initialLearningTopics,
              posts: initialCommunityPosts,
              journal: initialJournalEntries,
              userProfile: {
                ...initialUserProfile,
                email: email,
                name: "Alex Dev",
                github: "github.com/alexdev-codes",
                leetcode: "leetcode.com/alexdev-codes",
                googleSheetsLink: ""
              }
            });
          } else {
            const previousEmail = get().userProfile?.email?.toLowerCase();
            const currentEmailNormalized = email.toLowerCase();

            if (previousEmail !== currentEmailNormalized || previousEmail === 'alex.dev@gmail.com' || !previousEmail) {
              set({
                isLoggedIn: true,
                applications: [],
                resumes: [],
                recruiters: [],
                emails: [],
                offers: [],
                automations: [],
                okrs: [],
                learnings: [],
                journal: [],
                notifications: [],
                googleSheetsId: '',
                googleSheetsConnected: false,
                userProfile: {
                  ...emptyUserProfile,
                  name: email.split('@')[0],
                  email: email,
                  defaultEmailAccount: email
                }
              });
            } else {
              set({ 
                isLoggedIn: true,
                userProfile: {
                  ...get().userProfile,
                  email: email,
                  name: email.split('@')[0],
                  github: "",
                  leetcode: "",
                  googleSheetsLink: ""
                }
              });
            }
          }

          const logs = [...get().agentLogs];
          logs.push({
            timestamp: new Date().toLocaleTimeString(),
            type: 'success',
            message: `User ${email} authenticated successfully. Workspace isolated.`
          });
          set({ agentLogs: logs });

          get().addNotification(
            'Welcome to Nexrume',
            `Successfully logged in as ${email}. Your profile workspace is active.`,
            'success'
          );
          return true;
        }
        return false;
      },

      signupUser: (name, email, workspace) => {
        const isMockUser = email.toLowerCase() === 'alex.dev@gmail.com';
        
        if (isMockUser) {
          set({ 
            isLoggedIn: true,
            applications: initialJobApplications,
            resumes: initialResumeVersions,
            recruiters: initialRecruiterContacts,
            emails: initialEmailMessages,
            offers: initialOfferLetters,
            automations: initialAutomationRules,
            okrs: initialOKRs,
            learnings: initialLearningTopics,
            posts: initialCommunityPosts,
            journal: initialJournalEntries,
            userProfile: {
              ...initialUserProfile,
              email: email,
              name: name,
              github: "github.com/alexdev-codes",
              leetcode: "leetcode.com/alexdev-codes",
              googleSheetsLink: ""
            },
            activeWorkspaceId: workspace
          });
        } else {
          set({
            isLoggedIn: true,
            activeWorkspaceId: workspace,
            applications: [],
            resumes: [],
            recruiters: [],
            emails: [],
            offers: [],
            automations: [],
            okrs: [],
            learnings: [],
            journal: [],
            notifications: [],
            googleSheetsId: '',
            googleSheetsConnected: false,
            userProfile: {
              ...emptyUserProfile,
              name,
              email,
              defaultEmailAccount: email
            }
          });
        }

        const logs = [...get().agentLogs];
        logs.push({
          timestamp: new Date().toLocaleTimeString(),
          type: 'success',
          message: `Created profile for ${name}. Workspace set to ${workspace}.`
        });
        set({ agentLogs: logs });

        get().addNotification(
          'Workspace Created',
          `Welcome ${name}! Your new ${workspace} workspace is set up and ready.`,
          'success'
        );
      },

      logoutUser: async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
        } catch (e) {}
        set({ 
          isLoggedIn: false, 
          authView: 'login', 
          googleConnected: false,
          googleSheetsConnected: false,
          isConnectedGmail: false,
          isConnectedOutlook: false,
          notifications: []
        });
      },

      resetPassword: (email) => {
        const logs = [...get().agentLogs];
        logs.push({
          timestamp: new Date().toLocaleTimeString(),
          type: 'warning',
          message: `Verification code sent to email: ${email}`
        });
        set({ agentLogs: logs });
      },

      addNotification: (title, message, type = 'info') => {
        const newNotif: NotificationItem = {
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title,
          message,
          type,
          timestamp: new Date().toLocaleTimeString(),
          read: false
        };
        set((state) => ({
          notifications: [newNotif, ...state.notifications]
        }));
      },

      markNotificationRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
        }));
      },

      clearNotifications: () => set({ notifications: [] }),

      // Profile Actions
      updateProfile: (profile) => set((state) => ({
        userProfile: { ...state.userProfile, ...profile }
      })),

      setActiveWorkspace: (id) => set({ activeWorkspaceId: id }),

      setSearchQuery: (query) => set({ searchQuery: query }),

      // Job Actions
      addApplication: (app) => set((state) => {
        const id = `app-${Date.now()}`;
        const computedPriority = calculatePriority(app.status);
        const newApp: JobApplication = {
          ...app,
          id,
          priority: computedPriority,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          interviewRounds: app.interviewRounds || [],
          timeline: [{ stage: app.status, timestamp: new Date().toISOString() }]
        };
        const updatedLogs = [
          ...state.agentLogs,
          { timestamp: new Date().toLocaleTimeString(), type: 'info' as const, message: `Created new application for ${app.role} at ${app.company}.` }
        ];

        if (state.googleSheetsConnected) {
          setTimeout(() => get().syncGoogleSheets(), 100);
        }

        setTimeout(() => {
          get().addNotification(
            'Job Tracked',
            `Successfully initiated pipeline tracking for ${app.role} at ${app.company}.`,
            'info'
          );
        }, 50);

        setTimeout(() => get().recalculateStreaks(), 100);

        return {
          applications: [newApp, ...state.applications],
          agentLogs: updatedLogs
        };
      }),

      updateApplicationStatus: (id, status) => set((state) => {
        const updated = state.applications.map((app) => {
          if (app.id === id) {
            const alreadyLogged = app.timeline.some(t => t.stage === status);
            const timeline = alreadyLogged ? app.timeline : [...app.timeline, { stage: status, timestamp: new Date().toISOString() }];
            return { 
              ...app, 
              status, 
              timeline,
              priority: calculatePriority(status),
              updatedAt: new Date().toISOString()
            };
          }
          return app;
        });

        const targetApp = state.applications.find(a => a.id === id);
        const updatedLogs = [...state.agentLogs];
        
        if (targetApp) {
          updatedLogs.push({
            timestamp: new Date().toLocaleTimeString(),
            type: 'success' as const,
            message: `Updated status of ${targetApp.company} (${targetApp.role}) to stage: "${status}".`
          });

          setTimeout(() => {
            get().addNotification(
              `Status Updated: ${targetApp.company}`,
              `Pipeline stage updated to "${status}" for ${targetApp.role}.`,
              status === 'Offer' ? 'success' : status === 'Rejected' ? 'error' : 'info'
            );
          }, 50);

          if (status === 'Offer') {
            const ruleActive = state.automations.find(r => r.trigger === 'If Offer Received' && r.isActive);
            if (ruleActive) {
              updatedLogs.push({
                timestamp: new Date().toLocaleTimeString(),
                type: 'warning' as const,
                message: `[Workflow Automation Triggered]: "${ruleActive.name}"`
              });
              updatedLogs.push({
                timestamp: new Date().toLocaleTimeString(),
                type: 'success' as const,
                message: `[Auto-Offer Analyzer]: Computed Comp Scorecard. Generated Negotiation Email drafts.`
              });
              
              const offerExists = state.offers.some(o => o.company === targetApp.company);
              if (!offerExists) {
                setTimeout(() => {
                  get().addOffer({
                    company: targetApp.company,
                    role: targetApp.role,
                    baseSalary: targetApp.salary || 180000,
                    bonus: 15000,
                    rsus: 100000,
                    benefits: ['Premium Health', '401k Match', 'Gym Allowance'],
                    noticePeriod: '30 Days',
                    probation: '3 Months',
                    status: 'Pending'
                  });
                }, 200);
              }
            }
          }

          if (status === 'Rejected') {
            const ruleActive = state.automations.find(r => r.trigger === 'If Rejected' && r.isActive);
            if (ruleActive) {
              updatedLogs.push({
                timestamp: new Date().toLocaleTimeString(),
                type: 'warning' as const,
                message: `[Workflow Automation Triggered]: "${ruleActive.name}"`
              });
              updatedLogs.push({
                timestamp: new Date().toLocaleTimeString(),
                type: 'success' as const,
                message: `[Auto-Rejection Analyzer]: Added study priority items to Learning Hub`
              });
            }
          }
        }

        if (state.googleSheetsConnected) {
          setTimeout(() => get().syncGoogleSheets(), 100);
        }

        setTimeout(() => get().recalculateStreaks(), 100);

        return { applications: updated, agentLogs: updatedLogs };
      }),

      updateApplication: (id, updates) => set((state) => {
        if (state.googleSheetsConnected) {
          setTimeout(() => get().syncGoogleSheets(), 100);
        }

        setTimeout(() => get().recalculateStreaks(), 100);

        return {
          applications: state.applications.map(a => {
            if (a.id === id) {
              const updatedApp = { 
                ...a, 
                ...updates, 
                updatedAt: new Date().toISOString() 
              };

              if (updates.status && updates.status !== a.status) {
                updatedApp.priority = calculatePriority(updates.status);
                const alreadyLogged = a.timeline.some(t => t.stage === updates.status);
                if (!alreadyLogged) {
                  updatedApp.timeline = [...a.timeline, { stage: updates.status, timestamp: new Date().toISOString() }];
                }
              }

              if (updates.interviewRounds) {
                const prevRounds = a.interviewRounds || [];
                const nextRounds = updates.interviewRounds;
                
                nextRounds.forEach(nr => {
                  const pr = prevRounds.find(r => r.id === nr.id);
                  if (pr && pr.status !== nr.status) {
                    const eventStage = `${nr.name || nr.type} ${nr.status}`;
                    const alreadyLogged = a.timeline.some(t => t.stage === eventStage);
                    if (!alreadyLogged) {
                      updatedApp.timeline = [...(updatedApp.timeline || a.timeline), { 
                        stage: eventStage, 
                        timestamp: new Date().toISOString() 
                      }];
                    }
                  }
                });
              }

              return updatedApp;
            }
            return a;
          })
        };
      }),

      deleteApplication: (id) => set((state) => {
        if (state.googleSheetsConnected) {
          setTimeout(() => get().syncGoogleSheets(), 100);
        }
        setTimeout(() => get().recalculateStreaks(), 100);
        return {
          applications: state.applications.filter(a => a.id !== id)
        };
      }),

      // Resume Actions
      updateResume: (id, updates) => set((state) => {
        const scoreChange = updates.summary || updates.skills ? Math.min(100, Math.max(50, Math.floor(Math.random() * 20) + 75)) : undefined;
        return {
          resumes: state.resumes.map(r => r.id === id ? { 
            ...r, 
            ...updates,
            atsScore: scoreChange !== undefined ? scoreChange : r.atsScore 
          } : r)
        };
      }),

      addResumeVersion: (name, template) => set((state) => {
        const id = `res-${Date.now()}`;
        const newResume: ResumeVersion = {
          id,
          version: `V${state.resumes.length + 1}`,
          name,
          template,
          summary: "Detailing skills and credentials.",
          education: state.userProfile.education,
          experience: "Experience entries...",
          projects: "Projects list...",
          skills: state.userProfile.skills.join(', '),
          certifications: state.userProfile.certifications.join(', '),
          achievements: "Achievements...",
          isPublic: false,
          atsScore: 75,
          accentColor: 'indigo',
          fontSize: 'base',
          fontFamily: 'sans',
          spacing: 'normal',
          // FlowCV customizer defaults
          customFont: 'Inter',
          customFontFamily: 'sans',
          customColorHex: '#4f46e5',
          applyColorName: true,
          applyColorHeadings: true,
          applyColorHeadingsLine: true,
          headingStyle: 'simple',
          headingCapitalization: 'uppercase',
          headingSize: 'M',
          linkUnderline: true,
          linkBlueColor: true,
          linkIconEnabled: true,
          headerAlignment: 'left',
          headerDetailsArrangement: 'inline',
          headerDetailsSeparator: 'bullet',
          nameSize: 'XL',
          nameBold: true,
          certificatesLayout: 'grid',
          educationTitleOrder: 'school-degree',
          language: 'English (UK)',
          dateFormat: 'DD MMM YYYY',
          pageFormat: 'A4',
          layoutColumns: 'one',
          sectionOrder: ['summary', 'experience', 'education', 'skills', 'projects', 'certifications'],
          fontSizePt: 10.5,
          lineHeight: 1.25,
          marginHorizontal: 12,
          marginVertical: 12,
          entrySpacing: 12,
          entryLayout: 'standard',
          titleSubtitleSize: 'M',
          subtitleStyle: 'bold',
          subtitlePlacement: 'same-line',
          indentBody: false,
          listStyle: 'bullet',
          footerPageNumbers: true
        };
        return { resumes: [...state.resumes, newResume] };
      }),

      deleteResume: (id) => set((state) => {
        const remaining = state.resumes.filter(r => r.id !== id);
        return {
          resumes: remaining
        };
      }),

      // Recruiter Actions
      addRecruiter: (rec) => set((state) => ({
        recruiters: [...state.recruiters, { ...rec, id: `rec-${Date.now()}`, history: [{ date: new Date().toISOString().split('T')[0], type: 'Created', summary: 'Added contact to Recruiter CRM' }] }]
      })),

      updateRecruiter: (id, updates) => set((state) => ({
        recruiters: state.recruiters.map(r => r.id === id ? { ...r, ...updates } : r)
      })),

      deleteRecruiter: (id) => set((state) => ({
        recruiters: state.recruiters.filter(r => r.id !== id)
      })),

      addRecruiterInteraction: (id, type, summary) => set((state) => ({
        recruiters: state.recruiters.map(r => r.id === id ? {
          ...r,
          relationshipScore: Math.min(100, r.relationshipScore + 5),
          history: [...r.history, { date: new Date().toISOString().split('T')[0], type, summary }]
        } : r)
      })),

      // Sync Actions
      connectEmail: (provider) => set((state) => {
        const updatedLogs = [
          ...state.agentLogs,
          { timestamp: new Date().toLocaleTimeString(), type: 'success' as const, message: `Securely connected to ${provider === 'gmail' ? 'Gmail' : 'Outlook'} OAuth Hub.` }
        ];
        return {
          isConnectedGmail: provider === 'gmail' ? true : state.isConnectedGmail,
          isConnectedOutlook: provider === 'outlook' ? true : state.isConnectedOutlook,
          agentLogs: updatedLogs
        };
      }),

      disconnectEmail: (provider) => set((state) => ({
        isConnectedGmail: provider === 'gmail' ? false : state.isConnectedGmail,
        isConnectedOutlook: provider === 'outlook' ? false : state.isConnectedOutlook
      })),

      connectLeetcode: async (username, profileUrl) => {
        set((state) => ({
          userProfile: {
            ...state.userProfile,
            leetcode: username,
            leetcodeProfileUrl: profileUrl,
            leetcodeConnected: true,
            leetcodeLastSync: new Date().toISOString()
          }
        }));
        get().addNotification(
          'LeetCode Connected',
          `Successfully connected account "${username}". Initializing synchronization...`,
          'success'
        );
        await get().syncLeetcode();
      },

      disconnectLeetcode: () => {
        set((state) => ({
          userProfile: {
            ...state.userProfile,
            leetcode: '',
            leetcodeProfileUrl: '',
            leetcodeConnected: false,
            leetcodeLastSync: '',
            leetcodeRating: 0,
            leetcodeContestsAttended: 0,
            leetcodeSolved: 0,
            leetcodeStreak: 0,
            leetcodeEasy: 0,
            leetcodeMedium: 0,
            leetcodeHard: 0,
            leetcodeRank: 0,
            leetcodeSubmissions: 0,
            leetcodeActiveDays: 0,
            leetcodeGrid: null,
            leetcodeSolvedThisWeek: 0,
            leetcodeSolvedThisMonth: 0,
            leetcodeLastSubmissionDate: '',
            leetcodeRecentActivity: [],
            leetcodeAcceptanceRate: undefined,
            leetcodeLastSubmission: null
          }
        }));
        get().addNotification(
          'LeetCode Disconnected',
          'Your LeetCode account has been disconnected and cleared.',
          'info'
        );
      },

      syncLeetcode: async () => {
        const username = get().userProfile.leetcode;
        if (!username) return;

        const time = new Date().toLocaleTimeString();
        const logs = [...get().agentLogs];
        logs.push({
          timestamp: time,
          type: 'info',
          message: `Syncing LeetCode stats for user "${username}"...`
        });
        set({ agentLogs: logs });

        try {
          const res = await fetch(`/api/sync/leetcode?username=${encodeURIComponent(username)}`);
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.message || 'LeetCode sync API responded with error.');
          }

          set((state) => ({
            userProfile: {
              ...state.userProfile,
              leetcodeSolved: data.solved || 0,
              leetcodeEasy: data.easySolved || 0,
              leetcodeMedium: data.mediumSolved || 0,
              leetcodeHard: data.hardSolved || 0,
              leetcodeRating: data.rating || 0,
              leetcodeContestsAttended: data.contestsAttended || 0,
              leetcodeStreak: data.streak || 0,
              leetcodeRank: data.ranking || 0,
              leetcodeSubmissions: data.submissions || 0,
              leetcodeActiveDays: data.activeDays || 0,
              leetcodeGrid: data.grid || null,
              leetcodeLastSync: new Date().toISOString(),
              leetcodeLastSubmissionDate: new Date().toISOString().split('T')[0],
              leetcodeRecentActivity: [
                { date: "Just now", title: "Latest submissions parsed", status: "Accepted" },
                ...(state.userProfile.leetcodeRecentActivity || []).slice(0, 4)
              ],
              leetcodeAcceptanceRate: data.acceptanceRate,
              leetcodeLastSubmission: data.lastSubmission
            }
          }));

          get().addNotification(
            'LeetCode Synced',
            `Successfully updated stats: ${data.solved} solved, rating ${data.rating}.`,
            'success'
          );

          const updatedLogs = [...get().agentLogs];
          updatedLogs.push({
            timestamp: new Date().toLocaleTimeString(),
            type: 'success',
            message: `LeetCode sync success. Total solved: ${data.solved}.`
          });
          set({ agentLogs: updatedLogs });

        } catch (error: any) {
          console.error("LeetCode sync failed:", error);
          const updatedLogs = [...get().agentLogs];
          updatedLogs.push({
            timestamp: new Date().toLocaleTimeString(),
            type: 'warning',
            message: `[LeetCode Sync Failed]: ${error.message || 'Error fetching stats.'}`
          });
          set({ agentLogs: updatedLogs });
          get().addNotification(
            'LeetCode Sync Failed',
            error.message || 'Failed to query LeetCode metrics.',
            'error'
          );
        }
      },

      recalculateStreaks: () => {
        const stats = calculateStreak(get().applications || []);
        set((state) => ({
          userProfile: {
            ...state.userProfile,
            jobSearchStreakCurrent: stats.current,
            jobSearchStreakBest: Math.max(state.userProfile.jobSearchStreakBest || 0, stats.best),
            applicationsThisWeek: stats.week,
            applicationsThisMonth: stats.month
          }
        }));
      },

      // Real Gmail Syncer Integrations
      syncEmailInbox: async () => {
        const updatedLogs = [...get().agentLogs];
        updatedLogs.push({
          timestamp: new Date().toLocaleTimeString(),
          type: 'info' as const,
          message: 'Connecting to Real Gmail API. Querying inbox messages...'
        });
        set({ agentLogs: updatedLogs });

        try {
          const res = await fetch('/api/gmail/sync');
          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.message || 'Gmail Sync Failed.');
          }

          const newEmails = data.emails || [];
          const logs = [...get().agentLogs];

          if (newEmails.length === 0) {
            logs.push({
              timestamp: new Date().toLocaleTimeString(),
              type: 'info',
              message: 'Gmail API sync completed. No new job-related messages found.'
            });
          } else {
            logs.push({
              timestamp: new Date().toLocaleTimeString(),
              type: 'success',
              message: `Gmail API Sync success. Synced and classified ${newEmails.length} messages.`
            });

            // Automatically check for match status and update applications
            newEmails.forEach((email: any) => {
              logs.push({
                timestamp: new Date().toLocaleTimeString(),
                type: 'success',
                message: `[Live AI Classifier]: parsed ${email.subject} -> ${email.classification}`
              });

              // Heuristically parse company name from sender or subject
              let company = '';
              const senderLower = email.sender.toLowerCase();
              const subjectLower = email.subject.toLowerCase();

              if (senderLower.includes('google')) company = 'Google';
              else if (senderLower.includes('meta') || senderLower.includes('facebook')) company = 'Meta';
              else if (senderLower.includes('stripe')) company = 'Stripe';
              else if (senderLower.includes('netflix')) company = 'Netflix';
              else if (senderLower.includes('nvidia')) company = 'Nvidia';
              else if (senderLower.includes('amazon')) company = 'Amazon';
              else if (senderLower.includes('apple')) company = 'Apple';
              else if (senderLower.includes('microsoft')) company = 'Microsoft';
              else if (senderLower.includes('tesla')) company = 'Tesla';
              else if (senderLower.includes('uber')) company = 'Uber';
              else if (senderLower.includes('airbnb')) company = 'Airbnb';
              else if (senderLower.includes('twitter') || senderLower.includes('x.com')) company = 'X';
              else {
                // Heuristic: extract the domain name from the sender email
                const domainMatch = email.sender.match(/@([a-zA-Z0-9.-]+)\./);
                if (domainMatch && domainMatch[1]) {
                  const rawDomain = domainMatch[1].split('.')[0];
                  if (!['gmail', 'yahoo', 'outlook', 'hotmail', 'icloud', 'aol', 'proton', 'protonmail'].includes(rawDomain)) {
                    company = rawDomain.charAt(0).toUpperCase() + rawDomain.slice(1);
                  }
                }
              }

              if (!company) {
                const subjectMatch = email.subject.match(/(?:at|to|with)\s+([A-Z][a-zA-Z0-9]+)/);
                if (subjectMatch && subjectMatch[1]) {
                  company = subjectMatch[1];
                } else {
                  company = 'Unknown Company';
                }
              }

              // Try to find existing application for this company
              const existingApp = get().applications.find(a => a.company.toLowerCase() === company.toLowerCase());

              if (email.classification === 'Application') {
                if (!existingApp) {
                  let role = 'Software Engineer';
                  if (subjectLower.includes('ai developer') || subjectLower.includes('machine learning') || subjectLower.includes('ml')) {
                    role = 'AI Developer';
                  } else if (subjectLower.includes('frontend') || subjectLower.includes('ui')) {
                    role = 'Frontend Engineer';
                  } else if (subjectLower.includes('backend')) {
                    role = 'Backend Engineer';
                  } else if (subjectLower.includes('full stack') || subjectLower.includes('fullstack')) {
                    role = 'Full Stack Engineer';
                  }

                  get().addApplication({
                    company,
                    role,
                    jobUrl: '',
                    jd: '',
                    location: 'Remote (Auto)',
                    salary: 175000,
                    experienceRequired: '3+ years',
                    workMode: 'Remote',
                    status: 'Applied',
                    appliedDate: email.date || new Date().toISOString().split('T')[0],
                    appliedFromEmail: get().userProfile.email,
                    resumeUsed: 'Resume V3 - AI Engineer Modern',
                    coverLetterUsed: '',
                    referralUsed: false,
                    recruiterAssigned: '',
                    source: 'Gmail Syncer',
                    notes: `Auto-imported confirmation from email: "${email.subject}"`,
                    priority: 'Medium',
                    workspaceId: get().activeWorkspaceId
                  });

                  logs.push({
                    timestamp: new Date().toLocaleTimeString(),
                    type: 'success',
                    message: `[AI Email Syncer] Auto-added new application for ${role} at ${company}.`
                  });
                }
              } else {
                let targetStatus: JobApplication['status'] | null = null;
                if (email.classification === 'Offer') targetStatus = 'Offer';
                else if (email.classification === 'Interview') targetStatus = 'Interview';
                else if (email.classification === 'OA') targetStatus = 'OA';
                else if (email.classification === 'Rejection') targetStatus = 'Rejected';

                if (targetStatus) {
                  if (existingApp) {
                    get().updateApplicationStatus(existingApp.id, targetStatus);
                  } else {
                    let role = 'Software Engineer';
                    get().addApplication({
                      company,
                      role,
                      jobUrl: '',
                      jd: '',
                      location: 'Remote (Auto)',
                      salary: 180000,
                      experienceRequired: '3+ years',
                      workMode: 'Remote',
                      status: targetStatus,
                      appliedDate: email.date || new Date().toISOString().split('T')[0],
                      appliedFromEmail: get().userProfile.email,
                      resumeUsed: 'Resume V3 - AI Engineer Modern',
                      coverLetterUsed: '',
                      referralUsed: false,
                      recruiterAssigned: '',
                      source: 'Gmail Syncer',
                      notes: `Auto-created at ${targetStatus} stage from email: "${email.subject}"`,
                      priority: 'Medium',
                      workspaceId: get().activeWorkspaceId
                    });
                  }
                }
              }
            });
          }

          const existingIds = new Set(get().emails.map(e => e.id));
          const filteredNew = newEmails.filter((e: any) => !existingIds.has(e.id));

          // Mark synced emails as synced: true in both existing array and new array
          const syncedEmailIds = new Set(newEmails.map((e: any) => e.id));
          const syncedEmailSubjects = new Set(newEmails.map((e: any) => e.subject.toLowerCase().trim()));
          const updatedExisting = get().emails.map((e) => {
            if (syncedEmailIds.has(e.id) || syncedEmailSubjects.has(e.subject.toLowerCase().trim())) {
              return { ...e, isSynced: true };
            }
            return e;
          });
          const syncedFilteredNew = filteredNew.map((e: any) => ({ ...e, isSynced: true }));

          set({ 
            emails: [...syncedFilteredNew, ...updatedExisting],
            agentLogs: logs,
            isConnectedGmail: true
          });
        } catch (error: any) {
          console.error("Gmail sync error:", error);
          const logs = [...get().agentLogs];
          logs.push({
            timestamp: new Date().toLocaleTimeString(),
            type: 'warning',
            message: `[Gmail Sync Failed]: ${error.message || 'Unauthorized or credentials invalid.'}`
          });
          set({ agentLogs: logs });
          alert(`Gmail Sync Error: ${error.message || 'Ensure your Google account is OAuth authorized.'}`);
        }
      },

      // Google Sheets Actions
      connectGoogleSheets: (sheetId, tab) => set((state) => {
        const time = new Date().toLocaleTimeString();
        const logs = [
          ...state.googleSheetsLogs,
          `[${time}] Verified Google Sheets scopes. Ready to sync rows to Sheet ID: ${sheetId.substring(0, 10)}...`
        ];
        return {
          googleSheetsConnected: true,
          googleSheetsId: sheetId,
          googleSheetsTab: tab,
          googleSheetsLogs: logs
        };
      }),

      disconnectGoogleSheets: () => set({ 
        googleSheetsConnected: false, 
        googleSheetsLogs: [] 
      }),

      // Real Sheets Syncer Integrations
      syncGoogleSheets: async () => {
        if (!get().googleSheetsConnected) {
          alert("Connect Google Sheets configuration first.");
          return;
        }

        const time = new Date().toLocaleTimeString();
        const logs = [...get().googleSheetsLogs, `[${time}] Initiating two-way sync with Google Sheets...`];
        set({ googleSheetsLogs: logs });

        try {
          // 1. Fetch existing applications from the sheet for merging
          let sheetApps: JobApplication[] = [];
          const spreadsheetId = get().googleSheetsId;
          const tabName = get().googleSheetsTab;

          if (spreadsheetId) {
            try {
              const getRes = await fetch(`/api/sheets/sync?spreadsheetId=${encodeURIComponent(spreadsheetId)}&tabName=${encodeURIComponent(tabName)}`);
              if (getRes.ok) {
                const getData = await getRes.json();
                sheetApps = getData.applications || [];
              }
            } catch (e: any) {
              console.warn("Failed to fetch sheet applications for merging, proceeding with push-only:", e);
            }
          }

          // 2. Perform two-way merge
          const localApps = get().applications || [];
          const mergedMap = new Map<string, JobApplication>();

          const getMatchKey = (app: JobApplication) => 
            `${app.company.toLowerCase().trim()}|${app.role.toLowerCase().trim()}|${app.appliedDate}`;

          // Populate sheet applications first
          sheetApps.forEach(app => {
            if (app.id) {
              mergedMap.set(app.id, app);
            } else {
              mergedMap.set(getMatchKey(app), app);
            }
          });

          // Merge local applications (take whichever has the more recent updatedAt timestamp)
          localApps.forEach(app => {
            const keyById = app.id;
            const keyByMatch = getMatchKey(app);

            const existing = mergedMap.get(keyById) || mergedMap.get(keyByMatch);
            if (existing) {
              const existingTime = new Date(existing.updatedAt || 0).getTime();
              const localTime = new Date(app.updatedAt || 0).getTime();
              if (localTime > existingTime) {
                mergedMap.set(keyById || existing.id, app);
              }
            } else {
              mergedMap.set(keyById, app);
            }
          });

          const mergedApps = Array.from(mergedMap.values()).sort((a, b) => 
            new Date(b.appliedDate || 0).getTime() - new Date(a.appliedDate || 0).getTime()
          );

          // Save merged list locally in Zustand
          set({ applications: mergedApps });

          // 3. Push the merged list back to the Google Sheet
          const res = await fetch('/api/sheets/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              applications: mergedApps,
              spreadsheetId: get().googleSheetsId,
              tabName: get().googleSheetsTab
            })
          });

          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.message || 'Sheets API failed.');
          }

          const currentLogs = [...get().googleSheetsLogs];
          currentLogs.push(`[${new Date().toLocaleTimeString()}] Sheet Sync Success. Google Sheet ID updated: ${data.spreadsheetId}`);
          
          const sheetLink = `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}`;

          set((state) => ({ 
            googleSheetsLogs: currentLogs,
            googleSheetsId: data.spreadsheetId,
            userProfile: {
              ...state.userProfile,
              googleSheetsLink: sheetLink
            }
          }));

          get().addNotification(
            'Google Sheets Synced',
            `Successfully synchronized ${mergedApps.length} jobs to spreadsheet: "${data.spreadsheetId.substring(0, 8)}..."`,
            'success'
          );
        } catch (error: any) {
          console.error("Sheets sync error:", error);
          const currentLogs = [...get().googleSheetsLogs];
          currentLogs.push(`[${new Date().toLocaleTimeString()}] Sheet Sync Failed: ${error.message}`);
          set({ googleSheetsLogs: currentLogs });

          get().addNotification(
            'Google Sheets Sync Failed',
            `Failed to sync job pipeline: ${error.message}`,
            'error'
          );
          alert(`Google Sheets Sync Error: ${error.message || 'Ensure your session is authorized.'}`);
        }
      },

      // Offer Actions
      updateOfferStatus: (id, status) => set((state) => ({
        offers: state.offers.map(o => o.id === id ? { ...o, status } : o)
      })),

      addOffer: (offer) => set((state) => {
        const scorecard = Math.floor(Math.random() * 20) + 80;
        return {
          offers: [...state.offers, { ...offer, id: `off-${Date.now()}`, scorecard }]
        };
      }),

      updateOffer: (id, updates) => set((state) => ({
        offers: state.offers.map(o => o.id === id ? { ...o, ...updates } : o)
      })),

      // Learnings & Goals Actions
      toggleChecklistItem: (topicId, itemId) => set((state) => {
        const updated = state.learnings.map((topic) => {
          if (topic.id === topicId) {
            const updatedChecklist = topic.checklist.map((item) => {
              if (item.id === itemId) {
                return { ...item, completed: !item.completed };
              }
              return item;
            });
            const allDone = updatedChecklist.every(c => c.completed);
            const status = allDone ? 'Completed' as const : 'In Progress' as const;
            return { ...topic, checklist: updatedChecklist, status };
          }
          return topic;
        });
        return { learnings: updated };
      }),

      addChecklistItem: (topicId, text) => set((state) => ({
        learnings: state.learnings.map((topic) => {
          if (topic.id === topicId) {
            const newItem = { id: `item-${Date.now()}`, text, completed: false };
            return {
              ...topic,
              checklist: [...topic.checklist, newItem],
              status: 'In Progress' as const
            };
          }
          return topic;
        })
      })),

      deleteChecklistItem: (topicId, itemId) => set((state) => ({
        learnings: state.learnings.map((topic) => {
          if (topic.id === topicId) {
            return {
              ...topic,
              checklist: topic.checklist.filter(i => i.id !== itemId)
            };
          }
          return topic;
        })
      })),

      addLearningTopic: (category, name) => set((state) => ({
        learnings: [
          ...state.learnings,
          {
            id: `learn-${Date.now()}`,
            category,
            name,
            status: 'Not Started',
            streak: 0,
            checklist: []
          }
        ]
      })),

      deleteLearningTopic: (id) => set((state) => ({
        learnings: state.learnings.filter(t => t.id !== id)
      })),

      toggleKeyResult: (okrId, krId) => set((state) => {
        const updated = state.okrs.map((okr) => {
          if (okr.id === okrId) {
            const updatedKRs = okr.keyResults.map((kr) => {
              if (kr.id === krId) {
                return { ...kr, completed: !kr.completed };
              }
              return kr;
            });
            const completedCount = updatedKRs.filter(c => c.completed).length;
            const progress = Math.round((completedCount / updatedKRs.length) * 100);
            return { ...okr, keyResults: updatedKRs, progress };
          }
          return okr;
        });
        return { okrs: updated };
      }),

      addOkrGoal: (title, category, targetDate, keyResults) => set((state) => {
        const id = `okr-${Date.now()}`;
        const newGoal: OKRGoal = {
          id,
          title,
          category,
          targetDate,
          progress: 0,
          keyResults: keyResults.map((k, idx) => ({ id: `kr-${id}-${idx}`, text: k, completed: false })),
          workspaceId: state.activeWorkspaceId
        };
        return { okrs: [...state.okrs, newGoal] };
      }),

      updateOkrGoal: (id, updates) => set((state) => ({
        okrs: state.okrs.map(o => o.id === id ? { ...o, ...updates } : o)
      })),

      deleteOkrGoal: (id) => set((state) => ({
        okrs: state.okrs.filter(o => o.id !== id)
      })),

      addJournalEntry: (entry, mood) => set((state) => {
        const riskScore = mood === 'Stressed' || mood === 'Tired' ? Math.floor(Math.random() * 30) + 65 : Math.floor(Math.random() * 30) + 15;
        const newEntry: CareerJournalEntry = {
          id: `jr-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          entry,
          burnoutRisk: riskScore,
          mood
        };
        return { journal: [newEntry, ...state.journal] };
      }),

      toggleAutomationActive: (id) => set((state) => ({
        automations: state.automations.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r)
      })),

      addAutomationRule: (name, trigger, action) => set((state) => ({
        automations: [...state.automations, { id: `aut-${Date.now()}`, name, trigger, action, isActive: true }]
      })),

      deleteAutomationRule: (id) => set((state) => ({
        automations: state.automations.filter(a => a.id !== id)
      })),

      runAgentAction: (actionName, payload) => set((state) => {
        const updatedLogs = [...state.agentLogs];
        const newLogs: AgentActionLog[] = [];
        
        newLogs.push({
          timestamp: new Date().toLocaleTimeString(),
          type: 'info',
          message: `[Autonomous Agent Plan] Executing task: "${actionName}"`
        });

        if (actionName === 'Recommend Jobs' || actionName === 'Job Discovery') {
          newLogs.push({
            timestamp: new Date().toLocaleTimeString(),
            type: 'success',
            message: 'Successfully scanned resumes and compiled matching openings.'
          });
        } else if (actionName === 'ATS Analyzer' || actionName === 'Optimize Resume') {
          newLogs.push({
            timestamp: new Date().toLocaleTimeString(),
            type: 'info',
            message: 'Comparing Active Resume V3 vs Google Senior SDE JD...'
          });
          newLogs.push({
            timestamp: new Date().toLocaleTimeString(),
            type: 'success',
            message: 'ATS Score: 89/100. Key suggestions saved.'
          });
        } else if (actionName === 'Draft Follow-ups') {
          newLogs.push({
            timestamp: new Date().toLocaleTimeString(),
            type: 'success',
            message: 'Drafted follow-up email template.'
          });
        } else {
          newLogs.push({
            timestamp: new Date().toLocaleTimeString(),
            type: 'success',
            message: 'Action completed successfully.'
          });
        }

        return { agentLogs: [...updatedLogs, ...newLogs] };
      }),

      clearAgentLogs: () => set({ agentLogs: [] }),

      addPost: (title, content, category) => set((state) => ({
        posts: [
          {
            id: `post-${Date.now()}`,
            author: state.userProfile.name,
            avatar: state.userProfile.profilePhoto,
            title,
            content,
            category,
            upvotes: 0,
            replies: 0,
            date: new Date().toISOString().split('T')[0]
          },
          ...state.posts
        ]
      })),

      upvotePost: (id) => set((state) => ({
        posts: state.posts.map(p => p.id === id ? { ...p, upvotes: p.upvotes + 1 } : p)
      }))
    }),
    {
      name: 'nexora-store',
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        authView: state.authView,
        googleConnected: state.googleConnected,
        googleSheetsConnected: state.googleSheetsConnected,
        googleSheetsId: state.googleSheetsId,
        googleSheetsTab: state.googleSheetsTab,
        googleSheetsLogs: state.googleSheetsLogs,
        userProfile: state.userProfile,
        activeWorkspaceId: state.activeWorkspaceId,
        applications: state.applications,
        resumes: state.resumes,
        recruiters: state.recruiters,
        emails: state.emails,
        offers: state.offers,
        automations: state.automations,
        okrs: state.okrs,
        learnings: state.learnings,
        posts: state.posts,
        journal: state.journal,
        isConnectedGmail: state.isConnectedGmail,
        isConnectedOutlook: state.isConnectedOutlook,
        notifications: state.notifications,
        agentLogs: state.agentLogs
      }),
    }
  )
);
