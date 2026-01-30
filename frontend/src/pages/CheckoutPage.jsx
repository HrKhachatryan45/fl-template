import React, { useState, useEffect } from 'react';
import { useNavigate,useLocation } from 'react-router-dom';
import { CreditCard, MapPin, User, Phone, Mail, AlertCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import {loadStripe} from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'https://f8wg2scq-8000.euw.devtunnels.ms/';

const PaymentForm = ({ formData, total, loading, onSubmit }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState('');

  
  const handleCardChange = (e) => {
    setCardError(e.error ? e.error.message : '');
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);
    
    if (cardError) {
      toast.error('Ցանց սխալ', { description: cardError });
      return;
    }

    try {
      // Create payment intent
      console.log(total)
      const intentResponse = await fetch(`${API_BASE_URL}api/create-payment-intent/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total })
      });

      if (!intentResponse.ok) throw new Error('Վճարման նպատակ ստեղծելու սխալ');

      const { client_secret, payment_intent_id } = await intentResponse.json();

      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            address: {
              line1: formData.address,
              city: formData.city
            }
          }
        }
      });

      if (error) {
        toast.error('Վճարման սխալ', { description: error.message });
        setCardError(error.message);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        await onSubmit(payment_intent_id, paymentIntent.status);
      }
    } catch (error) {
      toast.error('Սխալ', { description: error.message });
    }
  };

  return (
    <form onSubmit={handlePaymentSubmit}>
      <div className="space-y-4">
        <div className="p-4 rounded-lg border border-border">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
            onChange={handleCardChange}
          />
        </div>
        
        {cardError && (
          <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{cardError}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !stripe}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-gray-400 rounded-full px-8 py-4 font-medium transition-all shadow-lg hover:shadow-primary/20 active:scale-95 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Վճարում...
            </>
          ) : (
            'Վճարել'
          )}
        </button>
      </div>
    </form>
  );
};

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useCart();
  const location = useLocation();
  const buyNowItem = location.state?.buyNowItem;
  const checkoutItems = buyNowItem ? [buyNowItem] : cart;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: 'Երևան',
    notes: '',
    paymentMethod: 'cash',
    bacik_erktox: ''
  });



  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

  };

  const [checkBoxOpen,setCheckBoxOpen] = useState(false)

  const total = buyNowItem
    ? (buyNowItem.price_on_sale ? buyNowItem.price_on_sale : buyNowItem.price) * buyNowItem.quantity
    : getCartTotal();

  const createOrder = async (paymentIntentId,paymentStatus) => {
    console.log(paymentStatus,'this is status 2');
    
    try {
      const orderData = {
        customer_name: formData.fullName,
        customer_email: formData.email,
        customer_phone: formData.phone,
        delivery_address: formData.address,
        delivery_city: formData.city,
        notes: formData.notes,
        payment_method: formData.paymentMethod,
        total_amount: total,
        stripe_payment_status: paymentStatus || 'failed',
        stripe_payment_intent_id: paymentIntentId || '',
        items: checkoutItems.map(item => ({
          flower_id: item.id,
          quantity: item.quantity,
          price: item.price_on_sale ? item.price_on_sale : item.price
        })),
        bacik_erktox:formData.bacik_erktox
      };

      const response = await fetch(`${API_BASE_URL}api/orders/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Պատվեր ստեղծելու սխալ');
      }

      const order = await response.json();
      return order;
    } catch (error) {
      throw error;
    }
  };

  const handleCashSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.phone || !formData.address) {
      toast.error('Սխալ', {
        description: 'Խնդրում ենք լրացնել բոլոր պարտադիր դաշտերը'
      });
      return;
    }

    setLoading(true);
    try {
      await createOrder();
      
      toast.success('Պատվերը հաջողությամբ ընդունված է!', {
        description: 'Մենք կապ կհաստատենք ձեզ հետ շուտով'
      });
      
      clearCart();
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      toast.error('Սխալ', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCardSubmit = async (paymentIntentId,status) => {
    setLoading(true);
    console.log(status,'this is status');
    
    try {
      await createOrder(paymentIntentId,status);
      
      toast.success('Պատվերը հաջողությամբ ընդունված է!', {
        description: 'Շնորհակալ ձեր գնման համար'
      });
      
      clearCart();
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      toast.error('Սխալ', {
        description: error.message
      });
    } finally { 
      setLoading(false);
    }
  };

  if (checkoutItems.length === 0) {
    navigate('/cart');
    return null;
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
            Պատվերի ձևակերպում
          </h1>
          <p className="text-muted-foreground">
            Լրացրեք ձեր տվյալները պատվերն ավարտելու համար
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Side - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 md:p-8 border border-border/50 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <User className="w-6 h-6 text-primary" />
                <h2 className="font-serif text-2xl font-semibold">
                  Անձնական տվյալներ
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Անուն Ազգանուն *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Անուն Ազգանուն"
                    required
                    data-testid="checkout-fullname"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Հեռախոս *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="+374 XX XXXXXX"
                    required
                    data-testid="checkout-phone"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Էլ. փոստ
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="email@example.com"
                    data-testid="checkout-email"
                  />
                </div>
              </div>
            </motion.div>

            {/* Delivery Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 md:p-8 border border-border/50 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="w-6 h-6 text-primary" />
                <h2 className="font-serif text-2xl font-semibold">
                  Առաքման հասցե
                </h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Քաղաք *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                    data-testid="checkout-city"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Հասցե *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-3 bg-white/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Փողոց, տուն, բնակարան"
                    required
                    data-testid="checkout-address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Լրացուցիչ նշումներ
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-4 py-3 bg-white/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Առաքման ցանկացած մանրամասներ..."
                    data-testid="checkout-notes"
                  />
                </div>
                <div>
                   <label className="block text-sm font-medium mb-2">
                    Երկտողի հնարավորություն
                  </label>
                <input type='checkbox' checked={checkBoxOpen} onChange={(e) => setCheckBoxOpen(e.target.checked)} />
                </div>
                 {checkBoxOpen && <div>
                 
                  <textarea
                    name="bacik_erktox"
                    value={formData.bacik_erktox}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-4 py-3 bg-white/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Բացիկ-երկտող"
                    data-testid="checkout-notes"
                  />
                </div>}
              </div>
            </motion.div>



            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 md:p-8 border border-border/50 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="w-6 h-6 text-primary" />
                <h2 className="font-serif text-2xl font-semibold">
                  Վճարման եղանակ
                </h2>
              </div>

              <div className="space-y-3">
                <label 
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.paymentMethod === 'cash'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={formData.paymentMethod === 'cash'}
                    onChange={handleChange}
                    className="w-5 h-5 text-primary"
                    data-testid="payment-cash"
                  />
                  <div className="flex-1">
                    <div className="font-semibold">Կանխիկ</div>
                    <div className="text-sm text-muted-foreground">Վճարեք առաքման ժամանակ</div>
                  </div>
                </label>

                <label 
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.paymentMethod === 'card'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={formData.paymentMethod === 'card'}
                    onChange={handleChange}
                    className="w-5 h-5 text-primary"
                    data-testid="payment-card"
                  />
                  <div className="flex-1">
                    <div className="font-semibold">Քարտով</div>
                    <div className="text-sm text-muted-foreground">Բանկային քարտ</div>
                  </div>
                </label>
              </div>

              {/* Card Payment Form */}
              {formData.paymentMethod === 'card' && (
                <div className="mt-6 pt-6 border-t border-border">
                  <Elements stripe={stripePromise}>
                    <PaymentForm 
                      formData={formData} 
                      total={total}
                      loading={loading}
                      onSubmit={handleCardSubmit}
                    />
                  </Elements>
                </div>
              )}

              {/* Cash Payment Button */}
              {formData.paymentMethod === 'cash' && (
                <div className="mt-6 pt-6 border-t border-border">
                  <button
                    onClick={handleCashSubmit}
                    disabled={loading}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-gray-400 rounded-full px-8 py-4 font-medium transition-all shadow-lg hover:shadow-primary/20 active:scale-95 flex items-center justify-center gap-2"
                    data-testid="place-order-button"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Ամբողջացնել...
                      </>
                    ) : (
                      'Հաստատել պատվերը'
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Side - Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm sticky top-24">
              <h2 className="font-serif text-2xl font-bold mb-6">
                Ձեր պատվերը
              </h2>

              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {checkoutItems.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.quantity} x {(item.price_on_sale ? item.price_on_sale :item.price).toLocaleString()} ֏
                      </div>
                    </div>
                    <div className="font-semibold text-sm">
                      {(item.quantity * item.price_on_sale ? item.price_on_sale :item.price).toLocaleString()} ֏
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ենթագումար</span>
                  <span className="font-semibold">{total.toLocaleString()} ֏</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Առաքում</span>
                  <span className="font-semibold text-green-600">Անվճար</span>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Ընդամենը</span>
                    <span className="text-primary">{total.toLocaleString()} ֏</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground text-center">
                {formData.paymentMethod === 'card' && (
                  'Ձեր վճարումը պաշտպանված է Stripe-ի կողմից'
                )}
                {formData.paymentMethod === 'cash' && (
                  'Վճարումը հաստատելուց հետո մենք կապ կհաստատենք'
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
