# WorkReserve Documentation

This directory contains technical documentation for the WorkReserve project.

## 📋 Documentation Contents

### UML Diagrams (`/diagrams/`)
Complete set of PlantUML diagrams documenting system architecture and workflows:

1. **[System Architecture](diagrams/system-architecture.puml)** - High-level system overview
2. **[Entity Relationship Diagram](diagrams/entity-relationship.puml)** - Database schema and relationships  
3. **[Authentication Sequence](diagrams/authentication-sequence.puml)** - Login workflow with optional 2FA
4. **[Reservation Sequence](diagrams/reservation-sequence.puml)** - Room booking workflow
5. **[Payment Processing](diagrams/payment-sequence.puml)** - Stripe payment integration
6. **[Admin Dashboard](diagrams/admin-dashboard-sequence.puml)** - Administrative operations

See [diagrams/README.md](diagrams/README.md) for detailed information about viewing and using the diagrams.

## 🏗️ System Overview

WorkReserve is a modern room reservation system built with:

### Frontend
- **React 19** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Stripe Elements** for payments

### Backend  
- **Spring Boot 3.x** with Java 21
- **Spring Security** for authentication
- **Spring Data JPA** with Hibernate
- **JWT** tokens with refresh mechanism
- **Caffeine Cache** for performance
- **Stripe SDK** for payments

### Infrastructure
- **Azure Static Web Apps** (frontend hosting)
- **Azure App Service** (backend hosting)  
- **GitHub Actions** (CI/CD pipeline)
- **PostgreSQL** (production database)

## 🔑 Key Features

### Security & Authentication
- JWT-based authentication with refresh tokens
- Optional Two-Factor Authentication (TOTP)
- Role-based access control (USER/ADMIN)
- Account lockout protection
- Email verification system

### Booking System
- Real-time room availability checking
- Payment-first reservation approach
- Race condition protection
- Comprehensive validation
- Activity logging and audit trails

### Payment Integration
- Stripe PaymentIntent API
- Retry mechanisms with exponential backoff
- 3D Secure authentication support
- Payment verification and reconciliation

### Performance & Scalability  
- Multi-level caching strategy
- Optimized database queries
- Pagination for large datasets
- Asynchronous processing

### Administration
- Comprehensive admin dashboard
- User management capabilities
- Room management (CRUD operations)
- Real-time analytics and monitoring
- Activity logs and audit trails

## 📊 Architecture Principles

1. **Security First**: Authentication, authorization, and input validation at every layer
2. **Performance Optimized**: Caching, efficient queries, and minimized network calls
3. **Reliability**: Error handling, retry mechanisms, and data consistency
4. **Maintainability**: Clean architecture, comprehensive logging, and documentation
5. **Scalability**: Modular design supporting horizontal and vertical scaling

## 🚀 Getting Started

For setup instructions, see the main [README.md](../README.md) in the project root.

## 📖 Additional Resources

- **Backend Documentation**: [backend/README.md](../backend/README.md)
- **Frontend Documentation**: [frontend/README.md](../frontend/README.md)  
- **API Documentation**: Available via Swagger UI when running the backend
- **Deployment Guide**: See GitHub Actions workflows in `.github/workflows/`