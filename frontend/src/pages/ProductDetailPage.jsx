import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Heart, Share2, Check, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';
import { getFlower, getFlowers } from '../services/api';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await getFlower(id);
        setProduct(data);

        // Set main image or first image
        const mainImg = data.images?.find(img => img.is_main) || data.images?.[0];
        setSelectedImage(mainImg);

        // Fetch related products
        if (data.category) {
          const relatedData = await getFlowers({ 
            category: data.category,
            page_size: 4
          });
          const related = relatedData.results?.filter(f => f.id !== id).slice(0, 3) || [];
          setRelatedProducts(related);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Չհաջողվեց բեռնել ծաղիկը');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-lg">Բեռնվում է...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-serif font-bold mb-4">Ծաղիկը չգտնվեց</h2>
          <Link to="/products" className="text-primary hover:underline">
                Վերադառնալ ծաղիկներին
          </Link>
        </div>
      </div>
    );
  }

  const price = product.price_amd || product.price || 0;
  const price_on_sale = product.sale_price_amd 

  const handleAddToCart = () => {
    addToCart({
      ...product,
      price: price,
      image: selectedImage?.url,
      quantity:quantity
    }, quantity);
    toast.success('Ավելացվել է զամբյուղում', {
      description: `${product.name} - ${quantity} հատ`
    });
  };

const handleBuyNow = () => {
  navigate('/checkout', {
    state: {
      buyNowItem: {
        ...product,
        price: price,
        price_on_sale:price_on_sale,
        image: selectedImage?.url,
        quantity: quantity,
      }
    }
  });
};

const handleShare = async () => {
  const shareData = {
    title: document.title,
    text: "Տես այս ապրանքը",
    url: window.location.href,
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (err) {
      // user cancelled — do nothing
    }
  } else {
    // fallback for desktop
    await navigator.clipboard.writeText(window.location.href);
    alert("Հղումը պատճենվեց");
  }
};

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 md:px-8">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors"
          data-testid="back-button"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Վերադառնալ</span>
        </motion.button>

        <div className="grid md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="sticky top-24">
              <div className="rounded-3xl overflow-hidden shadow-[0_20px_50px_rgb(0,0,0,0.1)] mb-6">
                <img
                  src={selectedImage?.url || 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&q=80'}
                  alt={product.name}
                  className="w-full aspect-square object-cover"
                  data-testid="product-detail-image"
                />
              </div>

              {/* Image Gallery */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 mb-6">
                  {product.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(img)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage?.url === img.url ? 'border-primary' : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
              
              <div className="flex gap-4">
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                    isFavorite
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'border-border hover:bg-muted'
                  }`}
                  data-testid="favorite-button"
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                  <span>Սիրված</span>
                </button>
                
                <button
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-border hover:bg-muted transition-all"
                  data-testid="share-button"
                  onClick={handleShare}
                >
                  <Share2 className="w-5 h-5" />
                  <span>Կիսվել</span>
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="mb-4">
              <span className="inline-block bg-accent/30 text-accent-foreground px-4 py-1 rounded-full text-sm font-medium">
                {product.category}
              </span>
            </div>

            <h1 
              className="text-4xl md:text-5xl font-serif font-bold mb-4"
              data-testid="product-detail-name"
            >
              {product.name}
            </h1>

            <div className="flex items-baseline gap-4 mb-6">
              <span 
                className={` font-bold text-primary ${price_on_sale ? 'line-through text-2xl' : 'text-5xl'}`}
                data-testid="product-detail-price"
              >
                {price?.toLocaleString()} ֏
              </span>
            </div>
              {price_on_sale && <div className="flex items-baseline gap-4 mb-6">
              <span 
                className="text-5xl font-bold text-primary"
                data-testid="product-detail-price"
              >
                {price_on_sale?.toLocaleString()} ֏
              </span>
            </div>}

            <div className="mb-8">
              {product.is_free_delivery && (
                <div className="flex items-center gap-2 text-sm mb-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-muted-foreground">Անվճար առաքում</span>
                </div>
              )}
              {product.colors && product.colors.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground font-medium">Գույներ:</span>
                  <span className="text-muted-foreground">{product.colors.join(', ')}</span>
                </div>
              )}
            </div>

            <div className="prose prose-lg mb-8">
              <h3 className="font-serif text-xl font-semibold mb-3">Նկարագրություն</h3>
              <p 
                className="text-muted-foreground leading-relaxed"
                data-testid="product-detail-description"
              >
                {product.description}
              </p>
            </div>

            <div className="bg-secondary/10 rounded-2xl p-6 mb-8">
              <h3 className="font-serif text-lg font-semibold mb-4">Մանրամասներ</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Կատեգորիա</span>
                  <span className="font-medium">{product.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Գույն</span>
                  <span className="font-medium">{product.color}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Առկայություն</span>
                  <span className="font-medium text-green-600">Առկա</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Քանակ</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 rounded-lg border border-border hover:bg-muted transition-colors font-bold"
                    data-testid="quantity-decrease"
                  >
                    -
                  </button>
                  <span 
                    className="text-2xl font-bold w-16 text-center"
                    data-testid="quantity-value"
                  >
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 rounded-lg border border-border hover:bg-muted transition-colors font-bold"
                    data-testid="quantity-increase"
                  >
                    +
                  </button>
                </div>
              </div>

           <div className="space-y-4">
  <button
    onClick={handleAddToCart}
    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-4 font-medium transition-all shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-3 text-lg active:scale-95"
  >
    <ShoppingCart className="w-6 h-6" />
    <span>Ավելացնել զամբյուղ</span>
  </button>

  <button
    onClick={handleBuyNow}
    className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-full px-8 py-4 font-medium transition-all shadow-md flex items-center justify-center gap-3 text-lg active:scale-95"
  >
    Գնել հիմա
  </button>
</div>
            </div>
          </motion.div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-24">
            <h2 className="text-3xl font-serif font-bold mb-8">Նմանատիպ ծաղիկներ</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedProducts.map(flower => (
                <Link 
                  key={flower.id} 
                  to={`/product/${flower.id}`}
                  className="group"
                >
                  <div className="rounded-2xl overflow-hidden border border-border/50 hover:border-primary/20 transition-all shadow-sm hover:shadow-lg">
                    <div className="aspect-square overflow-hidden bg-muted">
                      <img
                        src={flower.image}
                        alt={flower.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-serif text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                        {flower.name}
                      </h3>
                      <span className="text-xl font-bold text-primary">
                        {flower?.price?.toLocaleString()} ֏
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
