import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, User, LogOut, Flower2, Globe, DollarSign } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const { getCartCount } = useCart();
  const { user, logout } = useAuth();
  const { language, changeLanguage, t } = useLanguage();
  const { currency, changeCurrency } = useCurrency();
  const navigate = useNavigate();
  const cartCount = getCartCount();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const languages = [
    { code: 'am', name: 'Հայ', flag: '🇦🇲' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' }
  ];

  const currencies = [
    { code: 'AMD', name: '֏ AMD' },
    { code: 'USD', name: '$ USD' },
    { code: 'RUB', name: '₽ RUB' }
  ];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-border/50 shadow-sm">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-20">
          <Link 
            to="/" 
            className="flex items-center gap-3 group"
            data-testid="navbar-logo"
          >
            <div className="bg-primary rounded-full p-2 group-hover:scale-110 transition-transform">
              <Flower2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-serif font-bold text-primary">Ձաղիկ</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link 
              to="/" 
              className="text-foreground hover:text-primary transition-colors font-medium"
              data-testid="nav-link-home"
            >
              {t('home')}
            </Link>
            <Link 
              to="/products" 
              className="text-foreground hover:text-primary transition-colors font-medium"
              data-testid="nav-link-products"
            >
              {t('flowers')}
            </Link>
            <Link 
              to="/contact" 
              className="text-foreground hover:text-primary transition-colors font-medium"
              data-testid="nav-link-contact"
            >
              {t('contact')}
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsLanguageOpen(!isLanguageOpen);
                  setIsCurrencyOpen(false);
                }}
                className="hidden md:flex items-center gap-2 px-3 py-2 hover:bg-muted rounded-lg transition-colors"
                data-testid="language-selector"
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium">{language.toUpperCase()}</span>
              </button>
              
              <AnimatePresence>
                {isLanguageOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-border overflow-hidden"
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          changeLanguage(lang.code);
                          setIsLanguageOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left hover:bg-muted transition-colors flex items-center gap-2 ${
                          language === lang.code ? 'bg-primary/10 text-primary font-medium' : ''
                        }`}
                        data-testid={`lang-${lang.code}`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Currency Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsCurrencyOpen(!isCurrencyOpen);
                  setIsLanguageOpen(false);
                }}
                className="hidden md:flex items-center gap-2 px-3 py-2 hover:bg-muted rounded-lg transition-colors"
                data-testid="currency-selector"
              >
                <DollarSign className="w-4 h-4" />
                <span className="text-sm font-medium">{currency}</span>
              </button>
              
              <AnimatePresence>
                {isCurrencyOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-border overflow-hidden"
                  >
                    {currencies.map((curr) => (
                      <button
                        key={curr.code}
                        onClick={() => {
                          changeCurrency(curr.code);
                          setIsCurrencyOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left hover:bg-muted transition-colors ${
                          currency === curr.code ? 'bg-primary/10 text-primary font-medium' : ''
                        }`}
                        data-testid={`curr-${curr.code}`}
                      >
                        {curr.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {user ? (
              <div className="hidden md:flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                  data-testid="logout-button"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:flex items-center gap-2 text-foreground hover:text-primary transition-colors"
                data-testid="nav-link-login"
              >
                <User className="w-5 h-5" />
                <span className="font-medium">{t('login')}</span>
              </Link>
            )}

            <Link
              to="/cart"
              className="relative p-2 hover:bg-muted rounded-full transition-colors"
              data-testid="nav-cart-button"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold"
                  data-testid="cart-count"
                >
                  {cartCount}
                </motion.span>
              )}
            </Link>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-muted rounded-full transition-colors"
              data-testid="mobile-menu-button"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border/50"
              data-testid="mobile-menu"
            >
              <div className="py-4 space-y-3">
                <Link
                  to="/"
                  className="block px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                  data-testid="mobile-nav-home"
                >
                  {t('home')}
                </Link>
                <Link
                  to="/products"
                  className="block px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                  data-testid="mobile-nav-products"
                >
                  {t('flowers')}
                </Link>
                <Link
                  to="/contact"
                  className="block px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                  data-testid="mobile-nav-contact"
                >
                  {t('contact')}
                </Link>
                
                {/* Mobile Language Selector */}
                <div className="px-4 py-2">
                  <div className="text-sm font-medium text-muted-foreground mb-2">Language</div>
                  <div className="flex gap-2">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          changeLanguage(lang.code);
                          setIsMenuOpen(false);
                        }}
                        className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                          language === lang.code
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border hover:bg-muted'
                        }`}
                      >
                        {lang.flag} {lang.code.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Mobile Currency Selector */}
                <div className="px-4 py-2">
                  <div className="text-sm font-medium text-muted-foreground mb-2">Currency</div>
                  <div className="flex gap-2">
                    {currencies.map((curr) => (
                      <button
                        key={curr.code}
                        onClick={() => {
                          changeCurrency(curr.code);
                          setIsMenuOpen(false);
                        }}
                        className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                          currency === curr.code
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border hover:bg-muted'
                        }`}
                      >
                        {curr.code}
                      </button>
                    ))}
                  </div>
                </div>
                
                {user ? (
                  <>
                    <div className="px-4 py-2 text-sm text-muted-foreground">
                      {user.name}
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-colors"
                      data-testid="mobile-logout"
                    >
                      {t('logout')}
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="block px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                    data-testid="mobile-nav-login"
                  >
                    {t('login')}
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};
