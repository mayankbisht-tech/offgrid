import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext, toPath } from '../../context/AppContext';
import { Icon } from '../shared/UI';

export const StudioSidebar = ({ activeItem = 'overview', onSignOut }: { activeItem?: string; onSignOut?: () => void }) => {
  const rNavigate = useNavigate();
  const navigate = (p: string) => rNavigate(toPath(p));
  const { handleLogout, user } = useContext(AppContext);
  const sidebarName = user?.name?.trim() || 'Guest Creator';
  const sidebarEmail = user?.email?.trim() || 'No email on file';
  const sidebarRole = user?.role ? user.role.charAt(0) + user.role.slice(1).toLowerCase() : 'Creator';
  const sidebarInitials = sidebarName
    .split(/\s+/)
    .filter(Boolean)
    .map((part: string) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'OG';
  const items = [
    { icon: 'dashboard', label: 'Overview', page: 'dashboard', key: 'overview' },
    { icon: 'palette', label: 'My Designs', page: 'studio-upload', key: 'designs' },
    { icon: 'insights', label: 'Analytics', page: 'dashboard', key: 'analytics' },
    { icon: 'payments', label: 'Payouts', page: 'dashboard', key: 'payouts' },
    { icon: 'settings', label: 'Settings', page: 'dashboard', key: 'settings' },
  ];

  return (
    <aside className="hidden md:flex flex-col h-screen sticky top-0 p-4 bg-[#fff1e8] border-r border-[#e6beb2] w-64 shrink-0">
      <div className="mb-10 px-2">
        <h1 className="text-[24px] font-semibold text-[#aa3000]" style={{ fontFamily: 'Syne, sans-serif', lineHeight: 1.3 }}>OffGrid</h1>
        <p className="text-[12px] text-[#5c4037] opacity-70 uppercase tracking-widest font-medium mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>Creator Studio</p>
      </div>
      <div className="mb-4 px-4">
        <div className="w-10 h-10 rounded-full bg-[#ffdbd0] flex items-center justify-center text-[#aa3000] font-bold text-sm mb-2">{sidebarInitials}</div>
        <p className="text-[14px] font-semibold text-[#241910]" style={{ fontFamily: 'Inter, sans-serif' }}>{sidebarName}</p>
        <p className="text-[10px] uppercase text-[#5c4037] truncate" style={{ fontFamily: 'Inter, sans-serif' }}>{sidebarEmail}</p>
        <p className="text-[10px] uppercase text-[#5c4037]" style={{ fontFamily: 'Inter, sans-serif' }}>{sidebarRole}</p>
      </div>
      <nav className="flex-1 flex flex-col gap-1">
        {items.map(item => {
          const isActive = item.key === activeItem;
          return (
            <button
              key={item.key}
              onClick={() => navigate(item.page)}
              className={`flex items-center gap-4 px-4 py-2 text-[14px] font-semibold rounded-lg transition-all ${isActive ? 'bg-[#aa3000] text-white translate-x-1' : 'text-[#5c4037] hover:bg-[#f4dfcf]'}`}
              style={{ fontFamily: 'Inter, sans-serif', ...(isActive ? { boxShadow: '4px 4px 0px 0px #aa3000' } : {}) }}
            >
              <Icon name={item.icon} size={20} fill={isActive ? 1 : 0} className={isActive ? 'text-white' : ''} /> {item.label}
            </button>
          );
        })}
      </nav>
      <div className="mt-auto flex flex-col gap-1 pt-4 border-t border-[#e6beb2]/30">
        <button
          type="button"
          className="w-full flex items-center gap-4 px-4 py-2 text-[14px] font-semibold text-[#5c4037] hover:bg-[#f4dfcf] transition-all rounded-lg"
          style={{ fontFamily: 'Inter, sans-serif' }}
          onClick={() => window.location.href = 'mailto:support@offgrid.com'}
        >
          <Icon name="help_outline" size={20} /> Help
        </button>
        <button
          className="w-full flex items-center gap-4 px-4 py-2 text-[14px] font-semibold text-[#5c4037] hover:text-[#ba1a1a] transition-all rounded-lg"
          style={{ fontFamily: 'Inter, sans-serif' }}
          onClick={() => { if (onSignOut) onSignOut(); navigate('/logout'); }}
        >
          <Icon name="logout" size={20} /> Sign Out
        </button>
      </div>
    </aside>
  );
};
