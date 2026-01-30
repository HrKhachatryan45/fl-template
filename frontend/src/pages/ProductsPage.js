import React, { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { categories, colors } from '../data/flowers';
import { ProductCard } from '../components/ProductCard';
import { getFlowers } from '../services/api';
import { toast } from 'sonner';

export const ProductsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('բոլորը');
  const [selectedColor, setSelectedColor] = useState('բոլորը');
  const [priceRange, setPriceRange] = useState([0, 30000]);
  const [showFilters, setShowFilters] = useState(false);

  const [flowers, setFlowers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const pageSize = 21;
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = Math.ceil(totalCount / pageSize);

  const fetchFlowers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        page_size: pageSize,
      };

      if (selectedCategory !== 'բոլորը') params.category = selectedCategory;
      if (selectedColor !== 'բոլորը') params.color = selectedColor;
      if (priceRange[0] > 0) params.min_price = priceRange[0];
      if (priceRange[1] < 30000) params.max_price = priceRange[1];
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const data = await getFlowers(params);

      setFlowers(data.results || []);
      setTotalCount(data.count || 0);
    } catch (err) {
      console.error(err);
      toast.error('Չհաջողվեց բեռնել ծաղիկները');
    } finally {
      setLoading(false);
    }
  }, [page, selectedCategory, selectedColor, priceRange, searchQuery]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedCategory, selectedColor, priceRange, searchQuery]);

  // Fetch on page / filter change
  useEffect(() => {
    fetchFlowers();
  }, [fetchFlowers]);

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 md:px-8">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-center">
            Մեր ծաղիկները
          </h1>
          <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto">
            Ուսումնասիրեք մեր գեղեցիկ ծաղիկների հավաքածուն
          </p>
        </motion.div>

        {/* Search */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Որոնել ծաղիկներ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg"
          >
            <SlidersHorizontal className="w-5 h-5" />
            Ֆիլտրեր
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters */}
          <aside className={`lg:w-64 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl p-4 border">
              <h3 className="font-semibold mb-3">Կատեգորիա</h3>
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`block w-full text-left px-3 py-2 rounded ${
                    selectedCategory === c.id ? 'bg-primary text-white' : 'hover:bg-muted'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-xl p-4 border">
              <h3 className="font-semibold mb-3">Գույն</h3>
              {colors.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedColor(c.id)}
                  className={`block w-full text-left px-3 py-2 rounded ${
                    selectedColor === c.id ? 'bg-primary text-white' : 'hover:bg-muted'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </aside>

          {/* Products */}
          <div className="flex-1">
            <div className="mb-4 text-muted-foreground">
              Գտնվել է {totalCount} արդյունք
            </div>

            {loading ? (
              <div className="py-16 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : flowers.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">
                Ոչինչ չգտնվեց
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {flowers.map(flower => (
                    <ProductCard key={flower.id} product={flower} />
                  ))}
                </div>

                {/* Pagination */}
                <div className="mt-10 flex justify-center items-center gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="px-3 py-2 border rounded disabled:opacity-50"
                  >
                    <ChevronLeft />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .slice(Math.max(0, page - 3), page + 2)
                    .map(p => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`px-4 py-2 rounded ${
                          p === page ? 'bg-primary text-white' : 'border'
                        }`}
                      >
                        {p}
                      </button>
                    ))}

                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="px-3 py-2 border rounded disabled:opacity-50"
                  >
                    <ChevronRight />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};