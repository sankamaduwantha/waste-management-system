import { Link } from 'react-router-dom';
import { TrashIcon, MagnifyingGlassIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    {
      title: 'Getting Started',
      icon: '🚀',
      articles: [
        'How to create an account',
        'Setting up your profile',
        'Understanding your dashboard',
        'First collection setup'
      ]
    },
    {
      title: 'Account & Billing',
      icon: '💳',
      articles: [
        'Managing your subscription',
        'Payment methods',
        'Billing history',
        'Upgrade or downgrade plan'
      ]
    },
    {
      title: 'Collections & Schedules',
      icon: '📅',
      articles: [
        'View collection schedule',
        'Request special pickup',
        'Missed collection',
        'Holiday schedules'
      ]
    },
    {
      title: 'Technical Support',
      icon: '🔧',
      articles: [
        'Troubleshooting login issues',
        'Mobile app problems',
        'Browser compatibility',
        'Report a bug'
      ]
    },
    {
      title: 'Recycling & Waste',
      icon: '♻️',
      articles: [
        'What can be recycled',
        'Hazardous waste disposal',
        'Composting guidelines',
        'Bulk item pickup'
      ]
    },
    {
      title: 'Business Accounts',
      icon: '🏢',
      articles: [
        'Commercial services',
        'Multiple locations',
        'Custom schedules',
        'Volume discounts'
      ]
    }
  ];

  const faqs = [
    {
      question: 'What happens if I miss my collection day?',
      answer: 'If you miss your scheduled collection, you can request a special pickup through your dashboard or contact support. Additional fees may apply.'
    },
    {
      question: 'How do I change my collection schedule?',
      answer: 'You can modify your collection schedule in your account settings. Changes typically take effect within 24-48 hours.'
    },
    {
      question: 'Are there any items that cannot be collected?',
      answer: 'Hazardous materials, chemicals, and certain electronics require special disposal. Check our recycling guidelines for a complete list.'
    },
    {
      question: 'How can I track my waste collection vehicle?',
      answer: 'Our real-time tracking feature is available in the mobile app and web dashboard. You\'ll receive notifications when the vehicle is nearby.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <TrashIcon className="w-8 h-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">
                Waste<span className="text-primary-600">Hub</span>
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Search */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">How can we help you?</h1>
          <p className="text-xl text-gray-600 mb-8">
            Search our knowledge base or browse categories below
          </p>
          <div className="relative max-w-2xl mx-auto">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
            <input
              type="text"
              placeholder="Search for help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Browse by Category</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{category.title}</h3>
                <ul className="space-y-2">
                  {category.articles.map((article, idx) => (
                    <li key={idx}>
                      <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors flex items-start">
                        <span className="mr-2">•</span>
                        <span>{article}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-start">
                  <QuestionMarkCircleIcon className="w-6 h-6 text-primary-600 mr-2 flex-shrink-0" />
                  {faq.question}
                </h3>
                <p className="text-gray-600 ml-8">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-600 to-primary-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Still Need Help?</h2>
          <p className="text-xl text-primary-100 mb-8">
            Our support team is here to assist you 24/7
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="px-8 py-4 bg-white text-primary-600 text-lg font-semibold rounded-lg hover:bg-gray-100 transition-all shadow-lg">
              Contact Support
            </Link>
            <a href="tel:+15551234567" className="px-8 py-4 bg-transparent text-white text-lg font-semibold rounded-lg border-2 border-white hover:bg-white hover:text-primary-600 transition-all">
              Call Us: (555) 123-4567
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
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
                <li><a href="#" className="hover:text-primary-500 transition-colors">Features</a></li>
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
    </div>
  );
};

export default HelpCenter;
