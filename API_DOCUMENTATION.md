# Flock ChatApp — Complete REST API Documentation

This document contains exhaustive, copy-paste ready documentation for **ALL** REST APIs implemented in the Flock ChatApp backend.

---

## 1. Backend Overview & Configuration

- **Runtime**: Node.js / Express
- **Real-Time Engine**: Socket.IO
- **Database**: MongoDB (Mongoose ODM)
- **Base Port**: `5000` (configured via `PORT` environment variable in `backend/.env`)
- **Default Base URL**: `http://localhost:5000`

---

## 2. Route Mounting Architecture

All API routes are mounted in `backend/server.js` with the following URL prefixes:

| Router Prefix | Route File | Primary Domain |
|---|---|---|
| `/` | `server.js` | Server Health & Status |
| `/api/auth` | `backend/routes/authRoutes.js` | User Registration, Login & Session Profile |
| `/api/users` | `backend/routes/userRoutes.js` | Team Directory, User Profile & Settings |
| `/api/organizations` | `backend/routes/organizationRoutes.js` | Company Registration, Creation & Switching |
| `/api/invitations` | `backend/routes/invitationRoutes.js` | Workspace Employee Invitations Lifecycle |
| `/api/channels` | `backend/routes/channelRoutes.js` | Group Channels, Membership & Channel Messages |
| `/api/conversations` | `backend/routes/conversationRoutes.js` | 1-on-1 Direct Messages & Conversation Settings |
| `/api/messages` | `backend/routes/messageRoutes.js` | Message Reactions, Edit, Delete, Forward & Read Receipts |
| `/api/notifications` | `backend/routes/notificationRoutes.js` | In-App Notifications & Unread Counters |
| `/api/todos` | `backend/routes/todoRoutes.js` | Task / To-Do Management, Assignment & Toggling |
| `/api/search` | `backend/routes/searchRoutes.js` | Global Unified & Message Search |
| `/api/pinned-messages` | `backend/routes/pinnedMessageRoutes.js` | Pinned Messages in Channels & Conversations |
| `/api/saved-messages` | `backend/routes/savedMessageRoutes.js` | Personal Saved / Bookmarked Messages |
| `/api/admin` | `backend/routes/adminRoutes.js` | Company Admin Dashboard, Members, Channels & Audit |
| `/api/super-admin` | `backend/routes/superAdminRoutes.js` | Platform Super Admin Approval, Plans & Subscriptions |

---

## 3. Authentication & JWT Authorization Flow

Protected APIs require a JSON Web Token (JWT) in the HTTP `Authorization` header.

### Postman Authentication Workflow:

1. **Send Login Request**:
   - `POST http://localhost:5000/api/auth/login`
2. **Extract Token**:
   - Copy the string from `response.body.token`.
3. **Configure Postman Authorization**:
   - Go to request **Authorization** tab.
   - Type: **Bearer Token**.
   - Token: `<PASTE_JWT_TOKEN>`.
4. **Header Format**:
   - `Authorization: Bearer <JWT_TOKEN>`

---

## 4. Complete API Reference

---

### CATEGORY 0: Server Health & Status

#### API 0.1: Root Health Check
- **Method**: `GET`
- **Complete URL**: `http://localhost:5000/`
- **Route File**: `backend/server.js`
- **Authentication**: NO
- **Authorization**: Public
- **Headers**: None
- **Path Parameters**: None
- **Query Parameters**: None
- **Body**: None
- **Purpose**: Verify backend HTTP server and Socket.IO status.
- **Success Response** (`200 OK`):
```json
{
  "status": "ok",
  "message": "ChatApp Backend is running with Socket.IO, Group Channels & File Sharing!"
}
```

#### API 0.2: API Health Endpoint
- **Method**: `GET`
- **Complete URL**: `http://localhost:5000/api/health`
- **Route File**: `backend/server.js`
- **Authentication**: NO
- **Authorization**: Public
- **Headers**: None
- **Path Parameters**: None
- **Query Parameters**: None
- **Body**: None
- **Purpose**: Health monitoring and timestamp heartbeat.
- **Success Response** (`200 OK`):
```json
{
  "status": "ok",
  "timestamp": "2026-09-03T10:45:00.000Z"
}
```

---

### CATEGORY 1: Authentication

#### API 1.1: Register User
- **Method**: `POST`
- **Complete URL**: `http://localhost:5000/api/auth/register`
- **Route File**: `backend/routes/authRoutes.js`
- **Controller**: `registerUser` in `backend/controllers/authController.js`
- **Authentication**: NO (Public)
- **Authorization**: Public
- **Headers**: `Content-Type: application/json`
- **Path Parameters**: None
- **Query Parameters**: None
- **Request Body**:
  - `name` (String, required)
  - `email` (String, required)
  - `password` (String, required, min 6 characters)
- **Valid Request JSON**:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password123!"
}
```
- **Success Response** (`201 Created`):
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "6a914dbb2a8e5a90064be5fe",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "user",
    "status": "active"
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: `{"message": "Please provide name, email, and password"}` or `{"message": "Password must be at least 6 characters long"}`
  - `409 Conflict`: `{"message": "Email already registered. Please login instead."}`

#### API 1.2: Login User
- **Method**: `POST`
- **Complete URL**: `http://localhost:5000/api/auth/login`
- **Route File**: `backend/routes/authRoutes.js`
- **Controller**: `loginUser` in `backend/controllers/authController.js`
- **Authentication**: NO (Public)
- **Authorization**: Public
- **Headers**: `Content-Type: application/json`
- **Path Parameters**: None
- **Query Parameters**: None
- **Request Body**:
  - `email` (String, required)
  - `password` (String, required)
- **Valid Request JSON**:
```json
{
  "email": "jane@example.com",
  "password": "Password123!"
}
```
- **Success Response** (`200 OK`):
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "6a914dbb2a8e5a90064be5fe",
    "_id": "6a914dbb2a8e5a90064be5fe",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "admin",
    "status": "active",
    "currentOrganization": {
      "_id": "6a9179cdd8bfa9616d6031d0",
      "name": "ABC Technologies",
      "status": "active",
      "subscription": {
        "plan": "free",
        "status": "active"
      }
    },
    "organizationCount": 1
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: `{"message": "Please provide email and password"}`
  - `401 Unauthorized`: `{"message": "Invalid email or password"}`
  - `403 Forbidden`: `{"message": "Account is deactivated. Please contact an administrator."}`

#### API 1.3: Get Current User Session (Me)
- **Method**: `GET`
- **Complete URL**: `http://localhost:5000/api/auth/me`
- **Route File**: `backend/routes/authRoutes.js`
- **Controller**: `getMe` in `backend/controllers/authController.js`
- **Authentication**: YES (`protect`)
- **Authorization**: Bearer JWT
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**: None
- **Query Parameters**: None
- **Body**: None
- **Purpose**: Get currently authenticated user session details and active company context.
- **Success Response** (`200 OK`):
```json
{
  "user": {
    "id": "6a914dbb2a8e5a90064be5fe",
    "_id": "6a914dbb2a8e5a90064be5fe",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "admin",
    "status": "active",
    "currentOrganization": {
      "_id": "6a9179cdd8bfa9616d6031d0",
      "name": "ABC Technologies"
    },
    "organizationCount": 1
  }
}
```
- **Error Responses**:
  - `401 Unauthorized`: `{"message": "Not authorized, token failed"}`

---

### CATEGORY 2: Users & User Profile

#### API 2.1: Get Team Users / Directory
- **Method**: `GET`
- **Complete URL**: `http://localhost:5000/api/users`
- **Route File**: `backend/routes/userRoutes.js`
- **Controller**: `getTeamUsers` in `backend/controllers/userController.js`
- **Authentication**: YES (`protect`)
- **Authorization**: Active Organization Member (`requireActiveOrg`)
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**: None
- **Query Parameters**: None
- **Body**: None
- **Purpose**: Get all active team members in the current company (excluding the caller).
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "count": 2,
  "users": [
    {
      "id": "6a8ea3262342db0d3dad30dc",
      "_id": "6a8ea3262342db0d3dad30dc",
      "name": "Lily",
      "email": "lily@gmail.com",
      "role": "admin",
      "membershipRole": "admin",
      "membershipId": "6a9179cdd8bfa9616d6031d1",
      "status": "active",
      "avatar": "/uploads/avatar-123.png",
      "title": "Lead Engineer",
      "bio": "Building realtime systems."
    }
  ]
}
```

#### API 2.2: Get User Profile
- **Method**: `GET`
- **Complete URL**: `http://localhost:5000/api/users/profile`
- **Route File**: `backend/routes/userRoutes.js`
- **Controller**: `getProfile` in `backend/controllers/userController.js`
- **Authentication**: YES (`protect`)
- **Authorization**: Bearer JWT
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**: None
- **Query Parameters**: None
- **Body**: None
- **Purpose**: Retrieve full personal user profile.
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "user": {
    "_id": "6a914dbb2a8e5a90064be5fe",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "admin",
    "status": "active",
    "title": "Product Designer",
    "bio": "Designing interfaces",
    "phone": "+1234567890",
    "avatar": ""
  }
}
```

#### API 2.3: Update User Profile
- **Method**: `PUT` (or `PATCH`)
- **Complete URL**: `http://localhost:5000/api/users/profile`
- **Route File**: `backend/routes/userRoutes.js`
- **Controller**: `updateProfile` in `backend/controllers/userController.js`
- **Authentication**: YES (`protect`)
- **Authorization**: Bearer JWT
- **Headers**:
  - `Authorization: Bearer <JWT_TOKEN>`
  - `Content-Type: application/json` (or `multipart/form-data` if uploading `avatar` file)
- **Path Parameters**: None
- **Query Parameters**: None
- **Request Body** (JSON or Multipart Form):
  - `name` (String, optional)
  - `bio` (String, optional)
  - `title` (String, optional)
  - `phone` (String, optional)
  - `avatar` (String URL or uploaded File field `avatar`, optional)
- **Valid Request JSON**:
```json
{
  "name": "Jane Doe",
  "bio": "Senior Full-Stack Architect",
  "title": "Engineering Lead",
  "phone": "+1 (555) 019-2834"
}
```
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "_id": "6a914dbb2a8e5a90064be5fe",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "title": "Engineering Lead",
    "bio": "Senior Full-Stack Architect",
    "phone": "+1 (555) 019-2834",
    "avatar": ""
  }
}
```

#### API 2.4: Update User Preferences & Settings
- **Method**: `PUT` (or `PATCH`)
- **Complete URL**: `http://localhost:5000/api/users/settings`
- **Route File**: `backend/routes/userRoutes.js`
- **Controller**: `updateSettings` in `backend/controllers/userController.js`
- **Authentication**: YES (`protect`)
- **Authorization**: Bearer JWT
- **Headers**:
  - `Authorization: Bearer <JWT_TOKEN>`
  - `Content-Type: application/json`
- **Path Parameters**: None
- **Query Parameters**: None
- **Request Body**:
  - `notifications` (Object, optional: `desktop`, `sound`, `mentionsOnly`, `emailAlerts`)
  - `appearance` (Object, optional: `theme` ['dark'|'light'], `fontSize`, `compactMode`)
  - `privacy` (Object, optional: `onlineStatus` ['everyone'|'contacts'|'nobody'], `readReceipts`, `lastSeen`)
  - `chat` (Object, optional: `sendOnEnter`, `mediaAutoDownload`, `emojiReactions`)
- **Valid Request JSON**:
```json
{
  "notifications": {
    "desktop": true,
    "sound": true,
    "mentionsOnly": false
  },
  "appearance": {
    "theme": "dark",
    "compactMode": false
  },
  "privacy": {
    "onlineStatus": "everyone",
    "readReceipts": true,
    "lastSeen": true
  }
}
```
- **Socket.IO Event Emitted**:
  - `user:settings_updated` to `user:${userId}`
  - `user:presence_visibility_changed` to global broadcast (if `privacy.onlineStatus` changed)
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Settings updated successfully",
  "settings": {
    "notifications": { "desktop": true, "sound": true, "mentionsOnly": false },
    "appearance": { "theme": "dark", "compactMode": false },
    "privacy": { "onlineStatus": "everyone", "readReceipts": true, "lastSeen": true }
  }
}
```

---

### CATEGORY 3: Organizations / Companies

#### API 3.1: Register User & Create Company (Single Step)
- **Method**: `POST`
- **Complete URL**: `http://localhost:5000/api/organizations/register-company`
- **Route File**: `backend/routes/organizationRoutes.js`
- **Controller**: `registerAndCreateCompany` in `backend/controllers/organizationController.js`
- **Authentication**: NO (Public)
- **Authorization**: Public
- **Headers**: `Content-Type: application/json`
- **Path Parameters**: None
- **Query Parameters**: None
- **Request Body**:
  - `name` (String, required)
  - `email` (String, required)
  - `password` (String, required, min 6 characters)
  - `companyName` (String, required)
  - `companyDescription` (String, optional)
  - `plan` or `requestedPlan` (String, optional: `'free'` | `'professional'` | `'enterprise'`, default: `'free'`)
- **Valid Request JSON**:
```json
{
  "name": "Founder Bob",
  "email": "bob@nexus.com",
  "password": "Password123!",
  "companyName": "Nexus Systems",
  "companyDescription": "Cloud innovations",
  "plan": "free"
}
```
- **Socket.IO Event Emitted**:
  - `notification:new` to Super Admins
  - `superadmin:company_request` to room `super_admins`
- **Success Response** (`201 Created`):
```json
{
  "success": true,
  "message": "Company \"Nexus Systems\" created successfully! It is awaiting Super Admin approval.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "companyStatus": "pending",
  "isCompanyActive": false,
  "user": {
    "id": "6a993471ae252685e85be0de",
    "name": "Founder Bob",
    "email": "bob@nexus.com",
    "role": "admin",
    "status": "active",
    "currentOrganization": {
      "_id": "6a993471ae252685e85be0df",
      "name": "Nexus Systems",
      "status": "pending"
    },
    "organizationStatus": "pending",
    "isCompanyActive": false
  },
  "organization": {
    "_id": "6a993471ae252685e85be0df",
    "name": "Nexus Systems",
    "status": "pending",
    "subscription": {
      "plan": "free",
      "status": "pending"
    }
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: `{"success": false, "message": "Please provide full name, email, password, and company name"}`
  - `409 Conflict`: `{"success": false, "message": "An account with this email already exists. Please sign in first."}`

#### API 3.2: Create New Organization (Authenticated User)
- **Method**: `POST`
- **Complete URL**: `http://localhost:5000/api/organizations`
- **Route File**: `backend/routes/organizationRoutes.js`
- **Controller**: `createOrganization` in `backend/controllers/organizationController.js`
- **Authentication**: YES (`protect`)
- **Authorization**: Bearer JWT
- **Headers**:
  - `Authorization: Bearer <JWT_TOKEN>`
  - `Content-Type: application/json`
- **Path Parameters**: None
- **Query Parameters**: None
- **Request Body**:
  - `name` (String, required)
  - `description` (String, optional)
  - `plan` or `requestedPlan` (String, optional: `'free'` | `'professional'` | `'enterprise'`)
- **Valid Request JSON**:
```json
{
  "name": "Apex Innovations",
  "description": "Next-generation software",
  "plan": "professional"
}
```
- **Success Response** (`201 Created`):
```json
{
  "success": true,
  "message": "Organization \"Apex Innovations\" created successfully! It is awaiting Super Admin approval.",
  "companyStatus": "pending",
  "isCompanyActive": false,
  "organization": {
    "_id": "6a9939b1ae252685e85be0ee",
    "name": "Apex Innovations",
    "status": "pending",
    "subscription": {
      "plan": "professional",
      "status": "pending"
    }
  }
}
```

#### API 3.3: Get My Organizations
- **Method**: `GET`
- **Complete URL**: `http://localhost:5000/api/organizations/my`
- **Route File**: `backend/routes/organizationRoutes.js`
- **Controller**: `getMyOrganizations` in `backend/controllers/organizationController.js`
- **Authentication**: YES (`protect`)
- **Authorization**: Bearer JWT
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**: None
- **Query Parameters**: None
- **Body**: None
- **Purpose**: Get all organizations the authenticated user belongs to.
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "organizations": [
    {
      "_id": "6a9179cdd8bfa9616d6031d0",
      "name": "ABC Technologies",
      "status": "active",
      "role": "admin",
      "isCurrent": true
    }
  ],
  "currentOrganization": {
    "_id": "6a9179cdd8bfa9616d6031d0",
    "name": "ABC Technologies"
  }
}
```

#### API 3.4: Switch Active Organization
- **Method**: `POST`
- **Complete URL**: `http://localhost:5000/api/organizations/:id/switch`
- **Route File**: `backend/routes/organizationRoutes.js`
- **Controller**: `switchOrganization` in `backend/controllers/organizationController.js`
- **Authentication**: YES (`protect`)
- **Authorization**: Active Member of Target Organization
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**:
  - `id` (String ObjectId, required: Target Organization ID)
- **Query Parameters**: None
- **Body**: None
- **Purpose**: Switch active workspace context to another company.
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Switched active organization to \"ABC Technologies\"",
  "organization": {
    "_id": "6a9179cdd8bfa9616d6031d0",
    "name": "ABC Technologies",
    "status": "active"
  },
  "role": "admin"
}
```
- **Error Responses**:
  - `403 Forbidden`: `{"success": false, "message": "You are not an active member of this organization"}`

---

### CATEGORY 4: Workspace Invitations

#### API 4.1: Send Invitation to Employee (Admin)
- **Method**: `POST`
- **Complete URL**: `http://localhost:5000/api/invitations`
- **Route File**: `backend/routes/invitationRoutes.js`
- **Controller**: `createInvitation` in `backend/controllers/invitationController.js`
- **Authentication**: YES (`protect`)
- **Authorization**: Company Admin / Owner (`adminOnly`, `requireActiveOrg`)
- **Headers**:
  - `Authorization: Bearer <JWT_TOKEN>`
  - `Content-Type: application/json`
- **Path Parameters**: None
- **Query Parameters**: None
- **Request Body**:
  - `email` (String, required, valid email format)
- **Valid Request JSON**:
```json
{
  "email": "employee@example.com"
}
```
- **Socket.IO Events Emitted**:
  - `notification:new` to `user:${targetUserId}` (if user already has account)
  - `invitation:received` to `user:${targetUserId}`
  - `invitation:created` to `company:${orgId}`
- **Success Response** (`201 Created`):
```json
{
  "success": true,
  "message": "Invitation sent to \"employee@example.com\".",
  "invitation": {
    "_id": "6a9945a1ae252685e85be100",
    "organization": { "_id": "6a9179cdd8bfa9616d6031d0", "name": "ABC Technologies" },
    "email": "employee@example.com",
    "status": "pending",
    "expiresAt": "2026-09-10T10:00:00.000Z"
  }
}
```

#### API 4.2: Get Organization Sent Invitations (Admin)
- **Method**: `GET`
- **Complete URL**: `http://localhost:5000/api/invitations/org`
- **Route File**: `backend/routes/invitationRoutes.js`
- **Controller**: `getOrgInvitations` in `backend/controllers/invitationController.js`
- **Authentication**: YES (`protect`)
- **Authorization**: Company Admin / Owner (`adminOnly`, `requireActiveOrg`)
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**: None
- **Query Parameters**:
  - `status` (String, optional: `'pending'` | `'accepted'` | `'revoked'` | `'expired'`)
- **Body**: None
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "count": 1,
  "invitations": [
    {
      "_id": "6a9945a1ae252685e85be100",
      "email": "employee@example.com",
      "status": "pending",
      "invitedBy": { "_id": "6a914dbb2a8e5a90064be5fe", "name": "Org Admin", "email": "admin@flock.org" },
      "createdAt": "2026-09-03T10:00:00.000Z"
    }
  ]
}
```

#### API 4.3: Revoke Sent Invitation (Admin)
- **Method**: `DELETE`
- **Complete URL**: `http://localhost:5000/api/invitations/:id`
- **Route File**: `backend/routes/invitationRoutes.js`
- **Controller**: `revokeInvitation` in `backend/controllers/invitationController.js`
- **Authentication**: YES (`protect`)
- **Authorization**: Company Admin / Owner (`adminOnly`, `requireActiveOrg`)
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**:
  - `id` (String ObjectId, required: Invitation ID)
- **Query Parameters**: None
- **Body**: None
- **Socket.IO Event Emitted**:
  - `invitation:revoked` to `company:${orgId}`
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Invitation for \"employee@example.com\" has been revoked",
  "invitation": {
    "_id": "6a9945a1ae252685e85be100",
    "status": "revoked"
  }
}
```

#### API 4.4: Get My Pending Invitations (User)
- **Method**: `GET`
- **Complete URL**: `http://localhost:5000/api/invitations/my`
- **Route File**: `backend/routes/invitationRoutes.js`
- **Controller**: `getMyInvitations` in `backend/controllers/invitationController.js`
- **Authentication**: YES (`protect`)
- **Authorization**: Bearer JWT
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**: None
- **Query Parameters**: None
- **Body**: None
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "count": 1,
  "invitations": [
    {
      "_id": "6a9945a1ae252685e85be100",
      "organization": { "_id": "6a9179cdd8bfa9616d6031d0", "name": "ABC Technologies", "description": "Cloud solutions" },
      "invitedBy": { "name": "Org Admin", "email": "admin@flock.org" },
      "status": "pending",
      "createdAt": "2026-09-03T10:00:00.000Z"
    }
  ]
}
```

#### API 4.5: Accept Invitation (User)
- **Method**: `POST`
- **Complete URL**: `http://localhost:5000/api/invitations/:id/accept`
- **Route File**: `backend/routes/invitationRoutes.js`
- **Controller**: `acceptInvitation` in `backend/controllers/invitationController.js`
- **Authentication**: YES (`protect`)
- **Authorization**: Recipient Email matching invitation (`user.email === invitation.email`)
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**:
  - `id` (String ObjectId, required: Invitation ID)
- **Query Parameters**: None
- **Body**: None
- **Socket.IO Events Emitted**:
  - `notification:new` to `user:${invitation.invitedBy}`
  - `invitation:accepted` to `company:${orgId}`
  - `organization:member_joined` to `company:${orgId}`
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "You have joined \"ABC Technologies\" successfully!",
  "organization": { "_id": "6a9179cdd8bfa9616d6031d0", "name": "ABC Technologies" },
  "membership": {
    "role": "member",
    "status": "active"
  }
}
```

#### API 4.6: Decline Invitation (User)
- **Method**: `POST`
- **Complete URL**: `http://localhost:5000/api/invitations/:id/decline`
- **Route File**: `backend/routes/invitationRoutes.js`
- **Controller**: `declineInvitation` in `backend/controllers/invitationController.js`
- **Authentication**: YES (`protect`)
- **Authorization**: Recipient Email matching invitation
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**:
  - `id` (String ObjectId, required: Invitation ID)
- **Query Parameters**: None
- **Body**: None
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Invitation declined"
}
```

---

### CATEGORY 5: Channels (Group Messaging)

#### API 5.1: Create Channel
- **Method**: `POST`
- **Complete URL**: `http://localhost:5000/api/channels`
- **Route File**: `backend/routes/channelRoutes.js`
- **Controller**: `createChannel` in `backend/controllers/channelController.js`
- **Authentication**: YES (`protect`)
- **Authorization**: `requireActiveOrg`, `requireFeature('channels')`
- **Headers**:
  - `Authorization: Bearer <JWT_TOKEN>`
  - `Content-Type: application/json`
- **Path Parameters**: None
- **Query Parameters**: None
- **Request Body**:
  - `name` (String, required)
  - `description` (String, optional)
  - `isPrivate` (Boolean, optional, default: `false`)
- **Valid Request JSON**:
```json
{
  "name": "engineering",
  "description": "Core software development discussions",
  "isPrivate": false
}
```
- **Socket.IO Event Emitted**:
  - `channel:created` to `company:${orgId}` (public) or `user:${userId}` (private)
- **Success Response** (`201 Created`):
```json
{
  "success": true,
  "channel": {
    "_id": "6a9179cdd8bfa9616d6031e5",
    "name": "engineering",
    "description": "Core software development discussions",
    "isPrivate": false,
    "isArchived": false,
    "createdBy": { "_id": "6a914dbb2a8e5a90064be5fe", "name": "Jane Doe" },
    "members": [{ "_id": "6a914dbb2a8e5a90064be5fe", "name": "Jane Doe" }]
  }
}
```

#### API 5.2: Get Accessible Channels
- **Method**: `GET`
- **Complete URL**: `http://localhost:5000/api/channels`
- **Route File**: `backend/routes/channelRoutes.js`
- **Controller**: `getChannels` in `backend/controllers/channelController.js`
- **Authentication**: YES (`protect`)
- **Authorization**: `requireActiveOrg`, `requireFeature('channels')`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**: None
- **Query Parameters**: None
- **Body**: None
- **Purpose**: List all public channels and private channels where user is a member.
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "count": 1,
  "channels": [
    {
      "_id": "6a9179cdd8bfa9616d6031e5",
      "name": "engineering",
      "isPrivate": false,
      "lastMessageAt": "2026-09-03T10:00:00.000Z"
    }
  ]
}
```

#### API 5.3: Get Channel Details by ID
- **Method**: `GET`
- **Complete URL**: `http://localhost:5000/api/channels/:id`
- **Route File**: `backend/routes/channelRoutes.js`
- **Controller**: `getChannel` in `backend/controllers/channelController.js`
- **Authentication**: YES (`protect`)
- **Authorization**: Public channel member or private channel invitee
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**:
  - `id` (String ObjectId, required: Channel ID)
- **Query Parameters**: None
- **Body**: None
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "channel": {
    "_id": "6a9179cdd8bfa9616d6031e5",
    "name": "engineering",
    "description": "Core software development discussions",
    "isPrivate": false,
    "members": [{ "_id": "6a914dbb2a8e5a90064be5fe", "name": "Jane Doe" }]
  }
}
```

#### API 5.4: Update Channel Details (Creator / Admin)
- **Method**: `PUT` (or `PATCH`)
- **Complete URL**: `http://localhost:5000/api/channels/:id`
- **Route File**: `backend/routes/channelRoutes.js`
- **Controller**: `updateChannel` in `backend/controllers/channelController.js`
- **Authentication**: YES (`protect`)
- **Authorization**: Channel Creator or Company Admin
- **Headers**:
  - `Authorization: Bearer <JWT_TOKEN>`
  - `Content-Type: application/json`
- **Path Parameters**:
  - `id` (String ObjectId, required: Channel ID)
- **Request Body**:
  - `name` (String, optional)
  - `description` (String, optional)
- **Valid Request JSON**:
```json
{
  "name": "core-engineering",
  "description": "Updated channel topic and description"
}
```
- **Socket.IO Event Emitted**: `channel:updated` to `company:${orgId}`
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Channel updated successfully",
  "channel": {
    "_id": "6a9179cdd8bfa9616d6031e5",
    "name": "core-engineering",
    "description": "Updated channel topic and description"
  }
}
```

#### API 5.5: Join Channel
- **Method**: `POST`
- **Complete URL**: `http://localhost:5000/api/channels/:id/join`
- **Route File**: `backend/routes/channelRoutes.js`
- **Controller**: `joinChannel` in `backend/controllers/channelController.js`
- **Authentication**: YES (`protect`)
- **Authorization**: `requireActiveOrg`, `requireFeature('channels')`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**:
  - `id` (String ObjectId, required: Channel ID)
- **Query Parameters**: None
- **Body**: None
- **Socket.IO Event Emitted**: `channel:updated` to `company:${orgId}`
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "channel": {
    "_id": "6a9179cdd8bfa9616d6031e5",
    "name": "core-engineering"
  }
}
```

#### API 5.6: Leave Channel
- **Method**: `POST`
- **Complete URL**: `http://localhost:5000/api/channels/:id/leave`
- **Route File**: `backend/routes/channelRoutes.js`
- **Controller**: `leaveChannel` in `backend/controllers/channelController.js`
- **Authentication**: YES (`protect`)
- **Authorization**: Bearer JWT
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**:
  - `id` (String ObjectId, required: Channel ID)
- **Query Parameters**: None
- **Body**: None
- **Socket.IO Event Emitted**: `channel:updated` to `company:${orgId}` with `leftUserId`
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Left channel #core-engineering successfully",
  "channelId": "6a9179cdd8bfa9616d6031e5"
}
```

#### API 5.7: Add Members to Channel
- **Method**: `POST`
- **Complete URL**: `http://localhost:5000/api/channels/:id/members`
- **Route File**: `backend/routes/channelRoutes.js`
- **Controller**: `addChannelMembers` in `backend/controllers/channelController.js`
- **Authentication**: YES (`protect`)
- **Authorization**: Channel Member or Creator/Admin
- **Headers**:
  - `Authorization: Bearer <JWT_TOKEN>`
  - `Content-Type: application/json`
- **Path Parameters**:
  - `id` (String ObjectId, required: Channel ID)
- **Request Body**:
  - `userIds` (Array of String ObjectIds, required) or `userId` (String ObjectId)
- **Valid Request JSON**:
```json
{
  "userIds": ["6a8ea3262342db0d3dad30dc"]
}
```
- **Socket.IO Events Emitted**:
  - `channel:updated` to `channel:${id}` and `company:${orgId}`
  - `channel:created` to `user:${addedUserId}`
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Successfully added 1 member to #core-engineering",
  "channel": { "_id": "6a9179cdd8bfa9616d6031e5" },
  "addedMembers": ["6a8ea3262342db0d3dad30dc"]
}
```

#### API 5.8: Update Channel Member Settings (Mute)
- **Method**: `PATCH`
- **Complete URL**: `http://localhost:5000/api/channels/:id/settings`
- **Route File**: `backend/routes/channelRoutes.js`
- **Controller**: `updateChannelSetting` in `backend/controllers/channelController.js`
- **Authentication**: YES (`protect`)
- **Authorization**: Channel Member
- **Headers**:
  - `Authorization: Bearer <JWT_TOKEN>`
  - `Content-Type: application/json`
- **Path Parameters**:
  - `id` (String ObjectId, required: Channel ID)
- **Request Body**:
  - `muted` (Boolean, required)
- **Valid Request JSON**:
```json
{
  "muted": true
}
```
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "settings": {
    "userId": "6a914dbb2a8e5a90064be5fe",
    "muted": true
  }
}
```

#### API 5.9: Get Channel Messages
- **Method**: `GET`
- **Complete URL**: `http://localhost:5000/api/channels/:id/messages`
- **Route File**: `backend/routes/channelRoutes.js`
- **Controller**: `getChannelMessages` in `backend/controllers/channelController.js`
- **Authentication**: YES (`protect`)
- **Authorization**: Channel Member (`requireActiveOrg`, `requireFeature('channels')`)
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**:
  - `id` (String ObjectId, required: Channel ID)
- **Query Parameters**:
  - `limit` (Number, optional: 1-100)
  - `before` (ISO Date string, optional: for backwards pagination)
- **Body**: None
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "count": 1,
  "hasMore": false,
  "messages": [
    {
      "_id": "6a9952a1ae252685e85be150",
      "channelId": "6a9179cdd8bfa9616d6031e5",
      "sender": { "_id": "6a914dbb2a8e5a90064be5fe", "name": "Jane Doe" },
      "content": "Sprint planning starting at 10 AM.",
      "messageType": "text",
      "attachments": [],
      "createdAt": "2026-09-03T10:30:00.000Z"
    }
  ]
}
```

#### API 5.10: Send Channel Message (Text & Attachments)
- **Method**: `POST`
- **Complete URL**: `http://localhost:5000/api/channels/:id/messages`
- **Route File**: `backend/routes/channelRoutes.js`
- **Controller**: `sendChannelMessage` in `backend/controllers/channelController.js`
- **Authentication**: YES (`protect`)
- **Authorization**: Channel Member (`requireActiveOrg`, `requireFeature('channels')`)
- **Headers**:
  - `Authorization: Bearer <JWT_TOKEN>`
  - `Content-Type: application/json` (or `multipart/form-data` with files in field `files`)
- **Path Parameters**:
  - `id` (String ObjectId, required: Channel ID)
- **Request Body** (JSON or Multipart Form):
  - `content` (String, required if no files)
  - `replyTo` (String ObjectId, optional)
  - `messageType` (String, optional: `'text'` | `'image'` | `'video'` | `'file'`)
  - `files` (Multipart File array, up to 5 files, optional)
- **Valid Request JSON**:
```json
{
  "content": "Please review the updated API documentation.",
  "replyTo": null,
  "messageType": "text"
}
```
- **Socket.IO Events Emitted**:
  - `channel:message:new` to `channel:${id}`
  - Mentions/Activity notifications dispatched to offline/muted members
- **Success Response** (`201 Created`):
```json
{
  "success": true,
  "message": {
    "_id": "6a9952a1ae252685e85be150",
    "channelId": "6a9179cdd8bfa9616d6031e5",
    "sender": { "_id": "6a914dbb2a8e5a90064be5fe", "name": "Jane Doe" },
    "content": "Please review the updated API documentation.",
    "messageType": "text",
    "attachments": [],
    "createdAt": "2026-09-03T10:30:00.000Z"
  }
}
```

#### API 5.11: Get Organization Channel Settings Policy
- **Method**: `GET`
- **Complete URL**: `http://localhost:5000/api/channels/settings/organization`
- **Route File**: `backend/routes/channelRoutes.js`
- **Controller**: `getPublicOrganizationSettings` in `backend/controllers/channelController.js`
- **Authentication**: YES (`protect`)
- **Authorization**: Bearer JWT
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**: None
- **Query Parameters**: None
- **Body**: None
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "settings": {
    "allowPublicChannels": true,
    "allowPrivateChannels": true,
    "allowUserChannelCreation": true
  }
}
```

---

### CATEGORY 6: Direct Conversations (1-on-1 Chats)

#### API 6.1: Create or Get 1-on-1 Conversation
- **Method**: `POST`
- **Complete URL**: `http://localhost:5000/api/conversations`
- **Route File**: `backend/routes/conversationRoutes.js`
- **Controller**: `createOrGetConversation` in `backend/controllers/conversationController.js`
- **Authentication**: YES (`protect`, `requireActiveOrg`)
- **Authorization**: Bearer JWT
- **Headers**:
  - `Authorization: Bearer <JWT_TOKEN>`
  - `Content-Type: application/json`
- **Path Parameters**: None
- **Query Parameters**: None
- **Request Body**:
  - `receiverId` (String ObjectId, required)
- **Valid Request JSON**:
```json
{
  "receiverId": "6a8ea3262342db0d3dad30dc"
}
```
- **Success Response** (`200 OK` or `201 Created`):
```json
{
  "success": true,
  "conversation": {
    "_id": "6a9957a1ae252685e85be160",
    "organization": "6a9179cdd8bfa9616d6031d0",
    "participants": [
      { "_id": "6a914dbb2a8e5a90064be5fe", "name": "Jane Doe" },
      { "_id": "6a8ea3262342db0d3dad30dc", "name": "Lily" }
    ],
    "lastMessageAt": "2026-09-03T10:00:00.000Z"
  }
}
```

#### API 6.2: Get User Conversations List
- **Method**: `GET`
- **Complete URL**: `http://localhost:5000/api/conversations`
- **Route File**: `backend/routes/conversationRoutes.js`
- **Controller**: `getUserConversations` in `backend/controllers/conversationController.js`
- **Authentication**: YES (`protect`, `requireActiveOrg`)
- **Authorization**: Bearer JWT
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**: None
- **Query Parameters**: None
- **Body**: None
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "count": 1,
  "conversations": [
    {
      "_id": "6a9957a1ae252685e85be160",
      "participants": [
        { "_id": "6a914dbb2a8e5a90064be5fe", "name": "Jane Doe" },
        { "_id": "6a8ea3262342db0d3dad30dc", "name": "Lily" }
      ],
      "lastMessageAt": "2026-09-03T10:00:00.000Z"
    }
  ]
}
```

#### API 6.3: Mark Conversation as Read
- **Method**: `PATCH`
- **Complete URL**: `http://localhost:5000/api/conversations/:conversationId/read`
- **Route File**: `backend/routes/conversationRoutes.js`
- **Controller**: `markConversationRead` in `backend/controllers/conversationController.js`
- **Authentication**: YES (`protect`, `requireActiveOrg`)
- **Authorization**: Conversation Participant
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**:
  - `conversationId` (String ObjectId, required)
- **Query Parameters**: None
- **Body**: None
- **Socket.IO Events Emitted**:
  - `message:read` to `conversation:${conversationId}`
  - `notification:read` and `notification:unread_count` to `user:${userId}`
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "messageIds": ["6a9952a1ae252685e85be150"],
  "readAt": "2026-09-03T10:45:00.000Z"
}
```

#### API 6.4: Update Conversation Settings (Mute / Manual Unread)
- **Method**: `PATCH`
- **Complete URL**: `http://localhost:5000/api/conversations/:conversationId/settings`
- **Route File**: `backend/routes/conversationRoutes.js`
- **Controller**: `updateConversationSetting` in `backend/controllers/conversationController.js`
- **Authentication**: YES (`protect`, `requireActiveOrg`)
- **Authorization**: Conversation Participant
- **Headers**:
  - `Authorization: Bearer <JWT_TOKEN>`
  - `Content-Type: application/json`
- **Path Parameters**:
  - `conversationId` (String ObjectId, required)
- **Request Body**:
  - `muted` (Boolean, optional)
  - `manualUnread` (Boolean, optional)
- **Valid Request JSON**:
```json
{
  "muted": true,
  "manualUnread": false
}
```
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "settings": {
    "userId": "6a914dbb2a8e5a90064be5fe",
    "muted": true,
    "manualUnread": false
  }
}
```

#### API 6.5: Get Conversation Messages
- **Method**: `GET`
- **Complete URL**: `http://localhost:5000/api/conversations/:conversationId/messages`
- **Route File**: `backend/routes/conversationRoutes.js`
- **Controller**: `getConversationMessages` in `backend/controllers/conversationController.js`
- **Authentication**: YES (`protect`, `requireActiveOrg`)
- **Authorization**: Conversation Participant
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**:
  - `conversationId` (String ObjectId, required)
- **Query Parameters**:
  - `limit` (Number, optional: 1-100)
  - `before` (ISO Date string, optional)
- **Body**: None
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "count": 1,
  "hasMore": false,
  "messages": [
    {
      "_id": "6a9959a1ae252685e85be170",
      "conversationId": "6a9957a1ae252685e85be160",
      "sender": { "_id": "6a914dbb2a8e5a90064be5fe", "name": "Jane Doe" },
      "receiver": { "_id": "6a8ea3262342db0d3dad30dc", "name": "Lily" },
      "content": "Hi Lily, let's sync on the roadmap.",
      "messageType": "text",
      "attachments": [],
      "isRead": false,
      "createdAt": "2026-09-03T10:40:00.000Z"
    }
  ]
}
```

#### API 6.6: Send Direct Message
- **Method**: `POST`
- **Complete URL**: `http://localhost:5000/api/conversations/:conversationId/messages`
- **Route File**: `backend/routes/conversationRoutes.js`
- **Controller**: `sendMessage` in `backend/controllers/conversationController.js`
- **Authentication**: YES (`protect`, `requireActiveOrg`)
- **Authorization**: Conversation Participant
- **Headers**:
  - `Authorization: Bearer <JWT_TOKEN>`
  - `Content-Type: application/json` (or `multipart/form-data` with files in field `files`)
- **Path Parameters**:
  - `conversationId` (String ObjectId, required)
- **Request Body** (JSON or Multipart Form):
  - `content` (String, required if no files)
  - `replyTo` (String ObjectId, optional)
  - `messageType` (String, optional: `'text'` | `'image'` | `'video'` | `'file'`)
  - `files` (Multipart File array, up to 5 files, optional)
- **Valid Request JSON**:
```json
{
  "content": "Sounds great, let's talk at 2 PM.",
  "replyTo": null,
  "messageType": "text"
}
```
- **Socket.IO Events Emitted**:
  - `message:new` to `conversation:${conversationId}` and `user:${receiverId}`
  - `notification:new` to `user:${receiverId}`
- **Success Response** (`201 Created`):
```json
{
  "success": true,
  "message": {
    "_id": "6a9959a1ae252685e85be170",
    "conversationId": "6a9957a1ae252685e85be160",
    "sender": { "_id": "6a914dbb2a8e5a90064be5fe", "name": "Jane Doe" },
    "receiver": { "_id": "6a8ea3262342db0d3dad30dc", "name": "Lily" },
    "content": "Sounds great, let's talk at 2 PM.",
    "messageType": "text",
    "attachments": [],
    "createdAt": "2026-09-03T10:40:00.000Z"
  }
}
```

---

### CATEGORY 7: Messages Operations & Reactions

#### API 7.1: Mark Batch of Messages as Read
- **Method**: `PATCH`
- **Complete URL**: `http://localhost:5000/api/messages/read`
- **Route File**: `backend/routes/messageRoutes.js`
- **Controller**: `markMessagesAsRead` in `backend/controllers/messageController.js`
- **Authentication**: YES (`protect`, `requireActiveOrg`)
- **Authorization**: Bearer JWT
- **Headers**:
  - `Authorization: Bearer <JWT_TOKEN>`
  - `Content-Type: application/json`
- **Path Parameters**: None
- **Query Parameters**: None
- **Request Body**:
  - `messageIds` (Array of String ObjectIds, required)
- **Valid Request JSON**:
```json
{
  "messageIds": ["6a9959a1ae252685e85be170"]
}
```
- **Socket.IO Events Emitted**:
  - `message:read` to `conversation:${id}` or `channel:${id}`
  - `notification:read` and `notification:unread_count` to `user:${userId}`
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "messageIds": ["6a9959a1ae252685e85be170"],
  "readAt": "2026-09-03T10:45:00.000Z",
  "unreadNotificationsCount": 0
}
```

#### API 7.2: Get Single Message by ID
- **Method**: `GET`
- **Complete URL**: `http://localhost:5000/api/messages/:messageId`
- **Route File**: `backend/routes/messageRoutes.js`
- **Controller**: `getMessageById` in `backend/controllers/messageController.js`
- **Authentication**: YES (`protect`, `requireActiveOrg`)
- **Authorization**: Message conversation participant or channel member
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**:
  - `messageId` (String ObjectId, required)
- **Query Parameters**: None
- **Body**: None
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": {
    "_id": "6a9959a1ae252685e85be170",
    "content": "Sounds great, let's talk at 2 PM.",
    "sender": { "_id": "6a914dbb2a8e5a90064be5fe", "name": "Jane Doe" }
  }
}
```

#### API 7.3: Mark Single Message as Read
- **Method**: `PATCH`
- **Complete URL**: `http://localhost:5000/api/messages/:messageId/read`
- **Route File**: `backend/routes/messageRoutes.js`
- **Controller**: `markMessageAsRead` in `backend/controllers/messageController.js`
- **Authentication**: YES (`protect`, `requireActiveOrg`)
- **Authorization**: Message Receiver
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**:
  - `messageId` (String ObjectId, required)
- **Query Parameters**: None
- **Body**: None
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": {
    "_id": "6a9959a1ae252685e85be170",
    "isRead": true
  }
}
```

#### API 7.4: Edit Message
- **Method**: `PATCH`
- **Complete URL**: `http://localhost:5000/api/messages/:messageId`
- **Route File**: `backend/routes/messageRoutes.js`
- **Controller**: `editMessage` in `backend/controllers/messageController.js`
- **Authentication**: YES (`protect`, `requireActiveOrg`, `requireFeature('chat')`)
- **Authorization**: Original Sender Only
- **Headers**:
  - `Authorization: Bearer <JWT_TOKEN>`
  - `Content-Type: application/json`
- **Path Parameters**:
  - `messageId` (String ObjectId, required)
- **Request Body**:
  - `content` (String, required, non-empty)
- **Valid Request JSON**:
```json
{
  "content": "Updated message text after edit."
}
```
- **Socket.IO Event Emitted**: `message:edited` to conversation / channel room
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": {
    "_id": "6a9959a1ae252685e85be170",
    "content": "Updated message text after edit.",
    "edited": true,
    "editedAt": "2026-09-03T10:50:00.000Z"
  }
}
```

#### API 7.5: Delete Message (Soft Delete for Everyone)
- **Method**: `DELETE`
- **Complete URL**: `http://localhost:5000/api/messages/:messageId`
- **Route File**: `backend/routes/messageRoutes.js`
- **Controller**: `deleteMessage` in `backend/controllers/messageController.js`
- **Authentication**: YES (`protect`, `requireActiveOrg`, `requireFeature('chat')`)
- **Authorization**: Original Sender or Company Admin
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**:
  - `messageId` (String ObjectId, required)
- **Query Parameters**: None
- **Body**: None
- **Socket.IO Event Emitted**: `message:deleted` to conversation / channel room
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "messageId": "6a9959a1ae252685e85be170",
  "message": {
    "_id": "6a9959a1ae252685e85be170",
    "deleted": true,
    "content": "This message was deleted"
  }
}
```

#### API 7.6: Delete Message For Me Only
- **Method**: `POST`
- **Complete URL**: `http://localhost:5000/api/messages/:messageId/delete-for-me`
- **Route File**: `backend/routes/messageRoutes.js`
- **Controller**: `deleteMessageForMe` in `backend/controllers/messageController.js`
- **Authentication**: YES (`protect`, `requireActiveOrg`, `requireFeature('chat')`)
- **Authorization**: Bearer JWT
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**:
  - `messageId` (String ObjectId, required)
- **Query Parameters**: None
- **Body**: None
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "messageId": "6a9959a1ae252685e85be170",
  "deletedForMe": true
}
```

#### API 7.7: Forward Message
- **Method**: `POST`
- **Complete URL**: `http://localhost:5000/api/messages/:messageId/forward`
- **Route File**: `backend/routes/messageRoutes.js`
- **Controller**: `forwardMessage` in `backend/controllers/messageController.js`
- **Authentication**: YES (`protect`, `requireActiveOrg`, `requireFeature('chat')`)
- **Authorization**: Source and Destination room member
- **Headers**:
  - `Authorization: Bearer <JWT_TOKEN>`
  - `Content-Type: application/json`
- **Path Parameters**:
  - `messageId` (String ObjectId, required)
- **Request Body**:
  - `targetType` (String, required: `'conversation'` | `'channel'`)
  - `targetId` (String ObjectId, required: destination ID)
- **Valid Request JSON**:
```json
{
  "targetType": "channel",
  "targetId": "6a9179cdd8bfa9616d6031e5"
}
```
- **Socket.IO Event Emitted**: `channel:message:new` or `message:new` to target
- **Success Response** (`201 Created`):
```json
{
  "success": true,
  "message": {
    "_id": "6a9960a1ae252685e85be180",
    "channelId": "6a9179cdd8bfa9616d6031e5",
    "forwarded": true,
    "content": "Forwarded message content"
  }
}
```

#### API 7.8: Add Reaction to Message
- **Method**: `POST`
- **Complete URL**: `http://localhost:5000/api/messages/:messageId/reactions`
- **Route File**: `backend/routes/messageRoutes.js`
- **Controller**: `addReaction` in `backend/controllers/messageController.js`
- **Authentication**: YES (`protect`, `requireActiveOrg`, `requireFeature('chat')`)
- **Authorization**: Message accessible participant/member
- **Headers**:
  - `Authorization: Bearer <JWT_TOKEN>`
  - `Content-Type: application/json`
- **Path Parameters**:
  - `messageId` (String ObjectId, required)
- **Request Body**:
  - `emoji` (String, required: 1-10 characters emoji/unicode)
- **Valid Request JSON**:
```json
{
  "emoji": "👍"
}
```
- **Socket.IO Event Emitted**: `message:reaction:updated` to conversation / channel room
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "reactions": [
    {
      "emoji": "👍",
      "users": [{ "_id": "6a914dbb2a8e5a90064be5fe", "name": "Jane Doe" }]
    }
  ]
}
```

#### API 7.9: Remove Reaction from Message
- **Method**: `DELETE`
- **Complete URL**: `http://localhost:5000/api/messages/:messageId/reactions/:emoji`
- **Route File**: `backend/routes/messageRoutes.js`
- **Controller**: `removeReaction` in `backend/controllers/messageController.js`
- **Authentication**: YES (`protect`, `requireActiveOrg`, `requireFeature('chat')`)
- **Authorization**: User who reacted
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**:
  - `messageId` (String ObjectId, required)
  - `emoji` (String, URL-encoded emoji, required, e.g. `%F0%9F%91%8D`)
- **Query Parameters**: None
- **Body**: None
- **Socket.IO Event Emitted**: `message:reaction:updated` to conversation / channel room
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "reactions": []
}
```

---

### CATEGORY 8: Notifications

#### API 8.1: Get In-App Notifications List
- **Method**: `GET`
- **Complete URL**: `http://localhost:5000/api/notifications`
- **Route File**: `backend/routes/notificationRoutes.js`
- **Controller**: `getNotifications` in `backend/controllers/notificationController.js`
- **Authentication**: YES (`protect`)
- **Authorization**: Bearer JWT
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**: None
- **Query Parameters**:
  - `page` (Number, optional: default `1`)
  - `limit` (Number, optional: default `20`)
- **Body**: None
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "notifications": [
    {
      "_id": "6a9962a1ae252685e85be190",
      "recipient": "6a914dbb2a8e5a90064be5fe",
      "type": "message",
      "content": "Lily sent you a message",
      "isRead": false,
      "createdAt": "2026-09-03T10:40:00.000Z"
    }
  ],
  "unreadCount": 1,
  "page": 1,
  "totalPages": 1,
  "total": 1
}
```

#### API 8.2: Get Total Unread Notification Count
- **Method**: `GET`
- **Complete URL**: `http://localhost:5000/api/notifications/unread-count`
- **Route File**: `backend/routes/notificationRoutes.js`
- **Controller**: `getUnreadCount` in `backend/controllers/notificationController.js`
- **Authentication**: YES (`protect`)
- **Authorization**: Bearer JWT
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**: None
- **Query Parameters**: None
- **Body**: None
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "unreadCount": 1
}
```

#### API 8.3: Mark Single Notification as Read
- **Method**: `PATCH` (or `PUT`)
- **Complete URL**: `http://localhost:5000/api/notifications/:id/read`
- **Route File**: `backend/routes/notificationRoutes.js`
- **Controller**: `markNotificationRead` in `backend/controllers/notificationController.js`
- **Authentication**: YES (`protect`)
- **Authorization**: Notification Recipient
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**:
  - `id` (String ObjectId, required: Notification ID)
- **Query Parameters**: None
- **Body**: None
- **Socket.IO Events Emitted**:
  - `notification:read` to `user:${userId}`
  - `notification:unread_count` to `user:${userId}`
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "notification": {
    "_id": "6a9962a1ae252685e85be190",
    "isRead": true
  }
}
```

#### API 8.4: Mark All Notifications as Read
- **Method**: `PATCH` (or `PUT`)
- **Complete URL**: `http://localhost:5000/api/notifications/read-all`
- **Route File**: `backend/routes/notificationRoutes.js`
- **Controller**: `markAllNotificationsRead` in `backend/controllers/notificationController.js`
- **Authentication**: YES (`protect`)
- **Authorization**: Bearer JWT
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**: None
- **Query Parameters**: None
- **Body**: None
- **Socket.IO Events Emitted**:
  - `notifications:read_all` to `user:${userId}`
  - `notification:unread_count` (with `unreadCount: 0`) to `user:${userId}`
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

### CATEGORY 9: To-Dos / Tasks

#### API 9.1: Create To-Do
- **Method**: `POST`
- **Complete URL**: `http://localhost:5000/api/todos`
- **Route File**: `backend/routes/todoRoutes.js`
- **Controller**: `createTodo` in `backend/controllers/todoController.js`
- **Authentication**: YES (`protect`, `requireActiveOrg`, `requireFeature('todos')`)
- **Authorization**: Bearer JWT
- **Headers**:
  - `Authorization: Bearer <JWT_TOKEN>`
  - `Content-Type: application/json`
- **Path Parameters**: None
- **Query Parameters**: None
- **Request Body**:
  - `title` (String, required)
  - `assignedTo` (String ObjectId, required)
  - `description` (String, optional)
  - `priority` (String, optional: `'low'` | `'normal'` | `'high'`, default: `'normal'`)
  - `dueDate` (ISO Date string, optional)
  - `conversationId` (String ObjectId, optional)
  - `channelId` (String ObjectId, optional)
  - `sourceMessageId` (String ObjectId, optional)
- **Valid Request JSON**:
```json
{
  "title": "Finalize Q3 roadmap deliverable",
  "description": "Review sprint tasks and milestones",
  "assignedTo": "6a8ea3262342db0d3dad30dc",
  "priority": "high",
  "dueDate": "2026-09-15T18:00:00.000Z"
}
```
- **Socket.IO Events Emitted**:
  - `todo:created` to `user:${assigneeId}`, `user:${creatorId}`, and room
  - `notification:new` to `user:${assigneeId}`
- **Success Response** (`201 Created`):
```json
{
  "success": true,
  "todo": {
    "_id": "6a9965a1ae252685e85be200",
    "title": "Finalize Q3 roadmap deliverable",
    "priority": "high",
    "status": "pending",
    "dueDate": "2026-09-15T18:00:00.000Z",
    "createdBy": { "_id": "6a914dbb2a8e5a90064be5fe", "name": "Jane Doe" },
    "assignedTo": { "_id": "6a8ea3262342db0d3dad30dc", "name": "Lily" }
  }
}
```

#### API 9.2: Get To-Dos List
- **Method**: `GET`
- **Complete URL**: `http://localhost:5000/api/todos`
- **Route File**: `backend/routes/todoRoutes.js`
- **Controller**: `getTodos` in `backend/controllers/todoController.js`
- **Authentication**: YES (`protect`, `requireActiveOrg`, `requireFeature('todos')`)
- **Authorization**: Bearer JWT
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**: None
- **Query Parameters**:
  - `view` (String, optional: `'all'` | `'my'`, default: `'all'`)
  - `status` (String, optional: `'pending'` | `'completed'`)
  - `priority` (String, optional: `'low'` | `'normal'` | `'high'`)
  - `search` (String, optional)
  - `sort` (String, optional: `'default'` | `'dueDate'` | `'createdAt'` | `'priority'`)
  - `conversationId` (String ObjectId, optional)
  - `channelId` (String ObjectId, optional)
- **Body**: None
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "count": 1,
  "todos": [
    {
      "_id": "6a9965a1ae252685e85be200",
      "title": "Finalize Q3 roadmap deliverable",
      "priority": "high",
      "status": "pending",
      "dueDate": "2026-09-15T18:00:00.000Z",
      "createdBy": { "name": "Jane Doe" },
      "assignedTo": { "name": "Lily" }
    }
  ]
}
```

#### API 9.3: Get Single To-Do by ID
- **Method**: `GET`
- **Complete URL**: `http://localhost:5000/api/todos/:todoId`
- **Route File**: `backend/routes/todoRoutes.js`
- **Controller**: `getTodoById` in `backend/controllers/todoController.js`
- **Authentication**: YES (`protect`, `requireActiveOrg`, `requireFeature('todos')`)
- **Authorization**: Creator, Assignee, Context Member, or Admin
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**:
  - `todoId` (String ObjectId, required)
- **Query Parameters**: None
- **Body**: None
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "todo": {
    "_id": "6a9965a1ae252685e85be200",
    "title": "Finalize Q3 roadmap deliverable",
    "status": "pending"
  }
}
```

#### API 9.4: Update To-Do Details
- **Method**: `PUT` (or `PATCH`)
- **Complete URL**: `http://localhost:5000/api/todos/:todoId`
- **Route File**: `backend/routes/todoRoutes.js`
- **Controller**: `updateTodo` in `backend/controllers/todoController.js`
- **Authentication**: YES (`protect`, `requireActiveOrg`, `requireFeature('todos')`)
- **Authorization**: Creator, Assignee, or Admin
- **Headers**:
  - `Authorization: Bearer <JWT_TOKEN>`
  - `Content-Type: application/json`
- **Path Parameters**:
  - `todoId` (String ObjectId, required)
- **Request Body**:
  - `title` (String, optional)
  - `description` (String, optional)
  - `assignedTo` (String ObjectId, optional)
  - `priority` (String, optional: `'low'` | `'normal'` | `'high'`)
  - `dueDate` (ISO Date string, optional)
- **Valid Request JSON**:
```json
{
  "title": "Finalize Q3 roadmap and budget",
  "priority": "normal"
}
```
- **Socket.IO Event Emitted**: `todo:updated`
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "todo": {
    "_id": "6a9965a1ae252685e85be200",
    "title": "Finalize Q3 roadmap and budget",
    "priority": "normal"
  }
}
```

#### API 9.5: Toggle To-Do Status (Pending <-> Completed)
- **Method**: `PATCH`
- **Complete URL**: `http://localhost:5000/api/todos/:todoId/status` (or `.../toggle`)
- **Route File**: `backend/routes/todoRoutes.js`
- **Controller**: `toggleTodoStatus` in `backend/controllers/todoController.js`
- **Authentication**: YES (`protect`, `requireActiveOrg`, `requireFeature('todos')`)
- **Authorization**: Creator, Assignee, or Admin
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**:
  - `todoId` (String ObjectId, required)
- **Query Parameters**: None
- **Body**: None
- **Socket.IO Events Emitted**: `todo:completed` or `todo:updated`
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "todo": {
    "_id": "6a9965a1ae252685e85be200",
    "status": "completed",
    "completedAt": "2026-09-03T10:45:00.000Z"
  }
}
```

#### API 9.6: Delete To-Do (Soft Delete)
- **Method**: `DELETE`
- **Complete URL**: `http://localhost:5000/api/todos/:todoId`
- **Route File**: `backend/routes/todoRoutes.js`
- **Controller**: `deleteTodo` in `backend/controllers/todoController.js`
- **Authentication**: YES (`protect`, `requireActiveOrg`, `requireFeature('todos')`)
- **Authorization**: Creator or Company Admin
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**:
  - `todoId` (String ObjectId, required)
- **Query Parameters**: None
- **Body**: None
- **Socket.IO Event Emitted**: `todo:deleted`
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "To-Do deleted successfully",
  "todoId": "6a9965a1ae252685e85be200"
}
```

---

### CATEGORY 10: Search

#### API 10.1: Unified Global Search
- **Method**: `GET`
- **Complete URL**: `http://localhost:5000/api/search`
- **Route File**: `backend/routes/searchRoutes.js`
- **Controller**: `searchAll` in `backend/controllers/searchController.js`
- **Authentication**: YES (`protect`, `requireActiveOrg`)
- **Authorization**: Bearer JWT
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**: None
- **Query Parameters**:
  - `q` (String, required: search term)
  - `type` (String, optional: `'all'` | `'messages'` | `'files'` | `'channels'` | `'users'`, default: `'all'`)
  - `limit` (Number, optional: default `20`, max `50`)
  - `page` (Number, optional: default `1`)
- **Body**: None
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "query": "sprint",
  "results": {
    "messages": [],
    "files": [],
    "channels": [],
    "users": []
  },
  "totalCount": 0,
  "page": 1,
  "limit": 20
}
```

#### API 10.2: Advanced Message Search
- **Method**: `GET`
- **Complete URL**: `http://localhost:5000/api/search/messages`
- **Route File**: `backend/routes/searchRoutes.js`
- **Controller**: `searchMessages` in `backend/controllers/searchController.js`
- **Authentication**: YES (`protect`, `requireActiveOrg`)
- **Authorization**: Bearer JWT
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**: None
- **Query Parameters**:
  - `q` (String, optional: keyword)
  - `messageType` (String, optional: `'text'` | `'image'` | `'file'`)
  - `channelId` (String ObjectId, optional)
  - `conversationId` (String ObjectId, optional)
  - `senderId` (String ObjectId, optional)
  - `startDate` (ISO Date string, optional)
  - `endDate` (ISO Date string, optional)
  - `page` (Number, optional)
  - `limit` (Number, optional)
- **Body**: None
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "count": 0,
  "totalCount": 0,
  "page": 1,
  "totalPages": 0,
  "messages": []
}
```

---

### CATEGORY 11: Pinned Messages

#### API 11.1: Pin Message
- **Method**: `POST`
- **Complete URL**: `http://localhost:5000/api/pinned-messages/:messageId/pin`
- **Route File**: `backend/routes/pinnedMessageRoutes.js`
- **Controller**: `pinMessage` in `backend/controllers/pinnedMessageController.js`
- **Authentication**: YES (`protect`)
- **Authorization**: Conversation participant or Channel Creator/Admin
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**:
  - `messageId` (String ObjectId, required)
- **Query Parameters**: None
- **Body**: None
- **Socket.IO Event Emitted**: `message:pinned`
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "pinnedMessage": {
    "messageId": { "_id": "6a9952a1ae252685e85be150", "content": "Sprint planning starting at 10 AM." },
    "pinnedBy": { "name": "Jane Doe" },
    "pinnedAt": "2026-09-03T10:45:00.000Z"
  }
}
```

#### API 11.2: Unpin Message
- **Method**: `DELETE`
- **Complete URL**: `http://localhost:5000/api/pinned-messages/:messageId/pin`
- **Route File**: `backend/routes/pinnedMessageRoutes.js`
- **Controller**: `unpinMessage` in `backend/controllers/pinnedMessageController.js`
- **Authentication**: YES (`protect`)
- **Authorization**: Conversation participant or Channel Creator/Admin
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**:
  - `messageId` (String ObjectId, required)
- **Query Parameters**: None
- **Body**: None
- **Socket.IO Event Emitted**: `message:unpinned`
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Message unpinned"
}
```

#### API 11.3: Get Pinned Messages for Context
- **Method**: `GET`
- **Complete URL**: `http://localhost:5000/api/pinned-messages`
- **Route File**: `backend/routes/pinnedMessageRoutes.js`
- **Controller**: `getPinnedMessages` in `backend/controllers/pinnedMessageController.js`
- **Authentication**: YES (`protect`)
- **Authorization**: Scope access
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**: None
- **Query Parameters**:
  - `conversationId` (String ObjectId, required if not channelId)
  - `channelId` (String ObjectId, required if not conversationId)
  - `limit` (Number, optional: max 100)
- **Body**: None
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "pinnedMessages": []
}
```

---

### CATEGORY 12: Saved Messages (Bookmarks)

#### API 12.1: Save / Bookmark Message
- **Method**: `POST`
- **Complete URL**: `http://localhost:5000/api/saved-messages/:messageId/save`
- **Route File**: `backend/routes/savedMessageRoutes.js`
- **Controller**: `saveMessage` in `backend/controllers/savedMessageController.js`
- **Authentication**: YES (`protect`)
- **Authorization**: User accessible message
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**:
  - `messageId` (String ObjectId, required)
- **Query Parameters**: None
- **Body**: None
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "savedMessage": {
    "messageId": { "_id": "6a9952a1ae252685e85be150", "content": "Sprint planning starting at 10 AM." },
    "savedAt": "2026-09-03T10:45:00.000Z"
  }
}
```

#### API 12.2: Unsave / Remove Bookmark
- **Method**: `DELETE`
- **Complete URL**: `http://localhost:5000/api/saved-messages/:messageId/save`
- **Route File**: `backend/routes/savedMessageRoutes.js`
- **Controller**: `unsaveMessage` in `backend/controllers/savedMessageController.js`
- **Authentication**: YES (`protect`)
- **Authorization**: Bearer JWT
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**:
  - `messageId` (String ObjectId, required)
- **Query Parameters**: None
- **Body**: None
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Message removed from saved messages"
}
```

#### API 12.3: Get Saved Messages List
- **Method**: `GET`
- **Complete URL**: `http://localhost:5000/api/saved-messages`
- **Route File**: `backend/routes/savedMessageRoutes.js`
- **Controller**: `getSavedMessages` in `backend/controllers/savedMessageController.js`
- **Authentication**: YES (`protect`)
- **Authorization**: Bearer JWT
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**: None
- **Query Parameters**:
  - `q` (String, optional: search saved messages)
  - `type` (String, optional: `'conversation'` | `'channel'` | `'all'`)
  - `page` (Number, optional)
  - `limit` (Number, optional)
- **Body**: None
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "savedMessages": [],
  "page": 1,
  "limit": 20
}
```

---

### CATEGORY 13: Company Admin APIs

*All Admin APIs require `protect`, `requireActiveOrg`, and `adminOnly` (role: `'admin'` or `'owner'`).*

#### API 13.1: Get Workspace Statistics
- **Method**: `GET`
- **Complete URL**: `http://localhost:5000/api/admin/stats`
- **Route File**: `backend/routes/adminRoutes.js`
- **Controller**: `getWorkspaceStats` in `backend/controllers/adminController.js`
- **Authentication**: YES (`protect`, `requireActiveOrg`, `adminOnly`)
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**: None
- **Query Parameters**: None
- **Body**: None
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "stats": {
    "activeUsers": 5,
    "inactiveUsers": 0,
    "totalChannels": 3,
    "publicChannels": 2,
    "privateChannels": 1,
    "totalMessages": 14,
    "messagesToday": 5,
    "totalTodos": 4,
    "pendingTodos": 2,
    "completedTodos": 2
  }
}
```

#### API 13.2: Get Organization Users (Paginated & Filterable)
- **Method**: `GET`
- **Complete URL**: `http://localhost:5000/api/admin/users`
- **Route File**: `backend/routes/adminRoutes.js`
- **Controller**: `getUsers` in `backend/controllers/adminController.js`
- **Authentication**: YES (`protect`, `requireActiveOrg`, `adminOnly`)
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**: None
- **Query Parameters**:
  - `page` (Number, optional)
  - `limit` (Number, optional)
  - `search` (String, optional)
  - `role` (String, optional: `'admin'` | `'member'`)
  - `status` (String, optional: `'active'` | `'inactive'`)
- **Body**: None
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "count": 1,
  "totalCount": 1,
  "page": 1,
  "totalPages": 1,
  "users": [
    {
      "_id": "6a914dbb2a8e5a90064be5fe",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "admin",
      "status": "active",
      "permissions": ["MANAGE_MEMBERS", "MANAGE_CHANNELS", "MANAGE_SETTINGS"]
    }
  ]
}
```

#### API 13.3: Change User Membership Role
- **Method**: `PATCH`
- **Complete URL**: `http://localhost:5000/api/admin/users/:id/role`
- **Route File**: `backend/routes/adminRoutes.js`
- **Controller**: `updateUserRole` in `backend/controllers/adminController.js`
- **Authentication**: YES (`protect`, `requireActiveOrg`, `adminOnly`)
- **Headers**:
  - `Authorization: Bearer <JWT_TOKEN>`
  - `Content-Type: application/json`
- **Path Parameters**:
  - `id` (String ObjectId, required: User ID)
- **Request Body**:
  - `role` (String, required: `'owner'` | `'admin'` | `'member'`)
- **Valid Request JSON**:
```json
{
  "role": "admin"
}
```
- **Socket.IO Event Emitted**: `membership:updated` to `company:${orgId}`
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "User role updated to admin",
  "user": {
    "_id": "6a8ea3262342db0d3dad30dc",
    "role": "admin",
    "permissions": ["MANAGE_MEMBERS", "MANAGE_JOIN_REQUESTS", "MANAGE_CHANNELS", "VIEW_ANALYTICS"]
  }
}
```

#### API 13.4: Change User Status (Activate / Deactivate)
- **Method**: `PATCH`
- **Complete URL**: `http://localhost:5000/api/admin/users/:id/status`
- **Route File**: `backend/routes/adminRoutes.js`
- **Controller**: `updateUserStatus` in `backend/controllers/adminController.js`
- **Authentication**: YES (`protect`, `requireActiveOrg`, `adminOnly`)
- **Headers**:
  - `Authorization: Bearer <JWT_TOKEN>`
  - `Content-Type: application/json`
- **Path Parameters**:
  - `id` (String ObjectId, required: User ID)
- **Request Body**:
  - `status` (String, required: `'active'` | `'inactive'`)
- **Valid Request JSON**:
```json
{
  "status": "inactive"
}
```
- **Socket.IO Event Emitted**: `organization:members_updated` to `company:${orgId}`
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "User status changed to inactive",
  "user": {
    "_id": "6a8ea3262342db0d3dad30dc",
    "status": "inactive"
  }
}
```

#### API 13.5: Update Custom Admin Permissions
- **Method**: `PATCH`
- **Complete URL**: `http://localhost:5000/api/admin/users/:id/permissions`
- **Route File**: `backend/routes/adminRoutes.js`
- **Controller**: `updateUserPermissions` in `backend/controllers/adminController.js`
- **Authentication**: YES (`protect`, `requireActiveOrg`, `adminOnly`)
- **Headers**:
  - `Authorization: Bearer <JWT_TOKEN>`
  - `Content-Type: application/json`
- **Path Parameters**:
  - `id` (String ObjectId, required: User ID)
- **Request Body**:
  - `permissions` (Array of Strings, required: subset of `MANAGE_MEMBERS`, `MANAGE_JOIN_REQUESTS`, `MANAGE_CHANNELS`, `MANAGE_TODOS`, `MANAGE_MESSAGES`, `VIEW_ANALYTICS`, `MANAGE_SETTINGS`, `MANAGE_ROLES`)
- **Valid Request JSON**:
```json
{
  "permissions": [
    "MANAGE_MEMBERS",
    "MANAGE_CHANNELS",
    "VIEW_ANALYTICS"
  ]
}
```
- **Socket.IO Event Emitted**: `membership:updated` to `company:${orgId}`
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "User permissions updated successfully",
  "permissions": ["MANAGE_MEMBERS", "MANAGE_CHANNELS", "VIEW_ANALYTICS"]
}
```

#### API 13.6: Invite User to Organization (Admin Alias)
- **Method**: `POST`
- **Complete URL**: `http://localhost:5000/api/admin/invite-user`
- **Route File**: `backend/routes/adminRoutes.js`
- **Controller**: `inviteUserToOrganization` in `backend/controllers/adminController.js`
- **Authentication**: YES (`protect`, `requireActiveOrg`, `adminOnly`)
- **Headers**:
  - `Authorization: Bearer <JWT_TOKEN>`
  - `Content-Type: application/json`
- **Request Body**:
  - `email` (String, required)
- **Valid Request JSON**:
```json
{
  "email": "teammate@company.com"
}
```
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Invitation created for teammate@company.com.",
  "invitation": {
    "_id": "6a9967a1ae252685e85be210",
    "email": "teammate@company.com",
    "status": "pending"
  }
}
```

#### API 13.7: Get Legacy Join Requests
- **Method**: `GET`
- **Complete URL**: `http://localhost:5000/api/admin/join-requests`
- **Route File**: `backend/routes/adminRoutes.js`
- **Controller**: `getJoinRequests` in `backend/controllers/adminController.js`
- **Authentication**: YES (`protect`, `requireActiveOrg`, `adminOnly`)
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**: None
- **Query Parameters**:
  - `status` (String, optional: default `'pending'`)
- **Body**: None
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "count": 0,
  "requests": []
}
```

#### API 13.8: Approve Join Request
- **Method**: `POST`
- **Complete URL**: `http://localhost:5000/api/admin/join-requests/:id/approve`
- **Route File**: `backend/routes/adminRoutes.js`
- **Controller**: `approveJoinRequest` in `backend/controllers/adminController.js`
- **Authentication**: YES (`protect`, `requireActiveOrg`, `adminOnly`)
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**:
  - `id` (String ObjectId, required: Request ID)
- **Body**: None
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Approved join request",
  "membership": { "status": "active", "role": "member" }
}
```

#### API 13.9: Reject Join Request
- **Method**: `POST`
- **Complete URL**: `http://localhost:5000/api/admin/join-requests/:id/reject`
- **Route File**: `backend/routes/adminRoutes.js`
- **Controller**: `rejectJoinRequest` in `backend/controllers/adminController.js`
- **Authentication**: YES (`protect`, `requireActiveOrg`, `adminOnly`)
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**:
  - `id` (String ObjectId, required: Request ID)
- **Body**: None
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Rejected join request"
}
```

#### API 13.10: Admin Get Channels
- **Method**: `GET`
- **Complete URL**: `http://localhost:5000/api/admin/channels`
- **Route File**: `backend/routes/adminRoutes.js`
- **Controller**: `getChannels` in `backend/controllers/adminController.js`
- **Authentication**: YES (`protect`, `requireActiveOrg`, `adminOnly`)
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**: None
- **Query Parameters**:
  - `page` (Number, optional)
  - `limit` (Number, optional)
  - `search` (String, optional)
- **Body**: None
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "count": 1,
  "totalCount": 1,
  "channels": [
    {
      "_id": "6a9179cdd8bfa9616d6031e5",
      "name": "General",
      "description": "General discussions",
      "isPrivate": false,
      "memberCount": 5
    }
  ]
}
```

#### API 13.11: Admin Create Channel
- **Method**: `POST`
- **Complete URL**: `http://localhost:5000/api/admin/channels`
- **Route File**: `backend/routes/adminRoutes.js`
- **Controller**: `adminCreateChannel` in `backend/controllers/adminController.js`
- **Authentication**: YES (`protect`, `requireActiveOrg`, `adminOnly`)
- **Headers**:
  - `Authorization: Bearer <JWT_TOKEN>`
  - `Content-Type: application/json`
- **Request Body**:
  - `name` (String, required)
  - `description` (String, optional)
  - `isPrivate` (Boolean, optional)
- **Valid Request JSON**:
```json
{
  "name": "announcements",
  "description": "Official company announcements",
  "isPrivate": false
}
```
- **Success Response** (`201 Created`):
```json
{
  "success": true,
  "message": "Channel #announcements created successfully",
  "channel": {
    "_id": "6a9969a1ae252685e85be220",
    "name": "announcements",
    "isPrivate": false
  }
}
```

#### API 13.12: Admin Update Channel
- **Method**: `PATCH`
- **Complete URL**: `http://localhost:5000/api/admin/channels/:id`
- **Route File**: `backend/routes/adminRoutes.js`
- **Controller**: `updateChannel` in `backend/controllers/adminController.js`
- **Authentication**: YES (`protect`, `requireActiveOrg`, `adminOnly`)
- **Headers**:
  - `Authorization: Bearer <JWT_TOKEN>`
  - `Content-Type: application/json`
- **Path Parameters**:
  - `id` (String ObjectId, required: Channel ID)
- **Request Body**:
  - `name` (String, optional)
  - `description` (String, optional)
  - `isPrivate` (Boolean, optional)
  - `isArchived` (Boolean, optional)
- **Valid Request JSON**:
```json
{
  "description": "Updated official announcements channel",
  "isArchived": false
}
```
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Channel updated successfully",
  "channel": { "_id": "6a9969a1ae252685e85be220" }
}
```

#### API 13.13: Admin Delete Channel
- **Method**: `DELETE`
- **Complete URL**: `http://localhost:5000/api/admin/channels/:id`
- **Route File**: `backend/routes/adminRoutes.js`
- **Controller**: `deleteChannel` in `backend/controllers/adminController.js`
- **Authentication**: YES (`protect`, `requireActiveOrg`, `adminOnly`)
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**:
  - `id` (String ObjectId, required: Channel ID)
- **Body**: None
- **Socket.IO Event Emitted**: `channel:deleted`
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Channel #announcements deleted successfully"
}
```

#### API 13.14: Admin Get Channel Members
- **Method**: `GET`
- **Complete URL**: `http://localhost:5000/api/admin/channels/:id/members`
- **Route File**: `backend/routes/adminRoutes.js`
- **Controller**: `getChannelMembers` in `backend/controllers/adminController.js`
- **Authentication**: YES (`protect`, `requireActiveOrg`, `adminOnly`)
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**:
  - `id` (String ObjectId, required: Channel ID)
- **Body**: None
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "count": 1,
  "members": [{ "_id": "6a914dbb2a8e5a90064be5fe", "name": "Jane Doe", "email": "jane@example.com" }]
}
```

#### API 13.15: Admin Add Channel Member
- **Method**: `POST`
- **Complete URL**: `http://localhost:5000/api/admin/channels/:id/members/:userId`
- **Route File**: `backend/routes/adminRoutes.js`
- **Controller**: `addChannelMember` in `backend/controllers/adminController.js`
- **Authentication**: YES (`protect`, `requireActiveOrg`, `adminOnly`)
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**:
  - `id` (String ObjectId, required: Channel ID)
  - `userId` (String ObjectId, required: User ID to add)
- **Body**: None
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "User added to #announcements",
  "membersCount": 2
}
```

#### API 13.16: Admin Remove Channel Member
- **Method**: `DELETE`
- **Complete URL**: `http://localhost:5000/api/admin/channels/:id/members/:userId`
- **Route File**: `backend/routes/adminRoutes.js`
- **Controller**: `removeChannelMember` in `backend/controllers/adminController.js`
- **Authentication**: YES (`protect`, `requireActiveOrg`, `adminOnly`)
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**:
  - `id` (String ObjectId, required: Channel ID)
  - `userId` (String ObjectId, required: User ID to remove)
- **Body**: None
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "User removed from #announcements",
  "membersCount": 1
}
```

#### API 13.17: Admin Message Search & Moderation
- **Method**: `GET`
- **Complete URL**: `http://localhost:5000/api/admin/messages`
- **Route File**: `backend/routes/adminRoutes.js`
- **Controller**: `getMessages` in `backend/controllers/adminController.js`
- **Authentication**: YES (`protect`, `requireActiveOrg`, `adminOnly`)
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**: None
- **Query Parameters**:
  - `q` (String, optional)
  - `messageType` (String, optional: `'text'` | `'image'` | `'video'` | `'file'`)
  - `channelId` (String ObjectId, optional)
  - `senderId` (String ObjectId, optional)
  - `hasAttachments` (Boolean, optional: `'true'`)
  - `startDate` (ISO Date string, optional)
  - `endDate` (ISO Date string, optional)
  - `page` (Number, optional)
  - `limit` (Number, optional)
- **Body**: None
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "count": 0,
  "totalCount": 0,
  "page": 1,
  "totalPages": 1,
  "messages": []
}
```

#### API 13.18: Admin Delete Message (Moderation Purge)
- **Method**: `DELETE`
- **Complete URL**: `http://localhost:5000/api/admin/messages/:id`
- **Route File**: `backend/routes/adminRoutes.js`
- **Controller**: `deleteMessage` in `backend/controllers/adminController.js`
- **Authentication**: YES (`protect`, `requireActiveOrg`, `adminOnly`)
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**:
  - `id` (String ObjectId, required: Message ID)
- **Body**: None
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Message deleted successfully by administrator"
}
```

#### API 13.19: Admin Get Audit Logs
- **Method**: `GET`
- **Complete URL**: `http://localhost:5000/api/admin/audit-logs`
- **Route File**: `backend/routes/adminRoutes.js`
- **Controller**: `getAuditLogs` in `backend/controllers/adminController.js`
- **Authentication**: YES (`protect`, `requireActiveOrg`, `adminOnly`)
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**: None
- **Query Parameters**:
  - `page` (Number, optional)
  - `limit` (Number, optional)
  - `targetType` (String, optional: `'User'` | `'Channel'` | `'Message'` | `'System'` | `'Organization'` | `'JoinRequest'`)
- **Body**: None
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "count": 1,
  "totalCount": 1,
  "page": 1,
  "totalPages": 1,
  "logs": [
    {
      "_id": "6a996da1ae252685e85be230",
      "action": "USER_ROLE_UPDATED",
      "targetType": "User",
      "targetName": "Lily",
      "details": "Changed role to admin",
      "admin": { "name": "Jane Doe", "email": "jane@example.com" },
      "createdAt": "2026-09-03T10:00:00.000Z"
    }
  ]
}
```

#### API 13.20: Get Organization Settings
- **Method**: `GET`
- **Complete URL**: `http://localhost:5000/api/admin/settings`
- **Route File**: `backend/routes/adminRoutes.js`
- **Controller**: `getOrganizationSettings` in `backend/controllers/adminController.js`
- **Authentication**: YES (`protect`, `requireActiveOrg`, `adminOnly`)
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Path Parameters**: None
- **Query Parameters**: None
- **Body**: None
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "settings": {
    "requireJoinApproval": true,
    "allowPublicChannels": true,
    "allowPrivateChannels": true,
    "allowUserChannelCreation": true,
    "allowMemberInvites": true,
    "allowMemberChannelDeletion": false,
    "companyName": "ABC Technologies",
    "companyDescription": "Enterprise software"
  }
}
```

#### API 13.21: Update Organization Settings
- **Method**: `PATCH`
- **Complete URL**: `http://localhost:5000/api/admin/settings`
- **Route File**: `backend/routes/adminRoutes.js`
- **Controller**: `updateOrganizationSettings` in `backend/controllers/adminController.js`
- **Authentication**: YES (`protect`, `requireActiveOrg`, `adminOnly`)
- **Headers**:
  - `Authorization: Bearer <JWT_TOKEN>`
  - `Content-Type: application/json`
- **Path Parameters**: None
- **Request Body**:
  - `companyName` (String, optional)
  - `companyDescription` (String, optional)
  - `requireJoinApproval` (Boolean, optional)
  - `allowPublicChannels` (Boolean, optional)
  - `allowPrivateChannels` (Boolean, optional)
  - `allowUserChannelCreation` (Boolean, optional)
  - `allowMemberInvites` (Boolean, optional)
  - `allowMemberChannelDeletion` (Boolean, optional)
- **Valid Request JSON**:
```json
{
  "companyName": "ABC Technologies Inc.",
  "allowPublicChannels": true,
  "allowPrivateChannels": true,
  "allowUserChannelCreation": true,
  "allowMemberInvites": true
}
```
- **Socket.IO Event Emitted**: `organization:settings_updated` to `company:${orgId}`
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Organization settings updated successfully",
  "settings": {
    "requireJoinApproval": true,
    "allowPublicChannels": true,
    "allowPrivateChannels": true,
    "allowUserChannelCreation": true,
    "allowMemberInvites": true,
    "allowMemberChannelDeletion": false,
    "companyName": "ABC Technologies Inc."
  }
}
```

---

### CATEGORY 14: Platform Super Admin APIs

*All Super Admin APIs strictly require `protect` and `superAdminOnly` (`role: 'super_admin'`).*

#### API 14.1: Get Platform Statistics
- **Method**: `GET`
- **Complete URL**: `http://localhost:5000/api/super-admin/stats`
- **Route File**: `backend/routes/superAdminRoutes.js`
- **Controller**: `getPlatformStats` in `backend/controllers/superAdminController.js`
- **Authentication**: YES (`protect`, `superAdminOnly`)
- **Headers**: `Authorization: Bearer <SUPER_ADMIN_JWT_TOKEN>`
- **Path Parameters**: None
- **Query Parameters**: None
- **Body**: None
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "stats": {
    "totalOrgs": 16,
    "activeOrgs": 13,
    "suspendedOrgs": 2,
    "expiredOrgs": 0,
    "pendingOrgs": 1,
    "totalUsers": 38,
    "superAdmins": 1,
    "plans": {
      "free": 16,
      "professional": 0,
      "enterprise": 0
    }
  }
}
```

#### API 14.2: List All Platform Organizations
- **Method**: `GET`
- **Complete URL**: `http://localhost:5000/api/super-admin/organizations`
- **Route File**: `backend/routes/superAdminRoutes.js`
- **Controller**: `getAllOrganizations` in `backend/controllers/superAdminController.js`
- **Authentication**: YES (`protect`, `superAdminOnly`)
- **Headers**: `Authorization: Bearer <SUPER_ADMIN_JWT_TOKEN>`
- **Path Parameters**: None
- **Query Parameters**:
  - `page` (Number, optional)
  - `limit` (Number, optional)
  - `search` (String, optional)
  - `status` (String, optional: `'pending'` | `'active'` | `'rejected'` | `'suspended'` | `'expired'`)
  - `plan` (String, optional: `'free'` | `'professional'` | `'enterprise'`)
- **Body**: None
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "organizations": [
    {
      "_id": "6a9179cdd8bfa9616d6031d0",
      "name": "ABC Technologies",
      "status": "active",
      "subscription": {
        "plan": "free",
        "status": "active",
        "startedAt": "2026-08-28T12:06:37.645Z",
        "expiresAt": "2026-09-28T12:06:37.645Z"
      },
      "memberCount": 17,
      "primaryAdmin": { "name": "Lily", "email": "lilyclara@gmail.com" }
    }
  ],
  "pagination": {
    "total": 16,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

#### API 14.3: Get Single Organization Full Details
- **Method**: `GET`
- **Complete URL**: `http://localhost:5000/api/super-admin/organizations/:id`
- **Route File**: `backend/routes/superAdminRoutes.js`
- **Controller**: `getOrganizationDetail` in `backend/controllers/superAdminController.js`
- **Authentication**: YES (`protect`, `superAdminOnly`)
- **Headers**: `Authorization: Bearer <SUPER_ADMIN_JWT_TOKEN>`
- **Path Parameters**:
  - `id` (String ObjectId, required: Organization ID)
- **Body**: None
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "organization": {
    "_id": "6a9179cdd8bfa9616d6031d0",
    "name": "ABC Technologies",
    "status": "active",
    "subscription": { "plan": "free", "status": "active" },
    "features": { "chat": true, "channels": true, "todos": true },
    "memberCount": 17,
    "admins": [{ "name": "Lily", "email": "lilyclara@gmail.com" }],
    "members": [{ "name": "Lily", "email": "lilyclara@gmail.com" }]
  }
}
```

#### API 14.4: Super Admin Approve & Activate Organization
- **Method**: `PATCH`
- **Complete URL**: `http://localhost:5000/api/super-admin/organizations/:id/activate`
- **Route File**: `backend/routes/superAdminRoutes.js`
- **Controller**: `activateOrganization` in `backend/controllers/superAdminController.js`
- **Authentication**: YES (`protect`, `superAdminOnly`)
- **Headers**:
  - `Authorization: Bearer <SUPER_ADMIN_JWT_TOKEN>`
  - `Content-Type: application/json`
- **Path Parameters**:
  - `id` (String ObjectId, required: Organization ID)
- **Request Body**:
  - `plan` (String, required: `'free'` | `'professional'` | `'enterprise'`)
  - `startDate` (ISO Date string, optional: defaults to current date)
  - `endDate` (ISO Date string, required: must be strictly greater than `startDate`)
- **Valid Request JSON**:
```json
{
  "plan": "professional",
  "startDate": "2026-09-03T00:00:00.000Z",
  "endDate": "2027-09-03T00:00:00.000Z"
}
```
- **Socket.IO Events Emitted**:
  - `notification:new` to `user:${creatorId}`
  - `org:statusChanged` (with `status: 'active'`) to `company:${orgId}` and `user:${creatorId}`
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Organization \"Apex Innovations\" has been approved and activated on the PROFESSIONAL plan.",
  "organization": {
    "_id": "6a9939b1ae252685e85be0ee",
    "name": "Apex Innovations",
    "status": "active",
    "subscription": {
      "plan": "professional",
      "status": "active",
      "startedAt": "2026-09-03T00:00:00.000Z",
      "expiresAt": "2027-09-03T00:00:00.000Z"
    }
  }
}
```

#### API 14.5: Super Admin Reject Organization Request
- **Method**: `PATCH`
- **Complete URL**: `http://localhost:5000/api/super-admin/organizations/:id/reject`
- **Route File**: `backend/routes/superAdminRoutes.js`
- **Controller**: `rejectOrganization` in `backend/controllers/superAdminController.js`
- **Authentication**: YES (`protect`, `superAdminOnly`)
- **Headers**:
  - `Authorization: Bearer <SUPER_ADMIN_JWT_TOKEN>`
  - `Content-Type: application/json`
- **Path Parameters**:
  - `id` (String ObjectId, required: Organization ID)
- **Request Body**:
  - `reason` or `rejectionReason` (String, optional)
- **Valid Request JSON**:
```json
{
  "reason": "Incomplete business entity verification"
}
```
- **Socket.IO Events Emitted**:
  - `notification:new` to `user:${creatorId}`
  - `org:statusChanged` (with `status: 'rejected'`) to `company:${orgId}` and `user:${creatorId}`
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Organization \"Apex Innovations\" has been rejected.",
  "organization": {
    "_id": "6a9939b1ae252685e85be0ee",
    "status": "rejected",
    "rejectionReason": "Incomplete business entity verification"
  }
}
```

#### API 14.6: Super Admin Suspend Organization
- **Method**: `PATCH`
- **Complete URL**: `http://localhost:5000/api/super-admin/organizations/:id/suspend`
- **Route File**: `backend/routes/superAdminRoutes.js`
- **Controller**: `suspendOrganization` in `backend/controllers/superAdminController.js`
- **Authentication**: YES (`protect`, `superAdminOnly`)
- **Headers**: `Authorization: Bearer <SUPER_ADMIN_JWT_TOKEN>`
- **Path Parameters**:
  - `id` (String ObjectId, required: Organization ID)
- **Body**: None
- **Socket.IO Event Emitted**: `org:statusChanged` (with `status: 'suspended'`) to `company:${orgId}`
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Organization \"Apex Innovations\" has been suspended.",
  "organization": {
    "_id": "6a9939b1ae252685e85be0ee",
    "status": "suspended"
  }
}
```

#### API 14.7: Super Admin Update Organization Subscription
- **Method**: `PATCH`
- **Complete URL**: `http://localhost:5000/api/super-admin/organizations/:id/subscription`
- **Route File**: `backend/routes/superAdminRoutes.js`
- **Controller**: `updateSubscription` in `backend/controllers/superAdminController.js`
- **Authentication**: YES (`protect`, `superAdminOnly`)
- **Headers**:
  - `Authorization: Bearer <SUPER_ADMIN_JWT_TOKEN>`
  - `Content-Type: application/json`
- **Path Parameters**:
  - `id` (String ObjectId, required: Organization ID)
- **Request Body**:
  - `plan` (String, optional: `'free'` | `'professional'` | `'enterprise'`)
  - `status` (String, optional: `'pending'` | `'active'` | `'rejected'` | `'suspended'` | `'expired'`)
  - `startedAt` (ISO Date string, optional)
  - `expiresAt` (ISO Date string, optional)
- **Valid Request JSON**:
```json
{
  "plan": "enterprise",
  "status": "active",
  "expiresAt": "2028-09-03T00:00:00.000Z"
}
```
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Subscription updated for \"Apex Innovations\".",
  "organization": {
    "_id": "6a9939b1ae252685e85be0ee",
    "subscription": {
      "plan": "enterprise",
      "status": "active",
      "expiresAt": "2028-09-03T00:00:00.000Z"
    }
  }
}
```

#### API 14.8: Super Admin Update Feature Entitlements
- **Method**: `PATCH`
- **Complete URL**: `http://localhost:5000/api/super-admin/organizations/:id/features`
- **Route File**: `backend/routes/superAdminRoutes.js`
- **Controller**: `updateFeatures` in `backend/controllers/superAdminController.js`
- **Authentication**: YES (`protect`, `superAdminOnly`)
- **Headers**:
  - `Authorization: Bearer <SUPER_ADMIN_JWT_TOKEN>`
  - `Content-Type: application/json`
- **Path Parameters**:
  - `id` (String ObjectId, required: Organization ID)
- **Request Body**:
  - `chat` (Boolean, optional)
  - `channels` (Boolean, optional)
  - `todos` (Boolean, optional)
- **Valid Request JSON**:
```json
{
  "chat": true,
  "channels": true,
  "todos": true
}
```
- **Socket.IO Event Emitted**: `org:featuresChanged` to `company:${orgId}`
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Features updated for \"Apex Innovations\".",
  "organization": {
    "_id": "6a9939b1ae252685e85be0ee",
    "features": {
      "chat": true,
      "channels": true,
      "todos": true
    }
  }
}
```

---

## 5. Complete Postman Testing Checklist

### PUBLIC APIs (No Authentication Required)

| # | Method | COMPLETE POSTMAN URL | Auth | Role | Body | Purpose |
|---|---|---|---|---|---|---|
| 1 | `GET` | `http://localhost:5000/` | NO | Public | None | Server Health Check |
| 2 | `GET` | `http://localhost:5000/api/health` | NO | Public | None | API Heartbeat |
| 3 | `POST` | `http://localhost:5000/api/auth/register` | NO | Public | `{"name":"Jane","email":"jane@a.com","password":"Password123!"}` | User Registration |
| 4 | `POST` | `http://localhost:5000/api/auth/login` | NO | Public | `{"email":"jane@a.com","password":"Password123!"}` | User Login (Returns JWT) |
| 5 | `POST` | `http://localhost:5000/api/organizations/register-company` | NO | Public | `{"name":"Bob","email":"b@a.com","password":"Password123!","companyName":"Nexus"}` | One-Pass User & Company Registration |

---

### AUTHENTICATED APIs (Require Bearer Token)

| # | Method | COMPLETE POSTMAN URL | Auth | Role | Body | Purpose |
|---|---|---|---|---|---|---|
| 6 | `GET` | `http://localhost:5000/api/auth/me` | Bearer | User | None | Session Profile & Org Context |
| 7 | `GET` | `http://localhost:5000/api/users` | Bearer | User | None | Team Directory (Scoped to Org) |
| 8 | `GET` | `http://localhost:5000/api/users/profile` | Bearer | User | None | User Personal Profile |
| 9 | `PUT` | `http://localhost:5000/api/users/profile` | Bearer | User | `{"bio":"Lead Engineer","title":"Tech Lead"}` | Update User Profile |
| 10 | `PUT` | `http://localhost:5000/api/users/settings` | Bearer | User | `{"appearance":{"theme":"dark"},"privacy":{"readReceipts":true}}` | Update Preferences & Privacy |
| 11 | `POST` | `http://localhost:5000/api/organizations` | Bearer | User | `{"name":"Apex Corp","description":"Software","plan":"free"}` | Create New Organization |
| 12 | `GET` | `http://localhost:5000/api/organizations/my` | Bearer | User | None | List User's Organizations |
| 13 | `POST` | `http://localhost:5000/api/organizations/:id/switch` | Bearer | User | None | Switch Active Organization |
| 14 | `GET` | `http://localhost:5000/api/invitations/my` | Bearer | User | None | Get Pending Invitations for Email |
| 15 | `POST` | `http://localhost:5000/api/invitations/:id/accept` | Bearer | User | None | Accept Workspace Invitation |
| 16 | `POST` | `http://localhost:5000/api/invitations/:id/decline` | Bearer | User | None | Decline Workspace Invitation |
| 17 | `GET` | `http://localhost:5000/api/channels` | Bearer | User | None | Get Accessible Channels |
| 18 | `POST` | `http://localhost:5000/api/channels` | Bearer | User | `{"name":"general","description":"General talk","isPrivate":false}` | Create Channel |
| 19 | `GET` | `http://localhost:5000/api/channels/:id` | Bearer | User | None | Get Channel Details |
| 20 | `PUT` | `http://localhost:5000/api/channels/:id` | Bearer | Creator | `{"name":"general-updates","description":"All updates"}` | Update Channel |
| 21 | `POST` | `http://localhost:5000/api/channels/:id/join` | Bearer | User | None | Join Public Channel |
| 22 | `POST` | `http://localhost:5000/api/channels/:id/leave` | Bearer | User | None | Leave Channel |
| 23 | `POST` | `http://localhost:5000/api/channels/:id/members` | Bearer | User | `{"userIds":["6a8ea3262342db0d3dad30dc"]}` | Add Members to Channel |
| 24 | `PATCH` | `http://localhost:5000/api/channels/:id/settings` | Bearer | User | `{"muted":true}` | Mute/Unmute Channel |
| 25 | `GET` | `http://localhost:5000/api/channels/:id/messages` | Bearer | User | None | Get Channel Messages |
| 26 | `POST` | `http://localhost:5000/api/channels/:id/messages` | Bearer | User | `{"content":"Hello team!","messageType":"text"}` | Send Channel Message |
| 27 | `GET` | `http://localhost:5000/api/channels/settings/organization` | Bearer | User | None | Get Channel Creation Policy |
| 28 | `POST` | `http://localhost:5000/api/conversations` | Bearer | User | `{"receiverId":"6a8ea3262342db0d3dad30dc"}` | Create / Open 1-on-1 Chat |
| 29 | `GET` | `http://localhost:5000/api/conversations` | Bearer | User | None | Get My Direct Conversations |
| 30 | `PATCH` | `http://localhost:5000/api/conversations/:conversationId/read` | Bearer | User | None | Mark Conversation as Read |
| 31 | `PATCH` | `http://localhost:5000/api/conversations/:conversationId/settings` | Bearer | User | `{"muted":true,"manualUnread":false}` | Update Direct Chat Settings |
| 32 | `GET` | `http://localhost:5000/api/conversations/:conversationId/messages` | Bearer | User | None | Get Direct Messages |
| 33 | `POST` | `http://localhost:5000/api/conversations/:conversationId/messages` | Bearer | User | `{"content":"Direct message text"}` | Send Direct Message |
| 34 | `PATCH` | `http://localhost:5000/api/messages/read` | Bearer | User | `{"messageIds":["6a9959a1ae252685e85be170"]}` | Batch Mark Messages as Read |
| 35 | `GET` | `http://localhost:5000/api/messages/:messageId` | Bearer | User | None | Get Single Message |
| 36 | `PATCH` | `http://localhost:5000/api/messages/:messageId/read` | Bearer | Receiver | None | Mark Single Message Read |
| 37 | `PATCH` | `http://localhost:5000/api/messages/:messageId` | Bearer | Sender | `{"content":"Edited content"}` | Edit Message |
| 38 | `DELETE` | `http://localhost:5000/api/messages/:messageId` | Bearer | Sender/Admin | None | Soft Delete Message for Everyone |
| 39 | `POST` | `http://localhost:5000/api/messages/:messageId/delete-for-me` | Bearer | User | None | Delete Message for Me Only |
| 40 | `POST` | `http://localhost:5000/api/messages/:messageId/forward` | Bearer | User | `{"targetType":"channel","targetId":"6a9179cdd8bfa9616d6031e5"}` | Forward Message |
| 41 | `POST` | `http://localhost:5000/api/messages/:messageId/reactions` | Bearer | User | `{"emoji":"👍"}` | Add Reaction |
| 42 | `DELETE` | `http://localhost:5000/api/messages/:messageId/reactions/:emoji` | Bearer | User | None | Remove Reaction |
| 43 | `GET` | `http://localhost:5000/api/notifications` | Bearer | User | None | Get In-App Notifications |
| 44 | `GET` | `http://localhost:5000/api/notifications/unread-count` | Bearer | User | None | Get Total Unread Count |
| 45 | `PATCH` | `http://localhost:5000/api/notifications/:id/read` | Bearer | User | None | Mark Single Notification Read |
| 46 | `PATCH` | `http://localhost:5000/api/notifications/read-all` | Bearer | User | None | Mark All Notifications Read |
| 47 | `POST` | `http://localhost:5000/api/todos` | Bearer | User | `{"title":"Task","assignedTo":"6a8ea3262342db0d3dad30dc"}` | Create To-Do Task |
| 48 | `GET` | `http://localhost:5000/api/todos` | Bearer | User | None | Get Filtered Tasks |
| 49 | `GET` | `http://localhost:5000/api/todos/:todoId` | Bearer | User | None | Get Task Details |
| 50 | `PATCH` | `http://localhost:5000/api/todos/:todoId` | Bearer | User | `{"title":"Updated task title","priority":"high"}` | Update To-Do Task |
| 51 | `PATCH` | `http://localhost:5000/api/todos/:todoId/status` | Bearer | User | None | Toggle Task Completion |
| 52 | `DELETE` | `http://localhost:5000/api/todos/:todoId` | Bearer | Creator/Admin | None | Soft Delete Task |
| 53 | `GET` | `http://localhost:5000/api/search` | Bearer | User | None (`?q=keyword`) | Unified Search |
| 54 | `GET` | `http://localhost:5000/api/search/messages` | Bearer | User | None (`?q=keyword`) | Advanced Message Search |
| 55 | `POST` | `http://localhost:5000/api/pinned-messages/:messageId/pin` | Bearer | User | None | Pin Message |
| 56 | `DELETE` | `http://localhost:5000/api/pinned-messages/:messageId/pin` | Bearer | User | None | Unpin Message |
| 57 | `GET` | `http://localhost:5000/api/pinned-messages` | Bearer | User | None (`?channelId=...`) | Get Pinned Messages |
| 58 | `POST` | `http://localhost:5000/api/saved-messages/:messageId/save` | Bearer | User | None | Save / Bookmark Message |
| 59 | `DELETE` | `http://localhost:5000/api/saved-messages/:messageId/save` | Bearer | User | None | Unsave / Remove Bookmark |
| 60 | `GET` | `http://localhost:5000/api/saved-messages` | Bearer | User | None | Get My Saved Messages |

---

### COMPANY ADMIN APIs (Require Admin / Owner Role)

| # | Method | COMPLETE POSTMAN URL | Auth | Role | Body | Purpose |
|---|---|---|---|---|---|---|
| 61 | `POST` | `http://localhost:5000/api/invitations` | Bearer | Admin | `{"email":"newhire@company.com"}` | Invite Employee to Org |
| 62 | `GET` | `http://localhost:5000/api/invitations/org` | Bearer | Admin | None | List Sent Invitations |
| 63 | `DELETE` | `http://localhost:5000/api/invitations/:id` | Bearer | Admin | None | Revoke Sent Invitation |
| 64 | `GET` | `http://localhost:5000/api/admin/stats` | Bearer | Admin | None | Aggregated Workspace Metrics |
| 65 | `GET` | `http://localhost:5000/api/admin/users` | Bearer | Admin | None | Manage Workspace Users |
| 66 | `PATCH` | `http://localhost:5000/api/admin/users/:id/role` | Bearer | Admin | `{"role":"admin"}` | Assign Member / Admin Role |
| 67 | `PATCH` | `http://localhost:5000/api/admin/users/:id/status` | Bearer | Admin | `{"status":"inactive"}` | Activate / Deactivate Member |
| 68 | `PATCH` | `http://localhost:5000/api/admin/users/:id/permissions` | Bearer | Admin | `{"permissions":["MANAGE_MEMBERS","MANAGE_CHANNELS"]}` | Set Custom Admin Permissions |
| 69 | `POST` | `http://localhost:5000/api/admin/invite-user` | Bearer | Admin | `{"email":"newhire@company.com"}` | Admin Invite Alias |
| 70 | `GET` | `http://localhost:5000/api/admin/join-requests` | Bearer | Admin | None | Get Legacy Join Requests |
| 71 | `POST` | `http://localhost:5000/api/admin/join-requests/:id/approve` | Bearer | Admin | None | Approve Join Request |
| 72 | `POST` | `http://localhost:5000/api/admin/join-requests/:id/reject` | Bearer | Admin | None | Reject Join Request |
| 73 | `GET` | `http://localhost:5000/api/admin/channels` | Bearer | Admin | None | Manage Channels |
| 74 | `POST` | `http://localhost:5000/api/admin/channels` | Bearer | Admin | `{"name":"announcements","isPrivate":false}` | Admin Create Channel |
| 75 | `PATCH` | `http://localhost:5000/api/admin/channels/:id` | Bearer | Admin | `{"description":"New topic","isArchived":false}` | Admin Update Channel Settings |
| 76 | `DELETE` | `http://localhost:5000/api/admin/channels/:id` | Bearer | Admin | None | Admin Purge Channel & Messages |
| 77 | `GET` | `http://localhost:5000/api/admin/channels/:id/members` | Bearer | Admin | None | List Channel Members |
| 78 | `POST` | `http://localhost:5000/api/admin/channels/:id/members/:userId` | Bearer | Admin | None | Admin Force-Add Member to Channel |
| 79 | `DELETE` | `http://localhost:5000/api/admin/channels/:id/members/:userId` | Bearer | Admin | None | Admin Remove Member from Channel |
| 80 | `GET` | `http://localhost:5000/api/admin/messages` | Bearer | Admin | None | Workspace Messages Moderation |
| 81 | `DELETE` | `http://localhost:5000/api/admin/messages/:id` | Bearer | Admin | None | Moderate & Delete Message |
| 82 | `GET` | `http://localhost:5000/api/admin/audit-logs` | Bearer | Admin | None | Company Audit Log Trail |
| 83 | `GET` | `http://localhost:5000/api/admin/settings` | Bearer | Admin | None | Get Company Settings |
| 84 | `PATCH` | `http://localhost:5000/api/admin/settings` | Bearer | Admin | `{"companyName":"ABC Tech","allowMemberInvites":true}` | Update Company Policy Settings |

---

### PLATFORM SUPER ADMIN APIs (Require `role: 'super_admin'`)

| # | Method | COMPLETE POSTMAN URL | Auth | Role | Body | Purpose |
|---|---|---|---|---|---|---|
| 85 | `GET` | `http://localhost:5000/api/super-admin/stats` | Bearer | Super Admin | None | Global Platform Statistics |
| 86 | `GET` | `http://localhost:5000/api/super-admin/organizations` | Bearer | Super Admin | None | List All Platform Companies |
| 87 | `GET` | `http://localhost:5000/api/super-admin/organizations/:id` | Bearer | Super Admin | None | Get Organization Deep Details |
| 88 | `PATCH` | `http://localhost:5000/api/super-admin/organizations/:id/activate` | Bearer | Super Admin | `{"plan":"professional","startDate":"2026-09-03","endDate":"2027-09-03"}` | Approve & Activate Organization |
| 89 | `PATCH` | `http://localhost:5000/api/super-admin/organizations/:id/reject` | Bearer | Super Admin | `{"reason":"Incomplete business entity verification"}` | Reject Company Creation Request |
| 90 | `PATCH` | `http://localhost:5000/api/super-admin/organizations/:id/suspend` | Bearer | Super Admin | None | Suspend Organization |
| 91 | `PATCH` | `http://localhost:5000/api/super-admin/organizations/:id/subscription` | Bearer | Super Admin | `{"plan":"enterprise","status":"active"}` | Update Subscription Terms |
| 92 | `PATCH` | `http://localhost:5000/api/super-admin/organizations/:id/features` | Bearer | Super Admin | `{"chat":true,"channels":true,"todos":true}` | Update Feature Entitlements |

---

*Documentation generated from source code verification.*
