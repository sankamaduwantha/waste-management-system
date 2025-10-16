import { Link } from 'react-router-dom';
import { TrashIcon, UserGroupIcon, GlobeAltIcon, LightBulbIcon } from '@heroicons/react/24/outline';

const AboutUs = () => {
  const values = [
    {
      icon: <GlobeAltIcon className="w-12 h-12" />,
      title: 'Environmental Sustainability',
      description: 'We are committed to reducing environmental impact through innovative waste management solutions.'
    },
    {
      icon: <UserGroupIcon className="w-12 h-12" />,
      title: 'Community Focus',
      description: 'Building stronger communities through efficient waste management and education.'
    },
    {
      icon: <LightBulbIcon className="w-12 h-12" />,
      title: 'Innovation',
      description: 'Leveraging cutting-edge technology to revolutionize waste management processes.'
    }
  ];

  const team = [
    { name: 'John Anderson', role: 'CEO & Founder', description: 'Environmental engineer with 15+ years experience' },
    { name: 'Sarah Mitchell', role: 'CTO', description: 'Technology leader specializing in IoT and smart cities' },
    { name: 'Michael Chen', role: 'Head of Operations', description: 'Expert in logistics and route optimization' },
    { name: 'Emily Rodriguez', role: 'Sustainability Director', description: 'Passionate about environmental conservation' }
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
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            About <span className="text-primary-600">WasteHub</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Leading the way in smart waste management solutions for a cleaner, more sustainable future.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-4">
                At WasteHub, we're on a mission to transform waste management through technology and innovation. 
                We believe that efficient waste management is crucial for building sustainable communities and 
                protecting our planet for future generations.
              </p>
              <p className="text-lg text-gray-600">
                Since our founding in 2020, we've helped over 50,000 users manage their waste more efficiently, 
                reducing environmental impact and improving quality of life in communities worldwide.
              </p>
            </div>
            <div className="bg-primary-100 rounded-2xl p-8 text-center">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-4xl font-bold text-primary-600 mb-2">50K+</div>
                  <div className="text-gray-700">Active Users</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary-600 mb-2">2M+</div>
                  <div className="text-gray-700">Tons Recycled</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary-600 mb-2">98%</div>
                  <div className="text-gray-700">On-Time Rate</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary-600 mb-2">150+</div>
                  <div className="text-gray-700">Cities Served</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
                <div className="text-primary-600 mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-4">Meet Our Team</h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Passionate professionals dedicated to making waste management smarter and more sustainable.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full mx-auto mb-4"></div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-primary-600 font-medium mb-2">{member.role}</p>
                <p className="text-sm text-gray-600">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-600 to-primary-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Join Us in Making a Difference</h2>
          <p className="text-xl text-primary-100 mb-8">
            Be part of the solution. Start managing waste smarter today.
          </p>
          <Link to="/register" className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 text-lg font-semibold rounded-lg hover:bg-gray-100 transition-all shadow-lg">
            Get Started Free
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

export default AboutUs;
