import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Flower2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (login(formData.email, formData.password)) {
      toast.success('Դուք հաջողությամբ մուտք եք գործել');
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 bg-gradient-to-b from-[#FFFCF8] via-[#FFF0F5] to-[#FFFCF8]">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-3 mb-6">
              <div className="bg-primary rounded-full p-3">
                <Flower2 className="w-8 h-8 text-primary-foreground" />
              </div>
              <span className="text-3xl font-serif font-bold text-primary">Ձաղիկ</span>
            </Link>
            <h1 className="text-3xl font-serif font-bold mb-2">Մուտք</h1>
            <p className="text-muted-foreground">Մուտք գործեք ձեր հաշիվ</p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-border/50 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Էլ. փոստ
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-white/50 border-border focus:border-primary/50 focus:ring-primary/20 rounded-lg"
                    placeholder="email@example.com"
                    required
                    data-testid="login-email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Գաղտնաբառ
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-white/50 border-border focus:border-primary/50 focus:ring-primary/20 rounded-lg"
                    placeholder="••••••••"
                    required
                    data-testid="login-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-4 font-medium transition-all shadow-lg hover:shadow-primary/20 active:scale-95"
                data-testid="login-submit"
              >
                Մուտք
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                Չունե՞ք հաշիվ։{' '}
                <Link 
                  to="/signup" 
                  className="text-primary hover:underline font-medium"
                  data-testid="signup-link"
                >
                  Գրանցվել
                </Link>
              </p>
            </div>
          </div>

          <div className="text-center mt-6">
            <Link 
              to="/" 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Վերադառնալ գլխավոր էջ
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Գաղտնաբառերը չեն համընկնում');
      return;
    }

    if (signup(formData.name, formData.email, formData.password)) {
      toast.success('Դուք հաջողությամբ գրանցվել եք');
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 bg-gradient-to-b from-[#FFFCF8] via-[#FFF0F5] to-[#FFFCF8]">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-3 mb-6">
              <div className="bg-primary rounded-full p-3">
                <Flower2 className="w-8 h-8 text-primary-foreground" />
              </div>
              <span className="text-3xl font-serif font-bold text-primary">Ձաղիկ</span>
            </Link>
            <h1 className="text-3xl font-serif font-bold mb-2">Գրանցվել</h1>
            <p className="text-muted-foreground">Ստեղծեք նոր հաշիվ</p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-border/50 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Անուն
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-white/50 border-border focus:border-primary/50 focus:ring-primary/20 rounded-lg"
                    placeholder="Անուն Ազգանուն"
                    required
                    data-testid="signup-name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Էլ. փոստ
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-white/50 border-border focus:border-primary/50 focus:ring-primary/20 rounded-lg"
                    placeholder="email@example.com"
                    required
                    data-testid="signup-email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Գաղտնաբառ
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-white/50 border-border focus:border-primary/50 focus:ring-primary/20 rounded-lg"
                    placeholder="••••••••"
                    required
                    data-testid="signup-password"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Հաստատել գաղտնաբառը
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-white/50 border-border focus:border-primary/50 focus:ring-primary/20 rounded-lg"
                    placeholder="••••••••"
                    required
                    data-testid="signup-confirm-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-4 font-medium transition-all shadow-lg hover:shadow-primary/20 active:scale-95"
                data-testid="signup-submit"
              >
                Գրանցվել
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                Արդեն ունե՞ք հաշիվ։{' '}
                <Link 
                  to="/login" 
                  className="text-primary hover:underline font-medium"
                  data-testid="login-link"
                >
                  Մուտք
                </Link>
              </p>
            </div>
          </div>

          <div className="text-center mt-6">
            <Link 
              to="/" 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Վերադառնալ գլխավոր էջ
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
