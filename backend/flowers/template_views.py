"""
Template-based views for the flower shop.
This file contains all views that render HTML templates.
"""

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib import messages
from django.core.paginator import Paginator
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from datetime import datetime
from .models import Flower, FlowerImage, Order, OrderItem, MainPageContent
import json

# ==================== CONSTANTS ====================
CATEGORIES = [
    ('բոլորը', 'Բոլորը'),
    ('Վարդեր', 'Վարդեր'),
    ('Լիլիաներ', 'Լիլիաներ'),
    ('Տյուլիպաններ', 'Տյուլիպաններ'),
    ('Արևածաղիկներ', 'Արևածաղիկներ'),
    ('Խոլորձներ', 'Խոլորձներ'),
    ('Փունջեր', 'Փունջեր'),
    ('Խառը', 'Խառը'),
    ('Պրեմիում', 'Պրեմիում'),
]

COLORS = [
    ('բոլորը', 'Բոլորը'),
    ('Կարմիր', 'Կարմիր'),
    ('Վարդագույն', 'Վարդագույն'),
    ('Սպիտակ', 'Սպիտակ'),
    ('Դեղին', 'Դեղին'),
    ('Մանուշակագույն', 'Մանուշակագույն'),
    ('Բազմագույն', 'Բազմագույն'),
]


# ==================== HELPER FUNCTIONS ====================
def get_cart_context(request):
    """Helper function to get cart context for all views"""
    cart = request.session.get('cart', {})
    cart_items = []
    cart_total = 0
    cart_count = 0
    
    for flower_id, item_data in cart.items():
        try:
            flower = Flower.objects.get(id=flower_id, is_active=True)
            price = flower.sale_price_amd if flower.sale_price_amd else flower.price_amd
            quantity = item_data.get('quantity', 1)
            
            cart_items.append({
                'id': str(flower.id),
                'name': flower.name,
                'price': float(flower.price_amd),
                'sale_price': float(flower.sale_price_amd) if flower.sale_price_amd else None,
                'image': item_data.get('image', ''),
                'category': flower.category,
                'quantity': quantity,
                'subtotal': float(flower.price_amd) * quantity,
                'sale_subtotal': float(price) * quantity,
            })
            cart_total += float(price) * quantity
            cart_count += quantity
        except Flower.DoesNotExist:
            continue
    
    return {
        'cart_items': cart_items,
        'cart_total': cart_total,
        'cart_count': cart_count,
        'current_year': datetime.now().year
    }


# ==================== PUBLIC VIEWS ====================
def home(request):
    """Home page view"""
    main_content, _ = MainPageContent.objects.get_or_create(
        id='00000000-0000-0000-0000-000000000001'
    )
    
    featured_flowers = Flower.objects.filter(
        is_active=True, 
        to_be_on_main_page=True
    ).prefetch_related('images')[:4]
    
    context = {
        'main_content': main_content,
        'featured_flowers': featured_flowers,
    }
    context.update(get_cart_context(request))
    
    return render(request, 'home.html', context)


def products(request):
    """Products listing page"""
    flowers = Flower.objects.filter(is_active=True).prefetch_related('images')
    
    # Filters
    category = request.GET.get('category', 'բոլորը')
    color = request.GET.get('color', 'բոլորը')
    search_query = request.GET.get('search', '')
    
    if category and category != 'բոլորը':
        flowers = flowers.filter(category=category)
    
    if color and color != 'բոլորը':
        flowers = flowers.filter(colors__contains=[color])
    
    if search_query:
        flowers = flowers.filter(name__icontains=search_query)
    
    # Pagination
    paginator = Paginator(flowers, 21)
    page_number = request.GET.get('page', 1)
    flowers_page = paginator.get_page(page_number)
    
    context = {
        'flowers': flowers_page,
        'categories': CATEGORIES,
        'colors': COLORS,
        'category': category,
        'color': color,
        'search_query': search_query,
    }
    context.update(get_cart_context(request))
    
    return render(request, 'products.html', context)


def product_detail(request, product_id):
    """Product detail page"""
    product = get_object_or_404(
        Flower.objects.prefetch_related('images'), 
        id=product_id, 
        is_active=True
    )
    
    context = {
        'product': product,
    }
    context.update(get_cart_context(request))
    
    return render(request, 'product_detail.html', context)


def contact(request):
    """Contact page"""
    if request.method == 'POST':
        messages.success(request, 'Ձեր հաղորդագրությունը ուղարկված է')
        return redirect('contact')
    
    context = get_cart_context(request)
    return render(request, 'contact.html', context)


# ==================== CART VIEWS ====================
@require_http_methods(["POST"])
def add_to_cart(request, product_id):
    """Add product to cart"""
    try:
        flower = Flower.objects.get(id=product_id, is_active=True)
        quantity = int(request.POST.get('quantity', 1))
        
        cart = request.session.get('cart', {})
        main_image = flower.images.filter(is_main=True).first()
        image_url = main_image.image.url if main_image else ''
        
        if str(product_id) in cart:
            cart[str(product_id)]['quantity'] += quantity
        else:
            cart[str(product_id)] = {
                'quantity': quantity,
                'image': image_url,
            }
        
        request.session['cart'] = cart
        request.session.modified = True
        
        messages.success(request, f'{flower.name} ավելացվել է զամբյուղում')
    except Flower.DoesNotExist:
        messages.error(request, 'Ծաղիկը չի գտնվել')
    
    return redirect('cart')


def cart(request):
    """Shopping cart page"""
    context = get_cart_context(request)
    return render(request, 'cart.html', context)


@require_http_methods(["POST"])
def update_cart(request, product_id):
    """Update cart item quantity"""
    cart = request.session.get('cart', {})
    action = request.POST.get('action')
    
    if str(product_id) in cart:
        if action == 'increase':
            cart[str(product_id)]['quantity'] += 1
        elif action == 'decrease':
            cart[str(product_id)]['quantity'] -= 1
            if cart[str(product_id)]['quantity'] <= 0:
                del cart[str(product_id)]
        
        request.session['cart'] = cart
        request.session.modified = True
    
    return redirect('cart')


@require_http_methods(["POST"])
def remove_from_cart(request, product_id):
    """Remove item from cart"""
    cart = request.session.get('cart', {})
    
    if str(product_id) in cart:
        del cart[str(product_id)]
        request.session['cart'] = cart
        request.session.modified = True
        messages.success(request, 'Ապրանքը հեռացվել է զամբյուղից')
    
    return redirect('cart')


@require_http_methods(["POST"])
def clear_cart(request):
    """Clear entire cart"""
    request.session['cart'] = {}
    request.session.modified = True
    messages.success(request, 'Զամբյուղը մաքրված է')
    
    return redirect('cart')


def checkout(request):
    """Checkout page"""
    cart_context = get_cart_context(request)
    
    # Handle buy now
    buy_now_id = request.GET.get('buy_now')
    buy_now_quantity = int(request.GET.get('quantity', 1))
    
    if buy_now_id:
        try:
            flower = Flower.objects.get(id=buy_now_id, is_active=True)
            price = flower.sale_price_amd if flower.sale_price_amd else flower.price_amd
            main_image = flower.images.filter(is_main=True).first()
            
            cart_context['cart_items'] = [{
                'id': str(flower.id),
                'name': flower.name,
                'price': float(flower.price_amd),
                'sale_price': float(flower.sale_price_amd) if flower.sale_price_amd else None,
                'image': main_image.image.url if main_image else '',
                'category': flower.category,
                'quantity': buy_now_quantity,
                'subtotal': float(flower.price_amd) * buy_now_quantity,
                'sale_subtotal': float(price) * buy_now_quantity,
            }]
            cart_context['cart_total'] = float(price) * buy_now_quantity
            cart_context['is_buy_now'] = True
        except Flower.DoesNotExist:
            return redirect('cart')
    
    if not cart_context['cart_items']:
        return redirect('cart')
    
    # Handle POST - create order
    if request.method == 'POST':
        try:
            order = Order.objects.create(
                customer_name=request.POST.get('fullName'),
                customer_email=request.POST.get('email', ''),
                customer_phone=request.POST.get('phone'),
                delivery_city=request.POST.get('city'),
                delivery_address=request.POST.get('address'),
                delivery_notes=request.POST.get('notes', ''),
                bacik_erktox=request.POST.get('bacik_erktox', ''),
                payment_method=request.POST.get('paymentMethod', 'cash'),
                total_amount_amd=cart_context['cart_total'],
                status='pending'
            )
            
            # Create order items
            for item in cart_context['cart_items']:
                flower = Flower.objects.get(id=item['id'])
                price = flower.sale_price_amd if flower.sale_price_amd else flower.price_amd
                
                OrderItem.objects.create(
                    order=order,
                    flower=flower,
                    flower_name=flower.name,
                    flower_image_url=item['image'],
                    price_amd_at_purchase=price,
                    quantity=item['quantity']
                )
            
            if not buy_now_id:
                request.session['cart'] = {}
                request.session.modified = True
            
            messages.success(request, 'Պատվերը հաջողությամբ ընդունված է')
            return redirect('home')
            
        except Exception as e:
            messages.error(request, f'Սխալ: {str(e)}')
    
    return render(request, 'checkout.html', cart_context)


# ==================== AUTHENTICATION VIEWS ====================
def admin_login_view(request):
    """Admin login page"""
    if request.user.is_authenticated and request.user.is_staff:
        return redirect('admin_dashboard')
    
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        user = authenticate(request, username=username, password=password)
        
        if user is not None and user.is_staff:
            login(request, user)
            messages.success(request, 'Հաջող մուտք')
            return redirect('admin_dashboard')
        else:
            messages.error(request, 'Սխալ օգտագործողի անուն կամ գաղտնաբառ')
    
    context = get_cart_context(request)
    return render(request, 'admin_login.html', context)


def is_staff(user):
    """Helper function to check if user is staff"""
    return user.is_staff


@login_required
@user_passes_test(is_staff)
def admin_logout(request):
    """Admin logout"""
    logout(request)
    messages.success(request, 'Դուք դուրս եք եկել')
    return redirect('admin_login')


# ==================== ADMIN DASHBOARD VIEW ====================
@login_required
@user_passes_test(is_staff)
def admin_dashboard(request):
    """
    Admin dashboard template view.
    Displays all flowers, orders, and main page content.
    
    GET: Display dashboard
    POST: Handle forms (add/edit flower, update order status, update main page)
    """
    # Get all flowers
    flowers = Flower.objects.all().prefetch_related('images').order_by('-created_at')
    
    # Get all orders
    orders = Order.objects.all().prefetch_related('items__flower').order_by('-created_at')
    
    # Get main page content
    main_content, _ = MainPageContent.objects.get_or_create(
        id='00000000-0000-0000-0000-000000000001'
    )
    
    # Handle POST requests
    if request.method == 'POST':
        action = request.POST.get('action')
        
        # ==================== FLOWER OPERATIONS ====================
        if action == 'add_flower':
            """Add a new flower"""
            try:
                name = request.POST.get('name')
                price_amd = request.POST.get('price_amd')
                category = request.POST.get('category')
                description = request.POST.get('description')
                sale_price_amd = request.POST.get('sale_price_amd')
                is_free_delivery = request.POST.get('is_free_delivery') == 'on'
                to_be_on_main_page = request.POST.get('to_be_on_main_page') == 'on'
                colors_str = request.POST.get('colors', '')
                colors = [c.strip() for c in colors_str.split(',') if c.strip()] if colors_str else []
                
                # Validate required fields
                if not all([name, price_amd, category, description]):
                    messages.error(request, 'Խնդրում ենք լրացնել բոլոր պարտադիր դաշտերը')
                    return redirect('admin_dashboard')
                
                # Create flower
                flower = Flower.objects.create(
                    name=name,
                    price_amd=int(price_amd),
                    sale_price_amd=int(sale_price_amd) if sale_price_amd else None,
                    category=category,
                    description=description,
                    colors=colors,
                    is_free_delivery=is_free_delivery,
                    to_be_on_main_page=to_be_on_main_page,
                    is_active=True
                )
                
                # Handle image uploads
                images = request.FILES.getlist('images')
                for index, image in enumerate(images):
                    is_main = index == 0  # First image is main
                    FlowerImage.objects.create(
                        flower=flower,
                        image=image,
                        is_main=is_main
                    )
                
                messages.success(request, f'Ծաղիկ "{name}" հաջողությամբ ավելացված է')
                
            except Exception as e:
                messages.error(request, f'Սխալ ծաղիկ ավելացնելիս: {str(e)}')
        
        
        elif action == 'delete_flower':
            """Delete a flower"""
            try:
                flower_id = request.POST.get('flower_id')
                flower = Flower.objects.get(id=flower_id)
                flower_name = flower.name
                flower.delete()
                messages.success(request, f'Ծաղիկ "{flower_name}" հաջողությամբ հեռացված է')
            except Flower.DoesNotExist:
                messages.error(request, 'Ծաղիկը չի գտնվել')
            except Exception as e:
                messages.error(request, f'Սխալ հեռացնելիս: {str(e)}')
        
        elif action == 'edit_flower':
            flower = Flower.objects.get(id=request.POST.get('flower_id'))
            flower.name = request.POST.get('name')
            flower.price_amd = request.POST.get('price_amd')
            flower.sale_price_amd = request.POST.get('sale_price_amd') or None
            flower.category = request.POST.get('category')
            flower.description = request.POST.get('description')
            flower.colors = [c.strip() for c in (request.POST.get('colors') or '').split(',') if c.strip()]
            flower.is_free_delivery = request.POST.get('is_free_delivery') == 'on'
            flower.to_be_on_main_page = request.POST.get('to_be_on_main_page') == 'on'
            flower.save()
        
        # ==================== ORDER OPERATIONS ====================
        elif action == 'update_order_status':
            """Update order status"""
            try:
                order_id = request.POST.get('order_id')
                new_status = request.POST.get('status')
                
                order = Order.objects.get(id=order_id)
                
                # Validate status
                valid_statuses = [choice[0] for choice in Order.STATUS_CHOICES]
                if new_status not in valid_statuses:
                    messages.error(request, 'Անվալիդ կարգավիճակ')
                    return redirect('admin_dashboard')
                
                order.status = new_status
                order.save()
                messages.success(request, f'Պատվեր #{order_id} կարգավիճակ թարմացված է')
                
            except Order.DoesNotExist:
                messages.error(request, 'Պատվերը չի գտնվել')
            except Exception as e:
                messages.error(request, f'Սխալ թարմացնելիս: {str(e)}')
        
        
        # ==================== MAIN PAGE OPERATIONS ====================
        elif action == 'update_main_page':
            """Update main page content"""
            try:
                main_content.title = request.POST.get('title', '')
                main_content.subtitle = request.POST.get('subtitle', '')
                main_content.description = request.POST.get('description', '')
                main_content.special_offer = request.POST.get('special_offer', '')
                main_content.extra_text = request.POST.get('extra_text', '')
                
                # Handle image upload
                if 'main_image' in request.FILES:
                    main_content.main_image = request.FILES['main_image']
                
                main_content.save()
                messages.success(request, 'Main page բովանդակությունը հաջողությամբ թարմացված է')
                
            except Exception as e:
                messages.error(request, f'Սխալ թարմացնելիս: {str(e)}')
        
        return redirect('admin_dashboard')
    
    # GET request - display dashboard
    context = {
        'flowers': flowers,
        'orders': orders,
        'main_content': main_content,
    }
    context.update(get_cart_context(request))
    
    return render(request, 'admin_dashboard.html', context)