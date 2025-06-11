import React from 'react';

const Footer: React.FC = () => (
  <footer className="w-full bg-gray-900 text-white py-4 px-8 mt-8 text-center">
    <span className="text-sm">&copy; {new Date().getFullYear()} Ecom Store. All rights reserved.</span>
  </footer>
);

export default Footer;
