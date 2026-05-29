import { Link } from 'react-router-dom';
import NavAuthButton from './NavAuthButton.jsx';

/**
 * Consistent top nav for all auth pages (login, register, forgot password, etc.)
 * Uses the same logo as the main Header.
 */
const AuthNav = ({ label, buttonText, buttonTo }) => (
  <nav className="flex items-center justify-between px-8 h-16 border-b border-gray-100 flex-shrink-0">
    <Link to="/" className="flex items-center space-x-2">
      <svg className="w-8 h-8 text-[#4A7C59]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
        <path d="M12 16L10.91 22.26L2 23L10.91 23.74L12 30L13.09 23.74L22 23L13.09 22.26L12 16Z" opacity="0.6"/>
      </svg>
      <span className="text-2xl font-bold text-[#2d5238] tracking-tight">MENTRA</span>
    </Link>
    {label && buttonText && buttonTo && (
      <div className="flex items-center gap-4 text-sm">
        <span className="text-gray-400">{label}</span>
        <NavAuthButton to={buttonTo}>{buttonText}</NavAuthButton>
      </div>
    )}
  </nav>
);

export default AuthNav;
