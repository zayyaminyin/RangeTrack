import React from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
interface LayoutProps {
  children: ReactNode;
}
export const Layout: React.FC<LayoutProps> = ({
  children
}) => {
  return <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-4 pb-20">
        {children}
      </main>
      <BottomNav />
    </div>;
};