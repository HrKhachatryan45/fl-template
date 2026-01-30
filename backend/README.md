# Django REST API - Flower E-commerce Backend

## 🌸 Overview

Complete Django REST Framework backend for flower e-commerce platform with PostgreSQL database and Cloudinary image storage.

## 🚀 Tech Stack

- **Backend**: Django 5.2.10 + Django REST Framework 3.16.1
- **Database**: PostgreSQL 15
- **Authentication**: JWT (djangorestframework-simplejwt)
- **Image Storage**: Cloudinary
- **Server**: Gunicorn

## 📋 Database Schema

### Flower Model
```python
{
  "id": "uuid",                    # Primary key
  "name": "string",                # Flower name
  "price_amd": "decimal",          # Price in Armenian Dram
  "sale_price_amd": "decimal|null", # Optional sale price
  "currency": "AMD",               # Currency code
  "description": "text",           # Description
  "category": "string",            # Category
  "colors": ["string"],            # Array of colors
  "is_free_delivery": "boolean",   # Free delivery flag
  "is_active": "boolean",          # Active status
  "created_at": "datetime",        # Creation timestamp
  "updated_at": "datetime"         # Update timestamp
}
```

### FlowerImage Model
```python
{
  "url": "string",                 # Cloudinary image URL
  "is_main": "boolean"             # Main image flag (exactly one per flower)
}
```

## 🔗 API Endpoints

### Public Endpoints (No Authentication Required)

#### 1. Health Check
```bash
GET /api/health/
```
**Response:**
```json
{
  "status": "healthy",
  "message": "Flower Shop API is running"
}
```

#### 2. List All Flowers (Paginated)
```bash
GET /api/flowers/
```
**Query Parameters:**
- `page` - Page number (default: 1)
- `min_price` - Minimum price filter
- `max_price` - Maximum price filter
- `category` - Category filter
- `color` - Color filter

**Example:**
```bash
curl "http://localhost:8001/api/flowers/?category=վարդեր&min_price=10000"
```

**Response:**
```json
{
  "count": 10,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "uuid",
      "name": "Վարդերի Գեղեցկություն",
      "price_amd": "18000.00",
      "sale_price_amd": null,
      "currency": "AMD",
      "description": "...",
      "category": "վարդեր",
      "colors": ["կարմիր"],
      "images": [
        {
          "url": "https://...",
          "is_main": true
        }
      ],
      "is_free_delivery": false,
      "is_active": true,
      "created_at": "2026-01-27T17:09:27.366663Z",
      "updated_at": "2026-01-27T17:09:27.366667Z"
    }
  ]
}
```

#### 3. Get Single Flower
```bash
GET /api/flowers/{uuid}/
```

**Example:**
```bash
curl http://localhost:8001/api/flowers/bd65af61-e068-4243-8bb4-e7592e0fd427/
```

### Admin Endpoints (Authentication Required)

#### 1. Admin Login
```bash
POST /api/admin/login/
Content-Type: application/json

{
  "username": "admin",
  "password": "Admin123!"
}
```

**Response:**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIs...",
  "refresh": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@flowershop.am",
    "is_staff": true
  }
}
```

#### 2. Create Flower
```bash
POST /api/admin/flowers/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "New Flower",
  "price_amd": 15000,
  "sale_price_amd": null,
  "currency": "AMD",
  "description": "Beautiful flower",
  "category": "վարդեր",
  "colors": ["կարմիր", "վարդագույն"],
  "is_free_delivery": false,
  "is_active": true,
  "images_data": [
    {
      "url": "https://cloudinary.com/image.jpg",
      "is_main": true
    }
  ]
}
```

#### 3. Update Flower
```bash
PUT /api/admin/flowers/{uuid}/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Updated Flower",
  "price_amd": 20000,
  ...
}
```

#### 4. Partial Update
```bash
PATCH /api/admin/flowers/{uuid}/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "price_amd": 17000,
  "is_active": false
}
```

#### 5. Delete Flower
```bash
DELETE /api/admin/flowers/{uuid}/
Authorization: Bearer {access_token}
```

#### 6. Toggle Active Status
```bash
PATCH /api/admin/flowers/{uuid}/toggle-active/
Authorization: Bearer {access_token}
```

#### 7. Upload Image to Cloudinary
```bash
POST /api/admin/flowers/upload-image/
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

# Form data:
image: [file]
```

**Response:**
```json
{
  "url": "https://res.cloudinary.com/drbchtnzf/image/upload/v123/flowers/image.jpg",
  "public_id": "flowers/image"
}
```

## 🔐 Authentication

All admin endpoints require JWT authentication. Include the access token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## 🗄️ Database Setup

### PostgreSQL Configuration
```env
DB_NAME=flowerdb
DB_USER=floweruser
DB_PASSWORD=flowerpass123
DB_HOST=localhost
DB_PORT=5432
```

### Run Migrations
```bash
cd /app/backend
python manage.py makemigrations
python manage.py migrate
```

### Seed Initial Data
```bash
python manage.py seed_data
```

This creates:
- Admin user (username: admin, password: Admin123!)
- 10 flower products with Armenian names

## ☁️ Cloudinary Configuration

Add to `.env`:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 🔄 CORS Configuration

CORS is enabled for the React frontend. Configure allowed origins in `.env`:
```env
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
```

## 📦 Dependencies

See `requirements.txt`:
- Django==5.2.10
- djangorestframework==3.16.1
- psycopg2-binary==2.9.11
- django-cors-headers==4.9.0
- cloudinary==1.44.1
- djangorestframework-simplejwt==5.5.1
- python-dotenv==1.2.1
- Pillow==12.1.0
- django-filter==25.2
- gunicorn==23.0.0

## 🚦 Running the Server

The server runs automatically via supervisor on port 8001:
```bash
sudo supervisorctl status backend
sudo supervisorctl restart backend
```

Manual start (for development):
```bash
cd /app/backend
python manage.py runserver 0.0.0.0:8001
```

## 📝 Admin Panel

Django admin panel available at:
```
http://localhost:8001/admin/
Username: admin
Password: Admin123!
```

## 🧪 Testing Examples

### Test Health Check
```bash
curl http://localhost:8001/api/health/
```

### Test Flower Listing
```bash
curl http://localhost:8001/api/flowers/
```

### Test Admin Login
```bash
curl -X POST http://localhost:8001/api/admin/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "Admin123!"}'
```

### Test Authenticated Request
```bash
TOKEN="your_access_token_here"
curl http://localhost:8001/api/admin/flowers/ \
  -H "Authorization: Bearer $TOKEN"
```

### Test Filtering
```bash
# Filter by category
curl "http://localhost:8001/api/flowers/?category=վարդեր"

# Filter by price range
curl "http://localhost:8001/api/flowers/?min_price=10000&max_price=20000"

# Filter by color
curl "http://localhost:8001/api/flowers/?color=կարմիր"
```

## 📊 Seeded Flower Data

The database is seeded with 10 flowers:
1. Վարդերի Գեղեցկություն (Rose Elegance) - 18,000 AMD
2. Լավանդայի Երազանք (Lavender Dream) - 15,000 AMD
3. Արևածաղիկների Ուրախություն (Sunflower Joy) - 12,000 AMD
4. Վարդագույն Հմայք (Pink Charm) - 16,000 AMD
5. Սպիտակ Անմեղություն (White Purity) - 14,000 AMD
6. Վայրի Դաշտային Փունջ (Wild Meadow) - 13,000 AMD
7. Թագավորական Նուրբություն (Royal Elegance) - 25,000 AMD (sale: 22,000)
8. Գարնան Արթնացում (Spring Awakening) - 11,000 AMD
9. Օրխիդեայի Շքեղություն (Orchid Elegance) - 28,000 AMD (sale: 25,000)
10. Ռոմանտիկ Փունջ (Romantic Bouquet) - 17,000 AMD

## 🔧 Environment Variables

Required environment variables in `.env`:
```env
# Database
DB_NAME=flowerdb
DB_USER=floweruser
DB_PASSWORD=flowerpass123
DB_HOST=localhost
DB_PORT=5432

# Cloudinary
CLOUDINARY_CLOUD_NAME=drbchtnzf
CLOUDINARY_API_KEY=879428883237537
CLOUDINARY_API_SECRET=gakEZRjpJB2WVEiHutT-GpMRiDE

# Django
SECRET_KEY=your-secret-key
DEBUG=True

# CORS
CORS_ORIGINS=http://localhost:3000

# JWT
JWT_SECRET_KEY=your-jwt-secret
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

## 📁 Project Structure

```
backend/
├── flowerbackend/
│   ├── __init__.py
│   ├── settings.py       # Django settings
│   ├── urls.py          # Main URL configuration
│   ├── wsgi.py          # WSGI configuration
│   └── asgi.py          # ASGI configuration
├── flowers/
│   ├── __init__.py
│   ├── models.py        # Flower and FlowerImage models
│   ├── serializers.py   # DRF serializers
│   ├── views.py         # API views and viewsets
│   ├── urls.py          # App URL patterns
│   ├── admin.py         # Django admin configuration
│   ├── management/
│   │   └── commands/
│   │       └── seed_data.py  # Data seeding command
│   └── migrations/
├── manage.py
├── requirements.txt
├── .env
└── .env.example
```

## ✅ Features Implemented

- ✅ Complete Django REST API
- ✅ PostgreSQL database with proper schema
- ✅ JWT authentication for admin
- ✅ Cloudinary image storage integration
- ✅ Public API with pagination and filtering
- ✅ Admin CRUD operations
- ✅ 10 seeded flower products
- ✅ CORS configuration for React frontend
- ✅ Admin user (username: admin, password: Admin123!)
- ✅ Proper error handling
- ✅ Clean REST architecture
- ✅ Armenian language support

## 🔄 Next Steps for Frontend Integration

Update React frontend to use new Django endpoints:
1. Update API base URL to use Django backend
2. Implement JWT authentication flow
3. Update flower listing to use new data structure
4. Implement admin panel for CRUD operations
5. Add Cloudinary image upload in admin panel

## 📞 Support

For issues or questions, refer to Django and DRF documentation:
- Django: https://docs.djangoproject.com/
- DRF: https://www.django-rest-framework.org/
- Cloudinary: https://cloudinary.com/documentation
