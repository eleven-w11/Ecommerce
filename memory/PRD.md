# E-Commerce Admin Panel - Product Requirements Document

## Original Problem Statement
Build a full-stack e-commerce application with comprehensive admin panel functionality including:
- Product management with images
- User management with login history
- Order management
- Chat/Messages functionality
- Custom admin navbar
- Route protection for admin pages

## Tech Stack
- **Backend**: Node.js, Express.js (runs on port 5000)
- **Proxy**: FastAPI (Python) - sits between frontend and backend (port 8001)
- **Frontend**: React (port 3000)
- **Database**: MongoDB (Atlas)
- **Authentication**: JWT, Google OAuth, Google One Tap

## Architecture
```
/app/
├── backend/        # Node.js/Express backend
│   ├── models/     # MongoDB models
│   ├── routes/     # API routes
│   ├── middleware/ # Auth middleware
│   └── server.js   # Main server file
├── frontend/       # React frontend
│   ├── src/
│   │   ├── files/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   └── styles/
│   │   └── App.js
│   └── .env
├── server.py       # FastAPI proxy
└── ...
```

## Key Database Models
- `StoreUser`: { name, email, password, googleId, image, isAdmin, loginHistory }
- `Product`: { product_name, product_price, dis_product_price, images[], p_type, p_des }
- `Order`: { userId, products, total, status }
- `Message`: { senderId, receiverId, message, timestamp }

## Completed Features (December 2025)

### Admin Panel
- [x] Dashboard with stats (Users, Products, Orders, Pending count)
- [x] Custom top navbar (Dashboard, Products, Orders, Users, Messages, Back to Store)
- [x] Main store navbar hidden on admin pages
- [x] AdminProtectedRoute for route security
- [x] Products page with images, search, add/edit/delete
- [x] Users page with login counts and search
- [x] Orders page with status management
- [x] Messages/Chat functionality

### Authentication
- [x] JWT-based authentication
- [x] Google OAuth integration
- [x] Google One Tap login (configured)
- [x] Admin redirect after login
- [x] Multiple admin support (primary + test admin)

### Bug Fixes (This Session)
- [x] Fixed CORS issue with localhost API URL
- [x] Created test admin account (testadmin@admin.com / admin123)
- [x] Fixed admin recognition in UserProRoutes.js
- [x] Product images now display correctly

## Admin Credentials
- **Primary Admin**: talha.eleven.w11@gmail.com (Google login)
- **Test Admin**: testadmin@admin.com / admin123

## API Endpoints
- `/api/signin` - User sign-in
- `/api/signup` - User sign-up
- `/api/admin/users` - Get all users
- `/api/admin/products` - CRUD operations for products
- `/api/admin/orders` - Get/update orders
- `/api/admin/all-chats` - Get chat users
- `/api/products` - Public products endpoint

## Pending/Future Tasks

### P1 - Next Priority
- [ ] Advanced user filters (new/existing users, date range, active/inactive)
- [ ] Group users by registration date
- [ ] Consolidate duplicate Chat tabs

### P2 - Backlog
- [ ] Refactor `getImageUrl` helper into utility function
- [ ] WebSocket CORS configuration for real-time features
- [ ] Code cleanup and file organization

## Environment Variables

### Frontend (.env)
- REACT_APP_API_BASE_URL
- REACT_APP_BACKEND_URL
- REACT_APP_GOOGLE_CLIENT_ID

### Backend (.env)
- PORT
- MONGO_URI
- JWT_SECRET
- ADMIN_EMAIL
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET

## Testing
- Test admin account available for development
- Pytest test files in /app/backend/tests/
- Test reports in /app/test_reports/

## Last Updated
December 27, 2025
