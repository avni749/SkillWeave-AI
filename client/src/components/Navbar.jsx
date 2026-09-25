import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Code2, LogOut, User, Sparkles } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2">
              <Code2 className="h-8 w-8 text-primary-600" />
              <span className="font-bold text-xl text-gray-900">SkillWeave AI</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/feed" className="text-gray-600 hover:text-gray-900 font-medium">Feed</Link>
                <Link to="/developers" className="text-gray-600 hover:text-gray-900 font-medium">Developers</Link>
                <Link to="/collaborators" className="text-gray-600 hover:text-gray-900 font-medium">Match</Link>
                <Link to="/ai-analyzer" className="text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1"><Sparkles className="w-4 h-4 text-primary-500" /> AI Analyzer</Link>
                <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 font-medium">Dashboard</Link>
                <Link to="/profile" className="text-gray-600 hover:text-gray-900 font-medium">Profile</Link>
                <div className="h-6 w-px bg-gray-200"></div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">{user.name}</span>
                  <button 
                    onClick={handleLogout}
                    className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium">Login</Link>
                <Link to="/register" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
