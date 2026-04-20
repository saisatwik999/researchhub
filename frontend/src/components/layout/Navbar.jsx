import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiOutlineMenu, HiOutlineX, HiOutlineLogout, HiOutlineUser } from 'react-icons/hi';
import { useState } from 'react';

/**
 * Navbar: Top navigation bar with responsive mobile menu
 */
const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/projects', label: 'Projects' },
    { path: '/projects/create', label: 'New Idea', highlight: true },
  ];

  if (user?.role === 'admin') {
    navLinks.push({ path: '/admin', label: 'Admin', highlight: true });
  }

  const isActive = (path) => location.pathname === path;

  if (!isAuthenticated) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-shadow">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="text-lg font-bold gradient-text hidden sm:block">ResearchHub</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive(link.path)
                    ? 'bg-primary-500/20 text-primary-300'
                    : 'text-dark-300 hover:text-white hover:bg-white/5'
                  }
                  ${link.highlight && !isActive(link.path) ? 'text-primary-400' : ''}
                `}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/profile"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200
                ${isActive('/profile') ? 'bg-primary-500/20 text-primary-300' : 'text-dark-300 hover:text-white hover:bg-white/5'}`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user?.name}</span>
                <span className="text-xs text-dark-400 capitalize">{user?.role}</span>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
              title="Logout"
            >
              <HiOutlineLogout className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-dark-300 hover:bg-white/5"
          >
            {mobileOpen ? <HiOutlineX className="w-6 h-6" /> : <HiOutlineMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden glass border-t border-white/5 animate-slide-down">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all
                  ${isActive(link.path) ? 'bg-primary-500/20 text-primary-300' : 'text-dark-300 hover:bg-white/5'}`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/profile"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-4 py-3 rounded-lg text-dark-300 hover:bg-white/5"
            >
              <HiOutlineUser className="w-5 h-5" />
              Profile
            </Link>
            <button
              onClick={() => { setMobileOpen(false); handleLogout(); }}
              className="w-full flex items-center gap-2 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10"
            >
              <HiOutlineLogout className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
