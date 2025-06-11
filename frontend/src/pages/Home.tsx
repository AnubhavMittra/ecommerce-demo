import React from 'react';
import Sidebar from '../features/filters/Sidebar';
import MainContent from '../features/products/MainContent';

const Home: React.FC = () => (
  <div className="flex h-screen">
    <Sidebar />
    <div className="rounded w-full flex justify-between flex-wrap">
      <MainContent />
    </div>
  </div>
);

export default Home;
