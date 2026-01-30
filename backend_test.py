#!/usr/bin/env python3
"""
Comprehensive backend testing for Django REST API flower e-commerce platform
Tests all public and admin endpoints with proper authentication
"""

import requests
import json
import sys
import os
from datetime import datetime

# Get backend URL from frontend .env file
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except FileNotFoundError:
        pass
    return "http://localhost:8001"

BASE_URL = get_backend_url()
API_URL = f"{BASE_URL}/api"

class FlowerAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.admin_token = None
        self.test_results = []
        self.created_flower_id = None
        
    def log_test(self, test_name, success, message="", response_data=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if message:
            print(f"    {message}")
        if response_data and not success:
            print(f"    Response: {response_data}")
        
        self.test_results.append({
            'test': test_name,
            'success': success,
            'message': message,
            'timestamp': datetime.now().isoformat()
        })
        print()

    def test_health_check(self):
        """Test health check endpoint"""
        try:
            response = self.session.get(f"{API_URL}/health/")
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'healthy':
                    self.log_test("Health Check", True, f"Status: {data.get('message', 'OK')}")
                    return True
                else:
                    self.log_test("Health Check", False, f"Unexpected response: {data}")
                    return False
            else:
                self.log_test("Health Check", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Health Check", False, f"Connection error: {str(e)}")
            return False

    def test_public_flower_list(self):
        """Test public flower listing endpoint"""
        try:
            response = self.session.get(f"{API_URL}/flowers/")
            if response.status_code == 200:
                data = response.json()
                
                # Check if it's paginated response or direct list
                if isinstance(data, dict) and 'results' in data:
                    flowers = data['results']
                    count = data.get('count', len(flowers))
                elif isinstance(data, list):
                    flowers = data
                    count = len(flowers)
                else:
                    self.log_test("Public Flower List", False, f"Unexpected response format: {type(data)}")
                    return False, []
                
                if len(flowers) >= 10:
                    # Verify flower structure
                    flower = flowers[0]
                    required_fields = ['id', 'name', 'price_amd', 'currency', 'description', 'category', 'colors', 'images']
                    missing_fields = [field for field in required_fields if field not in flower]
                    
                    if missing_fields:
                        self.log_test("Public Flower List", False, f"Missing fields: {missing_fields}")
                        return False, []
                    
                    # Check images structure
                    if flower['images'] and len(flower['images']) > 0:
                        image = flower['images'][0]
                        if 'url' not in image or 'is_main' not in image:
                            self.log_test("Public Flower List", False, "Image structure invalid")
                            return False, []
                    
                    self.log_test("Public Flower List", True, f"Found {count} flowers with correct structure")
                    return True, flowers
                else:
                    self.log_test("Public Flower List", False, f"Expected at least 10 flowers, got {len(flowers)}")
                    return False, []
            else:
                self.log_test("Public Flower List", False, f"HTTP {response.status_code}: {response.text}")
                return False, []
        except Exception as e:
            self.log_test("Public Flower List", False, f"Error: {str(e)}")
            return False, []

    def test_flower_filtering(self, flowers):
        """Test flower filtering capabilities"""
        if not flowers:
            self.log_test("Flower Filtering", False, "No flowers available for filtering tests")
            return False
        
        # Test category filtering
        try:
            # Get a category from existing flowers
            categories = list(set(flower['category'] for flower in flowers if flower['category']))
            if categories:
                test_category = categories[0]
                response = self.session.get(f"{API_URL}/flowers/?category={test_category}")
                if response.status_code == 200:
                    data = response.json()
                    filtered_flowers = data['results'] if isinstance(data, dict) and 'results' in data else data
                    
                    # Verify all returned flowers have the requested category
                    if all(flower['category'].lower() == test_category.lower() for flower in filtered_flowers):
                        self.log_test("Category Filtering", True, f"Successfully filtered by category '{test_category}' - {len(filtered_flowers)} results")
                    else:
                        self.log_test("Category Filtering", False, "Some flowers don't match the category filter")
                        return False
                else:
                    self.log_test("Category Filtering", False, f"HTTP {response.status_code}")
                    return False
            
            # Test price range filtering
            response = self.session.get(f"{API_URL}/flowers/?min_price=10000&max_price=20000")
            if response.status_code == 200:
                data = response.json()
                filtered_flowers = data['results'] if isinstance(data, dict) and 'results' in data else data
                
                # Verify all flowers are within price range
                valid_prices = all(
                    10000 <= float(flower['price_amd']) <= 20000 
                    for flower in filtered_flowers
                )
                if valid_prices:
                    self.log_test("Price Range Filtering", True, f"Successfully filtered by price range - {len(filtered_flowers)} results")
                else:
                    self.log_test("Price Range Filtering", False, "Some flowers outside price range")
                    return False
            else:
                self.log_test("Price Range Filtering", False, f"HTTP {response.status_code}")
                return False
            
            # Test color filtering
            colors = []
            for flower in flowers:
                if flower['colors']:
                    colors.extend(flower['colors'])
            
            if colors:
                test_color = colors[0]
                response = self.session.get(f"{API_URL}/flowers/?color={test_color}")
                if response.status_code == 200:
                    data = response.json()
                    filtered_flowers = data['results'] if isinstance(data, dict) and 'results' in data else data
                    
                    # Verify all returned flowers have the requested color
                    valid_colors = all(
                        test_color in flower['colors'] 
                        for flower in filtered_flowers
                    )
                    if valid_colors:
                        self.log_test("Color Filtering", True, f"Successfully filtered by color '{test_color}' - {len(filtered_flowers)} results")
                    else:
                        self.log_test("Color Filtering", False, "Some flowers don't have the requested color")
                        return False
                else:
                    self.log_test("Color Filtering", False, f"HTTP {response.status_code}")
                    return False
            
            return True
            
        except Exception as e:
            self.log_test("Flower Filtering", False, f"Error: {str(e)}")
            return False

    def test_flower_detail(self, flowers):
        """Test single flower detail endpoint"""
        if not flowers:
            self.log_test("Flower Detail", False, "No flowers available for detail test")
            return False
        
        try:
            flower_id = flowers[0]['id']
            response = self.session.get(f"{API_URL}/flowers/{flower_id}/")
            
            if response.status_code == 200:
                flower = response.json()
                
                # Verify detailed structure
                required_fields = ['id', 'name', 'price_amd', 'currency', 'description', 'category', 'colors', 'images']
                missing_fields = [field for field in required_fields if field not in flower]
                
                if missing_fields:
                    self.log_test("Flower Detail", False, f"Missing fields: {missing_fields}")
                    return False
                
                if flower['id'] == flower_id:
                    self.log_test("Flower Detail", True, f"Successfully retrieved flower '{flower['name']}'")
                    return True
                else:
                    self.log_test("Flower Detail", False, "Returned flower ID doesn't match requested ID")
                    return False
            else:
                self.log_test("Flower Detail", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Flower Detail", False, f"Error: {str(e)}")
            return False

    def test_admin_login(self):
        """Test admin authentication"""
        try:
            login_data = {
                "username": "admin",
                "password": "Admin123!"
            }
            
            response = self.session.post(
                f"{API_URL}/admin/login/",
                json=login_data,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if 'access' in data and 'refresh' in data:
                    self.admin_token = data['access']
                    
                    # Verify user info
                    user_info = data.get('user', {})
                    if user_info.get('username') == 'admin' and user_info.get('is_staff'):
                        self.log_test("Admin Login", True, f"Successfully logged in as {user_info['username']}")
                        return True
                    else:
                        self.log_test("Admin Login", False, "Invalid user info in response")
                        return False
                else:
                    self.log_test("Admin Login", False, "Missing access or refresh token")
                    return False
            else:
                self.log_test("Admin Login", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Admin Login", False, f"Error: {str(e)}")
            return False

    def test_admin_endpoints_without_auth(self):
        """Test that admin endpoints require authentication"""
        try:
            # Test without token
            response = self.session.get(f"{API_URL}/admin/flowers/")
            
            if response.status_code == 401:
                self.log_test("Admin Auth Required", True, "Admin endpoints properly protected")
                return True
            else:
                self.log_test("Admin Auth Required", False, f"Expected 401, got {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Admin Auth Required", False, f"Error: {str(e)}")
            return False

    def test_admin_flower_list(self):
        """Test admin flower listing (includes inactive flowers)"""
        if not self.admin_token:
            self.log_test("Admin Flower List", False, "No admin token available")
            return False, []
        
        try:
            headers = {'Authorization': f'Bearer {self.admin_token}'}
            response = self.session.get(f"{API_URL}/admin/flowers/", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                flowers = data['results'] if isinstance(data, dict) and 'results' in data else data
                
                self.log_test("Admin Flower List", True, f"Retrieved {len(flowers)} flowers (including inactive)")
                return True, flowers
            else:
                self.log_test("Admin Flower List", False, f"HTTP {response.status_code}: {response.text}")
                return False, []
        except Exception as e:
            self.log_test("Admin Flower List", False, f"Error: {str(e)}")
            return False, []

    def test_create_flower(self):
        """Test creating a new flower"""
        if not self.admin_token:
            self.log_test("Create Flower", False, "No admin token available")
            return False
        
        try:
            flower_data = {
                "name": "Test Flower",
                "price_amd": 15000,
                "currency": "AMD",
                "description": "Test description for automated testing",
                "category": "test",
                "colors": ["red"],
                "is_free_delivery": False,
                "is_active": True,
                "images_data": [{
                    "url": "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&q=80",
                    "is_main": True
                }]
            }
            
            headers = {
                'Authorization': f'Bearer {self.admin_token}',
                'Content-Type': 'application/json'
            }
            
            response = self.session.post(
                f"{API_URL}/admin/flowers/",
                json=flower_data,
                headers=headers
            )
            
            if response.status_code == 201:
                created_flower = response.json()
                self.created_flower_id = created_flower['id']
                
                # Verify created flower data
                if (created_flower['name'] == flower_data['name'] and 
                    float(created_flower['price_amd']) == flower_data['price_amd']):
                    self.log_test("Create Flower", True, f"Successfully created flower '{created_flower['name']}' with ID {self.created_flower_id}")
                    return True
                else:
                    self.log_test("Create Flower", False, "Created flower data doesn't match input")
                    return False
            else:
                self.log_test("Create Flower", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Create Flower", False, f"Error: {str(e)}")
            return False

    def test_get_created_flower(self):
        """Test retrieving the created flower"""
        if not self.admin_token or not self.created_flower_id:
            self.log_test("Get Created Flower", False, "No admin token or created flower ID")
            return False
        
        try:
            headers = {'Authorization': f'Bearer {self.admin_token}'}
            response = self.session.get(
                f"{API_URL}/admin/flowers/{self.created_flower_id}/",
                headers=headers
            )
            
            if response.status_code == 200:
                flower = response.json()
                if flower['id'] == self.created_flower_id and flower['name'] == "Test Flower":
                    self.log_test("Get Created Flower", True, f"Successfully retrieved created flower")
                    return True
                else:
                    self.log_test("Get Created Flower", False, "Retrieved flower doesn't match expected data")
                    return False
            else:
                self.log_test("Get Created Flower", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Get Created Flower", False, f"Error: {str(e)}")
            return False

    def test_update_flower_price(self):
        """Test updating flower price"""
        if not self.admin_token or not self.created_flower_id:
            self.log_test("Update Flower Price", False, "No admin token or created flower ID")
            return False
        
        try:
            update_data = {"price_amd": 20000}
            headers = {
                'Authorization': f'Bearer {self.admin_token}',
                'Content-Type': 'application/json'
            }
            
            response = self.session.patch(
                f"{API_URL}/admin/flowers/{self.created_flower_id}/",
                json=update_data,
                headers=headers
            )
            
            if response.status_code == 200:
                updated_flower = response.json()
                if float(updated_flower['price_amd']) == 20000:
                    self.log_test("Update Flower Price", True, f"Successfully updated price to {updated_flower['price_amd']}")
                    return True
                else:
                    self.log_test("Update Flower Price", False, f"Price not updated correctly: {updated_flower['price_amd']}")
                    return False
            else:
                self.log_test("Update Flower Price", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Update Flower Price", False, f"Error: {str(e)}")
            return False

    def test_toggle_active_status(self):
        """Test toggling flower active status"""
        if not self.admin_token or not self.created_flower_id:
            self.log_test("Toggle Active Status", False, "No admin token or created flower ID")
            return False
        
        try:
            headers = {'Authorization': f'Bearer {self.admin_token}'}
            response = self.session.patch(
                f"{API_URL}/admin/flowers/{self.created_flower_id}/toggle-active/",
                headers=headers
            )
            
            if response.status_code == 200:
                updated_flower = response.json()
                # Should be False now (was True initially)
                if not updated_flower['is_active']:
                    self.log_test("Toggle Active Status", True, f"Successfully toggled active status to {updated_flower['is_active']}")
                    return True
                else:
                    self.log_test("Toggle Active Status", False, f"Active status not toggled correctly: {updated_flower['is_active']}")
                    return False
            else:
                self.log_test("Toggle Active Status", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Toggle Active Status", False, f"Error: {str(e)}")
            return False

    def test_delete_flower(self):
        """Test deleting the created flower"""
        if not self.admin_token or not self.created_flower_id:
            self.log_test("Delete Flower", False, "No admin token or created flower ID")
            return False
        
        try:
            headers = {'Authorization': f'Bearer {self.admin_token}'}
            response = self.session.delete(
                f"{API_URL}/admin/flowers/{self.created_flower_id}/",
                headers=headers
            )
            
            if response.status_code == 204:
                # Verify deletion by trying to get the flower
                get_response = self.session.get(
                    f"{API_URL}/admin/flowers/{self.created_flower_id}/",
                    headers=headers
                )
                if get_response.status_code == 404:
                    self.log_test("Delete Flower", True, "Successfully deleted flower")
                    return True
                else:
                    self.log_test("Delete Flower", False, "Flower still exists after deletion")
                    return False
            else:
                self.log_test("Delete Flower", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Delete Flower", False, f"Error: {str(e)}")
            return False

    def test_validation_errors(self):
        """Test validation error scenarios"""
        if not self.admin_token:
            self.log_test("Validation Tests", False, "No admin token available")
            return False
        
        headers = {
            'Authorization': f'Bearer {self.admin_token}',
            'Content-Type': 'application/json'
        }
        
        # Test missing required fields
        try:
            invalid_data = {"name": "Invalid Flower"}  # Missing required fields
            response = self.session.post(
                f"{API_URL}/admin/flowers/",
                json=invalid_data,
                headers=headers
            )
            
            if response.status_code == 400:
                self.log_test("Validation - Missing Fields", True, "Correctly rejected flower with missing fields")
            else:
                self.log_test("Validation - Missing Fields", False, f"Expected 400, got {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Validation - Missing Fields", False, f"Error: {str(e)}")
            return False
        
        # Test too many images
        try:
            too_many_images = {
                "name": "Too Many Images",
                "price_amd": 15000,
                "currency": "AMD",
                "description": "Test",
                "category": "test",
                "colors": ["red"],
                "is_free_delivery": False,
                "is_active": True,
                "images_data": [
                    {"url": "https://example.com/1.jpg", "is_main": True},
                    {"url": "https://example.com/2.jpg", "is_main": False},
                    {"url": "https://example.com/3.jpg", "is_main": False},
                    {"url": "https://example.com/4.jpg", "is_main": False},
                    {"url": "https://example.com/5.jpg", "is_main": False},
                    {"url": "https://example.com/6.jpg", "is_main": False}  # 6th image - should fail
                ]
            }
            
            response = self.session.post(
                f"{API_URL}/admin/flowers/",
                json=too_many_images,
                headers=headers
            )
            
            if response.status_code == 400:
                self.log_test("Validation - Too Many Images", True, "Correctly rejected flower with >5 images")
            else:
                self.log_test("Validation - Too Many Images", False, f"Expected 400, got {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Validation - Too Many Images", False, f"Error: {str(e)}")
            return False
        
        # Test no main image
        try:
            no_main_image = {
                "name": "No Main Image",
                "price_amd": 15000,
                "currency": "AMD",
                "description": "Test",
                "category": "test",
                "colors": ["red"],
                "is_free_delivery": False,
                "is_active": True,
                "images_data": [
                    {"url": "https://example.com/1.jpg", "is_main": False},
                    {"url": "https://example.com/2.jpg", "is_main": False}
                ]
            }
            
            response = self.session.post(
                f"{API_URL}/admin/flowers/",
                json=no_main_image,
                headers=headers
            )
            
            if response.status_code == 400:
                self.log_test("Validation - No Main Image", True, "Correctly rejected flower without main image")
                return True
            else:
                self.log_test("Validation - No Main Image", False, f"Expected 400, got {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Validation - No Main Image", False, f"Error: {str(e)}")
            return False

    def test_data_integrity(self):
        """Test data integrity requirements"""
        try:
            # Get public flowers to check initial count and structure
            response = self.session.get(f"{API_URL}/flowers/")
            if response.status_code != 200:
                self.log_test("Data Integrity", False, "Could not fetch flowers for integrity check")
                return False
            
            data = response.json()
            flowers = data['results'] if isinstance(data, dict) and 'results' in data else data
            
            # Check flower count (should be 10 initially)
            if len(flowers) >= 10:
                self.log_test("Data Integrity - Count", True, f"Found {len(flowers)} flowers (≥10 expected)")
            else:
                self.log_test("Data Integrity - Count", False, f"Only {len(flowers)} flowers found, expected ≥10")
                return False
            
            # Check all flowers have images
            flowers_without_images = [f for f in flowers if not f.get('images')]
            if not flowers_without_images:
                self.log_test("Data Integrity - Images", True, "All flowers have images")
            else:
                self.log_test("Data Integrity - Images", False, f"{len(flowers_without_images)} flowers without images")
                return False
            
            # Check exactly one main image per flower
            invalid_main_images = []
            for flower in flowers:
                main_images = [img for img in flower['images'] if img.get('is_main')]
                if len(main_images) != 1:
                    invalid_main_images.append(flower['name'])
            
            if not invalid_main_images:
                self.log_test("Data Integrity - Main Images", True, "All flowers have exactly one main image")
                return True
            else:
                self.log_test("Data Integrity - Main Images", False, f"Flowers with invalid main images: {invalid_main_images}")
                return False
                
        except Exception as e:
            self.log_test("Data Integrity", False, f"Error: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all tests in sequence"""
        print(f"🌸 Starting Django REST API Backend Tests")
        print(f"Backend URL: {BASE_URL}")
        print(f"API URL: {API_URL}")
        print("=" * 60)
        
        # 1. Health check
        if not self.test_health_check():
            print("❌ Health check failed - aborting tests")
            return False
        
        # 2. Public endpoints
        success, flowers = self.test_public_flower_list()
        if not success:
            print("❌ Public flower list failed - aborting tests")
            return False
        
        self.test_flower_filtering(flowers)
        self.test_flower_detail(flowers)
        
        # 3. Authentication tests
        self.test_admin_endpoints_without_auth()
        
        if not self.test_admin_login():
            print("❌ Admin login failed - skipping admin tests")
            return False
        
        # 4. Admin endpoints
        self.test_admin_flower_list()
        
        # 5. CRUD operations
        if self.test_create_flower():
            self.test_get_created_flower()
            self.test_update_flower_price()
            self.test_toggle_active_status()
            self.test_delete_flower()
        
        # 6. Validation tests
        self.test_validation_errors()
        
        # 7. Data integrity
        self.test_data_integrity()
        
        # Summary
        print("=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if total - passed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  • {result['test']}: {result['message']}")
        
        return passed == total

if __name__ == "__main__":
    tester = FlowerAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)