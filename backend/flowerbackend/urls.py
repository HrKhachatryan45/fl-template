from django.urls import path, include
from django.contrib import admin

urlpatterns = [
    path('admin/', admin.site.urls)
]
from django.contrib import admin
from django.urls import path, include
from flowers import template_views

urlpatterns = [
    # Django admin
    path('django-admin/', admin.site.urls),
    
    # Template views (main site)
    path('', template_views.home, name='home'),
    path('products/', template_views.products, name='products'),
    path('product/<uuid:product_id>/', template_views.product_detail, name='product_detail'),
    path('cart/', template_views.cart, name='cart'),
    path('cart/add/<uuid:product_id>/', template_views.add_to_cart, name='add_to_cart'),
    path('cart/update/<uuid:product_id>/', template_views.update_cart, name='update_cart'),
    path('cart/remove/<uuid:product_id>/', template_views.remove_from_cart, name='remove_from_cart'),
    path('cart/clear/', template_views.clear_cart, name='clear_cart'),
    path('checkout/', template_views.checkout, name='checkout'),
    path('contact/', template_views.contact, name='contact'),
    
    # Admin views
    path('admin/', template_views.admin_login_view, name='admin_login'),
    path('admin/dashboard/', template_views.admin_dashboard, name='admin_dashboard'),
    path('admin/logout/', template_views.admin_logout, name='admin_logout'),
    
]