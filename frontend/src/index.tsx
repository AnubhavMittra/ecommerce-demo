import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
// import './styles/globals.css';
import './index.css'; 
import { FilterProvider } from '@/features/filters/FilterContext';

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <FilterProvider>
      <App />
    </FilterProvider>
  </React.StrictMode>
);