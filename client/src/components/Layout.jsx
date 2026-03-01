import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Users, Car, Wrench, Calendar, UserCheck, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

function Layout({ user, onLogout }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/appointments', icon: Calendar, label: 'Appointments' },
    { path: '/customers', icon: Users, label: 'Customers' },
    { path: '/vehicles', icon: Car, label: 'Vehicles' },
    { path: '/repairs', icon: Wrench, label: 'Repair Jobs' },
    { path: '/staff', icon: UserCheck, label: 'Staff & Attendance' },
  ];

  return (
    <div className="flex h-screen bg-darkBg overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-darkCard border-r border-borderColor flex flex-col transition-all duration-300 relative`}>
        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-6 bg-danger text-white p-1.5 rounded-full shadow-lg hover:bg-dangerHover transition-all z-10"
        >
          {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
        </button>

        {/* Header */}
        <div className="p-6 border-b border-borderColor">
          <h1 className={`text-xl font-bold text-textPrimary transition-all ${!sidebarOpen && 'text-center text-sm'}`}>
            {sidebarOpen ? 'K&L Auto Repair' : 'K&L'}
          </h1>
          {sidebarOpen && (
            <>
              <p className="text-sm text-textSecondary mt-1">{user.full_name}</p>
              <p className="text-xs text-danger capitalize font-medium">{user.role}</p>
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={isActive ? 'sidebar-link-active' : 'sidebar-link'}
                title={!sidebarOpen ? item.label : ''}
              >
                <Icon size={20} className="flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-borderColor">
          <button
            onClick={onLogout}
            className="sidebar-link w-full hover:text-danger"
            title={!sidebarOpen ? 'Logout' : ''}
          >
            <LogOut size={20} className="flex-shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
