# Backend Sequence Diagrams

This directory contains sequence diagrams that illustrate the main backend flows and interactions in the WorkReserve application.

## Available Diagrams

### 1. Authentication Flow
- **Source**: `authentication-flow.puml` 
- **Images**: `Authentication Flow.png`, `Authentication Flow.svg`
- **Shows**: User registration, login, email verification, and password reset processes

### 2. Reservation Flow  
- **Source**: `reservation-flow.puml`
- **Images**: `Reservation Flow.png`, `Reservation Flow.svg`
- **Shows**: Creating, viewing, and cancelling reservations with validation and security checks

### 3. Admin Management Flow
- **Source**: `admin-management-flow.puml`
- **Images**: `Admin Management Flow.png`, `Admin Management Flow.svg`  
- **Shows**: Room creation, bulk time slot generation, admin statistics, and time slot deletion

### 4. Complete Backend Overview
- **Source**: `complete-backend-overview.puml`
- **Images**: `Complete Backend Overview.png`, `Complete Backend Overview.svg`
- **Shows**: Comprehensive system overview with all major components and their interactions

## How to View

### Pre-generated Images
The PNG and SVG files can be viewed directly in any image viewer or browser.

### PlantUML Source Files
The .puml files can be:
- Viewed in IDEs with PlantUML plugins (IntelliJ IDEA, VS Code, etc.)
- Rendered online at [PlantUML Server](http://www.plantuml.com/plantuml/uml/)
- Generated into PNG/SVG using PlantUML CLI tools

### Regenerating Images
To regenerate the images from the source files:
```bash
# Install PlantUML (requires Java)
wget https://github.com/plantuml/plantuml/releases/latest/download/plantuml.jar

# Generate PNG images
java -jar plantuml.jar -tpng *.puml

# Generate SVG images  
java -jar plantuml.jar -tsvg *.puml
```

## Architecture Overview

The backend follows a typical Spring Boot layered architecture:

- **Controllers**: REST API endpoints that handle HTTP requests
- **Services**: Business logic layer that processes requests
- **Repositories**: Data access layer that interacts with the database
- **Configuration**: Security, JWT, Mail services, etc.

Key components:
- Authentication & Authorization (JWT-based)
- User Management
- Room & Time Slot Management  
- Reservation System
- Admin Operations
- Activity Logging
- Email Services
- Caching Layer