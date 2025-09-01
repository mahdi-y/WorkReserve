# WorkReserve - Payment Processing Sequence Diagrams

To make the payment flow easier to understand, I've broken it down into smaller, focused diagrams. Each diagram covers a specific part of the process.

## Diagram 1: Initialize Payment Intent

sequenceDiagram
    title Initialize Payment Intent

    actor User
    participant Frontend as "Frontend<br/>(React)"
    participant PaymentController
    participant PaymentService
    participant DB as "Database"

    User ->> Frontend: Select time slot and<br/>proceed to payment
    Frontend ->> PaymentController: POST /api/payments/create-intent<br/>{slotId, teamSize}

    PaymentController ->> PaymentService: createPaymentIntent(request)
    PaymentService ->> DB: Get time slot details<br/>(room, pricing)
    DB -->> PaymentService: TimeSlot with Room data

    PaymentService ->> PaymentService: Calculate total amount<br/>(pricePerHour × duration × teamSize)
    note right of PaymentService: Example: $50/hour × 2 hours = $100

    PaymentService ->> PaymentService: Prepare Stripe parameters<br/>(amount in cents, currency=USD)

## Diagram 2: Create Stripe PaymentIntent

sequenceDiagram
    title Create Stripe PaymentIntent

    participant PaymentService
    participant Stripe as "Stripe API"
    participant PaymentController
    participant Frontend as "Frontend<br/>(React)"
    actor User

    PaymentService ->> Stripe: PaymentIntent.create()<br/>with retry logic
    note right of Stripe: **Retry Logic:**<br/>• Exponential backoff<br/>• Rate limit handling<br/>• Max 5 retries

    alt Stripe API success
        Stripe -->> PaymentService: PaymentIntent<br/>{id, client_secret, status}
        PaymentService -->> PaymentController: PaymentIntentResponse<br/>{clientSecret, paymentIntentId, amount}
        PaymentController -->> Frontend: 200 OK<br/>{payment details}
    else Stripe API failure
        loop Retry up to 5 times
            PaymentService ->> PaymentService: Calculate delay<br/>(exponential backoff)
            PaymentService ->> Stripe: Retry PaymentIntent.create()
        end
        
        alt Max retries exceeded
            PaymentService -->> PaymentController: StripeException
            PaymentController -->> Frontend: 502 Bad Gateway<br/>"Payment service unavailable"
            Frontend -->> User: Display error message
        end
    end

## Diagram 3: Client-side Payment Processing

sequenceDiagram
    title Client-side Payment Processing

    participant Frontend as "Frontend<br/>(React)"
    participant Stripe as "Stripe API"
    actor User

    Frontend ->> Frontend: Initialize Stripe Elements<br/>with client_secret
    Frontend -->> User: Display payment form<br/>(card details, billing info)

    User ->> Frontend: Enter payment information
    User ->> Frontend: Click "Confirm Payment"

    Frontend ->> Stripe: confirmPayment()<br/>(via Stripe.js)
    note right of Stripe: **Payment Methods:**<br/>• Credit/Debit Cards<br/>• 3D Secure authentication<br/>• Real-time validation

    alt Payment requires authentication
        Stripe -->> Frontend: requires_action status
        Frontend ->> Stripe: Handle 3D Secure flow
        Stripe -->> User: 3D Secure authentication
        User ->> Stripe: Complete authentication
        Stripe ->> Stripe: Continue payment processing
    end

## Diagram 4: Payment Confirmation

sequenceDiagram
    title Payment Confirmation

    participant Stripe as "Stripe API"
    participant Frontend as "Frontend<br/>(React)"
    participant PaymentController
    participant PaymentService
    actor User

    alt Payment succeeded
        Stripe -->> Frontend: payment_intent.succeeded
        Frontend ->> Frontend: Store payment confirmation
        Frontend ->> PaymentController: POST /api/payments/confirm<br/>{paymentIntentId}
        
        PaymentController ->> PaymentService: confirmPayment(paymentIntentId)
        PaymentService ->> Stripe: PaymentIntent.retrieve()<br/>with retry logic
        
        loop Retry mechanism
            alt Stripe returns success
                Stripe -->> PaymentService: PaymentIntent<br/>{status: "succeeded"}
            else Rate limit or temporary error
                PaymentService ->> PaymentService: Wait with exponential backoff
                PaymentService ->> Stripe: Retry retrieve operation
            end
        end
        
        PaymentService ->> PaymentService: Validate payment status<br/>(must be "succeeded")
        
        alt Payment verified as succeeded
            PaymentService -->> PaymentController: Payment confirmed
            PaymentController -->> Frontend: 200 OK<br/>{paymentConfirmed: true}
            
            Frontend ->> Frontend: Proceed to create reservation<br/>(with paymentIntentId)
            
        else Payment not succeeded
            PaymentService -->> PaymentController: PaymentException
            PaymentController -->> Frontend: 402 Payment Required
            Frontend -->> User: "Payment verification failed"
        end
        
    else Payment failed
        Stripe -->> Frontend: payment_intent.payment_failed
        Frontend -->> User: Display payment error<br/>(insufficient funds, card declined, etc.)
        
    else Payment cancelled
        Stripe -->> Frontend: User cancelled payment
        Frontend -->> User: Return to booking form
    end

## Diagram 5: Post-Payment Processing

sequenceDiagram
    title Post-Payment Processing

    participant Frontend as "Frontend<br/>(React)"
    participant ReservationService

    note over Frontend, ReservationService: After successful payment confirmation,<br/>the reservation creation flow begins<br/>(as shown in reservation-sequence.puml)

    Frontend ->> ReservationService: Create reservation<br/>with verified paymentIntentId

## Diagram 6: Error Handling and Monitoring

sequenceDiagram
    title Error Handling and Monitoring

    participant PaymentService
    participant Stripe as "Stripe API"

    note over PaymentService, Stripe: **Retry Strategy Details:**

    PaymentService ->> PaymentService: executeWithRetry(operation)
    loop For each retry attempt
        alt Network/temporary error
            PaymentService ->> PaymentService: Calculate delay:<br/>baseDelay × 2^(attempt-1)<br/>+ random jitter
            PaymentService ->> PaymentService: Wait calculated delay
        else Rate limit error
            PaymentService ->> PaymentService: Use longer delay<br/>from Stripe headers
        else Permanent error
            PaymentService ->> PaymentService: Stop retrying
            note right of PaymentService: Exit retry loop
        end
    end

## Diagram 7: Reconciliation and Webhooks (Future)

sequenceDiagram
    title Reconciliation and Webhooks (Future)

    participant Stripe as "Stripe API"
    participant PaymentController
    participant PaymentService
    participant DB as "Database"
    participant EmailService as "Email Service"
    actor User

    note over Stripe, EmailService: **Planned Features:**<br/>• Stripe webhooks for payment status updates<br/>• Automated reconciliation<br/>• Failed payment recovery<br/>• Refund processing<br/>• Payment analytics

    alt Webhook received (planned)
        Stripe ->> PaymentController: POST /api/payments/webhook<br/>{payment_intent.succeeded}
        PaymentController ->> PaymentService: handleWebhook(event)
        PaymentService ->> DB: Update payment status
        PaymentService ->> EmailService: Send payment confirmation
        EmailService -->> User: Payment receipt email
    end
