package com.workreserve.backend.payment;

import com.workreserve.backend.payment.DTO.*;
import com.workreserve.backend.reservation.Reservation;
import com.workreserve.backend.reservation.ReservationRepository;
import com.workreserve.backend.reservation.ReservationStatus;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private ReservationRepository reservationRepository;

    @InjectMocks
    private PaymentService paymentService;

    private Reservation testReservation;

    @BeforeEach
    void setUp() {
        testReservation = new Reservation();
        testReservation.setId(1L);
        testReservation.setUserId(1L);
        testReservation.setTotalAmount(100.0);
        testReservation.setStatus(ReservationStatus.PENDING);
    }

    @Test
    void createPaymentIntent_Success() throws StripeException {
        PaymentIntentRequest request = new PaymentIntentRequest();
        request.setReservationId(1L);
        request.setCurrency("usd");

        PaymentIntent mockPaymentIntent = mock(PaymentIntent.class);
        when(mockPaymentIntent.getId()).thenReturn("pi_test123");
        when(mockPaymentIntent.getClientSecret()).thenReturn("pi_test123_secret");

        when(reservationRepository.findById(1L)).thenReturn(Optional.of(testReservation));

        try (MockedStatic<PaymentIntent> mockedStatic = mockStatic(PaymentIntent.class)) {
            mockedStatic.when(() -> PaymentIntent.create(any(PaymentIntentCreateParams.class)))
                      .thenReturn(mockPaymentIntent);

            PaymentIntentResponse response = paymentService.createPaymentIntent(request);

            assertNotNull(response);
            assertEquals("pi_test123", response.getPaymentIntentId());
            assertEquals("pi_test123_secret", response.getClientSecret());
            assertEquals(10000L, response.getAmount()); // $100.00 in cents
            assertEquals("usd", response.getCurrency());
        }
    }

    @Test
    void createPaymentIntent_ReservationNotFound() {
        PaymentIntentRequest request = new PaymentIntentRequest();
        request.setReservationId(999L);
        request.setCurrency("usd");

        when(reservationRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> paymentService.createPaymentIntent(request));
    }

    @Test
    void createPaymentIntent_StripeException() throws StripeException {
        PaymentIntentRequest request = new PaymentIntentRequest();
        request.setReservationId(1L);
        request.setCurrency("usd");

        when(reservationRepository.findById(1L)).thenReturn(Optional.of(testReservation));

        try (MockedStatic<PaymentIntent> mockedStatic = mockStatic(PaymentIntent.class)) {
            mockedStatic.when(() -> PaymentIntent.create(any(PaymentIntentCreateParams.class)))
                      .thenThrow(new StripeException("Payment failed", "request_id", "code", 400));

            assertThrows(RuntimeException.class, () -> paymentService.createPaymentIntent(request));
        }
    }

    @Test
    void confirmPayment_Success() throws StripeException {
        ConfirmPaymentRequest request = new ConfirmPaymentRequest();
        request.setPaymentIntentId("pi_test123");
        request.setReservationId(1L);

        PaymentIntent mockPaymentIntent = mock(PaymentIntent.class);
        when(mockPaymentIntent.getStatus()).thenReturn("succeeded");

        when(reservationRepository.findById(1L)).thenReturn(Optional.of(testReservation));
        when(reservationRepository.save(any(Reservation.class))).thenReturn(testReservation);

        try (MockedStatic<PaymentIntent> mockedStatic = mockStatic(PaymentIntent.class)) {
            mockedStatic.when(() -> PaymentIntent.retrieve("pi_test123"))
                      .thenReturn(mockPaymentIntent);

            assertDoesNotThrow(() -> paymentService.confirmPayment(request));

            assertEquals(ReservationStatus.CONFIRMED, testReservation.getStatus());
            verify(reservationRepository).save(testReservation);
        }
    }

    @Test
    void confirmPayment_PaymentFailed() throws StripeException {
        ConfirmPaymentRequest request = new ConfirmPaymentRequest();
        request.setPaymentIntentId("pi_test123");
        request.setReservationId(1L);

        PaymentIntent mockPaymentIntent = mock(PaymentIntent.class);
        when(mockPaymentIntent.getStatus()).thenReturn("failed");

        when(reservationRepository.findById(1L)).thenReturn(Optional.of(testReservation));
        when(reservationRepository.save(any(Reservation.class))).thenReturn(testReservation);

        try (MockedStatic<PaymentIntent> mockedStatic = mockStatic(PaymentIntent.class)) {
            mockedStatic.when(() -> PaymentIntent.retrieve("pi_test123"))
                      .thenReturn(mockPaymentIntent);

            assertThrows(RuntimeException.class, () -> paymentService.confirmPayment(request));

            assertEquals(ReservationStatus.CANCELLED, testReservation.getStatus());
            verify(reservationRepository).save(testReservation);
        }
    }

    @Test
    void confirmPayment_ReservationNotFound() {
        ConfirmPaymentRequest request = new ConfirmPaymentRequest();
        request.setPaymentIntentId("pi_test123");
        request.setReservationId(999L);

        when(reservationRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> paymentService.confirmPayment(request));
    }

    @Test
    void confirmPayment_StripeException() throws StripeException {
        ConfirmPaymentRequest request = new ConfirmPaymentRequest();
        request.setPaymentIntentId("pi_test123");
        request.setReservationId(1L);

        when(reservationRepository.findById(1L)).thenReturn(Optional.of(testReservation));

        try (MockedStatic<PaymentIntent> mockedStatic = mockStatic(PaymentIntent.class)) {
            mockedStatic.when(() -> PaymentIntent.retrieve("pi_test123"))
                      .thenThrow(new StripeException("Payment retrieval failed", "request_id", "code", 400));

            assertThrows(RuntimeException.class, () -> paymentService.confirmPayment(request));
        }
    }

    @Test
    void createPaymentIntent_WithDifferentCurrency() throws StripeException {
        PaymentIntentRequest request = new PaymentIntentRequest();
        request.setReservationId(1L);
        request.setCurrency("eur");

        PaymentIntent mockPaymentIntent = mock(PaymentIntent.class);
        when(mockPaymentIntent.getId()).thenReturn("pi_eur123");
        when(mockPaymentIntent.getClientSecret()).thenReturn("pi_eur123_secret");

        when(reservationRepository.findById(1L)).thenReturn(Optional.of(testReservation));

        try (MockedStatic<PaymentIntent> mockedStatic = mockStatic(PaymentIntent.class)) {
            mockedStatic.when(() -> PaymentIntent.create(any(PaymentIntentCreateParams.class)))
                      .thenReturn(mockPaymentIntent);

            PaymentIntentResponse response = paymentService.createPaymentIntent(request);

            assertNotNull(response);
            assertEquals("eur", response.getCurrency());
        }
    }

    @Test
    void confirmPayment_PaymentRequiresAction() throws StripeException {
        ConfirmPaymentRequest request = new ConfirmPaymentRequest();
        request.setPaymentIntentId("pi_test123");
        request.setReservationId(1L);

        PaymentIntent mockPaymentIntent = mock(PaymentIntent.class);
        when(mockPaymentIntent.getStatus()).thenReturn("requires_action");

        when(reservationRepository.findById(1L)).thenReturn(Optional.of(testReservation));

        try (MockedStatic<PaymentIntent> mockedStatic = mockStatic(PaymentIntent.class)) {
            mockedStatic.when(() -> PaymentIntent.retrieve("pi_test123"))
                      .thenReturn(mockPaymentIntent);

            assertThrows(RuntimeException.class, () -> paymentService.confirmPayment(request));

            // Reservation status should remain unchanged
            assertEquals(ReservationStatus.PENDING, testReservation.getStatus());
        }
    }
}