# ChatApp - Fullstack Team Communication Platform

A comprehensive, real-time team communication platform built with the MERN stack and Socket.IO. Designed to support organizational isolation, it allows multiple companies to manage their own workspaces, channels, and direct messages, overseen by a Super Admin architecture.

## 🚀 Key Features

*   **Multi-Tenant Architecture**: Workspace isolation where each organization has its own members, channels, and settings.
*   **Role-Based Access Control (RBAC)**: Super Admin, Company Admin, and Regular User roles with distinct permissions and dashboards.
*   **Real-time Communication**: Instant messaging powered by Socket.IO for both 1-on-1 conversations and group channels.
*   **Authentication & Security**: Secure JWT-based authentication and invitation system (Brevo integration) for joining workspaces.
*   **Channels & Groups**: Create public/private channels for team collaboration.
*   **File Sharing**: Upload and share files seamlessly (using Multer).
*   **Advanced Message Management**: Pin important messages to channels and save personal messages for later reference.
*   **Notifications**: Real-time read/unread counters and notification tracking.
*   **Task Management**: Built-in Todo tracking module integrated into the workspace.
*   **Global Search**: Quickly search through messages, contacts, and channels.

## 🛠 Tech Stack

**Frontend:**
*   React 19 (Vite)
*   Socket.IO Client
*   Axios for API requests
*   Context API for state management

**Backend:**
*   Node.js & Express.js
*   MongoDB with Mongoose (ODM)
*   Socket.IO for WebSockets
*   JWT for Authentication
*   Multer for File Uploads

## 📁 Project Structure

```text
chatapp/
├── backend/                  # Node.js/Express backend
│   ├── config/               # Database and configuration files
│   ├── controllers/          # Route logic handlers
│   ├── middleware/           # Auth and error middlewares
│   ├── models/               # Mongoose schemas (User, Message, Channel, etc.)
│   ├── routes/               # API route definitions
│   ├── services/             # Helper services (e.g., Mail, Socket)
│   ├── sockets/              # Socket.IO event handlers
│   └── server.js             # Main server entry point
├── frontend/                 # React frontend
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # React Context (Auth, Socket, Notifications)
│   │   ├── pages/            # Main page views
│   │   └── services/         # API integration services
│   └── vite.config.js
└── package.json              # Root package for concurrent execution
```

## ⚙️ Setup & Installation

### 1. Prerequisites
*   Node.js (v18+ recommended)
*   MongoDB (running locally or a MongoDB Atlas URI)

### 2. Install Dependencies
From the root directory, install dependencies for both the root, frontend, and backend concurrently:
```bash
npm run install:all
```

### 3. Environment Variables
Create a `.env` file in the `backend/` directory using the following template:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/flock_clone
JWT_SECRET=your_jwt_secret_here
SUPER_ADMIN_EMAIL=superadmin@example.com
SUPER_ADMIN_PASSWORD=your_super_admin_password
BREVO_API_KEY=your_brevo_api_key_here
BREVO_SENDER_EMAIL=sender@example.com
BREVO_SENDER_NAME=ChatApp
CLIENT_URL=http://localhost:5173
```
*(Note: Never commit your actual `.env` file to version control)*

### 4. Running the Application

You can start both the frontend (Vite) and backend (Node/Express) servers simultaneously from the root directory:
```bash
npm run dev
```

Alternatively, you can run them separately:
*   **Backend:** `cd backend && npm run dev`
*   **Frontend:** `cd frontend && npm run dev`

The frontend will typically run on `http://localhost:5173` and the backend API on `http://localhost:5000`.

## 📡 Core Modules (Backend)

*   **Auth & Users**: User registration, login, and profile management.
*   **Organizations**: Workspace creation, Super Admin approval workflows, and company settings.
*   **Invitations**: Email-based workspace invites.
*   **Channels & Conversations**: Group and 1-on-1 chat logic.
*   **Messages**: Message persistence, real-time broadcasting, saving, and pinning.
*   **Notifications**: Delivery and read-state management for user alerts.
*   **Todos**: Personal/workspace task management.
*   **Admin/Super Admin**: Organization moderation and platform oversight routes.

## 🔮 Current Status & Future Improvements

**Current Status:**
The core infrastructure for multi-tenant workspace communication is fully implemented. Real-time messaging, file uploads, role isolation, and invitation flows are active and functional.

## Future Enhancements

- Google Calendar integration for scheduling and managing events.
- Audio and video calling with screen-sharing support.
- Notes and reminder management.
- Last-seen status with timestamp information.
- Backup and additional cloud storage support.
- Admin-controlled read-only groups.
- File compression to optimize file sharing and storage.
