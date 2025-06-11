import React from 'react';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => (
  <div className="flex flex-col min-h-screen bg-gray-50">
    <Header />
    <main className="flex-1 flex flex-col items-center justify-start w-full">
      {children}
    </main>
    <Footer />
  </div>
);

export default MainLayout;
