# WorkReserve - Room Reservation Sequence Diagrams

To make the reservation flow easier to understand, I've broken it down into smaller, focused diagrams. Each diagram covers a specific part of the process.

## Diagram 1: Browse Available Rooms and Time Slots

sequenceDiagram
    title Browse Available Rooms and Time Slots

    actor User
    participant Frontend as "Frontend<br/>(React)"
    participant TimeSlotController
    participant Cache as "Cache<br/>(Caffeine)"
    participant DB as "Database"

    User ->> Frontend: Navigate to booking page
    Frontend ->> TimeSlotController: GET /api/timeslots/available<br/>?date=2024-01-15&roomId=1

    TimeSlotController ->> Cache: Check available timeslots cache
    alt Cache hit
        Cache -->> TimeSlotController: Cached availability data
    else Cache miss
        TimeSlotController ->> DB: Query available time slots
        DB -->> TimeSlotController: Available time slots
        TimeSlotController ->> Cache: Store in cache
    end

    TimeSlotController -->> Frontend: 200 OK<br/>[available time slots]
    Frontend -->> User: Display calendar with<br/>available time slots


## Diagram 2: Check Availability (Real-time)

sequenceDiagram
    title Check Availability (Real-time)

    actor User
    participant Frontend as "Frontend<br/>(React)"
    participant TimeSlotController
    participant DB as "Database"

    User ->> Frontend: Select specific time slot
    Frontend ->> TimeSlotController: GET /api/timeslots/{slotId}/availability

    TimeSlotController ->> DB: Check current reservations<br/>for time slot
    DB -->> TimeSlotController: Reservation status

    alt Time slot already reserved
        TimeSlotController -->> Frontend: 409 Conflict<br/>{available: false}
        Frontend -->> User: Show "Time slot unavailable"
    else Time slot available
        TimeSlotController -->> Frontend: 200 OK<br/>{available: true}
        Frontend -->> User: Allow reservation
    end


## Diagram 3: Create Reservation (with Payment)

sequenceDiagram
    title Create Reservation (with Payment)

    actor User
    participant Frontend as "Frontend<br/>(React)"
    participant PaymentService
    participant Stripe as "Stripe API"

    User ->> Frontend: Fill reservation form<br/>(team size, confirm details)
    Frontend ->> Frontend: Validate team size ≤ room capacity

    User ->> Frontend: Proceed to payment
    Frontend ->> PaymentService: POST /api/payments/create-intent
    note right of Frontend: Frontend calls payment endpoint first

    PaymentService ->> PaymentService: Calculate total cost<br/>(pricePerHour × duration)
    PaymentService ->> Stripe: Create PaymentIntent
    Stripe -->> PaymentService: PaymentIntent with client_secret
    PaymentService -->> Frontend: 200 OK<br/>{clientSecret, paymentIntentId}

    Frontend ->> Frontend: Initialize Stripe Elements<br/>with client secret
    Frontend -->> User: Display payment form

    User ->> Frontend: Enter payment details
    Frontend ->> Stripe: Confirm payment<br/>(via Stripe Elements)

    alt Payment failed
        Stripe -->> Frontend: Payment failed
        Frontend -->> User: Display payment error
        note right of Frontend: Process ends here
    else Payment succeeded
        Stripe -->> Frontend: Payment succeeded
        Frontend ->> ReservationController: POST /api/reservations<br/>{slotId, teamSize, paymentIntentId}
    end


## Diagram 4: Create Reservation After Payment

sequenceDiagram
    title Create Reservation After Payment

    participant ReservationController
    participant ReservationService
    participant DB as "Database"
    participant PaymentService
    participant Stripe as "Stripe API"
    participant Cache as "Cache<br/>(Caffeine)"
    participant ActivityService
    participant Frontend as "Frontend<br/>(React)"
    actor User

    ReservationController ->> ReservationService: createReservation(request)
    ReservationService ->> DB: Get authenticated user
    ReservationService ->> DB: Get time slot details

    alt Time slot not found
        ReservationService -->> ReservationController: ResourceNotFoundException
        ReservationController -->> Frontend: 404 Not Found
    else Slot already reserved (race condition)
        ReservationService ->> DB: Check existing reservations
        ReservationService -->> ReservationController: ConflictException
        ReservationController -->> Frontend: 409 Conflict
        Frontend -->> User: "Slot no longer available"
    else Team size exceeds capacity
        ReservationService -->> ReservationController: ValidationException
        ReservationController -->> Frontend: 400 Bad Request
        Frontend -->> User: "Team size too large"
    else Valid reservation
        ReservationService ->> PaymentService: isPaymentSucceeded(paymentIntentId)
        PaymentService ->> Stripe: Retrieve PaymentIntent
        Stripe -->> PaymentService: PaymentIntent status
        
        alt Payment not succeeded
            PaymentService -->> ReservationService: false
            ReservationService -->> ReservationController: PaymentException
            ReservationController -->> Frontend: 402 Payment Required
        else Payment succeeded
            PaymentService -->> ReservationService: true
            
            ReservationService ->> ReservationService: Create reservation entity<br/>(CONFIRMED status)
            ReservationService ->> DB: Save reservation
            DB -->> ReservationService: Saved reservation
            
            ReservationService ->> Cache: Evict cached data<br/>(timeslots, availability, reservations)
            
            ReservationService ->> ActivityService: logActivity("RESERVATION_CREATED")
            
            ReservationService -->> ReservationController: ReservationResponse
            ReservationController -->> Frontend: 201 Created<br/>{reservation details}
            Frontend -->> User: Show success message<br/>and reservation details
        end
    end


## Diagram 5: Confirmation and Notifications

sequenceDiagram
    title Confirmation and Notifications

    participant Frontend as "Frontend<br/>(React)"
    actor User
    participant DB as "Database"

    Frontend ->> Frontend: Update UI with new reservation
    Frontend ->> Frontend: Navigate to "My Reservations"

    note over User, DB: **Key Features:**<br/>• Real-time availability checking<br/>• Payment-first approach (no reservation without payment)<br/>• Race condition protection via database constraints<br/>• Cache invalidation for data consistency<br/>• Activity logging for audit trail<br/>• Comprehensive error handling
