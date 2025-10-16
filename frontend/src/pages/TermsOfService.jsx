import { Link } from 'react-router-dom';
import { TrashIcon, DocumentTextIcon, ScaleIcon, UserIcon, CreditCardIcon, ShieldExclamationIcon, LightBulbIcon, XCircleIcon } from '@heroicons/react/24/outline';

const TermsOfService = () => {
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
            <ScaleIcon className="w-10 h-10 text-primary-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Terms of Service</h1>
          <p className="text-lg text-gray-600 mb-4">Please read these terms carefully before using our services</p>
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
                  <li><a href="#acceptance" className="flex items-center text-sm text-gray-600 hover:text-primary-600 transition-colors"><DocumentTextIcon className="w-4 h-4 mr-2" />Acceptance of Terms</a></li>
                  <li><a href="#license" className="flex items-center text-sm text-gray-600 hover:text-primary-600 transition-colors"><DocumentTextIcon className="w-4 h-4 mr-2" />Use License</a></li>
                  <li><a href="#accounts" className="flex items-center text-sm text-gray-600 hover:text-primary-600 transition-colors"><UserIcon className="w-4 h-4 mr-2" />User Accounts</a></li>
                  <li><a href="#payments" className="flex items-center text-sm text-gray-600 hover:text-primary-600 transition-colors"><CreditCardIcon className="w-4 h-4 mr-2" />Payments & Billing</a></li>
                  <li><a href="#prohibited" className="flex items-center text-sm text-gray-600 hover:text-primary-600 transition-colors"><ShieldExclamationIcon className="w-4 h-4 mr-2" />Prohibited Uses</a></li>
                  <li><a href="#ip" className="flex items-center text-sm text-gray-600 hover:text-primary-600 transition-colors"><LightBulbIcon className="w-4 h-4 mr-2" />Intellectual Property</a></li>
                </ul>

                <div className="mt-8 p-4 bg-white rounded-lg border-2 border-primary-200">
                  <ScaleIcon className="w-8 h-8 text-primary-600 mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-2">Legal Questions?</h4>
                  <p className="text-xs text-gray-600 mb-3">Our legal team is here to help clarify any terms.</p>
                  <a href="mailto:legal@wastehub.com" className="text-sm text-primary-600 hover:text-primary-700 font-medium">legal@wastehub.com →</a>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="prose prose-lg max-w-none">
                <div id="acceptance" className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                      <DocumentTextIcon className="w-6 h-6 text-primary-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 m-0">1. Acceptance of Terms</h2>
                  </div>
                  <p className="text-gray-600">By accessing and using WasteHub's services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our services.</p>
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <p className="text-sm text-blue-900 m-0"><strong>Important:</strong> Using our service constitutes acceptance of these terms.</p>
                  </div>
                </div>

                <div id="license" className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mr-4">
                      <DocumentTextIcon className="w-6 h-6 text-secondary-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 m-0">2. Use License</h2>
                  </div>
                  <p className="text-gray-600">Permission is granted to temporarily download one copy of the materials on WasteHub's platform for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.</p>
                  <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">This license shall automatically terminate if you:</h4>
                    <ul className="space-y-2 text-sm text-gray-600 m-0">
                      <li>✗ Modify or copy the materials</li>
                      <li>✗ Use the materials for commercial purposes</li>
                      <li>✗ Attempt to reverse engineer any software</li>
                      <li>✗ Remove any copyright notations</li>
                    </ul>
                  </div>
                </div>

                <div id="accounts" className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                      <UserIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 m-0">3. User Accounts</h2>
                  </div>
                  <p className="text-gray-600">When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms.</p>
                  <div className="mt-4 grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">✓ Your Responsibilities</h4>
                      <ul className="text-sm text-gray-600 space-y-1 m-0">
                        <li>• Keep password secure</li>
                        <li>• Provide accurate info</li>
                        <li>• Update your details</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">✓ Account Security</h4>
                      <ul className="text-sm text-gray-600 space-y-1 m-0">
                        <li>• Use strong passwords</li>
                        <li>• Enable 2FA if available</li>
                        <li>• Report suspicious activity</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                      <TrashIcon className="w-6 h-6 text-purple-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 m-0">4. Service Description</h2>
                  </div>
                  <p className="text-gray-600">WasteHub provides a waste management platform including collection scheduling, route optimization, and sustainability tracking. We reserve the right to modify or discontinue services at any time.</p>
                </div>

                <div id="payments" className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                      <CreditCardIcon className="w-6 h-6 text-yellow-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 m-0">5. Payments and Billing</h2>
                  </div>
                  <p className="text-gray-600">Certain aspects of the Service may be provided for a fee. You agree to pay all fees and charges incurred in connection with your account on time.</p>
                  <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-gray-900 m-0"><strong>Payment Terms:</strong> All fees are non-refundable except as required by law. We accept major credit cards and electronic payment methods.</p>
                  </div>
                </div>

                <div id="prohibited" className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                      <ShieldExclamationIcon className="w-6 h-6 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 m-0">6. Prohibited Uses</h2>
                  </div>
                  <p className="text-gray-600">You may not use the Service for any illegal purposes or to violate any laws. You agree not to:</p>
                  <div className="grid md:grid-cols-2 gap-3 mt-4">
                    <div className="p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                      <p className="text-sm text-red-900 m-0">✗ Violate any laws or regulations</p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                      <p className="text-sm text-red-900 m-0">✗ Infringe intellectual property</p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                      <p className="text-sm text-red-900 m-0">✗ Transmit harmful code</p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                      <p className="text-sm text-red-900 m-0">✗ Attempt unauthorized access</p>
                    </div>
                  </div>
                </div>

                <div id="ip" className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                      <LightBulbIcon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 m-0">7. Intellectual Property</h2>
                  </div>
                  <p className="text-gray-600">The Service and its original content, features, and functionality are owned by WasteHub and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.</p>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                      <XCircleIcon className="w-6 h-6 text-orange-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 m-0">8. Termination</h2>
                  </div>
                  <p className="text-gray-600">We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.</p>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">9. Limitation of Liability</h2>
                  <p className="text-gray-600">In no event shall WasteHub, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages arising out of your use of the service.</p>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">10. Changes to Terms</h2>
                  <p className="text-gray-600">We reserve the right to modify or replace these Terms at any time. We will provide at least 30 days notice of any changes by posting the new Terms on this page and updating the "Last updated" date.</p>
                </div>

                <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-8 border-2 border-primary-200">
                  <h2 className="text-2xl font-bold text-gray-900">11. Contact Information</h2>
                  <p className="text-gray-600 mb-4">If you have any questions about these Terms, please contact our legal team:</p>
                  <div className="bg-white p-6 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <ScaleIcon className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Legal Department</p>
                        <p className="text-sm text-primary-600">legal@wastehub.com</p>
                        <p className="text-sm text-gray-500">Response within 24-48 hours</p>
                      </div>
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

export default TermsOfService;
