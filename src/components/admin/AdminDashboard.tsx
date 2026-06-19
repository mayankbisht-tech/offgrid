import React, { useEffect, useMemo, useState } from 'react';
import { apiJson } from '../../lib/api';

type DesignRecord = {
  id: string;
  title: string;
  designerId: string;
  designerName: string;
  workflowStatus: string;
  moderationStatus: string;
  createdAt: string;
  adminNotes?: string;
  liveProductId?: string;
};

type WorkflowPayload = {
  design: DesignRecord;
  bids: Array<{
    id: string;
    manufacturerId: string;
    manufacturerName: string;
    bidAmountINR: number;
    status: string;
    sampleStatus: string | null;
    createdAt: string;
  }>;
  samples: Array<{
    id: string;
    bidId: string;
    manufacturerId: string;
    status: string;
    notes?: string;
    createdAt: string;
  }>;
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
  const [selectedDesign, setSelectedDesign] = useState<string>('');
  const [workflow, setWorkflow] = useState<WorkflowPayload | null>(null);
  const [moderationUserId, setModerationUserId] = useState('');
  const [moderationRole, setModerationRole] = useState<'DESIGNER' | 'MANUFACTURER'>('DESIGNER');
  const [moderationStatus, setModerationStatus] = useState<'ACTIVE' | 'PAUSED' | 'BLOCKED'>('PAUSED');
  const [moderationReason, setModerationReason] = useState('');
  const [message, setMessage] = useState('');

  const font = { fontFamily: 'Inter, sans-serif' };
  const syne = { fontFamily: 'Syne, sans-serif' };

  const loadData = async () => {
    const [designData, analyticsData] = await Promise.all([
      apiJson<DesignRecord[]>('/api/admin/designs').catch(() => []),
      apiJson<AnalyticsPayload>('/api/admin/analytics').catch(() => null),
    ]);
    setDesigns(Array.isArray(designData) ? designData : []);
    setAnalytics(analyticsData);
    if (!selectedDesign && designData[0]?.id) {
      setSelectedDesign(designData[0].id);
    }
  };

  useEffect(() => {
    loadData().catch(() => setMessage('Failed to load admin data.'));
  }, []);

  useEffect(() => {
    if (!selectedDesign) return;
    apiJson<WorkflowPayload>(`/api/designs/${selectedDesign}/workflow`)
      .then(setWorkflow)
      .catch(() => setWorkflow(null));
  }, [selectedDesign]);

  const selectedSummary = useMemo(() => designs.find((d) => d.id === selectedDesign), [designs, selectedDesign]);

  const approveDesign = async (designId: string) => {
    await apiJson(`/api/admin/designs/${designId}/approve`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ adminId: 'admin' }) });
    setMessage('Design approved and bidding can begin.');
    await loadData();
    setSelectedDesign(designId);
  };

  const rejectDesign = async (designId: string) => {
    await apiJson(`/api/admin/designs/${designId}/reject`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ adminId: 'admin' }) });
    setMessage('Design rejected.');
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
    <div className="min-h-screen bg-[#fff8f5] text-[#241910] px-4 py-8 md:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-[34px] md:text-[48px] font-bold tracking-tight" style={syne}>Admin Control Center</h1>
          <p className="text-[#5c4037] mt-3 max-w-3xl" style={font}>
            Approve designs before they hit the marketplace, oversee bidding and samples, and moderate designers or manufacturers.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-lg border border-[#e6beb2] bg-white px-4 py-3 text-[14px]" style={font}>
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
            <div key={label} className="rounded-xl border border-[#e6beb2] bg-white p-5">
              <div className="text-[12px] uppercase tracking-widest text-[#5c4037]" style={font}>{label}</div>
              <div className="text-[34px] font-bold mt-2" style={syne}>{String(value)}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <section className="xl:col-span-2 rounded-xl border border-[#e6beb2] bg-white overflow-hidden">
            <div className="px-6 py-4 border-b border-[#e6beb2] bg-[#fff8f5] flex items-center justify-between">
              <h2 className="font-semibold text-[18px]" style={syne}>Design Queue</h2>
              <button onClick={loadData} className="text-[13px] font-semibold text-[#aa3000]" style={font}>Refresh</button>
            </div>
            <div className="divide-y divide-[#e6beb2]">
              {designs.length === 0 && (
                <div className="p-8 text-[#5c4037]" style={font}>No designs submitted yet.</div>
              )}
              {designs.map((design) => (
                <div key={design.id} className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-[11px] uppercase tracking-widest text-[#5c4037]" style={font}>{design.workflowStatus}</div>
                    <h3 className="text-[18px] font-semibold truncate" style={syne}>{design.title}</h3>
                    <p className="text-[13px] text-[#5c4037]" style={font}>
                      by {design.designerName} · {design.moderationStatus}
                    </p>
                    {design.adminNotes && <p className="text-[13px] text-[#5c4037] mt-1" style={font}>{design.adminNotes}</p>}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => setSelectedDesign(design.id)} className="px-3 py-2 rounded border border-[#e6beb2] text-[13px]" style={font}>Open</button>
                    <button onClick={() => approveDesign(design.id)} className="px-3 py-2 rounded bg-[#aa3000] text-white text-[13px]" style={font}>Approve</button>
                    <button onClick={() => rejectDesign(design.id)} className="px-3 py-2 rounded border border-[#ba1a1a] text-[#ba1a1a] text-[13px]" style={font}>Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-[#e6beb2] bg-white overflow-hidden">
            <div className="px-6 py-4 border-b border-[#e6beb2] bg-[#fff8f5]">
              <h2 className="font-semibold text-[18px]" style={syne}>Workflow</h2>
            </div>
            <div className="p-6 space-y-4">
              {selectedSummary ? (
                <>
                  <div>
                    <div className="text-[11px] uppercase tracking-widest text-[#5c4037]" style={font}>Selected Design</div>
                    <div className="font-semibold" style={font}>{selectedSummary.title}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-widest text-[#5c4037]" style={font}>Bids</div>
                    <div className="space-y-2 mt-2">
                      {(workflow?.bids ?? []).map((bid) => (
                        <div key={bid.id} className="rounded-lg border border-[#e6beb2] p-3">
                          <div className="flex items-center justify-between text-[13px]">
                            <span style={font}>{bid.manufacturerName}</span>
                            <span className="font-semibold" style={font}>INR {bid.bidAmountINR.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="text-[12px] text-[#5c4037]" style={font}>{bid.status} · {bid.sampleStatus || 'NO SAMPLE'}</div>
                        </div>
                      ))}
                      {(!workflow?.bids || workflow.bids.length === 0) && (
                        <div className="text-[13px] text-[#5c4037]" style={font}>No bids yet.</div>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-widest text-[#5c4037]" style={font}>Samples</div>
                    <div className="space-y-2 mt-2">
                      {(workflow?.samples ?? []).map((sample) => (
                        <div key={sample.id} className="rounded-lg border border-[#e6beb2] p-3 text-[13px]" style={font}>
                          <div className="font-semibold">{sample.status}</div>
                          <div className="text-[#5c4037]">Bid: {sample.bidId}</div>
                        </div>
                      ))}
                      {(!workflow?.samples || workflow.samples.length === 0) && (
                        <div className="text-[13px] text-[#5c4037]" style={font}>No samples yet.</div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-[13px] text-[#5c4037]" style={font}>Select a design to inspect bids and samples.</div>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-[#e6beb2] bg-white overflow-hidden xl:col-span-3">
            <div className="px-6 py-4 border-b border-[#e6beb2] bg-[#fff8f5]">
              <h2 className="font-semibold text-[18px]" style={syne}>Moderation</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <input value={moderationUserId} onChange={(e) => setModerationUserId(e.target.value)} placeholder="User ID" className="border border-[#e6beb2] rounded px-3 py-2" style={font} />
              <select value={moderationRole} onChange={(e) => setModerationRole(e.target.value as any)} className="border border-[#e6beb2] rounded px-3 py-2" style={font}>
                <option value="DESIGNER">Designer</option>
                <option value="MANUFACTURER">Manufacturer</option>
              </select>
              <select value={moderationStatus} onChange={(e) => setModerationStatus(e.target.value as any)} className="border border-[#e6beb2] rounded px-3 py-2" style={font}>
                <option value="ACTIVE">Active</option>
                <option value="PAUSED">Paused</option>
                <option value="BLOCKED">Blocked</option>
              </select>
              <input value={moderationReason} onChange={(e) => setModerationReason(e.target.value)} placeholder="Reason" className="border border-[#e6beb2] rounded px-3 py-2 md:col-span-1" style={font} />
              <button onClick={applyModeration} className="rounded bg-[#aa3000] text-white px-4 py-2 font-semibold" style={font}>Apply</button>
            </div>
          </section>

          <section className="rounded-xl border border-[#e6beb2] bg-white overflow-hidden xl:col-span-3">
            <div className="px-6 py-4 border-b border-[#e6beb2] bg-[#fff8f5]">
              <h2 className="font-semibold text-[18px]" style={syne}>Analytics</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3" style={font}>Per Designer</h3>
                <div className="space-y-2">
                  {(analytics?.designerAnalytics ?? []).map((row) => (
                    <div key={row.designerId} className="rounded-lg border border-[#e6beb2] p-3 text-[13px]" style={font}>
                      <div className="font-semibold">{row.designerId}</div>
                      <div className="text-[#5c4037]">Designs: {row.designs} · Live: {row.liveProducts} · Bids: {row.bids}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3" style={font}>Per Manufacturer</h3>
                <div className="space-y-2">
                  {(analytics?.manufacturerAnalytics ?? []).map((row) => (
                    <div key={row.manufacturerId} className="rounded-lg border border-[#e6beb2] p-3 text-[13px]" style={font}>
                      <div className="font-semibold">{row.manufacturerId}</div>
                      <div className="text-[#5c4037]">Bids: {row.bids} · Shortlisted: {row.shortlisted} · Winning: {row.winning} · Samples: {row.samples}</div>
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
