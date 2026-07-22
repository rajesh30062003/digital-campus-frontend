/**
 * Frontend API utility tests
 * Run: npx vitest run
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
const store: Record<string, string> = {};
vi.stubGlobal("localStorage", {
  getItem: (k: string) => store[k] ?? null,
  setItem: (k: string, v: string) => { store[k] = v; },
  removeItem: (k: string) => { delete store[k]; },
});

import { setTokens, clearTokens, getUser } from "../lib/api";

describe("Token helpers", () => {
  beforeEach(() => {
    Object.keys(store).forEach((k) => delete store[k]);
  });

  it("setTokens stores accessToken in localStorage", () => {
    setTokens("my-token-123");
    expect(localStorage.getItem("accessToken")).toBe("my-token-123");
  });

  it("clearTokens removes accessToken and user", () => {
    store["accessToken"] = "some-token";
    store["user"] = JSON.stringify({ id: "1", name: "Test" });
    clearTokens();
    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });

  it("getUser returns null when nothing is stored", () => {
    expect(getUser()).toBeNull();
  });

  it("getUser returns parsed user when stored", () => {
    const user = { id: "abc", name: "Alice", email: "alice@test.com", role: "student" as const };
    store["user"] = JSON.stringify(user);
    const result = getUser();
    expect(result?.name).toBe("Alice");
    expect(result?.role).toBe("student");
  });
});

describe("API fetch error handling", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("throws on non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Unauthorized" }),
    });

    const { authApi } = await import("../lib/api");
    await expect(authApi.login({ email: "x@x.com", password: "wrong" })).rejects.toThrow("Unauthorized");
  });

  it("stores token on successful login", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        accessToken: "valid-token",
        user: { id: "1", name: "Bob", email: "bob@test.com", role: "student" },
      }),
    });

    const { authApi } = await import("../lib/api");
    const result = await authApi.login({ email: "bob@test.com", password: "pass" });
    expect(result.accessToken).toBe("valid-token");
    expect(localStorage.getItem("accessToken")).toBe("valid-token");
  });
});
