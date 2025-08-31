# WorkReserve UML Diagrams

This directory contains PlantUML diagrams documenting the WorkReserve system architecture and workflows.

## Diagrams Overview

### 1. System Architecture (`system-architecture.puml`)
High-level overview of the WorkReserve system showing:
- **Frontend Layer**: React + TypeScript + Vite + Tailwind CSS + Framer Motion
- **Backend Layer**: Spring Boot with Security, JPA, Validation, JWT, Caffeine Cache
- **Database Layer**: H2 (development) / PostgreSQL (production)
- **External Services**: Stripe API, Email Service, 2FA Provider
- **Infrastructure**: Azure Static Web Apps, Azure App Service, CI/CD Pipeline

### 2. Entity Relationship Diagram (`entity-relationship.puml`)
Database schema and entity relationships:
- **User**: Authentication principal with roles, 2FA, JWT tokens
- **Room**: Bookable resources with pricing and capacity
- **TimeSlot**: Available time intervals for room bookings
- **Reservation**: Binding between users and time slots
- **Payment**: Logical entity handled via Stripe PaymentIntent API

### 3. Authentication Sequence (`authentication-sequence.puml`)
User login workflow including:
- Standard username/password authentication
- Optional Two-Factor Authentication (2FA) flow
- JWT token generation and refresh
- Account lockout and unlock mechanisms
- Email verification and notifications

### 4. Reservation Sequence (`reservation-sequence.puml`)
Room booking workflow:
- Browse available rooms and time slots
- Real-time availability checking
- Payment-first reservation approach
- Race condition protection
- Cache invalidation and activity logging

### 5. Payment Processing (`payment-sequence.puml`)
Stripe payment integration:
- PaymentIntent creation with retry logic
- Client-side payment processing with Stripe Elements
- 3D Secure authentication support
- Payment confirmation and verification
- Error handling and reconciliation

### 6. Admin Dashboard (`admin-dashboard-sequence.puml`)
Administrative operations:
- Analytics and dashboard data fetching
- User management (ban/unban, password reset, user details)
- Room management (CRUD operations)
- Real-time monitoring and updates
- Activity logging and audit trails

## Viewing the Diagrams

These diagrams are written in [PlantUML](https://plantuml.com/) format. To view them:

### Online Viewers
1. [PlantUML Online Server](http://www.plantuml.com/plantuml/uml/)
2. [PlantText](https://www.planttext.com/)

### IDE Plugins
- **VS Code**: PlantUML extension
- **IntelliJ IDEA**: PlantUML integration plugin
- **Eclipse**: PlantUML plugin

### Command Line
```bash
# Install PlantUML
java -jar plantuml.jar diagram.puml

# Generate PNG
java -jar plantuml.jar -tpng diagram.puml

# Generate SVG
java -jar plantuml.jar -tsvg diagram.puml
```

## Key Features Documented

### Security
- JWT-based authentication with refresh tokens
- Optional Two-Factor Authentication (TOTP + backup codes)
- Role-based access control (USER/ADMIN)
- Account lockout protection
- Email verification

### Performance
- Caffeine caching for frequently accessed data
- Real-time availability checking
- Optimized database queries
- Retry mechanisms with exponential backoff

### Business Logic
- Payment-first reservation approach
- Race condition protection
- Comprehensive validation
- Activity logging and audit trails
- Email notifications

### Infrastructure
- Azure cloud deployment
- CI/CD pipeline with GitHub Actions
- Static web apps and app services
- Environment-based configuration

## Architecture Highlights

1. **Modular Design**: Clear separation between frontend, backend, and external services
2. **Scalability**: Caching, pagination, and optimized queries
3. **Reliability**: Retry mechanisms, error handling, and data consistency
4. **Security**: Authentication, authorization, and input validation
5. **Maintainability**: Clean architecture, comprehensive logging, and documentation

## Future Enhancements

The diagrams also document planned features:
- Stripe webhooks for payment reconciliation
- Redis for horizontal scaling
- Enhanced payment provider abstraction
- Advanced analytics and reporting
- Mobile application support