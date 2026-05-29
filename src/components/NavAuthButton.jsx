import { Link } from 'react-router-dom';

/**
 * Consistent nav-level auth button used across all auth pages.
 * Matches the pill-shaped "Sign up" button in the main Header.
 */
const NavAuthButton = ({ to, children }) => (
  <Link to={to}>
    <button className="bg-[#4A7C59] hover:bg-[#3d6b4a] text-white px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
      {children}
    </button>
  </Link>
);

export default NavAuthButton;
