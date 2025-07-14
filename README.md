# WorkReserve

A modern coworking space reservation web application that enables users to book desks and rooms, manage their reservations, and handle payments seamlessly. The platform includes administrative tools for monitoring bookings, managing resources, and overseeing user activity.

## Project Overview

WorkReserve is a full-stack web application designed to streamline coworking space management and reservations. Users can browse available spaces, make bookings through an intuitive calendar interface, and manage their payments securely. Administrators have access to a comprehensive dashboard for managing spaces, users, and monitoring booking activity.

The application features secure authentication with both traditional login and Google Sign-In integration, multilingual support for international users, and automated email notifications for booking confirmations and reminders.

## Features

### User Features
- **User Registration & Authentication**: Secure JWT-based authentication with Google Sign-In integration
- **Space Discovery**: Browse available coworking spaces with real-time availability
- **Booking System**: Interactive calendar-based reservation system
- **Payment Processing**: Secure payment integration with Stripe
- **Reservation Management**: View, modify, and cancel existing bookings
- **Email Notifications**: Automated booking confirmations and reminder emails
- **Multilingual Support**: Available in English and French, with more languages planned

### Admin Features
- **Admin Dashboard**: Comprehensive overview of bookings and system activity
- **Space Management**: Add, edit, and manage coworking spaces and resources
- **User Management**: Monitor user activity and manage user accounts
- **Booking Oversight**: View and manage all reservations across the platform
- **Analytics**: Track usage patterns and booking statistics

### Technical Features
- **Responsive Design**: Modern, mobile-first UI using Tailwind CSS and ShadCN components
- **Real-time Updates**: Dynamic content updates and availability tracking
- **Secure API**: RESTful endpoints protected with Spring Security
- **Scalable Architecture**: Dockerized deployment for easy scaling

## Tech Stack

### Frontend
- **React** - Modern JavaScript framework
- **Vite** - Fast build tool and development server
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **ShadCN UI** - High-quality component library
- **React Router** - Client-side routing
- **Axios** - HTTP client for API communication
- **React Hook Form** - Form handling and validation
- **React Big Calendar** - Calendar component for bookings
- **Framer Motion** - Animation library

### Backend
- **Spring Boot 3.2.5** - Java application framework
- **Java 21** - Programming language
- **Spring Security** - Authentication and authorization
- **Spring Data JPA** - Data persistence layer
- **PostgreSQL** - Primary database
- **JWT** - Token-based authentication
- **Spring Mail** - Email service integration
- **Maven** - Dependency management and build tool

### Third-party Services
- **Stripe** - Payment processing
- **Google OAuth** - Social authentication
- **Email Service** - Notification system

### Development & Deployment
- **Docker** - Containerization
- **Railway/Render** - Cloud hosting platforms
- **Git** - Version control

## Getting Started

### Prerequisites
- **Node.js** 18+ and npm
- **Java** 21+
- **Maven** 3.8+
- **PostgreSQL** 14+
- **Docker** (optional, for containerized deployment)

### Development Setup

#### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   ./mvnw clean install
   ```

3. **Set up PostgreSQL database:**
   ```sql
   CREATE DATABASE workreserve;
   CREATE USER workreserve_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE workreserve TO workreserve_user;
   ```

4. **Configure environment variables** (create `src/main/resources/application-dev.properties`)

5. **Run the backend:**
   ```bash
   ./mvnw spring-boot:run
   ```

The backend will start on `http://localhost:8082`

#### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables** (see Environment Variables section)

4. **Start the development server:**
   ```bash
   npm run dev
   ```

The frontend will start on `http://localhost:5173`

#### Running Tests

**Frontend:**
```bash
cd frontend
npm run lint
```

**Backend:**
```bash
cd backend
./mvnw test
```

## Running with Docker

### Prerequisites
- Docker and Docker Compose installed

### Docker Setup

Currently, the project doesn't include pre-configured Docker files, but you can easily containerize the application:

#### Create Dockerfile for Backend

Create `backend/Dockerfile`:
```dockerfile
FROM openjdk:21-jdk-slim
VOLUME /tmp
COPY target/*.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
EXPOSE 8082
```

#### Create Dockerfile for Frontend

Create `frontend/Dockerfile`:
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

#### Create docker-compose.yml

Create `docker-compose.yml` in the root directory:
```yaml
version: '3.8'
services:
  database:
    image: postgres:14
    environment:
      POSTGRES_DB: workreserve
      POSTGRES_USER: workreserve_user
      POSTGRES_PASSWORD: workreserve_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "8082:8082"
    depends_on:
      - database
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://database:5432/workreserve
      SPRING_DATASOURCE_USERNAME: workreserve_user
      SPRING_DATASOURCE_PASSWORD: workreserve_password

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

#### Running with Docker

1. **Build and run all services:**
   ```bash
   docker-compose up --build
   ```

2. **Access the application:**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8082`
   - Database: `localhost:5432`

## Environment Variables

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```env
# API Configuration
VITE_API_URL=http://localhost:8082/api
VITE_APP_NAME=WorkReserve

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# Stripe (for payment processing)
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### Backend Environment Variables

Create an `application.properties` file in `backend/src/main/resources/`:

```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/workreserve
spring.datasource.username=workreserve_user
spring.datasource.password=your_database_password

# JWT Configuration
jwt.secret=your_jwt_secret_key
jwt.expiration=86400000

# Google OAuth
spring.security.oauth2.client.registration.google.client-id=your_google_client_id
spring.security.oauth2.client.registration.google.client-secret=your_google_client_secret

# Email Configuration
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your_email@gmail.com
spring.mail.password=your_email_password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# Stripe Configuration
stripe.secret.key=your_stripe_secret_key
stripe.webhook.secret=your_stripe_webhook_secret
```

### Production Environment Variables

For production deployment, ensure you set:
- Strong, unique JWT secrets
- Production database credentials
- Valid OAuth client credentials
- Production Stripe API keys
- Proper email service configuration

## API Overview

The WorkReserve API provides RESTful endpoints for all application functionality:

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/refresh` - Token refresh

### Booking Endpoints
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/{id}` - Update booking
- `DELETE /api/bookings/{id}` - Cancel booking

### Space Endpoints
- `GET /api/spaces` - Get available spaces
- `GET /api/spaces/{id}` - Get space details
- `GET /api/spaces/{id}/availability` - Check availability

### Admin Endpoints
- `GET /api/admin/bookings` - Get all bookings
- `GET /api/admin/users` - Manage users
- `POST /api/admin/spaces` - Create space

**API Documentation:** Access Swagger UI at `http://localhost:8082/swagger-ui.html` when running the backend.

## Deployment

### Production Deployment

The application is designed for deployment on modern cloud platforms:

#### Railway Deployment
1. Connect your GitHub repository to Railway
2. Configure environment variables in Railway dashboard
3. Deploy both frontend and backend services
4. Set up PostgreSQL database addon

#### Render Deployment
1. Create separate services for frontend and backend
2. Configure build and start commands
3. Set up PostgreSQL database
4. Configure environment variables

#### Environment-Specific Configurations
- **Development**: Use local PostgreSQL and development API keys
- **Staging**: Use staging database and test API keys
- **Production**: Use production database and live API keys

### Build Commands

**Frontend:**
```bash
npm run build
```

**Backend:**
```bash
./mvnw clean package -DskipTests
```

## Screenshots

> Screenshots and demo videos will be added here to showcase the application's features and user interface.

### Dashboard Preview
*[Screenshot placeholder - Admin dashboard overview]*

### Booking Interface
*[Screenshot placeholder - Calendar booking interface]*

### Space Listing
*[Screenshot placeholder - Available spaces view]*

### Mobile Responsive Design
*[Screenshot placeholder - Mobile interface]*

## Contributing

We welcome contributions to WorkReserve! Please follow these guidelines:

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes and commit:**
   ```bash
   git commit -m "Add: description of your changes"
   ```
4. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Create a Pull Request**

### Code Standards

- **Frontend**: Follow ESLint configuration and React best practices
- **Backend**: Follow Java coding conventions and Spring Boot patterns
- **Commits**: Use conventional commit messages
- **Testing**: Add tests for new features and bug fixes

### Development Guidelines

- Maintain the existing code style and patterns
- Add appropriate error handling and validation
- Update documentation for new features
- Ensure responsive design for frontend changes
- Follow security best practices for backend changes

### Reporting Issues

Please use the GitHub Issues tab to report bugs or request features. Include:
- Clear description of the issue or feature request
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Environment details (OS, browser, versions)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**WorkReserve** - Making coworking space management simple and efficient.

For questions or support, please open an issue on GitHub or contact the development team.