import '../styles/globals.css';
import 'rc-slider/assets/index.css';
import type { AppProps } from 'next/app';
import Layout from '../components/Layout';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../lib/auth';
import { ModalProvider } from '../context/ModalContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <ModalProvider>
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
      </ModalProvider>
    </AuthProvider>
  );
}

export default MyApp;