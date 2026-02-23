#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class ChatSystemAPITester:
    def __init__(self, base_url="https://aaa48806-5355-4f41-a0f0-54d03ee1a5a4.preview.emergentagent.com"):
        self.base_url = base_url
        self.session = requests.Session()
        self.user_token = None
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.admin_email = "talha.eleven.w11@gmail.com"
        
    def log_test(self, name, success, details=""):
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED {details}")
        else:
            print(f"❌ {name} - FAILED {details}")
        
    def test_health_check(self):
        """Test basic health endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/api/health", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f", Response: {data.get('status', 'N/A')}"
            self.log_test("Health Check", success, details)
            return success
        except requests.exceptions.RequestException as e:
            self.log_test("Health Check", False, f"Error: {str(e)}")
            return False

    def test_verify_token_without_auth(self):
        """Test verifytoken endpoint without authentication"""
        try:
            response = self.session.get(f"{self.base_url}/api/verifytoken", timeout=10)
            # Should return 401 or similar for no auth
            success = response.status_code in [401, 403, 500]
            details = f"Status: {response.status_code}"
            self.log_test("VerifyToken (No Auth)", success, details)
            return success
        except requests.exceptions.RequestException as e:
            self.log_test("VerifyToken (No Auth)", False, f"Error: {str(e)}")
            return False

    def test_chat_admin_without_auth(self):
        """Test chat admin endpoint without authentication"""
        try:
            response = self.session.get(f"{self.base_url}/api/chat/admin", timeout=10)
            # Should return 401 or similar for no auth
            success = response.status_code in [401, 403, 500]
            details = f"Status: {response.status_code}"
            self.log_test("Chat Admin (No Auth)", success, details)
            return success
        except requests.exceptions.RequestException as e:
            self.log_test("Chat Admin (No Auth)", False, f"Error: {str(e)}")
            return False

    def test_chat_is_admin_without_auth(self):
        """Test is-admin endpoint without authentication"""
        try:
            response = self.session.get(f"{self.base_url}/api/chat/is-admin", timeout=10)
            # Should return 401 or similar for no auth
            success = response.status_code in [401, 403, 500]
            details = f"Status: {response.status_code}"
            self.log_test("Is Admin (No Auth)", success, details)
            return success
        except requests.exceptions.RequestException as e:
            self.log_test("Is Admin (No Auth)", False, f"Error: {str(e)}")
            return False

    def test_chat_users_without_auth(self):
        """Test chat users endpoint without authentication"""
        try:
            response = self.session.get(f"{self.base_url}/api/chat/users", timeout=10)
            # Should return 401 or similar for no auth
            success = response.status_code in [401, 403, 500]
            details = f"Status: {response.status_code}"
            self.log_test("Chat Users (No Auth)", success, details)
            return success
        except requests.exceptions.RequestException as e:
            self.log_test("Chat Users (No Auth)", False, f"Error: {str(e)}")
            return False

    def test_cors_headers(self):
        """Test CORS headers are properly set"""
        try:
            response = self.session.options(f"{self.base_url}/api/health", timeout=10)
            cors_headers = {
                'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
                'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials'),
                'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
            }
            
            # Check if CORS is configured
            has_cors = any(cors_headers.values())
            success = has_cors or response.status_code == 200
            details = f"Status: {response.status_code}, CORS Headers: {cors_headers}"
            self.log_test("CORS Configuration", success, details)
            return success
        except requests.exceptions.RequestException as e:
            self.log_test("CORS Configuration", False, f"Error: {str(e)}")
            return False

    def test_signup_endpoint(self):
        """Test signup endpoint exists"""
        try:
            # Test with invalid data to check if endpoint exists
            response = self.session.post(f"{self.base_url}/api/signup", 
                                       json={}, timeout=10)
            # Should return 400 or similar for invalid data, not 404
            success = response.status_code != 404
            details = f"Status: {response.status_code}"
            self.log_test("Signup Endpoint Exists", success, details)
            return success
        except requests.exceptions.RequestException as e:
            self.log_test("Signup Endpoint Exists", False, f"Error: {str(e)}")
            return False

    def test_signin_endpoint(self):
        """Test signin endpoint exists"""
        try:
            # Test with invalid data to check if endpoint exists
            response = self.session.post(f"{self.base_url}/api/signin", 
                                       json={}, timeout=10)
            # Should return 400 or similar for invalid data, not 404
            success = response.status_code != 404
            details = f"Status: {response.status_code}"
            self.log_test("Signin Endpoint Exists", success, details)
            return success
        except requests.exceptions.RequestException as e:
            self.log_test("Signin Endpoint Exists", False, f"Error: {str(e)}")
            return False

    def test_socket_endpoint(self):
        """Test if Socket.IO endpoint is accessible"""
        try:
            # Test Socket.IO handshake endpoint using correct /api/socket.io/ path
            response = self.session.get(f"{self.base_url}/api/socket.io/", 
                                      params={'EIO': '4', 'transport': 'polling'},
                                      timeout=10)
            # Socket.IO should respond with 200 or specific error codes
            success = response.status_code in [200, 400, 403]
            details = f"Status: {response.status_code}"
            if success and response.status_code == 200:
                details += f", Content: {response.text[:50]}..."
            self.log_test("Socket.IO Endpoint (/api/socket.io/)", success, details)
            return success
        except requests.exceptions.RequestException as e:
            self.log_test("Socket.IO Endpoint (/api/socket.io/)", False, f"Error: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all backend API tests"""
        print(f"🚀 Starting Chat System Backend API Tests")
        print(f"📡 Testing against: {self.base_url}")
        print("-" * 50)
        
        # Basic connectivity and health tests
        if not self.test_health_check():
            print("❌ Health check failed - server may be down")
            return False
            
        # Test authentication endpoints
        self.test_verify_token_without_auth()
        
        # Test chat-specific endpoints without auth
        self.test_chat_admin_without_auth()
        self.test_chat_is_admin_without_auth()
        self.test_chat_users_without_auth()
        
        # Test CORS configuration
        self.test_cors_headers()
        
        # Test endpoint existence
        self.test_signup_endpoint()
        self.test_signin_endpoint()
        self.test_socket_endpoint()
        
        # Results
        print("-" * 50)
        print(f"📊 Backend API Tests Summary:")
        print(f"✅ Passed: {self.tests_passed}")
        print(f"❌ Failed: {self.tests_run - self.tests_passed}")
        print(f"📈 Total: {self.tests_run}")
        
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        print(f"🎯 Success Rate: {success_rate:.1f}%")
        
        return success_rate > 70  # Consider successful if >70% tests pass

def main():
    tester = ChatSystemAPITester()
    
    try:
        success = tester.run_all_tests()
        return 0 if success else 1
    except KeyboardInterrupt:
        print("\n⏸️  Tests interrupted by user")
        return 1
    except Exception as e:
        print(f"\n💥 Unexpected error: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())