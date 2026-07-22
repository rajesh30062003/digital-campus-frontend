export const mockStudent = {
  name: "Arjun Sharma",
  course: "B.Tech CSE",
  semester: 6,
  rollNo: "21CS045",
  cgpa: 8.7,
  batch: "2021-2025",
  attendance: 84.5,
  credits: 142,
  rank: 12
};

export type AttendanceRecord = {
  date: string;
  status: "Present" | "Absent" | "Holiday" | "Medical";
};

export type Subject = {
  id: string;
  name: string;
  code: string;
  attendance: number;
  credits: number;
  grade: string;
  faculty: string;
  totalClasses: number;
  attendedClasses: number;
  dateWiseAttendance: AttendanceRecord[];
};

function genAttendance(
  totalClasses: number,
  attendedClasses: number,
  startDate: string
): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  let date = new Date(startDate);
  let presentCount = 0;
  let absentCount = 0;
  const target = totalClasses;
  let generated = 0;

  while (generated < target) {
    const day = date.getDay();
    if (day !== 0) {
      const remaining = target - generated;
      const presentNeeded = attendedClasses - presentCount;
      const absentNeeded = (target - attendedClasses) - absentCount;

      let status: AttendanceRecord["status"];
      if (absentNeeded === 0) {
        status = "Present";
      } else if (presentNeeded === 0) {
        status = "Absent";
      } else {
        const rand = Math.random();
        const presentProb = presentNeeded / remaining;
        if (rand < 0.04) status = "Holiday";
        else if (rand < 0.06) status = "Medical";
        else status = rand < presentProb + 0.1 ? "Present" : "Absent";
      }

      if (status === "Present") presentCount++;
      else if (status === "Absent") absentCount++;

      records.push({
        date: date.toISOString().split("T")[0],
        status
      });
      generated++;
    }
    date.setDate(date.getDate() + 1);
  }
  return records;
}

export const mockSubjects: Subject[] = [
  {
    id: "cs1",
    name: "Data Structures",
    code: "CS301",
    attendance: 68,
    credits: 4,
    grade: "B+",
    faculty: "Dr. R. Mehta",
    totalClasses: 50,
    attendedClasses: 34,
    dateWiseAttendance: genAttendance(50, 34, "2024-01-08")
  },
  {
    id: "cs2",
    name: "Algorithms",
    code: "CS302",
    attendance: 85,
    credits: 4,
    grade: "A",
    faculty: "Prof. S. Verma",
    totalClasses: 48,
    attendedClasses: 41,
    dateWiseAttendance: genAttendance(48, 41, "2024-01-09")
  },
  {
    id: "cs3",
    name: "DBMS",
    code: "CS303",
    attendance: 92,
    credits: 3,
    grade: "A+",
    faculty: "Dr. P. Iyer",
    totalClasses: 44,
    attendedClasses: 40,
    dateWiseAttendance: genAttendance(44, 40, "2024-01-10")
  },
  {
    id: "cs4",
    name: "Operating Systems",
    code: "CS304",
    attendance: 78,
    credits: 3,
    grade: "A",
    faculty: "Prof. K. Singh",
    totalClasses: 46,
    attendedClasses: 36,
    dateWiseAttendance: genAttendance(46, 36, "2024-01-08")
  },
  {
    id: "cs5",
    name: "Computer Networks",
    code: "CS305",
    attendance: 88,
    credits: 3,
    grade: "B+",
    faculty: "Dr. A. Rao",
    totalClasses: 42,
    attendedClasses: 37,
    dateWiseAttendance: genAttendance(42, 37, "2024-01-11")
  },
  {
    id: "cs6",
    name: "Software Engineering",
    code: "CS306",
    attendance: 95,
    credits: 3,
    grade: "A+",
    faculty: "Prof. N. Joshi",
    totalClasses: 40,
    attendedClasses: 38,
    dateWiseAttendance: genAttendance(40, 38, "2024-01-09")
  },
  {
    id: "cs7",
    name: "Machine Learning",
    code: "CS307",
    attendance: 82,
    credits: 4,
    grade: "A",
    faculty: "Dr. M. Gupta",
    totalClasses: 45,
    attendedClasses: 37,
    dateWiseAttendance: genAttendance(45, 37, "2024-01-10")
  }
];

export const mockPlacements = [
  { id: 1, company: "TCS", package: "7 LPA", status: "Offered" },
  { id: 2, company: "Infosys", package: "8 LPA", status: "Offered" },
  { id: 3, company: "Wipro", package: "6.5 LPA", status: "Interview" }
];

export const mockAssignments = [
  { id: 1, title: "ML Project Phase 1", subject: "Machine Learning", dueDate: "2024-05-15", status: "pending" },
  { id: 2, title: "OS Scheduling Algo", subject: "OS", dueDate: "2024-05-10", status: "submitted" },
  { id: 3, title: "DBMS Normalization", subject: "DBMS", dueDate: "2024-05-01", status: "graded", marks: "9/10" }
];

export const mockNotices = [
  { id: 1, title: "End Semester Exams Schedule", date: "2024-05-20", priority: "Urgent", type: "Exam" },
  { id: 2, title: "Annual Tech Fest 'Innovate 2024'", date: "2024-05-25", priority: "Important", type: "Event" },
  { id: 3, title: "Library Book Return Deadline", date: "2024-05-30", priority: "General", type: "Library" }
];
