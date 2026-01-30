from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create routers
public_router = DefaultRouter()
public_router.register(r'flowers', views.PublicFlowerViewSet, basename='flower')
public_router.register(r'orders', views.OrderViewSet, basename='order')

admin_router = DefaultRouter()
admin_router.register(r'flowers', views.AdminFlowerViewSet, basename='admin-flower')
admin_router.register(r'orders', views.OrderViewSet, basename='admin-order')

urlpatterns = [
    # Public endpoints
    path('', include(public_router.urls)),
    
    # Payment endpoints
    path('create-payment-intent/', views.create_payment_intent, name='create-payment-intent'),
    path('verify-payment/', views.verify_payment, name='verify-payment'),
    
    # Admin endpoints
    path('admin/login/', views.admin_login, name='admin-login'),
    path('admin/', include(admin_router.urls)),
    
    # Health check
    path('health/', views.health_check, name='health-check'),
     path('main-page/', views.MainPageContentView.as_view(), name='main-page'),
    path('main-page/upload-image/', views.MainPageImageUploadView.as_view(), name='main-page-upload-image'),
]
