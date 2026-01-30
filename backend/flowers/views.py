# from rest_framework import viewsets, status, filters
# from .utils import send_order_email
# from rest_framework.decorators import action, api_view, permission_classes
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
# from rest_framework_simplejwt.tokens import RefreshToken
# from django_filters.rest_framework import DjangoFilterBackend
# from django.db.models import Q
# from django.conf import settings
# import cloudinary.uploader
# import stripe
# import os

# from .models import Flower, FlowerImage, Order, OrderItem
# from .serializers import (
#     FlowerListSerializer,
#     FlowerDetailSerializer,
#     FlowerCreateUpdateSerializer,
#     AdminLoginSerializer,
#     OrderSerializer,
#     OrderCreateSerializer
# )


# # Configure Stripe
# stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')



# from rest_framework.pagination import PageNumberPagination
# from rest_framework.response import Response
# import math

# class StandardResultsSetPagination(PageNumberPagination):
#     page_size = 21
#     page_size_query_param = 'page_size'

#     def get_paginated_response(self, data):
#         total_pages = math.ceil(self.page.paginator.count / self.page_size)

#         return Response({
#             'count': self.page.paginator.count,
#             'total_pages': total_pages,
#             'current_page': self.page.number,
#             'next': self.get_next_link(),
#             'previous': self.get_previous_link(),
#             'results': data,
#         })

# class FlowerFilter:
#     """Custom filter for flowers"""
#     @staticmethod
#     def filter_queryset(queryset, request):
#         min_price = request.query_params.get('search')

#         # Filter by price range
#         min_price = request.query_params.get('min_price')
#         max_price = request.query_params.get('max_price')
#         if min_price:
#             queryset = queryset.filter(price_amd__gte=min_price)
#         if max_price:
#             queryset = queryset.filter(price_amd__lte=max_price)
        

#         search = request.query_params.get('search')
        
#         if search:
#             queryset = queryset.filter(name__icontains=search)

#         # Filter by category
#         category = request.query_params.get('category')
#         if category:
#             queryset = queryset.filter(category__iexact=category)
        
#         # Filter by color
#         color = request.query_params.get('color')
#         if color:
#             queryset = queryset.filter(colors__contains=[color])
        
#         # Filter by active status (default to only active for public)
#         if not request.user.is_authenticated or not request.user.is_staff:
#             queryset = queryset.filter(is_active=True)
        
#         return queryset

# from rest_framework.decorators import action
# from rest_framework.response import Response
# from rest_framework import status

# class PublicFlowerViewSet(viewsets.ReadOnlyModelViewSet):
#     """
#     Public API for flowers - read-only access
#     GET /api/flowers/ - List all active flowers with filtering
#     GET /api/flowers/<uuid>/ - Get single flower detail
#     """
#     permission_classes = [AllowAny]
#     serializer_class = FlowerListSerializer
#     lookup_field = 'id'

#     def get_queryset(self):
#         queryset = Flower.objects.filter(is_active=True).prefetch_related('images')
#         queryset = FlowerFilter.filter_queryset(queryset, self.request)
#         return queryset

#     def get_serializer_class(self):
#         if self.action == 'retrieve':
#             return FlowerDetailSerializer
#         return FlowerListSerializer

#     # -----------------------------
#     # Custom featured endpoint
#     # -----------------------------
#     @action(detail=False, methods=['get'], url_path='featured')
#     def featured(self, request):
#         """
#         GET /api/flowers/featured/ - List flowers marked for main page
#         """
#         queryset = Flower.objects.filter(is_active=True, to_be_on_main_page=True).prefetch_related('images')
#         page = self.paginate_queryset(queryset)
#         if page is not None:
#             serializer = self.get_serializer(page, many=True)
#             return self.get_paginated_response(serializer.data)

#         serializer = self.get_serializer(queryset, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)
    
# from django.db import transaction

# class AdminFlowerViewSet(viewsets.ModelViewSet):
#     """
#     Admin API for flowers - full CRUD access
#     Requires JWT authentication and admin privileges
    
#     POST /api/admin/flowers/ - Create flower
#     GET /api/admin/flowers/ - List all flowers
#     GET /api/admin/flowers/<uuid>/ - Get flower detail
#     PUT /api/admin/flowers/<uuid>/ - Update flower
#     PATCH /api/admin/flowers/<uuid>/ - Partial update
#     DELETE /api/admin/flowers/<uuid>/ - Delete flower
#     PATCH /api/admin/flowers/<uuid>/toggle-active/ - Toggle active status
#     """
#     permission_classes = [IsAuthenticated, IsAdminUser]
#     serializer_class = FlowerCreateUpdateSerializer
#     queryset = Flower.objects.all().prefetch_related('images')
#     lookup_field = 'id'

#     def get_queryset(self):
#         queryset = Flower.objects.all().prefetch_related('images')
#         queryset = FlowerFilter.filter_queryset(queryset, self.request)
#         return queryset

#     @action(detail=True, methods=['patch'], url_path='toggle-active')
#     def toggle_active(self, request, id=None):
#         """Toggle the is_active status of a flower"""
#         flower = self.get_object()
#         flower.is_active = not flower.is_active
#         flower.save()
#         serializer = self.get_serializer(flower)
#         return Response(serializer.data)

#     @action(detail=False, methods=['post'], url_path='upload-image')
#     def upload_image(self, request):
#         """
#         Upload image to Cloudinary
#         POST /api/admin/flowers/upload-image/
#         Body: multipart/form-data with 'image' field
#         """
#         if 'image' not in request.FILES:
#             return Response(
#                 {'error': 'No image provided'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         image = request.FILES['image']
        
#         try:
#             # Upload to Cloudinary
#             upload_result = cloudinary.uploader.upload(
#                 image,
#                 folder='flowers',
#                 resource_type='image'
#             )
            
#             return Response({
#                 'url': upload_result['secure_url'],
#                 'public_id': upload_result['public_id']
#             }, status=status.HTTP_200_OK)
        
#         except Exception as e:
#             return Response(
#                 {'error': str(e)},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )
#     @action(detail=False, methods=['post'], url_path='bulk-upsert')
#     def bulk_upsert(self, request):
#         """
#         POST /api/admin/flowers/bulk-upsert/
#         """
#         items = request.data.get("items")

#         if not isinstance(items, list):
#             return Response(
#                 {"error": "items must be a list"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         results = []

#         with transaction.atomic():
#             for item in items:
#                 images = item.pop("images", [])

#                 flower_id = item.get("id")
#                 if flower_id:
#                     flower = Flower.objects.get(id=flower_id)
#                     serializer = FlowerCreateUpdateSerializer(
#                         flower, data=item, partial=True
#                     )
#                 else:
#                     serializer = FlowerCreateUpdateSerializer(data=item)

#                 serializer.is_valid(raise_exception=True)
#                 flower = serializer.save()

#                 if images:
#                     FlowerImage.objects.filter(flower=flower).delete()

#                     for index, img in enumerate(images):
#                         FlowerImage.objects.create(
#                             flower=flower,
#                             url=img["url"],
#                             is_main=img.get("is_main", index == 0)
#                         )

#                 results.append(flower.id)

#         return Response(
#             {"processed": len(results), "ids": results},
#             status=status.HTTP_200_OK
#         )

# @api_view(['POST'])
# @permission_classes([AllowAny])
# def admin_login(request):
#     """
#     Admin login endpoint
#     POST /api/admin/login/
#     Body: {"username": "admin", "password": "password"}
#     Returns: {"access": "token", "refresh": "token"}
#     """
#     serializer = AdminLoginSerializer(data=request.data)
#     if serializer.is_valid():
#         user = serializer.validated_data['user']
#         refresh = RefreshToken.for_user(user)
        
#         return Response({
#             'access': str(refresh.access_token),
#             'refresh': str(refresh),
#             'user': {
#                 'id': user.id,
#                 'username': user.username,
#                 'email': user.email,
#                 'is_staff': user.is_staff
#             }
#         }, status=status.HTTP_200_OK)
    
#     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# @api_view(['GET'])
# @permission_classes([AllowAny])
# def health_check(request):
#     """Health check endpoint"""
#     return Response({
#         'status': 'healthy',
#         'message': 'Flower Shop API is running'
#     })



# class OrderViewSet(viewsets.ModelViewSet):
#     """
#     API for managing orders
#     POST /api/orders/ - Create new order (public)
#     GET /api/admin/orders/ - List all orders (admin only)
#     GET /api/admin/orders/<uuid>/ - Get order detail (admin only)
#     """
#     serializer_class = OrderSerializer
#     queryset = Order.objects.all().prefetch_related('items__flower')
#     lookup_field = 'id'
    
#     def get_permissions(self):
#         """Allow public access for create, require auth for other actions"""
#         if self.action == 'create':
#             return [AllowAny()]
#         return [IsAuthenticated(), IsAdminUser()]
    
#     def get_serializer_class(self):
#         if self.action == 'create':
#             return OrderCreateSerializer
#         return OrderSerializer
    
#     def create(self, request, *args, **kwargs):
#         """Create a new order"""
#         print(request.data,234)
#         serializer = self.get_serializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         order = serializer.save()

#         # Return the created order with full details
#         response_serializer = OrderSerializer(order)

#         send_order_email(order.customer_email, order)

#         return Response(response_serializer.data, status=status.HTTP_201_CREATED)


# @api_view(['POST'])
# @permission_classes([AllowAny])
# def create_payment_intent(request):
#     """
#     Create a Stripe payment intent
#     POST /api/create-payment-intent/
#     Body: {"amount": 10000} (amount in AMD)
#     Returns: {"client_secret": "pi_xxx_secret_xxx"}
#     """
#     try:
#         amount = request.data.get('amount')
        
#         if not amount:
#             return Response(
#                 {'error': 'Amount is required'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         # Convert AMD to smallest currency unit (AMD doesn't have subunits, so use as is)
#         # Stripe minimum amount is 50 AMD
#         amount_int = int(float(amount) * 100)
        
#         if amount_int < 250:
#             return Response(
#                 {'error': 'Amount must be at least 250 AMD'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         # Create payment intent
#         intent = stripe.PaymentIntent.create(
#             amount=amount_int,
#             currency='amd',
#             automatic_payment_methods={
#                 'enabled': True,
#             },
#             metadata={
#                 'integration_check': 'flower_shop'
#             }
#         )
        
#         return Response({
#             'client_secret': intent.client_secret,
#             'payment_intent_id': intent.id
#         }, status=status.HTTP_200_OK)
    
#     except Exception as e:
#         return Response(
#             {'error': str(e)},
#             status=status.HTTP_500_INTERNAL_SERVER_ERROR
#         )


# @api_view(['POST'])
# @permission_classes([AllowAny])
# def verify_payment(request):
#     """
#     Verify a Stripe payment
#     POST /api/verify-payment/
#     Body: {"payment_intent_id": "pi_xxx"}
#     Returns: {"status": "succeeded"}
#     """
#     try:
#         payment_intent_id = request.data.get('payment_intent_id')
        
#         if not payment_intent_id:
#             return Response(
#                 {'error': 'Payment intent ID is required'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         # Retrieve payment intent from Stripe
#         intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        
#         return Response({
#             'status': intent.status,
#             'amount': intent.amount,
#             'currency': intent.currency
#         }, status=status.HTTP_200_OK)
    
#     except Exception as e:
#         return Response(
#             {'error': str(e)},
#             status=status.HTTP_500_INTERNAL_SERVER_ERROR
#         )



# from rest_framework import viewsets
# from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
# from .models import MainPageContent
# from .serializers import MainPageContentSerializer

# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import AllowAny, IsAdminUser
# from rest_framework import status
# from .models import MainPageContent
# from .serializers import MainPageContentSerializer
# import cloudinary.uploader

# SINGLETON_ID = '00000000-0000-0000-0000-000000000001'

# class MainPageContentView(APIView):
#     """
#     GET: Public access to fetch main page content
#     PATCH: Admin can edit main page content
#     """
#     def get_permissions(self):
#         if self.request.method in ['PATCH']:
#             return [IsAdminUser()]
#         return [AllowAny()]

#     def get(self, request):
#         obj, created = MainPageContent.objects.get_or_create(id=SINGLETON_ID)
#         serializer = MainPageContentSerializer(obj)
#         return Response(serializer.data)

#     def patch(self, request):
#         obj, created = MainPageContent.objects.get_or_create(id=SINGLETON_ID)
#         serializer = MainPageContentSerializer(obj, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# class MainPageImageUploadView(APIView):
#     """
#     POST: Admin can upload main page image to Cloudinary
#     """
#     permission_classes = [IsAdminUser]

#     def post(self, request):
#         if 'image' not in request.FILES:
#             return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)
        
#         image = request.FILES['image']
#         try:
#             # Upload to Cloudinary
#             upload_result = cloudinary.uploader.upload(image, folder='main_page', resource_type='image')
#             secure_url = upload_result['secure_url']

#             # Get or create the main page content object
#             obj, created = MainPageContent.objects.get_or_create(
#                 id='00000000-0000-0000-0000-000000000001'
#             )

#             # Update the main_image field
#             obj.main_image = secure_url
#             obj.save()

#             return Response({'url': secure_url, 'public_id': upload_result['public_id']})
#         except Exception as e:
#             return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)