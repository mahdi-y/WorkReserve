erDiagram
    User ||--o{ Reservation : "1:N user creates reservations"
    Room ||--o{ TimeSlot : "1:N room has time slots"
    TimeSlot ||--o{ Reservation : "1:N time slot can be reserved multiple times (different users/dates)"
    User }o--|| Role : "N:1 user has role"
    Room }o--|| RoomType : "N:1 room has type"
    Reservation }o--|| ReservationStatus : "N:1 reservation has status"
    Reservation ||--o| Payment : "1:1 reservation has payment"

    User {
        Long id PK
        String fullName
        String email UK
        String password
        Long roleId FK
        LocalDateTime createdAt
        Boolean enabled
        Boolean locked
        Boolean emailVerified
        String verificationToken
        LocalDateTime verificationTokenCreatedAt
        String resetPasswordToken
        LocalDateTime resetPasswordTokenCreatedAt
        Integer failedLoginAttempts
        LocalDateTime accountLockedAt
        String unlockToken
        LocalDateTime unlockTokenCreatedAt
        String refreshToken
        LocalDateTime refreshTokenExpiry
        Boolean banned
        Boolean twoFactorEnabled
        String twoFactorSecret
        String backupCodes
        LocalDateTime twoFactorEnabledAt
    }

    Room {
        Long id PK
        String name UK
        Long typeId FK
        Double pricePerHour
        Integer capacity
        String description
        String[] imageUrls
    }

    TimeSlot {
        Long id PK
        LocalDate date
        LocalTime startTime
        LocalTime endTime
        Long roomId FK
    }

    Reservation {
        Long id PK
        Long userId FK
        Long slotId FK
        Integer teamSize
        Double totalCost
        Long statusId FK
        LocalDateTime createdAt
    }

    Payment {
        String paymentIntentId PK
        Double amount
        String currency
        Long statusId FK
        String clientSecret
        Long reservationReference FK
    }

    Role {
        Long id PK
        String name
    }

    RoomType {
        Long id PK
        String name
    }

    ReservationStatus {
        Long id PK
        String name
    }

    PaymentStatus {
        Long id PK
        String name
    }

    %% Unique constraint on (userId, slotId) for Reservation
    %% Payment managed by Stripe API, not persisted as entity
