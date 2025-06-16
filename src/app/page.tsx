import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageSquare, Phone, Shield, Zap, Users, BarChart } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold">2Way SMS</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button>Login</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Professional Two-Way SMS & Voice Communication
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Empower your business with a Google Voice-inspired platform for seamless SMS and voice communications. 
            Manage multiple phone numbers, send bulk messages, and track all conversations in one place.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="px-8">
                Login to Dashboard
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="px-8">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Powerful Features for Modern Communication</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<MessageSquare className="h-10 w-10 text-blue-600" />}
              title="Two-Way SMS"
              description="Send and receive SMS messages with real-time delivery tracking and conversation threading."
            />
            <FeatureCard
              icon={<Phone className="h-10 w-10 text-blue-600" />}
              title="Voice Calls"
              description="Make and receive voice calls directly from your browser with crystal-clear quality."
            />
            <FeatureCard
              icon={<Users className="h-10 w-10 text-blue-600" />}
              title="Multiple Numbers"
              description="Manage multiple phone numbers for different departments or campaigns from one dashboard."
            />
            <FeatureCard
              icon={<Zap className="h-10 w-10 text-blue-600" />}
              title="Bulk Messaging"
              description="Send personalized messages to hundreds of recipients with our powerful bulk SMS feature."
            />
            <FeatureCard
              icon={<Shield className="h-10 w-10 text-blue-600" />}
              title="Admin Controls"
              description="Complete control over user permissions, phone number assignments, and credit allocation."
            />
            <FeatureCard
              icon={<BarChart className="h-10 w-10 text-blue-600" />}
              title="Analytics & Reporting"
              description="Track usage, monitor conversations, and generate detailed reports for better insights."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Communication?</h2>
          <p className="text-xl mb-8 opacity-90">
            Contact your administrator for access to the 2Way SMS platform.
          </p>
          <Link href="/login">
            <Button size="lg" variant="secondary" className="px-8">
              Login to Your Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2025 2Way SMS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
