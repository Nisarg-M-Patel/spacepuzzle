
import React from 'react';

const Footer = () => {
  return (
    <footer className="py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-fuchsia-500 transition-colors">About</a></li>
              <li><a href="#" className="text-gray-400 hover:text-fuchsia-500 transition-colors">Careers</a></li>
              <li><a href="#" className="text-gray-400 hover:text-fuchsia-500 transition-colors">Press</a></li>
              <li><a href="#" className="text-gray-400 hover:text-fuchsia-500 transition-colors">Blog</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-fuchsia-500 transition-colors">Features</a></li>
              <li><a href="#" className="text-gray-400 hover:text-fuchsia-500 transition-colors">Pricing</a></li>
              <li><a href="#" className="text-gray-400 hover:text-fuchsia-500 transition-colors">Integrations</a></li>
              <li><a href="#" className="text-gray-400 hover:text-fuchsia-500 transition-colors">FAQ</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-fuchsia-500 transition-colors">Documentation</a></li>
              <li><a href="#" className="text-gray-400 hover:text-fuchsia-500 transition-colors">Guides</a></li>
              <li><a href="#" className="text-gray-400 hover:text-fuchsia-500 transition-colors">Support</a></li>
              <li><a href="#" className="text-gray-400 hover:text-fuchsia-500 transition-colors">API</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-fuchsia-500 transition-colors">Privacy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-fuchsia-500 transition-colors">Terms</a></li>
              <li><a href="#" className="text-gray-400 hover:text-fuchsia-500 transition-colors">Security</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 mb-4 md:mb-0">&copy; {new Date().getFullYear()} Your Company. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-fuchsia-500 transition-colors">Twitter</a>
            <a href="#" className="text-gray-400 hover:text-fuchsia-500 transition-colors">LinkedIn</a>
            <a href="#" className="text-gray-400 hover:text-fuchsia-500 transition-colors">Facebook</a>
            <a href="#" className="text-gray-400 hover:text-fuchsia-500 transition-colors">Instagram</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
