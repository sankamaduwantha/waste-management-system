import { Link } from 'react-router-dom';
import { 
  TrashIcon, 
  TruckIcon, 
  CalendarIcon, 
  BellIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const Home = () => {
  const features = [
    {
      icon: <CalendarIcon className="w-8 h-8" />,
      title: 'Smart Scheduling',
      description: 'Automated waste collection schedules tailored to your area with real-time notifications.'
    },
    {
      icon: <TruckIcon className="w-8 h-8" />,
      title: 'Fleet Tracking',
      description: 'Real-time tracking of waste collection vehicles and optimized route management.'
    },
    {
      icon: <BellIcon className="w-8 h-8" />,
      title: 'Instant Alerts',
      description: 'Get notified about collection schedules, delays, and important updates via SMS and email.'
    },
    {
      icon: <ChartBarIcon className="w-8 h-8" />,
      title: 'Analytics Dashboard',
      description: 'Comprehensive insights into waste management trends and environmental impact.'
    },
    {
      icon: <TrashIcon className="w-8 h-8" />,
      title: 'Smart Bin Monitoring',
      description: 'IoT-enabled bins with real-time fill-level monitoring and automated collection requests.'
    },
    {
      icon: <ShieldCheckIcon className="w-8 h-8" />,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with encrypted data and reliable service uptime.'
    }
  ];

  const stats = [
    { value: '50K+', label: 'Active Users' },
    { value: '98%', label: 'On-Time Collection' },
    { value: '2M+', label: 'Tons Recycled' },
    { value: '24/7', label: 'Support Available' }
  ];

  const benefits = [
    'Reduce waste collection costs by up to 40%',
    'Improve recycling rates and environmental impact',
    'Real-time monitoring and reporting',
    'Automated scheduling and route optimization',
    'Mobile-friendly access from anywhere',
    'Dedicated support team'
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <TrashIcon className="w-8 h-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">
                Waste<span className="text-primary-600">Hub</span>
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="btn-primary"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
                Smart Waste Management for a
                <span className="text-primary-600"> Cleaner Future</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Revolutionize your community's waste management with our intelligent platform. 
                Track collections, optimize routes, and make a positive environmental impact.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/register" 
                  className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 text-white text-lg font-semibold rounded-lg hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Start Free Trial
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Link>
                <a 
                  href="#features" 
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-700 text-lg font-semibold rounded-lg border-2 border-gray-300 hover:border-primary-600 hover:text-primary-600 transition-all"
                >
                  Learn More
                </a>
              </div>
              <div className="mt-12 flex items-center space-x-8">
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-6 h-6 text-primary-600" />
                  <span className="text-gray-600">No credit card required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-6 h-6 text-primary-600" />
                  <span className="text-gray-600">Free 30-day trial</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-primary-100 to-secondary-100 rounded-3xl p-8 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="bg-white rounded-2xl p-6 shadow-lg transform -rotate-3">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CalendarIcon className="w-8 h-8 text-primary-600" />
                        <div>
                          <p className="font-semibold text-gray-900">Next Collection</p>
                          <p className="text-sm text-gray-600">Tomorrow, 8:00 AM</p>
                        </div>
                      </div>
                      <div className="bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                        On Time
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <TruckIcon className="w-8 h-8 text-secondary-600" />
                        <div>
                          <p className="font-semibold text-gray-900">Vehicle Status</p>
                          <p className="text-sm text-gray-600">En Route - 2.5 km away</p>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-secondary-200 rounded-full animate-pulse"></div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-green-50 p-3 rounded-lg text-center">
                        <p className="text-2xl font-bold text-green-600">85%</p>
                        <p className="text-xs text-gray-600">Recycled</p>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded-lg text-center">
                        <p className="text-2xl font-bold text-yellow-600">12</p>
                        <p className="text-xs text-gray-600">Pickups</p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg text-center">
                        <p className="text-2xl font-bold text-blue-600">4.2</p>
                        <p className="text-xs text-gray-600">Tons</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-gray-400 text-sm lg:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Waste Management
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to streamline operations, reduce costs, and improve environmental outcomes.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-primary-200 group"
              >
                <div className="text-primary-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Why Choose WasteHub?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Join thousands of communities and businesses already benefiting from smarter waste management.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircleIcon className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-8 rounded-2xl text-white shadow-xl">
                <UserGroupIcon className="w-12 h-12 mb-4 opacity-80" />
                <h3 className="text-3xl font-bold mb-2">50,000+</h3>
                <p className="text-primary-100">Happy Users</p>
              </div>
              <div className="bg-gradient-to-br from-secondary-500 to-secondary-600 p-8 rounded-2xl text-white shadow-xl mt-8">
                <ClockIcon className="w-12 h-12 mb-4 opacity-80" />
                <h3 className="text-3xl font-bold mb-2">24/7</h3>
                <p className="text-secondary-100">Support</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-8 rounded-2xl text-white shadow-xl">
                <ChartBarIcon className="w-12 h-12 mb-4 opacity-80" />
                <h3 className="text-3xl font-bold mb-2">98%</h3>
                <p className="text-green-100">Satisfaction</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-8 rounded-2xl text-white shadow-xl mt-8">
                <ShieldCheckIcon className="w-12 h-12 mb-4 opacity-80" />
                <h3 className="text-3xl font-bold mb-2">100%</h3>
                <p className="text-yellow-100">Secure</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-600 to-primary-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Waste Management?
          </h2>
          <p className="text-xl text-primary-100 mb-10">
            Join thousands of communities making a difference. Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 text-lg font-semibold rounded-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
            >
              Get Started Free
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
            <Link 
              to="/login" 
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white text-lg font-semibold rounded-lg border-2 border-white hover:bg-white hover:text-primary-600 transition-all"
            >
              Sign In
            </Link>
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
    </div>
  );
};

export default Home;
