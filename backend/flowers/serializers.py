# from rest_framework import serializers
# from django.contrib.auth.models import User
# from django.contrib.auth import authenticate
# from .models import Flower, FlowerImage, Order, OrderItem
# import cloudinary.uploader


# class FlowerImageSerializer(serializers.ModelSerializer):
#     """Serializer for flower images"""
    
#     class Meta:
#         model = FlowerImage
#         fields = ['url', 'is_main']


# class FlowerListSerializer(serializers.ModelSerializer):
#     """Serializer for flower list view"""
#     images = FlowerImageSerializer(many=True, read_only=True)
    
#     class Meta:
#         model = Flower
#         fields = [
#             'id', 'name', 'price_amd', 'sale_price_amd', 'currency',
#             'description', 'category', 'colors', 'images',
#             'is_free_delivery', 'is_active', 'created_at', 'updated_at','to_be_on_main_page'
#         ]

# from rest_framework import serializers
# from .models import MainPageContent  # Make sure this is your main page model

# class MainPageContentSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = MainPageContent
#         fields = [
#             'id',
#             'title',
#             'subtitle',
#             'description',
#             'special_offer',
#             'extra_text',
#             'main_image'
#         ]

# class FlowerDetailSerializer(serializers.ModelSerializer):
#     """Serializer for flower detail view"""
#     images = FlowerImageSerializer(many=True, read_only=True)
    
#     class Meta:
#         model = Flower
#         fields = [
#             'id', 'name', 'price_amd', 'sale_price_amd', 'currency',
#             'description', 'category', 'colors', 'images',
#             'is_free_delivery', 'is_active', 'created_at', 'updated_at','to_be_on_main_page'
#         ]


# class FlowerImageUploadSerializer(serializers.Serializer):
#     """Serializer for handling image uploads"""
#     image = serializers.ImageField()
#     is_main = serializers.BooleanField(default=False)


# class FlowerCreateUpdateSerializer(serializers.ModelSerializer):
#     """Serializer for creating and updating flowers"""
#     images_data = serializers.ListField(
#         child=serializers.DictField(),
#         write_only=True,
#         required=False,
#         max_length=5
#     )
#     images = FlowerImageSerializer(many=True, read_only=True)
    
#     class Meta:
#         model = Flower
#         fields = [
#             'id', 'name', 'price_amd', 'sale_price_amd', 'currency',
#             'description', 'category', 'colors', 'is_free_delivery',
#             'is_active', 'images_data', 'images', 'created_at', 'updated_at','to_be_on_main_page'
#         ]
#         read_only_fields = ['id', 'created_at', 'updated_at']

#     def validate_images_data(self, value):
#         """Validate images data"""
#         if len(value) > 5:
#             raise serializers.ValidationError("Maximum 5 images allowed per flower")
        
#         # Check that at least one image is marked as main
#         main_count = sum(1 for img in value if img.get('is_main', False))
#         if value and main_count != 1:
#             raise serializers.ValidationError("Exactly one image must be marked as main")
        
#         return value

#     def validate_colors(self, value):
#         """Validate colors is a list"""
#         if not isinstance(value, list):
#             raise serializers.ValidationError("Colors must be a list")
#         return value

#     def create(self, validated_data):
#         """Create flower with images"""
#         images_data = validated_data.pop('images_data', [])
#         flower = Flower.objects.create(**validated_data)
        
#         # Create images
#         for img_data in images_data:
#             FlowerImage.objects.create(
#                 flower=flower,
#                 url=img_data['url'],
#                 is_main=img_data.get('is_main', False)
#             )
        
#         return flower

#     def update(self, instance, validated_data):
#         """Update flower and optionally update images"""
#         images_data = validated_data.pop('images_data', None)
        
#         # Update flower fields
#         for attr, value in validated_data.items():
#             setattr(instance, attr, value)
#         instance.save()
        
#         # Update images if provided
#         if images_data is not None:
#             # Delete old images
#             instance.images.all().delete()
            
#             # Create new images
#             for img_data in images_data:
#                 FlowerImage.objects.create(
#                     flower=instance,
#                     url=img_data['url'],
#                     is_main=img_data.get('is_main', False)
#                 )
        
#         return instance


# class AdminLoginSerializer(serializers.Serializer):
#     """Serializer for admin login"""
#     username = serializers.CharField()
#     password = serializers.CharField(write_only=True, style={'input_type': 'password'})

#     def validate(self, data):
#         username = data.get('username')
#         password = data.get('password')

#         if username and password:
#             user = authenticate(username=username, password=password)
#             if not user:
#                 raise serializers.ValidationError('Invalid username or password')
#             if not user.is_staff:
#                 raise serializers.ValidationError('User is not an admin')
#             data['user'] = user
#         else:
#             raise serializers.ValidationError('Must include username and password')

#         return data



# class OrderItemSerializer(serializers.ModelSerializer):
#     """Serializer for order items"""
    
#     class Meta:
#         model = OrderItem
#         fields = [
#             'id', 'flower', 'flower_name', 'flower_image_url',
#             'price_amd_at_purchase', 'quantity', 'subtotal'
#         ]
#         read_only_fields = ['id', 'subtotal']


# class OrderSerializer(serializers.ModelSerializer):
#     """Serializer for orders"""
#     items = OrderItemSerializer(many=True, read_only=True)
    
#     class Meta:
#         model = Order
#         fields = [
#             'id', 'customer_name', 'customer_email', 'customer_phone',
#             'delivery_city', 'delivery_address', 'delivery_notes',
#             'payment_method', 'stripe_payment_intent_id', 'stripe_payment_status',
#             'total_amount_amd', 'status', 'items', 'created_at', 'updated_at','bacik_erktox'
#         ]
#         read_only_fields = ['id', 'created_at', 'updated_at', 'stripe_payment_intent_id', 'stripe_payment_status']



# class OrderItemDetailSerializer(serializers.ModelSerializer):
#     """Detailed serializer for order items with flower info"""
#     flower = FlowerDetailSerializer(read_only=True)
    
#     class Meta:
#         model = OrderItem
#         fields = ['id', 'flower', 'quantity', 'price', 'subtotal','bacik_erktox']
#         read_only_fields = ['id', 'flower', 'subtotal']


# class OrderCreateSerializer(serializers.Serializer):
#     """Serializer for creating orders"""
#     # Customer information
#     customer_name = serializers.CharField(max_length=255)
#     customer_email = serializers.EmailField(required=False, allow_blank=True)
#     customer_phone = serializers.CharField(max_length=50)
    
#     # Delivery information
#     delivery_city = serializers.CharField(max_length=100)
#     delivery_address = serializers.CharField()
#     delivery_notes = serializers.CharField(required=False, allow_blank=True)
    
#     # Payment information
#     payment_method = serializers.ChoiceField(choices=['cash', 'card'])
#     stripe_payment_intent_id = serializers.CharField(required=False, allow_blank=True)
#     stripe_payment_status = serializers.CharField(required=False, allow_blank=True)
#     bacik_erktox = serializers.CharField(required=False, allow_blank=True)
    
#     # Order items
#     items = serializers.ListField(
#         child=serializers.DictField(),
#         min_length=1
#     )
    
#     def validate_items(self, value):
#         """Validate order items"""
#         for item in value:
#             if 'flower_id' not in item:
#                 raise serializers.ValidationError("Each item must have a flower_id")
#             if 'quantity' not in item or item['quantity'] < 1:
#                 raise serializers.ValidationError("Each item must have a valid quantity")
#         return value
    
#     def validate(self, data):
#         """Additional validation"""
#         if data['payment_method'] == 'card' and not data.get('stripe_payment_intent_id'):
#             raise serializers.ValidationError({
#                 'stripe_payment_intent_id': 'Payment intent ID is required for card payments'
#             })
#         return data
    
#     def create(self, validated_data):
#         """Create order with items"""
#         items_data = validated_data.pop('items')
        
#         # Calculate total
#         total_amount = 0
#         order_items_to_create = []
        
#         for item_data in items_data:
#             try:
#                 flower = Flower.objects.get(id=item_data['flower_id'], is_active=True)
#             except Flower.DoesNotExist:
#                 raise serializers.ValidationError(f"Flower with ID {item_data['flower_id']} not found or inactive")
            
#             # Use sale price if available, otherwise regular price
#             price = flower.sale_price_amd if flower.sale_price_amd else flower.price_amd
#             quantity = item_data['quantity']
#             subtotal = price * quantity
#             total_amount += subtotal
            
#             # Get main image
#             main_image = flower.images.filter(is_main=True).first()
#             image_url = main_image.url if main_image else None
            
#             order_items_to_create.append({
#                 'flower': flower,
#                 'flower_name': flower.name,
#                 'flower_image_url': image_url,
#                 'price_amd_at_purchase': price,
#                 'quantity': quantity
#             })
        
#         order = Order.objects.create(
#             customer_name=validated_data['customer_name'],
#             customer_email=validated_data.get('customer_email', ''),
#             customer_phone=validated_data['customer_phone'],
#             bacik_erktox=validated_data.get('bacik_erktox', ''),
#             delivery_city=validated_data['delivery_city'],
#             delivery_address=validated_data['delivery_address'],
#             delivery_notes=validated_data.get('delivery_notes', ''),
#             payment_method=validated_data['payment_method'],
#             stripe_payment_intent_id=validated_data.get('stripe_payment_intent_id', ''),
#             stripe_payment_status=validated_data.get('stripe_payment_status', 'pending'),  # ← add this
#             total_amount_amd=total_amount,
#             status='pending'
#         )
#         # Create order items
#         for item_data in order_items_to_create:
#             OrderItem.objects.create(order=order, **item_data)
        
#         return order


# class OrderAdminSerializer(serializers.ModelSerializer):
#     """Admin serializer with additional capabilities"""
#     items = OrderItemDetailSerializer(many=True, read_only=True)
#     get_total_items = serializers.SerializerMethodField()
    
#     class Meta:
#         model = Order
#         fields = [
#             'id',
#             'customer_name',
#             'customer_email',
#             'customer_phone',
#             'customer_address',
#             'customer_city',
#             'notes',
#             'payment_method',
#             'payment_status',
#             'payment_intent_id',
#             'total_amount',
#             'status',
#             'items',
#             'get_total_items',
#             'created_at',
#             'updated_at'
#         ]
#         read_only_fields = [
#             'id',
#             'payment_intent_id',
#             'created_at',
#             'updated_at'
#         ]
    
#     def get_total_items(self, obj):
#         return obj.get_total_items
    
#     def update(self, instance, validated_data):
#         """Allow admin to update order status"""
#         if 'status' in validated_data:
#             instance.status = validated_data['status']
#         if 'payment_status' in validated_data:
#             instance.payment_status = validated_data['payment_status']
#         instance.save()
#         return instance

from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Flower, FlowerImage, Order, OrderItem, MainPageContent


# ==================== IMAGE SERIALIZERS ====================
class FlowerImageSerializer(serializers.ModelSerializer):
    """Serializer for flower images"""
    url = serializers.SerializerMethodField()
    
    class Meta:
        model = FlowerImage
        fields = ['id', 'url', 'is_main']
    
    def get_url(self, obj):
        """Get absolute URL for image"""
        if obj.image:
            return obj.image.url
        return None


# ==================== FLOWER SERIALIZERS ====================
class FlowerListSerializer(serializers.ModelSerializer):
    """Serializer for flower list view"""
    images = FlowerImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Flower
        fields = [
            'id', 'name', 'price_amd', 'sale_price_amd',
            'description', 'category', 'colors', 'images',
            'is_free_delivery', 'is_active', 'to_be_on_main_page',
            'created_at', 'updated_at'
        ]


class FlowerDetailSerializer(serializers.ModelSerializer):
    """Serializer for flower detail view"""
    images = FlowerImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Flower
        fields = [
            'id', 'name', 'price_amd', 'sale_price_amd',
            'description', 'category', 'colors', 'images',
            'is_free_delivery', 'is_active', 'to_be_on_main_page',
            'created_at', 'updated_at'
        ]


class FlowerImageUploadSerializer(serializers.Serializer):
    """Serializer for handling image uploads"""
    image = serializers.ImageField()
    is_main = serializers.BooleanField(default=False)


class FlowerCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating flowers"""
    images_data = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False,
        max_length=5
    )
    images = FlowerImageSerializer(many=True, read_only=True)
    colors = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True
    )
    
    class Meta:
        model = Flower
        fields = [
            'id', 'name', 'price_amd', 'sale_price_amd',
            'description', 'category', 'colors', 'is_free_delivery',
            'is_active', 'to_be_on_main_page', 'images_data', 'images',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_images_data(self, value):
        """Validate images data"""
        if len(value) > 5:
            raise serializers.ValidationError("Maximum 5 images allowed per flower")
        
        # Check that at least one image is marked as main if images exist
        if value:
            main_count = sum(1 for img in value if img.get('is_main', False))
            if main_count != 1:
                raise serializers.ValidationError("Exactly one image must be marked as main")
        
        return value

    def validate_colors(self, value):
        """Validate colors is a list"""
        if not isinstance(value, list):
            if isinstance(value, str):
                # Convert comma-separated string to list
                value = [c.strip() for c in value.split(',') if c.strip()]
            else:
                value = []
        return value

    def create(self, validated_data):
        """Create flower with images"""
        images_data = validated_data.pop('images_data', [])
        colors = validated_data.pop('colors', [])
        
        # Convert colors to proper format if needed
        if colors and isinstance(colors, list):
            validated_data['colors'] = colors
        
        flower = Flower.objects.create(**validated_data)
        
        # Create images
        for img_data in images_data:
            FlowerImage.objects.create(
                flower=flower,
                image=img_data.get('url'),
                is_main=img_data.get('is_main', False)
            )
        
        return flower

    def update(self, instance, validated_data):
        """Update flower and optionally update images"""
        images_data = validated_data.pop('images_data', None)
        colors = validated_data.pop('colors', None)
        
        # Update flower fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Update colors if provided
        if colors is not None:
            instance.colors = colors
        
        instance.save()
        
        # Update images if provided
        if images_data is not None:
            # Delete old images
            instance.images.all().delete()
            
            # Create new images
            for img_data in images_data:
                FlowerImage.objects.create(
                    flower=instance,
                    image=img_data.get('url'),
                    is_main=img_data.get('is_main', False)
                )
        
        return instance


# ==================== MAIN PAGE SERIALIZER ====================
class MainPageContentSerializer(serializers.ModelSerializer):
    """Serializer for main page content"""
    main_image = serializers.SerializerMethodField()
    
    class Meta:
        model = MainPageContent
        fields = [
            'id', 'title', 'subtitle', 'description',
            'special_offer', 'extra_text', 'main_image'
        ]
    
    def get_main_image(self, obj):
        """Get absolute URL for main image"""
        if obj.main_image:
            return obj.main_image.url
        return None


# ==================== ORDER SERIALIZERS ====================
class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for order items"""
    flower = FlowerDetailSerializer(read_only=True)
    
    class Meta:
        model = OrderItem
        fields = [
            'id', 'flower', 'flower_name', 'flower_image_url',
            'price_amd_at_purchase', 'quantity'
        ]
        read_only_fields = ['id', 'flower_name']


class OrderListSerializer(serializers.ModelSerializer):
    """Serializer for order list view"""
    items = OrderItemSerializer(many=True, read_only=True)
    customer_city = serializers.CharField(source='delivery_city', read_only=True)
    customer_address = serializers.CharField(source='delivery_address', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'customer_name', 'customer_email', 'customer_phone',
            'customer_city', 'customer_address', 'delivery_notes',
            'bacik_erktox', 'payment_method', 'total_amount_amd',
            'status', 'items', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class OrderDetailSerializer(serializers.ModelSerializer):
    """Serializer for order detail view"""
    items = OrderItemSerializer(many=True, read_only=True)
    customer_city = serializers.CharField(source='delivery_city')
    customer_address = serializers.CharField(source='delivery_address')
    
    class Meta:
        model = Order
        fields = [
            'id', 'customer_name', 'customer_email', 'customer_phone',
            'customer_city', 'customer_address', 'delivery_notes',
            'bacik_erktox', 'payment_method', 'total_amount_amd',
            'status', 'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def update(self, instance, validated_data):
        """Allow updating order status"""
        if 'status' in validated_data:
            instance.status = validated_data['status']
        instance.save()
        return instance


class OrderCreateSerializer(serializers.Serializer):
    """Serializer for creating orders"""
    customer_name = serializers.CharField(max_length=255)
    customer_email = serializers.EmailField(required=False, allow_blank=True)
    customer_phone = serializers.CharField(max_length=50)
    delivery_city = serializers.CharField(max_length=100)
    delivery_address = serializers.CharField()
    delivery_notes = serializers.CharField(required=False, allow_blank=True)
    bacik_erktox = serializers.CharField(required=False, allow_blank=True)
    payment_method = serializers.ChoiceField(choices=['cash', 'card'])
    items = serializers.ListField(
        child=serializers.DictField(),
        min_length=1
    )
    
    def validate_items(self, value):
        """Validate order items"""
        for item in value:
            if 'flower_id' not in item:
                raise serializers.ValidationError("Each item must have a flower_id")
            if 'quantity' not in item or item['quantity'] < 1:
                raise serializers.ValidationError("Each item must have a valid quantity")
        return value
    
    def create(self, validated_data):
        """Create order with items"""
        items_data = validated_data.pop('items')
        
        # Calculate total
        total_amount = 0
        order_items_to_create = []
        
        for item_data in items_data:
            try:
                flower = Flower.objects.get(id=item_data['flower_id'], is_active=True)
            except Flower.DoesNotExist:
                raise serializers.ValidationError(
                    f"Flower with ID {item_data['flower_id']} not found or inactive"
                )
            
            # Use sale price if available
            price = flower.sale_price_amd if flower.sale_price_amd else flower.price_amd
            quantity = item_data['quantity']
            subtotal = price * quantity
            total_amount += subtotal
            
            # Get main image
            main_image = flower.images.filter(is_main=True).first()
            image_url = main_image.image.url if main_image else None
            
            order_items_to_create.append({
                'flower': flower,
                'flower_name': flower.name,
                'flower_image_url': image_url,
                'price_amd_at_purchase': price,
                'quantity': quantity
            })
        
        # Create order
        order = Order.objects.create(
            customer_name=validated_data['customer_name'],
            customer_email=validated_data.get('customer_email', ''),
            customer_phone=validated_data['customer_phone'],
            delivery_city=validated_data['delivery_city'],
            delivery_address=validated_data['delivery_address'],
            delivery_notes=validated_data.get('delivery_notes', ''),
            bacik_erktox=validated_data.get('bacik_erktox', ''),
            payment_method=validated_data['payment_method'],
            total_amount_amd=total_amount,
            status='pending'
        )
        
        # Create order items
        for item_data in order_items_to_create:
            OrderItem.objects.create(order=order, **item_data)
        
        return order


# ==================== AUTHENTICATION SERIALIZER ====================
class AdminLoginSerializer(serializers.Serializer):
    """Serializer for admin login"""
    username = serializers.CharField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError('Invalid username or password')
            if not user.is_staff:
                raise serializers.ValidationError('User is not an admin')
            data['user'] = user
        else:
            raise serializers.ValidationError('Must include username and password')

        return data


class AdminUserSerializer(serializers.ModelSerializer):
    """Serializer for admin user info"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff']
        read_only_fields = ['id', 'is_staff']