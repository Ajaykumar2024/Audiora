import { useState } from 'react';
import { NavLink, Outlet, Link, useOutletContext } from 'react-router-dom';
import {
  LayoutDashboard,
  UploadCloud,
  Disc3,
  Settings,
  X,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

/**
 * Navigation configuration for the Artist Studio sidebar.
 */
const studioNavItems = [
  {
    name: 'Dashboard',
    path: '/studio',
    icon: LayoutDashboard,
    end: true, // Exact match so '/studio' doesn't stay active on sub-routes
  },
  {
    name: 'Upload Music',
    path: '/studio/upload',
    icon: UploadCloud,
    end: false,
  },
  {
    name: 'My Albums',
    path: '/studio/albums',
    icon: Disc3,
    end: false,
  },
  {
    name: 'Settings',
    path: '/studio/settings',
    icon: Settings,
    end: false,
  },
];

/**
 * ArtistStudioLayout
 *
 * Sits precisely between the globally configured TopBar (Navbar)
 * and the GlobalAudioPlayer (BottomPlayer).
 *
 * Features:
 * - Uses the global TopBar hamburger menu to toggle the mobile sidebar drawer.
 * - Desktop: fixed w-64 left navigation column.
 * - Mobile/Tablet: slide-out drawer controlled by the main header's hamburger button.
 * - Single consistent header across the entire application (no duplicate mobile header).
 * - Active tab highlight with distinct background and text colors using <NavLink>.
 * - Independent scrollable main area with <Outlet /> for nested routes.
 */
export default function ArtistStudioLayout() {
  const [logoError, setLogoError] = useState(false);
  const outletContext = useOutletContext() || {};
  const isSidebarOpen = outletContext.isSidebarOpen ?? false;
  const onCloseSidebar = outletContext.onCloseSidebar || (() => { });

  return (
    <div
      className="w-full h-full flex flex-col md:flex-row overflow-hidden bg-zinc-950 text-zinc-100 min-h-0 flex-1 relative"
    >
      {/* =========================================================================
          1. MOBILE BACKDROP (Controlled by global TopBar hamburger)
      ========================================================================== */}
      <div
        className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-xs transition-opacity duration-300 md:hidden ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={onCloseSidebar}
        aria-hidden="true"
      />

      {/* =========================================================================
          2. SIDEBAR NAVIGATION (Left Side)
          - Desktop: Fixed w-64 starting from top (top-0) to player (bottom-24), matching AppLayout.
          - Mobile / Tablet: Slide-out drawer opened via the TopBar hamburger.
      ========================================================================== */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 flex flex-col pb-20 sm:pb-24 md:pb-0
          bg-zinc-900 border-r border-zinc-800/80 shadow-2xl md:shadow-none
          transition-transform duration-300 ease-in-out
          md:top-0 md:bottom-20 sm:md:bottom-24 md:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Studio Branding / Header (h-16 matches TopBar Navbar) */}
        <div className="h-16 px-5 border-b border-zinc-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Link
              to="/studio"
              onClick={onCloseSidebar}
              className="flex items-center gap-3 group"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/90 border border-emerald-500/30 group-hover:border-emerald-400 shadow-sm overflow-hidden shrink-0 transition-all duration-200">
                {!logoError ? (
                  <img
                    src="/logo.png"
                    alt="Audiora Logo"
                    className="w-full h-full object-cover"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <span
                    className="font-black text-sm text-emerald-400 select-none"
                    aria-hidden="true"
                  >
                    A
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm sm:text-base tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                    Artist Studio
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 rounded-md">
                    PRO
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">Audiora Creator Hub</p>
              </div>
            </Link>
          </div>

          {/* Close button on mobile / tablet */}
          <button
            type="button"
            onClick={onCloseSidebar}
            aria-label="Close Studio Navigation"
            className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Back to main music app link */}
        <div className="px-3 pt-3">
          <Link
            to="/"
            onClick={onCloseSidebar}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800/60 transition-colors group"
          >
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
            <span>Return to Listener App</span>
          </Link>
        </div>

        {/* Navigation Links list */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto overflow-x-hidden">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Studio Menu
          </div>

          {studioNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={onCloseSidebar}
                className={({ isActive }) => `
                  group flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200 relative
                  ${isActive
                    ? 'bg-emerald-500/15 text-emerald-400 font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    {/* Active left indicator pill */}
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 bg-emerald-500 rounded-r-full" />
                    )}

                    <Icon
                      size={20}
                      className={`shrink-0 transition-colors duration-200 ${isActive
                        ? 'text-emerald-400'
                        : 'text-zinc-400 group-hover:text-zinc-200'
                        }`}
                    />
                    <span className="truncate">{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer / Artist Status Card */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/50 shrink-0">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/40">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <Sparkles size={16} />
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-zinc-200 truncate">Artist Portal Active</p>
              <p className="text-[11px] text-zinc-400 truncate">Instant Publishing</p>
            </div>
          </div>
        </div>
      </aside>

      {/* =========================================================================
          3. MAIN CONTENT AREA (Right Side)
          - Occupies remaining width (`flex-1 min-w-0`).
          - Independent vertical scroll (`overflow-y-auto`).
          - Single top header across all screen sizes.
      ========================================================================== */}
      <main className="flex-1 min-h-0 flex flex-col min-w-0 h-full overflow-hidden bg-zinc-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.06),rgba(9,9,11,1))] md:ml-64">
        {/* Scrollable content container for nested routes */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
