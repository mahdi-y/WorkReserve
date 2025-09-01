# WorkReserve - User Authentication Sequence Diagrams

To make the authentication flow easier to understand, I've broken it down into smaller, focused diagrams. Each diagram covers a specific part of the process.

## Diagram 1: Standard Login Flow


sequenceDiagram
    title Standard Login Flow

    actor User
    participant Frontend as "Frontend<br/>(React)"
    participant AuthController
    participant UserService
    participant DB as "Database"

    User ->> Frontend: Enter credentials<br/>(email, password)
    Frontend ->> AuthController: POST /api/auth/login<br/>{email, password}

    AuthController ->> UserService: loginUser(request)
    UserService ->> DB: findByEmail(email)
    DB -->> UserService: User entity

    alt User not found or invalid credentials
        UserService -->> AuthController: UserException("Invalid credentials")
        AuthController -->> Frontend: 401 Unauthorized
        Frontend -->> User: Display error message
    else Account locked/banned
        UserService -->> AuthController: UserException("Account locked/banned")
        AuthController -->> Frontend: 401 Unauthorized
        Frontend -->> User: Display account status
    else Email not verified
        UserService -->> AuthController: UserException("Email not verified")
        AuthController -->> Frontend: 401 Unauthorized
        Frontend -->> User: Display verification message
    else Valid credentials
        UserService -->> AuthController: Success
        AuthController -->> Frontend: 200 OK<br/>{user}
        Frontend -->> User: Proceed to next step
    end


## Diagram 2: 2FA Flow


sequenceDiagram
    title 2FA Flow

    actor User
    participant Frontend as "Frontend<br/>(React)"
    participant AuthController
    participant UserService
    participant TwoFactorService

    UserService ->> UserService: Check twoFactorEnabled
    UserService -->> AuthController: TwoFactorRequiredException
    AuthController -->> Frontend: 403 Forbidden<br/>{twoFactorRequired: true}
    Frontend -->> User: Show 2FA input form

    User ->> Frontend: Enter 2FA code<br/>(6-digit TOTP or 8-digit backup)
    Frontend ->> AuthController: POST /api/auth/login/2fa<br/>{email, password, twoFactorCode}

    AuthController ->> UserService: loginUserWith2FA(request)
    UserService ->> UserService: Validate credentials again
    UserService ->> TwoFactorService: verifyCode(secret, code)

    alt Invalid 2FA code
        alt Backup code (8 digits)
            TwoFactorService ->> TwoFactorService: useBackupCode(user, code)
            alt Invalid backup code
                TwoFactorService -->> UserService: false
                UserService -->> AuthController: UserException("Invalid 2FA/backup code")
                AuthController -->> Frontend: 401 Unauthorized
                Frontend -->> User: Display error message
            else Valid backup code
                TwoFactorService -->> UserService: true
                note right of TwoFactorService: Backup code is consumed
            end
        else Invalid TOTP code
            TwoFactorService -->> UserService: false
            UserService -->> AuthController: UserException("Invalid 2FA code")
            AuthController -->> Frontend: 401 Unauthorized
            Frontend -->> User: Display error message
        end
    else Valid 2FA code
        TwoFactorService -->> UserService: true
        UserService -->> AuthController: Success
        AuthController -->> Frontend: 200 OK
        Frontend -->> User: Authentication successful
    end

## Diagram 3: Token Generation

sequenceDiagram
    title Token Generation

    participant UserService
    participant JWTService
    participant DB as "Database"
    participant AuthController
    participant Frontend as "Frontend<br/>(React)"
    actor User

    UserService ->> UserService: Reset failed login attempts
    UserService ->> JWTService: generateToken(email)
    JWTService -->> UserService: accessToken

    UserService ->> UserService: Generate refresh token
    UserService ->> DB: Update user<br/>(refreshToken, refreshTokenExpiry)

    UserService -->> AuthController: AuthResponseToken<br/>{accessToken, refreshToken, user}
    AuthController -->> Frontend: 200 OK<br/>{token, refreshToken, user}

    Frontend ->> Frontend: Store tokens<br/>(localStorage)
    Frontend ->> Frontend: Set Authorization header
    Frontend -->> User: Redirect to dashboard


## Diagram 4: Error Handling and Notifications

sequenceDiagram
    title Error Handling and Notifications

    participant UserService
    participant DB as "Database"
    participant EmailService as "Email Service"
    actor User

    note over UserService, DB: **Failed Login Handling:**<br/>• Increment failed attempts<br/>• Lock account after threshold<br/>• Send unlock email<br/>• Generate unlock token

    alt Too many failed attempts
        UserService ->> UserService: handleFailedLogin(user)
        UserService ->> DB: Update failedLoginAttempts
        
        alt Threshold exceeded
            UserService ->> UserService: Lock account
            UserService ->> DB: Update locked=true, accountLockedAt
            UserService ->> EmailService: Send unlock email<br/>(with unlock token)
            EmailService -->> User: Unlock account email
        end
    end

    %% Optional: Email Notification
    UserService ->> EmailService: Send login notification<br/>(if configured)
    EmailService -->> User: Email notification<br/>(new login detected)
