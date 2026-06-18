import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext, toPath } from '../../context/AppContext';
import { apiJson } from '../../lib/api';
import { Icon } from '../shared/UI';
import { ManufacturerHeader } from './ManufacturerHeader';

export const ManufacturerDashboard = () => {
  const rNavigate = useNavigate();
  const navigate = (p: string) => rNavigate(toPath(p));
  const { handleLogout, user, handleLogin } = useContext(AppContext);
  const [tab, setTab] = useState<'overview' | 'orders' | 'inventory' | 'payouts' | 'settings'>('overview');
  const [orderFilter, setOrderFilter] = useState<'ALL' | 'PENDING' | 'SHIPPED'>('ALL');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const font = { fontFamily: 'Inter, sans-serif' };
  const syne = { fontFamily: 'Syne, sans-serif' };

  const loggedUser = user;

  useEffect(() => {
    // In a real app we would fetch orders assigned to this manufacturer.
    // For now we'll fetch all orders and mock it.
    apiJson<any[]>('/api/orders').then(data => {
      setOrders(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => {
      setOrders([]);
      setLoading(false);
    });
  }, []);

  const displayName = loggedUser?.name?.trim() || 'Manufacturer';
  const displayEmail = loggedUser?.email?.trim() || 'No email on file';
  const roleLabel = loggedUser?.role ? loggedUser.role.charAt(0) + loggedUser.role.slice(1).toLowerCase() : 'Manufacturer';
  const initialInitials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'MF';

  // Mock stats
  const pendingOrders = orders.filter(o => o.status === 'PENDING' || o.status === 'PAID');
  const fulfilledOrders = orders.filter(o => o.status === 'SHIPPED' || o.status === 'FULFILLED');
  const totalRevenue = fulfilledOrders.reduce((sum, o) => sum + (o.subtotalINR || 0) * 0.4, 0); // Mock 40% margin

  const [bizName, setBizName] = useState(displayName);
  const [mCity, setMCity] = useState('Mumbai');
  const [gst, setGst] = useState('22AAAAA0000A1Z5');

  const sidebarItems = [
    { icon: 'dashboard', label: 'Overview', key: 'overview' as const },
    { icon: 'inventory_2', label: 'Orders', key: 'orders' as const },
    { icon: 'category', label: 'Inventory', key: 'inventory' as const },
    { icon: 'account_balance_wallet', label: 'Payouts', key: 'payouts' as const },
    { icon: 'settings', label: 'Settings', key: 'settings' as const },
  ];

  return (
    <div className="flex min-h-screen text-[#241910]" style={{ backgroundColor: '#fff8f5', backgroundImage: 'radial-gradient(at 0% 0%, #ffeadb 0px, transparent 50%), radial-gradient(at 100% 100%, #f4dfcf 0px, transparent 50%)', backgroundAttachment: 'fixed' }}>
      <aside className="hidden md:flex flex-col h-screen sticky top-0 p-4 bg-[#fff1e8] border-r border-[#e6beb2] w-64 shrink-0">
        <div className="mb-6 px-2">
          <button onClick={() => navigate('/')} className="text-[24px] font-semibold text-[#aa3000]" style={syne}>OffGrid</button>
          <p className="text-[12px] text-[#5c4037] opacity-70 uppercase tracking-widest font-medium mt-1" style={font}>Partner Hub</p>
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
          <button onClick={() => handleLogout()} className="w-full flex items-center gap-4 px-4 py-2 text-[14px] font-semibold text-[#5c4037] hover:text-[#ba1a1a] rounded-lg" style={font}>
            <Icon name="logout" size={20} /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <ManufacturerHeader />
        <section className="max-w-7xl mx-auto px-4 md:px-12 py-10">
          {tab === 'overview' && <>
            <div className="mb-12">
              <h2 className="text-[#aa3000] text-[32px] md:text-[48px]" style={{ ...syne, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.01em' }}>Manufacturer Hub</h2>
              <p className="text-[18px] text-[#5c4037] max-w-xl pl-6 mt-4" style={{ ...font, lineHeight: 1.6, borderLeft: '4px solid #bdf200' }}>
                Manage your production queue, track printing fulfillment, and monitor your earnings.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              {[
                { label: 'Pending Production', value: pendingOrders.length, subIcon: 'pending', color: '#aa3000', sub: 'Orders waiting' },
                { label: 'Fulfilled Units', value: fulfilledOrders.length, subIcon: 'check_circle', color: '#4f6600', sub: 'Completed this month' },
                { label: 'Estimated Earnings', value: `₹${Math.round(totalRevenue).toLocaleString('en-IN')}`, subIcon: 'payments', color: '#241910', sub: 'To be paid out' },
              ].map(s => (
                <div key={s.label} className="p-8 rounded-xl relative overflow-hidden flex flex-col justify-between h-40" style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', border: '1px solid #e6beb2' }}>
                  <div className="z-10">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#5c4037]" style={font}>{s.label}</span>
                    <h3 className="text-[#241910] mt-2 text-[40px]" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, lineHeight: 1.1 }}>{s.value}</h3>
                  </div>
                  <div className="z-10 mt-auto">
                    <div className="flex items-center gap-1 font-semibold text-[13px]" style={{ color: s.color, ...font }}>
                      <Icon name={s.subIcon} size={16} /> {s.sub}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white border border-[#e6beb2] rounded-xl overflow-hidden">
              <div className="px-6 py-5 border-b border-[#e6beb2] flex justify-between items-center bg-[#fff8f5]">
                <h3 className="text-[18px] font-semibold text-[#241910]" style={syne}>Action Required</h3>
                <button onClick={() => setTab('orders')} className="text-[13px] text-[#aa3000] font-semibold hover:underline" style={font}>View All</button>
              </div>
              {pendingOrders.length === 0 && !loading ? (
                <div className="p-10 text-center flex flex-col items-center">
                  <Icon name="check_circle_outline" size={48} className="text-[#e6beb2] mb-4" />
                  <p className="text-[15px] text-[#5c4037] font-medium" style={font}>All caught up! No pending orders.</p>
                </div>
              ) : (
                <div className="divide-y divide-[#e6beb2]">
                  {pendingOrders.slice(0, 5).map(o => (
                    <div key={o.id} className="p-6 flex items-center justify-between hover:bg-[#fff8f5] transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded bg-[#ffeadb] text-[#aa3000] flex items-center justify-center">
                          <Icon name="receipt" size={24} />
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-[#241910]" style={font}>Order #{o.id.split('-')[0]}</p>
                          <p className="text-[12px] text-[#5c4037]" style={font}>{o.items?.[0]?.productTitle || 'Custom Print'} • Qty: {o.items?.[0]?.quantity || 1}</p>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-[#241910] text-white text-[12px] font-bold rounded uppercase hover:bg-[#4a3b32] transition-colors" style={font}>
                        Start Print
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>}

          {tab === 'orders' && <>
            <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-[32px] font-bold text-[#241910]" style={syne}>Production Queue</h2>
                <p className="text-[14px] text-[#5c4037] mt-2" style={font}>Manage your incoming and active print jobs.</p>
              </div>
              <div className="flex gap-2">
                {['ALL', 'PENDING', 'SHIPPED'].map(f => (
                  <button key={f} onClick={() => setOrderFilter(f as any)} className={`px-4 py-2 rounded text-[12px] font-bold uppercase transition-colors ${orderFilter === f ? 'bg-[#aa3000] text-white' : 'bg-white text-[#5c4037] border border-[#e6beb2] hover:bg-[#fff8f5]'}`} style={font}>{f}</button>
                ))}
              </div>
            </div>
            
            <div className="bg-white border border-[#e6beb2] rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left" style={font}>
                  <thead className="bg-[#fff8f5] border-b border-[#e6beb2]">
                    <tr>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#5c4037]">Order ID</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#5c4037]">Product</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#5c4037]">Date</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#5c4037]">Status</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#5c4037] text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e6beb2]">
                    {orders.length === 0 && !loading && (
                      <tr><td colSpan={5} className="px-6 py-10 text-center text-[#5c4037]">No orders found.</td></tr>
                    )}
                    {orders.filter(o => orderFilter === 'ALL' ? true : orderFilter === 'PENDING' ? (o.status === 'PENDING' || o.status === 'PAID') : o.status === 'SHIPPED').map((o) => (
                      <tr key={o.id} className="hover:bg-[#fff8f5] transition-colors">
                        <td className="px-6 py-4 text-[13px] font-medium text-[#241910]">#{o.id.split('-')[0]}</td>
                        <td className="px-6 py-4 text-[13px] text-[#5c4037]">{o.items?.[0]?.productTitle || 'Product'} (x{o.items?.[0]?.quantity || 1})</td>
                        <td className="px-6 py-4 text-[13px] text-[#5c4037]">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${
                            o.status === 'PENDING' || o.status === 'PAID' ? 'bg-[#ffeadb] text-[#aa3000]' : 
                            o.status === 'SHIPPED' ? 'bg-[#bdf200] text-[#4f6600]' : 
                            'bg-[#e6beb2] text-[#5c4037]'
                          }`}>
                            {o.status === 'PAID' ? 'Ready to Print' : o.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {(o.status === 'PENDING' || o.status === 'PAID') ? (
                            <button className="text-[12px] font-bold text-[#aa3000] hover:underline uppercase tracking-wide">Print & Ship</button>
                          ) : (
                            <button className="text-[12px] font-bold text-[#5c4037] hover:underline uppercase tracking-wide" disabled>Details</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>}

          {tab === 'inventory' && <>
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-[32px] font-bold text-[#241910]" style={syne}>Raw Material Inventory</h2>
                <p className="text-[14px] text-[#5c4037] mt-2" style={font}>Track blank garments, inks, and packaging supplies.</p>
              </div>
              <button className="px-6 py-2 bg-[#aa3000] text-white text-[13px] font-semibold rounded uppercase tracking-wide hover:bg-[#d43f00] transition-colors flex items-center gap-2" style={{ boxShadow: '4px 4px 0px 0px #3a0b00', ...font }}>
                <Icon name="add" size={18} /> Add Stock
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: 'Premium Heavyweight Tees', type: 'Blanks', count: 450, status: 'In Stock', color: '#4f6600' },
                { name: 'Classic Hoodies', type: 'Blanks', count: 12, status: 'Low Stock', color: '#aa3000' },
                { name: 'CMYK DTG Ink Set', type: 'Consumables', count: 4, status: 'In Stock', color: '#4f6600' },
                { name: 'Pre-treatment Liquid', type: 'Consumables', count: 18, status: 'In Stock', color: '#4f6600' },
                { name: 'Eco Mailer Bags', type: 'Packaging', count: 1200, status: 'In Stock', color: '#4f6600' },
              ].map(item => (
                <div key={item.name} className="p-6 bg-white border border-[#e6beb2] rounded-xl flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#5c4037]" style={font}>{item.type}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full" style={{ backgroundColor: `${item.color}20`, color: item.color, ...font }}>{item.status}</span>
                    </div>
                    <h3 className="text-[18px] font-semibold text-[#241910] leading-tight" style={font}>{item.name}</h3>
                  </div>
                  <div className="mt-6 flex items-end justify-between">
                    <div>
                      <p className="text-[28px] font-bold text-[#241910] leading-none" style={syne}>{item.count}</p>
                      <p className="text-[12px] text-[#5c4037] mt-1" style={font}>Units available</p>
                    </div>
                    <button className="text-[13px] text-[#aa3000] font-semibold hover:underline" style={font}>Restock</button>
                  </div>
                </div>
              ))}
            </div>
          </>}

          {tab === 'payouts' && <>
            <div className="mb-8">
              <h2 className="text-[32px] font-bold text-[#241910]" style={syne}>Payouts & Invoices</h2>
              <p className="text-[14px] text-[#5c4037] mt-2" style={font}>Track your manufacturing revenue and withdrawal history.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="p-8 bg-[#241910] text-[#fff8f5] rounded-xl flex flex-col justify-between h-48">
                <div>
                  <p className="text-[12px] uppercase tracking-widest opacity-80 font-bold mb-2" style={font}>Available to Withdraw</p>
                  <p className="text-[48px] font-bold leading-none" style={syne}>₹{Math.round(totalRevenue).toLocaleString('en-IN')}</p>
                </div>
                <button className="self-start px-6 py-2 bg-[#bdf200] text-[#241910] text-[13px] font-bold rounded uppercase hover:brightness-110 transition-colors" style={font}>Request Payout</button>
              </div>
              <div className="p-8 bg-white border border-[#e6beb2] rounded-xl flex flex-col justify-between h-48">
                <div>
                  <p className="text-[12px] uppercase tracking-widest text-[#5c4037] font-bold mb-2" style={font}>Pending Clearance</p>
                  <p className="text-[48px] font-bold text-[#5c4037] leading-none" style={syne}>₹0</p>
                  <p className="text-[12px] text-[#5c4037] mt-2" style={font}>From orders currently in production.</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#e6beb2] rounded-xl overflow-hidden">
              <div className="px-6 py-5 border-b border-[#e6beb2] bg-[#fff8f5]">
                <h3 className="text-[18px] font-semibold text-[#241910]" style={syne}>Recent Transactions</h3>
              </div>
              <div className="p-10 text-center text-[#5c4037]">
                <p style={font}>No past payouts yet. Your completed withdrawals will appear here.</p>
              </div>
            </div>
          </>}

          {tab === 'settings' && <>
            <div className="mb-8">
              <h2 className="text-[32px] font-bold text-[#241910]" style={syne}>Business Settings</h2>
              <p className="text-[14px] text-[#5c4037] mt-2" style={font}>Update your manufacturer profile and capabilities.</p>
            </div>

            <form
              className="bg-white border border-[#e6beb2] rounded-xl p-8 space-y-6 max-w-2xl"
              onSubmit={(e) => {
                e.preventDefault();
                if (!loggedUser) return;
                handleLogin({
                  ...loggedUser,
                  name: bizName.trim() || loggedUser.name,
                });
              }}
            >
              <div>
                <label className="text-[10px] font-bold uppercase text-[#5c4037] mb-1 block tracking-wider" style={font}>Business Name</label>
                <input value={bizName} onChange={(e) => setBizName(e.target.value)} className="w-full bg-[#fff1e8] border border-[#e6beb2] px-4 py-3 text-[14px] rounded focus:outline-none focus:border-[#aa3000]" style={font} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-[#5c4037] mb-1 block tracking-wider" style={font}>City / Region</label>
                  <input value={mCity} onChange={(e) => setMCity(e.target.value)} className="w-full bg-[#fff1e8] border border-[#e6beb2] px-4 py-3 text-[14px] rounded focus:outline-none focus:border-[#aa3000]" style={font} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-[#5c4037] mb-1 block tracking-wider" style={font}>GST Number</label>
                  <input value={gst} onChange={(e) => setGst(e.target.value)} className="w-full bg-[#fff1e8] border border-[#e6beb2] px-4 py-3 text-[14px] rounded focus:outline-none focus:border-[#aa3000]" style={font} />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-[#5c4037] mb-3 block tracking-wider" style={font}>Active Capabilities</label>
                <div className="flex flex-wrap gap-2">
                  {['DTG', 'Screen Print', 'Embroidery', 'Sublimation'].map(cap => (
                    <span key={cap} className="px-4 py-2 bg-[#ffeadb] text-[#aa3000] border border-[#aa3000]/30 rounded text-[12px] font-bold" style={font}>{cap}</span>
                  ))}
                  <button type="button" className="px-4 py-2 border border-dashed border-[#e6beb2] text-[#5c4037] rounded text-[12px] font-bold hover:bg-[#fff8f5] transition-colors" style={font}>+ Add New</button>
                </div>
              </div>
              <div className="pt-4 border-t border-[#e6beb2] flex gap-3">
                <button type="submit" className="px-8 py-3 bg-[#aa3000] text-white text-[14px] font-semibold rounded uppercase tracking-wide hover:bg-[#d43f00] transition-colors" style={{ boxShadow: '4px 4px 0px 0px #3a0b00', ...font }}>Save Profile</button>
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
