from django.contrib import admin
from .models import Flower, FlowerImage


class FlowerImageInline(admin.TabularInline):
    model = FlowerImage
    extra = 1
    max_num = 5


@admin.register(Flower)
class FlowerAdmin(admin.ModelAdmin):
    list_display = ['name', 'price_amd', 'sale_price_amd', 'category', 'is_active', 'is_free_delivery', 'created_at']
    list_filter = ['category', 'is_active', 'is_free_delivery', 'created_at']
    search_fields = ['name', 'description', 'category']
    list_editable = ['is_active']
    inlines = [FlowerImageInline]
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(FlowerImage)
class FlowerImageAdmin(admin.ModelAdmin):
    list_display = ['flower', 'url', 'is_main', 'created_at']
    list_filter = ['is_main', 'created_at']
    search_fields = ['flower__name']
