import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';

export const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();

  const handleRemove = (productId, productName) => {
    removeFromCart(productId);
    toast.success('Հեռացվել է զամբյուղից', {
      description: productName
    });
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
          data-testid="empty-cart"
        >
          <ShoppingBag className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
          <h2 className="text-3xl font-serif font-bold mb-4">
            Ձեր զամբյուղը դատարկ է
          </h2>
          <p className="text-muted-foreground mb-8">
            Ավելացրեք գեղեցիկ ծաղիկներ ձեր զամբյուղին
          </p>
          <Link
            to="/products"
            className="inline-flex bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-4 font-medium transition-all shadow-lg"
            data-testid="empty-cart-shop-button"
          >
            Սկսել գնումները
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-2">
            Զամբյուղ
          </h1>
          <p className="text-muted-foreground">
            {cart.length} {cart.length === 1 ? 'ապրանք' : 'ապրանքներ'}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4" data-testid="cart-items">
            {cart.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm"
                data-testid={`cart-item-${item.id}`}
              >
                <div className="flex gap-6">
                  <Link 
                    to={`/product/${item.id}`}
                    className="w-32 h-32 rounded-xl overflow-hidden bg-muted flex-shrink-0"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      data-testid={`cart-item-image-${item.id}`}
                    />
                  </Link>

                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <Link 
                        to={`/product/${item.id}`}
                        className="font-serif text-xl font-semibold hover:text-primary transition-colors"
                        data-testid={`cart-item-name-${item.id}`}
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => handleRemove(item.id, item.name)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        data-testid={`cart-remove-${item.id}`}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">
                      {item.category}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-lg border border-border hover:bg-muted transition-colors"
                          data-testid={`cart-decrease-${item.id}`}
                        >
                          <Minus className="w-4 h-4 mx-auto" />
                        </button>
                        <span 
                          className="text-lg font-semibold w-8 text-center"
                          data-testid={`cart-quantity-${item.id}`}
                        >
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-lg border border-border hover:bg-muted transition-colors"
                          data-testid={`cart-increase-${item.id}`}
                        >
                          <Plus className="w-4 h-4 mx-auto" />
                        </button>
                      </div>

                      <div className="text-right">
                        <div 
                          className="text-2xl font-bold text-primary"
                          data-testid={`cart-item-total-${item.id}`}
                        >
                          <span style={{textDecoration: item.price_on_sale ? 'line-through ':''}}>{(item.price * item.quantity).toLocaleString()} ֏</span>
                         <br/> {item.price_on_sale && (item.price_on_sale * item.quantity).toLocaleString()} ֏
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {item.price.toLocaleString()} ֏ / հատ
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm sticky top-24">
              <h2 className="font-serif text-2xl font-bold mb-6">
                Ամփոփում
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-lg">
                  <span className="text-muted-foreground">Ենթագումար</span>
                  <span className="font-semibold">{getCartTotal().toLocaleString()} ֏</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-muted-foreground">Առաքում</span>
                  <span className="font-semibold text-green-600">Անվճար</span>
                </div>
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between text-2xl font-bold">
                    <span>Ընդամենը</span>
                    <span 
                      className="text-primary"
                      data-testid="cart-total"
                    >
                      {getCartTotal().toLocaleString()} ֏
                    </span>
                  </div>
                </div>
              </div>

              <Link
                to="/checkout"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-4 font-medium transition-all shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2 mb-4 active:scale-95"
                data-testid="proceed-to-checkout"
              >
                <span>Շարունակել պատվերը</span>
              </Link>

              <button
                onClick={() => {
                  clearCart();
                  toast.success('Զամբյուղը մաքրված է');
                }}
                className="w-full text-destructive hover:bg-destructive/10 rounded-full px-8 py-3 font-medium transition-all"
                data-testid="clear-cart-button"
              >
                Մաքրել զամբյուղը
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
