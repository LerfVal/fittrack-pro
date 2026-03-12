"use client";

interface SidebarProps {
  navItems: string[];
  activeNav: string;
  onNavChange: (item: string) => void;
}

export default function Sidebar({ navItems, activeNav, onNavChange }: SidebarProps) {
  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen bg-zinc-900 border-r border-zinc-800 px-4 py-6 fixed top-0 left-0 bottom-0">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-10 px-2">
        <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z" />
          </svg>
        </div>
        <span className="text-white font-bold text-lg tracking-tight">FitTrack</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => (
          <button
            key={item}
            onClick={() => onNavChange(item)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
              activeNav === item
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            {item}
          </button>
        ))}
      </nav>

      {/* User */}
      <div className="flex items-center gap-3 px-2 pt-4 border-t border-zinc-800">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-sm font-bold text-white">
          JD
        </div>
        <div>
          <p className="text-sm font-semibold text-white">John Doe</p>
          <p className="text-xs text-zinc-500">Pro Plan</p>
        </div>
      </div>
    </aside>
  );
}
