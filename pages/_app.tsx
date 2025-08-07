import '../styles/globals.css';
import 'rc-slider/assets/index.css';
import type { AppProps } from 'next/app';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../lib/auth';
import { ModalProvider } from '../context/ModalContext';
import Header from '../components/Header';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <ModalProvider>
        <div className="min-h-screen bg-slate-950 text-white">
          <Header />
          {/* 👇 THE FIX IS HERE: We are using a more constrained max-width */}
          <main className="max-w-5xl mx-auto p-4 md:p-8">
            <Component {...pageProps} />
          </main>
        </div>
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#334155',
              color: '#F1F5F9',
            },
          }}
        />
      </ModalProvider>
    </AuthProvider>
  );
}

export default MyApp;