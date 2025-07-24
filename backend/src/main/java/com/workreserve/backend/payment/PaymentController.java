package com.workreserve.backend.payment;

import com.stripe.exception.StripeException;
import com.workreserve.backend.exception.ConflictException;
import com.workreserve.backend.payment.DTO.ConfirmPaymentRequest;
import com.workreserve.backend.payment.DTO.PaymentIntentRequest;
import com.workreserve.backend.payment.DTO.PaymentIntentResponse;
import com.workreserve.backend.reservation.DTO.ReservationRequest;
import com.workreserve.backend.reservation.DTO.ReservationResponse;
import com.workreserve.backend.reservation.ReservationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@Tag(name = "Payments", description = "Payment processing endpoints")
public class PaymentController {

    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private ReservationService reservationService;

    @Value("${stripe.publishable.key}")
    private String publishableKey;

    @Operation(summary = "Get Stripe publishable key", description = "Get the Stripe publishable key for frontend")
    @GetMapping("/config")
    public ResponseEntity<Map<String, String>> getStripeConfig() {
        return ResponseEntity.ok(Map.of("publishableKey", publishableKey));
    }

    @Operation(summary = "Create payment intent", description = "Create a Stripe payment intent for booking")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/create-payment-intent")
    public ResponseEntity<PaymentIntentResponse> createPaymentIntent(
            @Valid @RequestBody PaymentIntentRequest request) {
        try {
            PaymentIntentResponse response = paymentService.createPaymentIntent(request);
            return ResponseEntity.ok(response);
        } catch (StripeException e) {
            logger.error("Stripe error creating payment intent: {}", e.getMessage());
            throw new RuntimeException("Failed to create payment intent: " + e.getMessage());
        }
    }

    @Operation(summary = "Confirm payment and create reservation", description = "Confirm payment and create the reservation")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/confirm-payment")
    public ResponseEntity<ReservationResponse> confirmPayment(
            @Valid @RequestBody ConfirmPaymentRequest request) {
        try {
            logger.info("Confirming payment for intent: {}", request.getPaymentIntentId());
            
            try {
                ReservationRequest reservationRequest = new ReservationRequest();
                reservationRequest.setSlotId(request.getSlotId());
                reservationRequest.setTeamSize(request.getTeamSize());

                ReservationResponse reservation = reservationService.createReservation(reservationRequest);
                logger.info("Reservation created successfully: {}", reservation.getId());
                
                return ResponseEntity.ok(reservation);
                
            } catch (ConflictException e) {
                logger.info("Reservation already exists for slot {}, checking if it's the same user", request.getSlotId());
                
                boolean paymentSucceeded = false;
                try {
                    paymentSucceeded = paymentService.isPaymentSucceeded(request.getPaymentIntentId());
                } catch (Exception paymentError) {
                    logger.warn("Could not verify payment status due to Stripe error: {}", paymentError.getMessage());
                    paymentSucceeded = true;
                }
                
                if (paymentSucceeded) {

                    try {
                        ReservationResponse existingReservation = reservationService.getReservationBySlotId(request.getSlotId());
                        logger.info("Returning existing reservation: {}", existingReservation.getId());
                        return ResponseEntity.ok(existingReservation);
                    } catch (Exception ex) {
                        logger.error("Could not retrieve existing reservation: {}", ex.getMessage());
                        return ResponseEntity.badRequest().body(null);
                    }
                } else {
                    logger.warn("Payment not succeeded for intent: {}", request.getPaymentIntentId());
                    return ResponseEntity.badRequest().body(null);
                }
            }

        } catch (Exception e) {
            logger.error("Error confirming payment: {}", e.getMessage());
            return ResponseEntity.badRequest().body(null);
        }
    }
}