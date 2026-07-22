/**
 * AdminDashboard rendering tests
 * Run: npx vitest run
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock API
vi.mock("../lib/api", () => ({
  adminApi: {
    stats: vi.fn().mockResolvedValue({ data: { totalStudents: 250, totalFaculty: 40, totalCourses: 18, totalDepartments: 6, placed: 35, attendancePercentage: 82, totalAdmins: 2, totalAssignments: 120 } }),
    studentGrowth: vi.fn().mockResolvedValue({ data: [{ month: "Jan", students: 10 }] }),
    departmentStats: vi.fn().mockResolvedValue({ data: [] }),
    attendanceTrend: vi.fn().mockResolvedValue({ data: [] }),
  },
}));

import AdminDashboard from "../pages/admin/AdminDashboard";

const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={qc}>{children}</QueryClientProvider>
);

describe("AdminDashboard", () => {
  it("renders the heading", () => {
    render(<Wrapper><AdminDashboard /></Wrapper>);
    expect(screen.getByText("Admin Dashboard")).toBeDefined();
  });

  it("renders KPI labels", () => {
    render(<Wrapper><AdminDashboard /></Wrapper>);
    expect(screen.getByText("Total Students")).toBeDefined();
    expect(screen.getByText("Total Faculty")).toBeDefined();
  });
});
