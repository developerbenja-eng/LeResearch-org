'use client';

export type ResearchSection = 'topics' | 'chat' | 'sources' | 'social' | 'notebook' | 'podcast';

interface NavItem {
  id: ResearchSection;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  section: 'start' | 'tools' | 'workspace';
}

const BRAND = { r: 167, g: 139, b: 250 };

function Icon({ d, strokeWidth = 1.5 }: { d: string; strokeWidth?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'topics',
    icon: <Icon d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
    label: 'Browse Topics',
    badge: 68,
    section: 'start',
  },
  {
    id: 'chat',
    icon: <Icon d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.88L3 21l1.27-3.81A8.94 8.94 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />,
    label: 'Chat',
    section: 'start',
  },
  {
    id: 'sources',
    icon: <Icon d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
    label: 'Sources',
    section: 'tools',
  },
  {
    id: 'social',
    icon: <Icon d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6 0a4 4 0 10-6 0m11-3a4 4 0 10-6 0" />,
    label: 'Social Insights',
    section: 'tools',
  },
  {
    id: 'notebook',
    icon: <Icon d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v10a2 2 0 01-2 2zM15 4v5a1 1 0 001 1h5" />,
    label: 'My Notebook',
    section: 'workspace',
  },
  {
    id: 'podcast',
    icon: <Icon d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />,
    label: 'Podcast',
    section: 'workspace',
  },
];

interface ResearchSidebarProps {
  activeSection: ResearchSection;
  onSectionChange: (section: ResearchSection) => void;
  badges?: Partial<Record<ResearchSection, number>>;
  isOpen: boolean;
  onClose: () => void;
}

export function ResearchSidebar({
  activeSection,
  onSectionChange,
  badges = {},
  isOpen,
  onClose,
}: ResearchSidebarProps) {
  const groupedItems = {
    start: NAV_ITEMS.filter((item) => item.section === 'start'),
    tools: NAV_ITEMS.filter((item) => item.section === 'tools'),
    workspace: NAV_ITEMS.filter((item) => item.section === 'workspace'),
  };

  const handleNavClick = (section: ResearchSection) => {
    onSectionChange(section);
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky top-14 left-0 z-50 md:z-auto
          h-[calc(100vh-56px)]
          w-64 md:w-60 lg:w-64
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        style={{
          background: 'rgba(5,7,12,0.75)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Mobile Header */}
        <div
          className="flex items-center justify-between p-4 md:hidden"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-purple-300/70">
            Research · Menu
          </p>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/60"
            aria-label="Close menu"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-7">
          <NavSection title="Start Here">
            {groupedItems.start.map((item) => (
              <NavItemButton
                key={item.id}
                item={item}
                isActive={activeSection === item.id}
                badge={badges[item.id] ?? item.badge}
                onClick={() => handleNavClick(item.id)}
              />
            ))}
          </NavSection>

          <NavSection title="Research Tools">
            {groupedItems.tools.map((item) => (
              <NavItemButton
                key={item.id}
                item={item}
                isActive={activeSection === item.id}
                badge={badges[item.id]}
                onClick={() => handleNavClick(item.id)}
              />
            ))}
          </NavSection>

          <NavSection title="My Workspace">
            {groupedItems.workspace.map((item) => (
              <NavItemButton
                key={item.id}
                item={item}
                isActive={activeSection === item.id}
                badge={badges[item.id]}
                onClick={() => handleNavClick(item.id)}
              />
            ))}
          </NavSection>
        </nav>

        {/* AI Assistant CTA */}
        <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={() => handleNavClick('chat')}
            className="group relative w-full rounded-xl overflow-hidden text-left transition-all hover:-translate-y-0.5"
            style={{
              background: `linear-gradient(135deg, rgba(${BRAND.r},${BRAND.g},${BRAND.b},0.14) 0%, rgba(10,14,22,0.95) 100%)`,
              border: `1px solid rgba(${BRAND.r},${BRAND.g},${BRAND.b},0.28)`,
            }}
          >
            <span
              className="absolute top-0 left-4 right-4 h-px"
              style={{
                background: `linear-gradient(90deg, transparent, rgba(${BRAND.r},${BRAND.g},${BRAND.b},0.5), transparent)`,
              }}
            />
            <div className="px-4 py-3">
              <p className="text-[9px] font-mono tracking-[0.35em] uppercase text-purple-300/70 mb-1.5">
                Assistant
              </p>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-light text-white/90">Ask the research</span>
                <svg
                  className="w-3.5 h-3.5 text-purple-300/60 group-hover:text-purple-300 transition-colors"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                </svg>
              </div>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}

function NavSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[9px] font-mono tracking-[0.35em] uppercase text-white/30 mb-3 px-3">
        {title}
      </h3>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function NavItemButton({
  item,
  isActive,
  badge,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        relative w-full flex items-center gap-3 px-3 py-2 rounded-lg
        transition-all duration-150 text-left
        ${
          isActive
            ? 'text-white/95'
            : 'text-white/55 hover:text-white/85 hover:bg-white/[0.03]'
        }
      `}
      style={
        isActive
          ? {
              background: `linear-gradient(90deg, rgba(${BRAND.r},${BRAND.g},${BRAND.b},0.12), rgba(${BRAND.r},${BRAND.g},${BRAND.b},0.02))`,
              boxShadow: `inset 2px 0 0 rgba(${BRAND.r},${BRAND.g},${BRAND.b},0.85)`,
            }
          : undefined
      }
    >
      <span
        className={`transition-colors ${isActive ? 'text-purple-300' : 'text-white/40'}`}
      >
        {item.icon}
      </span>
      <span className="flex-1 text-sm font-light tracking-tight">{item.label}</span>
      {badge !== undefined && badge > 0 && (
        <span
          className={`
            text-[9px] font-mono tracking-wider tabular-nums px-1.5 py-0.5 rounded
            ${isActive ? 'text-purple-200 bg-purple-500/15' : 'text-white/40 bg-white/[0.04]'}
          `}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

// Mobile Menu Button Component
export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="md:hidden p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
      aria-label="Open menu"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );
}
