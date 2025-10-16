import { Link } from 'react-router-dom';
import { TrashIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline';

const Blog = () => {
  const blogPosts = [
    {
      title: '10 Ways to Reduce Waste in Your Community',
      excerpt: 'Discover practical strategies to minimize waste and promote sustainability in your neighborhood.',
      author: 'Sarah Johnson',
      date: 'January 15, 2025',
      category: 'Sustainability',
      image: 'bg-gradient-to-br from-green-400 to-green-600',
      readTime: '5 min read'
    },
    {
      title: 'The Future of Smart Waste Management',
      excerpt: 'How IoT and AI are revolutionizing the waste management industry.',
      author: 'Michael Chen',
      date: 'January 10, 2025',
      category: 'Technology',
      image: 'bg-gradient-to-br from-blue-400 to-blue-600',
      readTime: '7 min read'
    },
    {
      title: 'Recycling Best Practices for 2025',
      excerpt: 'Updated guidelines and tips for effective recycling in the new year.',
      author: 'Emily Rodriguez',
      date: 'January 5, 2025',
      category: 'Recycling',
      image: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
      readTime: '4 min read'
    },
    {
      title: 'Case Study: How City X Reduced Waste by 40%',
      excerpt: 'A detailed look at how one city transformed its waste management system.',
      author: 'David Park',
      date: 'December 28, 2024',
      category: 'Case Study',
      image: 'bg-gradient-to-br from-purple-400 to-purple-600',
      readTime: '10 min read'
    },
    {
      title: 'Understanding Waste Collection Routes',
      excerpt: 'Learn how route optimization can improve efficiency and reduce emissions.',
      author: 'Lisa Anderson',
      date: 'December 20, 2024',
      category: 'Operations',
      image: 'bg-gradient-to-br from-red-400 to-red-600',
      readTime: '6 min read'
    },
    {
      title: 'The Impact of Proper Waste Management',
      excerpt: 'Environmental and economic benefits of efficient waste management systems.',
      author: 'James Wilson',
      date: 'December 15, 2024',
      category: 'Impact',
      image: 'bg-gradient-to-br from-indigo-400 to-indigo-600',
      readTime: '8 min read'
    }
  ];

  const categories = ['All', 'Sustainability', 'Technology', 'Recycling', 'Case Study', 'Operations', 'Impact'];

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
          <h1 className="text-5xl font-bold text-gray-900 mb-6">WasteHub Blog</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Insights, stories, and best practices from the world of waste management.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category, index) => (
              <button
                key={index}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  index === 0
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <article key={index} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden border border-gray-100 group cursor-pointer">
                <div className={`h-48 ${post.image}`}></div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-primary-600 uppercase">{post.category}</span>
                    <span className="text-xs text-gray-500">{post.readTime}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <UserIcon className="w-4 h-4 mr-1" />
                    <span className="mr-4">{post.author}</span>
                    <ClockIcon className="w-4 h-4 mr-1" />
                    <span>{post.date}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <button className="btn-primary">
              Load More Articles
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-600 to-primary-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Subscribe to Our Newsletter</h2>
          <p className="text-xl text-primary-100 mb-8">
            Get the latest insights and updates delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="px-8 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
              Subscribe
            </button>
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

export default Blog;
