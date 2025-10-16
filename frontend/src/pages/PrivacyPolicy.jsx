import { Link } from 'react-router-dom';
import { TrashIcon, ShieldCheckIcon, LockClosedIcon, UserGroupIcon, DocumentTextIcon, GlobeAltIcon, BellAlertIcon } from '@heroicons/react/24/outline';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <TrashIcon className="w-8 h-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">Waste<span className="text-primary-600">Hub</span></span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">Sign In</Link>
              <Link to="/register" className="btn-primary">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-6">
            <ShieldCheckIcon className="w-10 h-10 text-primary-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          <p className="text-lg text-gray-600 mb-4">Your privacy is important to us</p>
          <p className="text-sm text-gray-500">Last updated: January 1, 2025</p>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-6 sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Navigation</h3>
                <ul className="space-y-3">
                  <li><a href="#info-collect" className="flex items-center text-sm text-gray-600 hover:text-primary-600 transition-colors"><DocumentTextIcon className="w-4 h-4 mr-2" />Information We Collect</a></li>
                  <li><a href="#how-use" className="flex items-center text-sm text-gray-600 hover:text-primary-600 transition-colors"><DocumentTextIcon className="w-4 h-4 mr-2" />How We Use Info</a></li>
                  <li><a href="#sharing" className="flex items-center text-sm text-gray-600 hover:text-primary-600 transition-colors"><UserGroupIcon className="w-4 h-4 mr-2" />Information Sharing</a></li>
                  <li><a href="#security" className="flex items-center text-sm text-gray-600 hover:text-primary-600 transition-colors"><LockClosedIcon className="w-4 h-4 mr-2" />Data Security</a></li>
                  <li><a href="#cookies" className="flex items-center text-sm text-gray-600 hover:text-primary-600 transition-colors"><GlobeAltIcon className="w-4 h-4 mr-2" />Cookies & Tracking</a></li>
                  <li><a href="#rights" className="flex items-center text-sm text-gray-600 hover:text-primary-600 transition-colors"><ShieldCheckIcon className="w-4 h-4 mr-2" />Your Rights</a></li>
                </ul>

                <div className="mt-8 p-4 bg-white rounded-lg border-2 border-primary-200">
                  <BellAlertIcon className="w-8 h-8 text-primary-600 mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-2">Questions?</h4>
                  <p className="text-xs text-gray-600 mb-3">Contact our privacy team for any concerns.</p>
                  <Link to="/contact" className="text-sm text-primary-600 hover:text-primary-700 font-medium">Contact Us →</Link>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="prose prose-lg max-w-none">
                <div id="info-collect" className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                      <DocumentTextIcon className="w-6 h-6 text-primary-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 m-0">1. Information We Collect</h2>
                  </div>
                  <p className="text-gray-600">We collect information you provide directly to us, including name, email address, postal address, phone number, and payment information when you create an account or use our services.</p>
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <p className="text-sm text-blue-900 m-0"><strong>Note:</strong> We only collect information necessary to provide our waste management services.</p>
                  </div>
                </div>

                <div id="how-use" className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mr-4">
                      <DocumentTextIcon className="w-6 h-6 text-secondary-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 m-0">2. How We Use Your Information</h2>
                  </div>
                  <p className="text-gray-600">We use the information we collect to:</p>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start"><span className="text-primary-600 mr-2">✓</span><span>Provide, maintain, and improve our services</span></li>
                    <li className="flex items-start"><span className="text-primary-600 mr-2">✓</span><span>Process transactions and send related information</span></li>
                    <li className="flex items-start"><span className="text-primary-600 mr-2">✓</span><span>Send you technical notices and support messages</span></li>
                    <li className="flex items-start"><span className="text-primary-600 mr-2">✓</span><span>Respond to your comments and questions</span></li>
                    <li className="flex items-start"><span className="text-primary-600 mr-2">✓</span><span>Monitor and analyze trends and usage</span></li>
                  </ul>
                </div>

                <div id="sharing" className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                      <UserGroupIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 m-0">3. Information Sharing</h2>
                  </div>
                  <p className="text-gray-600">We do not share your personal information with third parties except as described in this policy. We may share information with vendors, service providers, and consultants who need access to perform services on our behalf.</p>
                </div>

                <div id="security" className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                      <LockClosedIcon className="w-6 h-6 text-purple-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 m-0">4. Data Security</h2>
                  </div>
                  <p className="text-gray-600">We take reasonable measures to help protect information about you from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction. We use industry-standard SSL encryption to protect data in transit.</p>
                  <div className="mt-4 grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">🔒 Encryption</h4>
                      <p className="text-sm text-gray-600 m-0">All data encrypted in transit and at rest</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">🛡️ Protection</h4>
                      <p className="text-sm text-gray-600 m-0">Regular security audits and updates</p>
                    </div>
                  </div>
                </div>

                <div id="cookies" className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                      <GlobeAltIcon className="w-6 h-6 text-orange-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 m-0">5. Cookies and Tracking</h2>
                  </div>
                  <p className="text-gray-600">We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.</p>
                </div>

                <div id="rights" className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                      <ShieldCheckIcon className="w-6 h-6 text-primary-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 m-0">6. Your Rights</h2>
                  </div>
                  <p className="text-gray-600">You have the right to:</p>
                  <div className="grid md:grid-cols-2 gap-3 mt-4">
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm font-medium text-gray-900 m-0">✓ Access your personal information</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm font-medium text-gray-900 m-0">✓ Correct inaccurate information</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm font-medium text-gray-900 m-0">✓ Request deletion of your information</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm font-medium text-gray-900 m-0">✓ Object to our use of your information</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm font-medium text-gray-900 m-0">✓ Export your data</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm font-medium text-gray-900 m-0">✓ Withdraw consent</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">7. Data Retention</h2>
                  <p className="text-gray-600">We retain your information for as long as your account is active or as needed to provide you services. We will retain and use your information as necessary to comply with our legal obligations.</p>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">8. Children's Privacy</h2>
                  <p className="text-gray-600">Our services are not directed to children under 13. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us.</p>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">9. International Data Transfers</h2>
                  <p className="text-gray-600">Your information may be transferred to and maintained on servers located outside of your state, province, or country where data protection laws may differ.</p>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">10. Changes to Privacy Policy</h2>
                  <p className="text-gray-600">We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.</p>
                </div>

                <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-8 border-2 border-primary-200">
                  <h2 className="text-2xl font-bold text-gray-900">11. Contact Us</h2>
                  <p className="text-gray-600">If you have questions about this Privacy Policy, please contact us at:</p>
                  <div className="grid md:grid-cols-3 gap-4 mt-4">
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm font-semibold text-gray-900">📧 Email</p>
                      <p className="text-sm text-primary-600 m-0">privacy@wastehub.com</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm font-semibold text-gray-900">📞 Phone</p>
                      <p className="text-sm text-primary-600 m-0">+1 (555) 123-4567</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm font-semibold text-gray-900">📍 Address</p>
                      <p className="text-sm text-gray-600 m-0">123 Green Street, Eco City</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <TrashIcon className="w-8 h-8 text-primary-500" />
                <span className="text-xl font-bold text-white">WasteHub</span>
              </div>
              <p className="text-sm text-gray-400">Smart waste management solutions for a sustainable future.</p>
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

export default PrivacyPolicy;
