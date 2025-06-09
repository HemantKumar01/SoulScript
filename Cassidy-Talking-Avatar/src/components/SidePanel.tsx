'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase'; // Adjust path to your firebase config
import { 
  Home, 
  Brain, 
  Waves, 
  LayoutDashboard, 
  Users, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  MapIcon,
  ChartColumn
} from 'lucide-react';
import { ChatBubbleIcon } from '@radix-ui/react-icons';

// Create context for sidebar state
const SidebarContext = createContext<{
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}>({
  isCollapsed: false,
  setIsCollapsed: () => {},
});

// Provider component
export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
};

// Hook to use sidebar context
export const useSidebar = () => useContext(SidebarContext);

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Home', href: '/dashboard', icon: <Home size={20} /> },
  { label: 'Mind Log', href: '/dashboard/mindlog', icon: <Brain size={20} /> },
  { label: 'Calmify', href: '/dashboard/calmify', icon: <Waves size={20} /> },
  { label: 'Dashboard', href: '/dashboard/persona-dashboard', icon: <LayoutDashboard size={20} /> },
  { label: 'Community', href: '/dashboard/blogs', icon: <Users size={20} /> },
  { label: 'Therapist', href: '/dashboard/therapists-near-you', icon: <MapIcon size={20} /> },
  { label: 'Reports', href: '/dashboard/reports', icon: <ChartColumn/> },
  { label: 'Reflection', href: '/dashboard/reflection', icon: <ChatBubbleIcon/> },
];

const SidePanel: React.FC = () => {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut(auth);
      router.push('/login'); // Adjust redirect path as needed
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getInitials = (displayName: string | null, email: string | null) => {
    if (displayName) {
      return displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <div 
      className={`
        fixed left-0 top-0 h-full bg-black border-r border-emerald-500/20 
        transition-all duration-300 ease-in-out z-50 flex flex-col
        ${isCollapsed ? 'w-16' : 'w-64'}
      `}
    >
      {/* Header with Profile */}
      <div className="p-4 border-b border-emerald-500/20">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-black font-semibold text-sm">
                {user ? (
                  user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    getInitials(user.displayName, user.email)
                  )
                ) : (
                  <UserIcon size={16} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {user?.displayName || user?.email || 'User'}
                </p>
                <p className="text-emerald-400 text-xs truncate">
                  {user?.email && user.displayName ? user.email : 'Welcome back'}
                </p>
              </div>
            </div>
          )}
          
          {isCollapsed && (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-black font-semibold text-xs mx-auto">
              {user ? (
                user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(user.displayName, user.email)
                )
              ) : (
                <UserIcon size={12} />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'text-white hover:bg-emerald-500/10 hover:text-emerald-300'
                    }
                    ${isCollapsed ? 'justify-center' : ''}
                  `}
                  title={isCollapsed ? item.label : ''}
                >
                  <span className={`${isActive ? 'text-emerald-400' : ''}`}>
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer with Logout */}
      <div className="p-4 border-t border-emerald-500/20">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`
            flex items-center space-x-3 px-3 py-2.5 rounded-lg w-full
            text-red-400 hover:bg-red-500/10 hover:text-red-300
            transition-all duration-200 disabled:opacity-50
            ${isCollapsed ? 'justify-center' : ''}
          `}
          title={isCollapsed ? 'Logout' : ''}
        >
          <LogOut size={20} className={isLoggingOut ? 'animate-spin' : ''} />
          {!isCollapsed && (
            <span className="font-medium">
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </span>
          )}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 w-6 h-6 bg-black border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 hover:bg-emerald-500/10 transition-colors duration-200"
      >
        {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </div>
  );
};

export default SidePanel;