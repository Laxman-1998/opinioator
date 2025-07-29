import Link from 'next/link';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

const Header = () => {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      toast.loading('Logging out...');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/');
      toast.dismiss();
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to log out. Please try again.');
      console.error('Error logging out:', error);
    }
  };

  return (
    <header className="w-full border-b border-slate-800">
      <div className="w-full max-w-2xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/">
          <h1 className="text-xl font-bold text-white tracking-wider cursor-pointer">
            Opinioator
          </h1>
        </Link>
        <nav className="flex items-center gap-6">
          {user ? (
            <>
              <Link href="/dashboard">
                <span className="text-sm font-medium text-slate-300 hover:text-white transition-colors cursor-pointer">
                  My Dashboard
                </span>
              </Link>
              <Link href="/profile">
                <span className="text-sm font-medium text-slate-300 hover:text-white transition-colors cursor-pointer">
                  My Profile
                </span>
              </Link>
              <button 
                onClick={handleLogout}
                className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-red-700 transition-colors"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login">
                <span className="text-sm text-slate-300 hover:text-white transition-colors cursor-pointer">
                  Log In
                </span>
              </Link>
              <Link href="/signup">
                <span className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-blue-700 transition-colors cursor-pointer">
                  Sign Up
                </span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;