import 'rc-slider/assets/index.css';
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Layout from '../components/Layout';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../lib/auth'; // Import our new AuthProvider

function MyApp({ Component, pageProps }: AppProps) {
  return (
    // We wrap the entire app with the AuthProvider
    <AuthProvider>
      <Layout>
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#334155',
              color: '#F1F5F9',
            },
          }}
        />
        <Component {...pageProps} />
      </Layout>
    </AuthProvider>
  );
}

export default MyApp;