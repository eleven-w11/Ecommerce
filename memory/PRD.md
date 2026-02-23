# Real-Time Chat System - PRD

## Original Problem Statement
Add real-time chat system between users and admin using Socket.IO to existing MERN ecommerce website (React + Node.js + Express + MongoDB + JWT authentication).

## User Choices
1. **File Storage**: Local file storage for uploads
2. **Admin Identification**: Use ADMIN_EMAIL from .env (talha.eleven.w11@gmail.com)
3. **Chat History**: Persistent (all messages saved in MongoDB)
4. **UI Theme**: Match existing ecommerce theme

## Architecture
- **Frontend**: React (Create React App)
- **Backend**: Node.js + Express (proxied through Python FastAPI for Emergent compatibility)
- **Database**: MongoDB Atlas
- **Real-time**: Socket.IO (via /api/socket.io/ path)
- **Authentication**: JWT tokens via cookies

## Core Requirements
- User ↔ Admin only communication (not user-to-user)
- Real-time messaging with Socket.IO
- Message status tracking (sent/delivered/seen)
- Online/offline indicators
- Typing indicators
- File/image upload support
- Mobile responsive UI

## Implemented Features (Feb 15, 2026)

### Frontend Components
1. **Chat.jsx** (`/app/frontend/src/files/pages/Chat.jsx`)
   - User-side chat interface
   - Authentication check - shows "Sign In" prompt for guests
   - Real-time messaging with Socket.IO
   - Message status ticks (single/double/blue)
   - Typing indicator
   - File/image upload
   - Auto-scroll to latest message

2. **UserList.jsx** (`/app/frontend/src/files/pages/admin/UserList.jsx`)
   - Admin view of all chat users
   - Sorted by last message time
   - Shows unread count, online status
   - Last message preview

3. **AdminChat.jsx** (`/app/frontend/src/files/pages/admin/AdminChat.jsx`)
   - Admin chat interface with individual users
   - Same features as user chat

### Backend Implementation
1. **Message Model** (`/app/backend/models/Message.js`)
   - senderId, receiverId, message, messageType, status, timestamps

2. **Chat Model** (`/app/backend/models/Chat.js`)
   - participants, lastMessage, unreadCount

3. **Chat Routes** (`/app/backend/routes/chatRoutes.js`)
   - POST /api/chat/send - Send message with optional file
   - GET /api/chat/messages/:otherUserId - Get conversation
   - GET /api/chat/admin - Get admin info
   - GET /api/chat/users - Get all users with chats (admin only)
   - PUT /api/chat/delivered/:senderId - Mark as delivered
   - PUT /api/chat/seen/:senderId - Mark as seen
   - GET /api/chat/is-admin - Check admin status

4. **Socket.IO Events** (in server.js)
   - register - User connects
   - sendMessage - Real-time message
   - typing - Typing indicator
   - markSeen - Read receipts
   - userOnline - Online status

### Routes Added to App.js
- `/Chat` - User chat page
- `/UserList` - Admin user list
- `/AdminChat/:odirUserId` - Admin chat with specific user

## Remaining Backlog

### P0 (Critical)
- None identified

### P1 (Important)
- Add chat icon/button on homepage for easy access
- Push notifications for new messages
- Message search functionality

### P2 (Nice to have)
- Chat sound notifications
- Message reactions/emojis
- Message editing/deletion
- Group chat support (if needed)

## Next Tasks
1. Test with actual user login to verify full chat flow
2. Add chat access button/icon to navigation
3. Consider adding notification system

## Technical Notes
- Socket.IO uses `/api/socket.io/` path for Kubernetes ingress compatibility
- Python FastAPI proxy handles Node.js backend for Emergent platform
- File uploads stored in `/app/backend/uploads/chat/`
