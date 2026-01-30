import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  // Get the main image or first image from backend data
  const mainImage = product.images?.find(img => img.is_main)?.url || 
                    product.images?.[0]?.url || 
                    product.image ||
                    'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&q=80';
  
  // Handle price (backend uses price_amd, frontend might use price)
  const price = product.price_amd || product.price || 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart({
      ...product,
      price: price,
      price_on_sale:product.sale_price_amd || null,
      image: mainImage
    });
    toast.success('Ավելացվել է զամբյուղում', {
      description: product.name
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      data-testid={`product-card-${product.id}`}
    >
      <Link to={`/product/${product.id}`}>
        <div className="group relative bg-white rounded-2xl overflow-hidden border border-border/50 hover:border-primary/20 transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
          <div className="aspect-square overflow-hidden bg-muted">
            <img
              src={mainImage}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              data-testid={`product-image-${product.id}`}
            />
          </div>
          
          <div className="p-5">
            <div className="mb-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">
                {product.category}
              </span>
            </div>
            
            <h3 
              className="font-serif text-xl font-semibold mb-2 text-foreground group-hover:text-primary transition-colors"
              data-testid={`product-name-${product.id}`}
            >
              {product.name}
            </h3>
            
            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
              {product.description}
            </p>
            
            <div className="flex items-center justify-between">
              <span 
                className={` font-bold text-primary ${product.sale_price_amd ? 'line-through text-xl':'text-2xl'}`}
                data-testid={`product-price-${product.id}`}
              >
                {price.toLocaleString()} ֏
              </span>
               {product.sale_price_amd &&  <span 
                className="text-2xl font-bold text-primary "
                data-testid={`product-price-${product.id}`}
              >
                {product.sale_price_amd.toLocaleString()} ֏
              </span>}
              
              <button
                onClick={handleAddToCart}
                className="bg-primary text-primary-foreground p-3 rounded-full hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/20 active:scale-95"
                data-testid={`add-to-cart-${product.id}`}
              >
                <ShoppingCart className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {product.featured && (
            <div className="absolute top-4 left-4 bg-accent/90 backdrop-blur-sm text-accent-foreground px-3 py-1 rounded-full text-xs font-medium">
              Առաջարկվող
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
};
