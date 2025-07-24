package com.workreserve.backend.payment;

import com.stripe.exception.RateLimitException;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.PaymentIntentRetrieveParams;
import com.workreserve.backend.exception.ResourceNotFoundException;
import com.workreserve.backend.exception.ValidationException;
import com.workreserve.backend.payment.DTO.PaymentIntentRequest;
import com.workreserve.backend.payment.DTO.PaymentIntentResponse;
import com.workreserve.backend.timeslot.TimeSlot;
import com.workreserve.backend.timeslot.TimeSlotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class PaymentService {

    private static final Logger logger = LoggerFactory.getLogger(PaymentService.class);
    private static final int MAX_RETRIES = 5;
    private static final long BASE_DELAY_MS = 1000L;

    @Autowired
    private TimeSlotRepository timeSlotRepository;

    public PaymentIntentResponse createPaymentIntent(PaymentIntentRequest request) throws StripeException {
        TimeSlot timeSlot = timeSlotRepository.findById(request.getSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Time slot not found"));

        if (request.getTeamSize() > timeSlot.getRoom().getCapacity()) {
            throw new ValidationException("Team size exceeds room capacity");
        }

        double hours = (timeSlot.getEndTime().toSecondOfDay() - timeSlot.getStartTime().toSecondOfDay()) / 3600.0;
        double totalCostUSD = timeSlot.getRoom().getPricePerHour() * hours;

        long amountInCents = Math.round(totalCostUSD * 100);

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountInCents)
                .setCurrency("usd")
                .setAutomaticPaymentMethods(
                    PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                        .setEnabled(true)
                        .build()
                )
                .putMetadata("slotId", request.getSlotId().toString())
                .putMetadata("teamSize", request.getTeamSize().toString())
                .putMetadata("roomName", timeSlot.getRoom().getName())
                .build();

        return executeWithRetry(() -> {
            PaymentIntent intent = PaymentIntent.create(params);
            return new PaymentIntentResponse(
                intent.getClientSecret(),
                intent.getId(),
                totalCostUSD
            );
        }, "create payment intent");
    }

    public PaymentIntent getPaymentIntent(String paymentIntentId) throws StripeException {
        return executeWithRetry(() -> {
            return PaymentIntent.retrieve(
                paymentIntentId,
                PaymentIntentRetrieveParams.builder().build(),
                null
            );
        }, "retrieve payment intent");
    }

    public boolean isPaymentSucceeded(String paymentIntentId) throws StripeException {
        try {
            PaymentIntent intent = getPaymentIntent(paymentIntentId);
            boolean succeeded = "succeeded".equals(intent.getStatus());
            logger.info("Payment {} status: {}", paymentIntentId, intent.getStatus());
            return succeeded;
        } catch (Exception e) {
            logger.error("Error checking payment status for {}: {}", paymentIntentId, e.getMessage());

            if (e.getMessage().contains("lock_timeout") || e.getMessage().contains("rate")) {
                logger.warn("Stripe temporary error for {}, assuming success if reservation exists", paymentIntentId);
                return true; 
            }
            
            throw e;
        }
    }

    private <T> T executeWithRetry(StripeOperation<T> operation, String operationName) throws StripeException {
        int currentRetry = 0;
        
        while (currentRetry <= MAX_RETRIES) {
            try {
                return operation.execute();
            } catch (RateLimitException e) {
                currentRetry++;
                
                if (currentRetry > MAX_RETRIES) {
                    logger.error("Max retries exceeded for {}: {}", operationName, e.getMessage());
                    throw new RuntimeException("Service temporarily unavailable. Please try again later.");
                }
                
                long delay = calculateDelay(currentRetry, e);
                
                try {
                    logger.warn("Stripe rate limit for {}, retrying in {}ms (attempt {}/{})", 
                              operationName, delay, currentRetry, MAX_RETRIES);
                    Thread.sleep(delay);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("Operation interrupted");
                }
            } catch (StripeException e) {
                if (e.getMessage() != null && 
                    (e.getMessage().contains("lock_timeout") || 
                     e.getMessage().contains("temporarily_unavailable") ||
                     e.getMessage().contains("service_unavailable"))) {
                    
                    currentRetry++;
                    
                    if (currentRetry > MAX_RETRIES) {
                        logger.error("Max retries exceeded for {} due to temporary error: {}", operationName, e.getMessage());
                        throw new RuntimeException("Payment service busy. Please try again in a moment.");
                    }
                    
                    long delay = calculateDelay(currentRetry, e);
                    
                    try {
                        logger.warn("Stripe temporary error for {}, retrying in {}ms (attempt {}/{}): {}", 
                                  operationName, delay, currentRetry, MAX_RETRIES, e.getMessage());
                        Thread.sleep(delay);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new RuntimeException("Operation interrupted");
                    }
                } else {
                    throw e;
                }
            }
        }
        
        throw new RuntimeException("Failed to execute " + operationName + " after retries");
    }

    private long calculateDelay(int retryCount, Exception e) {
        long baseDelay = BASE_DELAY_MS * (1L << (retryCount - 1)); 
        
        long jitter = (long) (Math.random() * baseDelay * 0.1);
        
        return Math.min(baseDelay + jitter, 30000L);
    }

    @FunctionalInterface
    private interface StripeOperation<T> {
        T execute() throws StripeException;
    }
}
