import React, { useState, useEffect, useMemo } from 'react';
import { Product, CartItem } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialProducts';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { ProductCard } from '../components/ProductCard';
import { CartFloat } from '../components/CartFloat';
import { CartModal } from '../components/CartModal';
import { CheckoutModal } from '../components/CheckoutModal';
import { Footer } from '../components/Footer';
import { InstallPwaModal } from '../components/InstallPwaModal';
import { Search, Sparkles } from 'lucide-react';

export const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('rc_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Salva o carrinho no localStorage
  useEffect(() => {
    try {
      localStorage.setItem('rc_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('Erro ao salvar carrinho no localStorage', e);
    }
  }, [cart]);

  // Carrega produtos do Supabase se configurado
  useEffect(() => {
    async function loadProducts() {
      if (!isSupabaseConfigured || !supabase) return;
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('sort_order', { ascending: true });

        if (!error && data && data.length > 0) {
          const mapped: Product[] = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            price: Number(item.price),
            cat: item.category_name,
            desc: item.description || '',
            image_url: item.image_url || '/assets/pratos/combo-sushi-boat.jpg',
            is_available: item.is_available,
            sort_order: item.sort_order
          }));
          setProducts(mapped);
        }
      } catch (err) {
        console.warn('Não foi possível carregar do Supabase, usando catálogo local:', err);
      }
    }

    loadProducts();
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.name === product.name);
      if (existing) {
        return prev.map(item =>
          item.product.name === product.name
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    showToast(`${product.name} adicionado ao carrinho!`);
  };

  const handleUpdateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(index);
      return;
    }
    setCart(prev => {
      const next = [...prev];
      next[index].quantity = Math.min(99, quantity);
      return next;
    });
  };

  const handleRemoveItem = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const totalCartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  // Lista de Categorias únicas
  const categories = useMemo(() => {
    const list = Array.from(new Set(products.map(p => p.cat)));
    return ['Todos', ...list];
  }, [products]);

  // Pratos filtrados por Categoria e Busca
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = selectedCategory === 'Todos' || product.cat === selectedCategory;
      const matchesSearch = 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.desc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0c0a08] text-[#f8f0e4]">
      <Navbar onOpenCart={() => setIsCartOpen(true)} cartCount={totalCartCount} />
      
      <Hero />

      {/* Seção do Cardápio */}
      <main id="cardapio" className="max-w-6xl mx-auto px-4 py-16 flex-1 w-full">
        {/* Head */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#d8a84e] mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cardápio Contemporâneo</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#f8f0e4]">
              Seleção Gastronômica
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Pratos artesanais frescos preparados no momento do seu pedido.
            </p>
          </div>

          {/* Busca Rápida */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar no cardápio..."
              className="w-full bg-[#17100c] border border-[#593720] focus:border-[#d8a84e] text-xs text-white pl-10 pr-4 py-2.5 rounded-lg outline-none transition-colors"
            />
          </div>
        </div>

        {/* Filtros por Categoria */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-xs font-medium tracking-wide whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-[#f1d18b] to-[#c7953d] text-[#1a100a] font-bold shadow-lg shadow-[#d8a84e]/20'
                  : 'bg-[#17100c] text-zinc-400 border border-[#49301e] hover:border-[#d8a84e]/50 hover:text-white'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Grid de Pratos */}
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center text-zinc-400 border border-dashed border-[#49301e] rounded-xl p-8">
            <p className="font-serif text-lg text-zinc-300">Nenhum prato encontrado.</p>
            <span className="text-xs text-zinc-500 mt-1 block">Tente pesquisar com outro termo ou selecionar outra categoria.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.name}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />

      {/* Componentes Flutuantes & Modais */}
      <CartFloat count={totalCartCount} onClick={() => setIsCartOpen(true)} />

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        onOrderSuccess={() => {
          setCart([]);
          showToast('Pedido preparado com sucesso! Confirme no WhatsApp.');
        }}
      />

      <InstallPwaModal />

      {/* Toast Notificação */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-[#f5d38b] text-[#1a100a] text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
