
import React from 'react';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  return (
    <header className="border-b border-gray-100">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-xl font-semibold">Brand</span>
        </div>
        
        <nav className="hidden md:flex space-x-8">
          <a href="#" className="text-gray-200 hover:text-fuchsia-500 transition-colors">Home</a>
          <a href="#features" className="text-gray-200 hover:text-fuchsia-500 transition-colors">Features</a>
          <a href="#" className="text-gray-200 hover:text-fuchsia-500 transition-colors">About</a>
          <a href="#" className="text-gray-200 hover:text-fuchsia-500 transition-colors">Contact</a>
        </nav>
        
        <div className="flex items-center">
          <Button variant="outline" className="mr-2 hidden md:inline-flex">Log in</Button>
          <Button className="px-8 rounded-md bg-gradient-to-br from-blue-700 to-blue-900 text-white hover:from-blue-600 hover:to-fuchsia-600 transition-colors">Sign Up</Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
