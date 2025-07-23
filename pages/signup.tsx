import SignUpForm from '../components/SignUpForm';

const SignUpPage = () => {
  return (
    <div>
      <h2 className="text-3xl font-bold text-center text-white">
        Create Your Account
      </h2>
      <p className="text-center text-slate-400 mt-2 mb-8">
        Your email is used for login only and will never be shown to other users.
      </p>
      <SignUpForm />
    </div>
  );
};

export default SignUpPage;