import { useLocation } from "wouter";
import {
  authApi,
  getUser,
  clearTokens,
  type IUser,
} from "@/lib/api";

import { useState } from "react";

export function useAuth() {
  const [, setLocation] = useLocation();

  const [user, setUserState] =
    useState<IUser | null>(getUser);

  const login = async (
    email: string,
    password: string
  ) => {
    const response = await authApi.login({
      email,
      password,
    });

    setUserState(response.user);

    localStorage.setItem(
      "svu_auth",
      "true"
    );

    setLocation("/dashboard");

    return response.user;
  };

  const logout = async () => {
    authApi.logout();

    clearTokens();

    localStorage.removeItem("svu_auth");

    setUserState(null);

    setLocation("/login");
  };

  const isAuthenticated =
    localStorage.getItem("svu_auth") ===
    "true";

  return {
    login,
    logout,
    isAuthenticated,
    user,
  };
}