import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Check for logged in user on component mount and when localStorage changes
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      const role = localStorage.getItem('userRole');
      
      // IMPORTANT: Only show user if they are patient or doctor, NOT admin
      if (token && userData && role !== 'admin') {
        setUser(JSON.parse(userData));
        setUserRole(role);
      } else {
        setUser(null);
        setUserRole(null);
      }
    };

    checkAuthStatus();

    // Listen for storage changes (when user logs in/out in another tab)
    window.addEventListener('storage', checkAuthStatus);
    
    return () => {
      window.removeEventListener('storage', checkAuthStatus);
    };
  }, []);

  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    setUser(null);
    setUserRole(null);
    navigate('/');
  };

  // Function to check if current path matches the nav item
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Function to get nav item classes
  const getNavClasses = (path) => {
    const baseClasses = "transition-all duration-300 font-medium relative px-3 py-2 rounded-lg transform";
    const activeClasses = "text-mentra-primary bg-mentra-secondary/30 shadow-sm scale-105";
    const inactiveClasses = "text-gray-700 hover:text-mentra-primary hover:bg-mentra-secondary/20 hover:scale-105";
    
    return `${baseClasses} ${isActive(path) ? activeClasses : inactiveClasses}`;
  };

  // Function to render active indicator
  const renderActiveIndicator = (path) => {
    if (isActive(path)) {
      return (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-mentra-primary rounded-full animate-pulse"></div>
      );
    }
    return null;
  };

  return (
    <header className="bg-mentra-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-mentra-secondary shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 cursor-pointer">
            <svg className="w-8 h-8 text-mentra-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
              <path d="M12 16L10.91 22.26L2 23L10.91 23.74L12 30L13.09 23.74L22 23L13.09 22.26L12 16Z" opacity="0.6"/>
            </svg>
            <span className="text-2xl font-bold text-mentra-primary-dark tracking-tight">MENTRA</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <Link to="/" className={getNavClasses('/')}>
              Home
              {renderActiveIndicator('/')}
            </Link>
            <a href="#chatbot" className="text-gray-700 hover:text-mentra-primary hover:bg-mentra-secondary/20 transition-all duration-300 font-medium relative px-3 py-2 rounded-lg transform hover:scale-105">
              Chatbot
            </a>
            <Link to="/services" className={getNavClasses('/services')}>
              Services
              {renderActiveIndicator('/services')}
            </Link>
            <Link to="/professionals" className={getNavClasses('/professionals')}>
              Professionals
              {renderActiveIndicator('/professionals')}
            </Link>
            <Link to="/about" className={getNavClasses('/about')}>
              About Us
              {renderActiveIndicator('/about')}
            </Link>
          </nav>

          {/* Login/Signup or Profile Section */}
          <div className="flex items-center space-x-3">
            {user ? (
              // Profile Icon for logged in users
              <Link to={
                userRole === 'admin' ? '/admin-dashboard' :
                userRole === 'doctor' ? '/doctor-dashboard' :
                '/dashboard'
              }>
                <button className="w-10 h-10 bg-mentra-primary hover:bg-mentra-primary-hover rounded-full flex items-center justify-center text-white font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg">
                  {(user.full_name || user.email).charAt(0).toUpperCase()}
                </button>
              </Link>
            ) : (
              // Login and Signup buttons for non-logged in users
              <>
                <Link to="/login">
                  <button className="text-mentra-primary hover:text-mentra-primary-hover px-4 py-2 rounded-full transition-all duration-200 font-medium">
                    Login
                  </button>
                </Link>
                
                <Link to="/signup">
                  <button className="bg-mentra-primary hover:bg-mentra-primary-hover text-white px-6 py-2.5 rounded-full transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105">
                    Sign up
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-mentra-secondary transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-mentra-secondary bg-mentra-white/95 backdrop-blur-sm">
            <div className="flex flex-col space-y-2 px-4">
              <Link 
                to="/" 
                className={`${getNavClasses('/')} ${isActive('/') ? 'bg-mentra-secondary/50' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center justify-between">
                  <span>Home</span>
                  {isActive('/') && <span className="text-mentra-primary">•</span>}
                </div>
              </Link>
              <a 
                href="#chatbot" 
                className="text-gray-700 hover:text-mentra-primary hover:bg-mentra-secondary/20 font-medium px-3 py-2 rounded-lg transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Chatbot
              </a>
              <Link 
                to="/services" 
                className={`${getNavClasses('/services')} ${isActive('/services') ? 'bg-mentra-secondary/50' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center justify-between">
                  <span>Services</span>
                  {isActive('/services') && <span className="text-mentra-primary">•</span>}
                </div>
              </Link>
              <Link 
                to="/professionals" 
                className={`${getNavClasses('/professionals')} ${isActive('/professionals') ? 'bg-mentra-secondary/50' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center justify-between">
                  <span>Professionals</span>
                  {isActive('/professionals') && <span className="text-mentra-primary">•</span>}
                </div>
              </Link>
              <Link 
                to="/about" 
                className={`${getNavClasses('/about')} ${isActive('/about') ? 'bg-mentra-secondary/50' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center justify-between">
                  <span>About Us</span>
                  {isActive('/about') && <span className="text-mentra-primary">•</span>}
                </div>
              </Link>
              
              {/* Mobile Login/Profile Section */}
              <div className="pt-4 border-t border-mentra-secondary/50 mt-4">
                {user ? (
                  // Profile section for logged in users
                  <Link 
                    to="/dashboard" 
                    className="flex items-center space-x-3 px-3 py-2 bg-mentra-secondary/20 hover:bg-mentra-secondary/30 rounded-lg transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="w-10 h-10 bg-mentra-primary rounded-full flex items-center justify-center text-white font-semibold">
                      {(user.full_name || user.email).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Go to Dashboard</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </Link>
                ) : (
                  // Login and signup for non-logged in users
                  <>
                    <Link 
                      to="/login" 
                      className="text-gray-700 hover:text-mentra-primary hover:bg-mentra-secondary/20 font-medium px-3 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Login</span>
                    </Link>
                    <Link 
                      to="/signup" 
                      className="bg-mentra-primary hover:bg-mentra-primary-hover text-white px-3 py-2 rounded-lg font-semibold transition-all duration-200 mt-2 text-center block"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;