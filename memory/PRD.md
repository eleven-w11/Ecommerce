# E-Commerce Admin Panel - Product Requirements Document

## Original Problem Statement
Build a comprehensive admin panel for an e-commerce application with:
1. **View Orders**: Display all-time order records with complete user details
2. **Users Section**: Show all-time login information for all users (profile name, email, timestamp for every login)
3. **Products Section**: Admin page to display products with Edit/Delete/Add functionality using modals
4. **Active Visitors Record**: Track and display daily visitor and order counts with historical data
5. **User Image Storage**: Download and store Google user profile images locally
6. **UI Updates**: Improve UI for user list, user profile, and contact us pages
7. **Real-time Visitor Count**: Implement real-time visitor tracking on admin panel

## Architecture
```
/app/
├── backend/
│   ├── middleware/
│   ├── models/ (StoreUser.js, Product.js, Order.js, VisitorStats.js)
│   ├── routes/ (adminRoutes.js, productRoutes.js, signinRoutes.js, etc.)
│   ├── server.js (Node.js Express + Socket.IO)
│   └── server.py (FastAPI proxy to Node.js)
├── frontend/ (React app)
│   ├── src/
│   │   ├── files/pages/admin/adminpanel/
│   │   │   ├── AdminPanel.jsx
│   │   │   ├── AdminOrders.jsx
│   │   │   ├── AdminUsers.jsx
│   │   │   ├── AdminProducts.jsx
│   │   │   └── AdminVisitors.jsx
│   │   └── App.js
│   └── package.json
└── memory/
    └── PRD.md
```

## What's Been Implemented

### Session: 2026-02-27

#### Completed Features:
1. **Login History Tracking (P0 - Blocker Fixed)**
   - Updated `/app/backend/routes/signinRoutes.js` to record login timestamps in `loginHistory` array
   - Both local signin and Google OAuth now track login history
   - Each login creates a new timestamp entry in the format "DD-MM-YYYY HH:mm:ss"

2. **Admin Panel Dashboard**
   - Updated Quick Actions to link to all admin pages (Products, Orders, Users, Analytics, Messages)
   - Added data-testid attributes for testing

3. **Admin Users Page**
   - Displays all users with their complete login history
   - Search functionality by name/email
   - Expandable cards showing login timestamps
   - Google user indicator

4. **Admin Products Page**
   - Modal-based Add/Edit/Delete functionality
   - Product grid with images, prices, categories
   - Search functionality
   - Form fields: name, price, discounted price, category, description, images

5. **Admin Orders Page**
   - Displays all orders with user details
   - Status management (pending, confirmed, processing, shipped, delivered, cancelled)
   - Shipping address and order items display

6. **Admin Visitors Page**
   - Real-time active visitor count via Socket.IO
   - Today's statistics (total visits, unique visitors, orders, peak concurrent)
   - Hourly activity chart
   - All-time statistics
   - Historical records (last 30 days)

7. **Security Fix**
   - Fixed httpx cookie caching vulnerability in server.py proxy
   - Each request now creates a fresh httpx client to prevent auth leakage

8. **Deployment Fix**
   - Fixed package.json start script to use `react-scripts start` instead of concurrently

### Backend API Endpoints (All Tested & Working):
- `GET /api/admin/users` - All users with login history
- `GET /api/admin/users/:id` - Single user details
- `GET /api/admin/orders` - All orders with user info
- `PUT /api/admin/orders/:orderId/status` - Update order status
- `GET /api/admin/products` - All products
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- `GET /api/admin/visitor-stats` - Visitor analytics

### Database Models:
- `StoreUser`: { name, email, password, image, googleId, loginHistory: [String] }
- `Order`: { orderId, userId, items, shippingAddress, paymentMethod, status, totalAmount }
- `Product`: { product_name, product_price, dis_product_price, p_type, p_des, images }
- `VisitorStats`: { date, totalVisitors, uniqueVisitors, ordersReceived, peakVisitors, hourlyStats }

## Test Credentials
- **Admin User**: admin@admin.com / admin123
- **Test User**: testuser@test.com / test123

## Known Issues
1. External preview URL (https://34e386bc-c14a-4f28-a16b-3cfba5796af9.preview.emergentagent.com) experiencing connectivity issues - platform infrastructure problem
2. Minor React Hook dependency warnings in admin pages (cosmetic, not affecting functionality)

## Future Tasks / Backlog
1. **Refactoring**: Extract `getImageUrl` helper into shared utility file (src/utils/imageUtils.js)
2. **Database Query Optimization**: Add pagination/limits to admin queries for scalability
3. **UI Polish**: Additional animations and loading states
4. **Product Images**: Align frontend image array format with backend schema

## Testing
- Backend: 100% (20/20 tests passed)
- Frontend: 85% (UI renders correctly, integration blocked by external URL)
- Test report: `/app/test_reports/iteration_3.json`
