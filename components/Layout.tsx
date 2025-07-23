import React from 'react';
import Header from './Header';

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <div>
      <Header />
      <main className="w-full max-w-2xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;