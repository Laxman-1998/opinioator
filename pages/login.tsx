import Link from 'next/link';
import LoginForm from '../components/LoginForm';

const LoginPage = () => {
  return (
    <div>
      <h2 className="text-3xl font-bold text-center text-white">
        Log In
      </h2>
      <div className="w-full max-w-md mx-auto">
        <LoginForm />
        <p className="text-center text-sm text-slate-400 mt-4">
          Don't have an account?{' '}
          <Link href="/signup">
            <span className="text-blue-400 hover:underline cursor-pointer">
              Sign up here.
            </span>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;