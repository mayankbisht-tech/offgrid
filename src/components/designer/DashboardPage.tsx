import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext, toPath } from '../../context/AppContext';
import { apiJson } from '../../lib/api';
import { Icon, GradientImg, GRADIENTS } from '../shared/UI';
import { StudioHeader } from './StudioHeader';

export const DashboardPage = () => {
  const rNavigate = useNavigate();
  const navigate = (p: string) => rNavigate(toPath(p));
  const { handleLogout, handleLogin, user } = useContext(AppContext);
  const [tab, setTab] = useState<'overview' | 'analytics' | 'payouts' | 'settings'>('overview');
  const [designs, setDesigns] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const font = { fontFamily: 'Inter, sans-serif' };
  const syne = { fontFamily: 'Syne, sans-serif' };

  const loggedUser = user;

  useEffect(() => {
    const designerId = loggedUser?.id;
    Promise.all([
      apiJson<any[]>('/api/products').catch(() => []),
      apiJson<any[]>('/api/orders').catch(() => []),
      // Fetch real designs for this designer if logged in
      designerId
        ? apiJson<any[]>(`/api/designers/${designerId}/designs`).catch(() => [])
        : Promise.resolve([]),
    ]).then(([p, o, d]) => {
      setProducts(Array.isArray(p) ? p : []);
      setOrders(Array.isArray(o) ? o : []);
      setDesigns(Array.isArray(d) ? d : []);
      setLoading(false);
    });
  }, []);

  const designerProducts = products.filter((p: any) => p.designerId === loggedUser?.id);
  const designerOrders = orders.filter((o: any) =>
    o.items && Array.isArray(o.items) && o.items.some((item: any) =>
      designerProducts.some(p => p.id === item.productId)
    )
  );

  const totalSold = designerProducts.reduce((s: number, p: any) => s + (p.totalSold ?? 0), 0);

  const totalRevenue = orders.reduce((s: number, o: any) => {
    let earnings = 0;
    if (o.items && Array.isArray(o.items)) {
      o.items.forEach((item: any) => {
        const p = designerProducts.find(prod => prod.id === item.productId);
        if (p) {
          earnings += item.quantity * p.designerPriceINR;
        }
      });
    }
    return s + earnings;
  }, 0);

  const displayName = loggedUser?.name?.trim() || 'Guest Creator';
  const displayEmail = loggedUser?.email?.trim() || 'No email on file';
  const roleLabel = loggedUser?.role ? loggedUser.role.charAt(0) + loggedUser.role.slice(1).toLowerCase() : 'Creator';
  const initialInitials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'OG';

  const monthlyRevenue = Array.from({ length: 6 }, (_, idx) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - idx));
    const month = date.toLocaleString('en-US', { month: 'short' });
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const value = designerOrders.reduce((sum: number, order: any) => {
      const createdKey = order.createdAt ? String(order.createdAt).slice(0, 7) : '';
      if (createdKey !== monthKey || !Array.isArray(order.items)) return sum;
      const orderEarnings = order.items.reduce((orderSum: number, item: any) => {
        const p = designerProducts.find(prod => prod.id === item.productId);
        return p ? orderSum + (item.quantity * p.designerPriceINR) : orderSum;
      }, 0);
      return sum + orderEarnings;
    }, 0);
    return { month, value };
  });

  const revenuePerOrder = designerOrders.length > 0 ? Math.round(totalRevenue / designerOrders.length) : 0;
  const availablePayout = totalRevenue;
  const pendingPayout = 0;

  const [profileName, setProfileName] = useState(displayName);
  const [profileEmail, setProfileEmail] = useState(displayEmail);
  const [profileUsername, setProfileUsername] = useState(loggedUser?.username || '');

  // Sidebar items wired to tabs
  const sidebarItems = [
    { icon: 'dashboard', label: 'Overview', key: 'overview' as const, page: null },
    { icon: 'palette', label: 'My Designs', key: null, page: 'studio-upload' as string },
    { icon: 'insights', label: 'Analytics', key: 'analytics' as const, page: null },
    { icon: 'payments', label: 'Payouts', key: 'payouts' as const, page: null },
    { icon: 'settings', label: 'Settings', key: 'settings' as const, page: null },
  ];


  return (
    <div className="flex min-h-screen text-[#241910]" style={{ backgroundColor: '#fff8f5', backgroundImage: 'radial-gradient(at 0% 0%, #ffeadb 0px, transparent 50%), radial-gradient(at 100% 100%, #f4dfcf 0px, transparent 50%)', backgroundAttachment: 'fixed' }}>

      {/* Inline sidebar so we can control tab switching */}
      <aside className="hidden md:flex flex-col h-screen sticky top-0 p-4 bg-[#fff1e8] border-r border-[#e6beb2] w-64 shrink-0">
        <div className="mb-6 px-2">
          <button onClick={() => navigate('/')} className="text-[24px] font-semibold text-[#aa3000]" style={syne}>OffGrid</button>
          <p className="text-[12px] text-[#5c4037] opacity-70 uppercase tracking-widest font-medium mt-1" style={font}>Creator Studio</p>
        </div>
        <div className="mb-4 px-4">
          <div className="w-10 h-10 rounded-full bg-[#ffdbd0] flex items-center justify-center text-[#aa3000] font-bold text-sm mb-2">{initialInitials}</div>
          <p className="text-[14px] font-semibold text-[#241910]" style={font}>{displayName}</p>
          <p className="text-[10px] uppercase text-[#5c4037]" style={font}>{displayEmail}</p>
          <p className="text-[10px] uppercase text-[#5c4037]" style={font}>{roleLabel}</p>
        </div>
        <nav className="flex-1 flex flex-col gap-1">
          {sidebarItems.map(item => {
            const isActive = item.key === tab;
            return (
              <button key={item.label}
                onClick={() => item.page ? navigate(item.page) : item.key && setTab(item.key)}
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
          <button className="w-full flex items-center gap-4 px-4 py-2 text-[14px] font-semibold text-[#5c4037] hover:bg-[#f4dfcf] rounded-lg" style={font}>
            <Icon name="help_outline" size={20} /> Help
          </button>
              <button onClick={() => navigate('/logout')} className="w-full flex items-center gap-4 px-4 py-2 text-[14px] font-semibold text-[#5c4037] hover:text-[#ba1a1a] rounded-lg" style={font}>
            <Icon name="logout" size={20} /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <StudioHeader />
        <section className="max-w-7xl mx-auto px-4 md:px-12 py-10">
          {tab === 'overview' && <>
            {/* Greeting */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
              <div>
                <h2 className="text-[#aa3000] text-[32px] md:text-[48px]" style={{ ...syne, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.01em' }}>Creator Studio</h2>
                <p className="text-[18px] text-[#5c4037] max-w-xl pl-6 mt-2" style={{ ...font, lineHeight: 1.6, borderLeft: '4px solid #bdf200' }}>
                  {designerProducts.length > 0
                    ? `${designerProducts.length} product${designerProducts.length !== 1 ? 's' : ''} published ┬╖ ${totalSold} units sold`
                    : 'Upload your first design to get started. Your dashboard will update automatically as you sell.'}
                </p>
              </div>
            </div>

            {/* Stats bento */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 mb-16">
              {[
                { label: 'Total Revenue', value: `Γé╣${totalRevenue.toLocaleString('en-IN')}`, subIcon: 'trending_up', bgIcon: 'payments', color: '#4f6600', sub: `${designerOrders.length} order${designerOrders.length !== 1 ? 's' : ''}` },
                { label: 'Active Designs', value: String(designerProducts.length), sub: `${designs.length} design${designs.length !== 1 ? 's' : ''} uploaded`, subIcon: null, bgIcon: 'auto_awesome', color: null },
                { label: 'Units Sold', value: String(totalSold), sub: 'across your products', subIcon: null, bgIcon: null, color: null },
              ].map(s => (
                <div key={s.label} className="p-6 md:p-10 rounded-xl relative overflow-hidden flex flex-col justify-between h-36 md:h-48" style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', border: '1px solid #e6beb2' }}>
                  <div className="z-10">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#5c4037]" style={{ fontFamily: 'Inter, sans-serif' }}>{s.label}</span>
                    <h3 className="text-[#241910] mt-2 text-[32px] md:text-[48px]" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, lineHeight: 1.1 }}>{s.value}</h3>
                  </div>
                  <div className="z-10">
                    {s.subIcon && (
                      <div className="flex items-center gap-1 font-semibold text-[14px]" style={{ color: s.color ?? '#4f6600', fontFamily: 'Inter, sans-serif' }}>
                        <Icon name={s.subIcon} size={14} className="" /> {s.sub}
                      </div>
                    )}
                    {s.label === 'Active Designs' && (
                      <div>
                        <div className="w-full bg-[#f4dfcf] h-1 rounded-full overflow-hidden">
                          <div className="bg-[#aa3000] h-full" style={{ width: '75%' }} />
                        </div>
                        <p className="text-[10px] mt-1 uppercase text-[#5c4037]" style={{ fontFamily: 'Inter, sans-serif' }}>{s.sub}</p>
                      </div>
                    )}
                    {s.label === 'Global Reach' && (
                      <div className="flex items-center -space-x-2">
                        <div className="w-8 h-8 rounded-full border-2 border-[#fff8f5] bg-[#ffdbd0]" />
                        <div className="w-8 h-8 rounded-full border-2 border-[#fff8f5] bg-[#c0f500]" />
                        <div className="w-8 h-8 rounded-full border-2 border-[#fff8f5] bg-[#ebd6c7]" />
                        <span className="ml-4 text-[12px] font-medium text-[#5c4037]" style={{ fontFamily: 'Inter, sans-serif' }}>{s.sub}</span>
                      </div>
                    )}
                  </div>
                  {s.bgIcon && (
                    <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
                      <Icon name={s.bgIcon} size={120} className="text-[#241910]" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Active designs */}
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-[24px] font-semibold text-[#241910]" style={{ ...syne, lineHeight: 1.3 }}>Your Active Products</h3>
              <button onClick={() => navigate('studio-upload')} className="text-[14px] font-semibold text-[#aa3000] flex items-center gap-1" style={font}>
                + Upload New <Icon name="arrow_forward" size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              {!loading && designs.length === 0 && (
                <div className="col-span-4 flex flex-col items-center justify-center h-40 gap-3 border border-[#e6beb2] rounded-lg text-center p-8">
                  <Icon name="palette" size={36} className="text-[#e6beb2]" />
                  <p className="text-[14px] text-[#5c4037]" style={font}>No designs yet. Upload your first design!</p>
                  <button onClick={() => navigate('studio-upload')} className="bg-[#aa3000] text-white px-6 py-2 text-[13px] font-semibold rounded hover:bg-[#d43f00] transition-colors" style={font}>Upload Design</button>
                </div>
              )}
              {!loading && designs.map((d: any) => (
                <div key={d.id} className="group cursor-pointer" onClick={() => rNavigate('/shop')}>
                  <div className="relative rounded-lg overflow-hidden border border-[#e6beb2] mb-4" style={{ aspectRatio: '3/4' }}>
                    {d.image ? <img src={d.image} alt={d.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500" /> : <GradientImg gradient={GRADIENTS.hoodie} className="h-full" />}
                    <div className="absolute top-4 right-4">
                      <span className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-[#ffeadb] text-[#aa3000]" style={font}>{d.productType}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-[14px] font-semibold text-[#241910] truncate max-w-[140px]" style={font}>{d.title}</h4>
                      <p className="text-[12px] text-[#5c4037]" style={font}>{d.totalSold ?? 0} sold ┬╖ Γé╣{(d.baseCostINR + d.designerPriceINR).toLocaleString('en-IN')}</p>
                    </div>
                    <Icon name="more_vert" size={20} className="text-[#5c4037] cursor-pointer hover:text-[#aa3000]" />
                  </div>
                </div>
              ))}
              {/* Add new */}
              <div className="group border-2 border-dashed border-[#e6beb2] rounded-lg flex flex-col items-center justify-center hover:bg-[#fff1e8] transition-colors cursor-pointer p-10 text-center" style={{ aspectRatio: '3/4' }} onClick={() => navigate('studio-upload')}>
                <div className="w-16 h-16 rounded-full bg-[#ffdbd0] flex items-center justify-center text-[#aa3000] mb-4">
                  <Icon name="add" size={32} className="text-[#aa3000]" />
                </div>
                <h4 className="text-[#241910] font-semibold mb-1" style={syne}>New Release</h4>
                <p className="text-[14px] text-[#5c4037]" style={font}>Upload artwork and publish to the marketplace</p>
              </div>
            </div>

            {/* Recent activity */}
            <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-16">
              <div className="lg:col-span-2">
                <h3 className="text-[24px] font-semibold text-[#241910] mb-10" style={syne}>Recent Orders</h3>
                {orders.length === 0 && !loading && (
                  <div className="flex flex-col items-center justify-center h-40 gap-3 border border-[#e6beb2] rounded-lg text-center p-8">
                    <Icon name="shopping_bag" size={36} className="text-[#e6beb2]" />
                    <p className="text-[14px] text-[#5c4037]" style={font}>No orders yet.</p>
                  </div>
                )}
                <div className="space-y-4">
                  {orders.slice(0, 5).map((o: any, idx: number) => (
                    <div key={o.id} className="flex items-center justify-between p-6 rounded-lg" style={{ opacity: 1 - idx * 0.15, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', border: '1px solid #e6beb2' }}>
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded flex items-center justify-center bg-[#ffdbd0]">
                          <Icon name="shopping_bag" size={20} className="text-[#aa3000]" />
                        </div>
                        <div>
                          <p className="text-[14px] font-semibold" style={font}>{o.items?.[0]?.productTitle ?? 'Order'}</p>
                          <p className="text-[10px] uppercase text-[#5c4037]" style={font}>{o.status} ┬╖ {o.consumerName}</p>
                        </div>
                      </div>
                      <p className="text-[20px] font-semibold text-[#aa3000]" style={syne}>Γé╣{o.subtotalINR?.toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-10">
                <div className="p-10 bg-[#241910] text-[#fff8f5] rounded-xl">
                  <h4 className="font-semibold mb-4" style={{ ...syne, fontSize: 20 }}>Upload Your Next Design</h4>
                  <p className="text-[14px] opacity-80 mb-6" style={{ ...font, lineHeight: 1.5 }}>Every design you upload becomes a live product available to shoppers globally.</p>
                  <button onClick={() => navigate('studio-upload')} className="w-full py-4 border border-[#fff8f5] text-[#fff8f5] text-[14px] font-semibold rounded-lg hover:bg-[#fff8f5] hover:text-[#241910] transition-all uppercase" style={font}>
                    Start Upload
                  </button>
                </div>
                <div className="p-10 border border-[#e6beb2] rounded-xl bg-[#fff1e8]">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#5c4037]" style={font}>Platform Summary</span>
                  <div className="mt-4 space-y-3">
                    {[
                      [`${designs.length}`, 'Designs Uploaded'],
                      [`${products.length}`, 'Active Products'],
                      [`${orders.length}`, 'Orders Received'],
                    ].map(([v, l]) => (
                      <div key={l} className="flex items-center justify-between">
                        <span className="text-[14px] text-[#5c4037]" style={font}>{l}</span>
                        <span className="text-[24px] font-bold text-[#aa3000]" style={syne}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>}
        </section>

        {/* ΓöÇΓöÇ Analytics tab ΓöÇΓöÇ */}
        {tab === 'analytics' && (
          <section className="max-w-7xl mx-auto px-4 md:px-12 py-10">
            <h2 className="text-[32px] font-bold mb-2 text-[#241910]" style={{ fontFamily: 'Syne, sans-serif' }}>Analytics</h2>
            <p className="text-[14px] text-[#5c4037] mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
              Live account totals based on your published designs and completed orders.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 mb-10">
              {[
                ['Revenue', `Γé╣${totalRevenue.toLocaleString('en-IN')}`, 'payments'],
                ['Orders', String(designerOrders.length), 'shopping_bag'],
                ['Products', String(designerProducts.length), 'palette'],
                ['Units Sold', String(totalSold), 'inventory_2'],
                ['Avg. Order', `Γé╣${revenuePerOrder.toLocaleString('en-IN')}`, 'bar_chart'],
                ['Payouts', `Γé╣${availablePayout.toLocaleString('en-IN')}`, 'account_balance_wallet'],
              ].map(([l, v, ic]) => (
                <div key={l} className="p-8 rounded-xl bg-white border border-[#e6beb2] flex flex-col gap-3">
                  <Icon name={ic} size={24} className="text-[#aa3000]" />
                  <p className="text-[12px] uppercase tracking-widest text-[#5c4037] font-bold" style={{ fontFamily: 'Inter, sans-serif' }}>{l}</p>
                  <p className="text-[40px] font-bold text-[#241910]" style={{ fontFamily: 'Syne, sans-serif', lineHeight: 1 }}>{v}</p>
                </div>
              ))}
            </div>
            <div className="bg-white border border-[#e6beb2] rounded-xl p-8">
              <p className="text-[14px] font-semibold text-[#5c4037] mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>Monthly Revenue from your orders</p>
              <div className="flex items-end gap-4 h-40">
                {monthlyRevenue.map((entry, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full rounded-t" style={{ height: `${Math.max(10, Math.min(100, entry.value ? (entry.value / Math.max(...monthlyRevenue.map(x => x.value), 1)) * 100 : 10))}%`, background: i === monthlyRevenue.length - 1 ? '#aa3000' : '#ffeadb', border: '1px solid #e6beb2' }} />
                    <span className="text-[10px] text-[#5c4037] font-bold" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {entry.month}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[12px] text-[#5c4037] mt-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                This chart updates from your live order history, not sample data.
              </p>
            </div>
          </section>
        )}

        {/* ΓöÇΓöÇ Payouts tab ΓöÇΓöÇ */}
        {tab === 'payouts' && (
          <section className="max-w-7xl mx-auto px-4 md:px-12 py-10">
            <h2 className="text-[32px] font-bold mb-8 text-[#241910]" style={{ fontFamily: 'Syne, sans-serif' }}>Payouts</h2>
            <div className="grid grid-cols-2 gap-3 md:gap-6 mb-10">
              {[
                ['Available Balance', `Γé╣${availablePayout.toLocaleString('en-IN')}`, '#aa3000'],
                ['Pending', `Γé╣${pendingPayout.toLocaleString('en-IN')}`, '#5c4037'],
                ['Orders Paid', String(designerOrders.length), '#4f6600'],
                ['Total Lifetime', `Γé╣${totalRevenue.toLocaleString('en-IN')}`, '#241910'],
              ].map(([l, v, c]) => (
                <div key={l} className="p-8 rounded-xl bg-white border border-[#e6beb2]">
                  <p className="text-[12px] uppercase tracking-widest text-[#5c4037] font-bold mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>{l}</p>
                  <p className="text-[36px] font-bold" style={{ fontFamily: 'Syne, sans-serif', lineHeight: 1, color: c }}>{v}</p>
                </div>
              ))}
            </div>
            <div className="bg-white border border-[#e6beb2] rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#e6beb2] flex justify-between items-center">
                <p className="text-[14px] font-bold text-[#241910] uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>Payout History</p>
                <button className="text-[13px] text-[#aa3000] font-semibold underline underline-offset-4" style={{ fontFamily: 'Inter, sans-serif' }}>Request Payout</button>
              </div>
              {designerOrders.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <p className="text-[14px] text-[#5c4037]" style={{ fontFamily: 'Inter, sans-serif' }}>No payouts yet. Once your products sell, earnings will appear here.</p>
                </div>
              ) : (
                designerOrders.slice(0, 5).map((order: any) => {
                  const payout = Array.isArray(order.items)
                    ? order.items.reduce((sum: number, item: any) => {
                        const product = designerProducts.find((prod: any) => prod.id === item.productId);
                        return product ? sum + (item.quantity * product.designerPriceINR) : sum;
                      }, 0)
                    : 0;
                  return (
                    <div key={order.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 px-6 py-4 border-b border-[#e6beb2]/50">
                      <span className="text-[14px] text-[#5c4037]" style={{ fontFamily: 'Inter, sans-serif' }}>{new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
                      <span className="text-[14px] font-bold text-[#241910]" style={{ fontFamily: 'Inter, sans-serif' }}>Γé╣{payout.toLocaleString('en-IN')}</span>
                      <span className="px-3 py-1 bg-[#bdf200] text-[#526b00] text-[11px] font-bold rounded uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>{order.status}</span>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        )}

        {/* ΓöÇΓöÇ Settings tab ΓöÇΓöÇ */}
        {tab === 'settings' && (
          <section className="max-w-2xl mx-auto px-4 md:px-12 py-10">
            <h2 className="text-[32px] font-bold mb-8 text-[#241910]" style={{ fontFamily: 'Syne, sans-serif' }}>Settings</h2>
            <form
              className="bg-white border border-[#e6beb2] rounded-xl p-8 space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                if (!loggedUser) return;
                handleLogin({
                  ...loggedUser,
                  name: profileName.trim() || loggedUser.name,
                  email: profileEmail.trim() || loggedUser.email,
                  username: profileUsername.trim() || undefined,
                });
              }}
            >
              <div>
                <label className="text-[10px] font-bold uppercase text-[#5c4037] mb-1 block tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>Display Name</label>
                <input value={profileName} onChange={(e) => setProfileName(e.target.value)} className="w-full bg-[#fff1e8] border border-[#e6beb2] px-4 py-3 text-[14px] rounded focus:outline-none focus:border-[#aa3000]" style={{ fontFamily: 'Inter, sans-serif' }} />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-[#5c4037] mb-1 block tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>Email</label>
                <input value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} type="email" className="w-full bg-[#fff1e8] border border-[#e6beb2] px-4 py-3 text-[14px] rounded focus:outline-none focus:border-[#aa3000]" style={{ fontFamily: 'Inter, sans-serif' }} />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-[#5c4037] mb-1 block tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>Username / Handle</label>
                <input value={profileUsername} onChange={(e) => setProfileUsername(e.target.value)} placeholder="Optional" className="w-full bg-[#fff1e8] border border-[#e6beb2] px-4 py-3 text-[14px] rounded focus:outline-none focus:border-[#aa3000]" style={{ fontFamily: 'Inter, sans-serif' }} />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-[#5c4037] mb-1 block tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>Bio</label>
                <textarea rows={3} defaultValue={`Independent creator at ${displayName}.`} className="w-full bg-[#fff1e8] border border-[#e6beb2] px-4 py-3 text-[14px] rounded resize-none focus:outline-none focus:border-[#aa3000]" style={{ fontFamily: 'Inter, sans-serif' }} />
              </div>
              <div className="pt-2 flex gap-3">
                <button type="submit" className="px-8 py-3 bg-[#aa3000] text-white text-[14px] font-semibold rounded uppercase tracking-wide hover:bg-[#d43f00] transition-colors" style={{ boxShadow: '4px 4px 0px 0px #3a0b00', fontFamily: 'Inter, sans-serif' }}>Save Changes</button>
                <button onClick={() => handleLogout()} className="px-6 py-3 border border-[#e6beb2] text-[#5c4037] text-[14px] font-semibold rounded hover:bg-[#f4dfcf] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>Sign Out</button>
              </div>
            </form>
          </section>
        )}
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#f4dfcf] border-t border-[#e6beb2] flex items-center justify-around px-4 z-50">
        {([['dashboard', 'Overview', 'overview'], ['palette', 'Designs', 'designs'], ['add', '', 'designs'], ['insights', 'Stats', 'analytics'], ['settings', 'Settings', 'settings']] as [string, string, string][]).map(([icon, label, t]) => (
          <button key={icon}
            onClick={() => t === 'designs' ? navigate('studio-upload') : setTab(t as any)}
            className={`flex flex-col items-center gap-1 transition-colors ${tab === t ? 'text-[#aa3000]' : 'text-[#5c4037]'}`}>
            {icon === 'add'
              ? <div className="-mt-8 w-14 h-14 bg-[#aa3000] rounded-full flex items-center justify-center shadow-lg"><Icon name="add" size={28} className="text-white" /></div>
              : <><Icon name={icon} size={22} /><span className="text-[10px] font-bold uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>{label}</span></>
            }
          </button>
        ))}
      </nav>
    </div>
  );
};
