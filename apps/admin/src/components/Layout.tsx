import { ReactNode } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  ShoppingBag,
  MessageSquare,
  Star,
  LogOut,
} from 'lucide-react';
import { getUser, logout } from '../store/auth';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/restaurants', label: 'Restaurants', icon: UtensilsCrossed },
  { to: '/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/reviews', label: 'Reviews', icon: MessageSquare },
  { to: '/ratings', label: 'Ratings', icon: Star },
];

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/users': 'Users',
  '/restaurants': 'Restaurants',
  '/orders': 'Orders',
  '/reviews': 'Reviews',
  '/ratings': 'Ratings',
};

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();

  const pageTitle =
    Object.entries(pageTitles).find(([path]) => location.pathname.startsWith(path))?.[1] ?? 'Admin';

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F5F5]">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 bg-white border-r border-[#EEEEEE] flex flex-col">
        {/* Logo */}
        <div className="px-6 py-4 border-b border-[#EEEEEE] flex items-center gap-3">
          <img src="/logo.png" alt="Rahaa Eats" className="w-9 h-9 object-contain" />
          <div>
            <span className="text-lg font-bold text-primary leading-none">Rahaa Eats</span>
            <p className="text-xs text-[#757575] font-medium leading-none mt-0.5">Admin</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-green-50 text-primary'
                    : 'text-[#757575] hover:bg-gray-50 hover:text-[#1A1A1A]'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-[#EEEEEE]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-[#757575] hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-[#EEEEEE] px-6 py-4 flex items-center justify-between flex-shrink-0">
          <h1 className="text-xl font-semibold text-[#1A1A1A]">{pageTitle}</h1>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
              {(user?.fullName ?? user?.phoneNumber ?? 'A').charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-[#757575]">{user?.fullName ?? user?.phoneNumber ?? 'Admin'}</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
