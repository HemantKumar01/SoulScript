import { Button } from "@/components/ui/button"
import { ChevronRight, MessageSquare, Shield, Sparkles, BookOpen } from "lucide-react"
import MorphingText from "@/components/landing-page/morphing-text"
import FeatureCard from "@/components/landing-page/feature-card"
import HeroImage from "@/components/landing-page/hero-image"
import Navbar from "@/components/navbar"
import ScrollReveal from "@/components/landing-page/scroll-reveal"
import './globals.css' // Ensure global styles are imported

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="pt-16">
        {" "}
        {/* Add padding-top to account for fixed navbar */}
        {/* Hero Section */}
        <section className="relative overflow-hidden min-h-screen flex items-center">
          {/* Enhanced Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black to-blue-900/20 z-0"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent z-0"></div>
          
          {/* Animated Background Particles */}
          <div className="absolute inset-0 overflow-hidden z-0">
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400 rounded-full animate-pulse opacity-60 animate-bounce"></div>
            <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-pink-400 rounded-full animate-pulse opacity-40 animation-delay-1000 animate-bounce"></div>
            <div className="absolute top-1/2 left-1/6 w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse opacity-50 animation-delay-2000 animate-bounce"></div>
            <div className="absolute top-1/6 right-1/3 w-1 h-1 bg-purple-300 rounded-full animate-pulse opacity-30 animation-delay-3000 animate-bounce"></div>
            <div className="absolute top-1/3 right-1/6 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse opacity-45 animation-delay-4000 animate-bounce"></div>
            <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-pink-300 rounded-full animate-pulse opacity-35 animation-delay-5000 animate-bounce"></div>
          </div>
          
          <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1 space-y-8">
                <div className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-purple-900/40 to-pink-900/40 rounded-full border border-purple-500/30 backdrop-blur-sm mb-6 hover:border-purple-400/50 transition-all duration-300">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-3"></div>
                  <p className="text-sm font-medium text-purple-300">AI-Powered Therapy • Now Available</p>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-purple-500 leading-tight">
                  SoulScript
                </h1>
                
                <p className="text-xl md:text-2xl font-light text-gray-300 leading-relaxed max-w-2xl">
                  Transform your mental wellness journey with AI-powered therapy that's accessible, confidential, and always available when you need support.
                </p>
                
                <div className="pt-4">
                  <MorphingText />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-8">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 transform hover:scale-105"
                  >
                    Start Your Journey
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-transparent border-purple-500/50 text-white hover:bg-purple-900/20 backdrop-blur-sm hover:border-purple-400/70 transition-all duration-300"
                  >
                    Watch Demo
                  </Button>
                </div>
                
                {/* Trust Indicators */}
                <div className="flex items-center gap-8 pt-8 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-400" />
                    <span>HIPAA Compliant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-400" />
                    <span>24/7 Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-400" />
                    <span>AI-Powered</span>
                  </div>
                </div>
              </div>
              
              <div className="flex-1">
                <HeroImage />
              </div>
            </div>
          </div>
        </section>
        {/* Rest of the content remains the same */}
        {/* Features Section */}
        <ScrollReveal>
          <section className="py-24 bg-gradient-to-b from-black via-gray-900/50 to-black relative">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(168,85,247,0.02)_50%,transparent_75%)] bg-[length:60px_60px]"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-20">
              <div className="inline-flex items-center px-4 py-2 bg-purple-900/20 rounded-full border border-purple-500/30 mb-6">
                <Sparkles className="h-4 w-4 text-purple-400 mr-2" />
                <span className="text-sm text-purple-300 font-medium">Comprehensive Platform</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-white">
                Mental Wellness Redefined
              </h2>
              <p className="text-gray-400 max-w-3xl mx-auto text-lg leading-relaxed">
                SoulScript combines cutting-edge AI technology with human expertise to provide accessible, comprehensive mental health support that adapts to your unique needs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              <FeatureCard
                icon={<BookOpen className="h-8 w-8 text-purple-400" />}
                title="Smart Journal"
                description="Advanced journaling with AI insights that help you understand patterns and progress in your mental health journey."
                features={[
                  "Rich text editing with markdown support",
                  "AI-powered mood tracking and insights",
                  "Personal reflection prompts",
                  "Dark/light mode with accessibility",
                  "Secure cloud synchronization",
                ]}
              />

              <FeatureCard
                icon={<Sparkles className="h-8 w-8 text-pink-400" />}
                title="Persona Dashboard"
                description="Create and manage therapeutic personas tailored to different aspects of your mental health needs."
                features={[
                  "Multiple therapeutic personas",
                  "Interactive data visualizations",
                  "Real-time progress tracking",
                  "Customizable interface themes",
                  "Advanced analytics and reports",
                ]}
              />

              <FeatureCard
                icon={<MessageSquare className="h-8 w-8 text-blue-400" />}
                title="AI Companion"
                description="24/7 conversational support with context-aware responses and emotional intelligence."
                features={[
                  "Natural language understanding",
                  "Emotion-aware conversations",
                  "Crisis intervention protocols",
                  "Multi-language support",
                  "Seamless therapist handoff",
                ]}
              />

              <FeatureCard
                icon={<Shield className="h-8 w-8 text-green-400" />}
                title="Safety First"
                description="Enterprise-grade security with NVIDIA-powered safety monitoring for your protection."
                features={[
                  "End-to-end encryption",
                  "HIPAA compliance standards",
                  "Real-time safety monitoring",
                  "Automatic escalation protocols",
                  "Privacy-first architecture",
                ]}
              />
            </div>
          </div>
        </section>
        </ScrollReveal>
        {/* How It Works Section */}
        <ScrollReveal delay={0.2}>
          <section className="py-24 bg-gradient-to-b from-black to-gray-950 relative">
          {/* Animated background grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.03)_1px,transparent_1px)] bg-[size:44px_44px]"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-20">
              <div className="inline-flex items-center px-4 py-2 bg-blue-900/20 rounded-full border border-blue-500/30 mb-6">
                <MessageSquare className="h-4 w-4 text-blue-400 mr-2" />
                <span className="text-sm text-blue-300 font-medium">How It Works</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-200 to-white">
                Your Path to Better Mental Health
              </h2>
              <p className="text-gray-400 max-w-3xl mx-auto text-lg leading-relaxed">
                Experience a seamless blend of AI innovation and human expertise designed to support your unique mental health journey.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
                <div className="relative bg-gray-900 rounded-2xl p-8 border border-purple-900/30 hover:border-purple-500/50 transition-all duration-300 transform hover:scale-105">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <span className="text-2xl font-bold text-white">1</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white">AI-Powered Conversations</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Start with intelligent, empathetic AI conversations that understand context, emotions, and provide personalized support tailored to your specific needs and mental health goals.
                  </p>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
                <div className="relative bg-gray-900 rounded-2xl p-8 border border-purple-900/30 hover:border-purple-500/50 transition-all duration-300 transform hover:scale-105">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <span className="text-2xl font-bold text-white">2</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white">Professional Oversight</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Licensed therapists continuously monitor and review AI interactions to ensure quality care, identify patterns, and determine when additional human intervention may be beneficial.
                  </p>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
                <div className="relative bg-gray-900 rounded-2xl p-8 border border-purple-900/30 hover:border-purple-500/50 transition-all duration-300 transform hover:scale-105">
                  <div className="bg-gradient-to-r from-green-600 to-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <span className="text-2xl font-bold text-white">3</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white">Seamless Transition</h3>
                  <p className="text-gray-400 leading-relaxed">
                    When you're ready, seamlessly transition to traditional therapy sessions with our network of qualified professionals who already understand your journey and progress.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        </ScrollReveal>
        {/* Testimonials Section */}
        <section className="py-24 bg-gradient-to-b from-gray-950 to-black relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-20">
              <div className="inline-flex items-center px-4 py-2 bg-green-900/20 rounded-full border border-green-500/30 mb-6">
                <MessageSquare className="h-4 w-4 text-green-400 mr-2" />
                <span className="text-sm text-green-300 font-medium">User Stories</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-green-200 to-white">
                Transforming Lives Daily
              </h2>
              <p className="text-gray-400 max-w-3xl mx-auto text-lg leading-relaxed">
                Join thousands who have found support, healing, and personal growth through SoulScript's innovative approach to mental health care.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-60 transition duration-300"></div>
                <div className="relative bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 border border-purple-900/30 hover:border-purple-500/50 transition-all duration-300">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 mr-4 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">A</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Alex T.</h4>
                      <p className="text-sm text-gray-400">6 months with SoulScript</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex text-yellow-400 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    "SoulScript gave me the courage to discuss issues I was too embarrassed to bring up elsewhere. The AI understood my anxiety patterns, and when I transitioned to a human therapist, the process was incredibly smooth."
                  </p>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-60 transition duration-300"></div>
                <div className="relative bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 border border-purple-900/30 hover:border-purple-500/50 transition-all duration-300">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 mr-4 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">J</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Jamie K.</h4>
                      <p className="text-sm text-gray-400">3 months with SoulScript</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex text-yellow-400 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    "The journaling features combined with AI insights revealed patterns about myself I never noticed. It's like having a wise friend available 24/7 who actually remembers our previous conversations."
                  </p>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-60 transition duration-300"></div>
                <div className="relative bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 border border-purple-900/30 hover:border-purple-500/50 transition-all duration-300">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-600 to-blue-600 mr-4 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">S</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Sam R.</h4>
                      <p className="text-sm text-gray-400">1 year with SoulScript</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex text-yellow-400 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    "As someone who couldn't afford weekly therapy, SoulScript has been life-changing. The AI provides surprisingly deep insights, and knowing real therapists review conversations gives me complete confidence."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Pricing Section */}
        <section className="py-24 bg-black relative">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/5 via-transparent to-transparent"></div>
          
          {/* <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-20">
              <div className="inline-flex items-center px-4 py-2 bg-purple-900/20 rounded-full border border-purple-500/30 mb-6">
                <Sparkles className="h-4 w-4 text-purple-400 mr-2" />
                <span className="text-sm text-purple-300 font-medium">Flexible Plans</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-white">
                Choose Your Journey
              </h2>
              <p className="text-gray-400 max-w-3xl mx-auto text-lg leading-relaxed">
                Transparent pricing designed to make mental health support accessible to everyone, regardless of your budget or needs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-600 to-gray-800 rounded-2xl blur opacity-20 group-hover:opacity-60 transition duration-300"></div>
                <div className="relative bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 hover:border-gray-500/50 transition-all duration-300">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2 text-white">Starter</h3>
                    <p className="text-gray-400 mb-8">Perfect for exploring AI therapy</p>
                    <div className="mb-8">
                      <span className="text-5xl font-bold text-white">$9</span>
                      <span className="text-gray-400 text-lg">/month</span>
                    </div>
                  </div>
                  
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center text-gray-300">
                      <ChevronRight className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                      <span>AI Chatbot Access</span>
                    </li>
                    <li className="flex items-center text-gray-300">
                      <ChevronRight className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                      <span>Basic Journaling</span>
                    </li>
                    <li className="flex items-center text-gray-300">
                      <ChevronRight className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                      <span>Weekly AI Insights</span>
                    </li>
                    <li className="flex items-center text-gray-300">
                      <ChevronRight className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                      <span>Email Support</span>
                    </li>
                  </ul>
                  
                  <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white border-gray-600 hover:border-gray-500 transition-all duration-300">
                    Start Free Trial
                  </Button>
                </div>
              </div>

              
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-60 group-hover:opacity-90 transition duration-300"></div>
                <div className="relative bg-gradient-to-b from-purple-950/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/50 transform md:-translate-y-6">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                      Most Popular
                    </div>
                  </div>
                  
                  <div className="text-center mt-4">
                    <h3 className="text-2xl font-bold mb-2 text-white">Premium</h3>
                    <p className="text-purple-200 mb-8">Enhanced support & features</p>
                    <div className="mb-8">
                      <span className="text-5xl font-bold text-white">$19</span>
                      <span className="text-purple-200 text-lg">/month</span>
                    </div>
                  </div>
                  
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center text-purple-100">
                      <ChevronRight className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                      <span>Everything in Starter</span>
                    </li>
                    <li className="flex items-center text-purple-100">
                      <ChevronRight className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                      <span>Unlimited AI Conversations</span>
                    </li>
                    <li className="flex items-center text-purple-100">
                      <ChevronRight className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                      <span>Advanced Journaling Tools</span>
                    </li>
                    <li className="flex items-center text-purple-100">
                      <ChevronRight className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                      <span>Persona Dashboard</span>
                    </li>
                    <li className="flex items-center text-purple-100">
                      <ChevronRight className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                      <span>Monthly Therapist Review</span>
                    </li>
                  </ul>
                  
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    Start Premium
                  </Button>
                </div>
              </div>

              
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-20 group-hover:opacity-60 transition duration-300"></div>
                <div className="relative bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 border border-blue-700/50 hover:border-blue-500/50 transition-all duration-300">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2 text-white">Professional</h3>
                    <p className="text-gray-400 mb-8">Complete therapy integration</p>
                    <div className="mb-8">
                      <span className="text-5xl font-bold text-white">$49</span>
                      <span className="text-gray-400 text-lg">/month</span>
                    </div>
                  </div>
                  
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center text-gray-300">
                      <ChevronRight className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                      <span>Everything in Premium</span>
                    </li>
                    <li className="flex items-center text-gray-300">
                      <ChevronRight className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                      <span>2 Video Therapy Sessions</span>
                    </li>
                    <li className="flex items-center text-gray-300">
                      <ChevronRight className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                      <span>Priority Therapist Review</span>
                    </li>
                    <li className="flex items-center text-gray-300">
                      <ChevronRight className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                      <span>Personalized Growth Plan</span>
                    </li>
                    <li className="flex items-center text-gray-300">
                      <ChevronRight className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                      <span>24/7 Priority Support</span>
                    </li>
                  </ul>
                  
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0 transition-all duration-300">
                    Start Professional
                  </Button>
                </div>
              </div>
            </div>
            
            
            <div className="text-center mt-16">
              <div className="inline-flex items-center px-6 py-3 bg-green-900/20 rounded-full border border-green-500/30">
                <Shield className="h-5 w-5 text-green-400 mr-2" />
                <span className="text-green-300 font-medium">30-day money-back guarantee on all plans</span>
              </div>
            </div>
          </div> */}
        </section>
        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-br from-black via-purple-950/50 to-black relative overflow-hidden">
          {/* Enhanced background effects */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500/20 via-pink-500/10 to-transparent"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-900/40 to-pink-900/40 rounded-full border border-purple-500/30 backdrop-blur-sm mb-8 hover:border-purple-400/50 transition-all duration-300">
                <Sparkles className="h-5 w-5 text-purple-400 mr-2 animate-pulse" />
                <span className="text-purple-300 font-medium">Join 50,000+ users transforming their mental health</span>
              </div>
              
              <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-pink-200 leading-tight">
                Your Healing Journey
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                  Starts Today
                </span>
              </h2>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-10 leading-relaxed max-w-3xl mx-auto">
                Take the first step towards better mental health with AI-powered support that understands, cares, and grows with you.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 transform hover:scale-105 px-8 py-4 text-lg"
                >
                  Start Free Trial
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
                
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-purple-500/50 text-white hover:bg-purple-900/20 backdrop-blur-sm hover:border-purple-400/70 transition-all duration-300 px-8 py-4 text-lg"
                >
                  Book a Demo
                </Button>
              </div>
              
              {/* Trust indicators */}
              <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-400" />
                  <span>HIPAA Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-400" />
                  <span>24/7 Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-purple-400" />
                  <span>No Credit Card Required</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Footer */}
        <footer className="bg-black py-12 border-t border-gray-800">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">SoulScript</h3>
                <p className="text-gray-400">
                  Making mental health support accessible to everyone through AI and human expertise.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-4">Product</h4>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white">
                      Features
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white">
                      Pricing
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white">
                      Testimonials
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white">
                      FAQ
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Company</h4>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white">
                      About
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white">
                      Blog
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white">
                      Careers
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white">
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Legal</h4>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white">
                      Terms of Service
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white">
                      Cookie Policy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white">
                      HIPAA Compliance
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500">
              <p>© {new Date().getFullYear()} SoulScript. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
