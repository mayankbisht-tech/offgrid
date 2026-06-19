import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext, toPath } from '../../context/AppContext';
import { apiJson } from '../../lib/api';
import { Icon } from '../shared/UI';
import { ManufacturerHeader } from './ManufacturerHeader';
import { ManufacturerPaymentProfile } from '../../types';

type OrderLike = {
  id: string;
  status: string;
  createdAt?: string;
  items?: Array<{
    manufacturerId?: string;
    productTitle?: string;
    quantity?: number;
    priceINR?: number;
  }>;
};

type CapabilityLike = {
  id: string;
  manufacturerId: string;
  printType: string;
  materials?: string[];
  productTypes?: string[];
  minOrderQty?: number;
  turnaroundDays?: number;
  baseCostINR?: number;
  active?: boolean;
};

type ApprovedDesignLike = {
  id: string;
  title: string;
  designerName: string;
  workflowStatus: string;
  fileUrl?: string;
  productType?: string;
  liveProductId?: string | null;
  createdAt: string;
  adminNotes?: string;
  bidSummary?: {
    total: number;
    shortlisted: number;
    lowestBidINR: number | null;
    winningManufacturerId: string | null;
    winningBidAmountINR: number | null;
  };
};

const EMPTY_PROFILE: ManufacturerPaymentProfile = {
  userId: '',
  businessName: '',
  preferredPayoutMethod: 'upi',
  accountHolderName: '',
  upiId: '',
  bankName: '',
  bankAccount: '',
  bankIFSC: '',
  updatedAt: '',
};

export const ManufacturerDashboard = () => {
  const rNavigate = useNavigate();
  const navigate = (p: string) => rNavigate(toPath(p));
  const { handleLogout, user, handleLogin } = useContext(AppContext);

  const [tab, setTab] = useState<'overview' | 'designs' | 'orders' | 'bids' | 'inventory' | 'payouts' | 'settings'>('overview');
  const [orderFilter, setOrderFilter] = useState<'ALL' | 'PENDING' | 'SHIPPED'>('ALL');
  const [orders, setOrders] = useState<OrderLike[]>([]);
  const [capabilities, setCapabilities] = useState<CapabilityLike[]>([]);
  const [bids, setBids] = useState<any[]>([]);
  const [approvedDesigns, setApprovedDesigns] = useState<ApprovedDesignLike[]>([]);
  const [bidDesign, setBidDesign] = useState<ApprovedDesignLike | null>(null);
  const [bidAmountINR, setBidAmountINR] = useState('');
  const [turnAroundDays, setTurnAroundDays] = useState('7');
  const [paymentProfile, setPaymentProfile] = useState<ManufacturerPaymentProfile>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [savingPayment, setSavingPayment] = useState(false);
  const [placingBid, setPlacingBid] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const font = { fontFamily: 'Inter, sans-serif' };
  const syne = { fontFamily: 'Syne, sans-serif' };
  const loggedUser = user;

  useEffect(() => {
    const manufacturerId = loggedUser?.id;

    Promise.all([
      apiJson<OrderLike[]>('/api/orders').catch(() => []),
      apiJson<CapabilityLike[]>('/api/capabilities').catch(() => []),
      apiJson<ApprovedDesignLike[]>('/api/designs/approved').catch(() => []),
      manufacturerId
        ? apiJson<any[]>(`/api/manufacturers/${manufacturerId}/bids`).catch(() => [])
        : Promise.resolve([]),
      manufacturerId
        ? apiJson<ManufacturerPaymentProfile | null>(`/api/manufacturers/${manufacturerId}/payment-info`).catch(() => null)
        : Promise.resolve(null),
    ]).then(([ordersData, capabilityData, approvedDesignData, bidsData, paymentData]) => {
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setCapabilities(Array.isArray(capabilityData) ? capabilityData : []);
      setApprovedDesigns(Array.isArray(approvedDesignData) ? approvedDesignData : []);
      setBids(Array.isArray(bidsData) ? bidsData : []);

      const profile = paymentData && manufacturerId
        ? paymentData
        : { ...EMPTY_PROFILE, userId: manufacturerId ?? '' };

      setPaymentProfile(profile);
      setLoading(false);
    });
  }, [loggedUser?.id]);

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

  const assignedOrders = orders.filter((order) =>
    Array.isArray(order.items) &&
    order.items.some((item) => item.manufacturerId === loggedUser?.id)
  );
  const pendingOrders = assignedOrders.filter((order) =>
    ['PENDING', 'PAID', 'PENDING_PAYMENT', 'PAYMENT_CONFIRMED', 'MATCHED_TO_MANUFACTURER', 'IN_PRODUCTION', 'QUALITY_CHECK'].includes(order.status)
  );
  const shippedOrders = assignedOrders.filter((order) =>
    ['SHIPPED', 'FULFILLED', 'DELIVERED'].includes(order.status)
  );
  const liveCapabilities = capabilities.filter((cap) => cap.manufacturerId === loggedUser?.id);
  const totalUnits = assignedOrders.reduce((sum, order) =>
    sum + (order.items?.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0) || 0),
  0);

  const sidebarItems = [
    { icon: 'dashboard', label: 'Overview', key: 'overview' as const },
    { icon: 'verified', label: 'Approved Designs', key: 'designs' as const },
    { icon: 'inventory_2', label: 'Orders', key: 'orders' as const },
    { icon: 'gavel', label: 'Bids', key: 'bids' as const },
    { icon: 'category', label: 'Capabilities', key: 'inventory' as const },
    { icon: 'account_balance_wallet', label: 'Payouts', key: 'payouts' as const },
    { icon: 'settings', label: 'Settings', key: 'settings' as const },
  ];

  const handlePaymentSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggedUser?.id) return;

    setSavingPayment(true);
    setSaveMessage('');

    try {
      const payload = {
        businessName: paymentProfile.businessName.trim() || displayName,
        preferredPayoutMethod: paymentProfile.preferredPayoutMethod,
        accountHolderName: paymentProfile.accountHolderName?.trim() || '',
        upiId: paymentProfile.preferredPayoutMethod === 'upi' ? paymentProfile.upiId?.trim() || '' : '',
        bankName: paymentProfile.preferredPayoutMethod === 'bank_transfer' ? paymentProfile.bankName?.trim() || '' : '',
        bankAccount: paymentProfile.preferredPayoutMethod === 'bank_transfer' ? paymentProfile.bankAccount?.trim() || '' : '',
        bankIFSC: paymentProfile.preferredPayoutMethod === 'bank_transfer' ? paymentProfile.bankIFSC?.trim() || '' : '',
      };

      const saved = await apiJson<{ success: boolean; profile: ManufacturerPaymentProfile }>(
        `/api/manufacturers/${loggedUser.id}/payment-info`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      setPaymentProfile(saved.profile);
      setSaveMessage('Payment details saved.');

      if (loggedUser) {
        handleLogin({ ...loggedUser, name: saved.profile.businessName || loggedUser.name });
      }
    } catch (error: any) {
      setSaveMessage(error.message || 'Failed to save payment details.');
    } finally {
      setSavingPayment(false);
    }
  };

  const openBidForm = (design: ApprovedDesignLike) => {
    setBidDesign(design);
    setBidAmountINR('');
    setTurnAroundDays('7');
    setActionMessage('');
  };

  const closeBidForm = () => {
    setBidDesign(null);
    setBidAmountINR('');
    setTurnAroundDays('7');
  };

  const submitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bidDesign || !loggedUser?.id) return;

    const parsedBid = Number(bidAmountINR);
    const parsedTurnaround = Number(turnAroundDays);

    if (!Number.isFinite(parsedBid) || parsedBid <= 0) {
      setActionMessage('Enter a valid bid amount.');
      return;
    }

    if (!Number.isFinite(parsedTurnaround) || parsedTurnaround <= 0) {
      setActionMessage('Enter a valid turnaround in days.');
      return;
    }

    setPlacingBid(true);
    setActionMessage('');

    try {
      await apiJson(`/api/designs/${bidDesign.id}/bids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manufacturerId: loggedUser.id,
          manufacturerName: loggedUser.name || paymentProfile.businessName || 'Manufacturer',
          bidAmountINR: parsedBid,
          turnAroundDays: parsedTurnaround,
        }),
      });

      setActionMessage(`Bid placed on ${bidDesign.title}.`);
      closeBidForm();
      setTab('bids');

      const [bidData, approvedDesignData] = await Promise.all([
        apiJson<any[]>(`/api/manufacturers/${loggedUser.id}/bids`).catch(() => []),
        apiJson<ApprovedDesignLike[]>('/api/designs/approved').catch(() => []),
      ]);

      setBids(Array.isArray(bidData) ? bidData : []);
      setApprovedDesigns(Array.isArray(approvedDesignData) ? approvedDesignData : []);
    } catch (error: any) {
      setActionMessage(error?.message || 'Failed to place bid.');
    } finally {
      setPlacingBid(false);
    }
  };

  return (
    <div
      className="flex min-h-screen text-[#241910]"
      style={{
        backgroundColor: '#fff8f5',
        backgroundImage: 'radial-gradient(at 0% 0%, #ffeadb 0px, transparent 50%), radial-gradient(at 100% 100%, #f4dfcf 0px, transparent 50%)',
        backgroundAttachment: 'fixed',
      }}
    >
      <aside className="hidden md:flex flex-col h-screen sticky top-0 p-4 bg-[#fff1e8] border-r border-[#e6beb2] w-64 shrink-0">
        <div className="mb-6 px-2">
          <button onClick={() => navigate('/')} className="text-[24px] font-semibold text-[#aa3000]" style={syne}>
            OffGrid
          </button>
          <p className="text-[12px] text-[#5c4037] opacity-70 uppercase tracking-widest font-medium mt-1" style={font}>
            Partner Hub
          </p>
        </div>
        <div className="mb-4 px-4">
          <div className="w-10 h-10 rounded-full bg-[#ffdbd0] flex items-center justify-center text-[#aa3000] font-bold text-sm mb-2">
            {initialInitials}
          </div>
          <p className="text-[14px] font-semibold text-[#241910]" style={font}>{displayName}</p>
          <p className="text-[10px] uppercase text-[#5c4037]" style={font}>{displayEmail}</p>
          <p className="text-[10px] uppercase text-[#5c4037]" style={font}>{roleLabel}</p>
        </div>
        <nav className="flex-1 flex flex-col gap-1">
          {sidebarItems.map((item) => {
            const isActive = item.key === tab;
            return (
              <button
                key={item.label}
                onClick={() => setTab(item.key)}
                className={`flex items-center gap-4 px-4 py-2 text-[14px] font-semibold rounded-lg transition-all ${
                  isActive ? 'bg-[#aa3000] text-white translate-x-1' : 'text-[#5c4037] hover:bg-[#f4dfcf]'
                }`}
                style={{ ...font, ...(isActive ? { boxShadow: '4px 4px 0px 0px #aa3000' } : {}) }}
              >
                <Icon name={item.icon} size={20} fill={isActive ? 1 : 0} className={isActive ? 'text-white' : ''} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto flex flex-col gap-1 pt-4 border-t border-[#e6beb2]/30">
          <button
            onClick={() => handleLogout()}
            className="w-full flex items-center gap-4 px-4 py-2 text-[14px] font-semibold text-[#5c4037] hover:text-[#ba1a1a] rounded-lg"
            style={font}
          >
            <Icon name="logout" size={20} /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <ManufacturerHeader />
        <section className="max-w-7xl mx-auto px-4 md:px-12 py-10">
          {tab === 'overview' && (
            <>
              <div className="mb-12">
                <h2 className="text-[#aa3000] text-[32px] md:text-[48px]" style={{ ...syne, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.01em' }}>
                  Manufacturer Hub
                </h2>
                <p className="text-[18px] text-[#5c4037] max-w-xl pl-6 mt-4" style={{ ...font, lineHeight: 1.6, borderLeft: '4px solid #bdf200' }}>
                  Manage your production queue, track printing fulfillment, and keep payout details up to date.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                {[
                  { label: 'Assigned Orders', value: loading ? '...' : assignedOrders.length, subIcon: 'inventory_2', color: '#aa3000', sub: 'Orders matched to you' },
                  { label: 'Completed Orders', value: loading ? '...' : shippedOrders.length, subIcon: 'check_circle', color: '#4f6600', sub: 'Shipped or delivered' },
                  { label: 'Active Capabilities', value: loading ? '...' : liveCapabilities.length, subIcon: 'precision_manufacturing', color: '#241910', sub: 'Production methods listed' },
                ].map((s) => (
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
                  <h3 className="text-[18px] font-semibold text-[#241910]" style={syne}>Assigned Orders</h3>
                  <button onClick={() => setTab('orders')} className="text-[13px] text-[#aa3000] font-semibold hover:underline" style={font}>
                    View All
                  </button>
                </div>
                {pendingOrders.length === 0 && !loading ? (
                  <div className="p-10 text-center flex flex-col items-center">
                    <Icon name="check_circle_outline" size={48} className="text-[#e6beb2] mb-4" />
                    <p className="text-[15px] text-[#5c4037] font-medium" style={font}>No assigned orders yet.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#e6beb2]">
                    {pendingOrders.slice(0, 5).map((order) => (
                      <div key={order.id} className="p-6 flex items-center justify-between hover:bg-[#fff8f5] transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded bg-[#ffeadb] text-[#aa3000] flex items-center justify-center">
                            <Icon name="receipt" size={24} />
                          </div>
                          <div>
                            <p className="text-[14px] font-bold text-[#241910]" style={font}>Order #{order.id.split('-')[0]}</p>
                            <p className="text-[12px] text-[#5c4037]" style={font}>
                              {order.items?.[0]?.productTitle || 'Custom Print'} • Qty: {order.items?.[0]?.quantity || 1}
                            </p>
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
            </>
          )}

          {tab === 'designs' && (
            <>
              <div className="mb-8">
                <h2 className="text-[32px] font-bold text-[#241910]" style={syne}>Approved Designs</h2>
                <p className="text-[14px] text-[#5c4037] mt-2" style={font}>
                  Designs approved by admin are visible here before they move into live product publishing.
                </p>
              </div>

              {approvedDesigns.length === 0 && !loading ? (
                <div className="bg-white border border-[#e6beb2] rounded-xl p-10 text-center text-[#5c4037]">
                  <Icon name="verified" size={44} className="text-[#e6beb2] mx-auto mb-4" />
                  <p style={font}>No approved designs are available yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {approvedDesigns.map((design) => (
                    <div key={design.id} className="bg-white border border-[#e6beb2] rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                      <div className="aspect-[4/5] bg-[#fff8f5]">
                        {design.fileUrl ? (
                          <img src={design.fileUrl} alt={design.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full grid place-items-center text-[#5c4037]" style={font}>No preview</div>
                        )}
                      </div>
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[11px] uppercase tracking-widest text-[#aa3000]" style={font}>{design.workflowStatus}</span>
                          <span className="text-[11px] uppercase tracking-widest text-[#5c4037]" style={font}>{design.productType || 'hoodie'}</span>
                        </div>
                        <h3 className="text-[18px] font-semibold text-[#241910]" style={syne}>{design.title}</h3>
                        <p className="text-[13px] text-[#5c4037]" style={font}>by {design.designerName}</p>
                        <p className="text-[12px] text-[#5c4037]" style={font}>
                          {design.liveProductId ? 'Live product generated' : 'Ready for manufacturer bids'}
                        </p>
                        <div className="flex flex-wrap gap-2 pt-1">
                          <span className="px-2.5 py-1 rounded-full bg-[#ffeadb] text-[#aa3000] text-[10px] font-bold uppercase" style={font}>
                            {design.bidSummary?.total ?? 0} bids
                          </span>
                          <span className="px-2.5 py-1 rounded-full bg-[#fff1e8] text-[#5c4037] text-[10px] font-bold uppercase" style={font}>
                            {design.bidSummary?.shortlisted ?? 0} shortlisted
                          </span>
                          <span className="px-2.5 py-1 rounded-full bg-[#f4dfcf] text-[#241910] text-[10px] font-bold uppercase" style={font}>
                            Lowest {design.bidSummary?.lowestBidINR ? `INR ${design.bidSummary.lowestBidINR.toLocaleString('en-IN')}` : 'N/A'}
                          </span>
                          {design.bidSummary?.winningBidAmountINR ? (
                            <span className="px-2.5 py-1 rounded-full bg-[#bdf200]/20 text-[#4f6600] text-[10px] font-bold uppercase" style={font}>
                              Winning INR {design.bidSummary.winningBidAmountINR.toLocaleString('en-IN')}
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-[#fff8f5] text-[#5c4037] text-[10px] font-bold uppercase" style={font}>
                              No winner yet
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => openBidForm(design)}
                          className="mt-2 w-full px-4 py-2 rounded bg-[#aa3000] text-white text-[13px] font-semibold hover:bg-[#d43f00] transition-colors"
                          style={font}
                        >
                          Place Bid
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {bidDesign && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center p-4">
              <div className="w-full max-w-lg rounded-2xl border border-[#e6beb2] bg-white shadow-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-[#e6beb2] bg-[#fff8f5] flex items-center justify-between">
                  <div>
                    <h3 className="text-[18px] font-semibold text-[#241910]" style={syne}>Place Bid</h3>
                    <p className="text-[12px] text-[#5c4037] mt-1" style={font}>{bidDesign.title}</p>
                  </div>
                  <button onClick={closeBidForm} className="text-[#5c4037] text-[22px] leading-none" aria-label="Close bid form">
                    X
                  </button>
                </div>
                <form onSubmit={submitBid} className="p-6 space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg border border-[#e6beb2] bg-[#fff8f5] p-3">
                      <div className="text-[10px] uppercase tracking-wider text-[#5c4037]" style={font}>Bids</div>
                      <div className="text-[18px] font-semibold text-[#241910]" style={syne}>{bidDesign.bidSummary?.total ?? 0}</div>
                    </div>
                    <div className="rounded-lg border border-[#e6beb2] bg-[#fff8f5] p-3">
                      <div className="text-[10px] uppercase tracking-wider text-[#5c4037]" style={font}>Lowest</div>
                      <div className="text-[18px] font-semibold text-[#241910]" style={syne}>
                        {bidDesign.bidSummary?.lowestBidINR ? `INR ${bidDesign.bidSummary.lowestBidINR.toLocaleString('en-IN')}` : 'N/A'}
                      </div>
                    </div>
                    <div className="rounded-lg border border-[#e6beb2] bg-[#fff8f5] p-3">
                      <div className="text-[10px] uppercase tracking-wider text-[#5c4037]" style={font}>Winner</div>
                      <div className="text-[18px] font-semibold text-[#241910]" style={syne}>
                        {bidDesign.bidSummary?.winningBidAmountINR ? `INR ${bidDesign.bidSummary.winningBidAmountINR.toLocaleString('en-IN')}` : 'None'}
                      </div>
                    </div>
                  </div>
                  {actionMessage && (
                    <div className="rounded-lg border border-[#e6beb2] bg-[#fff8f5] px-4 py-3 text-[13px]" style={font}>
                      {actionMessage}
                    </div>
                  )}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#5c4037] mb-1 block" style={font}>Bid Amount INR</label>
                    <input
                      value={bidAmountINR}
                      onChange={(e) => setBidAmountINR(e.target.value)}
                      inputMode="numeric"
                      placeholder="e.g. 850"
                      className="w-full border border-[#e6beb2] rounded px-3 py-2"
                      style={font}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#5c4037] mb-1 block" style={font}>Turnaround Days</label>
                    <input
                      value={turnAroundDays}
                      onChange={(e) => setTurnAroundDays(e.target.value)}
                      inputMode="numeric"
                      placeholder="7"
                      className="w-full border border-[#e6beb2] rounded px-3 py-2"
                      style={font}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={closeBidForm} className="px-4 py-2 rounded border border-[#e6beb2] text-[#5c4037] text-[13px]" style={font}>
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={placingBid}
                      className="px-4 py-2 rounded bg-[#aa3000] text-white text-[13px] font-semibold disabled:opacity-60"
                      style={font}
                    >
                      {placingBid ? 'Submitting...' : 'Submit Bid'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {tab === 'orders' && (
            <>
              <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h2 className="text-[32px] font-bold text-[#241910]" style={syne}>Production Queue</h2>
                  <p className="text-[14px] text-[#5c4037] mt-2" style={font}>Orders matched to your account.</p>
                </div>
                <div className="flex gap-2">
                  {['ALL', 'PENDING', 'SHIPPED'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setOrderFilter(f as any)}
                      className={`px-4 py-2 rounded text-[12px] font-bold uppercase transition-colors ${orderFilter === f ? 'bg-[#aa3000] text-white' : 'bg-white text-[#5c4037] border border-[#e6beb2] hover:bg-[#fff8f5]'}`}
                      style={font}
                    >
                      {f}
                    </button>
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
                      {assignedOrders.length === 0 && !loading && (
                        <tr>
                          <td colSpan={5} className="px-6 py-10 text-center text-[#5c4037]">
                            No orders matched to this manufacturer yet.
                          </td>
                        </tr>
                      )}
                      {assignedOrders
                        .filter((order) =>
                          orderFilter === 'ALL'
                            ? true
                            : orderFilter === 'PENDING'
                              ? ['PENDING', 'PAID', 'PENDING_PAYMENT', 'PAYMENT_CONFIRMED', 'MATCHED_TO_MANUFACTURER', 'IN_PRODUCTION', 'QUALITY_CHECK'].includes(order.status)
                              : ['SHIPPED', 'FULFILLED', 'DELIVERED'].includes(order.status)
                        )
                        .map((order) => (
                          <tr key={order.id} className="hover:bg-[#fff8f5] transition-colors">
                            <td className="px-6 py-4 text-[13px] font-medium text-[#241910]">#{order.id.split('-')[0]}</td>
                            <td className="px-6 py-4 text-[13px] text-[#5c4037]">{order.items?.[0]?.productTitle || 'Product'} (x{order.items?.[0]?.quantity || 1})</td>
                            <td className="px-6 py-4 text-[13px] text-[#5c4037]">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : '-'}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${
                                ['PENDING', 'PAID', 'PENDING_PAYMENT', 'PAYMENT_CONFIRMED', 'MATCHED_TO_MANUFACTURER', 'IN_PRODUCTION', 'QUALITY_CHECK'].includes(order.status)
                                  ? 'bg-[#ffeadb] text-[#aa3000]'
                                  : 'bg-[#bdf200] text-[#4f6600]'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button className="text-[12px] font-bold text-[#aa3000] hover:underline uppercase tracking-wide">View</button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {tab === 'bids' && (
            <>
              <div className="mb-8">
                <h2 className="text-[32px] font-bold text-[#241910]" style={syne}>Bids & Samples</h2>
                <p className="text-[14px] text-[#5c4037] mt-2" style={font}>Track which bids are shortlisted, held, rejected, or moved into sample review.</p>
              </div>

              <div className="bg-white border border-[#e6beb2] rounded-xl overflow-hidden">
                <div className="divide-y divide-[#e6beb2]">
                  {bids.length === 0 && (
                    <div className="p-8 text-[#5c4037]" style={font}>No bids have been placed by this manufacturer yet.</div>
                  )}
                  {bids.map((bid) => (
                    <div key={bid.id} className="p-6 flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[15px] font-semibold text-[#241910]" style={font}>{bid.design?.title || 'Untitled design'}</p>
                          <p className="text-[12px] text-[#5c4037]" style={font}>Design ID: {bid.designId}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[18px] font-bold text-[#aa3000]" style={syne}>INR {bid.bidAmountINR.toLocaleString('en-IN')}</p>
                          <p className="text-[12px] text-[#5c4037]" style={font}>{bid.turnAroundDays} day turnaround</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase bg-[#ffeadb] text-[#aa3000]" style={font}>{bid.status}</span>
                        <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase bg-[#fff1e8] text-[#5c4037]" style={font}>{bid.sampleStatus || 'NO SAMPLE'}</span>
                        {bid.sample?.status && (
                          <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase bg-[#bdf200] text-[#4f6600]" style={font}>
                            Sample {bid.sample.status}
                          </span>
                        )}
                      </div>
                      {bid.heldReason && <p className="text-[12px] text-[#5c4037]" style={font}>{bid.heldReason}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {tab === 'inventory' && (
            <>
              <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h2 className="text-[32px] font-bold text-[#241910]" style={syne}>Production Capabilities</h2>
                  <p className="text-[14px] text-[#5c4037] mt-2" style={font}>These are the live capabilities linked to your manufacturer account.</p>
                </div>
              </div>

              {liveCapabilities.length === 0 && !loading ? (
                <div className="bg-white border border-[#e6beb2] rounded-xl p-10 text-center text-[#5c4037]">
                  <Icon name="inventory_2" size={44} className="text-[#e6beb2] mx-auto mb-4" />
                  <p style={font}>No capabilities have been linked to this manufacturer yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {liveCapabilities.map((item) => (
                    <div key={item.id} className="p-6 bg-white border border-[#e6beb2] rounded-xl flex flex-col justify-between hover:shadow-md transition-shadow">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#5c4037]" style={font}>{item.printType}</span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${item.active ? 'bg-[#bdf200]/20 text-[#4f6600]' : 'bg-[#e6beb2]/40 text-[#5c4037]'}`} style={font}>
                            {item.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <h3 className="text-[18px] font-semibold text-[#241910] leading-tight" style={font}>
                          {item.productTypes?.join(', ') || 'General production'}
                        </h3>
                        <p className="text-[12px] text-[#5c4037] mt-2" style={font}>
                          Materials: {item.materials?.join(', ') || 'Not listed'}
                        </p>
                      </div>
                      <div className="mt-6 flex items-end justify-between">
                        <div>
                          <p className="text-[28px] font-bold text-[#241910] leading-none" style={syne}>
                            {item.turnaroundDays ?? '-'}
                          </p>
                          <p className="text-[12px] text-[#5c4037] mt-1" style={font}>Turnaround days</p>
                        </div>
                        <button className="text-[13px] text-[#aa3000] font-semibold hover:underline" style={font}>Edit</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === 'payouts' && (
            <>
              <div className="mb-8">
                <h2 className="text-[32px] font-bold text-[#241910]" style={syne}>Payout Setup</h2>
                <p className="text-[14px] text-[#5c4037] mt-2" style={font}>Save the payout details you want the platform to use for your manufacturer account.</p>
              </div>

              <div className="bg-white border border-[#e6beb2] rounded-xl p-8 max-w-3xl">
                <form className="space-y-5" onSubmit={handlePaymentSave}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-[#5c4037] mb-1 block tracking-wider" style={font}>Business Name</label>
                      <input
                        value={paymentProfile.businessName}
                        onChange={(e) => setPaymentProfile((prev) => ({ ...prev, businessName: e.target.value }))}
                        className="w-full bg-[#fff1e8] border border-[#e6beb2] px-4 py-3 text-[14px] rounded focus:outline-none focus:border-[#aa3000]"
                        style={font}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-[#5c4037] mb-1 block tracking-wider" style={font}>Account Holder Name</label>
                      <input
                        value={paymentProfile.accountHolderName ?? ''}
                        onChange={(e) => setPaymentProfile((prev) => ({ ...prev, accountHolderName: e.target.value }))}
                        className="w-full bg-[#fff1e8] border border-[#e6beb2] px-4 py-3 text-[14px] rounded focus:outline-none focus:border-[#aa3000]"
                        style={font}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-[#5c4037] mb-2 block tracking-wider" style={font}>Preferred Payout Method</label>
                    <div className="flex gap-3">
                      {(['upi', 'bank_transfer'] as const).map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentProfile((prev) => ({ ...prev, preferredPayoutMethod: method }))}
                          className={`px-4 py-2 rounded text-[12px] font-bold uppercase border transition-colors ${
                            paymentProfile.preferredPayoutMethod === method
                              ? 'bg-[#aa3000] text-white border-[#aa3000]'
                              : 'bg-white text-[#5c4037] border-[#e6beb2] hover:bg-[#fff8f5]'
                          }`}
                          style={font}
                        >
                          {method === 'upi' ? 'UPI' : 'Bank Transfer'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {paymentProfile.preferredPayoutMethod === 'upi' ? (
                    <div>
                      <label className="text-[10px] font-bold uppercase text-[#5c4037] mb-1 block tracking-wider" style={font}>UPI ID</label>
                      <input
                        value={paymentProfile.upiId ?? ''}
                        onChange={(e) => setPaymentProfile((prev) => ({ ...prev, upiId: e.target.value }))}
                        placeholder="name@bank"
                        className="w-full bg-[#fff1e8] border border-[#e6beb2] px-4 py-3 text-[14px] rounded focus:outline-none focus:border-[#aa3000]"
                        style={font}
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-[#5c4037] mb-1 block tracking-wider" style={font}>Bank Name</label>
                        <input
                          value={paymentProfile.bankName ?? ''}
                          onChange={(e) => setPaymentProfile((prev) => ({ ...prev, bankName: e.target.value }))}
                          className="w-full bg-[#fff1e8] border border-[#e6beb2] px-4 py-3 text-[14px] rounded focus:outline-none focus:border-[#aa3000]"
                          style={font}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-[#5c4037] mb-1 block tracking-wider" style={font}>Account Number</label>
                        <input
                          value={paymentProfile.bankAccount ?? ''}
                          onChange={(e) => setPaymentProfile((prev) => ({ ...prev, bankAccount: e.target.value }))}
                          className="w-full bg-[#fff1e8] border border-[#e6beb2] px-4 py-3 text-[14px] rounded focus:outline-none focus:border-[#aa3000]"
                          style={font}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-[#5c4037] mb-1 block tracking-wider" style={font}>IFSC Code</label>
                        <input
                          value={paymentProfile.bankIFSC ?? ''}
                          onChange={(e) => setPaymentProfile((prev) => ({ ...prev, bankIFSC: e.target.value }))}
                          className="w-full bg-[#fff1e8] border border-[#e6beb2] px-4 py-3 text-[14px] rounded focus:outline-none focus:border-[#aa3000]"
                          style={font}
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={savingPayment}
                      className="px-8 py-3 bg-[#aa3000] text-white text-[14px] font-semibold rounded uppercase tracking-wide hover:bg-[#d43f00] transition-colors disabled:opacity-60"
                      style={{ boxShadow: '4px 4px 0px 0px #3a0b00', ...font }}
                    >
                      {savingPayment ? 'Saving...' : 'Save Payment Info'}
                    </button>
                    {saveMessage && (
                      <p className="text-[13px] text-[#5c4037] mt-3" style={font}>{saveMessage}</p>
                    )}
                  </div>
                </form>
              </div>
            </>
          )}

          {tab === 'settings' && (
            <>
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
                    name: paymentProfile.businessName.trim() || loggedUser.name,
                  });
                }}
              >
                <div>
                  <label className="text-[10px] font-bold uppercase text-[#5c4037] mb-1 block tracking-wider" style={font}>Business Name</label>
                  <input
                    value={paymentProfile.businessName}
                    onChange={(e) => setPaymentProfile((prev) => ({ ...prev, businessName: e.target.value }))}
                    className="w-full bg-[#fff1e8] border border-[#e6beb2] px-4 py-3 text-[14px] rounded focus:outline-none focus:border-[#aa3000]"
                    style={font}
                  />
                </div>
                <div className="rounded-lg border border-[#e6beb2] bg-[#fff8f5] p-4 text-[13px] text-[#5c4037]" style={font}>
                  <p className="font-semibold text-[#241910] mb-1">Profile note</p>
                  <p>
                    Keep your legal business details, city, and GST information in your onboarding profile or internal records.
                    This page is used for the payout details that OffGrid will use when sending manufacturer payments.
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-[#5c4037] mb-3 block tracking-wider" style={font}>Active Capabilities</label>
                  <div className="flex flex-wrap gap-2">
                    {liveCapabilities.length > 0 ? (
                      liveCapabilities.map((cap) => (
                        <span key={cap.id} className="px-4 py-2 bg-[#ffeadb] text-[#aa3000] border border-[#aa3000]/30 rounded text-[12px] font-bold" style={font}>
                          {cap.printType}
                        </span>
                      ))
                    ) : (
                      <span className="text-[12px] text-[#5c4037]" style={font}>No capabilities linked yet.</span>
                    )}
                  </div>
                </div>
                <div className="pt-4 border-t border-[#e6beb2] flex gap-3">
                  <button
                    type="submit"
                    className="px-8 py-3 bg-[#aa3000] text-white text-[14px] font-semibold rounded uppercase tracking-wide hover:bg-[#d43f00] transition-colors"
                    style={{ boxShadow: '4px 4px 0px 0px #3a0b00', ...font }}
                  >
                    Save Profile
                  </button>
                </div>
              </form>
            </>
          )}
        </section>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#f4dfcf] border-t border-[#e6beb2] flex items-center justify-around px-4 z-50">
        {sidebarItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`flex flex-col items-center gap-1 transition-colors ${tab === item.key ? 'text-[#aa3000]' : 'text-[#5c4037]'}`}
          >
            <Icon name={item.icon} size={22} fill={tab === item.key ? 1 : 0} />
            <span className="text-[10px] font-bold uppercase" style={font}>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
