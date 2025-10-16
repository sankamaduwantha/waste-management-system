import { Link } from 'react-router-dom';
import { TrashIcon } from '@heroicons/react/24/outline';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <TrashIcon className="w-8 h-8 text-primary-500" />
              <span className="text-xl font-bold text-white">WasteHub</span>
            </div>
            <p className="text-sm text-gray-400">
              Smart waste management solutions for a sustainable future.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="hover:text-primary-500 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-primary-500 transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-primary-500 transition-colors">Security</a></li>
              <li><a href="#" className="hover:text-primary-500 transition-colors">API</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-primary-500 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-primary-500 transition-colors">Contact</Link></li>
              <li><Link to="/careers" className="hover:text-primary-500 transition-colors">Careers</Link></li>
              <li><Link to="/blog" className="hover:text-primary-500 transition-colors">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/help" className="hover:text-primary-500 transition-colors">Help Center</Link></li>
              <li><Link to="/documentation" className="hover:text-primary-500 transition-colors">Documentation</Link></li>
              <li><Link to="/terms" className="hover:text-primary-500 transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-primary-500 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 WasteHub. All rights reserved. Built for a cleaner tomorrow.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
