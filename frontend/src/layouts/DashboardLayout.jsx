import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  LayoutDashboard,
  FileWarning,
  Megaphone,
  PlusCircle,
  LogOut,
  Menu,
  X,
  User,
  Building,
  Bell
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const { user, logoutUser, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  // Define navigation options based on roles
  const residentLinks = [
    {
      name: 'Notice Board & Portal',
      path: '/resident/dashboard',
      icon: Megaphone
    },
    {
      name: 'My Complaints',
      path: '/resident/dashboard', // handled on dashboard tabs or route
      hash: '#complaints',
      icon: FileWarning
    },
    {
      name: 'Raise Complaint',
      path: '/resident/raise-complaint',
      icon: PlusCircle
    }
  ];

  const adminLinks = [
    {
      name: 'Dashboard Stats',
      path: '/admin/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'Complaints Manager',
      path: '/admin/complaints',
      icon: FileWarning
    },
    {
      name: 'Manage Notice Board',
      path: '/admin/notices',
      icon: Megaphone
    }
  ];

  const links = isAdmin ? adminLinks : residentLinks;

  const isActive = (linkPath, linkHash) => {
    if (linkHash) {
      return location.pathname === linkPath && location.hash === linkHash;
    }
    return location.pathname === linkPath && !location.hash;
  };

  return (
    <div class="min-h-screen flex flex-col md:flex-row bg-slate-50 font-sans">
      {/* Mobile Header Menu */}
      <header class="md:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100 shadow-sm z-30">
        <div class="flex items-center gap-2">
          <Building class="h-6 w-6 text-brand-600" />
          <span class="font-extrabold text-xl tracking-tight text-slate-800">SocietyHQ</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          class="p-2 text-slate-500 hover:text-slate-700 focus:outline-none"
        >
          {isSidebarOpen ? <X class="h-6 w-6" /> : <Menu class="h-6 w-6" />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside
        class={`fixed inset-y-0 left-0 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 transition-transform duration-200 ease-in-out w-64 bg-slate-900 text-white z-40 flex flex-col justify-between shadow-xl md:shadow-none`}
      >
        <div>
          {/* Logo Brand area */}
          <div class="flex items-center gap-3 px-6 py-6 border-b border-slate-800">
            <div class="bg-indigo-600 p-2 rounded-lg text-white">
              <Building class="h-6 w-6" />
            </div>
            <div>
              <h2 class="font-extrabold text-lg tracking-wider text-white">SOCIETYHQ</h2>
              <p class="text-xs text-indigo-400 font-semibold tracking-wide">PORTAL SYSTEM</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav class="mt-8 px-4 space-y-1">
            {links.map((link, idx) => {
              const Icon = link.icon;
              const active = isActive(link.path, link.hash);
              return (
                <Link
                  key={idx}
                  to={link.hash ? `${link.path}${link.hash}` : link.path}
                  onClick={() => setIsSidebarOpen(false)}
                  class={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`}
                >
                  <Icon class="h-5 w-5" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Profile and Logout Footer */}
        <div class="p-4 border-t border-slate-800">
          <div class="flex items-center gap-3 px-4 py-3 bg-slate-800/50 rounded-xl mb-4">
            <div class="bg-indigo-600/20 text-indigo-400 p-2 rounded-lg">
              <User class="h-5 w-5" />
            </div>
            <div class="overflow-hidden">
              <h4 class="font-semibold text-sm truncate text-slate-100">{user?.name}</h4>
              <p class="text-xs text-indigo-400 font-medium capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            class="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-950/20 border border-transparent hover:border-rose-900/30 transition-all duration-200"
          >
            <LogOut class="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div class="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Desktop Header */}
        <header class="hidden md:flex items-center justify-between px-8 py-5 bg-white/70 backdrop-blur-md border-b border-slate-100 shadow-sm sticky top-0 z-20">
          <div>
            <h1 class="text-xl font-extrabold text-slate-800">Welcome, {user?.name}</h1>
            <p class="text-xs text-slate-500 font-medium">Logged in as a {user?.role}</p>
          </div>
          <div class="flex items-center gap-4">
            <div class="p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors relative cursor-pointer">
              <Bell class="h-5 w-5" />
              <span class="absolute top-1 right-1 h-2.5 w-2.5 bg-indigo-600 rounded-full border-2 border-white"></span>
            </div>
            <div class="h-8 w-px bg-slate-200"></div>
            <div class="flex items-center gap-2 bg-slate-100/50 py-1.5 px-3 rounded-full border border-slate-200/50">
              <div class="bg-indigo-600 text-white rounded-full h-7 w-7 flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                {user?.name ? user.name[0] : 'U'}
              </div>
              <span class="text-sm font-semibold text-slate-700 px-1">{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <main class="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Sidebar overlay for Mobile */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          class="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
        ></div>
      )}
    </div>
  );
};

export default DashboardLayout;
