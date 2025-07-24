import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';
import toast from 'react-hot-toast';

const SignUpForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      // Supabase provides an error message if the user is already registered.
      // We check for that specific message.
      if (error.message.includes("User already registered")) {
        setErrorMessage("This email is already registered.");
      } else {
        setErrorMessage(error.message);
      }
    } else {
      // If there is no error, it's either a new user or an unconfirmed user.
      // In both cases, the correct action is to show the confirmation prompt.
      setIsSubmitted(true);
    }

    setIsLoading(false);
  };

  if (isSubmitted) {
    return (
      <div className="text-center p-8 bg-slate-900/50 rounded-lg border border-slate-800 animate-fade-in max-w-md mx-auto">
        <h3 className="text-2xl font-bold text-white">✅ Almost there!</h3>
        <p className="text-slate-300 mt-4">
          We've sent a confirmation link to:
        </p>
        <p className="text-white font-semibold mt-1">{email}</p>
        <p className="text-slate-400 mt-4 text-sm">
          Please check your inbox (and spam folder) to activate your account.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSignUp} className="w-full max-w-md mx-auto">
      <div className="flex flex-col gap-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-slate-500"
          placeholder="Email Address"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-slate-500"
          placeholder="Password (min. 6 characters)"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-600"
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>

        {errorMessage && (
          <p className="text-center text-sm text-red-400 mt-3">
            {errorMessage}{' '}
            {errorMessage.includes('registered') && (
              <Link href="/login">
                <span className="font-bold hover:underline cursor-pointer">Log In here.</span>
              </Link>
            )}
          </p>
        )}
      </div>
    </form>
  );
};

export default SignUpForm;