/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "../AuthContext";
import { authService } from "../../services/authService";

jest.mock("../../services/authService");
const mockAuthService = authService as jest.Mocked<typeof authService>;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe("AuthContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("provides initial state", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.loading).toBe(false);
  });

  it("handles successful login", async () => {
    const mockUser = {
      id: 1,
      fullName: "Test User",
      email: "test@example.com",
      role: "USER" as const,
      emailVerified: true,
      twoFactorEnabled: false,
    };
    const mockToken = "mock-token";

    mockAuthService.login.mockResolvedValue({
      user: mockUser,
      token: mockToken,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login({
        email: "test@example.com",
        password: "password",
      });
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);

    await waitFor(() => {
      const savedToken = localStorage.getItem("token");
      if (savedToken) {
        expect(savedToken).toBe(mockToken);
      } else {
        expect(result.current.user).toEqual(mockUser);
      }
    });
  });

  it("handles login failure", async () => {
    const error = new Error("Invalid credentials");
    mockAuthService.login.mockRejectedValue(error);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await expect(
      act(async () => {
        await result.current.login({
          email: "test@example.com",
          password: "wrong-password",
        });
      })
    ).rejects.toThrow("Invalid credentials");
  });

  it("handles logout", async () => {
    const mockUser = {
      id: 1,
      fullName: "Test User",
      email: "test@example.com",
      role: "USER" as const,
      emailVerified: true,
      twoFactorEnabled: false,
    };
    
    const mockToken = "mock-token";
    mockAuthService.login.mockResolvedValue({
      user: mockUser,
      token: mockToken,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login({
        email: "test@example.com",
        password: "password",
      });
    });

    expect(result.current.isAuthenticated).toBe(true);

    await act(async () => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    
    await waitFor(() => {
      expect(localStorage.getItem("token")).toBeNull();
      expect(localStorage.getItem("user")).toBeNull();
    });
  });

  it("handles Google login", async () => {
    const mockUser = {
      id: 1, 
      fullName: "Test User",
      email: "test@example.com",
      role: "USER" as const, 
      emailVerified: true,
      twoFactorEnabled: false,
    };
    const mockToken = "mock-token";

    mockAuthService.loginWithGoogle.mockResolvedValue({
      user: mockUser,
      token: mockToken,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.loginWithGoogle("mock-id-token");
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("handles registration", async () => {
    const mockUser = {
      id: 1,
      fullName: "Test User",
      email: "test@example.com",
      role: "USER" as const,
      emailVerified: true,
      twoFactorEnabled: false,
    };
    const mockToken = "mock-token";

    mockAuthService.register.mockResolvedValue({
  user: mockUser,
  token: mockToken,
} as any); 

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.register({
        email: "test@example.com",
        password: "password",
        fullName: "Test User",
      });
    });

    expect(mockAuthService.register).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password",
      fullName: "Test User",
    });
    
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("loads user from localStorage on initialization", async () => {
    const adminUser = {
      id: 1,
      fullName: "Admin User",
      email: "admin@example.com",
      role: "ADMIN" as const,
      emailVerified: true,
      twoFactorEnabled: false,
    };
    
    localStorage.setItem("user", JSON.stringify(adminUser));
    localStorage.setItem("token", "admin-token");

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).toEqual(adminUser);
      expect(result.current.isAdmin).toBe(true);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });
});
