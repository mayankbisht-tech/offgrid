import React, { useState, useEffect } from 'react';
import { 
  User, 
  Sparkles, 
  DollarSign, 
  Layers, 
  ShoppingBag, 
  Printer, 
  Truck, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  Plus, 
  Sliders, 
  TrendingUp, 
  Folder,
  SlidersHorizontal,
  MapPin,
  Check,
  AlertCircle,
  Info,
  Heart,
  Save,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { Product, Design, Order, Capability } from '../types.js';

interface DashboardsProps {
  activeRole: 'CONSUMER' | 'DESIGNER' | 'MANUFACTURER';
  onChangeRole: (role: 'CONSUMER' | 'DESIGNER' | 'MANUFACTURER') => void;
  productsList: Product[];
  refreshProducts: () => void;
  initialTab?: string;
  currentUser?: any;
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

export default function Dashboards({
  activeRole,
  onChangeRole,
  productsList,
  refreshProducts,
  initialTab = 'overview',
  currentUser,
  isLoggedIn,
  onLogout
}: DashboardsProps) {
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [capabilitiesList, setCapabilitiesList] = useState<Capability[]>([]);
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // User Profile Settings State
  const [profileName, setProfileName] = useState<string>(currentUser?.name || 'Mayank Bisht');
  const [profileEmail, setProfileEmail] = useState<string>(currentUser?.email || 'mayankbisht1107@gmail.com');
  const [profilePhone, setProfilePhone] = useState<string>('+91 9988776655');
  const [profileAvatar, setProfileAvatar] = useState<string>('');
  const [settingsSaved, setSettingsSaved] = useState<boolean>(false);

  // Launch product wizard state (Section 5G)
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [newTitle, setNewTitle] = useState<string>('Acid Bloom Overprint Tee');
  const [newDesc, setNewDesc] = useState<string>('Heavy organic cotton boxy tee printed manually with acid green concentric waves.');
  const [newProductType, setNewProductType] = useState<'tshirt' | 'hoodie' | 'tote' | 'poster'>('tshirt');
  const [newImageLink, setNewImageLink] = useState<string>('https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop');
  const [newMarkup, setNewMarkup] = useState<number>(450); // Designer markup price profit
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);

  // Verification state for manufacturer simulation
  const [manufacturerVerified, setManufacturerVerified] = useState<boolean>(true);

  // Sync with prop from App parent
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Sync profile settings initial values
  useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.name || 'Mayank Bisht');
      setProfileEmail(currentUser.email || 'mayankbisht1107@gmail.com');
    }
  }, [currentUser]);

  // Fetch orders and capabilities from Express database APIs
  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrdersList(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCapabilities = async () => {
    try {
      const res = await fetch('/api/capabilities');
      if (res.ok) {
        const data = await res.json();
        setCapabilitiesList(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchCapabilities();
  }, [activeRole]);

  // Launch product base costs calculations
  const getProductBaseCost = (type: string) => {
    switch (type) {
      case 'tshirt': return 350;
      case 'hoodie': return 750;
      case 'tote': return 190;
      case 'poster': return 120;
      default: return 300;
    }
  };

  // Submit product to server database Section 5G
  const executePublishProduct = async () => {
    setIsPublishing(true);
    setPublishedUrl(null);
    
    setTimeout(async () => {
      try {
        const designRes = await fetch('/api/designs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: newTitle,
            description: newDesc,
            fileUrl: newImageLink,
            fileType: 'PNG',
            tags: ['custom', 'new-release']
          })
        });

        if (!designRes.ok) throw new Error('Failed to output Design vector.');
        const designObj: Design = await designRes.json();

        const productRes = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            designId: designObj.id,
            title: `${newTitle} [Printed Apparel]`,
            description: newDesc,
            productType: newProductType,
            image: newImageLink,
            baseCostINR: getProductBaseCost(newProductType),
            designerPriceINR: newMarkup
          })
        });

        if (!productRes.ok) throw new Error('Failed to register retail Product.');
        const productObj: Product = await productRes.json();

        setPublishedUrl(productObj.slug);
        refreshProducts();
        setWizardStep(4); // success screen

      } catch (err) {
        alert('Product registration failure.');
        console.error(err);
      } finally {
        setIsPublishing(false);
      }
    }, 1500);
  };

  // Cycle orders fulfillment statuses (Manufacturer role)
  const handleAcceptOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'IN_PRODUCTION' })
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Status cycling controls for manufacturers Section 5H
  const cycleStatus = async (orderId: string, currentStatus: string) => {
    let nextStatus = 'IN_PRODUCTION';
    if (currentStatus === 'PAYMENT_CONFIRMED' || currentStatus === 'MATCHED_TO_MANUFACTURER') {
      nextStatus = 'IN_PRODUCTION';
    } else if (currentStatus === 'IN_PRODUCTION') {
      nextStatus = 'QUALITY_CHECK';
    } else if (currentStatus === 'QUALITY_CHECK') {
      nextStatus = 'SHIPPED';
    } else {
      return; 
    }

    try {
      const payload: any = { status: nextStatus };
      if (nextStatus === 'SHIPPED') {
        payload.trackingNumber = `INV-TRK-${Math.floor(100000 + Math.random() * 900000)}`;
        payload.courierName = 'Delhivery Logistics';
      }

      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Override Capability base cost values Section 5H
  const updateCapabilityPrice = async (capId: string, cost: number) => {
    try {
      const res = await fetch(`/api/capabilities/${capId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseCostINR: cost })
      });
      if (res.ok) {
        fetchCapabilities();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const saveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  // Sub-metrics computations for designer stats
  const getDesignerEarningsSum = () => {
    return ordersList.reduce((acc, o) => {
      if (o.status === 'CANCELLED') return acc;
      const designEarn = o.items.reduce((itemSum, item) => {
        const prod = productsList.find(p => p.id === item.productId);
        if (prod && prod.designerId === 'dsg-1') {
          return itemSum + (prod.designerPriceINR * item.quantity);
        }
        return itemSum;
      }, 0);
      return acc + designEarn;
    }, 18900); // seeded base
  };

  // Count of pending products in the order queue
  const getPendingQueueCount = () => {
    return ordersList.filter(o => o.status === 'PENDING_PAYMENT' || o.status === 'PAYMENT_CONFIRMED').length;
  };

  const getUnactiveDropsCount = () => {
    return productsList.filter(p => !p.active).length;
  };

  return (
    <div className="bg-cream text-ink min-h-screen flex flex-col font-body">
      
      {/* ═ THE LAYOUT COMPASS ═ */}
      {/* If Consumer: Full width with horizontal tab bar (No sidebar). */}
      {/* If Designer/Manufacturer: Left minimalist vertical sidebar layout. */}
      
      {activeRole === 'CONSUMER' ? (
        /* REVISION 4 — CONSUMER DASHBOARD LAYOUT */
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-8 flex-1">
          
          {/* Consumer Tab Navigation Bar */}
          <div className="flex border-b-2 border-ink mb-8 select-none">
            {[
              { id: 'overview', label: 'Orders' },
              { id: 'wishlist', label: 'Wishlist' },
              { id: 'settings', label: 'Settings' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-6 font-mono text-xs font-bold uppercase cursor-pointer border-b-4 transition-all ${
                  activeTab === tab.id 
                    ? 'border-saffron text-saffron bg-[#fff]/20' 
                    : 'border-transparent text-ink/65 hover:text-ink'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Welcome User Row */}
          <div className="bg-white border-2 border-ink p-6 mb-8 shadow-sm select-none">
            <h2 className="font-condensed font-black text-2xl uppercase tracking-tight">
              Hey {profileName} 👋
            </h2>
            <p className="font-sans text-xs text-ink/75 font-semibold mt-1">
              Here's exactly what's currently happening with your direct print orders.
            </p>
          </div>

          {/* Tab Content switch */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {ordersList.length > 0 ? (
                ordersList.map((order) => (
                  <div key={order.id} className="border-4 border-ink bg-white p-5 shadow-brutal flex flex-col gap-4 text-xs font-mono font-bold uppercase">
                    <div className="flex justify-between items-center border-b border-ink/10 pb-3 flex-wrap gap-2">
                      <div>
                        <span className="text-[9px] text-zinc-400 block">Identifier:</span>
                        <span className="text-sm font-black text-ink select-all">{order.id}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-400 block">Total Settlement:</span>
                        <span className="text-sm font-black text-ink">₹{order.totalINR}</span>
                      </div>
                      <div>
                        <span className={`px-2.5 py-1 text-[9px] border-2 font-black uppercase ${
                          order.status === 'DELIVERED' ? 'bg-acid text-ink border-ink' :
                          order.status === 'SHIPPED' ? 'bg-saffron text-white border-ink' : 'bg-cream text-saffron border-ink'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 select-none text-left">
                      {order.items.map((item, id) => (
                        <div key={id} className="flex gap-4 items-center bg-cream/30 p-2.5 border border-ink/10">
                          <img src={item.productImage} className="w-10 h-14 object-cover border border-ink" alt="thumb" />
                          <div>
                            <h4 className="font-condensed font-black text-sm text-ink leading-tight">{item.productTitle}</h4>
                            <p className="text-[9px] text-zinc-400 mt-1">Designer: {item.designerName} | Size: {item.size || 'M'}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {order.trackingNumber && (
                      <div className="bg-cream/40 p-3 border-2 border-ink text-[11px] leading-normal font-sans tracking-wide">
                        <span className="font-bold text-ink flex items-center gap-1 uppercase block text-[10px] font-mono">
                          <Truck size={14} className="text-saffron shrink-0" />
                          Delivery Logistics Coordinates
                        </span>
                        <p className="mt-1 font-semibold text-ink/75">
                          Carrier: {order.courierName || 'Delhivery'} • Waybill: <span className="font-mono font-black select-all text-xs text-ink">{order.trackingNumber}</span>
                        </p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="border-4 border-ink bg-white p-16 text-center shadow-brutal font-mono">
                  <span className="font-bold text-ink block">You haven't ordered yet.</span>
                  <a href="/" className="inline-block px-6 py-2.5 bg-saffron text-white font-condensed font-bold uppercase mt-4 border-2 border-ink shadow-brutal">
                    KEEP SHOPPING ↗
                  </a>
                </div>
              )}
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div>
              {productsList.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {productsList.slice(0, 3).map((p) => {
                    const price = p.baseCostINR + p.designerPriceINR;
                    return (
                      <div key={p.id} className="border-4 border-ink bg-white p-2.5 relative flex flex-col justify-between shadow-sm">
                        <button className="absolute top-4 right-4 p-1 bg-white border border-ink text-saffron rounded-full z-10">
                          <Heart size={14} fill="currentColor" />
                        </button>
                        <img src={p.image} className="w-full h-36 object-cover border border-ink" alt="saved" />
                        <div className="mt-3">
                          <h4 className="font-condensed font-bold text-sm uppercase truncate">{p.title}</h4>
                          <span className="font-mono font-black text-xs text-saffron block mt-1">₹{price}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="border-4 border-ink bg-white p-10 text-center font-mono">
                  Nothing saved yet. Explore our art catalog!
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-md bg-white border-brutal p-6 shadow-brutal">
              <h3 className="font-condensed font-black text-xl uppercase tracking-tight border-b-2 border-ink pb-2 mb-4">
                Buyer Settings
              </h3>
              
              <form onSubmit={saveSettings} className="space-y-4 font-mono text-xs text-left">
                <div>
                  <label className="block font-bold uppercase text-ink/75 mb-1.5">Your Name</label>
                  <input 
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-cream border-2 border-ink p-2 px-3 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-ink/75 mb-1.5">Email Contact</label>
                  <input 
                    type="email"
                    readOnly
                    value={profileEmail}
                    className="w-full bg-zinc-150 border-2 border-ink p-2 px-3 text-xs text-zinc-500"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-ink/75 mb-1.5">Mobile Number</label>
                  <input 
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full bg-cream border-2 border-ink p-2 px-3 text-xs"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-ink text-cream font-mono font-bold uppercase text-xs hover:shadow-brutal border-2 border-ink transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Save size={14} /> SAVE DETAILS
                  </button>
                </div>
              </form>

              {settingsSaved && (
                <div className="mt-3 p-2 text-center text-xs font-mono font-bold border-2 border-emerald-500 bg-emerald-50 text-emerald-600 animate-pulse uppercase">
                  ✓ Profile properties successfully saved!
                </div>
              )}
            </div>
          )}

        </div>
      ) : (
        /* REVISIONS 5 & 6 — SIDEBAR-BASED LAYOUT (DESIGNERS / MANUFACTURERS) */
        <div className="flex flex-col lg:flex-row flex-1">
          
          {/* Left Minimalist Sidebar Nav */}
          <aside className="w-full lg:w-[220px] bg-ink text-cream font-mono flex flex-col justify-between shrink-0 p-5 select-none md:min-h-[calc(100vh-120px)] border-r-4 border-ink">
            <div className="space-y-6">
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-black block">
                OFFGRID {activeRole}
              </span>

              {/* DESIGNER SIDEBAR NAV */}
              {activeRole === 'DESIGNER' && (
                <nav className="flex flex-col gap-2 text-xs">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'drops', label: 'My Drops' },
                    { id: 'wizard', label: '+ Upload Design', special: true },
                    { id: 'settings', label: 'Settings' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        if (item.id === 'wizard') setWizardStep(1);
                      }}
                      className={`w-full text-left p-2.5 transition-all cursor-pointer font-bold uppercase ${
                        item.special 
                          ? 'text-acid hover:underline font-black' 
                          : activeTab === item.id 
                          ? 'border-l-4 border-saffron bg-[#fff]/5 text-white pl-3' 
                          : 'text-zinc-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </nav>
              )}

              {/* MANUFACTURER SIDEBAR NAV */}
              {activeRole === 'MANUFACTURER' && (
                <nav className="flex flex-col gap-2 text-xs">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`w-full text-left p-2.5 transition-all cursor-pointer font-bold uppercase flex justify-between items-center ${
                      activeTab === 'overview' ? 'border-l-4 border-saffron bg-[#fff]/5 text-white pl-3' : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>Overview</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('queue')}
                    className={`w-full text-left p-2.5 transition-all cursor-pointer font-bold uppercase flex justify-between items-center ${
                      activeTab === 'queue' ? 'border-l-4 border-saffron bg-[#fff]/5 text-white pl-3' : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>Order Queue</span>
                    {getPendingQueueCount() > 0 && (
                      <span className="bg-terra text-white text-[9.5px] px-1.5 py-0.5 rounded-full font-mono font-black animate-pulse leading-none">
                        {getPendingQueueCount()}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab('capabilities')}
                    className={`w-full text-left p-2.5 transition-all cursor-pointer font-bold uppercase ${
                      activeTab === 'capabilities' ? 'border-l-4 border-saffron bg-[#fff]/5 text-white pl-3' : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Capabilities
                  </button>

                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`w-full text-left p-2.5 transition-all cursor-pointer font-bold uppercase ${
                      activeTab === 'settings' ? 'border-l-4 border-saffron bg-[#fff]/5 text-white pl-3' : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Settings
                  </button>
                </nav>
              )}
            </div>

            {/* Simulated log-out utility footer inside sidebar */}
            <div className="pt-4 border-t border-white/10 text-xs text-zinc-500 font-bold">
              <button 
                onClick={onLogout}
                className="text-saffron hover:text-white uppercase tracking-wider"
              >
                Log Out Core Session
              </button>
            </div>
          </aside>

          {/* Right Main Panel Content Workspace */}
          <main className="flex-1 p-6 sm:p-10 max-w-5xl w-full select-none text-ink">
            
            {/* MANU_PENDING HOLDING VIEW SIMULATION (If unverified) */}
            {activeRole === 'MANUFACTURER' && !manufacturerVerified ? (
              <div className="min-h-[400px] flex items-center justify-center p-4">
                <div className="bg-ink text-cream border-brutal p-8 max-w-lg w-full text-center space-y-6 shadow-brutal font-mono">
                  <span className="text-4xl inline-block animate-bounce">⏳</span>
                  <h3 className="font-condensed font-black text-2xl uppercase tracking-wider text-saffron">
                    Application Under Review
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-semibold">
                    Our team is currently verifying your print-node business details. This typically completes in 24–48 hours.
                  </p>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    We'll dispatch an email to <strong className="text-white">{profileEmail}</strong> once you're approved and ready to process active drops.
                  </p>
                  
                  <div className="flex gap-3 justify-center pt-4 text-xs font-bold font-mono">
                    <button 
                      onClick={() => setManufacturerVerified(true)}
                      className="px-4 py-2 bg-saffron text-white border border-cream uppercase hover:bg-white hover:text-ink cursor-pointer"
                    >
                      Bypass Verification (Admin)
                    </button>
                    <button 
                      onClick={onLogout}
                      className="px-4 py-2 bg-white/10 text-cream border border-white/20 uppercase hover:bg-white/20 cursor-pointer"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* ACTIVE BOARD PAGES */
              <>
                
                {/* 1. DESIGNER OVERVIEW PAGE */}
                {activeRole === 'DESIGNER' && activeTab === 'overview' && (
                  <div className="space-y-8 animate-fade-in text-left">
                    <div className="flex justify-between items-center">
                      <span className="font-condensed text-3xl font-black uppercase text-ink">
                        STATISTICAL GRAPH OVERVIEW
                      </span>
                      <span className="font-mono text-[10px] text-zinc-400 font-bold uppercase">
                        Current Frame: Jun 2026
                      </span>
                    </div>

                    {/* 3 Metric cards block */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono select-none">
                      <div className="bg-ink text-[#fff] border-4 border-solid border-saffron p-6 shadow-sm">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">THIS MONTH</span>
                        <div className="font-condensed font-black text-3xl text-acid">₹3,240</div>
                        <span className="text-[9px] text-[#C8F000] font-semibold mt-1 block">+12% vs last cycle</span>
                      </div>

                      <div className="bg-ink text-[#fff] border-4 border-solid border-saffron p-6 shadow-sm">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">ALL TIME</span>
                        <div className="font-condensed font-black text-3xl text-saffron">₹{getDesignerEarningsSum()}</div>
                        <span className="text-[9px] text-zinc-400 font-semibold mt-1 block">34 drop releases sold</span>
                      </div>

                      <div className="bg-ink text-[#fff] border-4 border-solid border-saffron p-6 shadow-sm">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">PENDING PAYOUTS</span>
                        <div className="font-condensed font-black text-3xl text-[#fff]">₹1,200</div>
                        <span className="text-[9px] text-amber-500 font-semibold mt-1 block">Settle Estimate: 3 Days</span>
                      </div>
                    </div>

                    {/* Recent Orders section */}
                    <div className="space-y-3 font-mono text-xs">
                      <h4 className="font-black uppercase tracking-wider text-ink/70">RECENT DISPATCH SALES</h4>
                      <div className="border-4 border-ink bg-white divide-y-2 divide-ink/10">
                        {ordersList.slice(0, 3).map((o, idx) => (
                          <div key={idx} className="p-3 px-4 flex justify-between items-center gap-4 flex-wrap">
                            <span className="font-bold text-ink uppercase font-condensed text-sm">
                              {o.items[0]?.productTitle || 'Typography Graphic Tee'}
                            </span>
                            <span className="text-zinc-400">{o.items[0]?.size || 'M'}/White</span>
                            <span className="font-bold">₹{o.subtotalINR}</span>
                            <span className="bg-cream border border-ink text-[9px] px-2 py-0.5 rounded-sm text-saffron font-bold text-right uppercase">
                              {o.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Top seller ranks list */}
                    <div className="space-y-3 font-mono text-xs text-left">
                      <h4 className="font-black uppercase tracking-wider text-ink/70">TOP GRAPHIC RELEASES</h4>
                      <div className="space-y-2">
                        {[
                          { rank: 1, title: 'Acid Bloom Overprint Tee', sales: 32, revenue: '₹25,568' },
                          { rank: 2, title: 'Concrete Block Zip Hoodie', sales: 18, revenue: '₹26,982' },
                          { rank: 3, title: 'Void Typography Canvas Tote', sales: 11, revenue: '₹5,489' }
                        ].map((r) => (
                          <div key={r.rank} className="flex gap-4 items-center bg-white border-2 border-ink p-3 shadow-sm justify-between">
                            <div className="flex gap-3 items-center">
                              <span className="w-6 h-6 bg-saffron text-white flex items-center justify-center font-bold text-[11px]">
                                {r.rank}
                              </span>
                              <span className="font-condensed font-black text-[13px] uppercase">{r.title}</span>
                            </div>
                            <div className="flex gap-8 text-[11px]">
                              <span>{r.sales} SOLD</span>
                              <span className="font-bold text-saffron">{r.revenue}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. DESIGNER MY DROPS VIEW */}
                {activeRole === 'DESIGNER' && activeTab === 'drops' && (
                  <div className="space-y-6 text-left animate-fade-in">
                    <div className="flex justify-between items-center">
                      <h3 className="font-condensed text-3xl font-black uppercase text-ink">Active listed artwork drops</h3>
                      <button 
                        onClick={() => { setActiveTab('wizard'); setWizardStep(1); }}
                        className="p-2 bg-saffron text-white font-mono text-[11px] uppercase font-bold border-2 border-ink shadow-sm"
                      >
                        + Create Drop
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      {productsList.slice(0, 4).map((p) => {
                        const total = p.baseCostINR + p.designerPriceINR;
                        return (
                          <div key={p.id} className="border-4 border-ink bg-white flex flex-col justify-between shadow-sm">
                            <div className="p-2 border-b-2 border-ink bg-cream">
                              <img src={p.image} className="w-full h-32 object-cover border border-ink" alt="cover" />
                            </div>
                            <div className="p-3 flex-1 flex flex-col justify-between font-mono text-xs">
                              <div>
                                <h4 className="font-condensed font-black text-sm uppercase truncate text-ink">{p.title}</h4>
                                <span className="text-[10px] text-zinc-400 block uppercase mt-0.5">{p.productType}</span>
                              </div>

                              <div className="flex justify-between items-center mt-4 pt-2 border-t border-ink/10">
                                <span className="font-bold">₹{total}</span>
                                <span className="text-emerald-500 font-bold uppercase text-[9px]">ACTIVE DROP</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. DESIGNER UPLOAD WIZARD */}
                {activeRole === 'DESIGNER' && activeTab === 'wizard' && (
                  <div className="space-y-6 text-left animate-fade-in max-w-lg mx-auto bg-white border-4 border-ink p-6 shadow-brutal">
                    
                    {/* Steps title */}
                    <div className="border-b-2 border-ink pb-3 mb-6 flex justify-between items-center">
                      <div>
                        <span className="text-[9.5px] font-mono text-zinc-400 font-bold uppercase">Apparel designer space</span>
                        <h3 className="font-condensed font-black text-xl uppercase tracking-tight text-ink">LAUNCH NEW DROP ARTIFACT</h3>
                      </div>
                      <span className="font-mono text-xs text-saffron font-black">Step {wizardStep}/4</span>
                    </div>

                    {/* Progress bars */}
                    <div className="flex gap-1 h-1.5 bg-cream/50 mb-6">
                      {[1, 2, 3, 4].map((step) => (
                        <div key={step} className={`flex-1 transition-all ${wizardStep >= step ? 'bg-saffron' : 'bg-ink/5'}`} />
                      ))}
                    </div>

                    {/* STEP 1: Specs */}
                    {wizardStep === 1 && (
                      <div className="space-y-4 font-mono text-xs">
                        <div>
                          <label className="block font-bold uppercase text-ink/75 mb-1.5">Garment Art Title</label>
                          <input 
                            type="text" 
                            required
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="w-full bg-cream border-2 border-ink p-2 px-3 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block font-bold uppercase text-ink/75 mb-1.5">Design Description details</label>
                          <textarea 
                            rows={3}
                            value={newDesc}
                            onChange={(e) => setNewDesc(e.target.value)}
                            className="w-full bg-cream border-2 border-ink p-2 px-3 text-xs resize-none"
                          />
                        </div>
                        <button 
                          onClick={() => setWizardStep(2)}
                          className="w-full py-3 bg-ink text-cream font-bold uppercase text-xs border-2 border-ink hover:bg-cream hover:text-ink transition-all cursor-pointer"
                        >
                          Step 2: Base Selection ➔
                        </button>
                      </div>
                    )}

                    {/* STEP 2: Product base selection */}
                    {wizardStep === 2 && (
                      <div className="space-y-4 font-mono text-xs">
                        <div>
                          <label className="block font-bold uppercase text-ink/75 mb-2">Configure Garment base apparel</label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { id: 'tshirt', label: 'Boxy Tee', cost: 350 },
                              { id: 'hoodie', label: 'Overprint Hoodie', cost: 750 },
                              { id: 'tote', label: 'Canvas Bag', cost: 190 },
                              { id: 'poster', label: 'Brutalist Poster', cost: 120 }
                            ].map((item) => (
                              <button
                                key={item.id}
                                onClick={() => setNewProductType(item.id as any)}
                                className={`p-3 border-2 text-left transition-all rounded-none ${
                                  newProductType === item.id ? 'bg-ink text-white border-ink shadow-sm' : 'bg-cream border-transparent text-ink hover:bg-cream/50'
                                }`}
                              >
                                <strong className="block text-[11px] uppercase">{item.label}</strong>
                                <span className="text-[9px] text-zinc-400">Node Base cost: ₹{item.cost}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block font-bold uppercase text-ink/75 mb-1.5">Simulation mockup link URL</label>
                          <input 
                            type="url"
                            value={newImageLink}
                            onChange={(e) => setNewImageLink(e.target.value)}
                            className="w-full bg-cream border-2 border-ink p-2 px-3 text-xs"
                          />
                        </div>

                        <div className="flex gap-2">
                          <button 
                            onClick={() => setWizardStep(1)}
                            className="w-1/3 py-2.5 bg-white border-2 border-ink font-bold uppercase text-xs"
                          >
                            ← Back
                          </button>
                          <button 
                            onClick={() => setWizardStep(3)}
                            className="flex-1 py-2.5 bg-ink text-white font-bold uppercase text-xs border-2 border-ink hover:bg-cream hover:text-ink transition-all cursor-pointer"
                          >
                            Step 3: Royalties custom markup ➔
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: Royalties setup markup */}
                    {wizardStep === 3 && (
                      <div className="space-y-4 font-mono text-xs">
                        <div>
                          <label className="block font-bold uppercase text-ink/75 mb-1.5">Configure Designer Profits Margin (Markup)</label>
                          <div className="flex items-center gap-3 bg-cream p-3 border-2 border-ink mb-2">
                            <span className="font-bold text-ink">₹</span>
                            <input 
                              type="number"
                              value={newMarkup}
                              onChange={(e) => setNewMarkup(parseInt(e.target.value) || 0)}
                              className="w-full bg-transparent border-none text-sm outline-none font-bold"
                            />
                          </div>
                        </div>

                        <div className="bg-[#FAF6F0] p-3 border border-ink/15 space-y-2">
                          <div className="flex justify-between text-[11px]">
                            <span>Apparel Cost Base:</span>
                            <span>₹{getProductBaseCost(newProductType)}</span>
                          </div>
                          <div className="flex justify-between text-[11px]">
                            <span>Artist Profit Portion:</span>
                            <span>+ ₹{newMarkup}</span>
                          </div>
                          <div className="flex justify-between border-t border-ink/10 pt-2 font-bold text-xs text-saffron">
                            <span>Final Buyer Price Tag:</span>
                            <span>= ₹{getProductBaseCost(newProductType) + newMarkup}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button 
                            onClick={() => setWizardStep(2)}
                            className="w-1/3 py-2.5 bg-white border-2 border-ink font-bold uppercase text-xs"
                          >
                            ← Back
                          </button>
                          <button 
                            onClick={executePublishProduct}
                            disabled={isPublishing}
                            className="flex-1 py-2.5 bg-saffron text-white border-2 border-ink font-bold uppercase text-xs hover:shadow-brutal transition-all cursor-pointer flex items-center justify-center gap-2"
                          >
                            {isPublishing ? (
                              <>
                                <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                Publishing Drop to Storefront...
                              </>
                            ) : (
                              'BUILD & PUBLISH ACTIVE DROP'
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 4: Finish Success screen */}
                    {wizardStep === 4 && (
                      <div className="space-y-4 text-center font-mono py-4">
                        <span className="text-4xl inline-block filter saturate-75">🎉</span>
                        <h4 className="font-condensed font-black text-xl uppercase mt-2 text-emerald-500">
                          DROP REGISTERED SUCCESSFULLY!
                        </h4>
                        <p className="text-xs text-zinc-400 font-semibold leading-relaxed">
                          Your design has been processed and listed directly onto the OffGrid public shopper catalog storefront feed.
                        </p>
                        
                        <div className="p-3 bg-cream border border-ink/10 select-all font-mono text-[10px] text-zinc-500">
                          Route identifier code: /{publishedUrl || 'slug'}
                        </div>

                        <button 
                          onClick={() => {
                            setActiveTab('drops');
                          }}
                          className="w-full py-3 bg-ink text-cream font-bold uppercase text-xs border-2 border-ink shadow-brutal hover:bg-cream hover:text-ink transition-all cursor-pointer"
                        >
                          View active Listed storefront drops
                        </button>
                      </div>
                    )}

                  </div>
                )}

                {/* 4. MANUFACTURER OVERVIEW BOARD */}
                {activeRole === 'MANUFACTURER' && activeTab === 'overview' && (
                  <div className="space-y-8 text-left animate-fade-in">
                    <span className="font-condensed text-3xl font-black uppercase text-ink block">
                      FACTORY NODE STATUS REPORT
                    </span>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
                      <div className="border-4 border-ink bg-white p-5 shadow-sm text-ink">
                        <span className="text-[10.5px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">ACTIVE PRINT JOBS</span>
                        <div className="font-condensed text-3xl font-black text-saffron">7</div>
                        <span className="text-[9.5px] text-zinc-500 mt-1 block">3 new unaccepted matching orders</span>
                      </div>
                      <div className="border-4 border-ink bg-white p-5 shadow-sm text-ink">
                        <span className="text-[10.5px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">MONTHLY SETTLED COST</span>
                        <div className="font-condensed text-3xl font-black text-emerald-500">₹14,320</div>
                        <span className="text-[9.5px] text-emerald-600 mt-1 block">8 completed direct deliveries</span>
                      </div>
                      <div className="border-4 border-ink bg-white p-5 shadow-sm text-ink">
                        <span className="text-[10.5px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">FACILITY CAPACITY SCALE</span>
                        <div className="font-condensed text-3xl font-black text-ink mb-1">78% CAPACITY</div>
                        
                        {/* CSS Progress bar layout */}
                        <div className="w-full bg-zinc-200 h-2 mt-2">
                          <div className="bg-saffron h-full" style={{ width: '78%' }} />
                        </div>
                        <span className="text-[9px] text-zinc-500 mt-1 block">6/8 direct machinery slots allocated</span>
                      </div>
                    </div>

                    {/* NEW ORDERS QUEUE Section 5H */}
                    <div className="space-y-4">
                      <div className="border-b-2 border-ink pb-2">
                        <h4 className="font-condensed text-xl font-black uppercase text-ink">
                          NEW INCOMING DROPS IN REGISTERED REGION ({getPendingQueueCount()})
                        </h4>
                        <p className="text-[10.5px] font-mono text-zinc-400 mt-0.5">Accept to process direct raw base print registrations</p>
                      </div>

                      <div className="space-y-3 font-mono text-xs">
                        {ordersList.filter(o => o.status === 'PENDING_PAYMENT' || o.status === 'PAYMENT_CONFIRMED').map((o) => (
                          <div key={o.id} className="border-2 border-ink bg-white p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                              <strong className="block text-ink text-sm uppercase">{o.id}</strong>
                              <span className="block text-zinc-400 text-[10px] uppercase mt-0.5">
                                {o.items[0]?.productTitle || 'Typography Print'} • x{o.items[0]?.quantity || 1} units
                              </span>
                            </div>
                            <div className="flex gap-3 items-center w-full sm:w-auto justify-end">
                              <span className="text-[10px] text-zinc-400 mr-2 uppercase">Due in 5 Days</span>
                              <button
                                onClick={() => handleAcceptOrder(o.id)}
                                className="px-4 py-2 bg-acid hover:bg-acid/95 text-ink font-bold uppercase tracking-wider border-2 border-ink text-[10.5px] cursor-pointer"
                              >
                                [ACCEPT WORK]
                              </button>
                            </div>
                          </div>
                        ))}

                        {getPendingQueueCount() === 0 && (
                          <div className="p-10 border-2 border-dashed border-ink/40 text-center font-mono text-zinc-400 bg-white">
                            No unallocated order drops matches in your region presently.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. MANUFACTURER ORDER QUEUE QUEUE */}
                {activeRole === 'MANUFACTURER' && activeTab === 'queue' && (
                  <div className="space-y-6 text-left animate-fade-in font-mono text-xs">
                    <h3 className="font-condensed text-3xl font-black uppercase text-ink">ACTIVE FACTORY IN-PRODUCTION QUEUE</h3>
                    
                    <div className="space-y-4">
                      {ordersList.map((o) => (
                        <div key={o.id} className="border-4 border-ink bg-[#fff] p-4 flex flex-col gap-3 font-mono">
                          <div className="flex justify-between items-center border-b border-ink/10 pb-2">
                            <div>
                              <span className="text-[10px] text-zinc-400">Order ID:</span>
                              <strong className="block uppercase text-sm">{o.id}</strong>
                            </div>
                            <div>
                              <span className="text-[10px] text-zinc-400">Status:</span>
                              <span className="block px-2 py-0.5 bg-cream border border-ink text-saffron uppercase font-bold text-[10px]">
                                {o.status}
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center flex-wrap gap-4 pt-1">
                            <div>
                              <span className="text-zinc-500 font-semibold block uppercase">Items configured:</span>
                              <span className="font-sans text-[11.5px] font-bold text-ink uppercase">
                                {o.items.map(i => `${i.productTitle} (${i.size || 'M'})`).join(', ')}
                              </span>
                            </div>
                            
                            <div className="text-right">
                              {o.status !== 'DELIVERED' && o.status !== 'SHIPPED' ? (
                                <button
                                  onClick={() => cycleStatus(o.id, o.status)}
                                  className="px-4 py-2 bg-saffron text-white border-2 border-ink font-bold uppercase hover:shadow-sm cursor-pointer"
                                >
                                  Cycle Status (Next ➔)
                                </button>
                              ) : (
                                <span className="text-emerald-500 font-black uppercase text-[10px]">TERMINAL CYCLE DISPATCHED</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. MANUFACTURER CAPABILITIES VIEW */}
                {activeRole === 'MANUFACTURER' && activeTab === 'capabilities' && (
                  <div className="space-y-6 text-left animate-fade-in">
                    <div className="border-b-2 border-ink pb-2">
                      <h3 className="font-condensed text-3xl font-black uppercase text-ink">Print Node Machinery profiles</h3>
                      <p className="text-[10.5px] font-mono text-zinc-400 mt-0.5">Manage direct pricing margins for active print styles</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
                      {capabilitiesList.map((cap) => (
                        <div key={cap.id} className="border-4 border-ink bg-white p-4 shadow-sm flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-center">
                              <span className="text-saffron font-bold text-sm tracking-tight uppercase">
                                Style Node: {cap.printType}
                              </span>
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-500 border border-emerald-500 rounded-sm text-[9.5px]">
                                ACTIVE
                              </span>
                            </div>

                            <p className="text-zinc-400 font-semibold uppercase mt-3 text-[10px]">Supported bases:</p>
                            <div className="flex flex-wrap gap-1 mt-1 text-[9px]">
                              {cap.productTypes.map((t, idx) => (
                                <span key={idx} className="bg-cream p-1 border border-ink/10 uppercase">
                                  {t}
                                </span>
                              ))}
                            </div>

                            <div className="mt-4 pt-3 border-t border-ink/10 space-y-1 text-ink/70 text-[10px]">
                              <div>Min Order units scale: <strong className="text-ink">{cap.minOrderQty} pieces</strong></div>
                              <div>Typical turnaround: <strong className="text-ink">{cap.turnaroundDays} Days</strong></div>
                            </div>
                          </div>

                          <div className="mt-6 pt-3 border-t-2 border-ink flex items-center justify-between gap-4">
                            <span>Base print cost:</span>
                            <div className="flex items-center gap-1">
                              <span className="font-bold">₹</span>
                              <input 
                                type="number" 
                                value={cap.baseCostINR} 
                                onChange={(e) => updateCapabilityPrice(cap.id, parseInt(e.target.value) || 120)}
                                className="w-16 bg-cream border border-ink text-center p-1 text-xs font-bold"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 7. ALL ROLES SETTINGS PANEL */}
                {activeTab === 'settings' && (
                  <div className="max-w-md bg-white border-brutal p-6 shadow-brutal text-left animate-fade-in">
                    <h3 className="font-condensed font-black text-xl uppercase tracking-tight border-b-2 border-ink pb-2 mb-4">
                      Operator Settings
                    </h3>
                    
                    <form onSubmit={saveSettings} className="space-y-4 font-mono text-xs text-left">
                      <div>
                        <label className="block font-bold uppercase text-ink/75 mb-1.5">Profile alias</label>
                        <input 
                          type="text"
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className="w-full bg-cream border-2 border-ink p-2 px-3 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-bold uppercase text-ink/75 mb-1.5">Email address coordinates</label>
                        <input 
                          type="email"
                          readOnly
                          value={profileEmail}
                          className="w-full bg-zinc-100 border border-ink p-2 px-3 text-xs text-zinc-500"
                        />
                      </div>
                      <div>
                        <label className="block font-bold uppercase text-ink/75 mb-1.5">Verify Phone contact</label>
                        <input 
                          type="tel"
                          value={profilePhone}
                          onChange={(e) => setProfilePhone(e.target.value)}
                          className="w-full bg-cream border-2 border-ink p-2 px-3 text-xs"
                        />
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          className="w-full py-3 bg-ink text-cream font-mono font-bold uppercase text-xs hover:shadow-brutal border-2 border-ink transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Save size={14} /> SAVE CONFIG
                        </button>
                      </div>
                    </form>

                    {settingsSaved && (
                      <div className="mt-3 p-2 text-center text-xs font-mono font-bold border-2 border-emerald-500 bg-emerald-50 text-emerald-600 animate-pulse uppercase">
                        ✓ Operator credentials synchronized!
                      </div>
                    )}
                  </div>
                )}

              </>
            )}

          </main>

        </div>
      )}

    </div>
  );
}
