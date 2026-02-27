"""
Backend API tests for Admin Panel functionality
Testing: /api/admin/users, /api/admin/orders, /api/admin/products, /api/admin/visitor-stats
"""
import pytest
import requests
import os

# Get base URL from environment - using localhost:8001 for testing
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001')

# Test credentials
ADMIN_EMAIL = "admin@admin.com"
ADMIN_PASSWORD = "admin123"
TEST_USER_EMAIL = "testuser@test.com"
TEST_USER_PASSWORD = "test123"


class TestHealthCheck:
    """Basic health check tests"""
    
    def test_health_endpoint(self):
        """Test health endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "ok"
        print("✅ Health check passed")


class TestAuthentication:
    """Authentication flow tests"""
    
    def test_signin_success(self):
        """Test successful signin"""
        response = requests.post(f"{BASE_URL}/api/signin", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        assert "token" in data
        assert data["user"]["email"] == TEST_USER_EMAIL
        print("✅ Test user signin successful")
    
    def test_signin_invalid_credentials(self):
        """Test signin with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/signin", json={
            "email": "nonexistent@test.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 400
        print("✅ Invalid credentials rejected correctly")
    
    def test_admin_signin(self):
        """Test admin user signin"""
        response = requests.post(f"{BASE_URL}/api/signin", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        assert data["user"].get("isAdmin") == True
        print("✅ Admin signin successful")
    
    def test_login_history_recorded(self):
        """Test that login history is recorded after signin"""
        # Sign in first
        response = requests.post(f"{BASE_URL}/api/signin", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        })
        assert response.status_code == 200
        
        # Get admin token
        admin_response = requests.post(f"{BASE_URL}/api/signin", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        admin_token = admin_response.json().get("token")
        
        # Check users endpoint to verify login history
        users_response = requests.get(
            f"{BASE_URL}/api/admin/users",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert users_response.status_code == 200
        users = users_response.json().get("users", [])
        
        # Find test user
        test_user = next((u for u in users if u["email"] == TEST_USER_EMAIL), None)
        assert test_user is not None
        assert len(test_user.get("loginHistory", [])) > 0
        print(f"✅ Login history recorded: {len(test_user['loginHistory'])} logins")


class TestAdminUsersEndpoint:
    """Tests for /api/admin/users endpoint"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token for authenticated requests"""
        response = requests.post(f"{BASE_URL}/api/signin", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json().get("token")
    
    def test_users_requires_auth(self):
        """Test that users endpoint requires authentication - using new session"""
        # Use a fresh session without any cookies
        with requests.Session() as session:
            response = session.get(f"{BASE_URL}/api/admin/users")
            # Should be 401 or data with success=false
            if response.status_code == 200:
                data = response.json()
                # If 200 is returned, it should indicate unauthorized in the body
                assert data.get("success") == False or data.get("message") == "No token provided", \
                    f"Endpoint returned data without auth: {data}"
            else:
                assert response.status_code == 401
        print("✅ Users endpoint requires auth")
    
    def test_users_requires_admin(self):
        """Test that users endpoint requires admin role"""
        # Get regular user token
        user_response = requests.post(f"{BASE_URL}/api/signin", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        })
        user_token = user_response.json().get("token")
        
        response = requests.get(
            f"{BASE_URL}/api/admin/users",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 403  # Forbidden for non-admin
        print("✅ Users endpoint requires admin role")
    
    def test_get_all_users(self, admin_token):
        """Test getting all users"""
        response = requests.get(
            f"{BASE_URL}/api/admin/users",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        assert "users" in data
        assert isinstance(data["users"], list)
        
        # Verify user structure
        if len(data["users"]) > 0:
            user = data["users"][0]
            assert "_id" in user
            assert "name" in user
            assert "email" in user
            assert "loginHistory" in user
        print(f"✅ Got {len(data['users'])} users")
    
    def test_get_single_user(self, admin_token):
        """Test getting single user by ID"""
        # First get all users
        users_response = requests.get(
            f"{BASE_URL}/api/admin/users",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        users = users_response.json().get("users", [])
        
        if len(users) > 0:
            user_id = users[0]["_id"]
            response = requests.get(
                f"{BASE_URL}/api/admin/users/{user_id}",
                headers={"Authorization": f"Bearer {admin_token}"}
            )
            assert response.status_code == 200
            data = response.json()
            assert data.get("success") == True
            assert data["user"]["_id"] == user_id
            print(f"✅ Got single user: {data['user']['email']}")


class TestAdminOrdersEndpoint:
    """Tests for /api/admin/orders endpoint"""
    
    @pytest.fixture
    def admin_token(self):
        response = requests.post(f"{BASE_URL}/api/signin", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json().get("token")
    
    def test_orders_requires_auth(self):
        """Test that orders endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/orders")
        assert response.status_code == 401
        print("✅ Orders endpoint requires auth")
    
    def test_get_all_orders(self, admin_token):
        """Test getting all orders"""
        response = requests.get(
            f"{BASE_URL}/api/admin/orders",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        assert "orders" in data
        assert isinstance(data["orders"], list)
        print(f"✅ Got {len(data['orders'])} orders")


class TestAdminProductsEndpoint:
    """Tests for /api/admin/products CRUD operations"""
    
    @pytest.fixture
    def admin_token(self):
        response = requests.post(f"{BASE_URL}/api/signin", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json().get("token")
    
    def test_products_requires_auth(self):
        """Test that products endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/products")
        assert response.status_code == 401
        print("✅ Products endpoint requires auth")
    
    def test_get_all_products(self, admin_token):
        """Test getting all products"""
        response = requests.get(
            f"{BASE_URL}/api/admin/products",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        assert "products" in data
        print(f"✅ Got {len(data['products'])} products")
    
    def test_create_product(self, admin_token):
        """Test creating a new product"""
        product_data = {
            "product_name": "TEST_PyTestProduct",
            "product_price": 49.99,
            "dis_product_price": 39.99,
            "p_type": "accessories",
            "p_des": "A test product created by pytest",
            "images": [{"pi_1": "pytest.jpg", "color": "red", "color_code": "#FF0000"}]
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/products",
            headers={"Authorization": f"Bearer {admin_token}"},
            json=product_data
        )
        assert response.status_code == 201
        data = response.json()
        assert data.get("success") == True
        assert data["product"]["product_name"] == product_data["product_name"]
        print(f"✅ Created product: {data['product']['_id']}")
        
        # Store product ID for cleanup
        return data["product"]["_id"]
    
    def test_update_product(self, admin_token):
        """Test updating a product"""
        # First create a product
        create_data = {
            "product_name": "TEST_UpdateProduct",
            "product_price": 29.99,
            "dis_product_price": 19.99,
            "p_type": "general",
            "p_des": "Product to be updated",
            "images": []
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/admin/products",
            headers={"Authorization": f"Bearer {admin_token}"},
            json=create_data
        )
        assert create_response.status_code == 201
        product_id = create_response.json()["product"]["_id"]
        
        # Now update it
        update_data = {
            "product_name": "TEST_UpdateProduct_Modified",
            "product_price": 35.99,
            "dis_product_price": 25.99,
            "p_type": "top",
            "p_des": "Updated product description",
            "images": []
        }
        
        update_response = requests.put(
            f"{BASE_URL}/api/admin/products/{product_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
            json=update_data
        )
        assert update_response.status_code == 200
        data = update_response.json()
        assert data.get("success") == True
        assert data["product"]["product_name"] == update_data["product_name"]
        
        # Verify update persisted with GET
        get_response = requests.get(
            f"{BASE_URL}/api/admin/products",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        products = get_response.json().get("products", [])
        updated_product = next((p for p in products if p["_id"] == product_id), None)
        assert updated_product is not None
        assert updated_product["product_name"] == update_data["product_name"]
        print(f"✅ Updated product: {product_id}")
    
    def test_delete_product(self, admin_token):
        """Test deleting a product"""
        # First create a product
        create_data = {
            "product_name": "TEST_DeleteProduct",
            "product_price": 9.99,
            "p_type": "general",
            "images": []
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/admin/products",
            headers={"Authorization": f"Bearer {admin_token}"},
            json=create_data
        )
        assert create_response.status_code == 201
        product_id = create_response.json()["product"]["_id"]
        
        # Delete it
        delete_response = requests.delete(
            f"{BASE_URL}/api/admin/products/{product_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert delete_response.status_code == 200
        assert delete_response.json().get("success") == True
        
        # Verify deletion
        get_response = requests.get(
            f"{BASE_URL}/api/admin/products",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        products = get_response.json().get("products", [])
        deleted_product = next((p for p in products if p["_id"] == product_id), None)
        assert deleted_product is None
        print(f"✅ Deleted product: {product_id}")
    
    def test_create_product_validation(self, admin_token):
        """Test that product creation validates required fields"""
        # Missing product_name and product_price
        response = requests.post(
            f"{BASE_URL}/api/admin/products",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"p_type": "general"}
        )
        assert response.status_code == 400
        print("✅ Product validation works for required fields")


class TestAdminVisitorStatsEndpoint:
    """Tests for /api/admin/visitor-stats endpoint"""
    
    @pytest.fixture
    def admin_token(self):
        response = requests.post(f"{BASE_URL}/api/signin", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json().get("token")
    
    def test_visitor_stats_requires_auth(self):
        """Test that visitor stats endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/visitor-stats")
        assert response.status_code == 401
        print("✅ Visitor stats endpoint requires auth")
    
    def test_get_visitor_stats(self, admin_token):
        """Test getting visitor statistics"""
        response = requests.get(
            f"{BASE_URL}/api/admin/visitor-stats",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        assert "today" in data
        assert "history" in data
        assert "allTime" in data
        
        # Verify today structure
        today = data["today"]
        assert "date" in today
        assert "totalVisitors" in today
        assert "uniqueVisitors" in today
        assert "ordersReceived" in today
        assert "peakVisitors" in today
        print("✅ Got visitor stats with correct structure")


class TestCleanup:
    """Cleanup test data"""
    
    def test_cleanup_test_products(self):
        """Clean up TEST_ prefixed products"""
        # Get admin token
        response = requests.post(f"{BASE_URL}/api/signin", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        admin_token = response.json().get("token")
        
        # Get all products
        products_response = requests.get(
            f"{BASE_URL}/api/admin/products",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        products = products_response.json().get("products", [])
        
        # Delete TEST_ prefixed products
        deleted_count = 0
        for product in products:
            if product.get("product_name", "").startswith("TEST_"):
                requests.delete(
                    f"{BASE_URL}/api/admin/products/{product['_id']}",
                    headers={"Authorization": f"Bearer {admin_token}"}
                )
                deleted_count += 1
        
        print(f"✅ Cleaned up {deleted_count} test products")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
