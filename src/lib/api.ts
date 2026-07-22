const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "/api";

// ─────────────────────────────────────────────────────────────
// Core Types
// ─────────────────────────────────────────────────────────────

export interface IUser {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: "student" | "faculty" | "admin" | "superadmin";
  studentId?: string;
  department?: string;
  semester?: number;
  avatar?: string;
  phone?: string;
  bio?: string;
  isActive?: boolean;
}

export interface ICourse {
  _id: string;
  title: string;
  code: string;
  description?: string;
  credits?: number;
  semester?: number;
  department?: string;
  faculty?: { _id: string; name: string } | string;
  enrolledStudents?: string[];
  isActive?: boolean;
}

export interface IDepartment {
  _id: string;
  name: string;
  code: string;
  description?: string;
  hod?: { _id: string; name: string; email: string } | null;
  totalStudents?: number;
  totalFaculty?: number;
  totalCourses?: number;
}

export interface IBook {
  _id: string;
  title: string;
  author: string;
  isbn: string;
  publisher?: string;
  year?: number;
  category: string;
  totalCopies: number;
  availableCopies: number;
  location?: string;
  description?: string;
}

export interface IJob {
  _id: string;
  title: string;
  description: string;
  company: { _id: string; name: string; logo?: string; industry: string; location: string };
  package: string;
  jobType: "full-time" | "internship" | "part-time";
  location: string;
  lastDateToApply: string;
  status: "open" | "closed" | "completed";
  eligibleBranches?: string[];
  minimumCGPA?: number;
}

export interface IAssignment {
  _id: string;
  title: string;
  description?: string;
  dueDate?: string;
  totalMarks?: number;
  maxMarks?: number;
  isPublished?: boolean;
  course?: { _id: string; title: string; code: string } | string;
  courseId?: string;
  submissions?: Array<{
    student: string;
    status: "submitted" | "graded" | "late";
    grade?: number;
    marks?: number;
    feedback?: string;
    fileUrl?: string;
    content?: string;
    submittedAt: string;
  }>;
}

export interface IAnnouncement {
  _id: string;
  title: string;
  content: string;
  category?: string;
  priority?: "low" | "medium" | "high";
  targetAudience?: string[];
  attachments?: string[];
  isPinned?: boolean;
  createdBy?: { name: string };
  author?: { _id: string; name: string; role: string; avatar?: string };
  views?: number;
  createdAt: string;
}

export interface IEvent {
  _id: string;
  title: string;
  description?: string;
  date: string;
  endDate?: string;
  location?: string;
  category?: string;
  organizer?: string;
  registeredParticipants?: any[];
  maxParticipants?: number;
  isActive?: boolean;
}

export interface INotification {
  _id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ITimetableSlot {
  day: string;
  startTime: string;
  endTime: string;
  room: string;
  course: { _id: string; title: string; code: string; credits?: number };
  faculty: { _id: string; name: string };
}

// ─────────────────────────────────────────────────────────────
// Generic Fetch
// ─────────────────────────────────────────────────────────────

const apiFetch = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = localStorage.getItem("accessToken");
  const activeInstitutionId = localStorage.getItem("activeInstitutionId");

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(activeInstitutionId && { "X-Institution-ID": activeInstitutionId }),
      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

// ─────────────────────────────────────────────────────────────
// Token Helpers
// ─────────────────────────────────────────────────────────────

export const setTokens = (accessToken: string) => {
  localStorage.setItem("accessToken", accessToken);
};

export const clearTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
};

export const getUser = (): IUser | null => {
  const user = localStorage.getItem("user");
  if (!user) return null;
  return JSON.parse(user);
};

// ─────────────────────────────────────────────────────────────
// Auth API
// ─────────────────────────────────────────────────────────────

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const data = await apiFetch<{ success: boolean; accessToken: string; user: IUser }>(
      "/auth/login",
      { method: "POST", body: JSON.stringify(credentials) }
    );
    setTokens(data.accessToken);
    localStorage.setItem("user", JSON.stringify(data.user));
    return data;
  },

  register: async (userData: { name: string; email: string; password: string }) => {
    const data = await apiFetch<{ success: boolean; accessToken: string; user: IUser }>(
      "/auth/register",
      { method: "POST", body: JSON.stringify(userData) }
    );
    setTokens(data.accessToken);
    localStorage.setItem("user", JSON.stringify(data.user));
    return data;
  },

  getMe: async () => apiFetch<{ success: boolean; user: IUser }>("/auth/me"),
  me: async () => {
    const res = await apiFetch<any>("/auth/me");
    // backend returns { success, user } — normalise to { success, data: { user } }
    return { success: res.success, data: { user: res.user || res.data?.user } };
  },
  updateMe: async (data: Partial<IUser>) =>
    apiFetch<{ success: boolean; data: { user: IUser } }>("/users/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  changePassword: async (currentPassword: string, newPassword: string) =>
    apiFetch<{ success: boolean; message: string }>("/users/change-password", {
      method: "PATCH",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
  logout: () => clearTokens(),
};

// ─────────────────────────────────────────────────────────────
// Announcement/Notice API
// ─────────────────────────────────────────────────────────────

export const announcementApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiFetch<any>(`/announcements${qs}`);
  },
  getById: (id: string) => apiFetch<any>(`/announcements/${id}`),
  create: (data: object) => apiFetch<any>("/announcements", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: object) => apiFetch<any>(`/announcements/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch<any>(`/announcements/${id}`, { method: "DELETE" }),
};

// ─────────────────────────────────────────────────────────────
// Course API
// ─────────────────────────────────────────────────────────────

export const courseApi = {
  getAll: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiFetch<any>(`/courses${qs}`);
  },
  myCourses: () => apiFetch<any>("/courses/my-courses"),
  getById: (id: string) => apiFetch<any>(`/courses/${id}`),
  create: (data: object) => apiFetch<any>("/courses", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: object) => apiFetch<any>(`/courses/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch<any>(`/courses/${id}`, { method: "DELETE" }),
  enroll: (id: string) => apiFetch<any>(`/courses/${id}/enroll`, { method: "POST" }),
};

// ─────────────────────────────────────────────────────────────
// Assignment API
// ─────────────────────────────────────────────────────────────

export const assignmentApi = {
  getByCourse: (courseId: string) => apiFetch<any>(`/courses/${courseId}/assignments`),
  byCourse: (courseId: string) => apiFetch<any>(`/courses/${courseId}/assignments`),
  getById: (courseId: string, id: string) => apiFetch<any>(`/courses/${courseId}/assignments/${id}`),
  create: (courseId: string, data: object) =>
    apiFetch<any>(`/courses/${courseId}/assignments`, { method: "POST", body: JSON.stringify(data) }),
  update: (courseId: string, id: string, data: object) =>
    apiFetch<any>(`/courses/${courseId}/assignments/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  submit: (courseId: string, id: string, data: object) =>
    apiFetch<any>(`/courses/${courseId}/assignments/${id}/submit`, { method: "POST", body: JSON.stringify(data) }),
  grade: (courseId: string, id: string, studentId: string, data: object) =>
    apiFetch<any>(`/courses/${courseId}/assignments/${id}/grade/${studentId}`, { method: "PATCH", body: JSON.stringify(data) }),
};

// ─────────────────────────────────────────────────────────────
// Attendance API
// ─────────────────────────────────────────────────────────────

export const attendanceApi = {
  mark: (courseId: string, data: object) =>
    apiFetch<any>(`/courses/${courseId}/attendance`, { method: "POST", body: JSON.stringify(data) }),
  getCourseAttendance: (courseId: string, params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiFetch<any>(`/courses/${courseId}/attendance${qs}`);
  },
  my: (courseId: string) => apiFetch<any>(`/courses/${courseId}/attendance/my`),
  stats: (courseId: string) => apiFetch<any>(`/courses/${courseId}/attendance/stats`),
};

// ─────────────────────────────────────────────────────────────
// Event API
// ─────────────────────────────────────────────────────────────

export const eventApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiFetch<any>(`/events${qs}`);
  },
  create: (data: object) => apiFetch<any>("/events", { method: "POST", body: JSON.stringify(data) }),
};

// ─────────────────────────────────────────────────────────────
// User API
// ─────────────────────────────────────────────────────────────

export const userApi = {
  /**
   * Backend paginate() returns { data: { users: [...] }, pagination }.
   * We normalise here so callers always get { data: [...], pagination }.
   */
  getAll: async (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    const res = await apiFetch<any>(`/users${qs}`);
    return {
      data:       res?.data?.users ?? res?.data ?? [],
      pagination: res?.pagination  ?? null,
    };
  },
  getById: (id: string) => apiFetch<any>(`/users/${id}`),
  updateProfile: (data: object) => apiFetch<any>("/users/profile", { method: "PATCH", body: JSON.stringify(data) }),
  updateUser: (id: string, data: object) =>
    apiFetch<any>(`/users/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteUser: (id: string) => apiFetch<any>(`/users/${id}`, { method: "DELETE" }),
  changePassword: (data: object) =>
    apiFetch<any>("/users/change-password", { method: "PATCH", body: JSON.stringify(data) }),
};

// ─────────────────────────────────────────────────────────────
// Department API
// ─────────────────────────────────────────────────────────────

export const departmentApi = {
  getAll: () => apiFetch<any>("/departments"),
  getById: (id: string) => apiFetch<any>(`/departments/${id}`),
  create: (data: object) => apiFetch<any>("/departments", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: object) =>
    apiFetch<any>(`/departments/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch<any>(`/departments/${id}`, { method: "DELETE" }),
};

// ─────────────────────────────────────────────────────────────
// Timetable API
// ─────────────────────────────────────────────────────────────

export const timetableApi = {
  my: () => apiFetch<any>("/timetables/my"),
  faculty: () => apiFetch<any>("/timetables/faculty"),
  getAll: () => apiFetch<any>("/timetables"),
  create: (data: object) => apiFetch<any>("/timetables", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: object) =>
    apiFetch<any>(`/timetables/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch<any>(`/timetables/${id}`, { method: "DELETE" }),
};

// ─────────────────────────────────────────────────────────────
// Marks API
// ─────────────────────────────────────────────────────────────

export const marksApi = {
  myMarks: () => apiFetch<any>("/marks/my"),
  getExams: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiFetch<any>(`/marks/exams${qs}`);
  },
  createExam: (data: object) => apiFetch<any>("/marks/exams", { method: "POST", body: JSON.stringify(data) }),
  updateExam: (id: string, data: object) =>
    apiFetch<any>(`/marks/exams/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  publishExam: (id: string) => apiFetch<any>(`/marks/exams/${id}/publish`, { method: "PATCH" }),
  enterMarks: (examId: string, marksData: object[]) =>
    apiFetch<any>(`/marks/exams/${examId}/marks`, { method: "POST", body: JSON.stringify({ marksData }) }),
  getMarksByExam: (examId: string) => apiFetch<any>(`/marks/exams/${examId}/marks`),
  analytics: () => apiFetch<any>("/marks/analytics"),
};

// ─────────────────────────────────────────────────────────────
// Library API
// ─────────────────────────────────────────────────────────────

export const libraryApi = {
  getBooks: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiFetch<any>(`/library/books${qs}`);
  },
  getBookById: (id: string) => apiFetch<any>(`/library/books/${id}`),
  createBook: (data: object) =>
    apiFetch<any>("/library/books", { method: "POST", body: JSON.stringify(data) }),
  updateBook: (id: string, data: object) =>
    apiFetch<any>(`/library/books/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteBook: (id: string) => apiFetch<any>(`/library/books/${id}`, { method: "DELETE" }),
  issueBook: (data: object) => apiFetch<any>("/library/issues", { method: "POST", body: JSON.stringify(data) }),
  returnBook: (id: string) => apiFetch<any>(`/library/issues/${id}/return`, { method: "PATCH" }),
  myIssues: () => apiFetch<any>("/library/issues/my"),
  allIssues: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiFetch<any>(`/library/issues${qs}`);
  },
  stats: () => apiFetch<any>("/library/stats"),
};

// ─────────────────────────────────────────────────────────────
// Placement API
// ─────────────────────────────────────────────────────────────

export const placementApi = {
  getCompanies: () => apiFetch<any>("/placement/companies"),
  createCompany: (data: object) =>
    apiFetch<any>("/placement/companies", { method: "POST", body: JSON.stringify(data) }),
  updateCompany: (id: string, data: object) =>
    apiFetch<any>(`/placement/companies/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  getJobs: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiFetch<any>(`/placement/jobs${qs}`);
  },
  getJobById: (id: string) => apiFetch<any>(`/placement/jobs/${id}`),
  createJob: (data: object) =>
    apiFetch<any>("/placement/jobs", { method: "POST", body: JSON.stringify(data) }),
  updateJob: (id: string, data: object) =>
    apiFetch<any>(`/placement/jobs/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  apply: (jobId: string, data: object) =>
    apiFetch<any>(`/placement/jobs/${jobId}/apply`, { method: "POST", body: JSON.stringify(data) }),
  myApplications: () => apiFetch<any>("/placement/applications/my"),
  jobApplications: (jobId: string) => apiFetch<any>(`/placement/jobs/${jobId}/applications`),
  updateApplicationStatus: (id: string, data: object) =>
    apiFetch<any>(`/placement/applications/${id}/status`, { method: "PATCH", body: JSON.stringify(data) }),
  stats: () => apiFetch<any>("/placement/stats"),
};

// ─────────────────────────────────────────────────────────────
// Notification API
// ─────────────────────────────────────────────────────────────

export const notificationApi = {
  getAll: () => apiFetch<any>("/notifications"),
  markRead: (id: string) => apiFetch<any>(`/notifications/${id}/read`, { method: "PATCH" }),
  markAllRead: () => apiFetch<any>("/notifications/read-all", { method: "PATCH" }),
};

// ─────────────────────────────────────────────────────────────
// Admin API
// ─────────────────────────────────────────────────────────────

export const adminApi = {
  stats: () => apiFetch<any>("/admin/stats"),
  studentGrowth: () => apiFetch<any>("/admin/charts/student-growth"),
  departmentStats: () => apiFetch<any>("/admin/charts/department-stats"),
  attendanceTrend: () => apiFetch<any>("/admin/charts/attendance-trend"),
  auditLogs: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiFetch<any>(`/admin/audit-logs${qs}`);
  },
};

// ─────────────────────────────────────────────────────────────
// Homeopathic Hospital & Clinical ERP API
// ─────────────────────────────────────────────────────────────

export const medicalApi = {
  getPatients: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiFetch<any>(`/medical/patients${qs}`);
  },
  createPatient: (data: object) =>
    apiFetch<any>("/medical/patients", { method: "POST", body: JSON.stringify(data) }),
  updatePatient: (id: string, data: object) =>
    apiFetch<any>(`/medical/patients/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  getAppointments: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiFetch<any>(`/medical/appointments${qs}`);
  },
  createAppointment: (data: object) =>
    apiFetch<any>("/medical/appointments", { method: "POST", body: JSON.stringify(data) }),

  getMedicines: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiFetch<any>(`/medical/medicines${qs}`);
  },
  createMedicine: (data: object) =>
    apiFetch<any>("/medical/medicines", { method: "POST", body: JSON.stringify(data) }),

  getPrescriptions: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiFetch<any>(`/medical/prescriptions${qs}`);
  },
  createPrescription: (data: object) =>
    apiFetch<any>("/medical/prescriptions", { method: "POST", body: JSON.stringify(data) }),
  dispensePrescription: (id: string) =>
    apiFetch<any>(`/medical/prescriptions/${id}/dispense`, { method: "PATCH" }),

  getCaseRecords: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiFetch<any>(`/medical/case-records${qs}`);
  },
  getCaseRecordById: (id: string) => apiFetch<any>(`/medical/case-records/${id}`),
  createCaseRecord: (data: object) =>
    apiFetch<any>("/medical/case-records", { method: "POST", body: JSON.stringify(data) }),
  addFollowUp: (id: string, data: object) =>
    apiFetch<any>(`/medical/case-records/${id}/follow-ups`, { method: "POST", body: JSON.stringify(data) }),

  getClinicalPostings: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiFetch<any>(`/medical/postings${qs}`);
  },
  createClinicalPosting: (data: object) =>
    apiFetch<any>("/medical/postings", { method: "POST", body: JSON.stringify(data) }),
  updateClinicalPosting: (id: string, data: object) =>
    apiFetch<any>(`/medical/postings/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
};

// ─────────────────────────────────────────────────────────────
// Institution Config API
// ─────────────────────────────────────────────────────────────

export interface IInstitutionConfig {
  _id?: string;
  name: string;
  institutionType: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  academicStructure: "Semester" | "Year";
  enabledModules: string[];
  examinationRules?: string;
  attendanceRules?: string;
  feeStructure?: string;
  language: string;
  timezone: string;
  address?: string;
  contactDetails?: string;

  // SaaS Tenant Fields
  subdomain?: string;
  domain?: string;
  isWhiteLabeled?: boolean;
  subscriptionPlan?: "Trial" | "Basic" | "Professional" | "Enterprise";
  subscriptionStatus?: "Active" | "Past Due" | "Suspended" | "Cancelled";
  storageQuota?: number;
  storageUsed?: number;
  userQuota?: number;
  userCount?: number;
  billingCycle?: "Monthly" | "Annual";
  nextBillingDate?: string;
  monthlyPrice?: number;
  licensedModules?: string[];

  createdAt?: string;
  updatedAt?: string;
}

export const institutionApi = {
  getConfig: () => apiFetch<any>("/institution/config"),
  updateConfig: (data: Partial<IInstitutionConfig>) =>
    apiFetch<any>("/institution/config", { method: "PATCH", body: JSON.stringify(data) }),
};

export const saasApi = {
  register: (data: any) => apiFetch<any>("/saas/register", { method: "POST", body: JSON.stringify(data) }),
  getPlans: () => apiFetch<any>("/saas/plans"),
  updateConfig: (data: any) => apiFetch<any>("/saas/config", { method: "PATCH", body: JSON.stringify(data) }),
  processPayment: (data: any) => apiFetch<any>("/saas/billing/pay", { method: "POST", body: JSON.stringify(data) }),
  getAnalytics: () => apiFetch<any>("/saas/analytics"),
  superGetInstitutions: () => apiFetch<any>("/saas/institutions"),
  superUpdateInstitution: (id: string, data: any) => apiFetch<any>(`/saas/institutions/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  superDeleteInstitution: (id: string) => apiFetch<any>(`/saas/institutions/${id}`, { method: "DELETE" }),
};

export default authApi;
