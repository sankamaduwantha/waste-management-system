import { Link } from 'react-router-dom';
import { TrashIcon, BriefcaseIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';

const Careers = () => {
  const openPositions = [
    {
      title: 'Senior Software Engineer',
      department: 'Engineering',
      location: 'Remote / San Francisco, CA',
      type: 'Full-time',
      description: 'Build scalable solutions for our waste management platform.'
    },
    {
      title: 'Product Manager',
      department: 'Product',
      location: 'New York, NY',
      type: 'Full-time',
      description: 'Lead product strategy and development for key features.'
    },
    {
      title: 'UX/UI Designer',
      department: 'Design',
      location: 'Remote',
      type: 'Full-time',
      description: 'Create beautiful and intuitive user experiences.'
    },
    {
      title: 'Data Analyst',
      department: 'Analytics',
      location: 'Chicago, IL',
      type: 'Full-time',
      description: 'Analyze waste management data to drive insights.'
    },
    {
      title: 'Customer Success Manager',
      department: 'Customer Success',
      location: 'Remote',
      type: 'Full-time',
      description: 'Help our customers achieve their waste management goals.'
    },
    {
      title: 'Marketing Specialist',
      department: 'Marketing',
      location: 'Los Angeles, CA',
      type: 'Full-time',
      description: 'Drive awareness and adoption of our platform.'
    }
  ];

  const benefits = [
    { icon: '💰', title: 'Competitive Salary', description: 'Industry-leading compensation packages' },
    { icon: '🏥', title: 'Health Insurance', description: 'Comprehensive medical, dental, and vision coverage' },
    { icon: '🏖️', title: 'Unlimited PTO', description: 'Take time off when you need it' },
    { icon: '💻', title: 'Remote Work', description: 'Work from anywhere in the world' },
    { icon: '📚', title: 'Learning Budget', description: '$2,000 annual learning and development budget' },
    { icon: '🎯', title: 'Equity Options', description: 'Share in our success with stock options' }
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

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Join Our Team</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Help us build the future of waste management. Work with passionate people on meaningful problems.
          </p>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-4">Why WasteHub?</h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            We're building technology that makes a real difference in communities around the world.
          </p>
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="text-5xl mb-4">🌍</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Make an Impact</h3>
              <p className="text-gray-600">
                Your work directly contributes to environmental sustainability and cleaner communities.
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🚀</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Grow Your Career</h3>
              <p className="text-gray-600">
                Work with cutting-edge technology and learn from industry experts.
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">❤️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Great Culture</h3>
              <p className="text-gray-600">
                Join a supportive team that values collaboration, innovation, and work-life balance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Benefits & Perks</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                <div className="text-4xl mb-3">{benefit.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-4">Open Positions</h2>
          <p className="text-xl text-gray-600 text-center mb-12">
            Find the perfect role for you. We're always looking for talented people to join our team.
          </p>
          <div className="space-y-4">
            {openPositions.map((position, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{position.title}</h3>
                    <p className="text-gray-600 mb-4">{position.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <BriefcaseIcon className="w-4 h-4 mr-1" />
                        {position.department}
                      </span>
                      <span className="flex items-center">
                        <MapPinIcon className="w-4 h-4 mr-1" />
                        {position.location}
                      </span>
                      <span className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        {position.type}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-6">
                    <button className="btn-primary whitespace-nowrap">
                      Apply Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-600 to-primary-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Don't See a Perfect Fit?</h2>
          <p className="text-xl text-primary-100 mb-8">
            Send us your resume anyway. We're always looking for exceptional talent.
          </p>
          <Link to="/contact" className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 text-lg font-semibold rounded-lg hover:bg-gray-100 transition-all shadow-lg">
            Contact Us
          </Link>
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

export default Careers;
