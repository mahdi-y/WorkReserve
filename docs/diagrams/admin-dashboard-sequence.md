# WorkReserve - Admin Dashboard Sequence Diagrams

To make the admin dashboard flow easier to understand, I've broken it down into smaller, focused diagrams. Each diagram covers a specific part of the process.

## Diagram 1: Admin Authentication & Access

sequenceDiagram
    title Admin Authentication & Access

    actor Admin
    participant Frontend as "Frontend<br/>(Admin Dashboard)"

    Admin ->> Frontend: Login with admin credentials
    note right of Frontend: Uses same authentication flow<br/>but with ADMIN role

    Frontend ->> Frontend: Check user role = ADMIN
    alt Not admin user
        Frontend -->> Admin: Access denied<br/>(redirect to user dashboard)
    else Admin user authorized
        Frontend ->> Frontend: Load admin dashboard
    end

## Diagram 2: Fetch Analytics and Dashboard Data

sequenceDiagram
    title Fetch Analytics and Dashboard Data

    actor Admin
    participant Frontend as "Frontend<br/>(Admin Dashboard)"
    participant AdminController
    participant AdminService
    participant Cache as "Cache<br/>(Caffeine)"
    participant DB as "Database"

    Admin ->> Frontend: Navigate to admin dashboard
    Frontend ->> AdminController: GET /api/admin/analytics

    AdminController ->> AdminService: getAnalytics()
    AdminService ->> Cache: Check analytics cache
    alt Cache hit
        Cache -->> AdminService: Cached analytics data
    else Cache miss
        AdminService ->> DB: Query multiple tables<br/>(users, reservations, payments, rooms)
        
        par Parallel data fetching
            AdminService ->> DB: Get total users count
            and
            AdminService ->> DB: Get total reservations
            and
            AdminService ->> DB: Get revenue data
            and
            AdminService ->> DB: Get room usage statistics
            and
            AdminService ->> DB: Get recent activities
        end
        
        DB -->> AdminService: Aggregated analytics data
        AdminService ->> Cache: Store analytics in cache<br/>(5-minute expiry)
    end

    AdminService -->> AdminController: AnalyticsResponse<br/>{userStats, reservationStats, revenueStats, roomStats}
    AdminController -->> Frontend: 200 OK<br/>{analytics data}
    Frontend -->> Admin: Display dashboard widgets<br/>(charts, KPIs, tables)

## Diagram 3: User Management Operations

sequenceDiagram
    title User Management Operations

    actor Admin
    participant Frontend as "Frontend<br/>(Admin Dashboard)"
    participant UserController
    participant UserService
    participant Cache as "Cache<br/>(Caffeine)"
    participant DB as "Database"
    participant ActivityService
    participant EmailService

    Admin ->> Frontend: Click "Manage Users" tab
    Frontend ->> UserController: GET /api/users<br/>?page=1&size=20&search=email

    UserController ->> UserService: getUsersForAdmin(params)
    UserService ->> Cache: Check users cache
    alt Cache hit
        Cache -->> UserService: Cached user data
    else Cache miss
        UserService ->> DB: Query users with pagination<br/>and filtering
        DB -->> UserService: Paginated user list
        UserService ->> Cache: Store in cache
    end

    UserService -->> UserController: PagedUserResponse
    UserController -->> Frontend: 200 OK<br/>{users, pagination}
    Frontend -->> Admin: Display user management table

    alt Admin wants to ban/unban user
        Admin ->> Frontend: Click ban/unban button
        Frontend ->> UserController: PUT /api/users/{userId}/ban
        UserController ->> UserService: toggleUserBan(userId)
        UserService ->> DB: Update user.banned status
        UserService ->> Cache: Evict user cache
        UserService ->> ActivityService: Log admin action
        UserService -->> UserController: Success response
        UserController -->> Frontend: 200 OK
        Frontend -->> Admin: Update UI (show banned status)

    else Admin wants to reset user password
        Admin ->> Frontend: Click "Reset Password"
        Frontend ->> UserController: POST /api/users/{userId}/reset-password
        UserController ->> UserService: adminResetPassword(userId)
        UserService ->> UserService: Generate reset token
        UserService ->> DB: Save reset token
        UserService ->> EmailService: Send reset email
        UserService -->> UserController: Success response
        UserController -->> Frontend: 200 OK
        Frontend -->> Admin: Show "Reset email sent"

    else Admin wants to view user details
        Admin ->> Frontend: Click user details
        Frontend ->> UserController: GET /api/users/{userId}
        UserController ->> UserService: getUserDetails(userId)
        UserService ->> Cache: Check user cache
        UserService ->> DB: Get user with reservations
        UserService -->> UserController: Detailed user data
        UserController -->> Frontend: 200 OK
        Frontend -->> Admin: Show user profile modal
    end

## Diagram 4: Room Management Operations

sequenceDiagram
    title Room Management Operations

    actor Admin
    participant Frontend as "Frontend<br/>(Admin Dashboard)"
    participant RoomController
    participant RoomService
    participant Cache as "Cache<br/>(Caffeine)"
    participant DB as "Database"
    participant ActivityService

    Admin ->> Frontend: Click "Manage Rooms" tab
    Frontend ->> RoomController: GET /api/rooms

    RoomController ->> RoomService: getAllRooms()
    RoomService ->> Cache: Check rooms cache
    alt Cache hit
        Cache -->> RoomService: Cached rooms data
    else Cache miss
        RoomService ->> DB: Query all rooms
        DB -->> RoomService: Room list
        RoomService ->> Cache: Store in cache
    end

    RoomService -->> RoomController: List<RoomResponse>
    RoomController -->> Frontend: 200 OK<br/>{rooms}
    Frontend -->> Admin: Display room management table

    alt Admin wants to create new room
        Admin ->> Frontend: Click "Add Room"
        Frontend ->> Frontend: Show room creation form
        Admin ->> Frontend: Fill room details<br/>(name, type, capacity, price)
        Frontend ->> RoomController: POST /api/rooms
        RoomController ->> RoomService: createRoom(request)
        RoomService ->> DB: Save new room
        RoomService ->> Cache: Evict rooms cache
        RoomService ->> ActivityService: Log room creation
        RoomService -->> RoomController: Created room
        RoomController -->> Frontend: 201 Created
        Frontend -->> Admin: Update room list

    else Admin wants to update room
        Admin ->> Frontend: Click "Edit Room"
        Frontend ->> RoomController: GET /api/rooms/{roomId}
        RoomController ->> RoomService: getRoomById(roomId)
        RoomService -->> RoomController: Room details
        RoomController -->> Frontend: 200 OK
        Frontend ->> Frontend: Pre-fill edit form
        
        Admin ->> Frontend: Modify room details
        Frontend ->> RoomController: PUT /api/rooms/{roomId}
        RoomController ->> RoomService: updateRoom(roomId, request)
        RoomService ->> DB: Update room
        RoomService ->> Cache: Evict rooms cache
        RoomService -->> RoomController: Updated room
        RoomController -->> Frontend: 200 OK
        Frontend -->> Admin: Update UI

    else Admin wants to delete room
        Admin ->> Frontend: Click "Delete Room"
        Frontend ->> Frontend: Show confirmation dialog
        Admin ->> Frontend: Confirm deletion
        Frontend ->> RoomController: DELETE /api/rooms/{roomId}
        RoomController ->> RoomService: deleteRoom(roomId)
        RoomService ->> DB: Check for existing reservations
        alt Room has active reservations
            RoomService -->> RoomController: ValidationException
            RoomController -->> Frontend: 400 Bad Request
            Frontend -->> Admin: "Cannot delete room with reservations"
        else Room can be deleted
            RoomService ->> DB: Delete room
            RoomService ->> Cache: Evict rooms cache
            RoomService -->> RoomController: Success
            RoomController -->> Frontend: 200 OK
            Frontend -->> Admin: Remove room from list
        end
    end

## Diagram 5: Real-time Monitoring

sequenceDiagram
    title Real-time Monitoring

    participant Frontend as "Frontend<br/>(Admin Dashboard)"
    participant AdminController
    participant AdminService
    participant DB as "Database"
    actor Admin

    Frontend ->> Frontend: Set up polling for real-time data<br/>(every 30 seconds)

    loop Real-time updates
        Frontend ->> AdminController: GET /api/admin/analytics/realtime
        AdminController ->> AdminService: getRealtimeStats()
        AdminService ->> DB: Get current active reservations,<br/>online users, etc.
        AdminService -->> AdminController: Real-time data
        AdminController -->> Frontend: 200 OK
        Frontend ->> Frontend: Update dashboard widgets
        Frontend -->> Admin: Show updated metrics
    end

## Diagram 6: Activity and Audit Logs

sequenceDiagram
    title Activity and Audit Logs

    actor Admin
    participant Frontend as "Frontend<br/>(Admin Dashboard)"
    participant AdminController
    participant ActivityService
    participant DB as "Database"

    Admin ->> Frontend: Click "Activity Logs" tab
    Frontend ->> AdminController: GET /api/admin/activities<br/>?page=1&size=50

    AdminController ->> ActivityService: getActivitiesForAdmin(params)
    ActivityService ->> DB: Query activity logs<br/>with pagination
    DB -->> ActivityService: Paginated activities
    ActivityService -->> AdminController: Activity list
    AdminController -->> Frontend: 200 OK<br/>{activities, pagination}
    Frontend -->> Admin: Display activity log table<br/>(user actions, system events)

    note over Admin, DB: **Admin Dashboard Features:**<br/>• Real-time analytics and KPIs<br/>• User management (ban, reset, view)<br/>• Room management (CRUD operations)<br/>• Activity monitoring and audit logs<br/>• Performance metrics and caching<br/>• Role-based access control<br/>• Responsive updates