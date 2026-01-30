import uuid
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator


class Flower(models.Model):
    """
    Flower model representing a flower product listing
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    price_amd = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    sale_price_amd = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        validators=[MinValueValidator(0)]
    )
    to_be_on_main_page = models.BooleanField(default=False)
    currency = models.CharField(max_length=3, default='AMD')
    description = models.TextField()
    category = models.CharField(max_length=100)
    colors = models.JSONField(default=list)  # Array of color strings
    is_free_delivery = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        db_table = 'flowers'
        indexes = [
            models.Index(fields=['category']),
            models.Index(fields=['is_active']),
            models.Index(fields=['-created_at']),
        ]

    def __str__(self):
        return self.name

    @property
    def main_image(self):
        """Get the main image for this flower"""
        main_img = self.images.filter(is_main=True).first()
        return main_img.url if main_img else None


class FlowerImage(models.Model):
    """
    Flower image model - supports up to 5 images per flower
    Exactly one image must be marked as is_main=True
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    flower = models.ForeignKey(
        Flower, 
        on_delete=models.CASCADE, 
        related_name='images'
    )
    url = models.URLField(max_length=500)
    is_main = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_main', 'created_at']
        db_table = 'flower_images'

    def __str__(self):
        return f"Image for {self.flower.name} - Main: {self.is_main}"

    def save(self, *args, **kwargs):
        """
        Ensure only one image is marked as main per flower
        """
        if self.is_main:
            # Set all other images for this flower to not main
            FlowerImage.objects.filter(
                flower=self.flower, 
                is_main=True
            ).exclude(id=self.id).update(is_main=False)
        super().save(*args, **kwargs)


class MainPageContent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    title = models.CharField(max_length=255, default="Բնական գեղեցկություն")
    subtitle = models.CharField(max_length=255, blank=True, null=True, default="Ձեր Հատուկ Պահերի")
    description = models.TextField(blank=True, null=True, default="Յուրաքանչյուր ծաղիկ պատմում է պատմություն։ Մենք ստեղծում ենք անմոռանալի պահեր թարմ և գեղեցիկ ծաղիկներով։")
    special_offer = models.TextField(blank=True, null=True, default="Պատվիրեք հիմա և ստացեք 10% զեղչ Ձեր առաջին պատվերի համար հատուկ առաջարկ")
    
    # Cloudinary image field
    main_image = models.URLField(max_length=500,default='https://images.unsplash.com/photo-1767552670030-a276419d6d34?crop=entropy&cs=srgb&fm=jpg&q=85')
    
    extra_text = models.TextField(blank=True, null=True, help_text="Special writing here")

    def __str__(self):
        return self.title

class Order(models.Model):
    """
    Order model representing a customer order
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('processing', 'Processing'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ('cash', 'Cash on Delivery'),
        ('card', 'Card Payment'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Customer information
    customer_name = models.CharField(max_length=255)
    customer_email = models.EmailField(blank=True, null=True)
    customer_phone = models.CharField(max_length=50)
    
    # Delivery information
    delivery_city = models.CharField(max_length=100)
    delivery_address = models.TextField()
    delivery_notes = models.TextField(blank=True, null=True)
    
    bacik_erktox = models.CharField(max_length=100,default='')

    # Payment information
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        default='cash'
    )
    stripe_payment_intent_id = models.CharField(max_length=255, blank=True, null=True)
    stripe_payment_status = models.CharField(max_length=50, blank=True, null=True)
    
    # Order details
    total_amount_amd = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        db_table = 'orders'
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['customer_phone']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return f"Order {self.id} - {self.customer_name}"


class OrderItem(models.Model):
    """
    Order item model representing individual items in an order
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items'
    )
    flower = models.ForeignKey(
        Flower,
        on_delete=models.SET_NULL,
        null=True,
        related_name='order_items'
    )
    
    # Snapshot data at time of purchase
    flower_name = models.CharField(max_length=255)
    flower_image_url = models.URLField(max_length=500, blank=True, null=True)
    price_amd_at_purchase = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    quantity = models.IntegerField(validators=[MinValueValidator(1)])
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'order_items'
    
    def __str__(self):
        return f"{self.quantity}x {self.flower_name} (Order: {self.order.id})"
    
    @property
    def subtotal(self):
        """Calculate subtotal for this item"""
        return self.price_amd_at_purchase * self.quantity


