import { NavLink } from "react-router-dom";
import { cn } from "../../lib/cn";

const navItems = [
  { to: "/", label: "Dashboard", icon: "grid" },
  { to: "/monitoring", label: "Monitoring", icon: "activity" },
  { to: "/analytics", label: "Analytics", icon: "bar-chart" },
  { to: "/reports", label: "Reports", icon: "file-text" },
  { to: "/settings", label: "Settings", icon: "settings" },
];

const icons: Record<string, React.ReactNode> = {
  grid: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="square" strokeWidth={1.5} d="M4 5h6v6H4zM14 5h6v6h-6zM4 15h6v6H4zM14 15h6v6h-6z" />
    </svg>
  ),
  activity: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="square" strokeWidth={1.5} d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
  "bar-chart": (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="square" strokeWidth={1.5} d="M12 20V10M18 20V4M6 20v-4" />
    </svg>
  ),
  "file-text": (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="square" strokeWidth={1.5} d="M14 2H6v20h12V6l-4-4zM14 2v4h4M16 13H8M16 17H8M10 9H8" />
    </svg>
  ),
  settings: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx={12} cy={12} r={3} strokeWidth={1.5} />
      <path strokeLinecap="square" strokeWidth={1.5} d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  ),
};

export function Sidebar() {
  return (
    <aside className="w-56 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="px-4 py-5 border-b border-gray-200">
        <h1 className="text-lg font-semibold text-gray-900 tracking-tight">
          PowerBoard
        </h1>
      </div>
      <nav className="flex-1 py-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-600 text-white mx-2"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              )
            }
          >
            {icons[item.icon]}
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
