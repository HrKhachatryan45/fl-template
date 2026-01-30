import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Heart, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import { ProductCard } from '../components/ProductCard';
import { toast } from 'sonner';
import { getFlowers, getFlowersFeatured } from '../services/api';

export const HomePage = () => {
  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
  // Main page content state
  const [mainPageContent, setMainPageContent] = useState(null);
  const [mainPageLoading, setMainPageLoading] = useState(true);
  const [featuredFlowers, setFeaturedFlowers] = useState([]);

  // Fetch featured flowers
  useEffect(() => {
    const fetchFeaturedFlowers = async () => {
      try {
        const data = await getFlowersFeatured({ page_size: 4 });
        setFeaturedFlowers(data.results?.slice(0, 4) || []);
      } catch (error) {
        console.error('Error fetching featured flowers:', error);
      }
    };
    fetchFeaturedFlowers();
  }, []);

  // Fetch main page content
  const fetchMainPageContent = async () => {
    setMainPageLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/main-page/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to fetch main page content');
      const data = await response.json();
      setMainPageContent(data);
    } catch (error) {
      console.error('Error fetching main page content:', error);
      toast.error('Չհաջողվեց բեռնել գլխավոր էջի տվյալները');
    } finally {
      setMainPageLoading(false);
    }
  };

  useEffect(() => {
    fetchMainPageContent();
  }, []);

  if (mainPageLoading) return <div className="text-center py-20">Բեռնվում է...</div>;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative min-h-[85vh] flex items-center bg-gradient-to-b from-[#FFFCF8] via-[#FFF0F5] to-[#FFFCF8]"
        data-testid="hero-section"
      >
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-6">
                <span className="inline-block bg-accent/30 text-accent-foreground px-4 py-2 rounded-full text-sm font-medium mb-6">
                  {mainPageContent?.title}
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-serif font-bold text-foreground mb-6 leading-tight tracking-tight">
                {mainPageContent?.subtitle}
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-xl">
                {mainPageContent?.description}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/products"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-4 font-medium transition-all shadow-lg hover:shadow-primary/20 inline-flex items-center justify-center gap-2 active:scale-95"
                  data-testid="hero-shop-button"
                >
                  <span>Գնել հիմա</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <Link
                  to="/contact"
                  className="bg-white text-primary border border-primary/20 hover:bg-primary/5 rounded-full px-8 py-4 font-medium transition-all inline-flex items-center justify-center"
                  data-testid="hero-contact-button"
                >
                  Կապ մեզ հետ
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-[0_20px_50px_rgb(0,0,0,0.1)]">
                <img
                  src={mainPageContent?.main_image}
                  alt="Գեղեցիկ ծաղիկներ"
                  className="w-full h-[600px] object-cover"
                  data-testid="hero-image"
                />
              </div>

              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-6 -left-6 bg-white/90 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-white/20"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-bold text-2xl text-foreground">500+</div>
                    <div className="text-sm text-muted-foreground">Գոհ հաճախորդներ</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Special Offer Section */}
      {mainPageContent?.special_offer && (
        <section className="py-16 md:py-24 bg-gradient-to-b from-secondary/5 to-transparent text-center">
          <div className="container mx-auto px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-primary text-primary-foreground rounded-3xl p-12 md:p-16 relative overflow-hidden inline-block"
            >
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
                {mainPageContent.special_offer}
              </h2>
              {mainPageContent.extra_text && (
                <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">{mainPageContent.extra_text}</p>
              )}
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-white text-primary hover:bg-white/90 rounded-full px-8 py-4 font-medium transition-all shadow-lg"
              >
                <span>Սկսել գնումները</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      

      {/* Featured Flowers Section */}
      <section className="py-16 md:py-24" data-testid="featured-products-section">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-semibold mb-4">
              Առաջարկվող ծաղիկներ
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Մեր լավագույն և ամենաշատ սիրված ծաղկային կոմպոզիցիաները
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredFlowers.map((flower, index) => (
              <motion.div
                key={flower.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <ProductCard product={flower} />
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-4 font-medium transition-all shadow-lg hover:shadow-primary/20"
            >
              <span>Դիտել բոլորը</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>


{/* Features Section */}
<section className="py-16 md:py-24 bg-white" data-testid="features-section">
  <div className="container mx-auto px-4 md:px-8">
    <div className="grid md:grid-cols-3 gap-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-secondary/10 p-8 rounded-2xl border border-secondary/20 text-center"
      >
        <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8 text-primary" />
        </div>
        <h3 className="font-serif text-xl font-semibold mb-2">Ձեռքով ընտրված</h3>
        <p className="text-muted-foreground">
          Յուրաքանչյուր ծաղիկ ուշադիր ընտրված է առավելագույն թարմությունը ապահովելու համար
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="bg-secondary/10 p-8 rounded-2xl border border-secondary/20 text-center"
      >
        <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Truck className="w-8 h-8 text-primary" />
        </div>
        <h3 className="font-serif text-xl font-semibold mb-2">Արագ առաքում</h3>
        <p className="text-muted-foreground">
          Երևան քաղաքում անվճար առաքում նույն օրը
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="bg-secondary/10 p-8 rounded-2xl border border-secondary/20 text-center"
      >
        <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h3 className="font-serif text-xl font-semibold mb-2">Բացառիկ որակ</h3>
        <p className="text-muted-foreground">
          Միայն բարձրորակ և թարմ ծաղիկներ մեր հաճախորդներին
        </p>
      </motion.div>
    </div>
  </div>
</section>


    </div>
  );
};