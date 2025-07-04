# WorkReserve Backend

This is the backend API for **WorkReserve**, a workspace reservation and management system.
It is built with **Spring Boot**, **Spring Security**, **JWT**, and **JPA/Hibernate**.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Configuration](#configuration)
  - [Running the Application](#running-the-application)
- [API Overview](#api-overview)
- [Testing](#testing)
- [Rate Limiting](#rate-limiting)
- [Email Sending](#email-sending)
- [Security](#security)
- [API Documentation](#api-documentation)
- [License](#license)

---

## Features

- User registration with email verification
- JWT-based authentication and refresh tokens
- Password reset and change
- Account lockout and unlock via email
- Role-based access control (USER, ADMIN)
- CRUD operations for users, rooms, and reservations
- Rate limiting for login and registration endpoints
- CORS configuration for frontend integration
- Email notifications for verification, password reset, and unlock
- API documentation with OpenAPI/Swagger

---

## Tech Stack

- Java 17+
- Spring Boot 3.x
- Spring Security
- Spring Data JPA (Hibernate)
- H2/PostgreSQL/MySQL (configurable)
- JWT (JSON Web Tokens)
- Bucket4j (rate limiting)
- Swagger/OpenAPI
- JUnit & Mockito (testing)
- Maven

---

## Getting Started

### Prerequisites

- Java 17 or higher
- Maven 3.8+
- (Optional) PostgreSQL/MySQL if not using H2

### Configuration

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/WorkReserve.git
   cd WorkReserve/backend
   ```

2. **Configure application properties:**

   Edit `src/main/resources/application.properties` for database, mail, and JWT settings.

   Example for H2 (default):

   ```properties
   spring.datasource.url=jdbc:h2:mem:workreserve;DB_CLOSE_DELAY=-1
   spring.datasource.driverClassName=org.h2.Driver
   spring.datasource.username=sa
   spring.datasource.password=
   spring.jpa.hibernate.ddl-auto=update

   # JWT
   app.jwt.secret=your_jwt_secret
   app.jwt.expiration=3600000

   # Mail
   spring.mail.host=smtp.example.com
   spring.mail.port=587
   spring.mail.username=your_email@example.com
   spring.mail.password=your_password
   spring.mail.properties.mail.smtp.auth=true
   spring.mail.properties.mail.smtp.starttls.enable=true

   # Frontend URL for email links
   app.frontend.url=http://localhost:3000

   # Rate limiting
   app.rate-limit.enabled=true
   ```

3. **(Optional) Configure for PostgreSQL/MySQL:**

   Update the datasource properties accordingly.

### Running the Application

#### Using Maven Wrapper

```bash
./mvnw spring-boot:run
```

#### Or with Maven

```bash
mvn spring-boot:run
```

The backend will start on [http://localhost:8082](http://localhost:8082) by default.

---

## API Overview

### Authentication

- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login and receive JWT tokens
- `GET /api/auth/verify?token=...` — Verify email
- `POST /api/auth/resend-verification` — Resend verification email
- `POST /api/auth/forgot-password` — Request password reset
- `POST /api/auth/reset-password` — Reset password with token
- `POST /api/auth/unlock` — Unlock account with email and token
- `POST /api/auth/refresh-token` — Refresh JWT tokens

### Users

- `GET /api/users` — List all users (Admin)
- `GET /api/users/{id}` — Get user by ID (Admin)
- `GET /api/users/me` — Get current user info
- `PUT /api/users/{id}` — Update user (Admin)
- `PUT /api/users/{id}/role` — Update user role (Admin)
- `PUT /api/users/{id}/toggle-status` — Enable/disable user (Admin)
- `PUT /api/users/change-password` — Change password (Authenticated)
- `DELETE /api/users/{id}` — Delete user (Admin)

### Rooms

- `GET /api/rooms` — List all rooms
- `GET /api/rooms/{id}` — Get room by ID
- `POST /api/rooms` — Create room (Admin)
- `PUT /api/rooms/{id}` — Update room (Admin)
- `DELETE /api/rooms/{id}` — Delete room (Admin)
- `GET /api/rooms/available` — Get available rooms for a time slot

### Reservations

- `GET /api/reservations` — List all reservations (Admin)
- `GET /api/reservations/user` — Get current user's reservations
- `GET /api/reservations/{id}` — Get reservation by ID
- `POST /api/reservations` — Create reservation
- `PUT /api/reservations/{id}` — Update reservation
- `DELETE /api/reservations/{id}` — Delete reservation

---

## Testing

Run all tests with:

```bash
./mvnw test
```

- Integration and unit tests are located in `src/test/java/com/workreserve/backend/`.

---

## Rate Limiting

- Login and registration endpoints are rate-limited (default: 5 requests per minute per IP).
- Configurable via `app.rate-limit.enabled` in properties.
- Returns HTTP 429 with message "Too many requests - try again later."

---

## Email Sending

- Uses Spring's `JavaMailSender`.
- Sends emails for verification, password reset, and account unlock.
- Configure SMTP settings in `application.properties`.

---

## Security

- JWT authentication for all protected endpoints.
- Role-based access control using `@PreAuthorize`.
- CORS configured for frontend integration (`http://localhost:3000` by default).
- Passwords are hashed with BCrypt.

---

## API Documentation

- Swagger UI available at: [http://localhost:8082/swagger-ui.html](http://localhost:8082/swagger-ui.html)

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

---

## Contact

For questions or contributions, open an issue or PR on [GitHub](https://github.com/yourusername/WorkReserve).
