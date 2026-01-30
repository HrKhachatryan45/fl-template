from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib import messages
from django.core.paginator import Paginator
from django.http import JsonResponse
from datetime import datetime
from .models import Flower, FlowerImage, Order, OrderItem, MainPageContent
import json

# Categories and colors for filters
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


def get_cart_context(request):
    """Helper function to get cart context"""
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


def home(request):
    """Home page view"""
    # Get main page content
    main_content, _ = MainPageContent.objects.get_or_create(
        id='00000000-0000-0000-0000-000000000001'
    )
    
    # Get featured flowers
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


def add_to_cart(request, product_id):
    """Add product to cart"""
    if request.method == 'POST':
        try:
            flower = Flower.objects.get(id=product_id, is_active=True)
            quantity = int(request.POST.get('quantity', 1))
            
            # Get or create cart
            cart = request.session.get('cart', {})
            
            # Get main image
            main_image = flower.images.filter(is_main=True).first()
            image_url = main_image.url if main_image else ''
            
            # Add or update item
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


def update_cart(request, product_id):
    """Update cart item quantity"""
    if request.method == 'POST':
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


def remove_from_cart(request, product_id):
    """Remove item from cart"""
    if request.method == 'POST':
        cart = request.session.get('cart', {})
        
        if str(product_id) in cart:
            del cart[str(product_id)]
            request.session['cart'] = cart
            request.session.modified = True
            messages.success(request, 'Ապրանքը հեռացվել է զամբյուղից')
    
    return redirect('cart')


def clear_cart(request):
    """Clear entire cart"""
    if request.method == 'POST':
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
                'image': main_image.url if main_image else '',
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
            # Create order
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
            
            # Clear cart if not buy now
            if not buy_now_id:
                request.session['cart'] = {}
                request.session.modified = True
            
            messages.success(request, 'Պատվերը հաջողությամբ ընդունված է')
            return redirect('home')
            
        except Exception as e:
            messages.error(request, f'Սխալ: {str(e)}')
    
    return render(request, 'checkout.html', cart_context)


def contact(request):
    """Contact page"""
    if request.method == 'POST':
        # Handle contact form submission
        messages.success(request, 'Ձեր հաղորդագրությունը ուղարկված է')
        return redirect('contact')
    
    context = get_cart_context(request)
    return render(request, 'contact.html', context)


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
    return user.is_staff


@login_required
@user_passes_test(is_staff)
def admin_dashboard(request):
    """Admin dashboard"""
    # Get all flowers
    flowers = Flower.objects.all().prefetch_related('images')
    
    # Get all orders
    orders = Order.objects.all().prefetch_related('items__flower').order_by('-created_at')
    
    # Get main page content
    main_content, _ = MainPageContent.objects.get_or_create(
        id='00000000-0000-0000-0000-000000000001'
    )
    
    context = {
        'flowers': flowers,
        'orders': orders,
        'main_content': main_content,
    }
    context.update(get_cart_context(request))
    
    return render(request, 'admin_dashboard.html', context)


@login_required
@user_passes_test(is_staff)
def admin_logout(request):
    """Admin logout"""
    logout(request)
    messages.success(request, 'Դուք դուրս եք եկել')
    return redirect('admin_login')
