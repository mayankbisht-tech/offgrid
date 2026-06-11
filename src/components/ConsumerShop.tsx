import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  ArrowRight, 
  Star, 
  Plus, 
  Minus, 
  Trash2, 
  Check, 
  SlidersHorizontal, 
  MapPin, 
  CreditCard, 
  ChevronDown, 
  Info,
  ChevronRight,
  Sparkles,
  Heart
} from 'lucide-react';
import { Product, OrderItem } from '../types.js';

interface ConsumerShopProps {
  onNavigateToDashboard: (role: 'CONSUMER' | 'DESIGNER' | 'MANUFACTURER') => void;
  cart: any[];
  setCart: React.Dispatch<React.SetStateAction<any[]>>;
  productsList: Product[];
  refreshProducts: () => void;
  onPlaceOrderSuccess: (order: any) => void;
  categoryFilter: string;
  setCategoryFilter: (cat: string) => void;
  onOpenAuthModal: () => void;
}

export default function ConsumerShop({
  onNavigateToDashboard,
  cart,
  setCart,
  productsList,
  refreshProducts,
  onPlaceOrderSuccess,
  categoryFilter,
  setCategoryFilter,
  onOpenAuthModal
}: ConsumerShopProps) {
  // Category & Filter states inside product drop grid
  const [minPrice, setMinPrice] = useState<number>(200);
  const [maxPrice, setMaxPrice] = useState<number>(2500);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // SWR Infinite mock limit
  const [displayCount, setDisplayCount] = useState<number>(12);

  // View States
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [selectedColor, setSelectedColor] = useState<string>('#FFFFFF');
  const [quantity, setQuantity] = useState<number>(1);
  const [howItsMadeOpen, setHowItsMadeOpen] = useState<number>(0); // accordion index

  // Cart & Checkout panels
  const [cartOpen, setCartOpen] = useState<boolean>(false);
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);
  const [checkoutStep, setCheckoutStep] = useState<'address' | 'payment'>('address');

  // Checkout address variables
  const [addressLine, setAddressLine] = useState<string>('4th Floor, Sector 5, HSR Layout');
  const [city, setCity] = useState<string>('Bangalore');
  const [stateName, setStateName] = useState<string>('Karnataka');
  const [pincode, setPincode] = useState<string>('560102');
  const [phone, setPhone] = useState<string>('+91 9988776655');

  // Payment simulator states
  const [payMethod, setPayMethod] = useState<'razorpay' | 'stripe'>('razorpay');
  const [isProcessingPay, setIsProcessingPay] = useState<boolean>(false);
  const [upiIdSim, setUpiIdSim] = useState<string>('mayank@okaxis');
  const [cardNameSim, setCardNameSim] = useState<string>('Mayank Bisht');
  const [cardNumberSim, setCardNumberSim] = useState<string>('4321 0987 6543 2109');

  // Sync open-cart event
  useEffect(() => {
    const handleCartOpen = () => setCartOpen(true);
    window.addEventListener('open-cart', handleCartOpen);
    return () => window.removeEventListener('open-cart', handleCartOpen);
  }, []);

  // Filter and sort items calculated on the fly
  const filteredProducts = productsList.filter(p => {
    const matchesCategory = categoryFilter === 'all' || p.productType === categoryFilter;
    const price = p.baseCostINR + p.designerPriceINR;
    const matchesPrice = price >= minPrice && price <= maxPrice;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.designerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesPrice && matchesSearch;
  });

  if (sortBy === 'newest') {
    filteredProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (sortBy === 'price-low') {
    filteredProducts.sort((a, b) => (a.baseCostINR + a.designerPriceINR) - (b.baseCostINR + b.designerPriceINR));
  } else if (sortBy === 'price-high') {
    filteredProducts.sort((a, b) => (b.baseCostINR + b.designerPriceINR) - (a.baseCostINR + a.designerPriceINR));
  } else if (sortBy === 'popular') {
    filteredProducts.sort((a, b) => b.totalSold - a.totalSold);
  }

  const productsToRender = filteredProducts.slice(0, displayCount);

  // Cart helpers
  const addToCart = (product: Product, size: string, color: string, qty: number) => {
    const existing = cart.find(item => item.product.id === product.id && item.size === size && item.color === color);
    if (existing) {
      setCart(cart.map(item => item.product.id === product.id && item.size === size && item.color === color 
        ? { ...item, quantity: item.quantity + qty } : item
      ));
    } else {
      setCart([...cart, { product, size, color, quantity: qty }]);
    }
    setCartOpen(true);
  };

  const updateCartQty = (idx: number, delta: number) => {
    const updated = [...cart];
    updated[idx].quantity += delta;
    if (updated[idx].quantity <= 0) {
      updated.splice(idx, 1);
    }
    setCart(updated);
  };

  const removeCartItem = (idx: number) => {
    const updated = [...cart];
    updated.splice(idx, 1);
    setCart(updated);
  };

  const getSubtotal = () => {
    return cart.reduce((acc, item) => {
      const price = item.product.baseCostINR + item.product.designerPriceINR;
      return acc + (price * item.quantity);
    }, 0);
  };

  const getShipping = () => {
    return getSubtotal() > 999 || getSubtotal() === 0 ? 0 : 80;
  };

  const getTotal = () => {
    return getSubtotal() + getShipping();
  };

  const checkPincode = (val: string) => {
    setPincode(val);
    if (val.length === 6) {
      if (val.startsWith('11')) {
        setCity('New Delhi');
        setStateName('Delhi');
      } else if (val.startsWith('40')) {
        setCity('Mumbai');
        setStateName('Maharashtra');
      } else if (val.startsWith('56')) {
        setCity('Bangalore');
        setStateName('Karnataka');
      } else if (val.startsWith('60')) {
        setCity('Chennai');
        setStateName('Tamil Nadu');
      }
    }
  };

  const executeBuy = async () => {
    setIsProcessingPay(true);
    setTimeout(async () => {
      try {
        const orderItems: OrderItem[] = cart.map((item, i) => ({
          id: `itm-${Date.now()}-${i}`,
          productId: item.product.id,
          productTitle: item.product.title,
          productImage: item.product.image,
          designerName: item.product.designerName,
          quantity: item.quantity,
          priceINR: item.product.baseCostINR + item.product.designerPriceINR,
          size: item.size,
          color: item.color
        }));

        const bodyPayload = {
          consumerId: 'usr-6',
          consumerName: 'Mayank Bisht',
          consumerEmail: 'mayankbisht1107@gmail.com',
          items: orderItems,
          shippingAddress: {
            line1: addressLine,
            city,
            state: stateName,
            pincode,
            phone
          },
          subtotalINR: getSubtotal(),
          shippingINR: getShipping(),
          totalINR: getTotal(),
          paymentMethod: payMethod
        };

        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyPayload)
        });

        if (!response.ok) {
          throw new Error('Could not submit secure order.');
        }

        const dataOrder = await response.json();
        setCart([]);
        setCartOpen(false);
        setIsCheckingOut(false);
        onPlaceOrderSuccess(dataOrder);
      } catch (err) {
        alert('Order processing error. Please try again.');
        console.error(err);
      } finally {
        setIsProcessingPay(false);
      }
    }, 1500);
  };

  // 2B - Featured list lookup (Safeguard if none are featured)
  const featured = productsList.filter(p => p.featured).slice(0, 4);
  const heroFeaturedProducts = featured.length >= 4 ? featured : productsList.slice(0, 4);

  // 2C - Last 6 added products
  const lastAdditions = [...productsList]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  return (
    <div className="bg-surface text-on-surface min-h-screen font-body-md relative overflow-x-hidden flex flex-col">
      
      {/* 2B — HERO SPLIT (First Viewport, Minimalist, Elegant typography) */}
      <section className="border-b-4 border-outline grid grid-cols-1 lg:grid-cols-12 bg-surface lg:min-h-[58vh]">
        
        {/* Left Side: Solid words, no paragraph clutter */}
        <div className="lg:col-span-7 p-5 sm:p-8 lg:p-10 flex flex-col justify-center border-b-4 lg:border-b-0 lg:border-r-4 border-outline">
          <div className="space-y-0 select-none max-w-2xl">
            <h2 className="font-headline-lg text-[40px] sm:text-[58px] lg:text-[72px] font-black text-on-surface uppercase tracking-tight leading-[0.8]">
              WEAR
            </h2>
            <h2 className="font-headline-lg text-[40px] sm:text-[58px] lg:text-[72px] font-black text-on-surface uppercase tracking-tight leading-[0.8]">
              WHAT
            </h2>
            <h2 className="font-headline-lg text-[40px] sm:text-[58px] lg:text-[72px] font-black text-on-surface uppercase tracking-tight leading-[0.8]">
              THEY
            </h2>
            <h2 className="font-headline-lg text-[40px] sm:text-[58px] lg:text-[72px] font-black text-on-surface uppercase tracking-tight leading-[0.8]">
              CAN'T
            </h2>
            <h2 className="font-headline-lg text-[40px] sm:text-[58px] lg:text-[72px] font-black text-on-surface uppercase tracking-tight leading-[0.8]">
              PRINT.
            </h2>
          </div>

          <div className="mt-6">
            <a 
              href="#the-drop-grid"
              className="inline-block px-5 py-2.5 bg-primary hover:bg-primary-container text-on-primary font-headline-md font-black text-sm sm:text-base uppercase tracking-wider border-4 border-primary offset-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:offset-shadow transition-all cursor-pointer"
            >
              SHOP NOW ↗
            </a>
          </div>
        </div>

        {/* Right Side: Featured 2x2 Artwork Mosaic Grid */}
        <div className="lg:col-span-5 bg-on-surface p-6 sm:p-7 flex flex-col justify-between min-h-[320px]">
          <div>
            <span className="text-[10px] font-label-md text-secondary-container font-black uppercase tracking-widest block mb-3">
              ACTIVE DROP SELECTIONS
            </span>
            
            <div className="grid grid-cols-2 gap-3">
              {heroFeaturedProducts.map((p, idx) => (
                <div 
                  key={p.id || idx}
                  onClick={() => {
                    setActiveProduct(p);
                    setQuantity(1);
                  }}
                  className="bg-surface-container-lowest border-4 border-surface cursor-pointer overflow-hidden transform hover:rotate-1.5 hover:scale-102 transition-all relative group"
                >
                  <img 
                    src={p.image} 
                    alt={p.title} 
                    className="w-full h-28 sm:h-32 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-on-surface/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>

          <div className="text-right mt-4">
            <a 
              href="#the-drop-grid" 
              className="text-secondary-container font-label-md text-xs uppercase hover:underline inline-flex items-center gap-1.5 cursor-pointer font-black"
            >
              SEE ALL DROPS ↗
            </a>
          </div>
        </div>

      </section>

      {/* 2C — NEW DROPS TICKER */}
      <section className="bg-secondary border-b-4 border-on-surface h-11 flex items-center overflow-hidden select-none">
        <div className="whitespace-nowrap animate-marquee flex items-center text-on-secondary text-xs font-body-md font-bold uppercase tracking-wider">
          {lastAdditions.length > 0 ? (
            Array(4).fill(
              lastAdditions.map((p) => (
                <span key={p.id} className="mx-6 inline-block">
                  NEW DROP · {p.title} ₹{p.baseCostINR + p.designerPriceINR} ·
                </span>
              ))
            )
          ) : (
            <span>NEW DROPS ARRIVING DAILY · QUALITY GUARANTEED · ZERO MATERIAL WASTE · </span>
          )}
        </div>
      </section>

      {/* 2D — PRODUCT GRID ("THE DROP") */}
      <section id="the-drop-grid" className="py-12 px-4 sm:px-6 lg:px-12 max-w-7xl w-full mx-auto">
        
        {/* Header decoration */}
        <div className="mb-8 select-none">
          <h2 className="font-headline-lg font-black text-4xl sm:text-5xl text-on-surface uppercase tracking-tight relative inline-block">
            THE DROP
            <span className="absolute left-0 bottom-[-5px] h-1 bg-secondary-container w-[60%] block" />
          </h2>
        </div>

        {/* Minimal Filters & Search panel bar */}
        <div className="border-4 border-on-surface p-3.5 bg-surface-container-lowest mb-6 flex flex-wrap justify-between items-center gap-3 text-on-surface">
          
          {/* Quick search input */}
          <div className="flex-1 min-w-[200px]">
            <input 
              type="text" 
              placeholder="Search Drops..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-lowest border-2 border-on-surface p-2 text-xs font-body-md outline-none focus:bg-surface-container"
            />
          </div>

          {/* Quick sorting controls */}
          <div className="flex items-center gap-3">
            <span className="font-label-md text-xs uppercase font-bold text-on-surface/60">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border-2 border-on-surface bg-surface-container-lowest p-1.5 text-xs font-label-md font-bold cursor-pointer"
            >
              <option value="newest">Newest Releases</option>
              <option value="popular">Popular Purchases</option>
              <option value="price-low">Price: Low-High</option>
              <option value="price-high">Price: High-Low</option>
            </select>
          </div>
        </div>

        {/* Categories toggler strip */}
        <div className="flex flex-wrap gap-2 mb-6 select-none">
          {[
            { id: 'all', label: 'All drop releases' },
            { id: 'tshirt', label: 'Boxy Tees' },
            { id: 'hoodie', label: 'Sweaters & Hoodies' },
            { id: 'tote', label: 'Bags & Totes' },
            { id: 'poster', label: 'Creative Posters' },
            { id: 'phone_case', label: 'Phone skins' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`p-2 px-4 border-2 font-label-md text-xs font-bold uppercase transition-all duration-100 cursor-pointer ${
                categoryFilter === cat.id 
                  ? 'bg-on-surface text-surface-container-lowest border-on-surface shadow-sm' 
                  : 'bg-surface-container-lowest border-on-surface/20 text-on-surface/75 hover:bg-surface-container-low'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* The beautiful product list */}
        {productsToRender.length > 0 ? (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {productsToRender.map((p) => {
                const price = p.baseCostINR + p.designerPriceINR;
                return (
                  <div 
                    key={p.id}
                    className="group border-4 border-on-surface bg-surface-container-lowest flex flex-col justify-between transform hover:rotate-1 hover:scale-102 hover:shadow-brutal transition-all"
                  >
                    {/* Aspects 3:4 Image container */}
                    <div 
                      onClick={() => {
                        setActiveProduct(p);
                        setQuantity(1);
                      }}
                      className="aspect-[3/4] border-b-4 border-on-surface overflow-hidden bg-surface-container-low relative cursor-pointer"
                    >
                      <img 
                        src={p.image} 
                        alt={p.title} 
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* QUICK ADD overlay bar on image hover */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(p, 'M', '#FFFFFF', 1);
                        }}
                        className="absolute bottom-0 left-0 w-full bg-saffron text-ink py-2 uppercase font-mono text-[10px] font-black text-center tracking-wider opacity-0 group-hover:opacity-100 hover:bg-acid transition-all"
                      >
                        ⚡ QUICK ADD TO BAG
                      </button>
                    </div>

                    {/* Metadata summary */}
                    <div className="p-3 sm:p-4 flex flex-col justify-between flex-1">
                      <div>
                        <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
                          <span className="font-semibold text-ink/70">
                            by @{p.designerName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}
                          </span>
                        </div>
                        <h3 
                          onClick={() => {
                            setActiveProduct(p);
                            setQuantity(1);
                          }}
                          className="font-condensed font-black text-lg text-ink uppercase tracking-tight mt-1 line-clamp-1 cursor-pointer hover:text-saffron transition-colors"
                        >
                          {p.title}
                        </h3>
                      </div>

                      <div className="mt-4 flex justify-between items-center">
                        <span className="font-mono text-[14px] font-black text-saffron">
                          ₹{price}
                        </span>
                        <span className="text-[9px] font-mono bg-cream border border-ink/20 px-2 uppercase font-bold text-ink">
                          {p.productType}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load More Trigger SWR imitation */}
            {filteredProducts.length > displayCount && (
              <div className="text-center mt-8">
                <button
                  onClick={() => setDisplayCount(prev => prev + 8)}
                  className="w-full sm:w-auto px-8 py-3 bg-white text-ink hover:bg-ink hover:text-[#fff] font-mono text-xs font-black uppercase tracking-widest border-4 border-ink shadow-brutal transition-colors cursor-pointer"
                >
                  LOAD MORE ARTIFACTS
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="border-4 border-ink bg-white p-10 text-center shadow-brutal my-6 font-mono">
            <h4 className="text-xl font-bold uppercase">No listed drops match filters</h4>
            <p className="text-xs text-zinc-400 mt-2">Try resetting your search query or selections</p>
          </div>
        )}

      </section>

      {/* 2E — DESIGNER SPOTLIGHT SECTION */}
      <section className="bg-ink text-cream py-12 px-6 sm:px-12 select-none">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          <div className="md:col-span-12">
            <span className="text-saffron font-mono text-[10px] font-black tracking-widest uppercase">
              THIS MONTH'S CREATOR
            </span>
          </div>

          <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left">
            <div className="w-24 h-24 sm:w-28 sm:h-28 border-4 border-saffron bg-cream overflow-hidden shadow-md">
              <img 
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop" 
                alt="Priya K" 
                className="w-full h-full object-cover filter saturate-75"
              />
            </div>
            <h3 className="font-condensed font-black text-2xl sm:text-3xl uppercase text-cream tracking-tight mt-3">
              PRIYA K.
            </h3>
            <p className="text-xs font-mono text-zinc-400 mt-0.5">Mumbai · Graphic Designer</p>
          </div>

          <div className="md:col-span-8 flex flex-col justify-between h-full space-y-4">
            <p className="font-display font-medium text-xl sm:text-2xl italic text-[#FAF6F0] leading-snug">
              "I draw things that shouldn't exist in retail cycles, capturing matchbox graphics, typography, and neo-traditional Indian street aesthetics."
            </p>
            
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
              <div className="flex gap-3">
                {productsList.slice(0, 3).map((p, idx) => (
                  <div key={p.id || idx} className="w-10 h-14 border-2 border-white/20 bg-white/5 overflow-hidden">
                    <img src={p.image} className="w-full h-full object-cover" alt="prev" />
                  </div>
                ))}
              </div>
              <a 
                href="#the-drop-grid"
                className="px-6 py-3 bg-saffron hover:bg-cream hover:text-ink font-condensed font-bold text-xs uppercase text-white tracking-widest transition-all shadow-sm border-2 border-ink"
              >
                SEE HER DROPS ↗
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* 2F — HOW IT WORKS (3 steps, minimal, left border) */}
      <section className="py-12 px-6 sm:px-12 max-w-4xl mx-auto text-ink">
        <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest block mb-4">
          HOW IT WORKS
        </span>

        <div className="border-l-6 border-saffron pl-5 sm:pl-6 space-y-4 select-none leading-none">
          <div className="font-condensed font-black text-xl sm:text-2xl uppercase">
            01 — DESIGNER UPLOADS ARTWORK
          </div>
          <div className="font-condensed font-black text-xl sm:text-2xl uppercase">
            02 — YOU BUY THE DROP
          </div>
          <div className="font-condensed font-black text-xl sm:text-2xl uppercase text-saffron">
            03 — WE PRINT & SHIP IT
          </div>
        </div>
      </section>

      {/* Product Specification Detail Modal overlay */}
      {activeProduct && (
        <div className="fixed inset-0 bg-ink/75 z-40 flex items-center justify-center p-3 sm:p-5 backdrop-blur-sm">
          <div className="border-brutal bg-cream w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-brutal grid grid-cols-1 md:grid-cols-12 relative text-ink border-4 border-ink">
            
            <button 
              onClick={() => setActiveProduct(null)} 
              className="absolute top-4 right-4 w-9 h-9 bg-ink text-cream hover:bg-saffron flex items-center justify-center font-bold text-lg border-2 border-ink shadow-brutal select-none cursor-pointer z-20"
            >
              ✕
            </button>

            <div className="md:col-span-6 p-6 sm:p-8 bg-cream border-b-4 md:border-b-0 md:border-r-4 border-ink flex flex-col justify-center items-center">
              <div className="relative border-2 border-ink bg-white p-3 shadow-sm w-full font-mono">
                <img 
                  src={activeProduct.image} 
                  alt={activeProduct.title} 
                  className="w-full h-64 sm:h-72 object-cover border-2 border-ink"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="grid grid-cols-3 gap-2 w-full mt-6 text-center font-mono text-[9px] uppercase">
                <div className="p-2 border-2 border-ink bg-white">100% Cotton</div>
                <div className="p-2 border-2 border-ink bg-white">Eco Printed</div>
                <div className="p-2 border-2 border-ink bg-white">Direct printed</div>
              </div>
            </div>

            <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest block">
                  ACTIVE CAT: {activeProduct.productType}
                </span>
                <h3 className="font-condensed font-black text-3xl uppercase tracking-tight text-ink mt-2">
                  {activeProduct.title}
                </h3>
                <p className="text-[10px] font-mono text-saffron font-bold uppercase mt-1">
                  co-designed with @{activeProduct.designerName.toLowerCase().replace(/[^a-z]/g, '')}
                </p>

                <p className="font-body text-xs text-ink/75 leading-relaxed font-semibold mt-4">
                  {activeProduct.description || 'Pre-shrunk ring-spun boxy t-shirt with signature high dynamic range print registration.'}
                </p>

                {/* Variant styling controls */}
                <div className="border-t border-ink/10 my-4 pt-4">
                  <span className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-2">Select Garment Dimensions</span>
                  <div className="flex gap-2">
                    {['S', 'M', 'L', 'XL'].map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-9 h-9 border-2 font-mono text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                          selectedSize === size ? 'bg-ink text-white border-ink' : 'bg-white text-ink border-ink/20 hover:border-ink/55'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-ink/10 my-4 pt-4 flex gap-4">
                  <div className="w-1/2">
                    <span className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-2">Garment Color</span>
                    <div className="flex gap-2">
                      {['#FFFFFF', '#111827', '#E5E7EB'].map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`w-6 h-6 border-2 transition-all cursor-pointer ${
                            selectedColor === color ? 'ring-2 ring-saffron border-ink' : 'border-ink/10'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="w-1/2">
                    <span className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-2">Quantity</span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-7 h-7 border-2 border-ink text-xs font-bold hover:bg-zinc-100 flex items-center justify-center font-mono cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-mono text-xs font-bold w-6 text-center">{quantity}</span>
                      <button 
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-7 h-7 border-2 border-ink text-xs font-bold hover:bg-zinc-100 flex items-center justify-center font-mono cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center bg-white border-2 border-ink p-3 mb-4 font-mono">
                  <span className="text-xs font-bold">Total Price:</span>
                  <span className="font-condensed font-black text-xl text-saffron">
                    ₹{(activeProduct.baseCostINR + activeProduct.designerPriceINR) * quantity}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      addToCart(activeProduct, selectedSize, selectedColor, quantity);
                      setActiveProduct(null);
                    }}
                    className="w-full py-3 bg-saffron text-white font-mono font-black text-xs uppercase border-2 border-ink shadow-sm hover:shadow-brutal transition-all cursor-pointer"
                  >
                    ADD TO BAG
                  </button>
                  <button
                    onClick={() => {
                      addToCart(activeProduct, selectedSize, selectedColor, quantity);
                      setActiveProduct(null);
                      setCartOpen(true);
                    }}
                    className="w-full py-3 bg-ink text-cream font-mono font-black text-xs uppercase border-2 border-ink hover:bg-cream hover:text-ink transition-all cursor-pointer"
                  >
                    BUY DIRECTLY
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Cart sliding overlay drawer panel */}
      {cartOpen && (
        <div className="fixed inset-0 bg-ink/75 z-50 flex justify-end">
          <div className="bg-cream border-l-4 border-ink w-full max-w-md h-full flex flex-col justify-between text-ink p-6 select-none animate-slide-in relative">
            
            <button 
              onClick={() => {
                setCartOpen(false);
                setIsCheckingOut(false);
              }}
              className="absolute top-4 left-4 p-1.5 bg-white border-2 border-ink font-mono text-xs font-bold hover:bg-saffron hover:text-white transition-colors cursor-pointer"
            >
              ✕ CLOSE
            </button>

            {/* Title */}
            <div className="text-center pt-8 pb-4 border-b-2 border-ink">
              <span className="font-condensed text-2xl font-black uppercase">YOUR SHOPPING BAG</span>
              <p className="text-[10px] font-mono text-zinc-400 uppercase mt-0.5">DIRECT FROM INDEPENDENT CREATORS</p>
            </div>

            {/* Cart content list view */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 font-mono text-xs">
              {!isCheckingOut ? (
                /* SHOPPING ITEMS LIST */
                cart.length > 0 ? (
                  cart.map((item, idx) => {
                    const price = item.product.baseCostINR + item.product.designerPriceINR;
                    return (
                      <div key={idx} className="flex gap-3 border-2 border-ink bg-white p-3 shadow-sm">
                        <img 
                          src={item.product.image} 
                          alt={item.product.title} 
                          className="w-16 h-20 object-cover border border-ink"
                        />
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div>
                            <span className="font-condensed font-black text-sm uppercase block truncate text-ink">{item.product.title}</span>
                            <span className="text-[9px] text-[#FF6300] font-semibold block uppercase">by {item.product.designerName}</span>
                            <span className="text-[9px] text-zinc-400 block uppercase mt-0.5">Size: {item.size} | Color: {item.color === '#FFFFFF' ? 'White' : 'Active'}</span>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="font-bold text-saffron">₹{price}</span>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => updateCartQty(idx, -1)}
                                className="w-5 h-5 border border-ink bg-zinc-50 hover:bg-zinc-100 flex items-center justify-center font-bold"
                              >
                                -
                              </button>
                              <span className="font-semibold">{item.quantity}</span>
                              <button 
                                onClick={() => updateCartQty(idx, 1)}
                                className="w-5 h-5 border border-ink bg-zinc-50 hover:bg-zinc-100 flex items-center justify-center font-bold"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 text-zinc-400 uppercase">
                    Your Shopping Bag is empty.
                  </div>
                )
              ) : (
                /* CHECKOUT SECURE ADDRESS / PAYMENTS WIZARD */
                <div className="space-y-4 text-left font-mono">
                  
                  {/* Address step */}
                  {checkoutStep === 'address' && (
                    <div className="space-y-3">
                      <span className="block text-[11px] font-black uppercase text-saffron border-b border-ink/10 pb-1">
                        1. Verification Address
                      </span>
                      <div>
                        <label className="block text-[9.5px] font-bold uppercase text-ink/70 mb-1">Shipping coordinates details</label>
                        <input 
                          type="text"
                          value={addressLine}
                          onChange={(e) => setAddressLine(e.target.value)}
                          className="w-full bg-white border border-ink p-1.5 text-xs outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9.5px] font-bold uppercase text-ink/70 mb-1">State pin-index</label>
                          <input 
                            type="text"
                            maxLength={6}
                            placeholder="560102"
                            value={pincode}
                            onChange={(e) => checkPincode(e.target.value)}
                            className="w-full bg-white border border-ink p-1.5 text-xs outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9.5px] font-bold uppercase text-ink/70 mb-1">City Node</label>
                          <input 
                            type="text"
                            readOnly
                            value={city}
                            className="w-full bg-zinc-100 border border-ink p-1.5 text-xs text-zinc-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9.5px] font-bold uppercase text-ink/70 mb-1">Phone Number</label>
                        <input 
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-white border border-ink p-1.5 text-xs outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Payment step */}
                  {checkoutStep === 'payment' && (
                    <div className="space-y-3 animate-fade-in">
                      <span className="block text-[11px] font-black uppercase text-saffron border-b border-ink/10 pb-1">
                        2. Settle printed fulfillment parameters
                      </span>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setPayMethod('razorpay')}
                          className={`p-2 border font-bold text-[10px] uppercase text-center ${
                            payMethod === 'razorpay' ? 'bg-saffron text-white border-ink' : 'bg-white border-ink/20 text-ink'
                          }`}
                        >
                          UPI (Razorpay)
                        </button>
                        <button
                          type="button"
                          onClick={() => setPayMethod('stripe')}
                          className={`p-2 border font-bold text-[10px] uppercase text-center ${
                            payMethod === 'stripe' ? 'bg-saffron text-white border-ink' : 'bg-white border-ink/20 text-ink'
                          }`}
                        >
                          Credit Card (Stripe)
                        </button>
                      </div>

                      <div className="bg-white border border-ink p-3 space-y-3">
                        {payMethod === 'razorpay' ? (
                          <div>
                            <label className="block text-[9px] text-zinc-400 uppercase font-black mb-1">UPI Address alias</label>
                            <input 
                              type="text"
                              value={upiIdSim}
                              onChange={(e) => setUpiIdSim(e.target.value)}
                              className="w-full border border-ink p-1.5 text-xs font-mono"
                            />
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div>
                              <label className="block text-[9px] text-zinc-400 uppercase font-black mb-1">Cardholder name</label>
                              <input 
                                type="text"
                                value={cardNameSim}
                                onChange={(e) => setCardNameSim(e.target.value)}
                                className="w-full border border-ink p-1.5 text-xs font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] text-zinc-400 uppercase font-black mb-1">Card number digits</label>
                              <input 
                                type="text"
                                value={cardNumberSim}
                                onChange={(e) => setCardNumberSim(e.target.value)}
                                className="w-full border border-ink p-1.5 text-xs font-mono"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>

            {/* Price calculations review & trigger button */}
            <div className="p-4 border-t-4 border-ink bg-white font-mono text-xs text-ink">
              <div className="flex justify-between items-center bg-cream p-3 border-2 border-ink mb-4">
                <span className="font-bold">Total Bill:</span>
                <span className="font-condensed font-black text-lg">₹{getTotal()}</span>
              </div>

              {!isCheckingOut ? (
                <button
                  onClick={() => {
                    if (cart.length === 0) return;
                    setIsCheckingOut(true);
                    setCheckoutStep('address');
                  }}
                  disabled={cart.length === 0}
                  className="w-full py-3 bg-zinc-950 hover:bg-zinc-850 text-white font-bold uppercase tracking-wider text-xs border-2 border-ink shadow-brutal active:translate-x-[2px] disabled:opacity-40 cursor-pointer"
                >
                  SECURE CHECKOUT
                </button>
              ) : (
                <div className="space-y-2">
                  {checkoutStep === 'address' ? (
                    <button
                      onClick={() => setCheckoutStep('payment')}
                      className="w-full py-3 bg-zinc-950 hover:bg-zinc-850 text-white font-bold uppercase tracking-wider text-xs border-2 border-ink shadow-sm cursor-pointer"
                    >
                      CONTINUE TO PAYMENTS
                    </button>
                  ) : (
                    <button
                      onClick={executeBuy}
                      disabled={isProcessingPay}
                      className="w-full py-3.5 bg-saffron hover:bg-saffron/90 text-white font-extrabold uppercase tracking-wide text-xs border-brutal shadow-brutal active:translate-x-[2px] disabled:opacity-45 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isProcessingPay ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Verifying settlement...
                        </>
                      ) : (
                        <>
                          Confirm & Place order
                        </>
                      )}
                    </button>
                  )}
                  <button 
                    onClick={() => setIsCheckingOut(false)}
                    className="w-full text-center text-[10px] text-zinc-400 p-1 block uppercase underline"
                  >
                    ← Back to items list
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 2G — REVISED BLACK FOOTER (Clean, descriptive, high contrast) */}
      <footer className="bg-ink text-cream py-10 px-6 sm:px-12 mt-auto border-t-4 border-ink">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
          <div className="space-y-2 max-w-sm">
            <span className="font-condensed text-2xl font-black text-cream tracking-wider">OFFGRID</span>
            <p className="font-mono text-xs text-zinc-400 leading-normal font-medium">
              India's print-on-demand platform for independent creators. We coordinate digital block-printing and sustainable logistics.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 font-mono text-xs font-bold uppercase">
            <button onClick={() => { setCategoryFilter('all'); }} className="hover:text-acid cursor-pointer text-cream">Shop</button>
            <span className="text-white/10">/</span>
            <a href="#storefront-catalog" className="hover:text-acid text-cream">About</a>
            <span className="text-white/10">/</span>
            <a href="#storefront-catalog" className="hover:text-acid text-cream">Contact</a>
          </div>
        </div>
        <div className="max-w-6xl mx-auto border-t border-white/10 mt-6 pt-5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="font-mono text-[10px] text-zinc-500 font-bold uppercase">
            © 2025 OffGrid Co. Co-made with pride in India.
          </span>
          <button
            onClick={() => {
              onOpenAuthModal();
            }}
            className="px-5 py-2.5 bg-saffron text-white border-2 border-cream font-mono text-[11px] font-black uppercase tracking-wider hover:bg-cream hover:text-ink transition-all cursor-pointer"
          >
            SELL YOUR DESIGN
          </button>
        </div>
      </footer>

    </div>
  );
}
