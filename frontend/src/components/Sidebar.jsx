import { NavLink, useNavigate } from 'react-router-dom';
import {
  Shield,
  LayoutDashboard,
  AlertTriangle,
  PlusCircle,
  LogOut,
  User,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/incidents', label: 'Incidents', icon: AlertTriangle },
  { to: '/incidents/new', label: 'New Incident', icon: PlusCircle },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 h-screen flex flex-col bg-cyber-card border-r border-cyber-border fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-cyber-border">
        <div className="p-2 bg-cyber-accent/10 rounded-lg border border-cyber-accent/20 glow-accent">
          <Shield className="w-5 h-5 text-cyber-accent" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-cyber-text tracking-wide">CyberShield</h1>
          <p className="text-xs text-cyber-muted">Incident Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold text-cyber-muted uppercase tracking-widest px-3 mb-3">
          Navigation
        </p>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="text-sm font-medium">{label}</span>
            {to === '/incidents/new' ? null : (
              <ChevronRight className="w-3 h-3 ml-auto opacity-40" />
            )}
          </NavLink>
        ))}
      </nav>

      {/* User profile */}
      <div className="border-t border-cyber-border p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-cyber-accent/20 border border-cyber-accent/30 flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-cyber-accent" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-cyber-text truncate">{user?.name}</p>
            <p className="text-xs text-cyber-muted">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-cyber-muted hover:bg-cyber-danger/10 hover:text-cyber-danger transition-all duration-200 text-sm"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
