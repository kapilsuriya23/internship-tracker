import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="border-b border-white/5 bg-ink/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="w-7 h-7 bg-volt rounded-md flex items-center justify-center">
            <svg className="w-4 h-4 text-ink" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 2L4.09 12.96a.5.5 0 0 0 .41.54H11l-2 9 8.91-10.96a.5.5 0 0 0-.41-.54H11l2-9z"/>
            </svg>
          </span>
          <span className="font-display font-700 text-lg text-frost">InternTrack</span>
        </Link>

        <div className="flex items-center gap-4">
          <span className="text-sm text-frost/50 hidden sm:block">
            Hey, <span className="text-frost font-medium">{user?.name?.split(' ')[0]}</span>
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-frost/40 hover:text-volt transition-colors duration-200 font-display font-600 tracking-wide"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}