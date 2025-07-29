import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/auth';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);

  // This will fetch the user's existing profile data when the page loads
  useEffect(() => {
    if (user) {
      // The user's custom data is stored in the user_metadata object
      setCountry(user.user_metadata.country || '');
      setCity(user.user_metadata.city || '');
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleUpdateProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      data: { country, city } // We save the data to the 'data' property
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Profile updated successfully!');
    }
    setLoading(false);
  };

  if (authLoading || !user) {
    return <p className="text-center">Loading...</p>;
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-4">My Profile</h2>
      <p className="text-slate-400 mb-8">
        Providing your location is optional and will always be anonymous.
      </p>
      <form onSubmit={handleUpdateProfile} className="max-w-md flex flex-col gap-4">
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-slate-300 mb-1">Country</label>
          <input
            id="country"
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full p-2 bg-slate-800/50 border border-slate-700 rounded-lg"
            placeholder="e.g., India"
          />
        </div>
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-slate-300 mb-1">City</label>
          <input
            id="city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full p-2 bg-slate-800/50 border border-slate-700 rounded-lg"
            placeholder="e.g., Visakhapatnam"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors self-start"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}