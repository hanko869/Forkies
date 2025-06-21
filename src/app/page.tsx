'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MessageSquare, Phone, Shield, Zap, Users, BarChart3, CheckCircle, ArrowRight } from 'lucide-react';

export default function Home() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Forkies</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Professional SMS Communication
              <span className="block text-blue-600 mt-2">Made Simple</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Connect with your customers through powerful two-way SMS messaging. 
              Send appointment reminders, notifications, and engage in real-time conversations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8">
                  Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Sign In to Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-16 text-center"
          >
            <p className="text-sm text-gray-500 mb-4">Trusted by businesses worldwide</p>
            <div className="flex flex-wrap justify-center gap-8 items-center">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="text-gray-700">Bank-level Security</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-gray-700">99.9% Uptime</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                <span className="text-gray-700">10K+ Active Users</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeIn} className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for SMS Success
            </motion.h2>
            <motion.p variants={fadeIn} className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful features designed to help you communicate effectively with your customers
            </motion.p>
          </motion.div>

          <motion.div 
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              {
                icon: MessageSquare,
                title: 'Two-Way Messaging',
                description: 'Engage in real-time conversations with your customers. Send and receive messages instantly.',
                color: 'blue'
              },
              {
                icon: Users,
                title: 'Contact Management',
                description: 'Organize your contacts efficiently. Create groups and manage conversations with ease.',
                color: 'purple'
              },
              {
                icon: Zap,
                title: 'Bulk SMS',
                description: 'Send personalized messages to multiple recipients at once. Perfect for announcements and promotions.',
                color: 'yellow'
              },
              {
                icon: Phone,
                title: 'Multiple Phone Numbers',
                description: 'Manage multiple phone numbers from a single dashboard. Keep business and personal separate.',
                color: 'green'
              },
              {
                icon: BarChart3,
                title: 'Analytics & Insights',
                description: 'Track message delivery, engagement rates, and conversation history with detailed analytics.',
                color: 'pink'
              },
              {
                icon: Shield,
                title: 'Secure & Compliant',
                description: 'Enterprise-grade security with end-to-end encryption. TCPA and GDPR compliant.',
                color: 'indigo'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className={`inline-flex p-3 rounded-lg bg-${feature.color}-100 mb-4`}>
                  <feature.icon className={`h-6 w-6 text-${feature.color}-600`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeIn} className="text-4xl font-bold text-gray-900 mb-4">
              Perfect for Every Business
            </motion.h2>
            <motion.p variants={fadeIn} className="text-xl text-gray-600 max-w-3xl mx-auto">
              From healthcare to retail, our platform adapts to your industry needs
            </motion.p>
          </motion.div>

          <motion.div 
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {[
              {
                industry: 'Healthcare',
                uses: ['Appointment reminders', 'Test results notifications', 'Prescription alerts', 'Follow-up care messages']
              },
              {
                industry: 'Retail & E-commerce',
                uses: ['Order confirmations', 'Shipping updates', 'Promotional campaigns', 'Customer support']
              },
              {
                industry: 'Service Businesses',
                uses: ['Booking confirmations', 'Service reminders', 'Customer feedback', 'Schedule changes']
              },
              {
                industry: 'Education',
                uses: ['Class updates', 'Emergency notifications', 'Event reminders', 'Parent communication']
              }
            ].map((useCase, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">{useCase.industry}</h3>
                <ul className="space-y-2">
                  {useCase.uses.map((use, idx) => (
                    <li key={idx} className="flex items-center text-gray-600">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      {use}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Transform Your Communication?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of businesses using Forkies to connect with their customers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8">
                  Start Your Free Trial
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8">
                  Sign In
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-blue-100">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <MessageSquare className="h-6 w-6 text-blue-400" />
                <span className="ml-2 text-lg font-semibold text-white">Forkies</span>
              </div>
              <p className="text-sm">Professional SMS communication platform for modern businesses.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/features" className="hover:text-white">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/integrations" className="hover:text-white">Integrations</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
                <li><Link href="/status" className="hover:text-white">System Status</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link href="/compliance" className="hover:text-white">Compliance</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2024 Forkies. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
