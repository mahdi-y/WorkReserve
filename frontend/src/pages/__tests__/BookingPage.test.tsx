/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import BookingPage from "../booking/BookingPage";
import { useAuth } from "../../context/AuthContext";

jest.mock("../../context/AuthContext");
jest.mock("../../hooks/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

jest.mock("../../services/paymentService", () => ({
  paymentService: {
    getConfig: jest.fn().mockResolvedValue({ publishableKey: "pk_test_mock" }),
    createPaymentIntent: jest.fn(),
    confirmPayment: jest.fn(),
  },
}));

jest.mock("@stripe/stripe-js", () => ({
  loadStripe: jest.fn().mockResolvedValue({}),
}));

jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

jest.mock("../../components/timeslots/RoomBookingCalendarProps", () => {
  return function MockRoomBookingCalendar({ onTimeSlotSelect }: any) {
    return (
      <div data-testid="room-booking-calendar">
        <button
          onClick={() =>
            onTimeSlotSelect({
              id: 1,
              date: "2024-01-15",
              startTime: "10:00",
              endTime: "11:00",
              room: {
                id: 1,
                name: "Room 1",
                type: "meeting",
                capacity: 10,
                pricePerHour: 25,
              },
            })
          }
        >
          Select Time Slot
        </button>
      </div>
    );
  };
});

jest.mock("../../components/layout/Layout", () => {
  return function MockLayout({ children }: any) {
    return <div data-testid="layout">{children}</div>;
  };
});

jest.mock("../../components/payment/PaymentForm", () => {
  return function MockPaymentForm({ onSuccess }: any) {
    return (
      <div data-testid="payment-form">
        <button onClick={onSuccess}>Complete Payment</button>
      </div>
    );
  };
});

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

const mockNavigate = jest.fn();
const mockLocation = {
  state: {
    room: {
      id: 1,
      name: "Test Room",
      type: "meeting",
      capacity: 10,
      pricePerHour: 25,
    },
  },
  pathname: "/booking",
};

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLocation: () => mockLocation,
  useNavigate: () => mockNavigate,
  BrowserRouter: ({ children }: any) => <div>{children}</div>,
}));

const renderWithRouter = (component: React.ReactElement, roomData?: any) => {
  if (roomData !== undefined) {
    mockLocation.state = roomData;
  } else {
    mockLocation.state = {
      room: {
        id: 1,
        name: "Test Room",
        type: "meeting",
        capacity: 10,
        pricePerHour: 25,
      },
    };
  }
  
  return render(component);
};

describe("BookingPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAuth.mockReturnValue({
      user: {
        id: 1,
        email: "test@example.com",
        role: "USER",
        fullName: "Test User",
        emailVerified: true,
        twoFactorEnabled: false,
      },
      isAuthenticated: true,
      isAdmin: false,
      loading: false,
      login: jest.fn(),
      loginDirect: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      loginWithGoogle: jest.fn(),
    });
  });

  it("renders booking page with room information", () => {
    renderWithRouter(<BookingPage />);

    expect(screen.getByText(/book test room/i)).toBeInTheDocument();
    expect(screen.getByTestId("room-booking-calendar")).toBeInTheDocument();
    expect(screen.getByText(/room information/i)).toBeInTheDocument();
  });

  it("redirects when no room is provided", () => {
    renderWithRouter(<BookingPage />, { room: null });

    expect(screen.getByText(/no room selected for booking/i)).toBeInTheDocument();
    expect(screen.getByText(/browse rooms/i)).toBeInTheDocument();
  });

  it("handles time slot selection", async () => {
    renderWithRouter(<BookingPage />);

    const selectButton = screen.getByText("Select Time Slot");
    fireEvent.click(selectButton);

    await waitFor(() => {
      expect(screen.getByText(/confirm booking/i)).toBeInTheDocument();
    });
  });

  it("displays room information correctly", () => {
    renderWithRouter(<BookingPage />);

    expect(screen.getByText("Test Room")).toBeInTheDocument();
    expect(screen.getByText("10 people")).toBeInTheDocument();
    expect(screen.getByText("25 $/hour")).toBeInTheDocument();
  });

  it("handles team size input", async () => {
    renderWithRouter(<BookingPage />);

    fireEvent.click(screen.getByText("Select Time Slot"));

    await waitFor(() => {
      const teamSizeInput = screen.getByLabelText(/team size/i);
      expect(teamSizeInput).toBeInTheDocument();

      fireEvent.change(teamSizeInput, { target: { value: "5" } });
      expect(teamSizeInput).toHaveValue(5);
    });
  });

  it("calculates total cost correctly", async () => {
    renderWithRouter(<BookingPage />);

    fireEvent.click(screen.getByText("Select Time Slot"));

    await waitFor(() => {
      expect(screen.getByText(/25\.000 \$/)).toBeInTheDocument();
    });
  });

  it("handles proceed to payment", async () => {
    const mockCreatePaymentIntent = require("../../services/paymentService").paymentService.createPaymentIntent;
    mockCreatePaymentIntent.mockResolvedValue({
      clientSecret: "test_secret",
      paymentIntentId: "pi_test",
      amount: 25,
    });

    renderWithRouter(<BookingPage />);

    fireEvent.click(screen.getByText("Select Time Slot"));

    await waitFor(() => {
      const proceedButton = screen.getByText(/proceed to payment/i);
      fireEvent.click(proceedButton);
    });

    await waitFor(() => {
      expect(mockCreatePaymentIntent).toHaveBeenCalledWith({
        slotId: 1,
        teamSize: 1,
      });
    });
  });

  it("handles payment success", async () => {
    const mockConfirmPayment = require("../../services/paymentService").paymentService.confirmPayment;
    mockConfirmPayment.mockResolvedValue({});

    renderWithRouter(<BookingPage />);

    fireEvent.click(screen.getByText("Select Time Slot"));

    await waitFor(() => {
      expect(screen.getByText(/confirm booking/i)).toBeInTheDocument();
    });
  });
});
