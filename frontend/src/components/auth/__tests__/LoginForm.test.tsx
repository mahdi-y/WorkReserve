import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import LoginForm from "../LoginForm";
import { useAuth } from "../../../context/AuthContext";
import { useGoogleAuth } from "../../../hooks/useGoogleAuth";
import { useToast } from "../../../hooks/use-toast";

jest.mock("../../../context/AuthContext");
jest.mock("../../../hooks/useGoogleAuth");
jest.mock("../../../hooks/use-toast");

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseGoogleAuth = useGoogleAuth as jest.MockedFunction<
  typeof useGoogleAuth
>;
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("LoginForm", () => {
  const mockLogin = jest.fn();
  const mockSignInWithGoogle = jest.fn();
  const mockToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAuth.mockReturnValue({
      login: mockLogin,
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      loading: false,
      logout: jest.fn(),
      register: jest.fn(),
      loginDirect: jest.fn(),
      loginWithGoogle: (): Promise<void> => {
        throw new Error("Function not implemented.");
      },
    });

    mockUseGoogleAuth.mockReturnValue({
      signInWithGoogle: mockSignInWithGoogle,
      initializeGoogleAuth: jest.fn(),
      renderGoogleButton: jest.fn(), // <-- Add this line
    });

    mockUseToast.mockReturnValue({
      toast: mockToast,
      dismiss: jest.fn(),
      toasts: [],
    });
  });

  it("renders login form with all fields", () => {
    renderWithRouter(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^sign in$/i })
    ).toBeInTheDocument(); // Exact match
    expect(
      screen.getByRole("button", { name: /sign in with google/i })
    ).toBeInTheDocument();
  });

  it("handles email input correctly", async () => {
    const user = userEvent.setup();
    renderWithRouter(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, "test@example.com");

    expect(emailInput).toHaveValue("test@example.com");
  });

  it("handles password input correctly", async () => {
    const user = userEvent.setup();
    renderWithRouter(<LoginForm />);

    const passwordInput = screen.getByLabelText(/password/i);
    await user.type(passwordInput, "password123");

    expect(passwordInput).toHaveValue("password123");
  });

  it("submits form with valid credentials", async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue({ success: true });

    renderWithRouter(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    // Use exact match for the submit button
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });
  });

  it("handles Google sign in", async () => {
    const user = userEvent.setup();

    renderWithRouter(<LoginForm />);

    await user.click(
      screen.getByRole("button", { name: /sign in with google/i })
    );

    expect(mockSignInWithGoogle).toHaveBeenCalled();
  });

  it("displays loading state during submission", async () => {
    const user = userEvent.setup();
    mockLogin.mockImplementation(() => new Promise(() => {})); // Never resolves

    renderWithRouter(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    // Use exact match for the submit button
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    expect(screen.getByText(/signing in/i)).toBeInTheDocument();
  });

  it("displays error message on login failure", async () => {
    const user = userEvent.setup();
    const error = new Error("Invalid credentials");
    mockLogin.mockRejectedValue(error);

    renderWithRouter(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "wrong-password");
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: "destructive",
        title: "Login Failed", // Changed from "Error"
        description: "Login failed. Please try again.", // Changed from "Invalid credentials"
      });
    });
  });
});
