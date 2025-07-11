# WorkReserve Backend Sequence Diagrams

This repository now includes comprehensive sequence diagrams that illustrate the backend architecture and key user flows.

## 📋 Overview

The WorkReserve backend is a Spring Boot application that provides a REST API for room and workspace reservation management. The sequence diagrams show the interactions between different layers of the application.

## 🗂️ Available Diagrams

All diagrams are located in the `docs/sequence-diagrams/` directory and are available in both PlantUML source format (.puml) and rendered images (PNG/SVG).

### 1. 🔐 Authentication Flow
![Authentication Flow](docs/sequence-diagrams/Authentication%20Flow.png)

**Shows the complete user authentication process:**
- User registration with email verification
- Login with JWT token generation  
- Email verification process
- Password reset functionality

### 2. 📅 Reservation Flow  
![Reservation Flow](docs/sequence-diagrams/Reservation%20Flow.png)

**Demonstrates the reservation management process:**
- Creating new reservations with validation
- Retrieving user reservations (with caching)
- Cancelling reservations with proper authorization
- Time slot availability management

### 3. ⚙️ Admin Management Flow
![Admin Management Flow](docs/sequence-diagrams/Admin%20Management%20Flow.png)

**Illustrates administrative operations:**
- Room creation and management
- Bulk time slot generation
- Administrative statistics retrieval
- Time slot deletion with validation

### 4. 🏗️ Complete Backend Overview
![Complete Backend Overview](docs/sequence-diagrams/Complete%20Backend%20Overview.png)

**Provides a comprehensive system overview:**
- Application startup and configuration
- Request processing flow through all layers
- Core domain flows summary
- Error handling and cross-cutting concerns
- Caching strategy and data flow

## 🏛️ Architecture Overview

The backend follows a typical Spring Boot layered architecture:

```
┌─────────────────┐
│     Client      │
└─────────────────┘
         │
┌─────────────────┐
│ Spring Security │ ← JWT Authentication & Authorization
└─────────────────┘
         │
┌─────────────────┐
│  Controllers    │ ← REST API Endpoints (@RestController)
└─────────────────┘
         │
┌─────────────────┐
│   Services      │ ← Business Logic (@Service, @Transactional)
└─────────────────┘
         │
┌─────────────────┐
│  Repositories   │ ← Data Access Layer (JPA)
└─────────────────┘
         │
┌─────────────────┐
│   Database      │ ← PostgreSQL
└─────────────────┘
```

## 🔧 Key Components

- **Controllers**: AuthController, UserController, ReservationController, RoomController, TimeSlotController, AdminController
- **Services**: UserService, ReservationService, RoomService, TimeSlotService, AdminService, ActivityService
- **Repositories**: JPA repositories for data access
- **Configuration**: SecurityConfig, JwtService, MailService, CacheConfig
- **Cross-cutting**: Global exception handling, activity logging, caching, rate limiting

## 📊 Domain Model

- **User**: Authentication, roles (USER/ADMIN), profile management
- **Room**: Physical spaces available for reservation
- **TimeSlot**: Bookable time periods for rooms
- **Reservation**: User bookings of time slots
- **Activity**: Audit log of user actions

## 🚀 How to Use These Diagrams

1. **For Development**: Understanding the flow before implementing new features
2. **For Documentation**: System architecture documentation
3. **For Onboarding**: New team members understanding the system
4. **For Debugging**: Tracing request flows through the system
5. **For API Integration**: Understanding expected request/response flows

## 📁 Directory Structure

```
docs/
└── sequence-diagrams/
    ├── README.md                           # Detailed documentation
    ├── authentication-flow.puml           # PlantUML source
    ├── Authentication Flow.png            # Rendered image
    ├── Authentication Flow.svg            # Vector image
    ├── reservation-flow.puml
    ├── Reservation Flow.png
    ├── Reservation Flow.svg
    ├── admin-management-flow.puml
    ├── Admin Management Flow.png
    ├── Admin Management Flow.svg
    ├── complete-backend-overview.puml
    ├── Complete Backend Overview.png
    └── Complete Backend Overview.svg
```

## 🔄 Updating Diagrams

To modify or add new diagrams:

1. Edit the `.puml` files using PlantUML syntax
2. Regenerate images using PlantUML CLI or online editor
3. Update this documentation as needed

For more details, see the [sequence diagrams directory](docs/sequence-diagrams/).