import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

// Translation object
const translations = {
  am: {
    // Navbar
    home: 'Գլխավոր',
    flowers: 'Ծաղիկներ',
    contact: 'Կապ',
    login: 'Մուտք',
    logout: 'Դուրս գալ',
    cart: 'Զամբյուղ',
    
    // Home
    welcomeTitle: 'Բարի գալուստ Ձաղիկ',
    welcomeSubtitle: 'Գեղեցիկ ծաղիկներ յուրաքանչյուր առիթի համար',
    shopNow: 'Գնումներ',
    featuredFlowers: 'Առանձնահատուկ ծաղիկներ',
    
    // Products
    allFlowers: 'Բոլոր ծաղիկները',
    filters: 'Ֆիլտրեր',
    search: 'Փնտրել',
    category: 'Կատեգորիա',
    color: 'Գույն',
    priceRange: 'Գնի միջակայք',
    all: 'Բոլորը',
    noProducts: 'Ծաղիկներ չեն գտնվել',
    loading: 'Բեռնում...',
    loadingMore: 'Բեռնվում է ավելի շատ...',
    
    // Product Detail
    addToCart: 'Ավելացնել զամբյուղին',
    quantity: 'Քանակ',
    description: 'Նկարագրություն',
    relatedProducts: 'Նմանատիպ ծաղիկներ',
    freeDelivery: 'Անվճար առաքում',
    
    // Cart
    yourCart: 'Զամբյուղ',
    emptyCart: 'Ձեր զամբյուղը դատարկ է',
    emptyCartMessage: 'Ավելացրեք գեղեցիկ ծաղիկներ ձեր զամբյուղին',
    startShopping: 'Սկսել գնումները',
    item: 'ապրանք',
    items: 'ապրանքներ',
    removeFromCart: 'Հեռացվել է զամբյուղից',
    subtotal: 'Ենթագումար',
    delivery: 'Առաքում',
    free: 'Անվճար',
    total: 'Ընդամենը',
    proceedToCheckout: 'Շարունակել պատվերը',
    clearCart: 'Մաքրել զամբյուղը',
    cartCleared: 'Զամբյուղը մաքրված է',
    
    // Checkout
    checkoutTitle: 'Պատվերի ձևակերպում',
    checkoutSubtitle: 'Լրացրեք ձեր տվյալները պատվերն ավարտելու համար',
    personalInfo: 'Անձնական տվյալներ',
    fullName: 'Անուն Ազգանուն',
    phone: 'Հեռախոս',
    email: 'Էլ. փոստ',
    deliveryAddress: 'Առաքման հասցե',
    city: 'Քաղաք',
    address: 'Հասցե',
    notes: 'Լրացուցիչ նշումներ',
    paymentMethod: 'Վճարման եղանակ',
    cash: 'Կանխիկ',
    cashOnDelivery: 'Վճարեք առաքման ժամանակ',
    card: 'Քարտով',
    bankCard: 'Բանկային քարտ',
    yourOrder: 'Ձեր պատվերը',
    placeOrder: 'Հաստատել պատվերը',
    orderSuccess: 'Պատվերը հաջողությամբ ընդունված է!',
    orderSuccessMessage: 'Մենք կապ կհաստատենք ձեզ հետ շուտով',
    fillRequired: 'Խնդրում ենք լրացնել բոլոր պարտադիր դաշտերը',
    processing: 'Մշակվում է...',
    
    // Messages
    addedToCart: 'Ավելացված է զամբյուղին',
    errorLoading: 'Չհաջողվեց բեռնել ծաղիկները',
    errorCreatingOrder: 'Չհաջողվեց ստեղծել պատվերը',
    
    // Admin
    adminLogin: 'Ադմինի մուտք',
    username: 'Օգտանուն',
    password: 'Գաղտնաբառ',
    adminDashboard: 'Ադմինի վահանակ',
    
    // Contact
    contactUs: 'Կապ մեզ հետ',
    sendMessage: 'Ուղարկել հաղորդագրություն',
  },
  en: {
    // Navbar
    home: 'Home',
    flowers: 'Flowers',
    contact: 'Contact',
    login: 'Login',
    logout: 'Logout',
    cart: 'Cart',
    
    // Home
    welcomeTitle: 'Welcome to Dzaghik',
    welcomeSubtitle: 'Beautiful flowers for every occasion',
    shopNow: 'Shop Now',
    featuredFlowers: 'Featured Flowers',
    
    // Products
    allFlowers: 'All Flowers',
    filters: 'Filters',
    search: 'Search',
    category: 'Category',
    color: 'Color',
    priceRange: 'Price Range',
    all: 'All',
    noProducts: 'No flowers found',
    loading: 'Loading...',
    loadingMore: 'Loading more...',
    
    // Product Detail
    addToCart: 'Add to Cart',
    quantity: 'Quantity',
    description: 'Description',
    relatedProducts: 'Related Products',
    freeDelivery: 'Free Delivery',
    
    // Cart
    yourCart: 'Your Cart',
    emptyCart: 'Your cart is empty',
    emptyCartMessage: 'Add beautiful flowers to your cart',
    startShopping: 'Start Shopping',
    item: 'item',
    items: 'items',
    removeFromCart: 'Removed from cart',
    subtotal: 'Subtotal',
    delivery: 'Delivery',
    free: 'Free',
    total: 'Total',
    proceedToCheckout: 'Proceed to Checkout',
    clearCart: 'Clear Cart',
    cartCleared: 'Cart cleared',
    
    // Checkout
    checkoutTitle: 'Checkout',
    checkoutSubtitle: 'Fill in your details to complete the order',
    personalInfo: 'Personal Information',
    fullName: 'Full Name',
    phone: 'Phone',
    email: 'Email',
    deliveryAddress: 'Delivery Address',
    city: 'City',
    address: 'Address',
    notes: 'Additional Notes',
    paymentMethod: 'Payment Method',
    cash: 'Cash',
    cashOnDelivery: 'Pay on delivery',
    card: 'Card',
    bankCard: 'Bank Card',
    yourOrder: 'Your Order',
    placeOrder: 'Place Order',
    orderSuccess: 'Order placed successfully!',
    orderSuccessMessage: 'We will contact you shortly',
    fillRequired: 'Please fill in all required fields',
    processing: 'Processing...',
    
    // Messages
    addedToCart: 'Added to cart',
    errorLoading: 'Failed to load flowers',
    errorCreatingOrder: 'Failed to create order',
    
    // Admin
    adminLogin: 'Admin Login',
    username: 'Username',
    password: 'Password',
    adminDashboard: 'Admin Dashboard',
    
    // Contact
    contactUs: 'Contact Us',
    sendMessage: 'Send Message',
  },
  ru: {
    // Navbar
    home: 'Главная',
    flowers: 'Цветы',
    contact: 'Контакты',
    login: 'Вход',
    logout: 'Выход',
    cart: 'Корзина',
    
    // Home
    welcomeTitle: 'Добро пожаловать в Дзагик',
    welcomeSubtitle: 'Красивые цветы на любой случай',
    shopNow: 'Купить сейчас',
    featuredFlowers: 'Избранные цветы',
    
    // Products
    allFlowers: 'Все цветы',
    filters: 'Фильтры',
    search: 'Поиск',
    category: 'Категория',
    color: 'Цвет',
    priceRange: 'Диапазон цен',
    all: 'Все',
    noProducts: 'Цветы не найдены',
    loading: 'Загрузка...',
    loadingMore: 'Загрузка...',
    
    // Product Detail
    addToCart: 'Добавить в корзину',
    quantity: 'Количество',
    description: 'Описание',
    relatedProducts: 'Похожие товары',
    freeDelivery: 'Бесплатная доставка',
    
    // Cart
    yourCart: 'Ваша корзина',
    emptyCart: 'Ваша корзина пуста',
    emptyCartMessage: 'Добавьте красивые цветы в корзину',
    startShopping: 'Начать покупки',
    item: 'товар',
    items: 'товаров',
    removeFromCart: 'Удалено из корзины',
    subtotal: 'Промежуточный итог',
    delivery: 'Доставка',
    free: 'Бесплатно',
    total: 'Итого',
    proceedToCheckout: 'Оформить заказ',
    clearCart: 'Очистить корзину',
    cartCleared: 'Корзина очищена',
    
    // Checkout
    checkoutTitle: 'Оформление заказа',
    checkoutSubtitle: 'Заполните данные для завершения заказа',
    personalInfo: 'Личная информация',
    fullName: 'Полное имя',
    phone: 'Телефон',
    email: 'Email',
    deliveryAddress: 'Адрес доставки',
    city: 'Город',
    address: 'Адрес',
    notes: 'Дополнительные заметки',
    paymentMethod: 'Способ оплаты',
    cash: 'Наличными',
    cashOnDelivery: 'Оплата при доставке',
    card: 'Картой',
    bankCard: 'Банковская карта',
    yourOrder: 'Ваш заказ',
    placeOrder: 'Разместить заказ',
    orderSuccess: 'Заказ успешно размещен!',
    orderSuccessMessage: 'Мы свяжемся с вами в ближайшее время',
    fillRequired: 'Пожалуйста, заполните все обязательные поля',
    processing: 'Обработка...',
    
    // Messages
    addedToCart: 'Добавлено в корзину',
    errorLoading: 'Не удалось загрузить цветы',
    errorCreatingOrder: 'Не удалось создать заказ',
    
    // Admin
    adminLogin: 'Вход администратора',
    username: 'Имя пользователя',
    password: 'Пароль',
    adminDashboard: 'Панель администратора',
    
    // Contact
    contactUs: 'Свяжитесь с нами',
    sendMessage: 'Отправить сообщение',
  }
};

// Translate product names and descriptions
const productTranslations = {
  // Categories
  'վարդեր': { en: 'Roses', ru: 'Розы' },
  'լիլիաներ': { en: 'Lilies', ru: 'Лилии' },
  'ձեռնարկված': { en: 'Mixed', ru: 'Смешанные' },
  'արևածաղիկներ': { en: 'Sunflowers', ru: 'Подсолнухи' },
  'օրխիդեաներ': { en: 'Orchids', ru: 'Орхидеи' },
  
  // Colors
  'կարմիր': { en: 'Red', ru: 'Красный' },
  'վարդագույն': { en: 'Pink', ru: 'Розовый' },
  'սպիտակ': { en: 'White', ru: 'Белый' },
  'դեղին': { en: 'Yellow', ru: 'Желтый' },
  'մանուշակագույն': { en: 'Purple', ru: 'Фиолетовый' },
  'նարնջագույն': { en: 'Orange', ru: 'Оранжевый' },
  'կապույտ': { en: 'Blue', ru: 'Синий' },
  'բոլորը': { en: 'All', ru: 'Все' },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('am');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('dzaghik_language');
    if (savedLanguage && ['am', 'en', 'ru'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (lang) => {
    if (['am', 'en', 'ru'].includes(lang)) {
      setLanguage(lang);
      localStorage.setItem('dzaghik_language', lang);
    }
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  // Translate product text (name, description, category, color)
  const translateProduct = (text) => {
    if (!text || language === 'am') return text;
    
    // Check if it's a known translation
    if (productTranslations[text.toLowerCase()]) {
      return productTranslations[text.toLowerCase()][language];
    }
    
    // For product names and descriptions, return as-is for now
    // (In a real app, you'd have full translations stored in database)
    return text;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        changeLanguage,
        t,
        translateProduct,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
