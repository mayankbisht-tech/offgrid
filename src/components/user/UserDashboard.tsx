import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext, toPath } from '../../context/AppContext';
import { apiJson } from '../../lib/api';
import { Icon } from '../shared/UI';

export const UserDashboard = () => {
  const rNavigate = useNavigate();
  const navigate = (p: string) => rNavigate(toPath(p));
  const { handleLogout, user, handleLogin } = useContext(AppContext);
  const [tab, setTab] = useState<'overview' | 'orders' | 'wishlist' | 'settings'>('overview');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const font = { fontFamily: 'Inter, sans-serif' };
  const syne = { fontFamily: 'Syne, sans-serif' };

  const loggedUser = user;

  useEffect(() => {
    // Fetch orders for this specific consumer
    apiJson<any[]>('/api/orders').then(data => {
      // In a real app, backend would filter by consumerId. We mock it here by filtering if needed.
      // Assuming all these orders belong to the user for the mockup
      setOrders(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => {
      setOrders([]);
      setLoading(false);
    });
  }, []);

  const displayName = loggedUser?.name?.trim() || 'Shopper';
  const displayEmail = loggedUser?.email?.trim() || 'No email on file';
  const initialInitials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'SH';

  const [profileName, setProfileName] = useState(displayName);
  const [profileEmail, setProfileEmail] = useState(displayEmail);

  const sidebarItems = [
    { icon: 'dashboard', label: 'Overview', key: 'overview' as const },
    { icon: 'local_mall', label: 'My Orders', key: 'orders' as const },
    { icon: 'favorite', label: 'Saved Items', key: 'wishlist' as const },
    { icon: 'settings', label: 'Settings', key: 'settings' as const },
  ];

  return (
    <div className="flex min-h-screen text-[#241910]" style={{ backgroundColor: '#fff8f5', backgroundImage: 'radial-gradient(at 0% 0%, #ffeadb 0px, transparent 50%), radial-gradient(at 100% 100%, #f4dfcf 0px, transparent 50%)', backgroundAttachment: 'fixed' }}>
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col h-screen sticky top-0 p-4 bg-[#fff1e8] border-r border-[#e6beb2] w-64 shrink-0">
        <div className="mb-6 px-2 flex justify-between items-center">
          <div>
            <button onClick={() => navigate('/')} className="text-[24px] font-semibold text-[#aa3000]" style={syne}>OffGrid</button>
            <p className="text-[12px] text-[#5c4037] opacity-70 uppercase tracking-widest font-medium mt-1" style={font}>My Account</p>
          </div>
        </div>
        <div className="mb-4 px-4">
          <div className="w-10 h-10 rounded-full bg-[#ffdbd0] flex items-center justify-center text-[#aa3000] font-bold text-sm mb-2">{initialInitials}</div>
          <p className="text-[14px] font-semibold text-[#241910]" style={font}>{displayName}</p>
          <p className="text-[10px] uppercase text-[#5c4037]" style={font}>{displayEmail}</p>
        </div>
        <nav className="flex-1 flex flex-col gap-1">
          {sidebarItems.map(item => {
            const isActive = item.key === tab;
            return (
              <button key={item.label}
                onClick={() => setTab(item.key)}
                className={`flex items-center gap-4 px-4 py-2 text-[14px] font-semibold rounded-lg transition-all ${isActive ? 'bg-[#aa3000] text-white translate-x-1' : 'text-[#5c4037] hover:bg-[#f4dfcf]'}`}
                style={{ ...font, ...(isActive ? { boxShadow: '4px 4px 0px 0px #aa3000' } : {}) }}
              >
                <Icon name={item.icon} size={20} fill={isActive ? 1 : 0} className={isActive ? 'text-white' : ''} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto flex flex-col gap-1 pt-4 border-t border-[#e6beb2]/30">
          <button onClick={() => navigate('/')} className="w-full flex items-center gap-4 px-4 py-2 text-[14px] font-semibold text-[#5c4037] hover:bg-[#ffeadb] rounded-lg" style={font}>
            <Icon name="storefront" size={20} /> Back to Shop
          </button>
          <button onClick={() => handleLogout()} className="w-full flex items-center gap-4 px-4 py-2 text-[14px] font-semibold text-[#5c4037] hover:text-[#ba1a1a] rounded-lg" style={font}>
            <Icon name="logout" size={20} /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-center w-full px-4 md:px-12 h-20 border-b border-[#e6beb2] bg-transparent shrink-0">
          <div className="flex items-center gap-10">
            <button
              onClick={() => navigate('/')}
              className="font-bold tracking-tighter text-[#aa3000] text-[28px] leading-none md:hidden"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              OFFGRID
            </button>
            <div className="hidden lg:flex items-center gap-6">
              {[['Shop All', '/shop'], ['Featured Creators', '/shop']].map(([l, pg]) => (
                <button key={l} onClick={() => navigate(pg as string)} className="text-[14px] font-semibold text-[#5c4037] hover:text-[#aa3000] transition-colors" style={font}>{l}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="hidden md:flex items-center gap-2 bg-[#aa3000] text-white px-6 py-2 text-[14px] font-semibold rounded-lg shadow-sm hover:brightness-110 active:scale-95 transition-all" style={font} onClick={() => navigate('/shop')}>
              <Icon name="storefront" size={18} className="text-white" /> Continue Shopping
            </button>
          </div>
        </header>

        <section className="flex-1 max-w-5xl mx-auto w-full px-4 md:px-12 py-10">
          {tab === 'overview' && <>
            <div className="mb-12">
              <h2 className="text-[#aa3000] text-[32px] md:text-[48px]" style={{ ...syne, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.01em' }}>Welcome back, {displayName.split(' ')[0]}</h2>
              <p className="text-[18px] text-[#5c4037] max-w-xl pl-6 mt-4" style={{ ...font, lineHeight: 1.6, borderLeft: '4px solid #bdf200' }}>
                Track your orders, manage your saved items, and discover new drops.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
              {[
                { label: 'Active Orders', value: orders.filter(o => o.status !== 'SHIPPED').length, icon: 'local_shipping', color: '#aa3000', sub: 'On the way' },
                { label: 'Saved Items', value: '4', icon: 'favorite', color: '#4f6600', sub: 'In your wishlist' },
              ].map(s => (
                <div key={s.label} className="p-8 rounded-xl relative overflow-hidden flex flex-col justify-between h-40 cursor-pointer hover:shadow-md transition-all" style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', border: '1px solid #e6beb2' }} onClick={() => setTab(s.label === 'Active Orders' ? 'orders' : 'wishlist')}>
                  <div className="z-10 flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#5c4037]" style={font}>{s.label}</span>
                      <h3 className="text-[#241910] mt-2 text-[40px]" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, lineHeight: 1.1 }}>{s.value}</h3>
                    </div>
                    <Icon name={s.icon} size={32} style={{ color: s.color }} />
                  </div>
                  <div className="z-10 mt-auto">
                    <p className="text-[13px] font-semibold text-[#5c4037]" style={font}>{s.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white border border-[#e6beb2] rounded-xl overflow-hidden mb-10">
              <div className="px-6 py-5 border-b border-[#e6beb2] flex justify-between items-center bg-[#fff8f5]">
                <h3 className="text-[18px] font-semibold text-[#241910]" style={syne}>Recent Purchases</h3>
                <button onClick={() => setTab('orders')} className="text-[13px] text-[#aa3000] font-semibold hover:underline" style={font}>View All</button>
              </div>
              {orders.length === 0 && !loading ? (
                <div className="p-10 text-center flex flex-col items-center">
                  <Icon name="shopping_bag" size={48} className="text-[#e6beb2] mb-4" />
                  <p className="text-[15px] text-[#5c4037] font-medium" style={font}>You haven't placed any orders yet.</p>
                  <button onClick={() => navigate('/shop')} className="mt-4 px-6 py-2 bg-[#aa3000] text-white text-[13px] font-semibold rounded uppercase hover:bg-[#d43f00] transition-colors" style={font}>Start Shopping</button>
                </div>
              ) : (
                <div className="divide-y divide-[#e6beb2]">
                  {orders.slice(0, 3).map(o => (
                    <div key={o.id} className="p-6 flex items-center justify-between hover:bg-[#fff8f5] transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded bg-[#f4dfcf] border border-[#e6beb2] flex items-center justify-center shrink-0 overflow-hidden">
                          {/* Placeholder for product image */}
                          <Icon name="checkroom" size={24} className="text-[#aa3000]" />
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-[#241910]" style={font}>{o.items?.[0]?.productTitle || 'Premium Apparel'}</p>
                          <p className="text-[12px] text-[#5c4037] mt-0.5" style={font}>Order #{o.id.split('-')[0]} • {new Date(o.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[14px] font-bold text-[#241910]" style={font}>₹{o.subtotalINR?.toLocaleString()}</p>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#aa3000]" style={font}>{o.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>}

          {tab === 'orders' && <>
            <div className="mb-8">
              <h2 className="text-[32px] font-bold text-[#241910]" style={syne}>Order History</h2>
              <p className="text-[14px] text-[#5c4037] mt-2" style={font}>View and track all your past and current orders.</p>
            </div>
            <div className="space-y-4">
              {orders.length === 0 && !loading && (
                <div className="p-10 border border-[#e6beb2] rounded-xl text-center bg-white">
                  <p className="text-[#5c4037]" style={font}>No orders found.</p>
                </div>
              )}
              {orders.map(o => (
                <div key={o.id} className="p-6 bg-white border border-[#e6beb2] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded bg-[#f4dfcf] border border-[#e6beb2] flex items-center justify-center shrink-0">
                      <Icon name="inventory_2" size={24} className="text-[#aa3000]" />
                    </div>
                    <div>
                      <p className="text-[16px] font-bold text-[#241910]" style={font}>{o.items?.[0]?.productTitle || 'Premium Apparel'} {o.items?.length > 1 ? `+${o.items.length - 1} items` : ''}</p>
                      <p className="text-[12px] text-[#5c4037] mt-1" style={font}>Placed on {new Date(o.createdAt).toLocaleDateString()} • ₹{o.subtotalINR?.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex flex-col md:items-end gap-2">
                    <span className={`px-3 py-1 text-[11px] font-bold uppercase rounded-full w-fit ${
                      o.status === 'PENDING' || o.status === 'PAID' ? 'bg-[#ffeadb] text-[#aa3000]' : 
                      o.status === 'SHIPPED' ? 'bg-[#bdf200] text-[#4f6600]' : 
                      'bg-[#e6beb2] text-[#5c4037]'
                    }`} style={font}>
                      {o.status}
                    </span>
                    <button className="text-[13px] text-[#aa3000] font-semibold hover:underline" style={font}>View Details</button>
                  </div>
                </div>
              ))}
            </div>
          </>}

          {tab === 'wishlist' && <>
            <div className="mb-8">
              <h2 className="text-[32px] font-bold text-[#241910]" style={syne}>Saved Items</h2>
              <p className="text-[14px] text-[#5c4037] mt-2" style={font}>Products you've favorited to buy later.</p>
            </div>
            <div className="p-16 border-2 border-dashed border-[#e6beb2] rounded-xl text-center flex flex-col items-center justify-center">
               <Icon name="favorite_border" size={48} className="text-[#e6beb2] mb-4" />
               <p className="text-[16px] font-semibold text-[#241910]" style={font}>Your wishlist is empty</p>
               <p className="text-[14px] text-[#5c4037] mt-2 mb-6" style={font}>Explore the marketplace to find drops you love.</p>
               <button onClick={() => navigate('/shop')} className="px-6 py-2 bg-[#aa3000] text-white text-[13px] font-semibold rounded uppercase hover:bg-[#d43f00] transition-colors" style={font}>Discover Products</button>
            </div>
          </>}

          {tab === 'settings' && <>
            <div className="mb-8">
              <h2 className="text-[32px] font-bold text-[#241910]" style={syne}>Profile Settings</h2>
              <p className="text-[14px] text-[#5c4037] mt-2" style={font}>Manage your account details and addresses.</p>
            </div>
            <form
              className="bg-white border border-[#e6beb2] rounded-xl p-8 space-y-6 max-w-2xl"
              onSubmit={(e) => {
                e.preventDefault();
                if (!loggedUser) return;
                handleLogin({
                  ...loggedUser,
                  name: profileName.trim() || loggedUser.name,
                  email: profileEmail.trim() || loggedUser.email,
                });
              }}
            >
              <div>
                <label className="text-[10px] font-bold uppercase text-[#5c4037] mb-1 block tracking-wider" style={font}>Full Name</label>
                <input value={profileName} onChange={(e) => setProfileName(e.target.value)} className="w-full bg-[#fff1e8] border border-[#e6beb2] px-4 py-3 text-[14px] rounded focus:outline-none focus:border-[#aa3000]" style={font} />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-[#5c4037] mb-1 block tracking-wider" style={font}>Email Address</label>
                <input type="email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} className="w-full bg-[#fff1e8] border border-[#e6beb2] px-4 py-3 text-[14px] rounded focus:outline-none focus:border-[#aa3000]" style={font} />
              </div>
              <div className="pt-4 border-t border-[#e6beb2] flex gap-3">
                <button type="submit" className="px-8 py-3 bg-[#aa3000] text-white text-[14px] font-semibold rounded uppercase tracking-wide hover:bg-[#d43f00] transition-colors" style={{ boxShadow: '4px 4px 0px 0px #3a0b00', ...font }}>Save Changes</button>
              </div>
            </form>
          </>}
        </section>
      </main>

      {/* Mobile nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#f4dfcf] border-t border-[#e6beb2] flex items-center justify-around px-4 z-50">
        {sidebarItems.map(item => (
          <button key={item.key}
            onClick={() => setTab(item.key)}
            className={`flex flex-col items-center gap-1 transition-colors ${tab === item.key ? 'text-[#aa3000]' : 'text-[#5c4037]'}`}>
            <Icon name={item.icon} size={22} fill={tab === item.key ? 1 : 0} />
            <span className="text-[10px] font-bold uppercase" style={font}>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
