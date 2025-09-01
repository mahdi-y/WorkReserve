flowchart TD
 subgraph Frontend["Frontend"]
        React["React Application<br>- TypeScript<br>- Vite<br>- Tailwind CSS<br>- Framer Motion<br>- React Router"]
        UI["UI Components<br>- Auth Forms<br>- Booking Calendar<br>- Payment Forms<br>- Admin Dashboard<br>- User Profile"]
  end
 subgraph Backend["Backend Services"]
        SpringBoot["Spring Boot Application<br>- Spring Security<br>- JPA/ORM<br>- REST APIs<br>- JWT"]
        Services["Core Services<br>- UserService (Auth)<br>- RoomService<br>- ReservationService<br>- PaymentService<br>- TwoFactorService<br>- AdminService"]
        Cache["Caching Layer<br>- Caffeine Cache<br>- Room Data<br>- Time Slots<br>- User Sessions"]
  end
 subgraph Database["Database"]
        DB(["Primary Database<br>- H2 (Dev)<br>- PostgreSQL (Prod)<br>- User, Room, Reservations<br>- Activity Logs"])
  end
 subgraph External["External Services"]
        Stripe(["Stripe API<br>- Payment Processing<br>- Webhooks"])
        Email(["Email Service<br>- SMTP, Notifications"])
        TOTP(["2FA Provider<br>- TOTP Generation, QR Codes, Backup Codes"])
  end
 subgraph Azure["Azure Cloud Infrastructure"]
        SWA(["Static Web Apps<br>- Frontend Hosting<br>- CDN<br>- SSL/TLS"])
        AppService(["App Service<br>- Backend Hosting<br>- Auto-scaling<br>- Monitoring"])
        CICD(["CI/CD Pipeline<br>- GitHub Actions<br>- Automated Testing<br>- Build &amp; Deploy"])
  end
    React --> UI & SpringBoot
    SpringBoot --> Services & Cache & DB
    UI --> Stripe
    Services --> Stripe & Email & TOTP
    CICD --> SWA & AppService
    SWA --> React
    AppService --> SpringBoot

    React@{ shape: rounded}
    UI@{ shape: rounded}
    SpringBoot@{ shape: rounded}
    Services@{ shape: rounded}
    Cache@{ shape: rounded}
     React:::frontend
     UI:::frontend
     SpringBoot:::backend
     Services:::backend
     Cache:::backend
     DB:::database
     Stripe:::external
     Email:::external
     TOTP:::external
     SWA:::azure
     AppService:::azure
     CICD:::azure
    classDef frontend fill:#E3F2FD,stroke:#1E88E5,stroke-width:2px,rx:10,ry:10
    classDef backend fill:#F3E5F5,stroke:#8E24AA,stroke-width:2px,rx:10,ry:10
    classDef database fill:#E8F5E8,stroke:#43A047,stroke-width:2px,rx:10,ry:10
    classDef external fill:#FFF3E0,stroke:#FB8C00,stroke-width:2px,rx:10,ry:10
    classDef azure fill:#FFEBEE,stroke:#E53935,stroke-width:2px,rx:10,ry:10
    style Frontend fill:#E3F2FD,stroke:#1E88E5,stroke-width:2px
    style Backend fill:#F3E5F5,stroke:#8E24AA,stroke-width:2px
    style Database fill:#E8F5E8,stroke:#43A047,stroke-width:2px
    style External fill:#FFF3E0,stroke:#FB8C00,stroke-width:2px
    style Azure fill:#FFEBEE,stroke:#E53935,stroke-width:2px


