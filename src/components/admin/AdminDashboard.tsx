import React, { useEffect, useState } from 'react';
import { apiJson } from '../../lib/api';

type DesignRecord = {
  id: string;
  title: string;
  designerId: string;
  designerName: string;
  fileUrl?: string;
  workflowStatus: string;
  moderationStatus: string;
  createdAt: string;
  adminNotes?: string;
  liveProductId?: string;
};

type AnalyticsPayload = {
  designs: number;
  products: number;
  bids: number;
  samples: number;
  designerAnalytics: Array<{ designerId: string; designs: number; liveProducts: number; bids: number }>;
  manufacturerAnalytics: Array<{ manufacturerId: string; bids: number; shortlisted: number; winning: number; samples: number }>;
  moderationRecords: Array<{ userId: string; role: string; status: string; reason?: string }>;
};

export const AdminDashboard = () => {
  const [designs, setDesigns] = useState<DesignRecord[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsPayload | null>(null);
  const [archiveTab, setArchiveTab] = useState<'approved' | 'rejected'>('approved');
  const [moderationUserId, setModerationUserId] = useState('');
  const [moderationRole, setModerationRole] = useState<'DESIGNER' | 'MANUFACTURER'>('DESIGNER');
  const [moderationStatus, setModerationStatus] = useState<'ACTIVE' | 'PAUSED' | 'BLOCKED'>('PAUSED');
  const [moderationReason, setModerationReason] = useState('');
  const [message, setMessage] = useState('');

  const font = { fontFamily: 'Inter, sans-serif' };
  const syne = { fontFamily: 'Syne, sans-serif' };

  const pendingDesigns = designs.filter((design) => design.workflowStatus === 'SUBMITTED');
  const acceptedDesigns = designs.filter((design) => design.workflowStatus !== 'SUBMITTED' && design.workflowStatus !== 'REJECTED');
  const rejectedDesigns = designs.filter((design) => design.workflowStatus === 'REJECTED');

  const loadData = async () => {
    const [designData, analyticsData] = await Promise.all([
      apiJson<DesignRecord[]>('/api/admin/designs').catch(() => []),
      apiJson<AnalyticsPayload>('/api/admin/analytics').catch(() => null),
    ]);
    setDesigns(Array.isArray(designData) ? designData : []);
    setAnalytics(analyticsData);
  };

  useEffect(() => {
    loadData().catch(() => setMessage('Failed to load admin data.'));
  }, []);

  const approveDesign = async (designId: string) => {
    await apiJson(`/api/admin/designs/${designId}/approve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId: 'admin' }),
    });
    setMessage('Design approved and now visible to manufacturers.');
    setArchiveTab('approved');
    await loadData();
  };

  const rejectDesign = async (designId: string) => {
    await apiJson(`/api/admin/designs/${designId}/reject`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId: 'admin' }),
    });
    setMessage('Design rejected.');
    setArchiveTab('rejected');
    await loadData();
  };

  const applyModeration = async () => {
    if (!moderationUserId.trim()) return;
    await apiJson(`/api/admin/users/${moderationUserId.trim()}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: moderationStatus,
        reason: moderationReason,
        role: moderationRole,
        adminId: 'admin',
      }),
    });
    setMessage(`User ${moderationStatus.toLowerCase()}d.`);
    setModerationReason('');
    await loadData();
  };

  return (
    <div className="min-h-screen bg-[#F7F3EF] text-[#1A1A1A] px-4 py-8 md:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-[34px] md:text-[48px] font-bold tracking-tight" style={syne}>Admin Control Center</h1>
          <p className="text-[#5C5C5C] mt-3 max-w-3xl" style={font}>
            Approve designs before they hit the marketplace, oversee bidding and samples, and moderate designers or manufacturers.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-lg border border-[rgba(109,15,49,0.15)] bg-white px-4 py-3 text-[14px]" style={font}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            ['Designs', analytics?.designs ?? designs.length],
            ['Products', analytics?.products ?? 0],
            ['Bids', analytics?.bids ?? 0],
            ['Samples', analytics?.samples ?? 0],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-[rgba(109,15,49,0.15)] bg-white p-5">
              <div className="text-[12px] uppercase tracking-widest text-[#5C5C5C]" style={font}>{label}</div>
              <div className="text-[34px] font-bold mt-2" style={syne}>{String(value)}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <section className="xl:col-span-2 rounded-xl border border-[rgba(109,15,49,0.15)] bg-white overflow-hidden">
            <div className="px-6 py-4 border-b border-[rgba(109,15,49,0.15)] bg-[#F7F3EF] flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-[18px]" style={syne}>Design Queue</h2>
                <p className="text-[12px] text-[#5C5C5C] mt-1" style={font}>Only new submissions stay here until you review them.</p>
              </div>
              <button onClick={loadData} className="text-[13px] font-semibold text-[#950606]" style={font}>Refresh</button>
            </div>
            <div className="divide-y divide-[rgba(109,15,49,0.15)]">
              {pendingDesigns.length === 0 && (
                <div className="p-8 text-[#5C5C5C]" style={font}>No pending designs right now.</div>
              )}
              {pendingDesigns.map((design) => (
                <div key={design.id} className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="min-w-0">
                    <div className="w-20 h-20 mb-3 rounded-lg overflow-hidden border border-[rgba(109,15,49,0.15)] bg-[#F7F3EF]">
                      {design.fileUrl ? (
                        <img src={design.fileUrl} alt={design.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full grid place-items-center text-[11px] text-[#5C5C5C]" style={font}>No preview</div>
                      )}
                    </div>
                    <div className="text-[11px] uppercase tracking-widest text-[#5C5C5C]" style={font}>{design.workflowStatus}</div>
                    <h3 className="text-[18px] font-semibold truncate" style={syne}>{design.title}</h3>
                    <p className="text-[13px] text-[#5C5C5C]" style={font}>by {design.designerName} Â· {design.moderationStatus}</p>
                    {design.adminNotes && <p className="text-[13px] text-[#5C5C5C] mt-1" style={font}>{design.adminNotes}</p>}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => approveDesign(design.id)} className="px-3 py-2 rounded bg-[#950606] text-white text-[13px]" style={font}>Approve</button>
                    <button onClick={() => rejectDesign(design.id)} className="px-3 py-2 rounded border border-[#ba1a1a] text-[#ba1a1a] text-[13px]" style={font}>Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-[rgba(109,15,49,0.15)] bg-white overflow-hidden">
            <div className="px-6 py-4 border-b border-[rgba(109,15,49,0.15)] bg-[#F7F3EF] flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-[18px]" style={syne}>Review Archive</h2>
                <p className="text-[12px] text-[#5C5C5C] mt-1" style={font}>Accepted and rejected designs are grouped here.</p>
              </div>
            </div>
            <div className="px-6 pt-4 flex gap-2">
              <button
                onClick={() => setArchiveTab('approved')}
                className={`px-3 py-2 rounded text-[12px] font-semibold border transition-colors ${archiveTab === 'approved' ? 'bg-[#950606] text-white border-[#950606]' : 'border-[rgba(109,15,49,0.15)] text-[#5C5C5C] hover:bg-[#F7F3EF]'}`}
                style={font}
              >
                Accepted
              </button>
              <button
                onClick={() => setArchiveTab('rejected')}
                className={`px-3 py-2 rounded text-[12px] font-semibold border transition-colors ${archiveTab === 'rejected' ? 'bg-[#950606] text-white border-[#950606]' : 'border-[rgba(109,15,49,0.15)] text-[#5C5C5C] hover:bg-[#F7F3EF]'}`}
                style={font}
              >
                Rejected
              </button>
            </div>
            <div className="p-4 space-y-3">
              {archiveTab === 'approved' ? (
                acceptedDesigns.length === 0 ? (
                  <div className="text-[13px] text-[#5C5C5C] p-2" style={font}>Approved designs will appear here after review.</div>
                ) : (
                  acceptedDesigns.map((design) => (
                    <div key={design.id} className="rounded-lg border border-[rgba(109,15,49,0.15)] bg-[#F7F3EF] p-3">
                      <div className="text-[11px] uppercase tracking-widest text-[#950606]" style={font}>{design.workflowStatus}</div>
                      <div className="font-semibold truncate" style={syne}>{design.title}</div>
                      <div className="text-[12px] text-[#5C5C5C]" style={font}>by {design.designerName}</div>
                      <div className="text-[12px] text-[#5C5C5C] mt-1" style={font}>
                        {design.liveProductId ? 'Live product generated' : 'Visible to manufacturers'}
                      </div>
                    </div>
                  ))
                )
              ) : (
                rejectedDesigns.length === 0 ? (
                  <div className="text-[13px] text-[#5C5C5C] p-2" style={font}>Rejected designs will appear here after review.</div>
                ) : (
                  rejectedDesigns.map((design) => (
                    <div key={design.id} className="rounded-lg border border-[rgba(109,15,49,0.15)] bg-[#F7F3EF] p-3">
                      <div className="text-[11px] uppercase tracking-widest text-[#ba1a1a]" style={font}>Rejected</div>
                      <div className="font-semibold truncate" style={syne}>{design.title}</div>
                      <div className="text-[12px] text-[#5C5C5C]" style={font}>by {design.designerName}</div>
                      {design.adminNotes && <div className="text-[12px] text-[#5C5C5C] mt-1 line-clamp-2" style={font}>{design.adminNotes}</div>}
                    </div>
                  ))
                )
              )}
            </div>
          </section>

          <section className="rounded-xl border border-[rgba(109,15,49,0.15)] bg-white overflow-hidden xl:col-span-3">
            <div className="px-6 py-4 border-b border-[rgba(109,15,49,0.15)] bg-[#F7F3EF]">
              <h2 className="font-semibold text-[18px]" style={syne}>Moderation</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <input value={moderationUserId} onChange={(e) => setModerationUserId(e.target.value)} placeholder="User ID" className="border border-[rgba(109,15,49,0.15)] rounded px-3 py-2" style={font} />
              <select value={moderationRole} onChange={(e) => setModerationRole(e.target.value as any)} className="border border-[rgba(109,15,49,0.15)] rounded px-3 py-2" style={font}>
                <option value="DESIGNER">Designer</option>
                <option value="MANUFACTURER">Manufacturer</option>
              </select>
              <select value={moderationStatus} onChange={(e) => setModerationStatus(e.target.value as any)} className="border border-[rgba(109,15,49,0.15)] rounded px-3 py-2" style={font}>
                <option value="ACTIVE">Active</option>
                <option value="PAUSED">Paused</option>
                <option value="BLOCKED">Blocked</option>
              </select>
              <input value={moderationReason} onChange={(e) => setModerationReason(e.target.value)} placeholder="Reason" className="border border-[rgba(109,15,49,0.15)] rounded px-3 py-2 md:col-span-1" style={font} />
              <button onClick={applyModeration} className="rounded bg-[#950606] text-white px-4 py-2 font-semibold" style={font}>Apply</button>
            </div>
          </section>

          <section className="rounded-xl border border-[rgba(109,15,49,0.15)] bg-white overflow-hidden xl:col-span-3">
            <div className="px-6 py-4 border-b border-[rgba(109,15,49,0.15)] bg-[#F7F3EF]">
              <h2 className="font-semibold text-[18px]" style={syne}>Analytics</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3" style={font}>Per Designer</h3>
                <div className="space-y-2">
                  {(analytics?.designerAnalytics ?? []).map((row) => (
                    <div key={row.designerId} className="rounded-lg border border-[rgba(109,15,49,0.15)] p-3 text-[13px]" style={font}>
                      <div className="font-semibold">{row.designerId}</div>
                      <div className="text-[#5C5C5C]">Designs: {row.designs} Â· Live: {row.liveProducts} Â· Bids: {row.bids}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3" style={font}>Per Manufacturer</h3>
                <div className="space-y-2">
                  {(analytics?.manufacturerAnalytics ?? []).map((row) => (
                    <div key={row.manufacturerId} className="rounded-lg border border-[rgba(109,15,49,0.15)] p-3 text-[13px]" style={font}>
                      <div className="font-semibold">{row.manufacturerId}</div>
                      <div className="text-[#5C5C5C]">Bids: {row.bids} Â· Shortlisted: {row.shortlisted} Â· Winning: {row.winning} Â· Samples: {row.samples}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
