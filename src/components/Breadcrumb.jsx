import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Breadcrumb = ({ customTitle }) => {
  const location = useLocation();
  
  const getBreadcrumbData = () => {
    const path = location.pathname;
    
    switch (path) {
      case '/':
        return { title: 'Home', showBreadcrumb: false };
      case '/professionals':
        return { title: 'Professionals', showBreadcrumb: true };
      case '/services':
        return { title: 'Services', showBreadcrumb: true };
      case '/about':
        return { title: 'About Us', showBreadcrumb: true };
      case '/signup':
        return { title: 'Sign Up', showBreadcrumb: true };
      case '/register-user':
        return { title: 'User Registration', showBreadcrumb: true };
      case '/register-professional':
        return { title: 'Professional Registration', showBreadcrumb: true };
      case '/doctor-pending':
        return { title: 'Account Under Review', showBreadcrumb: true };
      case '/doctor-login':
        return { title: 'Doctor Login', showBreadcrumb: true };
      default:
        return { title: customTitle || 'Page', showBreadcrumb: true };
    }
  };

  const breadcrumbData = getBreadcrumbData();

  if (!breadcrumbData.showBreadcrumb) {
    return null;
  }

  return (
    <div className="bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <nav className="flex items-center space-x-2 text-sm">
          <Link 
            to="/" 
            className="text-gray-500 hover:text-mentra-primary transition-colors"
          >
            Home
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-mentra-primary font-medium">
            {breadcrumbData.title}
          </span>
        </nav>
      </div>
    </div>
  );
};

export default Breadcrumb;