import React from 'react';
import { Eye, FolderGit2, ShieldCheck } from 'lucide-react';

export type PerspectiveRole = 'visitor' | 'designer' | 'manufacturer';

interface PerspectiveSwitcherProps {
  currentRole: PerspectiveRole;
  setCurrentRole: (role: PerspectiveRole) => void;
  setCurrentTab: (tab: string) => void;
}

const roles: Array<{
  role: PerspectiveRole;
  label: string;
  tab: string;
  activeClass: string;
  icon: React.ReactNode;
}> = [
  {
    role: 'visitor',
    label: 'Buyer Lookbook',
    tab: 'home',
    activeClass: 'bg-ink text-cream shadow-brutal',
    icon: <Eye className="w-3.5 h-3.5" />,
  },
  {
    role: 'designer',
    label: 'Creator Studio',
    tab: 'studio-overview',
    activeClass: 'bg-saffron text-white shadow-brutal',
    icon: <FolderGit2 className="w-3.5 h-3.5" />,
  },
  {
    role: 'manufacturer',
    label: 'Loom Station',
    tab: 'workshop-orders',
    activeClass: 'bg-steel text-acid shadow-brutal',
    icon: <ShieldCheck className="w-3.5 h-3.5" />,
  },
];

export default function PerspectiveSwitcher({
  currentRole,
  setCurrentRole,
  setCurrentTab,
}: PerspectiveSwitcherProps) {
  return (
    <div className="fixed bottom-6 left-1/2 z-40 hidden -translate-x-1/2 items-center gap-2 border-4 border-ink bg-white px-3 py-2 shadow-brutal sm:flex select-none">
      <span className="border-r border-ink/15 pr-3 font-mono text-[9.5px] font-black uppercase tracking-[0.2em] text-zinc-400">
        Ecosystem Perspective
      </span>

      {roles.map((item) => {
        const active = currentRole === item.role;

        return (
          <button
            key={item.role}
            type="button"
            onClick={() => {
              setCurrentRole(item.role);
              setCurrentTab(item.tab);
            }}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 font-mono text-[10.5px] font-bold uppercase tracking-wider transition-all border border-transparent ${
              active
                ? item.activeClass
                : 'bg-transparent text-stone-500 hover:border-ink/10 hover:bg-cream hover:text-ink'
            }`}
            aria-pressed={active}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
