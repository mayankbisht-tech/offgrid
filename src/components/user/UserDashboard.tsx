import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppContext, toPath } from '../../context/AppContext';
import { apiJson } from '../../lib/api';
import { Icon } from '../shared/UI';

export const UserDashboard = () => {
  const rNavigate = useNavigate();
  const location = useLocation();
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

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash === 'settings') {
      setTab('settings');
    } else if (hash === 'orders') {
      setTab('orders');
    } else if (hash === 'wishlist') {
      setTab('wishlist');
    } else if (hash === 'overview' || hash === 'notifications') {
      setTab('overview');
    }
  }, [location.hash]);

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
    <div className="flex min-h-screen text-[#1A1A1A]" style={{ backgroundColor: '#F7F3EF', backgroundImage: 'radial-gradient(at 0% 0%, #F1E7DE 0px, transparent 50%), radial-gradient(at 100% 100%, #E8DFD6 0px, transparent 50%)', backgroundAttachment: 'fixed' }}>
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col h-screen sticky top-0 p-4 bg-[#F1E7DE] border-r border-[rgba(109,15,49,0.15)] w-64 shrink-0">
        <div className="mb-6 px-2 flex justify-between items-center">
          <div>
            <button onClick={() => navigate('/')} className="text-[24px] font-semibold" style={syne}><span className="text-[#1A1A1A]">Re</span><span className="text-[#950606]">OG</span></button>
            <p className="text-[12px] text-[#5C5C5C] opacity-70 uppercase tracking-widest font-medium mt-1" style={font}>My Account</p>
          </div>
        </div>
        <div className="mb-4 px-4">
          <div className="w-10 h-10 rounded-full bg-[#F1E7DE] flex items-center justify-center text-[#950606] font-bold text-sm mb-2">{initialInitials}</div>
          <p className="text-[14px] font-semibold text-[#1A1A1A]" style={font}>{displayName}</p>
          <p className="text-[10px] uppercase text-[#5C5C5C]" style={font}>{displayEmail}</p>
        </div>
        <nav className="flex-1 flex flex-col gap-1">
          {sidebarItems.map(item => {
            const isActive = item.key === tab;
            return (
              <button key={item.label}
                onClick={() => setTab(item.key)}
                className={`flex items-center gap-4 px-4 py-2 text-[14px] font-semibold rounded-lg transition-all ${isActive ? 'bg-[#950606] text-white translate-x-1' : 'text-[#5C5C5C] hover:bg-[#E8DFD6]'}`}
                style={{ ...font, ...(isActive ? { boxShadow: '4px 4px 0px 0px #950606' } : {}) }}
              >
                <Icon name={item.icon} size={20} fill={isActive ? 1 : 0} className={isActive ? 'text-white' : ''} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto flex flex-col gap-1 pt-4 border-t border-[rgba(109,15,49,0.15)]/30">
          <button onClick={() => navigate('/')} className="w-full flex items-center gap-4 px-4 py-2 text-[14px] font-semibold text-[#5C5C5C] hover:bg-[#F1E7DE] rounded-lg" style={font}>
            <Icon name="storefront" size={20} /> Back to Shop
          </button>
          <button onClick={() => handleLogout()} className="w-full flex items-center gap-4 px-4 py-2 text-[14px] font-semibold text-[#5C5C5C] hover:text-[#ba1a1a] rounded-lg" style={font}>
            <Icon name="logout" size={20} /> Sign Out
          </button>
        </div>
      </aside>
 
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-center w-full px-4 md:px-12 h-20 border-b border-[rgba(109,15,49,0.15)] bg-transparent shrink-0">
          <div className="flex items-center gap-10">
            <button
              onClick={() => navigate('/')}
              className="font-bold tracking-tighter text-[28px] leading-none md:hidden"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              <span className="text-[#1A1A1A]">Re</span><span className="text-[#950606]">OG</span>
            </button>
            <div className="hidden lg:flex items-center gap-6">
              {[['Shop All', '/shop'], ['Featured Creators', '/shop']].map(([l, pg]) => (
                <button key={l} onClick={() => navigate(pg as string)} className="text-[14px] font-semibold text-[#5C5C5C] hover:text-[#950606] transition-colors" style={font}>{l}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="hidden md:flex items-center gap-2 bg-[#950606] text-white px-6 py-2 text-[14px] font-semibold rounded-lg shadow-sm hover:brightness-110 active:scale-95 transition-all" style={font} onClick={() => navigate('/shop')}>
              <Icon name="storefront" size={18} className="text-white" /> Continue Shopping
            </button>
          </div>
        </header>

        <section className="flex-1 max-w-5xl mx-auto w-full px-4 md:px-12 py-10">
          {tab === 'overview' && <>
            <div className="mb-12">
              <h2 className="text-[#950606] text-[32px] md:text-[48px]" style={{ ...syne, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.01em' }}>Welcome back, {displayName.split(' ')[0]}</h2>
              <p className="text-[18px] text-[#5C5C5C] max-w-xl pl-6 mt-4" style={{ ...font, lineHeight: 1.6, borderLeft: '4px solid #C6FF00' }}>
                Track your orders, manage your saved items, and discover new drops.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
              {[
                { label: 'Active Orders', value: orders.filter(o => o.status !== 'SHIPPED').length, icon: 'local_shipping', color: '#950606', sub: 'On the way' },
                { label: 'Saved Items', value: '4', icon: 'favorite', color: '#3D5A00', sub: 'In your wishlist' },
              ].map(s => (
                <div key={s.label} className="p-8 rounded-xl relative overflow-hidden flex flex-col justify-between h-40 cursor-pointer hover:shadow-md transition-all" style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(109,15,49,0.15)' }} onClick={() => setTab(s.label === 'Active Orders' ? 'orders' : 'wishlist')}>
                  <div className="z-10 flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#5C5C5C]" style={font}>{s.label}</span>
                      <h3 className="text-[#1A1A1A] mt-2 text-[40px]" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, lineHeight: 1.1 }}>{s.value}</h3>
                    </div>
                    <Icon name={s.icon} size={32} style={{ color: s.color }} />
                  </div>
                  <div className="z-10 mt-auto">
                    <p className="text-[13px] font-semibold text-[#5C5C5C]" style={font}>{s.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white border border-[rgba(109,15,49,0.15)] rounded-xl overflow-hidden mb-10">
              <div className="px-6 py-5 border-b border-[rgba(109,15,49,0.15)] flex justify-between items-center bg-[#F7F3EF]">
                <h3 className="text-[18px] font-semibold text-[#1A1A1A]" style={syne}>Recent Purchases</h3>
                <button onClick={() => setTab('orders')} className="text-[13px] text-[#950606] font-semibold hover:underline" style={font}>View All</button>
              </div>
              {orders.length === 0 && !loading ? (
                <div className="p-10 text-center flex flex-col items-center">
                  <Icon name="shopping_bag" size={48} className="text-[rgba(109,15,49,0.15)] mb-4" />
                  <p className="text-[15px] text-[#5C5C5C] font-medium" style={font}>You haven't placed any orders yet.</p>
                  <button onClick={() => navigate('/shop')} className="mt-4 px-6 py-2 bg-[#950606] text-white text-[13px] font-semibold rounded uppercase hover:bg-[#950606] transition-colors" style={font}>Start Shopping</button>
                </div>
              ) : (
                <div className="divide-y divide-[rgba(109,15,49,0.15)]">
                  {orders.slice(0, 3).map(o => (
                    <div key={o.id} className="p-6 flex items-center justify-between hover:bg-[#F7F3EF] transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded bg-[#E8DFD6] border border-[rgba(109,15,49,0.15)] flex items-center justify-center shrink-0 overflow-hidden">
                          {/* Placeholder for product image */}
                          <Icon name="checkroom" size={24} className="text-[#950606]" />
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-[#1A1A1A]" style={font}>{o.items?.[0]?.productTitle || 'Premium Apparel'}</p>
                          <p className="text-[12px] text-[#5C5C5C] mt-0.5" style={font}>Order #{o.id.split('-')[0]} â€¢ {new Date(o.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[14px] font-bold text-[#1A1A1A]" style={font}>â‚¹{o.subtotalINR?.toLocaleString()}</p>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#950606]" style={font}>{o.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>}

          {tab === 'orders' && <>
            <div className="mb-8">
              <h2 className="text-[32px] font-bold text-[#1A1A1A]" style={syne}>Order History</h2>
              <p className="text-[14px] text-[#5C5C5C] mt-2" style={font}>View and track all your past and current orders.</p>
            </div>
            <div className="space-y-4">
              {orders.length === 0 && !loading && (
                <div className="p-10 border border-[rgba(109,15,49,0.15)] rounded-xl text-center bg-white">
                  <p className="text-[#5C5C5C]" style={font}>No orders found.</p>
                </div>
              )}
              {orders.map(o => (
                <div key={o.id} className="p-6 bg-white border border-[rgba(109,15,49,0.15)] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded bg-[#E8DFD6] border border-[rgba(109,15,49,0.15)] flex items-center justify-center shrink-0">
                      <Icon name="inventory_2" size={24} className="text-[#950606]" />
                    </div>
                    <div>
                      <p className="text-[16px] font-bold text-[#1A1A1A]" style={font}>{o.items?.[0]?.productTitle || 'Premium Apparel'} {o.items?.length > 1 ? `+${o.items.length - 1} items` : ''}</p>
                      <p className="text-[12px] text-[#5C5C5C] mt-1" style={font}>Placed on {new Date(o.createdAt).toLocaleDateString()} â€¢ â‚¹{o.subtotalINR?.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex flex-col md:items-end gap-2">
                    <span className={`px-3 py-1 text-[11px] font-bold uppercase rounded-full w-fit ${o.status === 'PENDING' || o.status === 'PAID' ? 'bg-[#F1E7DE] text-[#950606]' :
                        o.status === 'SHIPPED' ? 'bg-[#C6FF00] text-[#3D5A00]' :
                          'bg-[rgba(109,15,49,0.15)] text-[#5C5C5C]'
                      }`} style={font}>
                      {o.status}
                    </span>
                    <button className="text-[13px] text-[#950606] font-semibold hover:underline" style={font}>View Details</button>
                  </div>
                </div>
              ))}
            </div>
          </>}

          {tab === 'wishlist' && <>
            <div className="mb-8">
              <h2 className="text-[32px] font-bold text-[#1A1A1A]" style={syne}>Saved Items</h2>
              <p className="text-[14px] text-[#5C5C5C] mt-2" style={font}>Products you've favorited to buy later.</p>
            </div>
            <div className="p-16 border-2 border-dashed border-[rgba(109,15,49,0.15)] rounded-xl text-center flex flex-col items-center justify-center">
              <Icon name="favorite_border" size={48} className="text-[rgba(109,15,49,0.15)] mb-4" />
              <p className="text-[16px] font-semibold text-[#1A1A1A]" style={font}>Your wishlist is empty</p>
              <p className="text-[14px] text-[#5C5C5C] mt-2 mb-6" style={font}>Explore the marketplace to find drops you love.</p>
              <button onClick={() => navigate('/shop')} className="px-6 py-2 bg-[#950606] text-white text-[13px] font-semibold rounded uppercase hover:bg-[#950606] transition-colors" style={font}>Discover Products</button>
            </div>
          </>}

          {tab === 'settings' && <>
            <div className="mb-8">
              <h2 className="text-[32px] font-bold text-[#1A1A1A]" style={syne}>Profile Settings</h2>
              <p className="text-[14px] text-[#5C5C5C] mt-2" style={font}>Manage your account details and addresses.</p>
            </div>
            <form
              className="bg-white border border-[rgba(109,15,49,0.15)] rounded-xl p-8 space-y-6 max-w-2xl"
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
                <label className="text-[10px] font-bold uppercase text-[#5C5C5C] mb-1 block tracking-wider" style={font}>Full Name</label>
                <input value={profileName} onChange={(e) => setProfileName(e.target.value)} className="w-full bg-[#F1E7DE] border border-[rgba(109,15,49,0.15)] px-4 py-3 text-[14px] rounded focus:outline-none focus:border-[#950606]" style={font} />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-[#5C5C5C] mb-1 block tracking-wider" style={font}>Email Address</label>
                <input type="email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} className="w-full bg-[#F1E7DE] border border-[rgba(109,15,49,0.15)] px-4 py-3 text-[14px] rounded focus:outline-none focus:border-[#950606]" style={font} />
              </div>
              <div className="pt-4 border-t border-[rgba(109,15,49,0.15)] flex gap-3">
                <button type="submit" className="px-8 py-3 bg-[#950606] text-white text-[14px] font-semibold rounded uppercase tracking-wide hover:bg-[#950606] transition-colors" style={{ boxShadow: '4px 4px 0px 0px #3a0b00', ...font }}>Save Changes</button>
              </div>
            </form>
          </>}
        </section>
      </main>

    </div>
  );
};
