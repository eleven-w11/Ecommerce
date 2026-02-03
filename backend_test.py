#!/usr/bin/env python3
"""
Comprehensive backend API tests for real-time chat system
Tests authentication, user management, and chat functionality
"""

import requests
import sys
import time
import uuid
from datetime import datetime

class ChatAPITester:
    def __init__(self, base_url="https://live-support-2.preview.emergentagent.com"):
        self.base_url = base_url
        self.admin_token = None
        self.user_token = None
        self.test_user_id = None
        self.admin_user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ PASS: {name}")
        else:
            print(f"❌ FAIL: {name} - {details}")
        
        self.test_results.append({
            "name": name,
            "success": success,
            "details": details
        })

    def make_request(self, method, endpoint, data=None, token=None, expected_status=200):
        """Make API request with error handling"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if token:
            headers['Authorization'] = f'Bearer {token}'
        
        try:
            if method.upper() == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method.upper() == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            
            success = response.status_code == expected_status
            result = response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
            
            return success, response.status_code, result
            
        except requests.exceptions.Timeout:
            return False, 0, "Request timeout"
        except requests.exceptions.ConnectionError:
            return False, 0, "Connection error"
        except Exception as e:
            return False, 0, f"Request error: {str(e)}"

    def test_root_endpoint(self):
        """Test root API endpoint"""
        success, status, result = self.make_request('GET', '')
        expected = status == 200 and isinstance(result, dict) and "message" in result
        self.log_test("Root endpoint (/api/)", expected, f"Status: {status}, Response: {result}")
        return expected

    def test_signup_user(self):
        """Test user signup"""
        test_user_data = {
            "name": f"Test User {uuid.uuid4().hex[:8]}",
            "email": f"testuser_{uuid.uuid4().hex[:8]}@test.com",
            "password": "testpass123"
        }
        
        success, status, result = self.make_request('POST', 'auth/signup', test_user_data, expected_status=200)
        
        if success and isinstance(result, dict) and result.get('success'):
            self.user_token = result.get('token')
            self.test_user_id = result.get('user_id')
            self.log_test("User Signup", True, f"Created user ID: {self.test_user_id}")
            return True
        else:
            self.log_test("User Signup", False, f"Status: {status}, Response: {result}")
            return False

    def test_login_user(self):
        """Test user login with provided credentials"""
        login_data = {
            "email": "user@chat.com",
            "password": "user123"
        }
        
        success, status, result = self.make_request('POST', 'auth/login', login_data, expected_status=200)
        
        if success and isinstance(result, dict) and result.get('success'):
            self.user_token = result.get('token')
            self.test_user_id = result.get('user_id')
            self.log_test("User Login (user@chat.com)", True, f"User ID: {self.test_user_id}, Role: {result.get('role')}")
            return True
        else:
            self.log_test("User Login (user@chat.com)", False, f"Status: {status}, Response: {result}")
            return False

    def test_login_admin(self):
        """Test admin login with provided credentials"""
        login_data = {
            "email": "admin@chat.com", 
            "password": "admin123"
        }
        
        success, status, result = self.make_request('POST', 'auth/login', login_data, expected_status=200)
        
        if success and isinstance(result, dict) and result.get('success') and result.get('role') == 'admin':
            self.admin_token = result.get('token')
            self.admin_user_id = result.get('user_id')
            self.log_test("Admin Login (admin@chat.com)", True, f"Admin ID: {self.admin_user_id}")
            return True
        else:
            self.log_test("Admin Login (admin@chat.com)", False, f"Status: {status}, Response: {result}")
            return False

    def test_verify_token(self):
        """Test token verification"""
        if not self.user_token:
            self.log_test("Token Verification", False, "No user token available")
            return False
            
        success, status, result = self.make_request('GET', 'auth/verify', token=self.user_token)
        
        expected = success and isinstance(result, dict) and result.get('success')
        self.log_test("Token Verification", expected, f"Status: {status}, Response: {result}")
        return expected

    def test_get_profile(self):
        """Test getting user profile"""
        if not self.user_token:
            self.log_test("Get User Profile", False, "No user token available")
            return False
            
        success, status, result = self.make_request('GET', 'user/profile', token=self.user_token)
        
        expected = success and isinstance(result, dict) and '_id' in result and 'name' in result
        self.log_test("Get User Profile", expected, f"Status: {status}, Profile: {result.get('name', 'N/A')}")
        return expected

    def test_get_chat_history_unauthorized(self):
        """Test getting chat history without authentication"""
        success, status, result = self.make_request('GET', f'messages/chat/history/{self.test_user_id or "test"}', expected_status=401)
        
        expected = status == 401
        self.log_test("Chat History (Unauthorized)", expected, f"Status: {status}")
        return expected

    def test_get_chat_history_authorized(self):
        """Test getting chat history with authentication"""
        if not self.user_token or not self.test_user_id:
            self.log_test("Chat History (Authorized)", False, "No user token or ID available")
            return False
            
        success, status, result = self.make_request('GET', f'messages/chat/history/{self.test_user_id}', token=self.user_token)
        
        expected = success and isinstance(result, dict) and result.get('success') is True
        self.log_test("Chat History (Authorized)", expected, f"Status: {status}, Messages count: {len(result.get('messages', []))}")
        return expected

    def test_admin_endpoints_unauthorized(self):
        """Test admin endpoints without admin token"""
        success, status, result = self.make_request('GET', 'admin/users-with-chats', token=self.user_token, expected_status=403)
        
        expected = status == 403
        self.log_test("Admin Endpoint (Unauthorized)", expected, f"Status: {status}")
        return expected

    def test_admin_get_users_with_chats(self):
        """Test admin getting users with chats"""
        if not self.admin_token:
            self.log_test("Admin Get Users with Chats", False, "No admin token available")
            return False
            
        success, status, result = self.make_request('GET', 'admin/users-with-chats', token=self.admin_token)
        
        expected = success and isinstance(result, dict) and result.get('success') is True
        self.log_test("Admin Get Users with Chats", expected, f"Status: {status}, Users count: {len(result.get('users', []))}")
        return expected

    def test_admin_get_chat(self):
        """Test admin getting specific user chat"""
        if not self.admin_token or not self.test_user_id:
            self.log_test("Admin Get User Chat", False, "No admin token or test user ID available")
            return False
            
        success, status, result = self.make_request('GET', f'admin/chat/{self.test_user_id}', token=self.admin_token)
        
        expected = success and isinstance(result, dict) and result.get('success') is True
        self.log_test("Admin Get User Chat", expected, f"Status: {status}, Messages count: {len(result.get('messages', []))}")
        return expected

    def test_logout(self):
        """Test logout functionality"""
        success, status, result = self.make_request('POST', 'auth/logout', token=self.user_token)
        
        expected = success and isinstance(result, dict) and result.get('success') is True
        self.log_test("User Logout", expected, f"Status: {status}, Response: {result}")
        return expected

    def run_all_tests(self):
        """Run all backend API tests"""
        print("🚀 Starting Backend API Tests for Chat System")
        print("=" * 60)
        
        # Basic connectivity
        self.test_root_endpoint()
        
        # Authentication tests
        self.test_login_user()
        self.test_login_admin()
        
        # If initial login fails, try signup
        if not self.user_token:
            print("\n📝 User login failed, trying signup...")
            self.test_signup_user()
        
        # User functionality tests
        if self.user_token:
            self.test_verify_token()
            self.test_get_profile()
            self.test_get_chat_history_authorized()
        
        # Unauthorized access tests
        self.test_get_chat_history_unauthorized()
        
        # Admin functionality tests
        if self.admin_token:
            self.test_admin_get_users_with_chats()
            if self.test_user_id:
                self.test_admin_get_chat()
        
        # Admin authorization tests
        self.test_admin_endpoints_unauthorized()
        
        # Cleanup
        if self.user_token:
            self.test_logout()
        
        print("\n" + "=" * 60)
        print(f"📊 Backend Tests Summary: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed < self.tests_run:
            print("\n❌ Failed Tests:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['name']}: {result['details']}")
        
        return self.tests_passed, self.tests_run, self.test_results

def main():
    """Main test execution"""
    tester = ChatAPITester()
    passed, total, results = tester.run_all_tests()
    
    # Return appropriate exit code
    return 0 if passed == total else 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)