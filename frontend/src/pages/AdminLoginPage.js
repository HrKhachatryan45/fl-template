import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Lock, Flower2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { isAdmin, adminLogin, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const result = await adminLogin(username, password);
    
    if (result.success) {
      toast.success('Դուք մուտք եք գործել ադմին պանել');
      navigate('/admin/dashboard');
    } else {
      toast.error(result.error || 'Սխալ մուտքանուն կամ գաղտնաբառ');
      setPassword('');
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#FFFCF8] via-[#FFF0F5] to-[#FFFCF8]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md px-4"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="bg-primary rounded-full p-3">
              <Flower2 className="w-8 h-8 text-primary-foreground" />
            </div>
            <span className="text-3xl font-serif font-bold text-primary">Ձաղիկ</span>
          </div>
          <h1 className="text-3xl font-serif font-bold mb-2">Ադմին պանել</h1>
          <p className="text-muted-foreground">Մուտքագրեք գաղտնաբառը</p>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-border/50 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Մուտքանուն
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border-border focus:border-primary/50 focus:ring-primary/20 rounded-lg"
                placeholder="admin"
                required
                disabled={isSubmitting || loading}
                data-testid="admin-username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Գաղտնաբառ
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/50 border-border focus:border-primary/50 focus:ring-primary/20 rounded-lg"
                  placeholder="••••••••"
                  required
                  disabled={isSubmitting || loading}
                  data-testid="admin-password"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Տեստային տվյալներ: admin / Admin123!
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-4 font-medium transition-all shadow-lg hover:shadow-primary/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="admin-login-submit"
            >
              {isSubmitting || loading ? 'Մուտք...' : 'Մուտք գործել'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
