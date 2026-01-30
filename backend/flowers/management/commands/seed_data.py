from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from flowers.models import Flower, FlowerImage
import cloudinary.uploader


class Command(BaseCommand):
    help = 'Seed database with initial flower data and admin user'

    def handle(self, *args, **kwargs):
        self.stdout.write('Starting data seeding...')
        
        # Create admin user
        self.create_admin_user()
        
        # Seed flowers
        self.seed_flowers()
        
        self.stdout.write(self.style.SUCCESS('Data seeding completed!'))

    def create_admin_user(self):
        """Create admin user if not exists"""
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser(
                username='admin',
                email='admin@flowershop.am',
                password='Admin123!'
            )
            self.stdout.write(self.style.SUCCESS('Admin user created: username=admin, password=Admin123!'))
        else:
            self.stdout.write('Admin user already exists')

    def seed_flowers(self):
        """Seed flower data from frontend data"""
        
        # Check if flowers already exist
        if Flower.objects.exists():
            self.stdout.write('Flowers already exist. Skipping seeding.')
            return
        
        flowers_data = [
            {
                'name': 'Վարդերի Գեղեցկություն',
                'price_amd': 18000,
                'category': 'վարդեր',
                'colors': ['կարմիր'],
                'image': 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&q=80',
                'description': 'Շքեղ կարմիր վարդերի փունջ, կատարյալ է յուրաքանչյուր հատուկ առիթի համար։',
            },
            {
                'name': 'Լավանդայի Երազանք',
                'price_amd': 15000,
                'category': 'փունջեր',
                'colors': ['մանուշակագույն'],
                'image': 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80',
                'description': 'Փափուկ լավանդայի և սպիտակ ծաղիկների կոմպոզիցիա։',
            },
            {
                'name': 'Արևածաղիկների Ուրախություն',
                'price_amd': 12000,
                'category': 'արևածաղիկներ',
                'colors': ['դեղին'],
                'image': 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80',
                'description': 'Պայծառ արևածաղիկների փունջ։',
            },
            {
                'name': 'Վարդագույն Հմայք',
                'price_amd': 16000,
                'category': 'վարդեր',
                'colors': ['վարդագույն'],
                'image': 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&q=80',
                'description': 'Նուրբ վարդագույն վարդերի հիասքանչ հավաքածու։',
            },
            {
                'name': 'Սպիտակ Անմեղություն',
                'price_amd': 14000,
                'category': 'լիլիաներ',
                'colors': ['սպիտակ'],
                'image': 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&q=80',
                'description': 'Անթերի սպիտակ լիլիաների բուկետ։',
            },
            {
                'name': 'Վայրի Դաշտային Փունջ',
                'price_amd': 13000,
                'category': 'խառը',
                'colors': ['բազմագույն'],
                'image': 'https://images.unsplash.com/photo-1487070183336-b863922373d4?auto=format&fit=crop&q=80',
                'description': 'Գեղատեսիլ վայրի ծաղիկների խառնուրդ։',
            },
            {
                'name': 'Թագավորական Նուրբություն',
                'price_amd': 25000,
                'sale_price_amd': 22000,
                'category': 'պրեմիում',
                'colors': ['մանուշակագույն'],
                'image': 'https://images.unsplash.com/photo-1502977249166-824b3a8a4d6d?auto=format&fit=crop&q=80',
                'description': 'Շքեղ պրեմիում բուկետ իրիսներից և վարդերից։',
                'is_free_delivery': True,
            },
            {
                'name': 'Գարնան Արթնացում',
                'price_amd': 11000,
                'category': 'տյուլիպաններ',
                'colors': ['վարդագույն'],
                'image': 'https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&q=80',
                'description': 'Թարմ տյուլիպանների փունջ։',
            },
            {
                'name': 'Օրխիդեայի Շքեղություն',
                'price_amd': 28000,
                'sale_price_amd': 25000,
                'category': 'պրեմիում',
                'colors': ['սպիտակ', 'մանուշակագույն'],
                'image': 'https://images.unsplash.com/photo-1551518321-29d3e17a5c6e?auto=format&fit=crop&q=80',
                'description': 'Էլիտար օրխիդեաներ հատուկ արարողությունների համար։',
                'is_free_delivery': True,
            },
            {
                'name': 'Ռոմանտիկ Փունջ',
                'price_amd': 17000,
                'category': 'խառը',
                'colors': ['վարդագույն', 'կարմիր'],
                'image': 'https://images.unsplash.com/photo-1518709594023-6eab9bab7b23?auto=format&fit=crop&q=80',
                'description': 'Վարդերի և պիոնների հմայիչ կոմպոզիցիա։',
            },
        ]
        
        for flower_data in flowers_data:
            image_url = flower_data.pop('image')
            flower = Flower.objects.create(**flower_data)
            
            # Create main image
            FlowerImage.objects.create(
                flower=flower,
                url=image_url,
                is_main=True
            )
            
            self.stdout.write(f'Created flower: {flower.name}')
        
        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {len(flowers_data)} flowers'))
